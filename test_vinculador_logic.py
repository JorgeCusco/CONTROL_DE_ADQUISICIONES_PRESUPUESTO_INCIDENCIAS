import asyncio
from database import get_engine
from sqlalchemy import text

async def test_api_logic():
    engine = get_engine()
    with engine.connect() as conn:
        # Simulamos la consulta exacta del Vinculador
        query = text("""
            SELECT
              i.descripcion                                  AS nombre,
              COUNT(DISTINCT mv.compra_id)                   AS linked_count,
              MAX(i.es_extra::int)                           AS es_extra
            FROM insumos i
            LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
            GROUP BY i.descripcion
            ORDER BY i.descripcion
        """)
        
        result = conn.execute(query).fetchall()
        
        print(f"RESULTADO DE LA CONSULTA:")
        print(f"Total de filas devueltas: {len(result)}")
        
        # Ver si hay extras
        extras = [r for r in result if r[2] == 1]
        print(f"Insumos marcados como EXTRA encontrados: {len(extras)}")
        
        if len(extras) > 0:
            print(f"Ejemplo de Extra: {extras[0][0]}")
        
        # Ver si están las compras de Caja Chica disponibles
        compras_caja = conn.execute(text("SELECT COUNT(*) FROM compras WHERE orden_doc = 'CJA.CHI'")).scalar()
        print(f"Compras de Caja Chica en BD: {compras_caja}")

if __name__ == '__main__':
    asyncio.run(test_api_logic())
