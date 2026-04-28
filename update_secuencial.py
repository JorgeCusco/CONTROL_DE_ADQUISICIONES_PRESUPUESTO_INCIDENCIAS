import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def update_secuencial_cantidades():
    print("Iniciando actualización secuencial (1 a 1) para cantidades.xlsx...\n")
    engine = get_engine()
    
    with engine.begin() as conn:
        # 1. Resetear solo las compras normales (no Caja Chica) a 0
        conn.execute(text("UPDATE compras SET cant_c = 0 WHERE tipo_c != 'CJA.CHI' OR tipo_c IS NULL"))
        
        # 2. Traer todas las compras normales ordenadas por ID (orden de inserción)
        res = conn.execute(text("SELECT id, detalle_compra FROM compras WHERE tipo_c != 'CJA.CHI' OR tipo_c IS NULL ORDER BY id")).fetchall()
        
        # 3. Armar un diccionario con "colas" de IDs para cada detalle
        db_items = {}
        for r in res:
            det = str(r[1]).strip()
            if det not in db_items:
                db_items[det] = []
            db_items[det].append(r[0])
            
        # 4. Leer Excel y asignar secuencialmente
        df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/cantidades.xlsx', header=1)
        
        updated = 0
        not_found = []
        
        for idx, row in df.iterrows():
            det = str(row['DETALLE COMPRA']).strip()
            if pd.isna(row['DETALLE COMPRA']) or det == 'nan':
                continue
                
            try: 
                cant = float(row['USADO'])
                if math.isnan(cant): cant = 0.0
            except: 
                cant = 0.0
            
            # Buscar si hay un ID disponible para este detalle
            if det in db_items and len(db_items[det]) > 0:
                # Sacamos el primer ID de la cola para este material (Match 1 a 1)
                compra_id = db_items[det].pop(0) 
                
                conn.execute(text("UPDATE compras SET cant_c = :cant WHERE id = :id"), {"cant": cant, "id": compra_id})
                updated += 1
            else:
                # Si el Excel tiene más copias que la BD, o el nombre no existe
                not_found.append(det)
                
        print("--- REPORTE DEL ALGORITMO SECUENCIAL ---")
        print(f"Total registros enlazados 1 a 1: {updated}")
        
        if not_found:
            print(f"\n[ATENCION] Sobraron {len(not_found)} registros en el Excel que ya no tenian pareja en la BD:")
            for nf in not_found[:10]:
                print(f"- {nf[:70]}...")
        else:
            print("\n[EXITO] Cada fila del Excel encontro su pareja exacta en la Base de Datos sin sobrar ninguna.")

if __name__ == '__main__':
    update_secuencial_cantidades()
