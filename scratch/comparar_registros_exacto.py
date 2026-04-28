#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

# ─────────────────────────────────────────────────────────
# Leer archivo Excel
# ─────────────────────────────────────────────────────────
excel_file = r'e:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\INSUMOS_COMPRADOS 26.xlsx'
df_excel = pd.read_excel(excel_file, sheet_name=0)

col_desc = 'DESCRIPCIÓN'

print("="*80)
print("COMPARACION CORRECTA: REGISTROS vs DESCRIPCIONES")
print("="*80)

# ─────────────────────────────────────────────────────────
# Conectar a BD y extraer TODOS los registros
# ─────────────────────────────────────────────────────────
conn = psycopg2.connect(
    host='localhost',
    database='7_insumos_rado',
    user='postgres',
    password='Jo.9839514500',
    port=5432
)
cur = conn.cursor()

cur.execute("""
    SELECT id, insumo_descripcion
    FROM compras
    ORDER BY id
""")
registros_bd = cur.fetchall()
cur.close()
conn.close()

print(f"\nBD actual - Total REGISTROS: {len(registros_bd)}")

# Extraer descripciones de la BD (cada registro)
desc_bd_registros = set(str(row[1]).strip() for row in registros_bd if row[1])
print(f"BD - Descripciones unicas: {len(desc_bd_registros)}")

# ─────────────────────────────────────────────────────────
# Procesar Excel
# ─────────────────────────────────────────────────────────
print(f"\nArchivo Excel - Total REGISTROS: {len(df_excel)}")

# Extraer descripciones del Excel (cada fila/registro)
desc_excel_registros = []
for idx, row in df_excel.iterrows():
    desc = str(row[col_desc]).strip()
    if pd.notna(row[col_desc]):
        desc_excel_registros.append(desc)

print(f"Excel - Registros con descripcion: {len(desc_excel_registros)}")

# ─────────────────────────────────────────────────────────
# Comparacion por DESCRIPCION
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("ANALISIS DE REGISTROS")
print("="*80)

# Contar cuantos registros del Excel tienen descripcion que existe en BD
registros_excel_con_desc_en_bd = 0
registros_excel_sin_desc_en_bd = 0

for desc in desc_excel_registros:
    if desc in desc_bd_registros:
        registros_excel_con_desc_en_bd += 1
    else:
        registros_excel_sin_desc_en_bd += 1

print(f"\nDe los {len(desc_excel_registros)} registros en Excel:")
print(f"  - Con descripcion que YA EXISTE en BD: {registros_excel_con_desc_en_bd}")
print(f"  - Con descripcion NUEVA (no en BD): {registros_excel_sin_desc_en_bd}")

print(f"\n" + "="*80)
print("CONCLUSIÓN")
print("="*80)

print(f"\nBD actual tiene {len(registros_bd)} registros")
print(f"Archivo Excel tiene {len(df_excel)} registros")
print(f"\nCoinciencias (registros Excel cuya descripción YA existe en BD): {registros_excel_con_desc_en_bd}")
print(f"Nuevos (registros Excel cuya descripción NO existe en BD): {registros_excel_sin_desc_en_bd}")

print(f"\nSi importas TODO el archivo:")
print(f"  - Mantendrías los {registros_excel_con_desc_en_bd} registros duplicados")
print(f"  - Agregarías {registros_excel_sin_desc_en_bd} nuevos")
print(f"  - Total: {len(registros_bd)} + {registros_excel_sin_desc_en_bd} = {len(registros_bd) + registros_excel_sin_desc_en_bd}")

print(f"\nSi importas SOLO los nuevos:")
print(f"  - Mantendrías los {len(registros_bd)} actuales")
print(f"  - Agregarías {registros_excel_sin_desc_en_bd} nuevos")
print(f"  - Total: {len(registros_bd) + registros_excel_sin_desc_en_bd}")
