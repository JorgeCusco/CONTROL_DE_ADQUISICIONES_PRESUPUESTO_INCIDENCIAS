# 📊 ANÁLISIS COMPLETO DE ESTRUCTURA DE DATOS
**Sistema**: 7_Insumos_Rado (Belempampa)  
**Fecha**: 2026-05-07  
**Estado**: PRODUCCIÓN

---

## 📋 TABLAS EXISTENTES (6 total)

### 1️⃣ **PARTIDAS** (1,135 registros)
**Propósito**: Alcance del proyecto - partidas del presupuesto  
**PK**: `codigo` (VARCHAR)

| Campo | Tipo | NULL | Descripción |
|-------|------|------|-------------|
| codigo | VARCHAR | NO | Código partida (ej: OE.1.1.1.1) |
| descripcion | TEXT | NO | Nombre de la partida |
| unidad | VARCHAR | NO | Unidad de medida |
| metrado_fijo | NUMERIC | NO | Cantidad presupuestada |

**Relaciones FK**:  
- ← `insumos.codigo_partida`

**Estado**: ✅ Completo, bien estructurado

---

### 2️⃣ **INSUMOS** (6,124 registros)
**Propósito**: Ingredientes/recursos por partida - APU1 (original) + APU2 (modificable)  
**PK**: `id` (SERIAL)

| Campo | Tipo | NULL | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | PK |
| codigo_partida | VARCHAR | NO | FK a partidas |
| codigo_insumo | VARCHAR | SÍ | Código del insumo |
| descripcion | TEXT | NO | Nombre insumo |
| unidad | VARCHAR | NO | Unidad de medida |
| **incidencia_original** | NUMERIC | NO | APU1: cantidad insumo por unidad partida (INMUTABLE) |
| **parcial_original** | NUMERIC | NO | APU1: incidencia_original × precio |
| **incidencia** | NUMERIC | NO | APU2: incidencia editada |
| **cantidad_modificada** | NUMERIC | NO | APU2: incidencia × metrado_fijo |
| cantidad_adquirida | NUMERIC | NO | Cantidad comprada vinculada |
| comentario | TEXT | SÍ | Notas/auditoría |
| es_extra | BOOLEAN | SÍ | TRUE = insumo agregado por usuario |

**FK**:
- `codigo_partida` → `partidas(codigo)`

**Análisis**:
- ⚠️ `codigo_insumo` puede ser NULL (algunos insumos no tienen código)
- ✅ `es_extra` permite diferenciar extras de los originales
- Cada insumo puede aparecer **N veces** (una por partida)
- Ejemplo: "CEMENTO" aparece en 5 partidas diferentes = 5 filas

---

### 3️⃣ **APUS_DETALLADO** (6,140 registros)
**Propósito**: Tabla maestra del APU con ALL datos - SOLO LECTURA  
**PK**: `id` (SERIAL)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Partida_Codigo | TEXT | Código partida (OE.X.X.X.X) |
| Partida_Descripcion | TEXT | Nombre partida |
| Partida_Rendimiento | TEXT | Rendimiento (40 m²/día) |
| Partida_Unidad | TEXT | Unidad (m², und, etc) |
| Partida_Costo_Unitario | DOUBLE | Precio unitario presupuestado |
| Tipo_Insumo | TEXT | MANO DE OBRA / MATERIALES / EQUIPO / SUB-CONTRATOS |
| Insumo_Codigo | BIGINT | Código insumo |
| Insumo_Descripcion | TEXT | Nombre insumo |
| Insumo_Unidad | TEXT | Unidad (hh, kg, m³, etc) |
| Insumo_Recursos | DOUBLE | Cantidad cuadrilla |
| Insumo_Cantidad | DOUBLE | **APU1**: cantidad insumo |
| Insumo_Precio | DOUBLE | Precio de referencia |
| Insumo_Parcial | DOUBLE | **APU1**: cantidad × precio |

**Análisis**:
- 📌 **FUENTE DE VERDAD** para validar datos del APU original
- Todos los datos en MAYÚSCULAS (convención)
- Columnas en PascalCase (legacy)
- NO se modifican - son datos originales del expediente

---

### 4️⃣ **COMPRAS** (1,437 registros)
**Propósito**: Órdenes de compra reales - datos normalizables  
**PK**: `id` (SERIAL)

| Campo | Tipo | NULL | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | PK |
| **insumo_descripcion** | TEXT | NO | Nombre insumo (como viene en doc) |
| item_c | VARCHAR | SÍ | Item del documento |
| anio_c | VARCHAR | SÍ | Año de compra |
| tipo_c | VARCHAR | SÍ | Tipo: O/C, O/S, CJA.CHI, RGR-XXX |
| orden_doc | VARCHAR | SÍ | Número documento |
| detalle_compra | TEXT | SÍ | Descripción del ítem |
| **unidad_c** | VARCHAR | SÍ | Unidad ORIGINAL (RLL, M, und, kg) |
| **cant_c** | NUMERIC | NO | Cantidad ORIGINAL |
| **pu_c** | NUMERIC | NO | Precio unitario ORIGINAL |
| total_c | NUMERIC | NO | Subtotal original |
| exp_c | VARCHAR | SÍ | Expediente |
| opinion_comentario | TEXT | SÍ | Observaciones |
| observacion | TEXT | SÍ | Más observaciones |
| especialidad | VARCHAR | SÍ | Ramo/especialidad |
| **unidad_und** | VARCHAR | SÍ | Unidad NORMALIZADA (editable) |
| **cantidad_und** | NUMERIC | SÍ | Cantidad NORMALIZADA (editable) |
| **precio_und** | NUMERIC | SÍ | Precio NORMALIZADO (editable) |

**Análisis**:
- ⚠️ **DATOS ORIGINALES** (anio_c, cant_c, pu_c) + **DATOS NORMALIZADOS** (cantidad_und, precio_und)
- Si `cantidad_und` es NULL → usar `cant_c`
- Si `precio_und` es NULL → usar `pu_c`
- `insumo_descripcion` es un TEXT libre (no FK) - riesgo de typos
- **1,437 compras** vs **6,124 insumos** = ratio 1 compra : 4.3 insumos

---

### 5️⃣ **MAPEO_VINCULACION** (1,061 registros)
**Propósito**: FK explícito entre insumos y compras  
**PK**: `id` (SERIAL)

| Campo | Tipo | NULL | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | PK |
| **insumo_nombre** | TEXT | NO | Nombre insumo (busqueda) |
| **compra_id** | INTEGER | NO | FK a compras(id) |
| usuario | TEXT | SÍ | Quién hizo la vinculación |
| created_at | TIMESTAMP | SÍ | Fecha vinculación |

**FK**:
- `compra_id` → `compras(id)` ON DELETE CASCADE

**Análisis**:
- ⚠️ `insumo_nombre` es un TEXT libre (NO FK a insumos.codigo_insumo)
- Esto permite vincular ANY descripción de insumo
- **1,061 relaciones** de **1,437 compras** = **73.8% vinculadas**
- **376 compras** sin vincular aún (26.2%)

---

### 6️⃣ **HISTORIAL_CAMBIOS** (1,682 registros)
**Propósito**: Audit trail completo de cambios  
**PK**: `id` (SERIAL)

| Campo | Tipo | NULL | Descripción |
|-------|------|------|-------------|
| id | INTEGER | NO | PK |
| tabla | VARCHAR | NO | Tabla modificada |
| registro_id | INTEGER | SÍ | ID del registro |
| registro_desc | TEXT | SÍ | Descripción legible |
| campo | VARCHAR | NO | Campo modificado |
| valor_anterior | TEXT | SÍ | Antes |
| valor_nuevo | TEXT | SÍ | Después |
| usuario | VARCHAR | NO | Quién cambió (default: 'desconocido') |
| fecha | TIMESTAMP | SÍ | Cuándo (default: NOW()) |
| ip_address | VARCHAR | SÍ | IP cliente |
| modulo | VARCHAR | SÍ | Módulo del sistema (ajuste-manual, etc) |

**Análisis**:
- ✅ Cobertura completa de cambios
- Mayormente cambios de `cantidad_und`, `precio_und` en compras
- Usuario tracking: muchos "desconocido"

---

## 📊 ESTADÍSTICAS GLOBALES

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Partidas** | 1,135 | ✅ Completo |
| **Insumos** | 6,124 | ✅ Completo (6 extraídos) |
| **APU detalles** | 6,140 | ✅ Fuente de verdad |
| **Compras** | 1,437 | ✅ Nuevas importadas |
| **Mapeo vinculación** | 1,061 | 🟡 73.8% cubierto |
| **Compras sin vincular** | 376 | 🔴 26.2% falta |
| **Audit trail** | 1,682 | ✅ Completo |
| **Ratio insumos:compras** | 4.3:1 | 📌 Esperado |

---

## 🔗 RELACIONES ACTUALES

```
partidas (PK: codigo)
    ↓
    ├─ insumos.codigo_partida (FK)
    │
insumos (PK: id)
    ↓
mapeo_vinculacion.insumo_nombre (TEXT, NO FK)
    │
    └─ compras.id (FK)
    
apus_detallado (PK: id) → NO FK, solo lectura
```

**Problemas identificados**:
- 🔴 `mapeo_vinculacion.insumo_nombre` es TEXT, NO es FK a insumos
- 🔴 `compras.insumo_descripcion` es TEXT, NO es FK a insumos
- 🟡 Posibles typos en descripciones al hacer vinculaciones manuales
- 🟡 `codigo_insumo` en insumos puede ser NULL

---

## 📈 INTEGRIDAD DE DATOS

### Compras (1,437 total)
| Campo | NULL | Completo | % |
|-------|------|----------|---|
| cantidad_und | ~300 | 1,137 | 79% |
| precio_und | ~200 | 1,237 | 86% |
| unidad_und | ~200 | 1,237 | 86% |
| anio_c | 0 | 1,437 | 100% |
| tipo_c | ~50 | 1,387 | 97% |

### Insumos (6,124 total)
| Campo | NULL | Completo | % |
|-------|------|----------|---|
| codigo_insumo | ~400 | 5,724 | 93% |
| incidencia | 0 | 6,124 | 100% |
| cantidad_adquirida | Muchos | Pocos | ~5% |

---

## 🎯 PROBLEMAS IDENTIFICADOS

### 🔴 CRÍTICOS
1. **FK blanda en mapeo_vinculacion**: `insumo_nombre` es TEXT, permite typos
2. **26% de compras sin vincular**: 376 compras esperando manual linking
3. **Discrepancia APU**: 6,140 en APUS_DETALLADO vs 6,124 en insumos (16 filas de diferencia)

### 🟡 MODERADOS
4. **codigo_insumo NULL en 400+ insumos**: dificulta matching automático
5. **cantidad_adquirida no se llena**: casi vacío, debería calcularse desde mapeo
6. **Múltiples columnas para unidad/cantidad/precio en compras**: confuso (unidad_c vs unidad_und)

### 🟢 MENORES
7. Usuario tracking incompleto (muchos "desconocido")
8. Columnas en PascalCase en APUS_DETALLADO (legacy)

---

## 💡 RECOMENDACIONES PARA PRÓXIMOS PASOS

1. **Completar vinculaciones**: 376 compras faltantes (26.2%)
2. **Limpiar descripción insumos**: standarizar nombres en mapeo
3. **Normalizar estructura compras**: eliminar redundancia (unidad_c vs unidad_und)
4. **Crear FK verdadera**: mapeo_vinculacion.insumo_nombre → insumos.id
5. **Llenar cantidad_adquirida**: automático desde mapeo_vinculacion
6. **Reconciliar APUS_DETALLADO vs insumos**: ¿por qué 16 diferencia?

---

## 📌 CONCLUSIÓN

**Estado General**: 🟡 **PRODUCTIVO PERO CON MEJORAS PENDIENTES**

- Estructura base sólida (6 tablas, relaciones básicas funcionan)
- Datos cargados y 73% de compras vinculadas
- Vinculación manual funcional pero texto-basada (riesgosa)
- Audit trail completo y en uso
- Hay datos incompletos que no afectan operación actual pero limitan escalabilidad

**Próximo trabajo**: Finalizar vinculaciones y limpiar modelo de datos para mejorar integridad.
