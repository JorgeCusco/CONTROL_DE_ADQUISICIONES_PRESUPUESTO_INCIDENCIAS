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
print("CARGA DIRECTA DE DATOS")
print("="*100)

try:
    cur.execute("BEGIN")

    # ─────────────────────────────────────────────────────────────────────────
    # PASO 1: Cargar NUEVA_DATA.xlsx en insumos
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[1/3] Limpiando tabla insumos...")
    cur.execute("DELETE FROM insumos")
    print("  ✓ Limpió")

    print("\n[2/3] Cargando NUEVA_DATA.xlsx → insumos...")
    df_nueva = pd.read_excel('NUEVA_DATA.xlsx', sheet_name=0)

    inserted_nueva = 0
    for idx, row in df_nueva.iterrows():
        try:
            # Usar datos tal como vienen, sin validar FK
            codigo_partida = str(int(row['CODIGO'])) if pd.notna(row['CODIGO']) else None
            descripcion = str(row['DESCRIPCION (P)']).strip() if pd.notna(row['DESCRIPCION (P)']) else None
            unidad = str(row['UNIDAD (P)']).strip() if pd.notna(row['UNIDAD (P)']) else "UND."
            cantidad = float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0

            if codigo_partida and descripcion:
                # Insertar sin validar FK
                cur.execute("""
                    INSERT INTO insumos (
                        codigo_partida, descripcion, unidad,
                        incidencia_original, parcial_original,
                        incidencia, cantidad_modificada, cantidad_adquirida,
                        comentario, es_extra
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (codigo_partida, descripcion, unidad, cantidad, cantidad, cantidad, cantidad, 0, None, False))
                inserted_nueva += 1
        except Exception as e:
            # Ignorar errores de FK, seguir adelante
            pass

    print(f"  ✓ Insertados: {inserted_nueva}")

    # ─────────────────────────────────────────────────────────────────────────
    # PASO 2: Agregar caja_chica_nuevo.xlsx en insumos
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[3/3] Cargando caja_chica_nuevo.xlsx → insumos...")
    df_caja = pd.read_excel('caja_chica_nuevo.xlsx', sheet_name=0)

    inserted_caja = 0
    for idx, row in df_caja.iterrows():
        try:
            detalle = str(row['detalle']).strip() if pd.notna(row['detalle']) else None
            unidad = str(row['UND.']).strip() if pd.notna(row['UND.']) else "UND."
            cantidad = float(row['CANT.']) if pd.notna(row['CANT.']) else 0

            if detalle:
                cur.execute("""
                    INSERT INTO insumos (
                        codigo_partida, descripcion, unidad,
                        incidencia_original, parcial_original,
                        incidencia, cantidad_modificada, cantidad_adquirida,
                        comentario, es_extra
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, ('CJA.CHI', detalle, unidad, cantidad, cantidad, cantidad, cantidad, 0, None, False))
                inserted_caja += 1
        except Exception as e:
            pass

    print(f"  ✓ Insertados: {inserted_caja}")

    cur.execute("COMMIT")

    # ─────────────────────────────────────────────────────────────────────────
    # VERIFICACION Y ANALISIS DE INCONSISTENCIAS
    # ─────────────────────────────────────────────────────────────────────────
    print("\n" + "="*100)
    print("ANALISIS DE INCONSISTENCIAS")
    print("="*100)

    cur.execute("SELECT COUNT(*) FROM insumos")
    total_insumos = cur.fetchone()[0]
    print(f"\nTotal insumos cargados: {total_insumos}")

    # Códigos de partida únicos en insumos
    cur.execute("SELECT COUNT(DISTINCT codigo_partida) FROM insumos")
    partidas_unicas = cur.fetchone()[0]
    print(f"Códigos de partida únicos en insumos: {partidas_unicas}")

    # Códigos de partida que NO existen en tabla partidas
    cur.execute("""
        SELECT DISTINCT i.codigo_partida, COUNT(*) as cantidad
        FROM insumos i
        LEFT JOIN partidas p ON i.codigo_partida = p.codigo
        WHERE p.codigo IS NULL
        GROUP BY i.codigo_partida
        ORDER BY cantidad DESC
    """)

    orfanos = cur.fetchall()
    print(f"\nCódigos de partida SIN registro en tabla partidas: {len(orfanos)}")
    if orfanos:
        print("  Top 10:")
        for cod, cant in orfanos[:10]:
            print(f"    - {cod}: {cant} insumos")

    # Códigos de partida que SÍ existen
    cur.execute("""
        SELECT COUNT(DISTINCT i.codigo_partida)
        FROM insumos i
        WHERE EXISTS (SELECT 1 FROM partidas p WHERE p.codigo = i.codigo_partida)
    """)
    vinculados = cur.fetchone()[0]
    print(f"\nCódigos de partida que SÍ existen en partidas: {vinculados}")

    # Estadísticas
    print(f"\n" + "="*100)
    print("ESTADISTICAS")
    print("="*100)

    cur.execute("SELECT COUNT(*) FROM partidas")
    p_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM insumos")
    i_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM compras")
    c_count = cur.fetchone()[0]

    print(f"\nTablas actuales:")
    print(f"  Partidas: {p_count}")
    print(f"  Insumos: {i_count}")
    print(f"  Compras: {c_count}")

    print(f"\nDatos cargados:")
    print(f"  De NUEVA_DATA.xlsx: {inserted_nueva} insumos")
    print(f"  De caja_chica_nuevo.xlsx: {inserted_caja} insumos")
    print(f"  Total: {inserted_nueva + inserted_caja}")

    print(f"\nInconsistencias encontradas:")
    print(f"  Insumos con codigo_partida NO válido: {len(orfanos)}")
    print(f"  Insumos con codigo_partida válido: {vinculados}")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()
