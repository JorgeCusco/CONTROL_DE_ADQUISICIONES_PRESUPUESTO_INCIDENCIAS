import psycopg2
conn = psycopg2.connect(host='localhost', database='7_insumos_rado', user='postgres', password='Jo.9839514500', port=5432)
cur = conn.cursor()

# Get all tables
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = [r[0] for r in cur.fetchall()]

schema_info = "# Estructura de la Base de Datos '7_insumos_rado'\n\n"

for t in tables:
    cur.execute(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}'")
    cols = cur.fetchall()
    schema_info += f"## Tabla: `{t}`\n"
    for c in cols:
        schema_info += f"- `{c[0]}` ({c[1]})\n"
    schema_info += "\n"

# Escribir a un archivo markdown
with open('schema_overview.md', 'w', encoding='utf-8') as f:
    f.write(schema_info)

conn.close()
