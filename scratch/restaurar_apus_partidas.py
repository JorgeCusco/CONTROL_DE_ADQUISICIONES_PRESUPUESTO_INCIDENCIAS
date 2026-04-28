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
print("RESTAURACION DE TABLAS - PASO 1: EXTRAER PARTIDAS DESDE apus_detallado")
print("="*100)

# Extraer partidas únicas de apus_detallado
cur.execute("""
    SELECT DISTINCT
        "Partida_Codigo",
        "Partida_Descripcion",
        "Partida_Unidad"
    FROM apus_detallado
    ORDER BY "Partida_Codigo"
""")

partidas_apus = cur.fetchall()
print(f"\nPartidas encontradas en apus_detallado: {len(partidas_apus)}")

# Mostrar primeras 10
print("\nPrimeras 10 partidas:")
for i, (cod, nombre, unidad) in enumerate(partidas_apus[:10], 1):
    print(f"  [{i}] {cod}: {nombre} ({unidad})")

print("\n" + "="*100)
print("PASO 2: VERIFICAR ESTADO ACTUAL DE TABLA partidas")
print("="*100)

cur.execute("SELECT COUNT(*) FROM partidas")
count_actual = cur.fetchone()[0]
print(f"\nRegistros actuales en partidas: {count_actual}")

# Mostrar registros actuales
cur.execute("""
    SELECT codigo, descripcion, unidad, metrado_fijo
    FROM partidas
    ORDER BY codigo
    LIMIT 5
""")
print("\nPrimeros 5 registros actuales:")
for row in cur.fetchall():
    print(f"  {row}")

print("\n" + "="*100)
print("PASO 3: COMPARAR DATOS")
print("="*100)

# Extraer códigos actuales
cur.execute("SELECT DISTINCT codigo FROM partidas ORDER BY codigo")
codigos_actuales = set(row[0] for row in cur.fetchall())

codigos_apus = set(cod for cod, _, _ in partidas_apus)

print(f"\nCódigos en partidas actual: {len(codigos_actuales)}")
print(f"Códigos en apus_detallado: {len(codigos_apus)}")
print(f"En común: {len(codigos_actuales.intersection(codigos_apus))}")
print(f"Solo en apus: {len(codigos_apus - codigos_actuales)}")
print(f"Solo en BD actual: {len(codigos_actuales - codigos_apus)}")

print("\n" + "="*100)
print("PASO 4: RECONSTRUIR TABLA partidas")
print("="*100)

try:
    # Iniciar transacción
    cur.execute("BEGIN")

    # Eliminar todos los registros de partidas
    print("\nEliminando registros actuales de partidas...")
    cur.execute("DELETE FROM partidas")

    # Insertar desde apus_detallado
    print("Insertando nuevas partidas desde apus_detallado...")

    inserted = 0
    for codigo, nombre, unidad in partidas_apus:
        try:
            cur.execute("""
                INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo)
                VALUES (%s, %s, %s, 1.0)
                ON CONFLICT (codigo) DO UPDATE
                SET descripcion = EXCLUDED.descripcion, unidad = EXCLUDED.unidad
            """, (codigo, nombre, unidad))
            inserted += 1
        except Exception as e:
            print(f"  Error insertando {codigo}: {e}")

    # Commit
    cur.execute("COMMIT")
    print(f"\nPartidas insertadas/actualizadas: {inserted}")

    # Verificar resultado
    cur.execute("SELECT COUNT(*) FROM partidas")
    count_final = cur.fetchone()[0]
    print(f"Total de partidas ahora: {count_final}")

    # Mostrar primeras 10 actuales
    print("\nPrimeras 10 partidas después de restauración:")
    cur.execute("""
        SELECT codigo, descripcion, unidad, metrado_fijo
        FROM partidas
        ORDER BY codigo
        LIMIT 10
    """)
    for i, (cod, desc, unit, metrado) in enumerate(cur.fetchall(), 1):
        print(f"  [{i}] {cod}: {desc} ({unit}) - Metrado: {metrado}")

except Exception as e:
    cur.execute("ROLLBACK")
    print(f"ERROR: {e}")

print("\n" + "="*100)
print("PASO 5: VERIFICAR INTEGRIDAD DE INSUMOS")
print("="*100)

# Verificar que todos los insumos tengan partida válida
cur.execute("""
    SELECT COUNT(*) FROM insumos i
    WHERE NOT EXISTS (SELECT 1 FROM partidas p WHERE p.codigo = i.codigo_partida)
""")
huerfanos = cur.fetchone()[0]
print(f"\nInsumos sin partida válida: {huerfanos}")

if huerfanos == 0:
    print("✓ Todos los insumos están vinculados a partidas válidas")

print("\n" + "="*100)
print("RESUMEN")
print("="*100)

cur.execute("SELECT COUNT(*) FROM partidas")
p_count = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM insumos")
i_count = cur.fetchone()[0]

cur.execute("SELECT COUNT(*) FROM apus_detallado")
a_count = cur.fetchone()[0]

print(f"\nEstado final:")
print(f"  Partidas: {p_count}")
print(f"  Insumos: {i_count}")
print(f"  APUs Detallado: {a_count}")
print(f"\n✓ Restauración completada")

cur.close()
conn.close()
