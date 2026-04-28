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

print("="*80)
print("ANALISIS - COLUMNA X COMO CLAVE")
print("="*80)

# Columna X en Excel = índice 23 (H/C)
col_X = df_excel.columns[23]  # X es la columna 24, índice 23
col_desc = 'DESCRIPCIÓN'
col_unit = 'UND.'
col_cant = 'CANT.'
col_pu = 'P/U'

print(f"\nColumna X identificada: {col_X} (índice 23)")
print(f"Descripcion: {col_desc}")
print(f"Total registros Excel: {len(df_excel)}")

# ─────────────────────────────────────────────────────────
# Conectar a BD y extraer compras
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
           unidad_und, cantidad_und, precio_und, observacion
    FROM compras
    ORDER BY id
""")
compras_bd = cur.fetchall()
cur.close()
conn.close()

print(f"Total registros BD: {len(compras_bd)}")

# ─────────────────────────────────────────────────────────
# Crear clave única usando Columna X + Descripción
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("VALIDACION COLUMNA X")
print("="*80)

print(f"\nValores faltantes en columna X: {df_excel[col_X].isnull().sum()}")
print(f"Valores únicos en columna X: {df_excel[col_X].nunique()}")

print("\nDistribucion de valores en columna X:")
col_x_counts = df_excel[col_X].value_counts().head(20)
print(col_x_counts)

# ─────────────────────────────────────────────────────────
# Crear claves para comparación: Col_X + Descripción
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("COMPARACION POR: Columna X + Descripción")
print("="*80)

# Excel: crear clave Col_X + Descripción
df_excel['_clave'] = df_excel[col_X].astype(str).str.strip() + '|' + df_excel[col_desc].astype(str).str.strip()
df_excel_valido = df_excel[df_excel[col_X].notna()].copy()

claves_excel = set(df_excel_valido['_clave'].unique())
print(f"\nClaves unicas en Excel (con Col_X valida): {len(claves_excel)}")

# BD: crear claves de compras existentes
# Usar orden_doc + insumo_descripcion
claves_bd = set()
for row in compras_bd:
    orden_doc = str(row[1]).strip() if row[1] else ""
    insumo_desc = str(row[3]).strip() if row[3] else ""
    if orden_doc and insumo_desc:
        claves_bd.add(f"{orden_doc}|{insumo_desc}")

print(f"Claves unicas en BD (Orden + Descripción): {len(claves_bd)}")

# ─────────────────────────────────────────────────────────
# Comparar
# ─────────────────────────────────────────────────────────
claves_comunes = claves_excel.intersection(claves_bd)
claves_nuevas_excel = claves_excel - claves_bd

print(f"\nClaves en comun: {len(claves_comunes)}")
if claves_comunes:
    for clave in sorted(list(claves_comunes))[:5]:
        print(f"  - {clave}")
    if len(claves_comunes) > 5:
        print(f"  ... y {len(claves_comunes) - 5} mas")

print(f"\nClaves NUEVAS (solo Excel): {len(claves_nuevas_excel)}")
if claves_nuevas_excel:
    for clave in sorted(list(claves_nuevas_excel))[:10]:
        print(f"  - {clave}")
    if len(claves_nuevas_excel) > 10:
        print(f"  ... y {len(claves_nuevas_excel) - 10} mas")

# ─────────────────────────────────────────────────────────
# Analizar registros sin Columna X
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("REGISTROS SIN VALOR EN COLUMNA X")
print("="*80)

sin_col_x = df_excel[df_excel[col_X].isna()]
print(f"\nRegistros sin Columna X: {len(sin_col_x)}")

if len(sin_col_x) > 0:
    print(f"\nMuestra (primeros 10):")
    print(sin_col_x[[col_desc, col_unit, col_cant, col_pu]].head(10).to_string())

# ─────────────────────────────────────────────────────────
# Duplicados en Excel
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("DUPLICADOS EN EXCEL (Columna X + Descripción)")
print("="*80)

duplicados_excel = df_excel_valido[df_excel_valido.duplicated(subset=['_clave'], keep=False)]
print(f"\nRegistros duplicados: {len(duplicados_excel)}")

if len(duplicados_excel) > 0:
    print("\nMuestra de duplicados:")
    print(duplicados_excel[[col_X, col_desc, col_unit, col_cant, col_pu]].head(15).to_string())

# ─────────────────────────────────────────────────────────
# Resumen final
# ─────────────────────────────────────────────────────────
print("\n" + "="*80)
print("RESUMEN Y RECOMENDACION")
print("="*80)

registros_con_col_x = len(df_excel_valido)
registros_sin_col_x = len(sin_col_x)

print(f"\nArchivo total: {len(df_excel)} registros")
print(f"  Con Columna X: {registros_con_col_x}")
print(f"  Sin Columna X: {registros_sin_col_x}")
print(f"\nBD actual: {len(compras_bd)} registros")
print(f"\nUsando Columna X + Descripción como clave:")
print(f"  Claves comunes: {len(claves_comunes)}")
print(f"  Claves nuevas: {len(claves_nuevas_excel)}")
print(f"  Duplicados internos: {len(duplicados_excel)//2 if len(duplicados_excel) > 0 else 0}")

print("\n" + "="*80)
print("OPCION RECOMENDADA")
print("="*80)

print(f"""
Importar SOLO registros nuevos:

PASO 1: Mantener los {len(compras_bd)} registros actuales
PASO 2: Agregar {len(claves_nuevas_excel)} registros nuevos (Columna X + Descripción)
PASO 3: Ignorar los {registros_sin_col_x} registros sin Columna X (revisión manual)
PASO 4: Consolidar los {len(duplicados_excel)//2 if len(duplicados_excel) > 0 else 0} duplicados (sumar cantidades/revisar precios)

Total a importar: aprox. {len(claves_nuevas_excel)} registros nuevos
Tiempo estimado: <1 minuto
""")

print("\nProximos pasos:")
print("1. Confirmar estructura de import")
print("2. Crear script de importación con BEGIN/COMMIT")
print("3. Actualizar mapeo_vinculacion con nuevos insumos")
print("4. Validar en BD con SELECT COUNT(*)")
