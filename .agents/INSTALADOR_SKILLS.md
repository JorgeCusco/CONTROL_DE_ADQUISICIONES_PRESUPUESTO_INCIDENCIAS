# 🔧 INSTALADOR DE SKILLS - Sistema Belempampa

## ¿Qué es una Skill?

Una **Skill** es un módulo especializado que automatiza procesos complejos para Claude. En tu caso, la skill `belempampa_regularizacion` contiene:
- Documentación integral
- Esquema de BD completo
- APIs disponibles
- Scripts de setup
- Módulos frontend

---

## 📍 Ubicación de la Skill

```
tu-proyecto/
└── .agents/
    ├── skills_index.json         ← Índice de todas las skills
    └── belempampa_skill_guide.md ← Tu nueva skill documentada
```

---

## 🔍 Cómo Acceder a la Skill

### Opción 1: Ver en Editor de Texto

**Archivo**: `.agents/belempampa_skill_guide.md`

Abre directamente:
```bash
# En VS Code
code .agents/belempampa_skill_guide.md

# En editor genérico
notepad .agents/belempampa_skill_guide.md
```

Contenido:
- 8 tablas de BD documentadas
- 8 API endpoints
- 5 scripts de setup
- 3 módulos frontend
- Estadísticas actuales

### Opción 2: Ver en Índice de Skills

**Archivo**: `.agents/skills_index.json`

Sección de Belempampa:
```json
{
  "nombre": "belempampa_regularizacion",
  "version": "1.0.0",
  "componentes": {
    "documentacion": [...],
    "api_endpoints": [...],
    "scripts": [...],
    "modulos_frontend": [...]
  },
  "bd_config": {
    "nombre": "7_insumos_rado",
    "tablas": 8,
    "registros_totales": 17699
  }
}
```

---

## 📦 Estructura Completa de la Skill

```
Skill: belempampa_regularizacion
├── Documentación (5 archivos)
│   ├── GUIA_SISTEMA_BELEMPAMPA.md
│   ├── PLAN_REGULARIZACION.md
│   ├── CUESTIONARIO_REGULARIZACION.md
│   ├── SCHEMA_BD.md
│   └── belempampa_skill_guide.md
│
├── Base de Datos (8 tablas)
│   ├── partidas (1,134 registros)
│   ├── insumos (6,216 registros)
│   ├── compras (1,437 registros)
│   ├── mapeo_vinculacion (696 registros)
│   ├── apus_detallado (6,216 registros)
│   ├── historial_cambios (creciente)
│   ├── usuarios (opcional)
│   └── meta_global (1 registro)
│
├── APIs (6 endpoints)
│   ├── GET /api/schema
│   ├── GET /api/partidas
│   ├── GET /api/insumos
│   ├── GET /api/compras
│   ├── GET /api/vinculacion
│   └── GET /api/exportar
│
├── Scripts Python (5 archivos)
│   ├── cargar_apus_correctamente.py
│   ├── reconstruir_desde_apus.py
│   ├── actualizar_descripciones_partidas.py
│   ├── cargar_datos_correctamente.py
│   └── diagnostico_regularizacion.py
│
└── Módulos Frontend (3 páginas)
    ├── /control-insumos
    ├── /ajuste-manual
    └── /vinculador
```

---

## 📊 Información de BD en la Skill

La skill documenta completamente tu BD:

### 1. Estructura de Tablas
```
8 tablas principales
17,699 registros totales
Documentados: columnas, tipos, nullable, defaults
```

### 2. Relaciones (ER Diagram)
```
partidas (1) ──→ (N) insumos
insumos (1) ──→ (N) mapeo_vinculacion
compras (1) ──→ (N) mapeo_vinculacion
apus_detallado (referencia)
```

### 3. Cálculos Principales
```
APU1 (Original) = Incidencia × Metrado
APU2 (Modificado) = Nuevos valores (editable)
Meta Global = Σ(Parcial Modificado)
Adquirido = Σ(Compras vinculadas)
Cuadre = Meta Global - Adquirido
```

### 4. Reglas de Integridad
```
- incidencia_original: INMUTABLE
- parcial_original: INMUTABLE
- cantidad_modificada: EDITABLE
- compras: READONLY
- mapeo_vinculacion: APPEND-ONLY
```

---

## 🚀 Cómo Claude USA la Skill

Cuando menciones palabras clave, Claude activará la skill:

### Activadores Automáticos
```
"analizar base de datos belempampa"
→ Accede a belempampa_skill_guide.md

"ver estructura de insumos"
→ Lee SCHEMA_BD.md

"schema de BD"
→ Consulta schema_bd_completo.json

"plan de regularizacion"
→ Lee PLAN_REGULARIZACION.md

"vinculador de insumos"
→ Entiende /api/vinculacion

"cuestionario de auditoria"
→ Lee CUESTIONARIO_REGULARIZACION.md
```

---

## 🔧 Cómo INSTALAR skills adicionales

Si quieres añadir más skills:

### Paso 1: Crear carpeta
```bash
mkdir .agents/skills/mi_skill_nueva
cd .agents/skills/mi_skill_nueva
```

### Paso 2: Crear estructura
```
mi_skill_nueva/
├── README.md          (documentación)
├── scripts/
│   ├── main.py       (script principal)
│   └── utils.py      (utilidades)
├── data/             (datos si aplica)
└── config.json       (configuración)
```

### Paso 3: Registrar en índice
Edita `.agents/skills_index.json` y añade:

```json
{
  "nombre": "mi_skill_nueva",
  "ruta": ".agents/skills/mi_skill_nueva",
  "activadores": [
    "mi activador 1",
    "mi activador 2"
  ],
  "script_principal": "scripts/main.py",
  "dependencias": ["pandas", "numpy"]
}
```

### Paso 4: Usar la skill
Menciona los activadores en un prompt a Claude.

---

## 📚 Skills Existentes en tu Proyecto

Tu proyecto ya tiene 5 skills instaladas:

1. **optimizacion_metrados** (scipy, numpy)
2. **validador_postgresql** (validación SQL)
3. **validador-streamlit-colaborativo** (tablas interactivas)
4. **exportador-cuadro-osce** (reportes OSCE)
5. **exportador_reportes** (exportación Excel)

Ahora con:
6. **belempampa_regularizacion** (tu nueva skill integral)

---

## 🎯 Resumen de Información de BD en Skill

| Aspecto | Dónde Está | Cómo Verlo |
|---------|-----------|-----------|
| Schema completo | belempampa_skill_guide.md | Abre archivo |
| Tablas detalladas | SCHEMA_BD.md | Abre archivo |
| JSON del schema | schema_bd_completo.json | Abre con editor |
| Relaciones ER | GUIA_SISTEMA_BELEMPAMPA.md | Sección "ESTRUCTURA" |
| APIs | belempampa_skill_guide.md | Sección "APIs" |
| Cálculos | belempampa_skill_guide.md | Sección "CÁLCULOS" |
| Status actual | diagnostico_regularizacion.py | Ejecuta script |
| Datos vivos | API /api/schema | curl o navegador |

---

## 💡 Comandos Útiles

### Ver toda la info de BD
```bash
cat .agents/belempampa_skill_guide.md | grep -A 100 "ESTRUCTURA DE BASE DE DATOS"
```

### Ver índice de skills
```bash
cat .agents/skills_index.json | jq '.skills[0]'
```

### Ver solo Belempampa
```bash
cat .agents/skills_index.json | jq '.skills[] | select(.nombre=="belempampa_regularizacion")'
```

### Ver tablas documentadas
```bash
grep "^####" .agents/belempampa_skill_guide.md
```

### Ver estadísticas
```bash
python3 diagnostico_regularizacion.py 2>/dev/null || echo "Instala psycopg2"
```

---

## 🔗 Referencias Cruzadas

Todos tus documentos se referencian entre sí:

```
belempampa_skill_guide.md
  ├─ → GUIA_SISTEMA_BELEMPAMPA.md (detalles técnicos)
  ├─ → PLAN_REGULARIZACION.md (timeline)
  ├─ → CUESTIONARIO_REGULARIZACION.md (validación)
  └─ → SCHEMA_BD.md (estructura)

PLAN_REGULARIZACION.md
  ├─ → GUIA_SISTEMA_BELEMPAMPA.md (queries SQL)
  └─ → CUESTIONARIO_REGULARIZACION.md (checklist)
```

---

## ✅ Checklist de Skill Completada

- [x] Nombre documentado: `belempampa_regularizacion`
- [x] BD schema completo documentado (8 tablas)
- [x] Relaciones ER diagramadas
- [x] APIs documentadas (6 endpoints)
- [x] Scripts listados (5 utilidades)
- [x] Módulos frontend referenciados (3 páginas)
- [x] Cálculos documentados
- [x] Estadísticas actuales
- [x] Registrada en skills_index.json
- [x] Activadores configurados

---

## 🎯 PRÓXIMO PASO

Tu skill está completa. Ahora cuando necesites referencia sobre:
- Base de datos → Skill tiene todo documentado
- Estructura → Ver SCHEMA_BD.md
- Progreso → Ejecutar diagnostico_regularizacion.py
- Plan → Leer PLAN_REGULARIZACION.md

**La skill es tu "libro de referencia" automático para el proyecto Belempampa. 🚀**
