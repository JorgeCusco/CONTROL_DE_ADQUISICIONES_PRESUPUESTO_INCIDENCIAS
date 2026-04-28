from database import get_engine
from sqlalchemy import text

def check_abrazadera():
    engine = get_engine()
    with engine.connect() as conn:
        query = text("""
            SELECT id, orden_doc, detalle_compra, cant_c, total_c, insumo_descripcion 
            FROM compras 
            WHERE detalle_compra ILIKE '%ABRAZADERA DE DOS OREJAS PARA TUBO CONDUIT DE 20MM%'
               OR insumo_descripcion ILIKE '%ABRAZADERA DE DOS OREJAS PARA TUBO CONDUIT DE 20MM%'
        """)
        res = conn.execute(query).fetchall()
        for r in res:
            print(dict(r._mapping))

if __name__ == '__main__':
    check_abrazadera()
