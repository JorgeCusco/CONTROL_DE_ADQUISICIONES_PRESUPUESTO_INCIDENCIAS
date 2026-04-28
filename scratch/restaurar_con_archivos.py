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
print("RESTAURACION DE INSUMOS")
print("="*100)

try:
    cur.execute("BEGIN")

    # Limpiar tabla insumos
    print("\n[1/3] Limpiando tabla insumos...")
    cur.execute("DELETE FROM insumos")
    print(f"  ✓ Eliminados")

    # ─────────────────────────────────────────────────────────────────────────
    # PASO 1: Cargar desde NUEVA_DATA.xlsx
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[2/3] Cargando desde NUEVA_DATA.xlsx...")

    df_nueva = pd.read_excel('NUEVA_DATA.xlsx', sheet_name=0)

    inserted_nueva = 0
    for idx, row in df_nueva.iterrows():
        try:
            if pd.isna(row['CODIGO']) or pd.isna(row['DESCRIPCION (P)']):
                continue

            codigo_partida = str(int(row['CODIGO']))
            descripcion = str(row['DESCRIPCION (P)']).strip()
            unidad = str(row['UNIDAD (P)']).strip() if pd.notna(row['UNIDAD (P)']) else "UND."
            cantidad = float(row['CANTIDAD (P)']) if pd.notna(row['CANTIDAD (P)']) else 0

            if descripcion and codigo_partida:
                cur.execute("""
                    INSERT INTO insumos (
                        codigo_partida, descripcion, unidad,
                        incidencia_original, parcial_original,
                        incidencia, cantidad_modificada, cantidad_adquirida,
                        comentario, es_extra
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    codigo_partida, descripcion, unidad,
                    cantidad, cantidad * 1.0,  # incidencia_original, parcial_original
                    cantidad, cantidad * 1.0,  # incidencia, cantidad_modificada
                    0, None, False  # cantidad_adquirida, comentario, es_extra
                ))
                inserted_nueva += 1
        except Exception as e:
            pass  # Ignorar errores y continuar

    print(f"  ✓ Insertados desde NUEVA_DATA: {inserted_nueva}")

    # ─────────────────────────────────────────────────────────────────────────
    # PASO 2: Agregar desde caja_chica_nuevo.xlsx
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[3/3] Completando con caja_chica_nuevo.xlsx...")

    df_caja = pd.read_excel('caja_chica_nuevo.xlsx', sheet_name=0)

    # Para caja chica, usar un código de partida especial (CJA.CHI)
    inserted_caja = 0
    for idx, row in df_caja.iterrows():
        try:
            detalle = str(row['detalle']).strip() if pd.notna(row['detalle']) else ""
            unidad = str(row['UND.']).strip() if pd.notna(row['UND.']) else "UND."
            cantidad = float(row['CANT.']) if pd.notna(row['CANT.']) else 0

            if detalle:
                # Usar código especial para caja chica
                cur.execute("""
                    INSERT INTO insumos (
                        codigo_partida, descripcion, unidad,
                        incidencia_original, parcial_original,
                        incidencia, cantidad_modificada, cantidad_adquirida,
                        comentario, es_extra
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    'CJA.CHI', detalle, unidad,
                    cantidad, cantidad * 1.0,
                    cantidad, cantidad * 1.0,
                    0, None, False
                ))
                inserted_caja += 1
        except Exception as e:
            pass

    print(f"  ✓ Insertados desde CAJA CHICA: {inserted_caja}")

    cur.execute("COMMIT")

    # ─────────────────────────────────────────────────────────────────────────
    # VERIFICACION
    # ─────────────────────────────────────────────────────────────────────────
    print("\n" + "="*100)
    print("VERIFICACION")
    print("="*100)

    cur.execute("SELECT COUNT(*) FROM insumos")
    total = cur.fetchone()[0]
    print(f"\nTotal insumos restaurados: {total}")

    cur.execute("SELECT COUNT(DISTINCT codigo_partida) FROM insumos")
    partidas_con_insumos = cur.fetchone()[0]
    print(f"Partidas con insumos: {partidas_con_insumos}")

    print(f"\nMuestra de insumos restaurados:")
    cur.execute("""
        SELECT id, codigo_partida, descripcion, unidad, cantidad_modificada
        FROM insumos
        LIMIT 5
    """)
    for i, row in enumerate(cur.fetchall(), 1):
        print(f"  [{i}] {row}")

    # Insumos de caja chica
    cur.execute("""
        SELECT COUNT(*) FROM insumos WHERE codigo_partida = 'CJA.CHI'
    """)
    caja_count = cur.fetchone()[0]
    print(f"\nInsumos de Caja Chica: {caja_count}")

    # Verificar integridad
    cur.execute("""
        SELECT COUNT(*) FROM insumos i
        WHERE NOT EXISTS (SELECT 1 FROM partidas p WHERE p.codigo = i.codigo_partida)
    """)
    huerfanos = cur.fetchone()[0]

    if huerfanos == 0:
        print(f"\n✓ Todos los insumos están vinculados a partidas válidas")
    else:
        print(f"\n⚠️ {huerfanos} insumos sin partida válida")

    print("\n" + "="*100)
    print("RESUMEN FINAL")
    print("="*100)

    cur.execute("SELECT COUNT(*) FROM partidas")
    p_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM insumos")
    i_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM compras")
    c_count = cur.fetchone()[0]

    print(f"\n✓ Sistema Restaurado:")
    print(f"  Partidas: {p_count}")
    print(f"  Insumos: {i_count}")
    print(f"  Compras: {c_count}")
    print(f"\n✓ Vinculador listo para usar")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()
