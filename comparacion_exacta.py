import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def comparacion_exacta():
    # 1. Leer totales de compras desde la BD sin cruzar tablas
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("""
            SELECT insumo_descripcion, SUM(cant_c) 
            FROM compras 
            GROUP BY insumo_descripcion
        """)).fetchall()
        db_totals = {str(r[0]).strip(): float(r[1]) for r in res if r[0]}
        
    # 2. Leer totales del Excel original
    df = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/NUEVA_DATA.xlsx')
    excel_totals = {}
    for idx, row in df.iterrows():
        if pd.isna(row['DESCRIPCION (P)']): continue
        desc = str(row['DESCRIPCION (P)']).strip()
        
        try:
            cant_usada = float(row.iloc[22])
            if math.isnan(cant_usada): cant_usada = 0.0
        except:
            cant_usada = 0.0
            
        if desc not in excel_totals:
            excel_totals[desc] = 0.0
        excel_totals[desc] += cant_usada
        
    # 3. Comparar directamente
    diferencias = 0
    print(f"Comparando {len(excel_totals)} insumos...\n")
    
    for desc, total_excel in excel_totals.items():
        total_db = db_totals.get(desc, 0.0)
        
        excel_rounded = round(total_excel, 4)
        db_rounded = round(total_db, 4)
        
        if excel_rounded != db_rounded:
            print(f"[DIFERENCIA] en: {desc[:60]}...")
            print(f"   -> Excel: {excel_rounded}")
            print(f"   -> BD   : {db_rounded}")
            diferencias += 1
            
    if diferencias == 0:
        print("[EXITO TOTAL] TODAS las cantidades en tu Base de Datos cuadran al 100% con tu Excel. Cero diferencias.")
    else:
        print(f"\n[ATENCION] Se encontraron {diferencias} diferencias reales.")

if __name__ == '__main__':
    comparacion_exacta()
