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

def migrate_nueva_data(file_path):
    print("Iniciando migración desde el nuevo archivo de datos...")
    df = pd.read_excel(file_path)
    engine = get_engine()
    
    insumos_creados = set()
    compras_insertadas = 0
    vinculos_creados = 0
    
    with engine.begin() as conn:
        for idx, row in df.iterrows():
            # 1. Datos del Insumo (Lado Izquierdo)
            codigo_partida = clean_val(row['CODIGO'])
            if codigo_partida and codigo_partida.endswith('.0'):
                codigo_partida = codigo_partida[:-2] # Limpiar .0 de codigos numericos
                
            descripcion = clean_val(row['DESCRIPCION (P)'])
            if not descripcion:
                continue # Sin descripcion no podemos vincular nada
                
            unidad_p = clean_val(row['UNIDAD (P)'])
            if not unidad_p: unidad_p = 'und'
            cantidad_p = clean_float(row['CANTIDAD (P)'])
            precio_p = clean_float(row['COSTO (P)'])
            
            # Insertar insumo si no existe en la partida actual
            insumo_key = f"{descripcion}_{codigo_partida}"
            if insumo_key not in insumos_creados:
                # Nos aseguramos de que haya una partida (creamos una ficticia si no existe)
                if codigo_partida:
                    conn.execute(text("""
                        INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo)
                        VALUES (:cod, 'PARTIDA IMPORTADA', 'und', 1.0)
                        ON CONFLICT (codigo) DO NOTHING
                    """), {"cod": codigo_partida})
                
                # Insertamos el insumo
                conn.execute(text("""
                    INSERT INTO insumos (
                        codigo_partida, item_1, codigo_insumo, descripcion, unidad, 
                        incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida
                    ) VALUES (
                        :cod_partida, '0', '0', :desc, :unidad,
                        :cant, :parcial, :cant, :cant, 0
                    )
                """), {
                    "cod_partida": codigo_partida if codigo_partida else '0',
                    "desc": descripcion,
                    "unidad": unidad_p,
                    "cant": cantidad_p,
                    "parcial": cantidad_p * precio_p
                })
                insumos_creados.add(insumo_key)
            
            # 2. Datos de la Compra (Lado Derecho)
            detalle_compra = clean_val(row['DETALLE COMPRA'])
            orden_doc = clean_val(row['ORDEN/DOC'])
            
            if detalle_compra or orden_doc:
                # Es una compra válida
                tipo_c = clean_val(row['TIPO (C)'])
                anio_c = clean_val(row[df.columns[9]]) # Usar índice para "AÑO (C)"
                if anio_c and anio_c.endswith('.0'): anio_c = anio_c[:-2]
                
                unidad_c = clean_val(row['UNIDAD (C)'])
                # Leer directamente de CANTIDAD USADA (W), PU (X) y TOTAL (Y)
                cant_c = clean_float(row.iloc[22]) 
                pu_c = clean_float(row.iloc[23])
                total_c = clean_float(row.iloc[24])
                
                opinion = clean_val(row['OPINION/COMENTARIO'])
                observacion = clean_val(row['OBSERVACION'])
                
                # Insertar la compra
                res = conn.execute(text("""
                    INSERT INTO compras (
                        orden_doc, detalle_compra, tipo_c, anio_c, insumo_descripcion, 
                        unidad_c, cant_c, pu_c, total_c, observacion, opinion_comentario
                    ) VALUES (
                        :orden, :detalle, :tipo, :anio, :insumo_desc,
                        :unidad, :cant, :pu, :total, :obs, :opi
                    ) RETURNING id
                """), {
                    "orden": orden_doc, "detalle": detalle_compra, "tipo": tipo_c, "anio": anio_c,
                    "insumo_desc": descripcion, "unidad": unidad_c, "cant": cant_c,
                    "pu": pu_c, "total": total_c, "obs": observacion, "opi": opinion
                })
                compra_id = res.scalar()
                compras_insertadas += 1
                
                # 3. CREAR EL VÍNCULO AUTOMÁTICO
                conn.execute(text("""
                    INSERT INTO mapeo_vinculacion (insumo_nombre, compra_id, usuario)
                    VALUES (:insumo_nombre, :compra_id, 'IMPORTACION_MASIVA')
                    ON CONFLICT DO NOTHING
                """), {
                    "insumo_nombre": descripcion,
                    "compra_id": compra_id
                })
                vinculos_creados += 1
                
        print(f"Migración completada.")
        print(f"- Insumos únicos creados: {len(insumos_creados)}")
        print(f"- Compras insertadas: {compras_insertadas}")
        print(f"- Vínculos automáticos creados: {vinculos_creados}")

if __name__ == '__main__':
    migrate_nueva_data('e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/NUEVA_DATA.xlsx')
