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

def check_mapping():
    with engine.connect() as conn:
        res = conn.execute(text('SELECT insumo_descripcion, detalle_compra FROM compras LIMIT 20'))
        for row in res:
            print(f"[{row.insumo_descripcion}] -> {row.detalle_compra}")

if __name__ == '__main__':
    check_mapping()
