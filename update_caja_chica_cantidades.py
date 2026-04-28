import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def update_caja_chica_cantidades():
    print("Leyendo cantidades de caja_chica_nuevo.xlsx...")
    df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/caja_chica_nuevo.xlsx')
    engine = get_engine()
    
    updated_count = 0
    not_found = []
    
    with engine.begin() as conn:
        for idx, row in df.iterrows():
            # Columna A (0) es la descripción/detalle, Columna C (2) es la cantidad
            detalle = str(row.iloc[0]).strip()
            if pd.isna(row.iloc[0]) or not detalle or detalle == 'nan':
                continue
                
            try:
                cant = float(row.iloc[2])
                if math.isnan(cant): cant = 0.0
            except:
                cant = 0.0
                
            # Actualizamos basándonos en el detalle y asegurando que sea de tipo Caja Chica
            res = conn.execute(text("""
                UPDATE compras 
                SET cant_c = :cant 
                WHERE detalle_compra = :detalle
                  AND tipo_c = 'CJA.CHI'
            """), {"cant": cant, "detalle": detalle})
            
            if res.rowcount == 0:
                not_found.append(detalle)
            else:
                updated_count += res.rowcount
                
    print("\n[REPORTE CAJA CHICA]")
    print(f"Total de registros actualizados: {updated_count}")
    
    if not_found:
        print(f"\nNo se encontraron {len(not_found)} registros:")
        for nf in not_found[:10]:
            print(f"- {nf[:70]}...")

if __name__ == '__main__':
    update_caja_chica_cantidades()
