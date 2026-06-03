# 📊 ESTRUCTURA SQL COMPLETA DEL PROYECTO BELEMPAMPA

**Fecha:** 21 de Mayo de 2026  
**Base de Datos:** PostgreSQL (Supabase)  
**Total de Tablas:** 7  
**Total de Registros:** ~10,900  

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen)
2. [Diagrama ER](#diagrama-er)
3. [Tablas Detalladas](#tablas-detalladas)
4. [Relaciones y Vínculos](#relaciones)
5. [Flujos de Datos](#flujos)
6. [Notas Importantes](#notas)

---

## <a id="resumen"></a>🎯 RESUMEN EJECUTIVO

El sistema está compuesto por **7 tablas principales** que conforman un flujo de control presupuestario:

```
PRESUPUESTO (partidas_p → insumos_p → acus)
        ↓
COMPRAS (compras_c) ← VINCULACIÓN (mapeo_vinculacion) → INSUMOS
        ↓
ESTADO Y RESUMEN (estado_cuadre_insumos, insumos_resumen)
```

---

## <a id="diagrama-er"></a>🔗 DIAGRAMA ENTIDAD-RELACIÓN (ER)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DEL SISTEMA                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   PARTIDAS_P     │  ← Partidas presupuestarias base
│ ─────────────── │
│ • item (PK)     │
│ • descripcion   │
│ • cantidad_p    │
│ • precio_unit_p │
│ • total_p       │
│ • rendimiento_p │
│ ─────────────── │
│ Registros: 1283 │
└────────┬─────────┘
         │
         │ (conceptualmente relacionado)
         ↓
┌──────────────────────────────────────────────────────────────────┐
│                         INSUMOS_P (PK: codigo)                   │
│ ────────────────────────────────────────────────────────────── │
│ • codigo              (Código del insumo)                       │
│ • descripcion         (Nombre del insumo)                       │
│ • unidad              (Unidad de medida)                        │
│ • cantidad_insumo_p   (Cantidad requerida en presupuesto)       │
│ • costo_p             (Costo unitario)                          │
│ • total_p             (Total = cantidad × costo)                │
│ ────────────────────────────────────────────────────────────── │
│ Registros: 1138                                                 │
│ Rol: Repositorio maestro de insumos del presupuesto            │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   │ (vinculación de insumos a partidas)
                   ↓
┌──────────────────────────────────────────────────────────────────┐
│                          ACUS (PK: id)                           │
│ ────────────────────────────────────────────────────────────── │
│ • id                (ID único)                                 │
│ • item_partida      (Ref a partidas_p)                         │
│ • codigo_insumo     (Ref a insumos_p)                          │
│ • descripcion_insumo (Descripción del insumo)                  │
│ • unidad            (Unidad de medida)                         │
│ • recursos          (Factor/rendimiento del insumo)            │
│ • cantidad_p        (Cantidad presupuesto - NO EDITABLE)       │
│ • precio_p          (Precio presupuesto)                       │
│ • parcial_p         (Subtotal presupuesto)                     │
│ • cantidad_c        (Cantidad comprado/actual)                 │
│ • precio_c          (Precio de compra)                         │
│ • parcial_c         (Subtotal compra)                          │
│ ────────────────────────────────────────────────────────────── │
│ Registros: 6336 (Matriz de insumos por partida)               │
│ Rol: APU comparativa (presupuesto vs. compra)                 │
│ Nota: Esta es la tabla PIVOTAL del sistema                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ↓                                     ↓
┌──────────────────────────┐      ┌──────────────────────────────┐
│     COMPRAS_C (PK: id)   │      │ MAPEO_VINCULACION (PK: id)  │
│ ──────────────────────── │      │ ──────────────────────────── │
│ • id                    │      │ • id                        │
│ • anio                  │      │ • codigo_insumo (FK→insumo) │
│ • componente            │      │ • compra_id (FK→compras_c)  │
│ • detalle               │      │ • factor_conversion         │
│ • unidad                │      │ • usuario                   │
│ • cantidad_c            │      │ • created_at                │
│ • precio_unit_c         │      │ ──────────────────────────── │
│ • total_c               │      │ Registros: 1884             │
│ • tipo_compra           │      │ Rol: Vinculador master      │
│ • num_compra            │      │ (insumo ↔ compra)           │
│ • completo              │      │ Unique: (codigo_insumo,     │
│ • unidad_und            │      │ compra_id)                  │
│ • cantidad_und          │      └──────────────────────────────┘
│ • precio_und            │
│ ──────────────────────── │
│ Registros: 1921         │
└──────────────────────────┘
        │
        │ (referencia directa)
        ↓
┌──────────────────────────────────────────────────────────────┐
│      ESTADO_CUADRE_INSUMOS (PK: codigo_insumo)              │
│ ───────────────────────────────────────────────────────── │
│ • codigo_insumo (PK)  (Identificador único del insumo)     │
│ • estado              (ej: "Pendiente", "Cuadrado", etc)  │
│ • comentario          (Notas sobre el estado)             │
│ • updated_at          (Timestamp de última modificación) │
│ ───────────────────────────────────────────────────────── │
│ Registros: 274                                            │
│ Rol: Estado de cuadre por insumo                         │
└──────────────────────────────────────────────────────────────┘
        │
        ↓
┌──────────────────────────────────────────────────────────────┐
│      INSUMOS_RESUMEN (NO tiene PK tradicional)             │
│ ───────────────────────────────────────────────────────── │
│ • codigo_insumo         (Identificador del insumo)        │
│ • descripcion_insumo    (Nombre del insumo)               │
│ • unidad                (Unidad de medida)                │
│ • cantidad_requerida_p  (Total presupuesto)               │
│ • precio_p              (Precio promedio presupuesto)     │
│ • cantidad_requerida_c  (Total comprado)                  │
│ • estado                (Estado de cuadre)                │
│ • comentario            (Comentarios)                     │
│ ───────────────────────────────────────────────────────── │
│ Registros: 1145                                           │
│ Rol: VISTA/RESUMEN consolidado por insumo                │
│ Nota: Posiblemente VIEW (no tabla física)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## <a id="tablas-detalladas"></a>📑 TABLAS DETALLADAS

### 1️⃣ PARTIDAS_P (Partidas Presupuestarias)

**Propósito:** Mantener el catálogo de partidas (capítulos) del presupuesto base.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **item** | VARCHAR(50) | PK, NOT NULL | Identificador único de la partida (ej: "01", "02.01.01") |
| descripcion | TEXT | NOT NULL | Nombre/descripción de la partida (ej: "Estructuras", "Acabados") |
| unidad | VARCHAR(20) | - | Unidad de medida de la partida (m2, m3, kg, etc) |
| cantidad_p | NUMERIC | NOT NULL | Metrado presupuestado (cantidad base) |
| precio_unitario_p | NUMERIC | - | Precio unitario del presupuesto |
| total_p | NUMERIC | - | Total = cantidad_p × precio_unitario_p |
| rendimiento_p | VARCHAR(100) | - | Rendimiento o especificación técnica |

**Estadísticas:**
- **Registros:** 1283
- **Clave Primaria:** `item`
- **Clave Foránea:** Ninguna (tabla base)

**Ejemplo de Datos:**
```
| item | descripcion | cantidad_p | precio_unitario_p | total_p |
|------|------------|------------|-------------------|---------|
| 01   | Excavación | 1250.00    | 45.50            | 56875.00|
| 01.01| Relleno    | 800.00     | 32.75            | 26200.00|
```

**Notas Importantes:**
- ✅ Esta tabla **NO debe editarse** (datos del expediente técnico)
- ✅ `cantidad_p` es el **metrado fijo** del presupuesto base
- ✅ Es tabla **padre/raíz** del sistema

---

### 2️⃣ INSUMOS_P (Insumos del Presupuesto)

**Propósito:** Catálogo maestro de insumos (materiales, mano de obra, etc) requeridos para el presupuesto.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **codigo** | VARCHAR(50) | PK, NOT NULL | Identificador único del insumo (ej: "CEMENTO", "ACERO", "MO") |
| descripcion | TEXT | - | Descripción completa del insumo |
| unidad | VARCHAR(20) | - | Unidad de compra (kg, m3, m2, jornada, etc) |
| cantidad_insumo_p | NUMERIC | - | Cantidad total requerida en presupuesto |
| costo_p | NUMERIC | - | Costo unitario presupuestado |
| total_p | NUMERIC | - | Total = cantidad_insumo_p × costo_p |

**Estadísticas:**
- **Registros:** 1138
- **Clave Primaria:** `codigo`
- **Clave Foránea:** Ninguna (tabla base)

**Ejemplo de Datos:**
```
| codigo | descripcion | unidad | cantidad_insumo_p | costo_p | total_p |
|--------|------------|--------|-------------------|---------|---------|
| CEM50  | Cemento 50kg| Bolsa  | 2500.00          | 15.50   | 38750.00|
| AC12   | Acero 1/2"  | Kg     | 18000.00         | 4.20    | 75600.00|
```

**Notas:**
- ✅ Tabla **repositorio maestro** de insumos
- ✅ Un insumo puede aparecer en **múltiples partidas**
- ✅ Los valores aquí son **presupuestados originales**

---

### 3️⃣ ACUS (APU - Análisis de Precios Unitarios)

**Propósito:** MATRIZ CENTRAL del sistema. Cruza insumos con partidas, mostrando presupuesto vs compra real.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **id** | INTEGER | PK, NOT NULL, AUTO | Identificador único |
| item_partida | VARCHAR(50) | - | Referencia a partidas_p.item |
| tipo | VARCHAR(50) | - | Tipo de insumo (Material, MO, Equipo, etc) |
| codigo_insumo | VARCHAR(50) | - | Referencia a insumos_p.codigo |
| descripcion_insumo | TEXT | NOT NULL | Descripción del insumo |
| unidad | VARCHAR(20) | - | Unidad de medida |
| recursos | NUMERIC | - | Factor/rendimiento (cuánto insumo por unidad de partida) |
| **cantidad_p** | NUMERIC | NOT NULL, CHECK | Cantidad presupuesto ← **NO EDITABLE** |
| precio_p | NUMERIC | - | Precio unitario presupuesto |
| parcial_p | NUMERIC | - | Subtotal presupuesto = cantidad_p × precio_p |
| cantidad_c | NUMERIC | - | Cantidad comprada/adquirida ← **EDITABLE** |
| precio_c | NUMERIC | - | Precio unitario de compra |
| parcial_c | NUMERIC | - | Subtotal compra = cantidad_c × precio_c |

**Estadísticas:**
- **Registros:** 6336 (matriz cartesiana aprox. insumos × partidas)
- **Clave Primaria:** `id`
- **Clave Foránea:** Ninguna (referencias indirectas)

**Ejemplo de Datos:**
```
| id | item_partida | codigo_insumo | cantidad_p | precio_p | parcial_p | cantidad_c | precio_c | parcial_c |
|----|-------------|---------------|-----------|---------|-----------|-----------|---------|-----------|
| 1  | 01          | CEM50         | 500.00    | 15.50   | 7750.00   | 520.00    | 15.80   | 8216.00   |
| 2  | 01          | AC12          | 3600.00   | 4.20    | 15120.00  | 3750.00   | 4.25    | 15937.50  |
```

**Constraints:**
- ✅ `cantidad_p` está **PROTEGIDA** (NO EDITABLE) - datos originales
- ✅ `cantidad_c` es **EDITABLE** - se actualiza con compras reales
- ✅ Campo `recursos` vincula el rendimiento del insumo en la partida

**Notas Críticas:**
- 🔴 **ESTA ES LA TABLA MÁS IMPORTANTE**
- 🔴 Aquí se compara presupuesto original vs realidad de compra
- 🔴 Variancias se calculan: `parcial_c - parcial_p`

---

### 4️⃣ COMPRAS_C (Compras Realizadas)

**Propósito:** Registro de todas las compras/órdenes de compra realizadas.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **id** | INTEGER | PK, NOT NULL, AUTO | Identificador único de la compra |
| anio | VARCHAR(20) | - | Año de la compra |
| componente | TEXT | - | Componente del sistema (ej: "Cimientos", "Albañilería") |
| detalle | TEXT | NOT NULL | Descripción de la compra (como viene en documento) |
| unidad | VARCHAR(20) | - | Unidad de medida original |
| cantidad_c | NUMERIC | NOT NULL | Cantidad comprada |
| precio_unit_c | NUMERIC | NOT NULL | Precio unitario de compra |
| total_c | NUMERIC | NOT NULL | Total = cantidad_c × precio_unit_c |
| tipo_compra | VARCHAR(100) | - | Tipo (ej: "Orden", "Factura", "Vale") |
| num_compra | VARCHAR(100) | - | Número de documento de compra |
| completo | VARCHAR(50) | - | Flag de completitud |
| unidad_und | VARCHAR(20) | - | Unidad normalizada (después de vinculación) |
| cantidad_und | NUMERIC | - | Cantidad normalizada |
| precio_und | NUMERIC | - | Precio normalizado |

**Estadísticas:**
- **Registros:** 1921
- **Clave Primaria:** `id`
- **Clave Foránea:** Referenced from `mapeo_vinculacion.compra_id`

**Ejemplo de Datos:**
```
| id | detalle | cantidad_c | precio_unit_c | total_c | unidad_und | cantidad_und |
|----|---------|-----------|---------------|---------|-----------|--------------|
| 1  | Cemento | 50.00     | 15.80         | 790.00  | Bolsa      | 50.00        |
| 2  | Acero 1/2"| 400.00    | 4.25          | 1700.00 | Kg         | 400.00       |
```

**Notas:**
- ✅ Datos **originales** como vienen en los documentos (columnas `_c`)
- ✅ Datos **normalizados** después de cuadre (columnas `_und`)
- ✅ Varias compras pueden apuntar a **un mismo insumo** via `mapeo_vinculacion`

---

### 5️⃣ MAPEO_VINCULACION (Vinculador Master)

**Propósito:** TABLA CRÍTICA para vincular cada compra con un insumo específico. Permite múltiples compras por insumo con factor de conversión.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **id** | INTEGER | PK, NOT NULL, AUTO | Identificador único del vínculo |
| codigo_insumo | VARCHAR(50) | NOT NULL, UNIQUE* | FK a insumos_p.codigo (el insumo a vincular) |
| compra_id | INTEGER | FK, UNIQUE* | FK a compras_c.id (la compra a vincular) |
| factor_conversion | NUMERIC | DEFAULT 1.0 | Factor de conversión entre unidades |
| usuario | VARCHAR(100) | - | Usuario que realizó la vinculación |
| created_at | TIMESTAMP | DEFAULT now() | Timestamp de creación |

\* *UNIQUE CONSTRAINT: (codigo_insumo, compra_id)* - No puede haber duplicados

**Estadísticas:**
- **Registros:** 1884
- **Clave Primaria:** `id`
- **Clave Foránea:** `compra_id` → `compras_c.id`
- **Unique Constraint:** `(codigo_insumo, compra_id)`

**Ejemplo de Datos:**
```
| id | codigo_insumo | compra_id | factor_conversion | usuario | created_at |
|----|---------------|-----------|------------------|---------|------------|
| 1  | CEM50         | 105       | 1.0              | JorgeCusco | 2026-05-15 10:30 |
| 2  | AC12          | 108       | 1.0              | JorgeCusco | 2026-05-15 11:45 |
| 3  | MO.ALB        | 200       | 2.5              | Admin    | 2026-05-16 09:00 |
```

**Notas Críticas:**
- 🔴 **TABLA DE VINCULACIÓN EXPLÍCITA** - Reemplaza text-matching automático
- 🔴 Un insumo (ej: "CEMENTO") puede tener **múltiples compras** vinculadas
- 🔴 El `factor_conversion` permite ajustar unidades distintas
- 🔴 Es **AUDITABLE** (usuario, timestamp)

---

### 6️⃣ ESTADO_CUADRE_INSUMOS (Estado de Cuadre)

**Propósito:** Mantener el estado de cuadre (reconciliación) por cada insumo.

**Estructura:**

| Campo | Tipo | Constraint | Descripción |
|-------|------|-----------|-------------|
| **codigo_insumo** | VARCHAR(50) | PK, NOT NULL | FK a insumos_p.codigo |
| estado | TEXT | DEFAULT 'Pendiente' | Estado actual (ej: "Cuadrado", "Pendiente", "Rechazado") |
| comentario | TEXT | - | Notas sobre por qué ese estado |
| updated_at | TIMESTAMP | DEFAULT now() | Última actualización |

**Estadísticas:**
- **Registros:** 274
- **Clave Primaria:** `codigo_insumo`
- **Clave Foránea:** None (ref indirecta a insumos_p)

**Ejemplo de Datos:**
```
| codigo_insumo | estado | comentario | updated_at |
|---------------|--------|-----------|------------|
| CEM50         | Cuadrado | Coincide con doc | 2026-05-20 15:00 |
| AC12          | Pendiente | En espera de vales | 2026-05-21 10:00 |
| MO.ALB        | Rechazado | Precio no coincide | 2026-05-19 14:30 |
```

**Notas:**
- ✅ Tabla de **control de calidad** del cuadre
- ✅ Estados posibles: `Pendiente`, `Cuadrado`, `Rechazado`, etc
- ✅ Permite **auditoría** del proceso de cuadre

---

### 7️⃣ INSUMOS_RESUMEN (Vista Consolidada)

**Propósito:** Resumen consolidado por insumo. Posiblemente una VISTA (no tabla física).

**Estructura:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| codigo_insumo | VARCHAR(50) | Identificador del insumo |
| descripcion_insumo | VARCHAR | Nombre del insumo |
| unidad | VARCHAR | Unidad de medida |
| cantidad_requerida_p | NUMERIC | Total presupuestado (suma de todas las partidas) |
| precio_p | NUMERIC | Precio promedio presupuesto |
| cantidad_requerida_c | NUMERIC | Total comprado (realidad) |
| estado | TEXT | Estado de cuadre |
| comentario | TEXT | Comentarios |

**Estadísticas:**
- **Registros:** 1145
- **Clave Primaria:** None
- **Naturaleza:** Posible VIEW o tabla desnormalizada

**Ejemplo de Datos:**
```
| codigo_insumo | descripcion_insumo | cantidad_requerida_p | precio_p | cantidad_requerida_c |
|---------------|------------------|----------------------|---------|----------------------|
| CEM50         | Cemento 50kg     | 2500.00              | 15.50   | 2520.00              |
| AC12          | Acero 1/2"       | 18000.00             | 4.20    | 18150.00             |
```

**Notas:**
- ℹ️ Tabla **desnormalizada** para reportes rápidos
- ℹ️ Consolidación de ACUS por insumo
- ℹ️ Probablemente generada por script o VIEW

---

## <a id="relaciones"></a>🔗 RELACIONES ENTRE TABLAS

### Diagrama de Flujo de Datos

```
CREACIÓN DE PRESUPUESTO
│
├─→ PARTIDAS_P (Capítulos presupuestarios)
│   └─→ INSUMOS_P (Catálogo de insumos)
│       └─→ ACUS (Matriz presupuesto)
│           └─ Datos: cantidad_p, precio_p (NO editable)
│
REALIZACIÓN DE COMPRAS
│
├─→ COMPRAS_C (Documentos de compra)
│   └─→ MAPEO_VINCULACION (Vincular a insumos)
│       ├─→ codigo_insumo (→ INSUMOS_P.codigo)
│       └─→ compra_id (→ COMPRAS_C.id)
│
CUADRE Y ESTADO
│
├─→ ESTADO_CUADRE_INSUMOS (Estado de cada insumo)
│   └─→ INSUMOS_RESUMEN (Resumen consolidado)
```

### Relaciones Directas

**FK: MAPEO_VINCULACION → COMPRAS_C**
```sql
ALTER TABLE mapeo_vinculacion
ADD CONSTRAINT mapeo_vinculacion_compra_id_fkey
FOREIGN KEY (compra_id)
REFERENCES compras_c(id);
```
- **Cardinalidad:** N:1 (Muchas vinculaciones por compra)
- **Acción de cascada:** NO especificada (protegida)

### Relaciones Lógicas (Sin FK explícita)

1. **PARTIDAS_P ← → ACUS**
   - Campo: `item_partida` en ACUS
   - Tipo: 1:N (Una partida tiene muchos insumos en ACUS)

2. **INSUMOS_P ← → ACUS**
   - Campo: `codigo_insumo` en ACUS
   - Tipo: 1:N (Un insumo aparece en múltiples partidas)

3. **INSUMOS_P ← → MAPEO_VINCULACION**
   - Campo: `codigo_insumo` en MAPEO_VINCULACION
   - Tipo: 1:N (Un insumo puede vincularse a varias compras)

4. **ESTADO_CUADRE_INSUMOS ← → INSUMOS_P**
   - Campo: `codigo_insumo` en ESTADO_CUADRE_INSUMOS
   - Tipo: 1:1 (Uno a uno, un estado por insumo)

---

## <a id="flujos"></a>📊 FLUJOS DE DATOS PRINCIPALES

### Flujo 1: Ingreso de Presupuesto Base

```
1. Admin carga PARTIDAS_P (expediente técnico)
   ↓
2. Admin carga INSUMOS_P (catálogo de insumos requeridos)
   ↓
3. Sistema genera ACUS combinando partidas e insumos
   (cantidad_p fija del presupuesto original)
   ↓
4. Columnas cantidad_c, precio_c inicialmente NULL o cero
```

**Tabla Protagonista:** PARTIDAS_P → INSUMOS_P → ACUS

---

### Flujo 2: Ingreso de Compras

```
1. Admin carga COMPRAS_C desde documentos (facturas, órdenes)
   Datos: cantidad_c, precio_unit_c, total_c (originales)
   ↓
2. Sistema guarda en columnas normalizadas (_und):
   unidad_und, cantidad_und, precio_und
   ↓
3. Admin MAPEA cada compra a un insumo en MAPEO_VINCULACION
   Usuario selecciona: código_insumo + factor_conversion
   ↓
4. Sistema actualiza ACUS.cantidad_c y ACUS.precio_c
   según la vinculación realizada
```

**Tabla Protagonista:** COMPRAS_C → MAPEO_VINCULACION → ACUS

---

### Flujo 3: Cuadre y Reconciliación

```
1. Usuario revisa ACUS (comparativa presupuesto vs compra)
   ↓
2. Para cada insumo, determina estado en ESTADO_CUADRE_INSUMOS:
   - "Cuadrado": presupuesto ≈ compra (tolerancia)
   - "Pendiente": en proceso de cuadre
   - "Rechazado": no coinciden
   ↓
3. Sistema genera INSUMOS_RESUMEN (consolidación)
   Suma totales por insumo
   ↓
4. Reportes y análisis
```

**Tabla Protagonista:** ESTADO_CUADRE_INSUMOS → INSUMOS_RESUMEN

---

## <a id="notas"></a>⚠️ NOTAS IMPORTANTES

### Immutabilidad (No Editable)

❌ **NUNCA MODIFICAR:**
- `PARTIDAS_P.*` (datos técnicos originales)
- `INSUMOS_P.*` (catálogo base)
- `ACUS.cantidad_p` (presupuesto original sellado)
- `ACUS.precio_p` (presupuesto original sellado)

✅ **EDITABLE:**
- `ACUS.cantidad_c` (reemplazado por vinculaciones)
- `ACUS.precio_c` (reemplazado por vinculaciones)
- `COMPRAS_C.unidad_und`, `cantidad_und`, `precio_und` (normalización)
- `MAPEO_VINCULACION.*` (vinculaciones explícitas)
- `ESTADO_CUADRE_INSUMOS.estado`, `comentario` (control)

### Índices y Performance

**Índices Definidos:**
- `acus_pkey` (PK)
- `compras_c_pkey` (PK)
- `estado_cuadre_insumos_pkey` (PK)
- `insumos_p_pkey` (PK)
- `mapeo_vinculacion_pkey` (PK)
- `mapeo_vinculacion_codigo_insumo_compra_id_key` (UNIQUE)
- `partidas_p_pkey` (PK)

**Recomendación:** Considerar índices en:
- `ACUS.item_partida`
- `ACUS.codigo_insumo`
- `MAPEO_VINCULACION.codigo_insumo`
- `COMPRAS_C.num_compra` (búsqueda por documento)

### Constraints y Validaciones

**CHECK Constraints Activos:**
- `ACUS.cantidad_p` NOT NULL
- `ACUS.parcial_p` permite pero valida
- `COMPRAS_C.cantidad_c` NOT NULL
- `COMPRAS_C.precio_unit_c` NOT NULL
- `MAPEO_VINCULACION.codigo_insumo` NOT NULL
- `ESTADO_CUADRE_INSUMOS.codigo_insumo` NOT NULL

**Foreign Keys:**
- Solo 1 FK definida: `MAPEO_VINCULACION.compra_id` → `COMPRAS_C.id`

### Problemas Potenciales

⚠️ **Falta de FK's explícitas:**
- ACUS → PARTIDAS_P (item_partida) no tiene FK
- ACUS → INSUMOS_P (codigo_insumo) no tiene FK
- ESTADO_CUADRE_INSUMOS → INSUMOS_P no tiene FK

🔧 **Recomendación:** Agregar estas FK's para integridad referencial:
```sql
ALTER TABLE acus
ADD CONSTRAINT acus_item_partida_fkey
FOREIGN KEY (item_partida) REFERENCES partidas_p(item);

ALTER TABLE acus
ADD CONSTRAINT acus_codigo_insumo_fkey
FOREIGN KEY (codigo_insumo) REFERENCES insumos_p(codigo);

ALTER TABLE estado_cuadre_insumos
ADD CONSTRAINT estado_codigo_insumo_fkey
FOREIGN KEY (codigo_insumo) REFERENCES insumos_p(codigo);
```

---

## 📈 ESTADÍSTICAS FINALES

| Métrica | Valor |
|---------|-------|
| Total de tablas | 7 |
| Total de registros | ~10,903 |
| Foreign Keys definidas | 1 |
| Foreign Keys recomendadas | 3 |
| Índices definidos | 7 |
| Índices recomendados | 4 |
| Tipo de datos usados | INTEGER, NUMERIC, VARCHAR, TEXT, TIMESTAMP |
| Base de datos | PostgreSQL (Supabase) |
| Versión SQL | ISO/IEC 9075-2 |

---

**Documento Generado:** 21 de Mayo de 2026  
**Análisis Realizado Por:** Sistema Automatizado  
**Estado:** Completado ✅
