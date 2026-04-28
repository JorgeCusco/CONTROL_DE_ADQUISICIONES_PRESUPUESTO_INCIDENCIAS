import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def update_secuencial_caja_chica():
    print("Iniciando actualización secuencial (1 a 1) para caja_chica_nuevo.xlsx...\n")
    engine = get_engine()
    
    with engine.begin() as conn:
        # 1. Resetear solo las de Caja Chica a 0
        conn.execute(text("UPDATE compras SET cant_c = 0 WHERE tipo_c = 'CJA.CHI'"))
        
        # 2. Cola ordenada por ID
        res = conn.execute(text("SELECT id, detalle_compra FROM compras WHERE tipo_c = 'CJA.CHI' ORDER BY id")).fetchall()
        db_items = {}
        for r in res:
            det = str(r[1]).strip()
            if det not in db_items: db_items[det] = []
            db_items[det].append(r[0])
            
        # 3. Leer Excel Caja Chica
        df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/caja_chica_nuevo.xlsx')
        updated = 0
        not_found = []
        
        for idx, row in df.iterrows():
            det = str(row.iloc[0]).strip()
            if pd.isna(row.iloc[0]) or det == 'nan': continue
            
            try: cant = float(row.iloc[2])
            except: cant = 0.0
            if math.isnan(cant): cant = 0.0
            
            # Buscar en la cola
            if det in db_items and len(db_items[det]) > 0:
                compra_id = db_items[det].pop(0) 
                conn.execute(text("UPDATE compras SET cant_c = :cant WHERE id = :id"), {"cant": cant, "id": compra_id})
                updated += 1
            else:
                not_found.append(det)
                
        print("--- REPORTE DEL ALGORITMO SECUENCIAL CAJA CHICA ---")
        print(f"Total registros enlazados 1 a 1: {updated}")
        
        if not_found:
            print(f"\n[ATENCION] Sobraron {len(not_found)} registros en el Excel:")
            for nf in not_found[:10]:
                print(f"- {nf[:70]}...")
        else:
            print("\n[EXITO] Cada fila del Excel encontro su pareja exacta en la BD de Caja Chica.")

if __name__ == '__main__':
    update_secuencial_caja_chica()
