import pandas as pd
from database import get_engine
from sqlalchemy import text

def ingest_apus_v2():
    print("Iniciando ingesta limpia de APUS_Extraidos_v2.csv...")
    
    # Lectura robusta del CSV
    try:
        df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', encoding='utf-8')
        if len(df.columns) < 2: 
            df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', sep=';', encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', sep=';', encoding='latin-1')

    # Limpieza de datos: Asegurar que los números se lean como números reales y no texto
    num_cols = ['Partida_Costo_Unitario', 'Insumo_Recursos', 'Insumo_Cantidad', 'Insumo_Precio', 'Insumo_Parcial']
    for c in num_cols:
        df[c] = pd.to_numeric(df[c].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
    
    df['Insumo_Codigo'] = pd.to_numeric(df['Insumo_Codigo'], errors='coerce').fillna(0).astype('int64')

    engine = get_engine()
    
    with engine.begin() as conn:
        print("Purgando la tabla 'apus_detallado' (preparando para V2)...")
        conn.execute(text("DELETE FROM apus_detallado"))
        
    print(f"Insertando {len(df)} registros nuevos en la Base de Datos...")
    df.to_sql('apus_detallado', engine, if_exists='append', index=False)
    print("✅ ¡Ingesta completada al 100%!")

if __name__ == '__main__':
    ingest_apus_v2()
