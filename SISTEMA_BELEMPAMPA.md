# Sistema de Insumos — Obra Belempampa

## Visión General

Sistema web para controlar y cuadrar los insumos del presupuesto de la obra Belempampa contra las compras realmente ejecutadas. Permite al equipo de presupuestos:

1. Ver los insumos del expediente técnico (APU1) y sus modificaciones (APU2)
2. Registrar y normalizar unidades de las compras
3. Cuadrar cuánto se compró contra cuánto dice el APU modificado
4. Exportar reportes comparativos para OSCE

---

## Arquitectura

```
PostgreSQL local (7_insumos_rado)
        │
        ▼
Next.js API Routes (frontend/src/app/api/)
        │
        ▼
React 19 / Next.js 16 Pages
  ├── /                     → Dashboard
  ├── /control-insumos      → Módulo 1: editar incidencias por partida
  ├── /ajuste-manual        → Módulo 2: cuadrar compras + APU2
  └── /vinculador           → Módulo 3: PENDIENTE (vincular insumos ↔ compras)
```

---

## Base de Datos

### Esquema Actual

```sql
-- Partidas del presupuesto base
partidas (
  codigo          VARCHAR(50) PK,
  descripcion     TEXT,
  unidad          VARCHAR(20),
  metrado_fijo    NUMERIC(15,4)  -- NUNCA modificar
)

-- Ingredientes por partida (un mismo insumo aparece N veces)
insumos (
  id                   SERIAL PK,
  codigo_partida       FK → partidas,
  item_1               VARCHAR(20),
  codigo_insumo        VARCHAR(50),
  descripcion          TEXT,          -- Nombre canónico del insumo
  unidad               VARCHAR(20),
  incidencia_original  NUMERIC(15,4), -- APU1, INMUTABLE
  parcial_original     NUMERIC(15,4), -- APU1, INMUTABLE
  incidencia           NUMERIC(15,4), -- APU2, editable
  cantidad_modificada  NUMERIC(15,4), -- APU2 = incidencia × metrado_fijo
  cantidad_adquirida   NUMERIC(15,4)
)

-- Órdenes/documentos de compra
compras (
  id                  SERIAL PK,
  insumo_descripcion  TEXT,       -- Nombre del insumo según el doc (puede diferir)
  item_c              VARCHAR(50),
  anio_c              VARCHAR(20),
  tipo_c              VARCHAR(50),
  orden_doc           VARCHAR(100),
  detalle_compra      TEXT,
  unidad_c            VARCHAR(20),         -- Unidad original
  cant_c              NUMERIC(15,4),       -- Cantidad original
  pu_c                NUMERIC(15,4),       -- Precio unitario original
  total_c             NUMERIC(15,4),
  -- Campos normalizados (usuario los ajusta en Ajuste Manual)
  unidad_und          VARCHAR(20),
  cantidad_und        NUMERIC(15,4),
  precio_und          NUMERIC(15,4)
)

-- APU detallado con rendimiento
apus_detallado (
  -- Source: APUS_Extraidos_v2.csv
  -- Contiene rendimiento por partida, usado en ApuComparative
)

-- Audit trail
historial_cambios (
  id          SERIAL PK,
  tabla       VARCHAR(50),
  registro_id INTEGER,
  campo       VARCHAR(100),
  valor_anterior TEXT,
  valor_nuevo    TEXT,
  usuario     VARCHAR(100),
  fecha       TIMESTAMPTZ,
  ip_address  VARCHAR(50),
  modulo      VARCHAR(100)
)

-- PENDIENTE: Tabla para el módulo Vinculador
mapeo_vinculacion (
  id            SERIAL PK,
  insumo_nombre TEXT NOT NULL,        -- descripcion de insumos (nombre canónico)
  compra_id     INT NOT NULL FK → compras,
  usuario       VARCHAR(100),
  fecha         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(insumo_nombre, compra_id)
)
```

---

## Módulos del Sistema

### Módulo 1: Control de Insumos (`/control-insumos`)

El usuario selecciona una partida del presupuesto y edita:
- `incidencia` — factor de precio unitario
- `cantidad_adquirida` — lo efectivamente comprado
- `cantidad_modificada` — cantidad ajustada

Todos los cambios se guardan con audit trail.

### Módulo 2: Ajuste Manual (`/ajuste-manual`)

El módulo de cuadre tiene 4 secciones:

**Paso 1 — Selección de Insumo**
Búsqueda booleana (AND lógico). Retorna insumos únicos de la tabla `insumos`.

**Paso 2 — Cuadre Manual de Compras (Unificar Unidades)**
Para el insumo seleccionado, muestra todas las compras y permite:
- Cambiar unidad a una unidad estándar
- Ajustar `cantidad_und` y `precio_und` para la unidad nueva
- Calcula: Total Adquirido Válido = Σ(cantidad_und)

**Paso 3 — Nombre Oficial del Insumo**
Permite renombrar el insumo en todas sus ocurrencias (insumos + compras).

**Paso 4 — Editar APU2 por Partida**
Tabla con todas las partidas que usan ese insumo. Edita `cantidad_2`.
- Meta Global = Total Adquirido Válido
- Balance = Meta - Σ(cantidad_2 × metrado_fijo)
- Estado: OK / FALTA / EXCESO

### Módulo 3: Vinculador (`/vinculador`) — PENDIENTE

**Problema actual**: Las compras y los insumos del presupuesto se relacionan solo por texto (`insumo_descripcion` en compras vs `descripcion` en insumos). Esto produce:
- 141 partidas sin compras asociadas
- 21 compras "huérfanas" cuyo nombre no coincide con ningún insumo

**Solución propuesta**: Nueva tabla `mapeo_vinculacion(insumo_nombre, compra_id)` con vínculo explícito N:M. El Módulo 2 (Ajuste Manual) consultaría esta tabla en vez de hacer text-matching.

**Diseño del módulo Vinculador**:
- Panel izquierdo: lista de insumos del presupuesto (con búsqueda)
- Panel derecho: lista de compras (con búsqueda)
- Checkboxes o botones para crear/eliminar vínculos
- Indicadores: insumos sin compras vinculadas, compras sin insumo vinculado
- Basado en el diseño de `Entregable_2_insumos_liquid/app.py` (Tab "Vinculación Individual")

---

## Flujo de Datos

```
Excel ACU_Acumulado.xlsx ──→ Python ingest_acu.py ──→ partidas + insumos (APU1)
Excel DATA_INSUMOS.xlsx  ──→ Python ingest_compras.py ──→ compras
Excel APUS_Extraidos.csv ──→ Python ingest_apus.py ──→ apus_detallado

Usuario en /control-insumos ──→ edita incidencias ──→ insumos (APU2)
Usuario en /ajuste-manual   ──→ normaliza unidades ──→ compras (unidad_und, precio_und)
Usuario en /ajuste-manual   ──→ ajusta cantidad_2  ──→ insumos (cantidad_modificada)
Usuario en /vinculador      ──→ crea/elimina links ──→ mapeo_vinculacion (PENDIENTE)

/api/exportar ──→ Excel 4 hojas (APU Comparativo, Compras, Resumen, Historial)
```

---

## Cálculos Clave

```
APU1 (inmutable):
  parcial_original = incidencia_original × metrado_fijo

APU2 (modificable):
  cantidad_modificada = cantidad_2 × metrado_fijo

Cuadre (meta del sistema):
  Suma(cantidad_modificada por partida) ≈ Total Adquirido Válido
  Diferencia = Total Adquirido - Suma APU2
  Verde: |Diff| < 0.0001 | Naranja: deficit | Amarillo: exceso

Precio promedio ponderado de compras:
  Precio_Prom = Suma(cantidad_und × precio_und) / Suma(cantidad_und)
```

---

## Convenciones de Código

- Transacciones: siempre `BEGIN`/`COMMIT`/`ROLLBACK` para escrituras
- Audit: todo cambio a `insumos` o `compras` se loggea vía `lib/audit.ts`
- Headers: `X-Usuario` para identificar al usuario en audit trail
- Precisión numérica: 4 decimales (`NUMERIC(15,4)`)
- API pattern: GET para consulta, POST para mutación, respuesta JSON siempre

---

## Archivos de Datos Fuente

| Archivo | Filas | Propósito |
|---------|-------|-----------|
| ACU_Acumulado_Evaluacion.xlsx | ~500 | APU1 del expediente técnico |
| DATA_INSUMOS_REALIZAR.xlsx | ~1476 | Órdenes de compra |
| APUS_Extraidos_v2.csv | ~varios | APU detallado con rendimiento |
| APUS.xlsx | — | APU completo para inspección |

---

## Scripts de Ingesta (Python)

| Script | Propósito |
|--------|-----------|
| `ingest_acu.py` | Carga partidas + insumos APU1 desde Excel |
| `ingest_compras.py` | Carga compras desde Excel |
| `ingest_apus_to_pg.py` | Carga apus_detallado desde CSV |
| `setup_db.py` | Inicializa DB + esquema |
| `reset_db.py` | Reset de insumos + partidas |

---

## Referencia: Entregable_2_insumos_liquid

Sistema previo (Streamlit + Supabase) para liquidación de insumos. Su módulo "Vinculación Individual" es el modelo de referencia para el nuevo Vinculador en 7_Insumos_rado.

Tabla equivalente: `mapeo_insumos_v2(master_id FK, comprado_id FK)` UNIQUE(master_id, comprado_id).

Ruta: `e:\00_MOD_MAR_RADO\Entregable_2_insumos_liquid\`
