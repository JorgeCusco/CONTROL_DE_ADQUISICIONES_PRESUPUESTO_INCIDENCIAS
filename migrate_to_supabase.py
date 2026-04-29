import os
import subprocess
import sys

local_uri = "postgresql://postgres:Jo.9839514500@localhost:5432/7_insumos_rado"
remote_uri = "postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# Paso 1: Dump (Exportar) solo el esquema público de la BD local
print("Iniciando extraccion de la base de datos local (Esquema publico)...")
dump_cmd = f'"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe" --clean --if-exists --schema=public "{local_uri}" -f local_backup.sql'
try:
    subprocess.run(dump_cmd, shell=True, check=True)
    print("Extraccion completada. Archivo local_backup.sql generado.")
except subprocess.CalledProcessError as e:
    print(f"Error al extraer datos locales: {e}")
    sys.exit(1)

# Paso 2: Restore (Importar) a Supabase
print("Subiendo datos a Supabase. Esto puede tomar unos minutos dependiendo de tu velocidad de subida...")
restore_cmd = f'"C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" "{remote_uri}" -f local_backup.sql'
try:
    subprocess.run(restore_cmd, shell=True, check=True)
    print("Migracion a Supabase completada con exito!")
except subprocess.CalledProcessError as e:
    print(f"Error al restaurar en Supabase: {e}")
    sys.exit(1)
