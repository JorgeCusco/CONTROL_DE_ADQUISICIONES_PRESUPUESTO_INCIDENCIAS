import psycopg2
import pandas as pd

def run():
    conn = psycopg2.connect(
        host='aws-1-us-east-1.pooler.supabase.com',
        database='postgres',
        user='postgres.lwuhsendnfwxenoryuzs',
        password='Jo.9839514500',
        port=6543
    )
    
    query = """
        SELECT 
            m.codigo_insumo, 
            m.compra_id,
            COUNT(*) as apariciones_exactas
        FROM mapeo_vinculacion m
        GROUP BY m.codigo_insumo, m.compra_id
        HAVING COUNT(*) > 1
    """
    df_exact_dupes = pd.read_sql(query, conn)
    
    query_compra_multi_insumo = """
        SELECT 
            m.compra_id,
            COUNT(DISTINCT m.codigo_insumo) as cant_insumos_distintos
        FROM mapeo_vinculacion m
        GROUP BY m.compra_id
        HAVING COUNT(DISTINCT m.codigo_insumo) > 1
    """
    df_compra_multi = pd.read_sql(query_compra_multi_insumo, conn)
    
    query_insumo_multi_compra = """
        SELECT 
            m.codigo_insumo,
            COUNT(DISTINCT m.compra_id) as cant_compras
        FROM mapeo_vinculacion m
        GROUP BY m.codigo_insumo
        HAVING COUNT(DISTINCT m.compra_id) > 1
    """
    df_insumo_multi = pd.read_sql(query_insumo_multi_compra, conn)

    print("=== REPORTE DE VINCULACIONES ===")
    print(f"1. Vinculos EXACTAMENTE duplicados (Mismo Insumo + Misma Compra): {len(df_exact_dupes)}")
    if len(df_exact_dupes) > 0:
        print(df_exact_dupes.head())
        
    print(f"\n2. Compras asignadas a MÚLTIPLES Insumos distintos: {len(df_compra_multi)}")
    if len(df_compra_multi) > 0:
        print("Ejemplos de compras que están asignadas a más de 1 insumo:")
        print(df_compra_multi.head())
        
    print(f"\n3. Insumos que tienen MÚLTIPLES compras asignadas: {len(df_insumo_multi)}")
    if len(df_insumo_multi) > 0:
        print("Ejemplos de Insumos con varias compras:")
        print(df_insumo_multi.head())

    conn.close()

if __name__ == '__main__':
    run()
