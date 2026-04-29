# 📊 Flujo de Trabajo: Subida e Inserción de Datos

Este documento describe cómo subirás archivos y yo analizaré e insertaré los datos en Supabase.

## 🔄 Proceso General

1. **Tú subes un archivo** (CSV o Excel) al chat o indicándome su ruta
2. **Yo analizo la estructura** con el script `data-analyzer.js`
3. **Me muestras dónde va cada columna** (qué tabla, qué columnas)
4. **Yo inserto automáticamente** con `insert-data.js` usando transacciones

## 🛠️ Herramientas Disponibles

### 1. Analizar datos: `data-analyzer.js`

```bash
node data-analyzer.js <archivo.csv|archivo.xlsx>
```

**Output:**
- Listado de columnas con tipos inferidos (integer, decimal, text, date, boolean)
- Primeras 20 filas en formato tabla
- Conteo de valores no-nulos por columna

**Ejemplo:**
```bash
node data-analyzer.js compras_marzo.csv
```

### 2. Listar tablas: `insert-data.js tables`

```bash
node insert-data.js tables
```

Muestra todas las tablas de la BD, sus columnas y tipos de datos.

### 3. Probar conexión: `insert-data.js test`

```bash
node insert-data.js test
```

Verifica que la conexión a Supabase está activa.

### 4. Insertar datos: `insert-data.js insert`

```bash
node insert-data.js insert <archivo> <tabla> [mapping.json]
```

**Parámetros:**
- `<archivo>`: CSV o XLSX con los datos
- `<tabla>`: Nombre de la tabla destino (ej: `compras`, `partidas`, `insumos`)
- `[mapping.json]` (opcional): Archivo JSON con mapeo personalizado

**Comportamiento:**
- Si no das mapping.json, hace auto-mapeo por coincidencia de nombres
- Muestra el mapeo propuesto
- Pide confirmación antes de insertar
- Usa transacción (todo o nada)

**Ejemplo:**
```bash
node insert-data.js insert nuevas_compras.xlsx compras
```

## 📋 Tablas Disponibles

Las tablas principales del proyecto son:
- **partidas** - Partidas del presupuesto
- **insumos** - Insumos por partida
- **compras** - Órdenes de compra
- **apus_detallado** - APUs con rendimiento
- **historial_cambios** - Audit trail

## 🎯 Tu Flujo de Trabajo

### Cuando tengas datos nuevos:

```
1. "Analiza esto: [archivo o ruta]"
   → Yo corro: node data-analyzer.js <archivo>
   → Muestro estructura y primeras 20 filas

2. "Inserta esto en [tabla]"
   → Yo propongo mapeo
   → Pido confirmación
   → Inserto en transacción
   → Reporte de cuántas filas insertadas
```

### Ejemplo conversación:

**Tú:** "Tengo compras_abril.xlsx, analiza la estructura"

**Yo:** Corro analyzer, muestro:
```
Columnas (8):
  1. "Proveedor" [text] - 45/45 valores
  2. "Insumo" [text] - 45/45 valores
  3. "Cantidad" [decimal] - 45/45 valores
  ...
Primeras 20 filas: [tabla]
```

**Tú:** "Inserta en tabla compras, mapea Insumo → insumo_descripcion, Cantidad → cant_c"

**Yo:** 
```bash
node insert-data.js insert compras_abril.xlsx compras mapping.json
```

Luego de confirmar:
```
✅ 45 filas insertadas en compras
```

## 🔐 Seguridad

- Las credenciales vienen de `.env` (nunca en plaintext en código)
- Todas las inserciones usan prepared statements (sin SQL injection)
- Las transacciones garantizan integridad (rollback automático si hay error)
- El historial_cambios registra quién cambió qué y cuándo

## 🚨 Troubleshooting

**Error: "archivo no encontrado"**
- Verifica la ruta absoluta o relativa del archivo

**Error: "tabla no existe"**
- Corre `node insert-data.js tables` para ver las tablas disponibles

**Error: "tipos de datos no coinciden"**
- Usa un mapping.json personalizado para especificar conversiones
- Ej: una columna Excel string se puede convertir a número

**Error: "constraint violation"**
- Hay una restricción única o foreign key que se viola
- Verifica que los datos son válidos (no duplicados, IDs existen)

## 📝 Mapeo Personalizado (mapping.json)

Si el auto-mapeo no funciona, crea un archivo JSON:

```json
{
  "insumo_descripcion": 1,
  "cant_c": 2,
  "pu_c": 3,
  "unidad_c": 0
}
```

Donde la clave es la columna de la BD y el valor es el índice (0-based) del archivo.

---

**Listo. Ahora puedes empezar a subir archivos y dejaré que haga todo el trabajo! 🚀**
