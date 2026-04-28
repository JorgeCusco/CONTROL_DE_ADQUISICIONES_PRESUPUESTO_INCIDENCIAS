import asyncio
import os
from database import get_engine
from sqlalchemy import text

async def inspect_db():
    engine = get_engine()
    with engine.connect() as conn:
        # Check tables
        tables_res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [row[0] for row in tables_res]
        print(f"Tablas en la BD: {tables}")
        
        for table in tables:
            print(f"\n--- Estructura de {table} ---")
            cols_res = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'"))
            for col in cols_res:
                print(f"Columna: {col[0]} ({col[1]})")
                
        # Check unique constraints on mapeo_vinculacion
        if 'mapeo_vinculacion' in tables:
            print("\n--- Constraints en mapeo_vinculacion ---")
            cons_res = conn.execute(text("""
                SELECT conname, pg_get_constraintdef(c.oid) 
                FROM pg_constraint c 
                JOIN pg_namespace n ON n.oid = c.connamespace 
                WHERE n.nspname = 'public' AND conrelid = 'mapeo_vinculacion'::regclass
            """))
            for con in cons_res:
                print(f"Constraint: {con[0]} -> {con[1]}")

if __name__ == '__main__':
    asyncio.run(inspect_db())
