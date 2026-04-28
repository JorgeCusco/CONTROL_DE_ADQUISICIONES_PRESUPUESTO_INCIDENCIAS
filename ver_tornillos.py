from database import get_engine
from sqlalchemy import text

def ver_tornillos():
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, detalle_compra, cant_c FROM compras WHERE detalle_compra ILIKE '%TORNILLO WAFER 8X3/4 P.B%'")).fetchall()
        for r in res:
            print(dict(r._mapping))

if __name__ == '__main__':
    ver_tornillos()
