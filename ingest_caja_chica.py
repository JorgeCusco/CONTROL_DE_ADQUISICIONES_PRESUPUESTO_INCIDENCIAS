import pandas as pd
from database import get_engine
from sqlalchemy import text
import sys

def ingest_caja_chica(file_path):
    print(f"Procesando archivo de Caja Chica: {file_path}")
    try:
        # Leer el excel
        df = pd.read_excel(file_path)
        
        print(f"Columnas detectadas: {list(df.columns)}")
        
        engine = get_engine()
        
        with engine.begin() as conn:
            insert_query = text("""
                INSERT INTO compras (
                    insumo_descripcion, detalle_compra, unidad_c, cant_c, pu_c, total_c, orden_doc, tipo_c
                ) VALUES (
                    :insumo_desc, :detalle, :unidad, :cant, :pu, :total, :orden, :tipo
                )
            """)
            
            count = 0
            for index, row in df.iterrows():
                # Mapeo basado en posiciones si los nombres fallan
                # A=0, B=1, C=2, D=3, E=4, G=6
                
                try:
                    insumo_desc = str(row.iloc[0]).strip()
                    if not insumo_desc or insumo_desc == 'nan' or insumo_desc == 'None':
                        continue
                    
                    unidad = str(row.iloc[1]).strip() if not pd.isna(row.iloc[1]) else ""
                    cant = float(row.iloc[2]) if not pd.isna(row.iloc[2]) else 0.0
                    pu = float(row.iloc[3]) if not pd.isna(row.iloc[3]) else 0.0
                    total = float(row.iloc[4]) if not pd.isna(row.iloc[4]) else 0.0
                    
                    # Columna G es el índice 6
                    orden = "CJA.CHI"
                    if len(row) >= 7:
                        val_g = str(row.iloc[6]).strip()
                        if val_g and val_g != 'nan':
                            orden = val_g
                    
                    conn.execute(insert_query, {
                        "insumo_desc": insumo_desc,
                        "detalle": insumo_desc,
                        "unidad": unidad,
                        "cant": cant,
                        "pu": pu,
                        "total": total,
                        "orden": orden,
                        "tipo": "CAJA CHICA"
                    })
                    count += 1
                except Exception as row_err:
                    print(f"Error en fila {index}: {row_err}")
            
        print(f"DONE: Se han añadido {count} registros de Caja Chica.")

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == '__main__':
    ingest_caja_chica('caja_chica_nuevo.xlsx')
