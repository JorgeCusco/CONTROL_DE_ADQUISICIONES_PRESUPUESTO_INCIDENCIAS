import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def fix_huerfanos():
    print("Iniciando corrección de los 107 huérfanos (incluyendo Tornillos)...\n")
    engine = get_engine()
    
    with engine.begin() as conn:
        # Tomamos TODOS los registros de la primera carga (IDs <= 1061) que se hayan quedado en 0
        res = conn.execute(text("""
            SELECT id, detalle_compra 
            FROM compras 
            WHERE id <= 1061 AND cant_c = 0 
            ORDER BY id
        """)).fetchall()
        
        db_items = {}
        for r in res:
            det = str(r[1]).strip()
            if det not in db_items: db_items[det] = []
            db_items[det].append(r[0])
            
        df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/cantidades.xlsx', header=1)
        updated = 0
        
        for idx, row in df.iterrows():
            det = str(row['DETALLE COMPRA']).strip()
            if pd.isna(row['DETALLE COMPRA']) or det == 'nan': continue
            
            if det in db_items and len(db_items[det]) > 0:
                try: cant = float(row['USADO'])
                except: cant = 0.0
                if math.isnan(cant): cant = 0.0
                
                compra_id = db_items[det].pop(0)
                conn.execute(text("UPDATE compras SET cant_c = :cant WHERE id = :id"), {"cant": cant, "id": compra_id})
                updated += 1
                
        print(f"¡CORRECCIÓN EXITOSA! Se emparejaron {updated} registros que estaban en cero.")

if __name__ == '__main__':
    fix_huerfanos()
