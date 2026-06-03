#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DIAGNÓSTICO COMPLETO DE LA ESTRUCTURA DE DATOS
Sistema: 7_Insumos_Rado (Belempampa)
Objetivo: Analizar tablas, relaciones, integridad de datos
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import json
import sys
import os

# Configurar UTF-8 en Windows
if sys.platform == 'win32':
    os.environ['PYTHONIOENCODING'] = 'utf-8'
    sys.stdout.reconfigure(encoding='utf-8')

# Configuración de conexión
DB_CONFIG = {
    'host': 'localhost',
    'database': '7_insumos_rado',
    'user': 'postgres',
    'password': 'Jo.9839514500',
    'port': 5432
}

def connect_db():
    """Conectar a la BD"""
    return psycopg2.connect(**DB_CONFIG)

def get_table_structure(cursor, table_name):
    """Obtener estructura de una tabla"""
    cursor.execute(f"""
        SELECT
            column_name,
            data_type,
            is_nullable,
            column_default,
            ordinal_position
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position
    """)
    return cursor.fetchall()

def get_table_size(cursor, table_name):
    """Obtener tamaño de tabla"""
    cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
    return cursor.fetchone()['count']

def get_primary_keys(cursor, table_name):
    """Obtener PK de tabla"""
    cursor.execute(f"""
        SELECT column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = '{table_name}' AND tc.constraint_type = 'PRIMARY KEY'
    """)
    return [row['column_name'] for row in cursor.fetchall()]

def get_foreign_keys(cursor, table_name):
    """Obtener FKs de tabla"""
    cursor.execute(f"""
        SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name as foreign_table_name,
            ccu.column_name as foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND kcu.table_name = '{table_name}'
    """)
    return cursor.fetchall()

def analyze_table(cursor, table_name):
    """Análisis detallado de una tabla"""
    print(f"\n{'='*100}")
    print(f"📊 TABLA: {table_name.upper()}")
    print(f"{'='*100}")

    # Tamaño
    count = get_table_size(cursor, table_name)
    print(f"\n📈 REGISTROS: {count:,}")

    # Estructura
    print(f"\n🏗️  ESTRUCTURA:")
    structure = get_table_structure(cursor, table_name)
    print(f"{'Columna':<30} {'Tipo':<20} {'NULL':<8} {'Default':<25}")
    print("-" * 85)
    for col in structure:
        nullable = "SÍ" if col['is_nullable'] == 'YES' else "NO"
        default = col['column_default'] or "-"
        print(f"{col['column_name']:<30} {col['data_type']:<20} {nullable:<8} {str(default):<25}")

    # PKs
    pks = get_primary_keys(cursor, table_name)
    if pks:
        print(f"\n🔑 PRIMARY KEYS: {', '.join(pks)}")

    # FKs
    fks = get_foreign_keys(cursor, table_name)
    if fks:
        print(f"\n🔗 FOREIGN KEYS:")
        for fk in fks:
            print(f"   {fk['column_name']} → {fk['foreign_table_name']}({fk['foreign_column_name']})")

    # Sample data
    print(f"\n📋 SAMPLE (primeros 3 registros):")
    cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
    rows = cursor.fetchall()
    if rows:
        for i, row in enumerate(rows, 1):
            print(f"\n   Registro {i}:")
            for key, val in row.items():
                if isinstance(val, str) and len(str(val)) > 60:
                    print(f"      {key}: {str(val)[:60]}...")
                else:
                    print(f"      {key}: {val}")
    else:
        print("   ⚠️  Sin registros")

def analyze_data_integrity(cursor):
    """Análisis de integridad de datos"""
    print(f"\n{'='*100}")
    print(f"🔍 INTEGRIDAD DE DATOS")
    print(f"{'='*100}")

    # 1. Compras sin vinculación
    print(f"\n1️⃣  COMPRAS SIN VINCULACIÓN:")
    cursor.execute("""
        SELECT COUNT(*) as count FROM compras
        WHERE id NOT IN (SELECT compra_id FROM mapeo_vinculacion)
    """)
    unlinked = cursor.fetchone()['count']
    print(f"   {unlinked:,} compras disponibles para vincular")

    # 2. Insumos sin vinculación
    print(f"\n2️⃣  INSUMOS SIN VINCULACIÓN:")
    cursor.execute("""
        SELECT COUNT(DISTINCT codigo_insumo) as count
        FROM insumos
        WHERE codigo_insumo NOT IN (SELECT insumo_nombre FROM mapeo_vinculacion)
    """)
    unlinked_insumos = cursor.fetchone()['count']
    print(f"   {unlinked_insumos:,} insumos sin vincular")

    # 3. Estadísticas de vinculación
    print(f"\n3️⃣  ESTADÍSTICAS DE VINCULACIÓN:")
    cursor.execute("""
        SELECT
            COUNT(DISTINCT insumo_nombre) as total_insumos,
            COUNT(DISTINCT compra_id) as total_compras_vinculadas,
            COUNT(*) as total_relaciones
        FROM mapeo_vinculacion
    """)
    stats = cursor.fetchone()
    print(f"   Insumos vinculados: {stats['total_insumos']:,}")
    print(f"   Compras vinculadas: {stats['total_compras_vinculadas']:,}")
    print(f"   Total relaciones: {stats['total_relaciones']:,}")

    # 4. Validez de cantidades
    print(f"\n4️⃣  VALIDEZ DE CANTIDADES:")
    cursor.execute("""
        SELECT
            SUM(cantidad_und) as total_adquirido,
            AVG(cantidad_und) as promedio_cantidad,
            MAX(cantidad_und) as max_cantidad,
            MIN(cantidad_und) as min_cantidad
        FROM compras
        WHERE cantidad_und IS NOT NULL
    """)
    qty_stats = cursor.fetchone()
    print(f"   Total adquirido: {qty_stats['total_adquirido']:.2f}")
    print(f"   Promedio por compra: {qty_stats['promedio_cantidad']:.2f}")
    print(f"   Máximo: {qty_stats['max_cantidad']:.2f}")
    print(f"   Mínimo: {qty_stats['min_cantidad']:.2f}")

    # 5. Registros NULL
    print(f"\n5️⃣  REGISTROS CON VALORES NULL (Compras):")
    cursor.execute("""
        SELECT
            COUNT(CASE WHEN cantidad_und IS NULL THEN 1 END) as sin_cantidad,
            COUNT(CASE WHEN precio_und IS NULL THEN 1 END) as sin_precio,
            COUNT(CASE WHEN unidad_und IS NULL THEN 1 END) as sin_unidad,
            COUNT(CASE WHEN detalle IS NULL THEN 1 END) as sin_detalle,
            COUNT(CASE WHEN anio IS NULL THEN 1 END) as sin_año
        FROM compras
    """)
    null_stats = cursor.fetchone()
    print(f"   Sin cantidad: {null_stats['sin_cantidad']}")
    print(f"   Sin precio: {null_stats['sin_precio']}")
    print(f"   Sin unidad: {null_stats['sin_unidad']}")
    print(f"   Sin detalle: {null_stats['sin_detalle']}")
    print(f"   Sin año: {null_stats['sin_año']}")

def analyze_relationships(cursor):
    """Análisis de relaciones entre tablas"""
    print(f"\n{'='*100}")
    print(f"🔗 RELACIONES ENTRE TABLAS")
    print(f"{'='*100}")

    # Relación insumos → mapeo_vinculacion
    print(f"\n1️⃣  insumos ↔ mapeo_vinculacion:")
    cursor.execute("""
        SELECT
            COUNT(DISTINCT ir.codigo_insumo) as total_insumos,
            COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN ir.codigo_insumo END) as insumos_vinculados,
            COUNT(DISTINCT CASE WHEN m.id IS NULL THEN ir.codigo_insumo END) as insumos_sin_vincular
        FROM insumos ir
        LEFT JOIN mapeo_vinculacion m ON ir.codigo_insumo = m.insumo_nombre
    """)
    rel = cursor.fetchone()
    print(f"   Total insumos: {rel['total_insumos']:,}")
    print(f"   Vinculados: {rel['insumos_vinculados']:,}")
    print(f"   Sin vincular: {rel['insumos_sin_vincular']:,}")
    print(f"   % Cobertura: {(rel['insumos_vinculados']/rel['total_insumos']*100):.1f}%")

    # Relación compras → mapeo_vinculacion
    print(f"\n2️⃣  compras ↔ mapeo_vinculacion:")
    cursor.execute("""
        SELECT
            COUNT(DISTINCT c.id) as total_compras,
            COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN c.id END) as compras_vinculadas,
            COUNT(DISTINCT CASE WHEN m.id IS NULL THEN c.id END) as compras_sin_vincular
        FROM compras c
        LEFT JOIN mapeo_vinculacion m ON c.id = m.compra_id
    """)
    rel = cursor.fetchone()
    print(f"   Total compras: {rel['total_compras']:,}")
    print(f"   Vinculadas: {rel['compras_vinculadas']:,}")
    print(f"   Sin vincular: {rel['compras_sin_vincular']:,}")
    print(f"   % Cobertura: {(rel['compras_vinculadas']/rel['total_compras']*100):.1f}%")

def analyze_data_quality(cursor):
    """Análisis de calidad de datos"""
    print(f"\n{'='*100}")
    print(f"✅ CALIDAD DE DATOS")
    print(f"{'='*100}")

    # Duplicados en mapeo_vinculacion
    print(f"\n1️⃣  DUPLICADOS EN mapeo_vinculacion:")
    cursor.execute("""
        SELECT codigo_insumo, compra_id, COUNT(*) as cant
        FROM mapeo_vinculacion
        GROUP BY codigo_insumo, compra_id
        HAVING COUNT(*) > 1
    """)
    dupes = cursor.fetchall()
    if dupes:
        print(f"   ⚠️  {len(dupes)} relaciones duplicadas encontradas:")
        for d in dupes[:5]:
            print(f"      {d['codigo_insumo']} → Compra {d['compra_id']} ({d['cant']} veces)")
    else:
        print(f"   ✅ Sin duplicados")

    # Valores negativos en cantidades
    print(f"\n2️⃣  VALORES NEGATIVOS EN CANTIDADES:")
    cursor.execute("""
        SELECT COUNT(*) as count FROM compras WHERE cantidad_und < 0
    """)
    negatives = cursor.fetchone()['count']
    if negatives > 0:
        print(f"   ⚠️  {negatives} compras con cantidad negativa")
    else:
        print(f"   ✅ Sin valores negativos")

    # Consistencia de años
    print(f"\n3️⃣  RANGO DE AÑOS:")
    cursor.execute("""
        SELECT MIN(anio) as min_year, MAX(anio) as max_year, COUNT(DISTINCT anio) as years_count
        FROM compras WHERE anio IS NOT NULL
    """)
    years = cursor.fetchone()
    print(f"   Rango: {years['min_year']} - {years['max_year']}")
    print(f"   Años únicos: {years['years_count']}")

    # Tipos de compra
    print(f"\n4️⃣  TIPOS DE COMPRA:")
    cursor.execute("""
        SELECT tipo_compra, COUNT(*) as count
        FROM compras
        GROUP BY tipo_compra
        ORDER BY count DESC
    """)
    types = cursor.fetchall()
    for t in types:
        print(f"   {t['tipo_compra']}: {t['count']:,}")

def main():
    """Función principal"""
    print("\n" + "="*100)
    print("🔬 DIAGNÓSTICO COMPLETO - ESTRUCTURA DE DATOS")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*100)

    try:
        conn = connect_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Obtener lista de tablas
        cursor.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row['table_name'] for row in cursor.fetchall()]

        print(f"\n📑 TABLAS ENCONTRADAS ({len(tables)}):")
        for table in tables:
            print(f"   - {table}")

        # Analizar cada tabla
        for table in tables:
            analyze_table(cursor, table)

        # Análisis de integridad
        analyze_data_integrity(cursor)

        # Análisis de relaciones
        analyze_relationships(cursor)

        # Análisis de calidad
        analyze_data_quality(cursor)

        # Resumen final
        print(f"\n{'='*100}")
        print(f"📊 RESUMEN FINAL")
        print(f"{'='*100}")
        print(f"\n✅ Diagnóstico completado exitosamente")
        print(f"📁 Tablas analizadas: {len(tables)}")
        print(f"⏰ Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"\n💡 PRÓXIMOS PASOS:")
        print(f"   1. Revisar integridad de datos (NULLs, valores negativos)")
        print(f"   2. Completar vinculaciones faltantes")
        print(f"   3. Validar relaciones entre tablas")
        print(f"   4. Limpiar duplicados si los hay")

        print("\n" + "="*100 + "\n")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        raise

if __name__ == '__main__':
    main()
