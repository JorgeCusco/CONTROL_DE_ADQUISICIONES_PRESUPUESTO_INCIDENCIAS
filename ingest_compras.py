import pandas as pd
from database import get_engine
from sqlalchemy import text
import sys
import numpy as np

def update_schema(engine):
    print("Actualizando esquema de la base de datos...")
    with open('esquema_inicial.sql', 'r', encoding='utf-8') as f:
        schema = f.read()
    with engine.begin() as conn:
        conn.execute(text(schema))

def ingest_compras(file_path):
    print(f"Leyendo archivo de compras: {file_path}")
    try:
        df = pd.read_excel(file_path, sheet_name=0)
    except Exception as e:
        print(f"Error leyendo excel: {e}")
        sys.exit(1)
        
    engine = get_engine()
    
    # Rellenar descripcion (P) hacia abajo si hay vacios por celdas combinadas
    # La columna D es 'DESCRIPCION (P)'
    col_desc_p = 'DESCRIPCION (P)'
    if col_desc_p in df.columns:
        df[col_desc_p] = df[col_desc_p].ffill()
    else:
        print(f"Error: No se encontro la columna {col_desc_p}")
        sys.exit(1)
        
    # Solo importar las filas que realmente tengan datos de compra, es decir, 'CANT (C)' mayor a 0 o que exista 'ORDEN/DOC'
    df_compras = df.dropna(subset=['CANT (C)'])
    
    print(f"Encontradas {len(df_compras)} filas de compras para procesar...")
    
    with engine.begin() as conn:
        # Opcional: limpiar la tabla antes de insertar si queremos que sea idempotente
        conn.execute(text("TRUNCATE TABLE compras RESTART IDENTITY CASCADE;"))
        
        insert_query = text("""
            INSERT INTO compras (
                insumo_descripcion, item_c, anio_c, tipo_c, orden_doc, 
                detalle_compra, unidad_c, cant_c, pu_c, total_c, 
                exp_c, opinion_comentario, observacion, especialidad
            ) VALUES (
                :insumo_desc, :item_c, :anio_c, :tipo_c, :orden_doc, 
                :detalle_compra, :unidad_c, :cant_c, :pu_c, :total_c, 
                :exp_c, :opinion_comentario, :observacion, :especialidad
            )
        """)
        
        for _, row in df_compras.iterrows():
            desc_p = str(row.get('DESCRIPCION (P)', '')).strip()
            
            # Helper to convert to float safely
            def to_float(val):
                try:
                    if pd.isna(val): return 0.0
                    return float(val)
                except:
                    return 0.0
                    
            def to_str(val):
                if pd.isna(val): return None
                return str(val).strip()

            cant_c = to_float(row.get('CANT (C)'))
            if cant_c == 0:
                continue # Skip empty purchases
                
            conn.execute(insert_query, {
                "insumo_desc": desc_p,
                "item_c": to_str(row.get('ITEM (C)')),
                "anio_c": to_str(row.get('AÑO (C)')),
                "tipo_c": to_str(row.get('TIPO (C)')),
                "orden_doc": to_str(row.get('ORDEN/DOC')),
                "detalle_compra": to_str(row.get('DETALLE COMPRA')),
                "unidad_c": to_str(row.get('UNIDAD (C)')),
                "cant_c": cant_c,
                "pu_c": to_float(row.get('PU (C)')),
                "total_c": to_float(row.get('TOTAL (C)')),
                "exp_c": to_str(row.get('EXP. (C)')),
                "opinion_comentario": to_str(row.get('OPINION/COMENTARIO')),
                "observacion": to_str(row.get('OBSERVACION')),
                "especialidad": to_str(row.get('ESPECIALIDAD'))
            })
            
    print("Ingesta de compras completada exitosamente.")

if __name__ == '__main__':
    engine = get_engine()
    update_schema(engine)
    ingest_compras('DATA_INSUMOS_REALIZAR.xlsx')
