import openpyxl
import psycopg2

def run():
    # Connect to DB using .env values
    conn = psycopg2.connect(
        host='aws-1-us-east-1.pooler.supabase.com',
        database='postgres',
        user='postgres.lwuhsendnfwxenoryuzs',
        password='Jo.9839514500',
        port=6543
    )
    cur = conn.cursor()

    file_path = r'e:\00_OFI_PRESUPUESTOS_progra\7_Insumos_rado\A_MODIFICACIONES_LIQUIDACIONES\ROJOS_ACTUALIZAR_REEMPLAZAR.xlsx'
    print(f"Cargando archivo: {file_path}")
    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb.active

    count_processed = 0

    for idx, row in enumerate(ws.iter_rows(values_only=True), 1):
        if idx == 1 and str(row[0]).strip().upper() in ('ID', 'ITEM', 'ID_COMPRA', 'ID COMPRA'):
            continue
            
        try:
            id_val = row[0]
            if not id_val:
                continue
            
            tipo_compra = str(row[1]).strip() if row[1] is not None else None
            num_compra = str(row[2]).strip() if row[2] is not None else None
            anio = str(row[3]).strip() if row[3] is not None else None
            detalle = str(row[4]).strip() if row[4] is not None else "SIN DETALLE"
            unidad = str(row[5]).strip() if row[5] is not None else "UND"
            
            # Numeric conversions
            try:
                cantidad_c = float(row[6]) if row[6] is not None else 0.0
            except ValueError:
                cantidad_c = 0.0
                
            try:
                precio_unit_c = float(row[7]) if row[7] is not None else 0.0
            except ValueError:
                precio_unit_c = 0.0
                
            total_c = cantidad_c * precio_unit_c  

            # Upsert
            cur.execute("""
                INSERT INTO compras_c (
                    id, anio, detalle, unidad, cantidad_c, precio_unit_c, total_c,
                    tipo_compra, num_compra,
                    unidad_und, cantidad_und, precio_und
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON CONFLICT (id) DO UPDATE SET
                    anio = EXCLUDED.anio,
                    detalle = EXCLUDED.detalle,
                    unidad = EXCLUDED.unidad,
                    cantidad_c = EXCLUDED.cantidad_c,
                    precio_unit_c = EXCLUDED.precio_unit_c,
                    total_c = EXCLUDED.total_c,
                    tipo_compra = EXCLUDED.tipo_compra,
                    num_compra = EXCLUDED.num_compra,
                    unidad_und = EXCLUDED.unidad_und,
                    cantidad_und = EXCLUDED.cantidad_und,
                    precio_und = EXCLUDED.precio_und
            """, (
                int(id_val), anio, detalle, unidad, cantidad_c, precio_unit_c, total_c,
                tipo_compra, num_compra,
                unidad, cantidad_c, precio_unit_c
            ))
            
            count_processed += 1
            
        except Exception as e:
            print(f"?? Error en fila {idx} (ID: {row[0]}): {e}")

    conn.commit()
    print(f"? Exito: Se actualizaron/insertaron {count_processed} filas respetando su ID y sin romper los vinculos.")
    cur.close()
    conn.close()

if __name__ == '__main__':
    run()
