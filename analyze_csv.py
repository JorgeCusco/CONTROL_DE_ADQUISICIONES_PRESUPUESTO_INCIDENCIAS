import pandas as pd

# Load Partidas
try:
    partidas = pd.read_csv('DATA_LAST/PARTIDAS.csv')
    partidas_codigos = set(partidas['codigo'].dropna().unique())
except Exception as e:
    print("Error reading PARTIDAS:", e)
    partidas_codigos = set()
    partidas = pd.DataFrame(columns=['codigo', 'descripcion'])

# Load Insumos from APU
try:
    apus = pd.read_csv('APUS_INSUMOS_ESTRUCTURADO.csv')
    apus_codigos = set(apus['Partida_Codigo'].dropna().unique())
except Exception as e:
    print("Error reading APUS_INSUMOS_ESTRUCTURADO:", e)
    apus_codigos = set()
    apus = pd.DataFrame(columns=['Partida_Codigo', 'Partida_Descripcion'])

faltan_en_apus = partidas_codigos - apus_codigos
faltan_en_partidas = apus_codigos - partidas_codigos

print(f"Total Partidas en 'PARTIDAS.csv': {len(partidas_codigos)}")
print(f"Total partidas en 'APUS_INSUMOS_ESTRUCTURADO.csv': {len(apus_codigos)}")
print(f"Partidas sin Insumos: {len(faltan_en_apus)}")
print(f"Insumos Huérfanos: {len(faltan_en_partidas)}")

# Save to an artifact
with open('analisis_insumos.md', 'w', encoding='utf-8') as f:
    f.write("# Análisis de Insumos vs Partidas\n\n")
    f.write(f"- **Total Partidas en `PARTIDAS.csv`:** {len(partidas_codigos)}\n")
    f.write(f"- **Total Partidas en `APUS_INSUMOS_ESTRUCTURADO.csv`:** {len(apus_codigos)}\n\n")
    
    f.write(f"## Partidas sin Insumos (Están en PARTIDAS pero NO en INSUMOS) ({len(faltan_en_apus)})\n")
    if len(faltan_en_apus) > 0:
        for e in sorted(list(faltan_en_apus)):
            desc_series = partidas[partidas['codigo'] == e]['descripcion']
            desc = desc_series.values[0] if not desc_series.empty else "N/A"
            f.write(f"- `{e}`: {desc}\n")
    else:
        f.write("Ninguna.\n")
        
    f.write(f"\n## Partidas Huérfanas (Están en INSUMOS pero NO en PARTIDAS) ({len(faltan_en_partidas)})\n")
    if len(faltan_en_partidas) > 0:
        for e in sorted(list(faltan_en_partidas)):
            desc_series = apus[apus['Partida_Codigo'] == e]['Partida_Descripcion']
            desc = desc_series.values[0] if not desc_series.empty else "N/A"
            f.write(f"- `{e}`: {desc}\n")
    else:
        f.write("Ninguna.\n")

print("Saved report to analisis_insumos.md")
