import pandas as pd
from database import get_engine
from sqlalchemy import text

def reingest_apus_corrected():
    print("Iniciando inyección purificada...")
    
    # El encoding 'utf-8-sig' remueve el BOM invisible de la primera columna
    df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', encoding='utf-8-sig')
    
    # Limpiamos las columnas para asegurarnos que no haya espacios fantasma
    df.columns = df.columns.str.strip()
    
    num_cols = ['Partida_Costo_Unitario', 'Insumo_Recursos', 'Insumo_Cantidad', 'Insumo_Precio', 'Insumo_Parcial']
    for c in num_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    
    if 'Insumo_Codigo' in df.columns:
        df['Insumo_Codigo'] = pd.to_numeric(df['Insumo_Codigo'], errors='coerce').fillna(0).astype('int64')

    engine = get_engine()
    
    with engine.begin() as conn:
        print("Eliminando registros defectuosos...")
        conn.execute(text("DELETE FROM apus_detallado"))
        
        # Eliminar posible columna basura que pandas pudo haber creado
        try:
            conn.execute(text("ALTER TABLE apus_detallado DROP COLUMN IF EXISTS \"\ufeffPartida_Codigo\""))
        except:
            pass
            
    print("Cabeceras detectadas (Limpio):", df.columns.tolist())
    print(f"Inyectando {len(df)} registros emparejados a la perfección...")
    
    df.to_sql('apus_detallado', engine, if_exists='append', index=False)
    print("¡Ingesta exitosa y alineada con las cabeceras!")

if __name__ == '__main__':
    reingest_apus_corrected()
