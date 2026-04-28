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

# Columna M es el índice 12
col_M = df_excel.columns[12]
print(f"Columna M identificada: {col_M} (indice 12)")

print("="*80)
print(f"COMPARACION POR COLUMNA M: {col_M}")
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
    SELECT id, detalle_compra
    FROM compras
    ORDER BY id
""")
registros_bd = cur.fetchall()
cur.close()
conn.close()

print(f"\nBD actual - Total REGISTROS: {len(registros_bd)}")

# Crear set de detalles en BD (normalizados)
detalles_bd = set(str(row[1]).strip() for row in registros_bd if row[1])
print(f"BD - Detalles unicos: {len(detalles_bd)}")

# ─────────────────────────────────────────────────────────
# Procesar Excel - Columna M
# ─────────────────────────────────────────────────────────
print(f"\nArchivo Excel - Total REGISTROS: {len(df_excel)}")

# Extraer detalles del Excel (cada fila)
detalles_excel_list = []
for idx, row in df_excel.iterrows():
    detalle = str(row[col_M]).strip() if pd.notna(row[col_M]) else ""
    if detalle and detalle.lower() != "nan":
        detalles_excel_list.append(detalle)

detalles_excel = set(detalles_excel_list)

print(f"Excel - Registros con detalle: {len(detalles_excel_list)}")
print(f"Excel - Detalles unicos: {len(detalles_excel)}")

# ─────────────────────────────────────────────────────────
# Comparacion
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("ANALISIS DE COINCIDENCIAS")
print("="*80)

# Contar cuantos registros del Excel tienen detalle que existe en BD
registros_excel_en_bd = 0
registros_excel_nuevos = 0

for detalle in detalles_excel_list:
    if detalle in detalles_bd:
        registros_excel_en_bd += 1
    else:
        registros_excel_nuevos += 1

print(f"\nDe los {len(detalles_excel_list)} registros en Excel:")
print(f"  - Con detalle que YA EXISTE en BD: {registros_excel_en_bd}")
print(f"  - Con detalle NUEVO (no en BD): {registros_excel_nuevos}")

# Detalles comunes vs nuevos
detalles_comunes = detalles_excel.intersection(detalles_bd)
detalles_nuevos = detalles_excel - detalles_bd

print(f"\nDetalles unicos comparacion:")
print(f"  - En comun: {len(detalles_comunes)}")
print(f"  - Nuevos: {len(detalles_nuevos)}")

print(f"\nMuestra de detalles EN COMUN:")
for det in sorted(list(detalles_comunes))[:10]:
    print(f"  - {det[:80]}")
if len(detalles_comunes) > 10:
    print(f"  ... y {len(detalles_comunes) - 10} mas")

print(f"\nMuestra de detalles NUEVOS:")
for det in sorted(list(detalles_nuevos))[:10]:
    print(f"  - {det[:80]}")
if len(detalles_nuevos) > 10:
    print(f"  ... y {len(detalles_nuevos) - 10} mas")

# ─────────────────────────────────────────────────────────
# Detalles en BD que NO estan en Excel
# ─────────────────────────────────────────────────────────
detalles_solo_bd = detalles_bd - detalles_excel

print(f"\n" + "="*80)
print("DETALLES SOLO EN BD (no en archivo Excel)")
print("="*80)
print(f"Total: {len(detalles_solo_bd)}")

print(f"\nMuestra:")
for det in sorted(list(detalles_solo_bd))[:15]:
    print(f"  - {det[:80]}")
if len(detalles_solo_bd) > 15:
    print(f"  ... y {len(detalles_solo_bd) - 15} mas")

# ─────────────────────────────────────────────────────────
# Resumen FINAL
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("RESUMEN FINAL")
print("="*80)

print(f"\nBD actual:")
print(f"  Total registros: {len(registros_bd)}")
print(f"  Detalles unicos: {len(detalles_bd)}")

print(f"\nArchivo Excel:")
print(f"  Total registros: {len(df_excel)}")
print(f"  Detalles con valor: {len(detalles_excel_list)}")
print(f"  Detalles unicos: {len(detalles_excel)}")

print(f"\nComparacion (Columna M vs detalle_compra):")
print(f"  Coincidencias (registros): {registros_excel_en_bd}")
print(f"  Nuevos (registros): {registros_excel_nuevos}")
print(f"  Detalles en comun (unicos): {len(detalles_comunes)}")
print(f"  Detalles nuevos (unicos): {len(detalles_nuevos)}")
print(f"  Detalles solo en BD: {len(detalles_solo_bd)}")

print(f"\nRecomendacion:")
if registros_excel_en_bd > 0.8 * len(registros_bd):
    print(f"  OPCION 1: Importar solo los {registros_excel_nuevos} nuevos")
    print(f"    (Mantener {len(registros_bd)} actuales + agregar {registros_excel_nuevos} nuevos)")
else:
    print(f"  OPCION 2: Reemplazar todo")
    print(f"    (Eliminar {len(registros_bd)} actuales + importar {len(df_excel)} nuevos)")
