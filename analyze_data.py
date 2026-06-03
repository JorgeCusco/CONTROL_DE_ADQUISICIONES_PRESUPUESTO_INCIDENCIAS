import psycopg2
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv('.env')
conn = psycopg2.connect(os.getenv('DATABASE_URL'))

insumos = pd.read_sql('SELECT codigo_partida FROM insumos', conn)
partidas = pd.read_sql('SELECT codigo, descripcion FROM partidas', conn)

# Partidas en insumos
partidas_en_insumos = insumos['codigo_partida'].dropna().unique()

# Partidas en la tabla partidas
partidas_en_tabla = partidas['codigo'].dropna().unique()

faltan_en_insumos = set(partidas_en_tabla) - set(partidas_en_insumos)
faltan_en_partidas = set(partidas_en_insumos) - set(partidas_en_tabla)

print(f"Total Partidas en tabla 'partidas': {len(partidas_en_tabla)}")
print(f"Total códigos de partida distintos en tabla 'insumos': {len(partidas_en_insumos)}")
print(f"Partidas que están en 'partidas' pero NO tienen registros en 'insumos' (Faltan insumos): {len(faltan_en_insumos)}")
if len(faltan_en_insumos) > 0:
    print("Ejemplos de partidas sin insumos:")
    ejemplos = list(faltan_en_insumos)[:20]
    for e in ejemplos:
        desc = partidas[partidas['codigo'] == e]['descripcion'].values[0]
        print(f"  - {e}: {desc}")

print(f"\nCódigos de partida que están en 'insumos' pero NO en 'partidas' (Código inválido/huérfano): {len(faltan_en_partidas)}")
if len(faltan_en_partidas) > 0:
    print("Ejemplos:", list(faltan_en_partidas)[:10])

conn.close()
