import pandas as pd
from database import get_engine
from sqlalchemy import text

def debug_tornillo():
    print("=== DIAGNÓSTICO DE 'TORNILLO WAFER 8X3/4 P.B' ===\n")
    
    # 1. Buscando en la Base de Datos
    engine = get_engine()
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, detalle_compra, cant_c, tipo_c FROM compras WHERE detalle_compra ILIKE '%TORNILLO WAFER 8X3/4%'")).fetchall()
        print("-> EN LA BASE DE DATOS (Lo que tiene grabado):")
        for r in res:
            print(dict(r._mapping))
            
    print("\n-------------------------------------------------\n")
    
    # 2. Buscando en cantidades.xlsx
    df1 = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/cantidades.xlsx', header=1)
    m1 = df1[df1['DETALLE COMPRA'].astype(str).str.contains('TORNILLO WAFER 8X3/4', case=False, na=False)]
    print("-> EN ARCHIVO cantidades.xlsx (Órdenes normales):")
    if not m1.empty:
        for idx, row in m1.iterrows():
            print(f"Detalle: '{row['DETALLE COMPRA']}' | Cantidad Usada: {row['USADO']}")
    else:
        print("NO SE ENCONTRÓ este material en cantidades.xlsx")
        
    print("\n-------------------------------------------------\n")
    
    # 3. Buscando en caja_chica_nuevo.xlsx
    df2 = pd.read_excel('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/caja_chica_nuevo.xlsx')
    col_name = df2.columns[0]
    m2 = df2[df2[col_name].astype(str).str.contains('TORNILLO WAFER 8X3/4', case=False, na=False)]
    print("-> EN ARCHIVO caja_chica_nuevo.xlsx (Caja Chica):")
    if not m2.empty:
        for idx, row in m2.iterrows():
            print(f"Detalle: '{row[col_name]}' | Cantidad Usada: {row[df2.columns[2]]}")
    else:
        print("NO SE ENCONTRÓ este material en caja_chica_nuevo.xlsx")

if __name__ == '__main__':
    debug_tornillo()
