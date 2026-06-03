import pandas as pd
import requests
import os

# Configuración de Supabase
SUPABASE_URL = "https://lwuhsendnfwxenoryuzs.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dWhzZW5kbmZ3eGVub3J5dXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM5MzI0MSwiZXhwIjoyMDkyOTY5MjQxfQ.OODwWEpjpmD8erKWsRbNH43cyUrPQuQpkcg_VFx365w"

# Leer el archivo Excel
EXCEL_FILE = "cantidadBD.xlsx"
df = pd.read_excel(EXCEL_FILE)

# Detectar clave primaria usando la API REST de Supabase (PostgREST no expone metadatos, así que se asume 'id' o se pide al usuario)
def detectar_clave_primaria(df):
    # Intenta detectar una columna tipo id o similar
    for col in df.columns:
        if col.lower() in ["id", "compra_id", "pk", "uuid"]:
            return col
    # Si no encuentra, usa la primera columna
    print("No se detectó automáticamente la clave primaria. Usa la primera columna.")
    return df.columns[0]

def update_batch_rest(df, table_name, pk, batch_size=100):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    total = len(df)
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        for _, row in batch.iterrows():
            pk_value = row[pk]
            cantidad_bd = row.get("cantidadBD")
            update_data = {}
            if not pd.isna(cantidad_bd):
                update_data["cantidad_c"] = float(cantidad_bd)
                update_data["cantidad_und"] = float(cantidad_bd)
            if update_data:
                # Construir URL para update por PK
                url = f"{SUPABASE_URL}/rest/v1/{table_name}?{pk}=eq.{pk_value}"
                resp = requests.patch(url, headers=headers, json=update_data)
                if not resp.ok:
                    print(f"Error actualizando {pk}={pk_value}: {resp.text}")
        print(f"Batch {i//batch_size+1} procesado")

if __name__ == "__main__":
    table_name = "compras_c"
    pk = detectar_clave_primaria(df)
    update_batch_rest(df, table_name, pk)
    print("Actualización completada.")
