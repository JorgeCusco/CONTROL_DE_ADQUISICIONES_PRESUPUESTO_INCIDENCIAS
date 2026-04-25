import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

csv_path = r"e:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\APUS_Extraidos_v2.csv"

def ingest_apus():
    print(f"Connecting to database {DB_NAME} at {DB_HOST}...")
    engine = create_engine(DATABASE_URL)
    
    print(f"Reading CSV {csv_path}...")
    df = pd.read_csv(csv_path)
    
    table_name = "apus_detallado"
    print(f"Uploading data to table '{table_name}'...")
    
    # We replace the table if it exists to ensure clean data
    df.to_sql(table_name, engine, if_exists='replace', index=False)
    
    # Optional: add primary key and indexes for performance
    from sqlalchemy import text
    with engine.connect() as con:
        con.execute(text(f'ALTER TABLE {table_name} ADD COLUMN id SERIAL PRIMARY KEY;'))
        con.execute(text(f'CREATE INDEX idx_apus_partida ON {table_name} ("Partida_Codigo");'))
        con.execute(text(f'CREATE INDEX idx_apus_insumo ON {table_name} ("Insumo_Codigo");'))
        con.commit()
    
    print("Upload completed successfully!")

if __name__ == "__main__":
    ingest_apus()
