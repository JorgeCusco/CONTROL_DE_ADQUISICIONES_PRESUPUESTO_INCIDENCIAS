#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import pandas as pd
import psycopg2
import sys
sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect(
    host='localhost',
    database='7_insumos_rado',
    user='postgres',
    password='Jo.9839514500',
    port=5432
)
cur = conn.cursor()

print("="*100)
print("CARGA DE DATOS - SIMPLE")
print("="*100)

try:
    cur.execute("BEGIN")

    # Limpiar
    print("\nLimpiando insumos...")
    cur.execute("DELETE FROM insumos")

    # Cargar NUEVA_DATA.xlsx
    print("Cargando NUEVA_DATA.xlsx...")
    df = pd.read_excel('NUEVA_DATA.xlsx', sheet_name=0)

    count = 0
    for idx, row in df.iterrows():
        try:
            cur.execute("""
                INSERT INTO insumos (
                    codigo_partida, descripcion, unidad,
                    incidencia_original, parcial_original,
                    incidencia, cantidad_modificada, cantidad_adquirida,
                    comentario, es_extra
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                str(int(row['CODIGO'])) if pd.notna(row['CODIGO']) else 'UNKNOWN',
                str(row['DESCRIPCION (P)']) if pd.notna(row['DESCRIPCION (P)']) else 'SIN DESC',
                str(row['UNIDAD (P)']) if pd.notna(row['UNIDAD (P)']) else 'UND.',
                float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0,
                float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0,
                float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0,
                float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0,
                0,
                None,
                False
            ))
            count += 1
            if count % 500 == 0:
                print(f"  Insertados: {count}")
        except Exception as e:
            pass

    print(f"Total de NUEVA_DATA: {count}")

    # Cargar caja chica
    print("\nCargando caja_chica_nuevo.xlsx...")
    df_caja = pd.read_excel('caja_chica_nuevo.xlsx', sheet_name=0)

    count_caja = 0
    for idx, row in df_caja.iterrows():
        try:
            cur.execute("""
                INSERT INTO insumos (
                    codigo_partida, descripcion, unidad,
                    incidencia_original, parcial_original,
                    incidencia, cantidad_modificada, cantidad_adquirida,
                    comentario, es_extra
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                'CJA.CHI',
                str(row['detalle']) if pd.notna(row['detalle']) else 'SIN DESC',
                str(row['UND.']) if pd.notna(row['UND.']) else 'UND.',
                float(row['CANT.']) if pd.notna(row['CANT.']) else 0,
                float(row['CANT.']) if pd.notna(row['CANT.']) else 0,
                float(row['CANT.']) if pd.notna(row['CANT.']) else 0,
                float(row['CANT.']) if pd.notna(row['CANT.']) else 0,
                0,
                None,
                False
            ))
            count_caja += 1
        except Exception as e:
            pass

    print(f"Total de caja chica: {count_caja}")

    cur.execute("COMMIT")

    # Verificar
    cur.execute("SELECT COUNT(*) FROM insumos")
    final = cur.fetchone()[0]

    print(f"\nTotal insertado: {count + count_caja}")
    print(f"Total verificado en BD: {final}")

    # Inconsistencias
    cur.execute("""
        SELECT DISTINCT codigo_partida FROM insumos
        WHERE NOT EXISTS (SELECT 1 FROM partidas WHERE codigo = codigo_partida)
        ORDER BY codigo_partida
    """)

    orfanos = [row[0] for row in cur.fetchall()]
    print(f"\nCodigos de partida sin registro en tabla partidas: {len(orfanos)}")
    if orfanos:
        print("  Primeros 10:")
        for cod in orfanos[:10]:
            print(f"    - {cod}")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()
