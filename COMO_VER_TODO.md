# 👀 CÓMO VER TODO - Guía Completa de Visualización

Este documento te muestra exactamente dónde están todas tus documentaciones, schema, datos y cómo visualizarlos.

---

## 🗂️ PARTE 1: ARCHIVOS Y DOCUMENTACIÓN LOCAL

### Documentación de Regularización

Abre estos archivos en cualquier editor de texto/Markdown:

```
📄 GUIA_SISTEMA_BELEMPAMPA.md
   └─ Guía técnica completa (346 líneas)
   └─ Explica: Propósito, estructura, tablas, workflow, auditoría
   └─ 15 preguntas clave para regularización
   └─ Cálculos y SQL queries

📄 PLAN_REGULARIZACION.md
   └─ Plan de 5 fases con timeline
   └─ Duración estimada: 4 semanas
   └─ Etapas: Datos → Vinculación → Ajuste → Auditoría → Exportación
   └─ Checklist de cumplimiento

📄 CUESTIONARIO_REGULARIZACION.md
   └─ 70+ preguntas de validación
   └─ Organizado en 12 secciones
   └─ Para verificar que obra está regularizada completamente

📄 SISTEMA_BELEMPAMPA.md
   └─ Visión general del proyecto
   └─ Contexto y stakeholders
```

### Documentación de Base de Datos

```
📄 SCHEMA_BD.md
   └─ Esquema detallado de 8 tablas
   └─ Columnas, tipos, relaciones
   └─ Estadísticas por tabla

📄 schema_bd_completo.json
   └─ Esquema en formato JSON
   └─ Importable a otras herramientas
```

### Documentación de Skill

```
📄 .agents/belempampa_skill_guide.md
   └─ Guía completa de la skill
   └─ Estructura de BD documentada
   └─ APIs disponibles
   └─ Scripts de setup
```

### Documentación de Setup

```
📄 CLAUDE.md
   └─ Instrucciones de desarrollo
   └─ Stack tecnológico
   └─ Credenciales y configuración
```

---

## 🌐 PARTE 2: VER DATOS VÍA WEB (Necesita servidor corriendo)

### Iniciar Servidor Dev

```bash
cd frontend
npm install
npm run dev
```

Luego accede a: **http://localhost:3000**

### Páginas Web Disponibles

| URL | Descripción |
|-----|------------|
| `/` | Dashboard principal con links a módulos |
| `/control-insumos` | Editar cantidades por partida |
| `/ajuste-manual` | Cuadre Meta Global vs. Adquirido |
| `/vinculador` | Vincular insumos a compras (EN PROGRESO) |

### APIs Disponibles (en navegador o curl)

#### Ver Schema de BD Completo

```bash
# En navegador:
http://localhost:3000/api/schema

# En terminal (curl):
curl http://localhost:3000/api/schema | jq
```

Respuesta: JSON con estructura de 8 tablas, columnas, FKs, índices

#### Ver Partidas

```bash
http://localhost:3000/api/partidas
```

Devuelve: Lista de 1,134 partidas con sus insumos

#### Ver Insumos Únicos

```bash
http://localhost:3000/api/data
```

Devuelve: 1,431 insumos únicos con unidades

#### Ver Compras

```bash
http://localhost:3000/api/compras
```

Devuelve: 1,437 compras con detalles normalizados

#### Ver Status Vinculaciones

```bash
http://localhost:3000/api/vinculacion?mode=insumos
```

Devuelve: 
- 1,431 insumos
- 696 vinculados ✅
- 735 pendientes ⏳
- Estadísticas de enlaces

#### Ver Compras para un Insumo

```bash
http://localhost:3000/api/vinculacion?insumo=CEMENTO
```

Devuelve: Todas las compras disponibles para ese insumo

---

## 💾 PARTE 3: VER BD DIRECTAMENTE (Requiere PostgreSQL)

### Opción A: psql (línea de comandos)

```bash
psql -h localhost -U postgres -d 7_insumos_rado
```

Dentro de psql, puedes correr queries:

```sql
-- Ver todas las tablas
\dt

-- Ver estructura de una tabla
\d partidas

-- Ver todas las relaciones FK
SELECT constraint_name, table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.KEY_COLUMN_USAGE
WHERE table_name IN ('partidas','insumos','compras','mapeo_vinculacion');

-- Ver cantidad de registros por tabla
SELECT table_name, row_count FROM pg_stat_user_tables;

-- Ver primeras 10 filas de partidas
SELECT * FROM partidas LIMIT 10;

-- Ver todas las partidas con sus insumos
SELECT p.codigo, p.descripcion, COUNT(i.id) as qty_insumos
FROM partidas p
LEFT JOIN insumos i ON i.codigo_partida = p.codigo
GROUP BY p.codigo, p.descripcion
ORDER BY qty_insumos DESC
LIMIT 10;

-- Ver insumos sin vinculación
SELECT DISTINCT i.descripcion
FROM insumos i
LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
WHERE mv.id IS NULL AND i.es_extra = FALSE
LIMIT 20;

-- Ver cuadre Meta vs. Adquirido
SELECT 
    SUM(i.cantidad_modificada) as meta_total,
    (SELECT SUM(cantidad_und) FROM compras) as adquirido_total,
    SUM(i.cantidad_modificada) - (SELECT SUM(cantidad_und) FROM compras) as diferencia
FROM insumos i WHERE es_extra = FALSE;

-- Ver historial de cambios
SELECT * FROM historial_cambios ORDER BY fecha DESC LIMIT 20;
```

### Opción B: DBeaver (GUI)

1. Descarga [DBeaver Community](https://dbeaver.io/)
2. Nueva conexión PostgreSQL:
   - Host: localhost
   - Port: 5432
   - Database: 7_insumos_rado
   - User: postgres
   - Password: Jo.9839514500
3. Navega por tablas, esquemas, datos visualmente

### Opción C: pgAdmin (GUI Web)

Si PostgreSQL incluye pgAdmin:

```bash
http://localhost:5050  # (si está instalado)
```

---

## 📊 PARTE 4: VER ESQUEMA VISUALMENTE

### JSON del Schema

Archivo: `schema_bd_completo.json`

Contiene:
```json
{
  "partidas": {
    "columnas": [...],
    "relaciones": [...],
    "indices": [...],
    "estadisticas": {...}
  },
  "insumos": {...},
  "compras": {...},
  ...
}
```

Puedes abrirlo con:
- Cualquier editor de texto
- **VS Code** + extensión JSON
- **Online JSON Viewer**: https://jsoncrack.com/

### Markdown del Schema

Archivo: `SCHEMA_BD.md`

Contiene tablas que muestran:
- Columnas de cada tabla
- Tipos de datos
- Relaciones FK
- Registros por tabla

---

## 📈 PARTE 5: VER ESTADÍSTICAS Y PROGRESO

### Script de Diagnóstico

```bash
python3 diagnostico_regularizacion.py
```

Muestra:
- Conteo de partidas/insumos/compras
- Insumos sin vinculación (número exacto)
- Compras sin vinculación
- Cuadre Meta vs. Adquirido
- Top usuarios que hicieron cambios
- Discrepancias principales

### Ver Status en tiempo real

```bash
# Ver BD en la terminal
psql -h localhost -U postgres -d 7_insumos_rado -c "
SELECT
  'partidas' as tabla, COUNT(*) as registros FROM partidas
UNION ALL
SELECT 'insumos', COUNT(*) FROM insumos
UNION ALL
SELECT 'compras', COUNT(*) FROM compras
UNION ALL
SELECT 'mapeo_vinculacion', COUNT(*) FROM mapeo_vinculacion
UNION ALL
SELECT 'apus_detallado', COUNT(*) FROM apus_detallado
UNION ALL
SELECT 'historial_cambios', COUNT(*) FROM historial_cambios
;"
```

---

## 🔍 PARTE 6: VER SKILL EN EL ÍNDICE

Archivo: `.agents/skills_index.json`

Contiene:
- Nombre: `belempampa_regularizacion`
- Descripción completa
- Componentes (doc, APIs, scripts, módulos)
- Configuración BD
- Status actual

Puedes abrirlo y ver:
```json
{
  "nombre": "belempampa_regularizacion",
  "version": "1.0.0",
  "bd_config": {
    "nombre": "7_insumos_rado",
    "tablas": 8,
    "registros_totales": 17699
  },
  ...
}
```

---

## 📋 PARTE 7: GUÍA RÁPIDA POR NECESIDAD

### "Quiero ver la estructura de la BD"
1. Abre: `SCHEMA_BD.md` ← Markdown legible
2. O: `schema_bd_completo.json` + editor
3. O: API: `curl http://localhost:3000/api/schema | jq`

### "Quiero saber cuántos insumos quedan sin vincular"
1. Ejecuta: `python3 diagnostico_regularizacion.py`
2. Mira sección: "[2] INSUMOS SIN VINCULACIÓN"
3. O Query SQL: `SELECT COUNT(*) FROM insumos WHERE id NOT IN (SELECT DISTINCT ... FROM mapeo_vinculacion)`

### "Quiero ver todas mis tablas y relaciones"
1. Abre: `GUIA_SISTEMA_BELEMPAMPA.md` sección "ESTRUCTURA DEL SISTEMA"
2. O: `SCHEMA_BD.md`
3. O: DBeaver/pgAdmin

### "Quiero ver qué cambios se hicieron y por quién"
1. Query SQL: `SELECT * FROM historial_cambios ORDER BY fecha DESC;`
2. O: Abre CUESTIONARIO_REGULARIZACION.md sección "[M] Registro de Cambios"

### "Quiero entender el plan de regularización"
1. Lee: `PLAN_REGULARIZACION.md`
2. Tienes: 5 fases claramente documentadas
3. Progreso actual: Fase 2 de 5 (48%)

### "Quiero ver si está listo para certificar"
1. Llena: `CUESTIONARIO_REGULARIZACION.md`
2. Si todos ✅ = Listo para certificar

---

## 🎯 RESUMEN RÁPIDO

| Necesidad | Archivo | Ubicación |
|-----------|---------|-----------|
| Ver schema | SCHEMA_BD.md | Raíz |
| Documentación BD | belempampa_skill_guide.md | .agents/ |
| Plan general | PLAN_REGULARIZACION.md | Raíz |
| Checklist | CUESTIONARIO_REGULARIZACION.md | Raíz |
| Datos vivos | API: /api/schema | Web http://localhost:3000 |
| Datos crudos | psql | Terminal |
| Diagnóstico | diagnostico_regularizacion.py | Terminal |
| Skill meta | skills_index.json | .agents/ |

---

## 🚀 COMANDO ÚNICO PARA VER TODO

```bash
# En una terminal:
echo "=== SKILL ===" && cat .agents/skills_index.json | jq .skills[0] && \
echo -e "\n=== SCHEMA ===" && head -50 SCHEMA_BD.md && \
echo -e "\n=== ESTADO ===" && python3 diagnostico_regularizacion.py 2>/dev/null | head -30
```

---

**¡Toda tu información está centralizada y accesible! 🎯**
