import requests
import os
import pandas as pd

SUPABASE_URL = "https://lwuhsendnfwxenoryuzs.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dWhzZW5kbmZ3eGVub3J5dXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM5MzI0MSwiZXhwIjoyMDkyOTY5MjQxfQ.OODwWEpjpmD8erKWsRbNH43cyUrPQuQpkcg_VFx365w"

def detectar_clave_primaria(df):
    for col in df.columns:
        if col.lower() in ["id", "compra_id", "pk", "uuid"]:
            return col
    return df.columns[0]

# Leer el Excel para obtener los PKs a verificar
df = pd.read_excel("cantidadBD.xlsx")
pk = detectar_clave_primaria(df)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

resultados = []
for _, row in df.iterrows():
    pk_value = row[pk]
    url = f"{SUPABASE_URL}/rest/v1/compras_c?{pk}=eq.{pk_value}"
    resp = requests.get(url, headers=headers)
    if resp.ok and resp.json():
        data = resp.json()[0]
        resultados.append({
            pk: pk_value,
            "cantidad_c": data.get("cantidad_c"),
            "cantidad_und": data.get("cantidad_und")
        })
    else:
        resultados.append({pk: pk_value, "cantidad_c": None, "cantidad_und": None})

# Guardar resultados en un Excel
pd.DataFrame(resultados).to_excel("verificacion_resultados.xlsx", index=False)
print("Archivo verificacion_resultados.xlsx generado.")
