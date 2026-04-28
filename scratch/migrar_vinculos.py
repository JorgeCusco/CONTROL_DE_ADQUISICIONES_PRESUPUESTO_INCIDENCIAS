"""
Migra los vínculos existentes (por nombre exacto) desde la tabla compras
a la tabla mapeo_vinculacion para que el Vinculador los muestre correctamente.
"""
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

def migrar_vinculos():
    with engine.begin() as conn:
        # Verificar cuántos ya existen en mapeo_vinculacion
        total_antes = conn.execute(text("SELECT count(*) FROM mapeo_vinculacion")).scalar()
        print(f"Registros en mapeo_vinculacion ANTES: {total_antes}")

        # Asegurarse de que el constraint existe
        try:
            conn.execute(text("""
                ALTER TABLE mapeo_vinculacion 
                ADD CONSTRAINT uq_mapeo_insumo_compra UNIQUE (insumo_nombre, compra_id)
            """))
            print("Constraint creado.")
        except Exception:
            print("Constraint ya existe, continuando...")

        # Insertar los vínculos automáticos (nombre exacto) ignorando duplicados
        result = conn.execute(text("""
            INSERT INTO mapeo_vinculacion (insumo_nombre, compra_id, usuario)
            SELECT c.insumo_descripcion, c.id, 'migracion_automatica'
            FROM compras c
            WHERE c.insumo_descripcion IN (SELECT descripcion FROM insumos)
            ON CONFLICT (insumo_nombre, compra_id) DO NOTHING
        """))
        
        total_despues = conn.execute(text("SELECT count(*) FROM mapeo_vinculacion")).scalar()
        print(f"Registros en mapeo_vinculacion DESPUES: {total_despues}")
        print(f"Vinculos migrados: {total_despues - total_antes}")

if __name__ == '__main__':
    migrar_vinculos()
