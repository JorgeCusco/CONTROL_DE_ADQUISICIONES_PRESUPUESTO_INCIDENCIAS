import pandas as pd

# Load INSUMOS
insumos_excel = pd.read_excel('DATA_LAST/INSUMOS.xlsx')
# Fix column names to deal with weird characters
insumos_excel.columns = ['codigo', 'descripcion', 'unidad', 'cantidad', 'x1', 'costo', 'x2', 'total']
# Drop rows where descripcion is missing or is just a category header
insumos_excel = insumos_excel.dropna(subset=['descripcion'])
insumos_excel = insumos_excel[~insumos_excel['descripcion'].isin(['MANO DE OBRA', 'MATERIALES', 'EQUIPOS', 'SUBCONTRATOS', 'EQUIPO'])]

# Normalize description
insumos_excel['desc_norm'] = insumos_excel['descripcion'].astype(str).str.upper().str.strip().str.slice(0, 100)
# Group to unique insumos
insumos_list = insumos_excel.groupby('desc_norm').agg({
    'descripcion': 'first',
    'codigo': 'first'
}).reset_index()

# Load APU
apu_csv = pd.read_csv('DATA_LAST/APU_PRESUPUESTO_FINAL.csv')
apu_csv['desc_norm'] = apus_csv_desc = apu_csv['insumo_descripcion'].astype(str).str.upper().str.strip().str.slice(0, 100)

apu_list = apu_csv.groupby('desc_norm').agg({
    'insumo_descripcion': 'first',
    'insumo_codigo': 'first'
}).reset_index()

insumos_keys = set(insumos_list['codigo'].dropna())
apu_keys = set(apu_list['insumo_codigo'].dropna())

intersection = insumos_keys.intersection(apu_keys)
in_excel_not_in_apu = insumos_keys - apu_keys
in_apu_not_in_excel = apu_keys - insumos_keys

with open('resultado2.txt', 'w', encoding='utf-8') as f:
    f.write(f"--- ANÁLISIS REAL POR CÓDIGO ---\n")
    f.write(f"Total Insumos distintos en INSUMOS.xlsx: {len(insumos_keys)}\n")
    f.write(f"Total Insumos distintos en APU_PRESUPUESTO_FINAL.csv: {len(apu_keys)}\n")
    f.write(f"Insumos que coinciden en ambos: {len(intersection)}\n")

    f.write(f"\n[EVALUANDO: ¿Está mi Excel dentro del APU?]\n")
    if len(in_excel_not_in_apu) == 0:
        f.write("SÍ. ¡Todo lo que está en tu Excel se encuentra dentro del APU!\n")
    else:
        f.write(f"NO. Hay {len(in_excel_not_in_apu)} insumos en tu Excel que NO están en los APUs.\n")
        for key in list(in_excel_not_in_apu)[:10]:
            desc = insumos_list[insumos_list['codigo'] == key]['descripcion'].values[0]
            f.write(f"   - [{key}] {desc}\n")

    f.write(f"\n[EVALUANDO: ¿Hay insumos del APU que faltan en tu Excel?]\n")
    if len(in_apu_not_in_excel) == 0:
        f.write("NO. Tu Excel cubre todos los insumos del APU.\n")
    else:
        f.write(f"SÍ. Hay {len(in_apu_not_in_excel)} insumos en tu APU que NO están en el Excel.\n")
        for key in list(in_apu_not_in_excel)[:20]:
            desc = apu_list[apu_list['insumo_codigo'] == key]['insumo_descripcion'].values[0]
            f.write(f"   - [{key}] {desc}\n")

