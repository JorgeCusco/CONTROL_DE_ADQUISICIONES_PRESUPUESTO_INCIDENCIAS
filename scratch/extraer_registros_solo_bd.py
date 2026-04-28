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

col_Q = 'DESCRIPCIÓN'

# Extraer descripciones del Excel
detalles_excel = set(str(x).strip() for x in df_excel[col_Q].dropna().unique())

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
    SELECT id, orden_doc, detalle_compra, insumo_descripcion,
           unidad_c, cant_c, pu_c, total_c,
           unidad_und, cantidad_und, precio_und
    FROM compras
    ORDER BY id
""")
registros_bd = cur.fetchall()
cur.close()
conn.close()

# ─────────────────────────────────────────────────────────
# Identificar registros SOLO en BD (no en Excel)
# ─────────────────────────────────────────────────────────
print("="*100)
print("REGISTROS QUE ESTAN EN BD PERO NO EN ARCHIVO EXCEL")
print("="*100)

registros_solo_bd = []
for row in registros_bd:
    detalle = str(row[2]).strip() if row[2] else ""
    if detalle and detalle not in detalles_excel:
        registros_solo_bd.append(row)

print(f"\nTotal de registros SOLO en BD: {len(registros_solo_bd)}")

if len(registros_solo_bd) > 0:
    print(f"\n" + "="*100)
    print("LISTADO COMPLETO DE REGISTROS A REVISAR:")
    print("="*100)

    for i, row in enumerate(registros_solo_bd, 1):
        id_reg = row[0]
        orden = row[1]
        detalle = row[2]
        insumo = row[3]
        unidad = row[4]
        cantidad = row[5]
        precio = row[6]
        total = row[7]

        print(f"\n[{i}] ID: {id_reg}")
        print(f"    Orden: {orden}")
        print(f"    Detalle: {detalle}")
        print(f"    Insumo: {insumo}")
        print(f"    Cantidad: {cantidad} {unidad}")
        print(f"    Precio Unit: {precio}")
        print(f"    Total: {total}")

# ─────────────────────────────────────────────────────────
# Exportar a CSV para revisar
# ─────────────────────────────────────────────────────────
if len(registros_solo_bd) > 0:
    print(f"\n" + "="*100)
    print("EXPORTANDO A CSV...")
    print("="*100)

    df_solo_bd = pd.DataFrame(registros_solo_bd, columns=[
        'ID', 'Orden_Doc', 'Detalle_Compra', 'Insumo_Descripcion',
        'Unidad_Original', 'Cantidad_Original', 'Precio_Original', 'Total_Original',
        'Unidad_Normalizado', 'Cantidad_Normalizado', 'Precio_Normalizado'
    ])

    archivo_csv = r'e:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\registros_solo_bd.csv'
    df_solo_bd.to_csv(archivo_csv, index=False, encoding='utf-8')
    print(f"\nArchivo generado: {archivo_csv}")

print("\n" + "="*100)
print("RESUMEN")
print("="*100)
print(f"\nSi IMPORTAS SOLO LOS NUEVOS (835):")
print(f"  - Mantendras: 1,054 registros actuales")
print(f"  - Agregaras: 835 nuevos")
print(f"  - TOTAL: 1,889 registros")
print(f"  - PERDERAS: 0 registros (porque los 1,054 se mantienen)")

print(f"\nSi REEMPLAZAS TODO:")
print(f"  - Eliminaras: 1,054 registros actuales")
print(f"  - Importaras: 1,847 registros del archivo")
print(f"  - TOTAL: 1,847 registros")
print(f"  - PERDERAS: {len(registros_solo_bd)} registros (los listados arriba)")
