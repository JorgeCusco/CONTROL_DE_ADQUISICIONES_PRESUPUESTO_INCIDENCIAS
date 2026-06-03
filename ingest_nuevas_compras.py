#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import openpyxl
import psycopg2
import sys

# Configuración de codificación para consola Windows
sys.stdout.reconfigure(encoding='utf-8')

def ingest_compras():
    # Conexión a la base de datos
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='7_insumos_rado',
            user='postgres',
            password='Jo.9839514500',
            port=5432
        )
        cur = conn.cursor()
        print("✅ Conexión a PostgreSQL establecida.")
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        return

    # Cargar el archivo Excel
    excel_file = 'pocos_insumos_colocar.xlsx'
    try:
        wb = openpyxl.load_workbook(excel_file, data_only=True)
        ws = wb.active
        print(f"✅ Archivo '{excel_file}' cargado correctamente.")
    except Exception as e:
        print(f"❌ Error cargando el archivo Excel: {e}")
        conn.close()
        return

    count = 0
    errors = 0

    print("\n🚀 Iniciando ingesta en tabla 'compras'...")

    # Empezamos desde la fila 1 ya que no parece tener encabezados (o los encabezados son datos)
    # Basado en el análisis previo:
    # 0: anio_c
    # 1: item_c
    # 2: tipo_c
    # 13: orden_doc
    # 16: insumo_descripcion
    # 17: unidad_c
    # 18: cant_c
    # 19: pu_c
    # 20: total

    for row in ws.iter_rows(min_row=1, values_only=True):
        try:
            # Extraer valores por índice
            anio_c = row[0]
            item_c = row[1]
            tipo_c = row[23] if len(row) > 23 else "N"  # Columna X
            orden_doc = row[13]
            insumo_desc = row[16]
            unidad_c = row[17]
            cant_c = row[18]
            pu_c = row[19]
            total = row[20]

            # Validar datos mínimos
            if not insumo_desc or not total:
                continue

            # Limpieza y conversión
            anio_val = int(float(anio_c)) if anio_c is not None else 2024
            item_val = str(item_c).strip() if item_c else ""
            tipo_val = str(tipo_c).strip() if tipo_c else "N"
            orden_val = str(orden_doc).strip() if orden_doc else "S/N"
            desc_val = str(insumo_desc).strip()
            und_val = str(unidad_c).strip() if unidad_c else "UND."
            cant_val = float(cant_c) if cant_c is not None else 0
            pu_val = float(pu_c) if pu_c is not None else 0
            total_val = float(total) if total is not None else (cant_val * pu_val)

            # Insertar en la tabla compras
            cur.execute("""
                INSERT INTO compras (
                    anio_c, item_c, tipo_c, orden_doc, 
                    insumo_descripcion, detalle_compra, unidad_c, cant_c, pu_c, total_c,
                    especialidad, unidad_und, cantidad_und, precio_und
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                anio_val, item_val, tipo_val, orden_val,
                "", desc_val, und_val, cant_val, pu_val, total_val,
                'insumos', und_val, cant_val, pu_val
            ))
            count += 1

        except Exception as e:
            print(f"⚠️ Error en fila {count + errors + 1}: {e}")
            errors += 1

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n✨ Ingesta finalizada:")
    print(f"   - Registros insertados: {count}")
    print(f"   - Errores/Omitidos: {errors}")

if __name__ == "__main__":
    ingest_compras()
