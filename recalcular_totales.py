from database import get_engine
from sqlalchemy import text

def recalcular_totales():
    engine = get_engine()
    with engine.begin() as conn:
        res = conn.execute(text("UPDATE compras SET total_c = COALESCE(cant_c, 0) * COALESCE(pu_c, 0);"))
        print(f"¡Éxito! Se han recalculado los totales (total_c) de {res.rowcount} compras en la base de datos.")

if __name__ == '__main__':
    recalcular_totales()
