#!/usr/bin/env python3
# -*- coding: utf-8 -*-
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
print("RESTAURACION DE TABLA insumos DESDE apus_detallado")
print("="*100)

try:
    cur.execute("BEGIN")

    # Limpiar tabla insumos
    print("\nEliminando registros actuales de insumos...")
    cur.execute("DELETE FROM insumos")
    deleted = cur.rowcount
    print(f"  Eliminados: {deleted}")

    # Construir insumos desde apus_detallado
    print("\nReconstruyendo insumos desde apus_detallado...")

    # Usar ROW_NUMBER para crear IDs
    cur.execute("""
        INSERT INTO insumos (
            codigo_partida, descripcion, unidad,
            incidencia_original, parcial_original,
            incidencia, cantidad_modificada, cantidad_adquirida,
            comentario, es_extra
        )
        SELECT DISTINCT
            "Partida_Codigo",
            "Insumo_Descripcion",
            "Insumo_Unidad",
            "Insumo_Recursos",
            "Insumo_Parcial",
            "Insumo_Recursos",
            "Insumo_Parcial",
            0,
            NULL,
            FALSE
        FROM apus_detallado
        WHERE "Insumo_Descripcion" IS NOT NULL
          AND "Insumo_Descripcion" != ''
        ORDER BY "Partida_Codigo", "Insumo_Descripcion"
    """)

    inserted = cur.rowcount
    print(f"  Insertados: {inserted}")

    cur.execute("COMMIT")

    # Verificar resultado
    cur.execute("SELECT COUNT(*) FROM insumos")
    final = cur.fetchone()[0]
    print(f"\nTotal insumos restaurados: {final}")

    # Mostrar muestra
    print(f"\nMuestra de insumos restaurados:")
    cur.execute("""
        SELECT id, codigo_partida, descripcion, unidad,
               incidencia_original, cantidad_modificada
        FROM insumos
        LIMIT 5
    """)
    for i, row in enumerate(cur.fetchall(), 1):
        print(f"  [{i}] {row}")

    # Verificar integridad
    cur.execute("""
        SELECT COUNT(*) FROM insumos i
        WHERE NOT EXISTS (SELECT 1 FROM partidas p WHERE p.codigo = i.codigo_partida)
    """)
    huerfanos = cur.fetchone()[0]
    print(f"\nInsumos sin partida válida: {huerfanos}")

    if huerfanos == 0:
        print("✓ Todos los insumos están correctamente vinculados a partidas")

    print("\n" + "="*100)
    print("RESUMEN")
    print("="*100)

    cur.execute("SELECT COUNT(*) FROM partidas")
    p_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM insumos")
    i_count = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM mapeo_vinculacion")
    v_count = cur.fetchone()[0]

    print(f"\nEstado restaurado:")
    print(f"  ✓ Partidas: {p_count}")
    print(f"  ✓ Insumos: {i_count}")
    print(f"  ✓ Vínculos: {v_count}")

    print(f"\n✓ Restauración completada - Sistema listo")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()
