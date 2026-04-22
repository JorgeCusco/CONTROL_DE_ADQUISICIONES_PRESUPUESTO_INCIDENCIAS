import pandas as pd
from database import get_engine
from sqlalchemy import text

def ingestar_datos():
    file_path = r'd:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\PROGRAMA.xlsx'
    print("Leyendo Excel...")
    
    # Leer la hoja ACU_Compara, la fila de nombres de columna es la 1 (índice 1 = segunda fila)
    df = pd.read_excel(file_path, sheet_name='ACU_Compara', header=1)
    
    # Renombrar columnas clave usando sus índices para evitar problemas de codificación ()
    cols = df.columns.tolist()
    df.rename(columns={
        cols[0]: 'Item',          # Item
        cols[1]: 'Partida',       # Partida
        cols[3]: 'Descripcion',   # Descripcin
        cols[4]: 'Unidad',        # Unid.
        cols[6]: 'Cantidad',      # Cantidad
        cols[9]: 'Metrado',       # Metrado
        cols[13]: 'Adquirido'     # adquirido
    }, inplace=True)
    
    # Limpiar Data
    df = df.dropna(subset=['Item', 'Partida']) # Eliminar filas sin Item/Partida
    df['Adquirido'] = df['Adquirido'].fillna(0)
    df['Cantidad'] = df['Cantidad'].fillna(0)
    df['Metrado'] = df['Metrado'].fillna(0)
    
    engine = get_engine()
    
    with engine.begin() as conn:
        print("Limpiando tablas existentes...")
        conn.execute(text("TRUNCATE TABLE insumos, partidas CASCADE;"))
        
        print("Procesando Partidas...")
        # Extraer partidas únicas
        partidas_df = df[['Item', 'Partida', 'Metrado']].drop_duplicates(subset=['Item'])
        
        for _, row in partidas_df.iterrows():
            insert_partida = text("""
                INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo)
                VALUES (:codigo, :descripcion, :unidad, :metrado_fijo)
            """)
            conn.execute(insert_partida, {
                "codigo": str(row['Item']).strip(),
                "descripcion": str(row['Partida']).strip(),
                "unidad": "GLB", # No hay unidad de partida en este excel
                "metrado_fijo": float(row['Metrado'])
            })
            
        print("Procesando Insumos...")
        # Extraer insumos
        for _, row in df.iterrows():
            insert_insumo = text("""
                INSERT INTO insumos (codigo_partida, descripcion, unidad, incidencia, cantidad_adquirida, cantidad_modificada)
                VALUES (:codigo_partida, :descripcion, :unidad, :incidencia, :cantidad_adquirida, :cantidad_modificada)
            """)
            conn.execute(insert_insumo, {
                "codigo_partida": str(row['Item']).strip(),
                "descripcion": str(row['Descripcion']).strip(),
                "unidad": str(row['Unidad']).strip(),
                "incidencia": float(row['Cantidad']),
                "cantidad_adquirida": float(row['Adquirido']),
                "cantidad_modificada": 0.0 # Inicializamos en 0
            })
            
    print("Ingesta de datos completada con éxito.")

if __name__ == "__main__":
    ingestar_datos()
