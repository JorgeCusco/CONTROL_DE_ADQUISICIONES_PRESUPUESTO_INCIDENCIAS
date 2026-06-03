import pandas as pd

# 1. Leer APUS_INSUMOS_ESTRUCTURADO.csv
try:
    apus = pd.read_csv('APUS_INSUMOS_ESTRUCTURADO.csv')
    # Normalizar descripcion: mayúsculas, sin espacios al inicio/fin, primeros 100 chars
    apus['desc_norm'] = apus['Insumo_Descripcion'].astype(str).str.upper().str.strip().str.slice(0, 100)
    
    # Insumos únicos en APU
    apus_unique = apus.groupby('desc_norm').agg({
        'Insumo_Codigo': 'first',
        'Insumo_Descripcion': 'first',
        'Insumo_Unidad': 'first',
        'Partida_Codigo': 'nunique'
    }).rename(columns={'Partida_Codigo': 'partidas_count'}).reset_index()
    
    apus_dict = apus_unique.set_index('desc_norm').to_dict('index')
except Exception as e:
    print("Error reading APU:", e)
    apus_dict = {}

# 2. Leer LISTA_INSUMOS.xls
try:
    lista = pd.read_excel('LISTA_INSUMOS.xls')
    # Limpiar filas donde 'Código' es NaN pero tienen algo, o donde 'Descripción' es nulo
    lista = lista.dropna(subset=['Descripción'])
    lista = lista[~lista['Descripción'].isin(['MANO DE OBRA', 'MATERIALES', 'EQUIPOS', 'EQUIPO', 'SUBCONTRATOS'])]
    
    lista['desc_norm'] = lista['Descripción'].astype(str).str.upper().str.strip().str.slice(0, 100)
    
    lista = lista.drop_duplicates(subset=['desc_norm'])
    lista_dict = lista.set_index('desc_norm').to_dict('index')
except Exception as e:
    print("Error reading LISTA:", e)
    lista_dict = {}

# 3. Comparar
con_cobertura = []
solo_en_lista = []
solo_en_apu = []

# Insumos en LISTA
for desc_norm, data in lista_dict.items():
    if desc_norm in apus_dict:
        con_cobertura.append({
            'codigo': data.get('Código', ''),
            'descripcion': data.get('Descripción', ''),
            'partidas_count': apus_dict[desc_norm]['partidas_count']
        })
    else:
        solo_en_lista.append({
            'codigo': data.get('Código', ''),
            'descripcion': data.get('Descripción', '')
        })

# Insumos en APU
for desc_norm, data in apus_dict.items():
    if desc_norm not in lista_dict:
        solo_en_apu.append({
            'codigo': data.get('Insumo_Codigo', ''),
            'descripcion': data.get('Insumo_Descripcion', ''),
            'partidas_count': data.get('partidas_count', 0)
        })

# 4. Generar Reporte MD
with open('Analisis_Cobertura_Insumos.md', 'w', encoding='utf-8') as f:
    f.write("# Análisis de Cobertura de Insumos vs Partidas (APU)\n\n")
    f.write("Este informe compara los insumos declarados en tu `LISTA_INSUMOS.xls` con los insumos requeridos por las partidas según `APUS_INSUMOS_ESTRUCTURADO.csv`.\n\n")
    
    f.write("## 📊 Resumen Ejecutivo\n")
    f.write(f"- **Total Insumos en LISTA_INSUMOS.xls:** {len(lista_dict)}\n")
    f.write(f"- **Total Insumos requeridos por las Partidas (APUs):** {len(apus_dict)}\n")
    f.write(f"- **Insumos emparejados (En lista y en APU):** {len(con_cobertura)}\n")
    
    cobertura_pct = (len(con_cobertura) / len(lista_dict) * 100) if len(lista_dict) > 0 else 0
    f.write(f"- **Cobertura de la lista:** {cobertura_pct:.1f}%\n\n")
    
    f.write("## ⚠️ Insumos Faltantes (Solo en APU)\n")
    f.write(f"Hay **{len(solo_en_apu)}** insumos que son requeridos por las partidas, pero **NO** están en tu hoja `LISTA_INSUMOS.xls`.\n")
    if len(solo_en_apu) > 0:
        f.write("| Código | Descripción | Cantidad de Partidas que lo usan |\n")
        f.write("|---|---|---|\n")
        # Sort by number of partidas descending
        solo_en_apu.sort(key=lambda x: x['partidas_count'], reverse=True)
        for item in solo_en_apu[:100]: # limit to 100 to avoid huge file
            f.write(f"| {item['codigo']} | {item['descripcion']} | {item['partidas_count']} |\n")
        if len(solo_en_apu) > 100:
            f.write(f"| ... | *Y {len(solo_en_apu)-100} insumos más* | ... |\n")
            
    f.write("\n## 🔍 Insumos Sobrantes (Solo en LISTA)\n")
    f.write(f"Hay **{len(solo_en_lista)}** insumos en tu `LISTA_INSUMOS.xls` que **NO** son requeridos por ninguna partida en los APUs.\n")
    if len(solo_en_lista) > 0:
        f.write("| Código | Descripción |\n")
        f.write("|---|---|\n")
        for item in solo_en_lista[:100]:
            f.write(f"| {item['codigo']} | {item['descripcion']} |\n")
        if len(solo_en_lista) > 100:
            f.write(f"| ... | *Y {len(solo_en_lista)-100} insumos más* |\n")

print("Analysis generated in Analisis_Cobertura_Insumos.md")
