import psycopg2
import sys

def run_standardization():
    conn = psycopg2.connect(host='localhost', database='7_insumos_rado', user='postgres', password='Jo.9839514500', port=5432)
    cur = conn.cursor()
    
    try:
        # Iniciar transacción
        cur.execute("BEGIN;")

        print("1. Limpiando espacios invisibles (TRIM)...")
        cur.execute("UPDATE insumos SET descripcion = TRIM(descripcion)")
        cur.execute("UPDATE compras SET insumo_descripcion = TRIM(insumo_descripcion), detalle_compra = TRIM(detalle_compra), orden_doc = TRIM(orden_doc)")

        print("2. Estandarizando UNIDADES en tabla compras...")
        cur.execute("""
            UPDATE compras 
            SET unidad_c = REPLACE(REPLACE(REPLACE(UPPER(unidad_c), '.', ''), '²', '2'), '³', '3'),
                unidad_und = REPLACE(REPLACE(REPLACE(UPPER(unidad_und), '.', ''), '²', '2'), '³', '3')
        """)
        
        print("3. Estandarizando UNIDADES en tabla insumos...")
        cur.execute("""
            UPDATE insumos 
            SET unidad = REPLACE(REPLACE(REPLACE(UPPER(unidad), '.', ''), '²', '2'), '³', '3')
        """)
        
        print("4. Estandarizando UNIDADES en tabla partidas...")
        cur.execute("""
            UPDATE partidas 
            SET unidad = REPLACE(REPLACE(REPLACE(UPPER(unidad), '.', ''), '²', '2'), '³', '3')
        """)
        
        # Unificar sinónimos de unidades en todas las tablas
        sinonimos = {
            'CAJ': 'CJA',
            'SERV': 'SRV',
            'SER': 'SRV',
            'GBL': 'GLB',
            'PZA': 'PZA'
        }
        
        for k, v in sinonimos.items():
            cur.execute(f"UPDATE compras SET unidad_c = '{v}' WHERE unidad_c = '{k}'")
            cur.execute(f"UPDATE compras SET unidad_und = '{v}' WHERE unidad_und = '{k}'")
            cur.execute(f"UPDATE insumos SET unidad = '{v}' WHERE unidad = '{k}'")
            cur.execute(f"UPDATE partidas SET unidad = '{v}' WHERE unidad = '{k}'")

        print("5. Estandarizando registros de Caja Chica...")
        cur.execute("UPDATE compras SET orden_doc = 'CJA.CHI' WHERE tipo_c = 'CJA.CHI'")

        print("6. Normalizando documentos vacíos (NULL a 'S/N')...")
        cur.execute("UPDATE compras SET orden_doc = 'S/N' WHERE (orden_doc IS NULL OR TRIM(orden_doc) = '') AND tipo_c != 'CJA.CHI'")

        # Confirmar cambios
        cur.execute("COMMIT;")
        print("✅ ¡Estandarización completada exitosamente!")
        
    except Exception as e:
        cur.execute("ROLLBACK;")
        print(f"❌ Error durante la estandarización. Se han revertido todos los cambios. Detalle: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_standardization()
