import pandas as pd
import requests
import os

SUPABASE_URL = "https://lwuhsendnfwxenoryuzs.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dWhzZW5kbmZ3eGVub3J5dXpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM5MzI0MSwiZXhwIjoyMDkyOTY5MjQxfQ.OODwWEpjpmD8erKWsRbNH43cyUrPQuQpkcg_VFx365w"

# Leer el archivo Excel
EXCEL_FILE = "cantidadBD.xlsx"
df = pd.read_excel(EXCEL_FILE)

# Detectar clave primaria

def detectar_clave_primaria(df):
    for col in df.columns:
        if col.lower() in ["id", "compra_id", "pk", "uuid"]:
            return col
    print("No se detectó automáticamente la clave primaria. Usa la primera columna.")
    return df.columns[0]

# Verificación y actualización batch por batch
def verificar_y_actualizar_batch(df, table_name, pk, batch_size=100):
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    total = len(df)
    resultados = []
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        for _, row in batch.iterrows():
            pk_value = row[pk]
            cantidad_bd = row.get("cantidadBD")
            # Obtener valores actuales
            url_get = f"{SUPABASE_URL}/rest/v1/{table_name}?{pk}=eq.{pk_value}"
            resp_get = requests.get(url_get, headers=headers)
            actual = resp_get.json()[0] if resp_get.ok and resp_get.json() else {}
            # Guardar antes de actualizar
            resultados.append({
                pk: pk_value,
                "cantidad_c_antes": actual.get("cantidad_c"),
                "cantidad_und_antes": actual.get("cantidad_und"),
                "cantidadBD_excel": cantidad_bd
            })
            # Actualizar si es necesario
            update_data = {}
            if not pd.isna(cantidad_bd):
                update_data["cantidad_c"] = float(cantidad_bd)
                update_data["cantidad_und"] = float(cantidad_bd)
            if update_data:
                resp_patch = requests.patch(url_get, headers=headers, json=update_data)
                if not resp_patch.ok:
                    print(f"Error actualizando {pk}={pk_value}: {resp_patch.text}")
        print(f"Batch {i//batch_size+1} procesado")
    # Verificar después de actualizar
    for r in resultados:
        pk_value = r[pk]
        url_get = f"{SUPABASE_URL}/rest/v1/{table_name}?{pk}=eq.{pk_value}"
        resp_get = requests.get(url_get, headers=headers)
        actual = resp_get.json()[0] if resp_get.ok and resp_get.json() else {}
        r["cantidad_c_despues"] = actual.get("cantidad_c")
        r["cantidad_und_despues"] = actual.get("cantidad_und")
    # Guardar reporte
    pd.DataFrame(resultados).to_excel("verificacion_rigurosa_resultados.xlsx", index=False)
    print("Archivo verificacion_rigurosa_resultados.xlsx generado.")

if __name__ == "__main__":
    table_name = "compras_c"
    pk = detectar_clave_primaria(df)
    verificar_y_actualizar_batch(df, table_name, pk)
    print("Proceso de verificación y actualización completado.")
