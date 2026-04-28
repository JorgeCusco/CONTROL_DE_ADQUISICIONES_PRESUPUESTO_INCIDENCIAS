from database import get_engine
from sqlalchemy import text

def clean_duplicates():
    engine = get_engine()
    with engine.begin() as conn:
        # Eliminar duplicados exactos manteniendo el ID más alto
        query = text("""
            DELETE FROM compras 
            WHERE id NOT IN (
                SELECT MAX(id) 
                FROM compras 
                GROUP BY insumo_descripcion, total_c, orden_doc, cant_c, pu_c
            )
        """)
        result = conn.execute(query)
        print(f"DONE: Se han eliminado {result.rowcount} registros duplicados de compras.")

if __name__ == '__main__':
    clean_duplicates()
