import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def update_from_cantidades():
    print("Leyendo cantidades.xlsx...")
    # Saltamos la primera fila porque el encabezado real está en la segunda (header=1)
    df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/cantidades.xlsx', header=1)
    
    engine = get_engine()
    not_found = []
    updated_count = 0
    
    with engine.begin() as conn:
        for idx, row in df.iterrows():
            detalle = str(row['DETALLE COMPRA']).strip()
            if pd.isna(row['DETALLE COMPRA']) or detalle == 'nan':
                continue
                
            try:
                usado = float(row['USADO'])
                if math.isnan(usado): usado = 0.0
            except:
                usado = 0.0
                
            # Actualizamos la compra basándonos estrictamente en el detalle
            res = conn.execute(text("""
                UPDATE compras 
                SET cant_c = :usado 
                WHERE detalle_compra = :detalle
            """), {"usado": usado, "detalle": detalle})
            
            if res.rowcount == 0:
                not_found.append(detalle)
            else:
                updated_count += res.rowcount
                
    print("\n--- REPORTE DE ACTUALIZACIÓN ---")
    print(f"Total registros actualizados en BD: {updated_count}")
    
    if not_found:
        print(f"\n⚠️ No se pudieron encajar {len(not_found)} detalles de compra (no hacen match exacto):")
        for nf in not_found[:15]:
            print(f"- {nf[:70]}...")
        if len(not_found) > 15:
            print(f"... y {len(not_found) - 15} más.")
    else:
        print("\n✅ ¡Éxito Total! Absolutamente todas las descripciones encajaron perfectamente.")

if __name__ == '__main__':
    update_from_cantidades()
