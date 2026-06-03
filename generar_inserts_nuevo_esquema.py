import pandas as pd
import numpy as np

def clean_numeric(val):
    if pd.isna(val): return 0
    val_str = str(val).strip()
    if val_str in ['-', '', 'nan', 'NaN']: return 0
    # remove commas used for thousands
    val_str = val_str.replace(',', '')
    try:
        return float(val_str)
    except:
        return 0

print("Cargando CSVs...")
partidas = pd.read_csv('DATA_USAR/PARTIDAS_P.csv')
acus = pd.read_csv('DATA_USAR/ACUS_P.csv')
compras = pd.read_csv('DATA_USAR/COMPRAS_C.csv')
insumos = pd.read_csv('DATA_USAR/INSUMOS_P.csv')

print("Generando SQL para partidas_p...")
with open('DATA_USAR/INSERT_partidas_p.sql', 'w', encoding='utf-8') as f:
    f.write("BEGIN TRANSACTION;\n")
    for _, row in partidas.iterrows():
        item = str(row['item']).strip().replace("'", "''")
        desc = str(row['descripcion']).strip().replace("'", "''")
        und = str(row['unidad']).strip()
        cant = clean_numeric(row['cantidad'])
        pu = clean_numeric(row['precio_unitario'])
        tot = clean_numeric(row['total'])
        rend = str(row['rendimiento']).strip().replace("'", "''")
        
        sql = f"INSERT INTO partidas_p (item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p, rendimiento_p) "
        sql += f"VALUES ('{item}', '{desc}', '{und}', {cant}, {pu}, {tot}, '{rend}') ON CONFLICT (item) DO NOTHING;\n"
        f.write(sql)
    f.write("COMMIT;\n")

print("Generando SQL para acus...")
with open('DATA_USAR/INSERT_acus.sql', 'w', encoding='utf-8') as f:
    f.write("BEGIN TRANSACTION;\n")
    for _, row in acus.iterrows():
        item = str(row['item']).strip().replace("'", "''")
        tipo = str(row['tipo']).strip().replace("'", "''")
        cod = str(row['codigo']).strip().replace("'", "''")
        desc = str(row['descripcion_insumo']).strip().replace("'", "''")
        und = str(row['unidad']).strip().replace("'", "''")
        recursos = clean_numeric(row['recursos'])
        cant = clean_numeric(row['cantidad'])
        pu = clean_numeric(row['precio'])
        parcial = clean_numeric(row['parcial'])
        
        sql = f"INSERT INTO acus (item_partida, tipo, codigo_insumo, descripcion_insumo, unidad, recursos, cantidad_p, precio_p, parcial_p, cantidad_c, precio_c, parcial_c) "
        sql += f"VALUES ('{item}', '{tipo}', '{cod}', '{desc}', '{und}', {recursos}, {cant}, {pu}, {parcial}, {cant}, {pu}, {parcial});\n"
        f.write(sql)
    f.write("COMMIT;\n")

print("Generando SQL para compras_c...")
with open('DATA_USAR/INSERT_compras_c.sql', 'w', encoding='utf-8') as f:
    f.write("BEGIN TRANSACTION;\n")
    for _, row in compras.iterrows():
        anio = str(row['anio']).strip().replace("'", "''")
        comp = str(row['componente']).strip().replace("'", "''")
        det = str(row['detalle']).strip().replace("'", "''")
        und = str(row['unidad']).strip().replace("'", "''")
        cant = clean_numeric(row['cantidad'])
        pu = clean_numeric(row['precio_unit'])
        tot = clean_numeric(row['total'])
        tipo = str(row['tipo_compra']).strip().replace("'", "''")
        num = str(row['num_compra']).strip().replace("'", "''")
        comp_str = str(row['completo']).strip().replace("'", "''")
        
        sql = f"INSERT INTO compras_c (anio, componente, detalle, unidad, cantidad_c, precio_unit_c, total_c, tipo_compra, num_compra, completo, unidad_und, cantidad_und, precio_und) "
        sql += f"VALUES ('{anio}', '{comp}', '{det}', '{und}', {cant}, {pu}, {tot}, '{tipo}', '{num}', '{comp_str}', '{und}', {cant}, {pu});\n"
        f.write(sql)
    f.write("COMMIT;\n")

print("Generando SQL para insumos_p...")
with open('DATA_USAR/INSERT_insumos_p.sql', 'w', encoding='utf-8') as f:
    f.write("BEGIN TRANSACTION;\n")
    for _, row in insumos.iterrows():
        cod = str(row['codigo']).strip().replace("'", "''")
        desc = str(row['descripcion']).strip().replace("'", "''")
        und = str(row['unidad']).strip().replace("'", "''")
        cant = clean_numeric(row['cantidad_insumo'])
        costo = clean_numeric(row['costo'])
        tot = clean_numeric(row['total'])
        
        sql = f"INSERT INTO insumos_p (codigo, descripcion, unidad, cantidad_insumo_p, costo_p, total_p) "
        sql += f"VALUES ('{cod}', '{desc}', '{und}', {cant}, {costo}, {tot}) ON CONFLICT (codigo) DO NOTHING;\n"
        f.write(sql)
    f.write("COMMIT;\n")

print("Proceso completado exitosamente.")
