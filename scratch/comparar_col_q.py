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

col_Q = 'DESCRIPCIÓN'  # Columna Q (índice 16)

print("="*80)
print(f"COMPARACION POR COLUMNA Q: {col_Q}")
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
# Procesar Excel - Columna Q
# ─────────────────────────────────────────────────────────
print(f"\nArchivo Excel - Total REGISTROS: {len(df_excel)}")

# Extraer detalles del Excel (cada fila)
detalles_excel_list = []
for idx, row in df_excel.iterrows():
    detalle = str(row[col_Q]).strip() if pd.notna(row[col_Q]) else ""
    if detalle and detalle.lower() != "nan":
        detalles_excel_list.append(detalle)

detalles_excel = set(detalles_excel_list)

print(f"Excel - Registros con DESCRIPCION: {len(detalles_excel_list)}")
print(f"Excel - DESCRIPCION unicas: {len(detalles_excel)}")

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
print(f"  COINCIDENCIAS (ya existen en BD): {registros_excel_en_bd}")
print(f"  NUEVOS (no existen en BD): {registros_excel_nuevos}")

# Detalles comunes vs nuevos
detalles_comunes = detalles_excel.intersection(detalles_bd)
detalles_nuevos = detalles_excel - detalles_bd

print(f"\nDetalles unicos comparacion:")
print(f"  En comun: {len(detalles_comunes)}")
print(f"  Nuevos: {len(detalles_nuevos)}")

if len(detalles_comunes) > 0:
    print(f"\nMuestra de detalles EN COMUN:")
    for det in sorted(list(detalles_comunes))[:15]:
        print(f"  - {det[:75]}")
    if len(detalles_comunes) > 15:
        print(f"  ... y {len(detalles_comunes) - 15} mas")

if len(detalles_nuevos) > 0:
    print(f"\nMuestra de detalles NUEVOS:")
    for det in sorted(list(detalles_nuevos))[:15]:
        print(f"  - {det[:75]}")
    if len(detalles_nuevos) > 15:
        print(f"  ... y {len(detalles_nuevos) - 15} mas")

# ─────────────────────────────────────────────────────────
# Detalles en BD que NO estan en Excel
# ─────────────────────────────────────────────────────────
detalles_solo_bd = detalles_bd - detalles_excel

print(f"\n" + "="*80)
print("DETALLES SOLO EN BD (no en archivo Excel)")
print("="*80)
print(f"Total: {len(detalles_solo_bd)}")

if len(detalles_solo_bd) > 0:
    print(f"\nMuestra (primeros 15):")
    for det in sorted(list(detalles_solo_bd))[:15]:
        print(f"  - {det[:75]}")
    if len(detalles_solo_bd) > 15:
        print(f"  ... y {len(detalles_solo_bd) - 15} mas")

# ─────────────────────────────────────────────────────────
# Resumen FINAL
# ─────────────────────────────────────────────────────────
print(f"\n" + "="*80)
print("RESUMEN FINAL - CONCLUSION")
print("="*80)

print(f"\nBD actual:")
print(f"  Total registros: {len(registros_bd)}")
print(f"  Detalles unicos: {len(detalles_bd)}")

print(f"\nArchivo Excel:")
print(f"  Total registros: {len(df_excel)}")
print(f"  Registros con DESCRIPCION: {len(detalles_excel_list)}")
print(f"  DESCRIPCION unicas: {len(detalles_excel)}")

print(f"\nComparacion (Columna Q vs detalle_compra de BD):")
print(f"  Registros Excel que YA EXISTEN en BD: {registros_excel_en_bd}")
print(f"  Registros Excel que son NUEVOS: {registros_excel_nuevos}")
print(f"  Detalles en comun (unicos): {len(detalles_comunes)}")
print(f"  Detalles nuevos (unicos): {len(detalles_nuevos)}")
print(f"  Detalles solo en BD (no en archivo): {len(detalles_solo_bd)}")

print(f"\n" + "="*80)
print("RECOMENDACION")
print("="*80)

print(f"\nOPCION 1: Importar SOLO los {registros_excel_nuevos} NUEVOS")
print(f"  - Mantener los {len(registros_bd)} registros actuales")
print(f"  - Agregar {registros_excel_nuevos} nuevos")
print(f"  - Total BD final: {len(registros_bd) + registros_excel_nuevos} registros")

print(f"\nOPCION 2: Reemplazar TODO")
print(f"  - Eliminar los {len(registros_bd)} registros actuales")
print(f"  - Importar los {len(df_excel)} registros del archivo")
print(f"  - Total BD final: {len(df_excel)} registros")
print(f"  - Perderia {len(detalles_solo_bd)} descripciones que NO estan en archivo")

if registros_excel_en_bd >= 1000:
    print(f"\nCONCLUSION: El archivo nuevo CONTIENE la mayoria de registros actuales")
    print(f"          Recomendamos OPCION 1: Importar solo los {registros_excel_nuevos} nuevos")
else:
    print(f"\nCONCLUSION: El archivo nuevo NO contiene muchos registros actuales")
    print(f"            Recomendamos OPCION 2: Reemplazar todo")
