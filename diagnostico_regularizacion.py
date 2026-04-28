#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DIAGNÓSTICO INTEGRAL - Sistema de Regularización Belempampa
Verifica el estado actual de la base de datos y guía próximos pasos
"""

import psycopg2
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

    print("\n" + "="*100)
    print("DIAGNÓSTICO DE REGULARIZACIÓN - Belempampa")
    print("="*100)

    # 1. Integridad de datos
    print("\n[1] ESTADO DE DATOS")
    print("-" * 100)

    cur.execute("SELECT COUNT(*) FROM partidas")
    total_partidas = cur.fetchone()[0]
    print(f"✓ Partidas: {total_partidas} (esperado: 1,134)")

    cur.execute("SELECT COUNT(*) FROM insumos WHERE es_extra = FALSE")
    total_insumos = cur.fetchone()[0]
    print(f"✓ Insumos: {total_insumos} (esperado: 6,216)")

    cur.execute("SELECT COUNT(*) FROM compras")
    total_compras = cur.fetchone()[0]
    print(f"✓ Compras: {total_compras} (esperado: 1,437)")

    cur.execute("SELECT COUNT(*) FROM mapeo_vinculacion")
    total_vinculos = cur.fetchone()[0]
    print(f"✓ Vinculaciones: {total_vinculos} (esperado: ~1,061)")

    cur.execute("SELECT COUNT(*) FROM apus_detallado")
    total_apus = cur.fetchone()[0]
    print(f"✓ APU Detallado: {total_apus} (esperado: 6,216)")

    # 2. Insumos sin vinculación
    print("\n[2] INSUMOS SIN VINCULACIÓN")
    print("-" * 100)

    cur.execute("""
        SELECT COUNT(DISTINCT i.id)
        FROM insumos i
        LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
        WHERE mv.id IS NULL AND i.es_extra = FALSE
    """)
    sin_vincular = cur.fetchone()[0]
    print(f"⚠️  Insumos sin vincular: {sin_vincular}")

    # 3. Compras sin vinculación
    print("\n[3] COMPRAS SIN VINCULACIÓN")
    print("-" * 100)

    cur.execute("""
        SELECT COUNT(DISTINCT c.id)
        FROM compras c
        LEFT JOIN mapeo_vinculacion mv ON mv.compra_id = c.id
        WHERE mv.id IS NULL
    """)
    compras_sin_vincular = cur.fetchone()[0]
    print(f"⚠️  Compras sin vincular: {compras_sin_vincular}")

    # 4. Cálculos de meta vs. adquirido
    print("\n[4] CUADRE META vs. ADQUIRIDO")
    print("-" * 100)

    cur.execute("""
        SELECT
            SUM(cantidad_modificada) as meta_total,
            (SELECT COALESCE(SUM(cantidad_und), 0) FROM compras) as adquirido_total
    """)
    meta, adquirido = cur.fetchone()
    if meta and adquirido:
        diferencia = meta - adquirido
        pct = (adquirido / meta * 100) if meta > 0 else 0
        print(f"Meta Global:    {meta:,.2f}")
        print(f"Adquirido:      {adquirido:,.2f}")
        print(f"Diferencia:     {diferencia:,.2f} ({pct:.1f}%)")
    else:
        print("⚠️  No hay datos de cantidades en insumos o compras")

    # 5. Historial de cambios
    print("\n[5] AUDITORÍA - CAMBIOS REGISTRADOS")
    print("-" * 100)

    cur.execute("SELECT COUNT(*) FROM historial_cambios")
    total_cambios = cur.fetchone()[0]
    print(f"Total cambios registrados: {total_cambios}")

    cur.execute("""
        SELECT usuario, COUNT(*) as cambios
        FROM historial_cambios
        GROUP BY usuario
        ORDER BY cambios DESC
        LIMIT 5
    """)
    print("\nTop 5 usuarios que hicieron cambios:")
    for usuario, cambios in cur.fetchall():
        print(f"  • {usuario}: {cambios} cambios")

    # 6. Ejemplos de partidas
    print("\n[6] EJEMPLOS DE PARTIDAS CON INSUMOS")
    print("-" * 100)

    cur.execute("""
        SELECT
            p.codigo,
            p.descripcion,
            COUNT(i.id) as qty_insumos,
            SUM(i.cantidad_modificada) as cantidad_total
        FROM partidas p
        LEFT JOIN insumos i ON i.codigo_partida = p.codigo AND i.es_extra = FALSE
        GROUP BY p.codigo, p.descripcion
        ORDER BY qty_insumos DESC
        LIMIT 3
    """)
    for codigo, desc, qty, cant in cur.fetchall():
        print(f"  {codigo}: {desc[:60]}")
        print(f"     └─ {qty} insumos | cantidad total: {cant or 0}")

    # 7. Resumen de discrepancias
    print("\n[7] INSUMOS CON MAYOR DISCREPANCIA")
    print("-" * 100)

    cur.execute("""
        SELECT
            i.codigo_partida,
            i.descripcion,
            SUM(i.cantidad_modificada) as presupuestado,
            COALESCE(SUM(c.cantidad_und), 0) as adquirido,
            SUM(i.cantidad_modificada) - COALESCE(SUM(c.cantidad_und), 0) as diferencia
        FROM insumos i
        LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
        LEFT JOIN compras c ON c.id = mv.compra_id
        WHERE i.es_extra = FALSE
        GROUP BY i.codigo_partida, i.descripcion
        HAVING ABS(SUM(i.cantidad_modificada) - COALESCE(SUM(c.cantidad_und), 0)) > 0
        ORDER BY ABS(diferencia) DESC
        LIMIT 5
    """)

    discrepancias = cur.fetchall()
    if discrepancias:
        for cod, desc, presu, adquir, difer in discrepancias:
            print(f"  {desc[:50]}")
            print(f"     Presupuestado: {presu:,.2f} | Adquirido: {adquir:,.2f} | Diferencia: {difer:,.2f}")
    else:
        print("  ✓ No hay discrepancias detectable (todos cuadran)")

    # 8. Recomendaciones
    print("\n[8] RECOMENDACIONES PARA REGULARIZACIÓN")
    print("-" * 100)

    recommendations = []

    if total_partidas != 1134:
        recommendations.append(f"1. CRÍTICO: Ejecutar reconstruir_desde_apus.py para cargar 1,134 partidas (hay {total_partidas})")

    if total_insumos != 6216:
        recommendations.append(f"2. CRÍTICO: Los insumos deben ser 6,216 (hay {total_insumos})")

    if sin_vincular > 1000:
        recommendations.append(f"3. IMPORTANTE: {sin_vincular} insumos sin vinculación - usar módulo Vinculador en /vinculador")

    if compras_sin_vincular > 100:
        recommendations.append(f"4. IMPORTANTE: {compras_sin_vincular} compras sin vinculación")

    if total_cambios == 0:
        recommendations.append("5. NOTA: Aún no hay cambios en historial_cambios - cambios se registrarán cuando edites en Control Insumos")

    if recommendations:
        for rec in recommendations:
            print(f"\n  {rec}")
    else:
        print("  ✓ Sistema listo para usar")

    # 9. Scripts a ejecutar
    print("\n[9] SCRIPTS DISPONIBLES")
    print("-" * 100)
    print("""
  Para regularización completa, ejecutar en este orden:

  1. python3 cargar_apus_correctamente.py
     └─ Carga APUS_Extraidos_v2.xlsx → tabla apus_detallado

  2. python3 reconstruir_desde_apus.py
     └─ Reconstruye partidas (1,134) e insumos (6,216) desde APU

  3. python3 actualizar_descripciones_partidas.py
     └─ Actualiza nombres de partidas con datos reales

  4. Usar módulo Vinculador (/vinculador) en la web
     └─ Vincular insumos a compras manualmente

  5. Usar módulo Ajuste Manual (/ajuste-manual)
     └─ Verificar cuadre Meta Global vs. Adquirido

  6. Exportar resultado (botón "Exportar")
     └─ Genera Excel con 4 hojas (APU, Compras, Resumen, Historial)
    """)

    print("\n" + "="*100)
    print("✓ DIAGNÓSTICO COMPLETADO")
    print("="*100 + "\n")

    cur.close()
    conn.close()

except Exception as e:
    print(f"\n❌ ERROR DE CONEXIÓN: {e}")
    print("Verifica: host, database, user, password")
    import traceback
    traceback.print_exc()
