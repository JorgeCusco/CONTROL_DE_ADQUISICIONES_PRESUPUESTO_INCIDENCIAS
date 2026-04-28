import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def comprobar_todo():
    print("Iniciando auditoría estricta de solo lectura...\n")
    engine = get_engine()
    
    with engine.connect() as conn:
        # Totales DB (No Caja Chica)
        res_normal = conn.execute(text("SELECT detalle_compra, SUM(cant_c) FROM compras WHERE tipo_c != 'CJA.CHI' OR tipo_c IS NULL GROUP BY detalle_compra")).fetchall()
        db_normal = {str(r[0]).strip(): float(r[1]) for r in res_normal if r[0]}
        
        # Totales DB (Solo Caja Chica)
        res_cja = conn.execute(text("SELECT detalle_compra, SUM(cant_c) FROM compras WHERE tipo_c = 'CJA.CHI' GROUP BY detalle_compra")).fetchall()
        db_cja = {str(r[0]).strip(): float(r[1]) for r in res_cja if r[0]}

    # ---------------------------------------------------------
    # 1. Comparar cantidades.xlsx
    # ---------------------------------------------------------
    print("--- 1. AUDITORÍA: cantidades.xlsx (Órdenes de Compra) ---")
    df_cant = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/cantidades.xlsx', header=1)
    excel_normal = {}
    for _, row in df_cant.iterrows():
        det = str(row['DETALLE COMPRA']).strip()
        if pd.isna(row['DETALLE COMPRA']) or det == 'nan': continue
        try: cant = float(row['USADO'])
        except: cant = 0.0
        if math.isnan(cant): cant = 0.0
        excel_normal[det] = excel_normal.get(det, 0.0) + cant

    dif_normal = 0
    for det, tot_exc in excel_normal.items():
        tot_db = db_normal.get(det, 0.0)
        if round(tot_exc, 4) != round(tot_db, 4):
            print(f"[DIFERENCIA] {det[:60]}...")
            print(f"  -> Excel: {round(tot_exc, 4)} | BD: {round(tot_db, 4)}")
            dif_normal += 1
            
    if dif_normal == 0:
        print("[EXITO TOTAL] Todas las cantidades del archivo coinciden al 100% con la BD.")
    else:
        print(f"[ATENCION] {dif_normal} diferencias encontradas en cantidades.xlsx.")

    # ---------------------------------------------------------
    # 2. Comparar caja_chica_nuevo.xlsx
    # ---------------------------------------------------------
    print("\n--- 2. AUDITORÍA: caja_chica_nuevo.xlsx (Caja Chica) ---")
    df_cja = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/caja_chica_nuevo.xlsx')
    excel_cja = {}
    for _, row in df_cja.iterrows():
        det = str(row.iloc[0]).strip()
        if pd.isna(row.iloc[0]) or det == 'nan': continue
        try: cant = float(row.iloc[2])
        except: cant = 0.0
        if math.isnan(cant): cant = 0.0
        excel_cja[det] = excel_cja.get(det, 0.0) + cant

    dif_cja = 0
    for det, tot_exc in excel_cja.items():
        tot_db = db_cja.get(det, 0.0)
        if round(tot_exc, 4) != round(tot_db, 4):
            print(f"[DIFERENCIA] {det[:60]}...")
            print(f"  -> Excel: {round(tot_exc, 4)} | BD: {round(tot_db, 4)}")
            dif_cja += 1
            
    if dif_cja == 0:
        print("[EXITO TOTAL] Todas las cantidades de Caja Chica coinciden al 100% con la BD.")
    else:
        print(f"[ATENCION] {dif_cja} diferencias encontradas en caja_chica_nuevo.xlsx.")

if __name__ == '__main__':
    comprobar_todo()
