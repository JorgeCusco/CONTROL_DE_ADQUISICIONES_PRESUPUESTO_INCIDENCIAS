# ESTRUCTURA SQL DETALLADA

## 📊 TABLAS (7)


### ACUS
**Registros:** 6336

#### Columnas (13)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| id | integer | ✗ | nextval('acus_id_seq'::regclass) |
| item_partida | character varying(50) | ✓ | - |
| tipo | character varying(50) | ✓ | - |
| codigo_insumo | character varying(50) | ✓ | - |
| descripcion_insumo | text | ✗ | - |
| unidad | character varying(20) | ✓ | - |
| recursos | numeric | ✓ | - |
| cantidad_p | numeric | ✗ | - |
| precio_p | numeric | ✓ | - |
| parcial_p | numeric | ✓ | - |
| cantidad_c | numeric | ✓ | - |
| precio_c | numeric | ✓ | - |
| parcial_c | numeric | ✓ | - |

**Primary Key:**
- `id`

**Constraints:**
- PRIMARY KEY: `acus_pkey`
- CHECK: `18411_18987_1_not_null`
- CHECK: `18411_18987_5_not_null`
- CHECK: `18411_18987_8_not_null`

**Índices:**
- `acus_pkey`
  CREATE UNIQUE INDEX acus_pkey ON public.acus USING btree (id)


### COMPRAS_C
**Registros:** 1921

#### Columnas (14)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| id | integer | ✗ | nextval('compras_c_id_seq'::regclass) |
| anio | character varying(20) | ✓ | - |
| componente | text | ✓ | - |
| detalle | text | ✗ | - |
| unidad | character varying(20) | ✓ | - |
| cantidad_c | numeric | ✗ | - |
| precio_unit_c | numeric | ✗ | - |
| total_c | numeric | ✗ | - |
| tipo_compra | character varying(100) | ✓ | - |
| num_compra | character varying(100) | ✓ | - |
| completo | character varying(50) | ✓ | - |
| unidad_und | character varying(20) | ✓ | - |
| cantidad_und | numeric | ✓ | - |
| precio_und | numeric | ✓ | - |

**Primary Key:**
- `id`

**Constraints:**
- PRIMARY KEY: `compras_c_pkey`
- CHECK: `18411_18996_1_not_null`
- CHECK: `18411_18996_4_not_null`
- CHECK: `18411_18996_6_not_null`
- CHECK: `18411_18996_7_not_null`
- CHECK: `18411_18996_8_not_null`

**Índices:**
- `compras_c_pkey`
  CREATE UNIQUE INDEX compras_c_pkey ON public.compras_c USING btree (id)


### ESTADO_CUADRE_INSUMOS
**Registros:** 274

#### Columnas (4)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| codigo_insumo | character varying(50) | ✗ | - |
| estado | text | ✓ | 'Pendiente'::text |
| comentario | text | ✓ | - |
| updated_at | timestamp with time zone | ✓ | now() |

**Primary Key:**
- `codigo_insumo`

**Constraints:**
- PRIMARY KEY: `estado_cuadre_insumos_pkey`
- CHECK: `18411_19313_1_not_null`

**Índices:**
- `estado_cuadre_insumos_pkey`
  CREATE UNIQUE INDEX estado_cuadre_insumos_pkey ON public.estado_cuadre_insumos USING btree (codigo_insumo)


### INSUMOS_P
**Registros:** 1138

#### Columnas (6)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| codigo | character varying(50) | ✗ | - |
| descripcion | text | ✓ | - |
| unidad | character varying(20) | ✓ | - |
| cantidad_insumo_p | numeric | ✓ | - |
| costo_p | numeric | ✓ | - |
| total_p | numeric | ✓ | - |

**Primary Key:**
- `codigo`

**Constraints:**
- PRIMARY KEY: `insumos_p_pkey`
- CHECK: `18411_19004_1_not_null`

**Índices:**
- `insumos_p_pkey`
  CREATE UNIQUE INDEX insumos_p_pkey ON public.insumos_p USING btree (codigo)


### INSUMOS_RESUMEN
**Registros:** 1145

#### Columnas (8)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| codigo_insumo | character varying(50) | ✓ | - |
| descripcion_insumo | character varying | ✓ | - |
| unidad | character varying | ✓ | - |
| cantidad_requerida_p | numeric | ✓ | - |
| precio_p | numeric | ✓ | - |
| cantidad_requerida_c | numeric | ✓ | - |
| estado | text | ✓ | - |
| comentario | text | ✓ | - |


### MAPEO_VINCULACION
**Registros:** 1884

#### Columnas (6)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| id | integer | ✗ | nextval('mapeo_vinculacion_id_seq'::regclass) |
| codigo_insumo | character varying(50) | ✗ | - |
| compra_id | integer | ✓ | - |
| factor_conversion | numeric | ✓ | 1.0 |
| usuario | character varying(100) | ✓ | - |
| created_at | timestamp with time zone | ✓ | now() |

**Primary Key:**
- `id`

**Foreign Keys:**
- `compra_id` → `compras_c.id`

**Constraints:**
- UNIQUE: `mapeo_vinculacion_codigo_insumo_compra_id_key`
- FOREIGN KEY: `mapeo_vinculacion_compra_id_fkey`
- PRIMARY KEY: `mapeo_vinculacion_pkey`
- CHECK: `18411_19012_1_not_null`
- CHECK: `18411_19012_2_not_null`

**Índices:**
- `mapeo_vinculacion_codigo_insumo_compra_id_key`
  CREATE UNIQUE INDEX mapeo_vinculacion_codigo_insumo_compra_id_key ON public.mapeo_vinculacion USING btree (codigo_insumo, compra_id)
- `mapeo_vinculacion_pkey`
  CREATE UNIQUE INDEX mapeo_vinculacion_pkey ON public.mapeo_vinculacion USING btree (id)


### PARTIDAS_P
**Registros:** 1283

#### Columnas (7)
| Campo | Tipo | Nullable | Defecto |
|-------|------|----------|----------|
| item | character varying(50) | ✗ | - |
| descripcion | text | ✗ | - |
| unidad | character varying(20) | ✓ | - |
| cantidad_p | numeric | ✗ | - |
| precio_unitario_p | numeric | ✓ | - |
| total_p | numeric | ✓ | - |
| rendimiento_p | character varying(100) | ✓ | - |

**Primary Key:**
- `item`

**Constraints:**
- PRIMARY KEY: `partidas_p_pkey`
- CHECK: `18411_18979_1_not_null`
- CHECK: `18411_18979_2_not_null`
- CHECK: `18411_18979_4_not_null`

**Índices:**
- `partidas_p_pkey`
  CREATE UNIQUE INDEX partidas_p_pkey ON public.partidas_p USING btree (item)


## 🔗 DIAGRAMA DE RELACIONES

```
Relaciones (Foreign Keys):


mapeo_vinculacion:
  mapeo_vinculacion.compra_id ──→ compras_c.id
```

## 📈 ESTADÍSTICAS GENERALES

- **Total de tablas:** 7
- **Total de Foreign Keys:** 1
