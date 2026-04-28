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
print("COMPARACION SOLO POR DESCRIPCION")
print("="*80)

# ─────────────────────────────────────────────────────────
# Conectar a BD
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
    SELECT DISTINCT insumo_descripcion
    FROM compras
    ORDER BY insumo_descripcion
""")
desc_bd = set(str(row[0]).strip() for row in cur.fetchall() if row[0])
cur.close()
conn.close()

print(f"\nBD actual - Descripciones UNICAS: {len(desc_bd)}")

# ─────────────────────────────────────────────────────────
# Extraer descripciones del Excel
# ─────────────────────────────────────────────────────────
desc_excel = set(str(x).strip() for x in df_excel[col_desc].dropna().unique())
print(f"Excel - Descripciones UNICAS: {len(desc_excel)}")

# ─────────────────────────────────────────────────────────
# Comparar
# ─────────────────────────────────────────────────────────
desc_comunes = desc_excel.intersection(desc_bd)
desc_nuevas = desc_excel - desc_bd
desc_solo_bd = desc_bd - desc_excel

print(f"\n" + "="*80)
print("RESULTADOS")
print("="*80)
print(f"\nDescrpciones en COMUN (Excel + BD): {len(desc_comunes)}")
if desc_comunes:
    for desc in sorted(list(desc_comunes))[:15]:
        print(f"  - {desc}")
    if len(desc_comunes) > 15:
        print(f"  ... y {len(desc_comunes) - 15} mas")

print(f"\nDescrpciones NUEVAS (solo Excel): {len(desc_nuevas)}")
if desc_nuevas:
    for desc in sorted(list(desc_nuevas))[:15]:
        print(f"  - {desc}")
    if len(desc_nuevas) > 15:
        print(f"  ... y {len(desc_nuevas) - 15} mas")

print(f"\nDescrpciones SOLO en BD (no en Excel): {len(desc_solo_bd)}")

# ─────────────────────────────────────────────────────────
# Duplicados INTERNOS en el archivo Excel
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("DUPLICADOS INTERNOS EN EXCEL (por Descripción)")
print("="*80)

duplicados_internos = df_excel[df_excel.duplicated(subset=[col_desc], keep=False)]
print(f"\nRegistros duplicados por Descripción: {len(duplicados_internos)}")

duplicados_desc = duplicados_internos.groupby(col_desc).size().reset_index(name='cantidad')
duplicados_desc = duplicados_desc.sort_values('cantidad', ascending=False)

print(f"Descripciones que se repiten: {len(duplicados_desc)}")
print("\nDistribucion de duplicados:")
for idx, row in duplicados_desc.head(20).iterrows():
    print(f"  [{row['cantidad']:3d}x] {row[col_desc]}")

if len(duplicados_desc) > 20:
    print(f"  ... y {len(duplicados_desc) - 20} mas")

# ─────────────────────────────────────────────────────────
# RESUMEN FINAL
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("RESUMEN")
print("="*80)

registros_unicos_excel = len(df_excel.drop_duplicates(subset=[col_desc]))
registros_duplicados_excel = len(df_excel) - registros_unicos_excel

print(f"\nArchivo Excel:")
print(f"  Total registros: {len(df_excel)}")
print(f"  Descripciones unicas: {len(desc_excel)}")
print(f"  Registros duplicados internamente: {registros_duplicados_excel}")
print(f"  → Si consolidas duplicados: {len(df_excel) - registros_duplicados_excel} registros")

print(f"\nComparacion Excel vs BD:")
print(f"  Descripciones en comun: {len(desc_comunes)} ({round(100*len(desc_comunes)/len(desc_excel), 1)}%)")
print(f"  Descripciones nuevas: {len(desc_nuevas)} ({round(100*len(desc_nuevas)/len(desc_excel), 1)}%)")

print(f"\nBD Actual:")
print(f"  Descripciones unicas: {len(desc_bd)}")

print(f"\nFINAL:")
print(f"  Si importas {len(desc_nuevas)} descripciones nuevas:")
print(f"    BD pasaria de {len(desc_bd)} a {len(desc_bd) + len(desc_nuevas)} descripciones unicas")
print(f"\n  Si importas TODO y consolidas duplicados internos:")
print(f"    BD pasaria de {len(desc_bd)} a {len(desc_bd) + len(desc_nuevas)} descripciones unicas")
print(f"    Total de {len(df_excel) - registros_duplicados_excel} registros (consolidando los {registros_duplicados_excel} duplicados)")
