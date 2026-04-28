#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd
import psycopg2
from dotenv import load_dotenv
import sys

# Configurar stdout para UTF-8
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

# ─────────────────────────────────────────────────────────
# Leer archivo Excel
# ─────────────────────────────────────────────────────────
excel_file = r'e:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\INSUMOS_COMPRADOS 26.xlsx'

df_excel = pd.read_excel(excel_file, sheet_name=0)

print("="*80)
print("ARCHIVO EXCEL - ESTRUCTURA")
print("="*80)
print(f"\nColumnas encontradas:")
for i, col in enumerate(df_excel.columns):
    print(f"  [{i:2d}] {col}")

print(f"\nTotal de filas: {len(df_excel)}")

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
           unidad_c, cant_c, pu_c, total_c
    FROM compras
    ORDER BY id
""")
current_compras = cur.fetchall()
cur.close()
conn.close()

print(f"\nBD actual - Compras registradas: {len(current_compras)}")

# ─────────────────────────────────────────────────────────
# Analizar columnas del Excel
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("COLUMNAS CLAVE IDENTIFICADAS")
print("="*80)

# Buscar columnas por nombre
col_desc = None
col_unit = None
col_cant = None
col_pu = None
col_oc = None

for col in df_excel.columns:
    col_lower = str(col).lower().strip()
    if 'descripci' in col_lower:
        col_desc = col
    elif 'und' in col_lower or 'unit' in col_lower:
        col_unit = col
    elif 'cant' in col_lower:
        col_cant = col
    elif 'p/u' in col_lower or 'precio' in col_lower:
        col_pu = col
    elif 'o/c' in col_lower or 'orden' in col_lower:
        col_oc = col

print(f"Descripcion insumo: {col_desc} (columna {df_excel.columns.get_loc(col_desc) if col_desc else 'N/A'})")
print(f"Unidad: {col_unit} (columna {df_excel.columns.get_loc(col_unit) if col_unit else 'N/A'})")
print(f"Cantidad: {col_cant} (columna {df_excel.columns.get_loc(col_cant) if col_cant else 'N/A'})")
print(f"Precio unit: {col_pu} (columna {df_excel.columns.get_loc(col_pu) if col_pu else 'N/A'})")
print(f"Orden/Doc: {col_oc} (columna {df_excel.columns.get_loc(col_oc) if col_oc else 'N/A'})")

# ─────────────────────────────────────────────────────────
# Muestra de datos
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("MUESTRA DE DATOS (primeras 10 filas)")
print("="*80)

if all([col_desc, col_unit, col_cant, col_pu, col_oc]):
    print(df_excel[[col_oc, col_desc, col_unit, col_cant, col_pu]].head(10).to_string())

# ─────────────────────────────────────────────────────────
# Validacion de calidad
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("VALIDACION DE DATOS")
print("="*80)

print("\nValores faltantes (columnas clave):")
print(f"  Descripcion: {df_excel[col_desc].isnull().sum()} faltantes")
print(f"  Unidad: {df_excel[col_unit].isnull().sum()} faltantes")
print(f"  Cantidad: {df_excel[col_cant].isnull().sum()} faltantes")
print(f"  Precio: {df_excel[col_pu].isnull().sum()} faltantes")
print(f"  Orden/Doc: {df_excel[col_oc].isnull().sum()} faltantes")

print("\nUnidades de medida encontradas:")
units_count = df_excel[col_unit].value_counts()
print(units_count)

# ─────────────────────────────────────────────────────────
# Comparar con BD actual
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("COMPARACION CON BD ACTUAL")
print("="*80)

# Insumos unicos en Excel
unique_excel_desc = set(str(x).strip() for x in df_excel[col_desc].dropna().unique())
print(f"\nInsumos unicos en Excel: {len(unique_excel_desc)}")
for ins in sorted(list(unique_excel_desc))[:15]:
    print(f"  - {ins}")
if len(unique_excel_desc) > 15:
    print(f"  ... y {len(unique_excel_desc) - 15} mas")

# Insumos unicos en BD
unique_bd_desc = set(str(x).strip() for x in [row[3] for row in current_compras if row[3]])
print(f"\nInsumos unicos en BD: {len(unique_bd_desc)}")
for ins in sorted(list(unique_bd_desc))[:15]:
    print(f"  - {ins}")
if len(unique_bd_desc) > 15:
    print(f"  ... y {len(unique_bd_desc) - 15} mas")

# Insumos en común
insumos_comunes = unique_excel_desc.intersection(unique_bd_desc)
print(f"\nInsumos en comun: {len(insumos_comunes)}")
if insumos_comunes:
    for ins in sorted(list(insumos_comunes))[:10]:
        print(f"  - {ins}")
    if len(insumos_comunes) > 10:
        print(f"  ... y {len(insumos_comunes) - 10} mas")

# Insumos nuevos (solo en Excel)
insumos_nuevos = unique_excel_desc - unique_bd_desc
print(f"\nInsumos NUEVOS (solo en Excel): {len(insumos_nuevos)}")
if insumos_nuevos:
    for ins in sorted(list(insumos_nuevos))[:15]:
        print(f"  - {ins}")
    if len(insumos_nuevos) > 15:
        print(f"  ... y {len(insumos_nuevos) - 15} mas")

# ─────────────────────────────────────────────────────────
# Analisis de duplicados en Excel
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("DUPLICADOS EN EXCEL")
print("="*80)

# Crear clave compuesta: Orden Doc + Descripcion
df_excel['_key'] = df_excel[col_oc].astype(str) + '|' + df_excel[col_desc].astype(str)
duplicados = df_excel[df_excel.duplicated(subset=['_key'], keep=False)]
print(f"\nRegistros duplicados por (Orden Doc + Descripcion): {len(duplicados)}")

if len(duplicados) > 0:
    print("\nMuestra de duplicados:")
    print(duplicados[[col_oc, col_desc, col_cant, col_pu]].head(10).to_string())

# ─────────────────────────────────────────────────────────
# Comparar por Orden Doc + Descripcion con BD
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("ANALISIS FINAL - RECOMENDACION")
print("="*80)

print(f"\nArchivo: {len(df_excel)} registros")
print(f"BD actual: {len(current_compras)} registros")
print(f"Insumos unicos Excel: {len(unique_excel_desc)}")
print(f"Insumos unicos BD: {len(unique_bd_desc)}")
print(f"Insumos en comun: {len(insumos_comunes)} ({round(100*len(insumos_comunes)/len(unique_excel_desc), 1)}%)")
print(f"Insumos nuevos: {len(insumos_nuevos)}")
print(f"Registros duplicados en Excel: {len(duplicados)//2 if len(duplicados) > 0 else 0}")

print("\nRECOMENDACION:")
if len(insumos_nuevos) > 0 and len(insumos_comunes) > 0:
    print("\n>> OPCION 1 (RECOMENDADA): Importar solo registros nuevos")
    print(f"   - Mantener los {len(current_compras)} registros actuales")
    print(f"   - Agregar aprox. {len(insumos_nuevos)} insumos nuevos")
    print(f"   - Comparar por: Orden Doc + Descripcion exacta")
else:
    print("\n>> OPCION 2: Reemplazar todos")
    print(f"   - Eliminar los {len(current_compras)} registros actuales")
    print(f"   - Importar los {len(df_excel)} registros del archivo")

print("\nProximos pasos:")
print("1. Validar estructura de datos coincida (O/C, Descripcion, Unidad, Cant, P/U)")
print("2. Limpiar espacios en blanco y caracteres especiales")
print("3. Importar a tabla 'compras' con BEGIN/COMMIT")
print("4. Actualizar mapeo_vinculacion si es necesario")
