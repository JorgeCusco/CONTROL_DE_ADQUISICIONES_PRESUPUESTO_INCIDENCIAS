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
print("ACTUALIZAR DESCRIPCIONES DE PARTIDAS")
print("="*100)

try:
    cur.execute("BEGIN")

    # Obtener descripción de cada partida desde los insumos
    # (tomar la descripción del primer insumo que pertenece a esa partida)
    cur.execute("""
        SELECT p.codigo, i.descripcion
        FROM partidas p
        LEFT JOIN insumos i ON i.codigo_partida = p.codigo
        WHERE i.descripcion IS NOT NULL
        GROUP BY p.codigo, i.descripcion
        ORDER BY p.codigo
    """)

    actualizadas = 0
    for codigo, descripcion in cur.fetchall():
        if descripcion and not descripcion.startswith("PARTIDA"):
            cur.execute("""
                UPDATE partidas
                SET descripcion = %s
                WHERE codigo = %s
            """, (descripcion.strip(), codigo))
            if cur.rowcount > 0:
                actualizadas += 1
                if actualizadas <= 5:
                    print(f"  Actualizada partida {codigo}: {descripcion[:60]}")

    cur.execute("COMMIT")

    print(f"\n✓ Total partidas actualizadas: {actualizadas}")

    # Verificar resultado
    cur.execute("""
        SELECT COUNT(*) FROM partidas
        WHERE descripcion NOT LIKE 'PARTIDA%'
    """)
    con_desc = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM partidas")
    total = cur.fetchone()[0]

    print(f"✓ Partidas con descripción real: {con_desc}/{total}")

    # Mostrar ejemplo
    print("\nEjemplos de partidas actualizadas:")
    cur.execute("""
        SELECT codigo, descripcion
        FROM partidas
        WHERE descripcion NOT LIKE 'PARTIDA%'
        LIMIT 3
    """)
    for cod, desc in cur.fetchall():
        print(f"  {cod}: {desc[:70]}")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

cur.close()
conn.close()
