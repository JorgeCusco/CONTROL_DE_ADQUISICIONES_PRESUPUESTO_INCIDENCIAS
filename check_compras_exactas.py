from database import get_engine
from sqlalchemy import text

def check():
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("""
            SELECT insumo_descripcion, SUM(cant_c) as total_comprado
            FROM compras 
            WHERE insumo_descripcion IN ('TIERRA NEGRA', 'HERRAMIENTAS MANUALES', 'SWITCH DE ACCESO/BORDE, GIGABIT DE 24 PUERTOS POE + 4 PUERTOS SFP, ADMINISTRABLE') 
            GROUP BY insumo_descripcion
        """)).fetchall()
        for r in res:
            print(dict(r._mapping))

if __name__ == '__main__':
    check()
