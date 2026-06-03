import os
import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch
from dotenv import load_dotenv

load_dotenv('frontend/.env')

# DB Connection
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT")
)
conn.autocommit = False
cursor = conn.cursor()

def clean_num(val):
    if pd.isna(val) or val == '':
        return 0
    try:
        if isinstance(val, str):
            val = val.replace(',', '')
        return float(val)
    except:
        return 0

try:
    print("Deleting old data from partidas_p, acus, insumos_p...")
    cursor.execute("DELETE FROM partidas_p;")
    cursor.execute("DELETE FROM acus;")
    cursor.execute("DELETE FROM insumos_p;")
    
    print("Reading PARTIDAS_PRESUPUESTO_FINAL_LIMPIO.csv...")
    df_partidas = pd.read_csv('DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_PRESUPUESTO_FINAL_LIMPIO.csv', encoding='utf-8')
    # Expected columns: item, descripcion, unidad, cantidad, precio, total
    
    insert_partidas = """
        INSERT INTO partidas_p (item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    data_partidas = []
    for _, row in df_partidas.iterrows():
        data_partidas.append((
            str(row['item']).strip() if pd.notna(row['item']) else '',
            str(row['descripcion']).strip() if pd.notna(row['descripcion']) else '',
            str(row['unidad']).strip() if pd.notna(row['unidad']) else 'und',
            clean_num(row['cantidad']),
            clean_num(row['precio']),
            clean_num(row['total'])
        ))
    execute_batch(cursor, insert_partidas, data_partidas)
    print(f"Inserted {len(data_partidas)} rows into partidas_p.")

    print("Reading ACUS_P.csv...")
    df_acus = pd.read_csv('DATA_LAST/TABLAS_FINAL_BOM/ACUS_P.csv', encoding='utf-8')
    # Expected: item, nombre_partida, rendimiento, tipo, codigo, descripcion_insumo, unidad, recursos, cantidad, precio, parcial
    
    insert_acus = """
        INSERT INTO acus (
            item_partida, tipo, codigo_insumo, descripcion_insumo, unidad, 
            recursos, cantidad_p, precio_p, parcial_p
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    data_acus = []
    for _, row in df_acus.iterrows():
        data_acus.append((
            str(row['item']).strip() if pd.notna(row['item']) else '',
            str(row['tipo']).strip() if pd.notna(row['tipo']) else '',
            str(row['codigo']).strip() if pd.notna(row['codigo']) else '',
            str(row['descripcion_insumo']).strip() if pd.notna(row['descripcion_insumo']) else '',
            str(row['unidad']).strip() if pd.notna(row['unidad']) else 'und',
            clean_num(row['recursos']),
            clean_num(row['cantidad']),
            clean_num(row['precio']),
            clean_num(row['parcial'])
        ))
    execute_batch(cursor, insert_acus, data_acus)
    print(f"Inserted {len(data_acus)} rows into acus.")

    print("Generating insumos_p from acus and partidas_p...")
    insert_insumos = """
        INSERT INTO insumos_p (codigo, descripcion, unidad, cantidad_insumo_p, costo_p, total_p)
        SELECT 
            a.codigo_insumo,
            MAX(a.descripcion_insumo),
            MAX(a.unidad),
            SUM(a.cantidad_p * COALESCE(p.cantidad_p, 0)) AS cantidad_insumo_p,
            MAX(a.precio_p),
            SUM(a.parcial_p * COALESCE(p.cantidad_p, 0)) AS total_p
        FROM acus a
        LEFT JOIN partidas_p p ON a.item_partida = p.item
        GROUP BY a.codigo_insumo
    """
    cursor.execute(insert_insumos)
    cursor.execute("SELECT count(*) FROM insumos_p;")
    count_ins = cursor.fetchone()[0]
    print(f"Inserted {count_ins} unique resources into insumos_p.")

    conn.commit()
    print("SUCCESS: All data ingested and linked!")

except Exception as e:
    conn.rollback()
    print("ERROR:", e)
finally:
    cursor.close()
    conn.close()
