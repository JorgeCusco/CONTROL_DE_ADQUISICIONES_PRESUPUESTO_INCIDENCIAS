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

def add_comentario_column():
    with engine.begin() as conn:
        print("Agregando columna 'comentario' a la tabla 'insumos'...")
        conn.execute(text("ALTER TABLE insumos ADD COLUMN IF NOT EXISTS comentario TEXT;"))
    print("Columna agregada exitosamente.")

if __name__ == '__main__':
    add_comentario_column()
