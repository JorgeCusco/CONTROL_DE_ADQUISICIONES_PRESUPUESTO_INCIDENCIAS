import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def compare_quantities():
    print("Iniciando auditoría de cantidades cruzadas...")
    
    # 1. Leer totales del Excel (Columna W / Índice 22)
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
        
    # 2. Leer totales de la Base de Datos (PostgreSQL)
    engine = get_engine()
    with engine.connect() as conn:
        query = text("""
            SELECT i.descripcion, COALESCE(SUM(c.cant_c), 0) as total_db
            FROM insumos i
            LEFT JOIN mapeo_vinculacion mv ON i.descripcion = mv.insumo_nombre
            LEFT JOIN compras c ON mv.compra_id = c.id
            GROUP BY i.descripcion
        """)
        res = conn.execute(query).fetchall()
        
        db_totals = {}
        for r in res:
            db_totals[str(r[0]).strip()] = float(r[1])
            
    # 3. Comparar y reportar
    diferencias = 0
    print(f"\nAnalizando {len(excel_totals)} partidas/insumos únicos...\n")
    
    for desc, total_excel in excel_totals.items():
        total_db = db_totals.get(desc, 0.0)
        
        # Redondear a 4 decimales para precisión de construcción
        excel_rounded = round(total_excel, 4)
        db_rounded = round(total_db, 4)
        
        if excel_rounded != db_rounded:
            print(f"[DIFERENCIA] en: {desc[:60]}...")
            print(f"   -> Excel: {excel_rounded}")
            print(f"   -> BD   : {db_rounded}")
            diferencias += 1
            
    if diferencias == 0:
        print("[EXITO TOTAL] Todas las cantidades asignadas en la BD cuadran exactamente al 100% con la columna CANTIDAD USADA del Excel.")
    else:
        print(f"\n[FALLO] Se encontraron discrepancias en {diferencias} insumos.")

if __name__ == '__main__':
    compare_quantities()
