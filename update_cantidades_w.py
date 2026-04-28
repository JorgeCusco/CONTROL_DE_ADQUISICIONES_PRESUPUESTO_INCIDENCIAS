import pandas as pd
from database import get_engine
from sqlalchemy import text

def update_cantidades(file_path):
    print("Actualizando cantidades desde la columna W (CANTIDAD USADA)...")
    df = pd.read_excel(file_path)
    engine = get_engine()
    
    actualizados = 0
    
    with engine.begin() as conn:
        for idx, row in df.iterrows():
            orden_doc = str(row['ORDEN/DOC']).strip() if pd.notna(row['ORDEN/DOC']) else None
            detalle = str(row['DETALLE COMPRA']).strip() if pd.notna(row['DETALLE COMPRA']) else None
            
            # Columna W es índice 22 (CANTIDAD USADA)
            # Columna X es índice 23 (PU)
            # Columna Y es índice 24 (TOTAL)
            try:
                cant_usada = float(row.iloc[22]) if pd.notna(row.iloc[22]) else 0.0
                pu_usado = float(row.iloc[23]) if pd.notna(row.iloc[23]) else 0.0
                total_usado = float(row.iloc[24]) if pd.notna(row.iloc[24]) else (cant_usada * pu_usado)
            except:
                cant_usada = 0.0
                total_usado = 0.0
                pu_usado = 0.0
                
            if detalle and orden_doc:
                # Actualizar la compra correspondiente
                res = conn.execute(text("""
                    UPDATE compras 
                    SET cant_c = :cant,
                        total_c = :total,
                        pu_c = CASE WHEN :pu > 0 THEN :pu ELSE pu_c END
                    WHERE orden_doc = :orden 
                      AND detalle_compra = :detalle
                """), {
                    "cant": cant_usada,
                    "total": total_usado,
                    "pu": pu_usado,
                    "orden": orden_doc,
                    "detalle": detalle
                })
                actualizados += res.rowcount
                
    print(f"¡Se han actualizado {actualizados} compras con las CANTIDADES USADAS de la columna W!")

if __name__ == '__main__':
    update_cantidades('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/NUEVA_DATA.xlsx')
