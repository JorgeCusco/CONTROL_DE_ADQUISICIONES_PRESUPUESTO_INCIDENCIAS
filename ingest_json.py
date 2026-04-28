import json
import pandas as pd
from database import get_engine
from sqlalchemy import text

def ingest_apus_json():
    print("Iniciando ingesta desde APUS_Extraidos.json...")
    
    try:
        with open('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/APUS_Extraidos.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error cargando JSON: {str(e)}")
        return

    df = pd.DataFrame(data)
    print(f"Se han cargado {len(df)} registros desde el JSON.")

    engine = get_engine()
    
    with engine.begin() as conn:
        print("Vaciando tabla 'apus_detallado'...")
        conn.execute(text("DELETE FROM apus_detallado"))
        
    print("Insertando datos purificados en la base de datos...")
    # Insertamos los datos. Las columnas que no existan en el JSON se quedarán como NULL en la BD.
    df.to_sql('apus_detallado', engine, if_exists='append', index=False)
    print("✅ ¡Carga de APUs desde JSON completada con éxito!")

if __name__ == '__main__':
    ingest_apus_json()
