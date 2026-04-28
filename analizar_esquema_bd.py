#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Análisis completo del esquema de la base de datos 7_insumos_rado
Extrae estructura, relaciones, índices y genera documentación
"""

import psycopg2
from psycopg2 import sql
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

try:
    conn = psycopg2.connect(
        host='localhost',
        database='7_insumos_rado',
        user='postgres',
        password='Jo.9839514500',
        port=5432
    )
    cur = conn.cursor()

    print("\n" + "="*120)
    print("ANÁLISIS COMPLETO DE SCHEMA - Base de datos 7_insumos_rado")
    print("="*120)

    # 1. OBTENER TODAS LAS TABLAS
    print("\n[1] TABLAS DISPONIBLES")
    print("-" * 120)

    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)

    tablas = [row[0] for row in cur.fetchall()]
    print(f"Total de tablas: {len(tablas)}\n")
    for tabla in tablas:
        print(f"  • {tabla}")

    # 2. ESTRUCTURA DETALLADA DE CADA TABLA
    print("\n\n" + "="*120)
    print("[2] ESTRUCTURA DETALLADA DE TABLAS")
    print("="*120)

    schema_completo = {}

    for tabla in tablas:
        print(f"\n\n📋 TABLA: {tabla.upper()}")
        print("-" * 120)

        # Obtener columnas
        cur.execute(f"""
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
            FROM information_schema.columns
            WHERE table_name = '{tabla}'
            ORDER BY ordinal_position
        """)

        columnas = cur.fetchall()
        schema_completo[tabla] = {
            'columnas': [],
            'relaciones': [],
            'indices': [],
            'estadisticas': {}
        }

        print(f"\n  Columnas:")
        for col_name, data_type, nullable, default, char_length in columnas:
            nullable_str = "NULL" if nullable == 'YES' else "NOT NULL"
            default_str = f" DEFAULT {default}" if default else ""
            char_str = f"({char_length})" if char_length else ""

            print(f"    • {col_name}: {data_type}{char_str} {nullable_str}{default_str}")

            schema_completo[tabla]['columnas'].append({
                'nombre': col_name,
                'tipo': data_type,
                'nullable': nullable == 'YES',
                'default': default,
                'char_length': char_length
            })

        # Obtener PRIMARY KEY
        cur.execute(f"""
            SELECT a.attname
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid
                AND a.attnum = ANY(i.indkey)
            WHERE i.indrelname = '{tabla}_pkey'
        """)

        pk = cur.fetchone()
        if pk:
            print(f"\n  PRIMARY KEY: {pk[0]}")

        # Obtener FOREIGN KEYS
        cur.execute(f"""
            SELECT
                kcu.column_name,
                ccu.table_name,
                ccu.column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = '{tabla}'
        """)

        fks = cur.fetchall()
        if fks:
            print(f"\n  FOREIGN KEYS:")
            for col, ref_tabla, ref_col in fks:
                print(f"    • {col} → {ref_tabla}.{ref_col}")
                schema_completo[tabla]['relaciones'].append({
                    'columna': col,
                    'referencia_tabla': ref_tabla,
                    'referencia_columna': ref_col
                })

        # Obtener ÍNDICES
        cur.execute(f"""
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = '{tabla}'
        """)

        indices = cur.fetchall()
        if indices:
            print(f"\n  ÍNDICES:")
            for idx_name, idx_def in indices:
                print(f"    • {idx_name}")
                schema_completo[tabla]['indices'].append({
                    'nombre': idx_name,
                    'definicion': idx_def
                })

        # Estadísticas de la tabla
        cur.execute(f"SELECT COUNT(*) FROM {tabla}")
        count = cur.fetchone()[0]
        schema_completo[tabla]['estadisticas']['total_registros'] = count
        print(f"\n  ESTADÍSTICAS:")
        print(f"    • Total registros: {count:,}")

        cur.execute(f"""
            SELECT
                pg_size_pretty(pg_total_relation_size('{tabla}')) as size
        """)
        size = cur.fetchone()[0]
        print(f"    • Tamaño: {size}")

    # 3. DIAGRAMA DE RELACIONES
    print("\n\n" + "="*120)
    print("[3] DIAGRAMA DE RELACIONES (Entity Relationship)")
    print("="*120)

    print("\n  Relaciones FK identificadas:")
    for tabla, info in schema_completo.items():
        if info['relaciones']:
            for rel in info['relaciones']:
                print(f"    {tabla}.{rel['columna']} → {rel['referencia_tabla']}.{rel['referencia_columna']}")

    # 4. RESUMEN DE DATOS
    print("\n\n" + "="*120)
    print("[4] RESUMEN DE DATOS POR TABLA")
    print("="*120)

    tabla_info = []
    for tabla, info in schema_completo.items():
        cols = len(info['columnas'])
        rels = len(info['relaciones'])
        regs = info['estadisticas'].get('total_registros', 0)
        tabla_info.append((tabla, cols, rels, regs))

    print(f"\n{'Tabla':<30} {'Columnas':<12} {'FKs':<8} {'Registros':<15}")
    print("-" * 70)
    for tabla, cols, rels, regs in sorted(tabla_info, key=lambda x: x[3], reverse=True):
        print(f"{tabla:<30} {cols:<12} {rels:<8} {regs:>14,}")

    # 5. GUARDAR SCHEMA A JSON
    print("\n\n" + "="*120)
    print("[5] GUARDANDO SCHEMA A ARCHIVO JSON")
    print("="*120)

    with open('schema_bd_completo.json', 'w', encoding='utf-8') as f:
        json.dump(schema_completo, f, indent=2, ensure_ascii=False, default=str)
    print("\n  ✓ Archivo guardado: schema_bd_completo.json")

    # 6. DOCUMENTACIÓN MARKDOWN
    print("\n\n" + "="*120)
    print("[6] GENERANDO DOCUMENTACIÓN MARKDOWN")
    print("="*120)

    markdown = """# 🗄️ ESQUEMA DE BASE DE DATOS - 7_insumos_rado

## 📊 Resumen General

"""

    markdown += f"- **Total Tablas**: {len(tablas)}\n"
    total_registros = sum(info['estadisticas'].get('total_registros', 0) for info in schema_completo.values())
    markdown += f"- **Total Registros**: {total_registros:,}\n"
    markdown += f"- **Base de Datos**: PostgreSQL (localhost:5432)\n"
    markdown += f"- **Nombre BD**: 7_insumos_rado\n\n"

    markdown += "## 📋 Tablas Disponibles\n\n"

    for tabla, info in sorted(schema_completo.items(), key=lambda x: x[1]['estadisticas'].get('total_registros', 0), reverse=True):
        regs = info['estadisticas'].get('total_registros', 0)
        cols = len(info['columnas'])
        markdown += f"### {tabla} ({regs:,} registros, {cols} columnas)\n\n"

        markdown += "**Columnas:**\n"
        for col in info['columnas']:
            nullable = "✓ NULL" if col['nullable'] else "NOT NULL"
            markdown += f"- `{col['nombre']}` ({col['tipo']}) {nullable}\n"

        if info['relaciones']:
            markdown += f"\n**Relaciones FK:**\n"
            for rel in info['relaciones']:
                markdown += f"- `{rel['columna']}` → `{rel['referencia_tabla']}`.`{rel['referencia_columna']}`\n"

        markdown += "\n"

    with open('SCHEMA_BD.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    print("\n  ✓ Archivo guardado: SCHEMA_BD.md")

    print("\n" + "="*120)
    print("✅ ANÁLISIS COMPLETADO")
    print("="*120)
    print("\nArchivos generados:")
    print("  1. schema_bd_completo.json - Schema en formato JSON")
    print("  2. SCHEMA_BD.md - Documentación en Markdown")

    cur.close()
    conn.close()

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
