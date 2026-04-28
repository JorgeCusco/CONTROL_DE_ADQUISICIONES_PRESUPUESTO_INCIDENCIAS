import pandas as pd
from database import get_engine
from sqlalchemy import text

def analyze_apu_file():
    print("=== ESTRUCTURA DEL CSV ===")
    try:
        df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', encoding='utf-8')
        if len(df.columns) < 2: 
            df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', sep=';', encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos_v2.csv', sep=';', encoding='latin-1')
        
    print("Columnas encontradas:", df.columns.tolist())
    print("Muestra (Fila 1):", df.head(1).to_dict('records'))
        
    print("\n=== ESTRUCTURA DE LA TABLA 'apus_detallado' ===")
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'apus_detallado' ORDER BY ordinal_position"))
        columns = res.fetchall()
        if columns:
            for r in columns:
                print(f"- {r[0]} ({r[1]})")
        else:
            print("¡La tabla 'apus_detallado' no existe en la BD actual!")

if __name__ == '__main__':
    analyze_apu_file()
