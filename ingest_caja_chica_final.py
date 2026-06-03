import pandas as pd
from database import get_engine
from sqlalchemy import text
import math

def clean_val(val):
    if pd.isna(val) or val == 'nan':
        return None
    return str(val).strip()

def clean_float(val):
    if pd.isna(val) or val == 'nan':
        return 0.0
    try:
        return float(val)
    except:
        return 0.0

def ingest_caja_chica(file_path):
    print("Iniciando carga de Caja Chica...")
    df = pd.read_excel(file_path)
    engine = get_engine()
    
    compras_insertadas = 0
    
    with engine.begin() as conn:
        for idx, row in df.iterrows():
            # Según tu descripción, las columnas son:
            # 0 (A): insumo_descripcion
            # 1 (B): unidad_und
            # 2 (C): cantidad_c
            # 3 (D): pu_c
            # 4 (E): total_c
            
            insumo_desc = clean_val(row.iloc[0])
            if not insumo_desc: 
                continue # Saltar filas vacías
                
            unidad = clean_val(row.iloc[1])
            cant = clean_float(row.iloc[2])
            pu = clean_float(row.iloc[3])
            total = clean_float(row.iloc[4])
            
            # Insertar directamente en la tabla compras
            conn.execute(text("""
                INSERT INTO compras (
                    orden_doc, detalle_compra, tipo_c, anio_c, insumo_descripcion, 
                    unidad_c, cant_c, pu_c, total_c
                ) VALUES (
                    'CJA.CHI', :detalle, 'CJA.CHI', '2024', :insumo_desc,
                    :unidad, :cant, :pu, :total
                )
            """), {
                "detalle": insumo_desc, # Usamos la descripción como detalle de la compra
                "insumo_desc": insumo_desc,
                "unidad": unidad,
                "cant": cant,
                "pu": pu,
                "total": total
            })
            compras_insertadas += 1
            
    print(f"¡Éxito! Se han cargado {compras_insertadas} registros de Caja Chica a la tabla de compras.")

if __name__ == '__main__':
    ingest_caja_chica('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/caja_chica_nuevo.xlsx')
