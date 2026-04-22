from database import get_engine
from sqlalchemy import text

def reset():
    engine = get_engine()
    with engine.begin() as conn:
        conn.execute(text("DROP TABLE IF EXISTS insumos CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS partidas CASCADE;"))
    
    # Read schema
    with open("esquema_inicial.sql", "r", encoding="utf-8") as f:
        schema = f.read()
    
    with engine.begin() as conn:
        conn.execute(text(schema))
    
    print("Base de datos recreada con el nuevo esquema APU 1 / APU 2")

if __name__ == "__main__":
    reset()
