import pandas as pd
from database import get_engine
from sqlalchemy import text
import sys

def ingest_excel(file_path):
    print(f"Leyendo archivo: {file_path}")
    try:
        df = pd.read_excel(file_path, sheet_name='Final')
    except Exception as e:
        print(f"Error leyendo excel: {e}")
        sys.exit(1)
        
    # Limpiar columnas
    df.columns = df.columns.str.strip().str.upper()
    
    # Rellenar valores vacíos hacia abajo para ITEM, DESCRIPCION, METRADOS
    # Asumiendo que el formato tiene celdas combinadas o vacías debajo de la cabecera de partida
    df['ITEM'] = df['ITEM'].ffill()
    df['DESCRIPCION'] = df['DESCRIPCION'].ffill()
    df['METRADOS'] = df['METRADOS'].ffill()
    
    # Filtrar solo filas que tengan INSUMO válido (ignorando cabeceras de agrupación si las hay)
    df = df.dropna(subset=['CODIGO', 'DESCRIPCION DEL INSUMO'])
    
    engine = get_engine()
    
    with engine.begin() as conn:
        # 1. Insertar Partidas
        print("Procesando Partidas...")
        partidas_unicas = df[['ITEM', 'DESCRIPCION', 'METRADOS']].drop_duplicates(subset=['ITEM'])
        
        for _, row in partidas_unicas.iterrows():
            codigo = str(row['ITEM']).strip()
            desc = str(row['DESCRIPCION']).strip()
            try:
                metrado = float(row['METRADOS'])
            except:
                metrado = 0.0
                
            # Insertar partida. Si ya existe, ignorar (ON CONFLICT no soportado en todos lados igual, usaremos un try/except o un ON CONFLICT DO NOTHING para Postgres)
            query_partida = text("""
                INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo)
                VALUES (:cod, :desc, 'und', :met)
                ON CONFLICT (codigo) DO UPDATE SET 
                    descripcion = EXCLUDED.descripcion,
                    metrado_fijo = EXCLUDED.metrado_fijo
            """)
            conn.execute(query_partida, {"cod": codigo, "desc": desc, "met": metrado})
            
        # 2. Insertar Insumos
        print("Procesando Insumos...")
        # Borramos insumos anteriores para no duplicar si se corre varias veces (opcional)
        # conn.execute(text("TRUNCATE TABLE insumos CASCADE;")) # Descomentar si se quiere limpiar todo
        
        for _, row in df.iterrows():
            codigo_partida = str(row['ITEM']).strip()
            item_1 = codigo_partida
            codigo_insumo = str(row['CODIGO']).strip()
            desc_insumo = str(row['DESCRIPCION DEL INSUMO']).strip()
            unidad = str(row['UNIDAD']).strip()
            if pd.isna(unidad) or unidad == 'nan':
                unidad = 'und'
                
            try:
                incidencia = float(row['CANTIDAD'])
            except:
                incidencia = 0.0
                
            try:
                metrado = float(row['METRADOS'])
            except:
                metrado = 0.0
                
            parcial_original = incidencia * metrado
            
            # Asumimos APU 2 = APU 1 al inicio
            query_insumo = text("""
                INSERT INTO insumos (
                    codigo_partida, item_1, codigo_insumo, descripcion, unidad,
                    incidencia_original, parcial_original,
                    incidencia, cantidad_modificada, cantidad_adquirida
                ) VALUES (
                    :cod_partida, :item_1, :cod_insumo, :desc, :und,
                    :inc_orig, :parc_orig,
                    :inc, :cant_mod, 0.0
                )
            """)
            conn.execute(query_insumo, {
                "cod_partida": codigo_partida,
                "item_1": item_1,
                "cod_insumo": codigo_insumo,
                "desc": desc_insumo,
                "und": unidad,
                "inc_orig": incidencia,
                "parc_orig": parcial_original,
                "inc": incidencia,          # Inicializar APU 2 igual al APU 1
                "cant_mod": parcial_original # Inicializar APU 2 igual al APU 1
            })
            
    print("✅ Carga masiva desde Excel completada exitosamente.")

if __name__ == '__main__':
    ingest_excel('ACU_Acumulado_Evaluacion.xlsx')
