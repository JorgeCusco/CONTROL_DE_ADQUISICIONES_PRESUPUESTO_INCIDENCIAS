import asyncio
from database import get_engine
from sqlalchemy import text

async def diagnostic():
    engine = get_engine()
    with engine.connect() as conn:
        # Contar insumos
        insumos_count = conn.execute(text("SELECT COUNT(*) FROM insumos")).scalar()
        # Contar compras
        compras_count = conn.execute(text("SELECT COUNT(*) FROM compras")).scalar()
        # Ver los últimos 5 registros de compras (para ver si está la Caja Chica)
        last_compras = conn.execute(text("SELECT id, insumo_descripcion, orden_doc FROM compras ORDER BY id DESC LIMIT 5")).fetchall()
        
        print(f"DIAGNÓSTICO:")
        print(f"Total Insumos (Presupuesto): {insumos_count}")
        print(f"Total Compras (Adquisiciones): {compras_count}")
        print(f"Últimas Compras:")
        for c in last_compras:
            print(f" - ID: {c[0]}, Desc: {c[1]}, Doc: {c[2]}")

if __name__ == '__main__':
    asyncio.run(diagnostic())
