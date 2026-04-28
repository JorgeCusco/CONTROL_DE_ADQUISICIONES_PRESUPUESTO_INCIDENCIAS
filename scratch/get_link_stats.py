import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

def get_stats():
    with engine.connect() as conn:
        total_compras = conn.execute(text("SELECT count(*) FROM compras")).scalar()
        linked_compras = conn.execute(text("SELECT count(*) FROM compras WHERE insumo_descripcion IN (SELECT descripcion FROM insumos)")).scalar()
        distinct_names_compras = conn.execute(text("SELECT count(DISTINCT insumo_descripcion) FROM compras")).scalar()
        distinct_names_insumos = conn.execute(text("SELECT count(DISTINCT descripcion) FROM insumos")).scalar()
        
        print(f"Total Compras: {total_compras}")
        print(f"Compras con vínculo EXACTO: {linked_compras}")
        print(f"Nombres distintos en Compras: {distinct_names_compras}")
        print(f"Nombres distintos en Insumos: {distinct_names_insumos}")
        
        print("\nEjemplos de nombres en compras que NO están en insumos:")
        orphans = conn.execute(text("""
            SELECT DISTINCT insumo_descripcion 
            FROM compras 
            WHERE insumo_descripcion NOT IN (SELECT descripcion FROM insumos)
            LIMIT 10
        """))
        for row in orphans:
            print(f"- [{row[0]}]")

if __name__ == '__main__':
    get_stats()
