from database import get_engine
from sqlalchemy import text

def search_insumo(term):
    engine = get_engine()
    with engine.connect() as conn:
        query = text("""
            SELECT orden_doc, detalle_compra, cant_c, pu_c, total_c 
            FROM compras 
            WHERE insumo_descripcion ILIKE :term 
               OR detalle_compra ILIKE :term
        """)
        results = conn.execute(query, {"term": f"%{term}%"}).fetchall()
        
        if not results:
            print(f"No se encontraron compras con el término: {term}")
        else:
            print(f"SE ENCONTRARON {len(results)} REGISTROS:")
            for r in results:
                print(f"DOC: {r[0]} | DETALLE: {r[1]} | CANT: {r[2]} | P.U: {r[3]} | TOTAL: {r[4]}")

if __name__ == '__main__':
    search_insumo("CINTA")
    search_insumo("SEGURIDAD")
    search_insumo("AMARILLA")
