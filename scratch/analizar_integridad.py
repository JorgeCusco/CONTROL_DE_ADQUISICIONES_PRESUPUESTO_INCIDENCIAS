import os
import pandas as pd
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

def run_analysis():
    print("--- Analisis de Integridad de Datos: Partidas vs Compras ---")
    
    with engine.connect() as conn:
        # 1. Partidas sin ninguna compra vinculada (via insumos)
        query_p_sin_c = text("""
            SELECT p.codigo, p.descripcion 
            FROM partidas p
            WHERE NOT EXISTS (
                SELECT 1 
                FROM insumos i
                JOIN compras c ON i.descripcion = c.insumo_descripcion
                WHERE i.codigo_partida = p.codigo
            )
            ORDER BY p.codigo;
        """)
        df_p_sin_c = pd.read_sql(query_p_sin_c, conn)
        
        # 2. Compras que no coinciden con ningun insumo del presupuesto
        query_c_sin_i = text("""
            SELECT DISTINCT c.insumo_descripcion
            FROM compras c
            WHERE NOT EXISTS (
                SELECT 1 
                FROM insumos i
                WHERE i.descripcion = c.insumo_descripcion
            )
            ORDER BY c.insumo_descripcion;
        """)
        df_c_sin_i = pd.read_sql(query_c_sin_i, conn)
        
        # 3. Estadisticas generales
        total_partidas = conn.execute(text("SELECT COUNT(*) FROM partidas")).scalar()
        total_compras = conn.execute(text("SELECT COUNT(*) FROM compras")).scalar()
        total_insumos = conn.execute(text("SELECT COUNT(DISTINCT descripcion) FROM insumos")).scalar()
        
        print(f"\nResumen:")
        print(f"- Total Partidas: {total_partidas}")
        print(f"- Total Insumos (Presupuesto): {total_insumos}")
        print(f"- Total Compras registradas: {total_compras}")
        
        print(f"\nResultados del Analisis:")
        
        if df_p_sin_c.empty:
            print("[OK] Todas las partidas tienen al menos un insumo con compras vinculadas.")
        else:
            print(f"[X] Se encontraron {len(df_p_sin_c)} partidas SIN compras vinculadas.")
            print("Ejemplos (Top 5):")
            print(df_p_sin_c.head(5).to_string(index=False))
            
        if df_c_sin_i.empty:
            print("\n[OK] Todas las compras estan vinculadas a un insumo del presupuesto.")
        else:
            print(f"\n[X] Se encontraron {len(df_c_sin_i)} descripciones de compras que NO existen en el presupuesto (Huerfanas).")
            print("Ejemplos (Top 5):")
            print(df_c_sin_i.head(5).to_string(index=False))

if __name__ == '__main__':
    run_analysis()
