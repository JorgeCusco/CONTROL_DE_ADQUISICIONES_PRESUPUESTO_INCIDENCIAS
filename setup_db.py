import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "7_insumos_rado")

def setup_database():
    try:
        # 1. Conectarse a postgres para crear la base de datos si no existe
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Verificar si la base de datos existe
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creando base de datos {DB_NAME}...")
            cur.execute(f"CREATE DATABASE {DB_NAME}")
        else:
            print(f"La base de datos {DB_NAME} ya existe.")
            
        cur.close()
        conn.close()
        
        # 2. Conectarse a la nueva base de datos y aplicar el esquema
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        cur = conn.cursor()
        
        print("Aplicando esquema inicial...")
        with open("esquema_inicial.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()
            cur.execute(schema_sql)
        
        conn.commit()
        cur.close()
        conn.close()
        print("Base de datos inicializada correctamente.")
        
    except Exception as e:
        print(f"Error al configurar la base de datos: {e}")

if __name__ == "__main__":
    setup_database()
