from database import get_engine
from sqlalchemy import text

def resetear_cantidades():
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("UPDATE compras SET cant_c = 0;"))
        conn.commit()
        print(f"¡Se han puesto a 0 un total de {res.rowcount} registros en la columna cant_c!")

if __name__ == '__main__':
    resetear_cantidades()
