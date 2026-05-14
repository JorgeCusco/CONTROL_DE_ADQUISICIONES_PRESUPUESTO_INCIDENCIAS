import pandas as pd
import requests
import os

SUPABASE_URL = "https://lwuhsendnfwxenoryuzs.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dWhzZW5kbmZ3eGVub3J5dXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM5MzI0MSwiZXhwIjoyMDkyOTY5MjQxfQ.OODwWEpjpmD8erKWsRbNH43cyUrPQuQpkcg_VFx365w"

# Leer el archivo Excel
EXCEL_FILE = "cantidadBD.xlsx"
df = pd.read_excel(EXCEL_FILE)

# Detectar columna insumo (nombre o descripción)
def detectar_columna_insumo(df):
    for col in df.columns:
        if "insumo" in col.lower() or "descripcion" in col.lower():
            return col
    print("No se detectó automáticamente la columna de insumo. Usa la primera columna.")
    return df.columns[0]

col_insumo = detectar_columna_insumo(df)
insumos = df[col_insumo].dropna().unique()

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

resultados = []
for insumo in insumos:
    # Buscar todos los registros que coincidan con el insumo
    url = f"{SUPABASE_URL}/rest/v1/compras_c?{col_insumo}=eq.{insumo}"
    resp = requests.get(url, headers=headers)
    if resp.ok and resp.json():
        for row in resp.json():
            resultados.append({
                "insumo": insumo,
                "id": row.get("id")
            })
    else:
        resultados.append({"insumo": insumo, "id": None})

pd.DataFrame(resultados).to_excel("ids_insumos_compras_c.xlsx", index=False)
print("Archivo ids_insumos_compras_c.xlsx generado.")
