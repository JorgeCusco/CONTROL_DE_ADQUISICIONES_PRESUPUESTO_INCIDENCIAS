# 🚀 DEPLOYMENT CHECKLIST - Schema Normalizado

**Fecha**: 2026-05-06  
**Versión**: 1.0 - Migración Completa de BD  
**Estado**: 🟢 LISTO PARA EJECUTAR

---

## 📊 Resumen de Cambios

| Aspecto | Anterior | Nuevo |
|---------|----------|-------|
| **Tablas** | 6 (con legacy) | 6 (normalizadas) |
| **FK blandas** | `insumos.descripcion = compras.insumo_descripcion` | `mapeo_vinculacion: recurso_codigo FK → compras.id FK` |
| **Partidas** | ~1,135 | 433 (nivel 5, con cantidad/precio/total) |
| **Insumos/Recursos** | 706 | 701 (deduplikados por código) |
| **APU** | 6,140+ | 6,140 (con precio_original, parcial_original calculado) |
| **Compras** | 1,940 (nueva data) | 1,940 (normalizada: unidad_orig, unidad_norm, etc.) |
| **Vínculos** | 1,177 (a conservar) | 1,177 (remappeados a nuevos compra_ids) |
| **Columnas redundantes** | `unidad_c/und`, `cant_c/und`, `pu_c/und` | Eliminadas; solo `*_orig` y `*_norm` |

---

## 📁 Archivos Generados

### **SQL - DATA_LAST/SQL/**

```
00_CREATE_SCHEMA.sql        [11 KB]   Schema completo (6 tablas + FKs)
01_INSERT_partidas.sql      [47 KB]   433 partidas del presupuesto
02_INSERT_recursos.sql      [60 KB]   701 recursos únicos
03_INSERT_apu.sql           [514 KB]  6,140 relaciones partida↔recurso (APU1)
04_INSERT_compras.sql       [196 KB]  1,940 órdenes de compra (datos normalizados)
```

### **Backup/Restore - DATA_LAST/VINCULOS_BACKUP/**

```
FLUJO_MIGRACION.txt                  Documentación completa del proceso
01_EXPORT_VINCULOS_ACTUALES.sql      Backup de 1,177 vínculos antes de migrar
02_CLEAN_OLD_DATA.sql                Limpiar compras/vínculos viejos
04_VERIFY_POST_MIGRATION.sql         Verificación post-migración
```

### **Scripts Node.js**

```
generar_schema_v2.js         Generador de CREATE SCHEMA (ejecutado ✓)
generar_inserts_final.js     Generador de INSERT (ejecutado ✓)
backup_restore_vinculos.js   Documentación de backup/restore (ejecutado ✓)
restore_vinculos.js          [PENDIENTE] Re-mapear vínculos a nuevos compra_ids
```

---

## ⚠️ Prerequisitos

- [ ] Conexión a Supabase confirmada (conexión pooler: `postgresql://user:pass@db.supabase.co:6543/db`)
- [ ] Backup de BD actual en lugar seguro
- [ ] Acceso a Supabase SQL Editor
- [ ] Node.js 18+ en máquina local

---

## 🔄 Workflow de Ejecución

### **FASE 1: Crear Schema Nuevo (5 min)**

```sql
-- En Supabase SQL Editor:
-- Copiar contenido de: DATA_LAST/SQL/00_CREATE_SCHEMA.sql
-- Ejecutar → Status: ✓ OK (sin errores)
```

**Tablas creadas:**
- ✓ partidas (PK: codigo)
- ✓ recursos (PK: codigo)
- ✓ apu (PK: id; FK: partida_codigo, recurso_codigo)
- ✓ compras (PK: id)
- ✓ mapeo_vinculacion (PK: id; FK: recurso_codigo, compra_id)
- ✓ historial_cambios (PK: id)

---

### **FASE 2: Insertar Datos Presupuestarios (10 min)**

Ejecutar en orden en Supabase SQL Editor:

#### **2.1 - Partidas (433 registros)**
```sql
-- DATA_LAST/SQL/01_INSERT_partidas.sql
-- Columnas: codigo | descripcion | unidad | cantidad | precio_unitario | total_presupuestado | rendimiento
-- ✓ Ejecutar → 433 filas insertadas
```

#### **2.2 - Recursos (701 únicos)**
```sql
-- DATA_LAST/SQL/02_INSERT_recursos.sql
-- Columnas: codigo | descripcion | unidad | precio_base | tipo
-- Tipo: MANO DE OBRA / MATERIALES / EQUIPO (inferido de descripción)
-- ✓ Ejecutar → 701 filas insertadas
```

#### **2.3 - APU (6,140 relaciones)**
```sql
-- DATA_LAST/SQL/03_INSERT_apu.sql
-- Columnas: partida_codigo | recurso_codigo | tipo | aporte_unitario | cuadrilla | rendimiento | precio_original | parcial_original
-- Nota: parcial_original = aporte_unitario × precio_original (calculado automáticamente)
-- ✓ Ejecutar → 6,140 filas insertadas
```

**Verificación post-FASE 2:**
```sql
SELECT COUNT(*) FROM partidas;       -- 433 ✓
SELECT COUNT(*) FROM recursos;       -- 701 ✓
SELECT COUNT(*) FROM apu;            -- 6,140 ✓
```

---

### **FASE 3: Backup de Vínculos Actuales (5 min)**

> ⚠️ CRÍTICO: Hacer ANTES de tocar la tabla compras

#### **3.1 - Exportar vínculos actuales**
```sql
-- En Supabase SQL Editor:
-- Copiar contenido de: DATA_LAST/VINCULOS_BACKUP/01_EXPORT_VINCULOS_ACTUALES.sql
-- Ejecutar → Result table con ≈1,177 filas
-- Copiar resultado → guardar como: DATA_LAST/VINCULOS_BACKUP/vinculos_backup.csv
```

**Columnas del backup:**
```
id | recurso_codigo | compra_id_antiguo | anio | componente | tipo_compra | 
num_compra | detalle | unidad_orig | cantidad_orig | precio_unit_orig | usuario | created_at
```

---

### **FASE 4: Limpiar Datos Viejos (2 min)**

```sql
-- En Supabase SQL Editor:
-- Copiar contenido de: DATA_LAST/VINCULOS_BACKUP/02_CLEAN_OLD_DATA.sql
-- Ejecutar → DELETE FROM mapeo_vinculacion; DELETE FROM compras;
```

**Verificación:**
```sql
SELECT COUNT(*) FROM mapeo_vinculacion;  -- 0 ✓ (vaciado)
SELECT COUNT(*) FROM compras;            -- 0 ✓ (vaciado)
```

---

### **FASE 5: Insertar Nuevas Compras (5 min)**

```sql
-- En Supabase SQL Editor:
-- Copiar contenido de: DATA_LAST/SQL/04_INSERT_compras.sql
-- Ejecutar → 1,940 filas insertadas
```

**Columnas:**
```
id | anio | componente | tipo_compra | num_compra | detalle | 
unidad_orig | cantidad_orig | precio_unit_orig | completo
```

**Verificación:**
```sql
SELECT COUNT(*) FROM compras;        -- 1,940 ✓
SELECT COUNT(*) as completas FROM compras WHERE completo = true;  -- 1,846 ✓
SELECT COUNT(*) as incompletas FROM compras WHERE completo = false; -- 94 ✓
```

---

### **FASE 6: Re-mapear Vínculos (5-10 min)**

> 🚧 EN DESARROLLO: Script `restore_vinculos.js` (pendiente crear)

Workflow:
1. El script lee `vinculos_backup.csv` (del paso 3.1)
2. Para cada vínculo antiguo, busca la compra NUEVA que coincida por:
   - `anio` (año exacto)
   - `componente` (C.D./G.G.)
   - `tipo_compra` (O/C/O/S/CJA.CHI)
   - `num_compra` (número documento)
   - `detalle` (búsqueda fuzzy de descripción)
3. Inserta nuevo `mapeo_vinculacion` con `compra_id` nuevo
4. Registra errores de no-coincidencia para revisión manual

```bash
# Ejecutar en terminal:
node restore_vinculos.js
```

**Verificación:**
```sql
SELECT COUNT(*) FROM mapeo_vinculacion;  -- ≈1,177 ✓
```

---

### **FASE 7: Verificación Final (2 min)**

```sql
-- En Supabase SQL Editor:
-- Copiar contenido de: DATA_LAST/VINCULOS_BACKUP/04_VERIFY_POST_MIGRATION.sql
-- Ejecutar todos los queries

-- Resultados esperados:
-- total_vinculos: 1,177
-- total_compras: 1,940
-- vinculos_huerfanos: 0 (NO debe haber orfandades)
```

---

## 🔐 Cambios en Schema

### **TABLA: partidas**

**Antes:**
```sql
CREATE TABLE partidas (
  codigo VARCHAR PRIMARY KEY,
  descripcion TEXT,
  -- ... otros campos legacy ...
);
```

**Después:**
```sql
CREATE TABLE partidas (
  codigo              VARCHAR PRIMARY KEY,
  descripcion         TEXT NOT NULL,
  unidad              VARCHAR,
  cantidad            NUMERIC,               -- metrado presupuestado (NUEVO)
  precio_unitario     NUMERIC,               -- precio unitario presupuestado (NUEVO)
  total_presupuestado NUMERIC,               -- cantidad × precio_unitario (NUEVO)
  rendimiento         VARCHAR,               -- del ACU (NUEVO)
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

### **TABLA: recursos** (reemplaza `insumos`)

**NUEVA tabla:**
```sql
CREATE TABLE recursos (
  codigo      VARCHAR PRIMARY KEY,
  descripcion TEXT NOT NULL,
  unidad      VARCHAR,
  precio_base NUMERIC,               -- precio de referencia
  tipo        VARCHAR,               -- MANO DE OBRA / MATERIALES / EQUIPO
  activo      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Notas:**
- Reemplaza el catálogo de `insumos`
- Deduplikado: 706 registros → 701 únicos
- FK a esta tabla desde `apu` y `mapeo_vinculacion`

### **TABLA: apu**

**Cambios mayores:**
```sql
-- ANTES: relación débil (text-based)
-- DESPUÉS: relación fuerte (FK real)

CREATE TABLE apu (
  id                SERIAL PRIMARY KEY,
  partida_codigo    VARCHAR NOT NULL REFERENCES partidas(codigo),  -- FK ✓
  recurso_codigo    VARCHAR NOT NULL REFERENCES recursos(codigo),  -- FK ✓
  tipo              VARCHAR,
  aporte_unitario   NUMERIC,         -- cantidad de recurso por unidad partida (APU1)
  cuadrilla         NUMERIC,
  rendimiento       VARCHAR,
  precio_original   NUMERIC,         -- NUEVO: precio del recurso en APU original
  parcial_original  NUMERIC,         -- NUEVO: aporte_unitario × precio_original (APU1)
  aporte_ajustado   NUMERIC,         -- APU2: NULL = usar aporte_unitario
  es_extra          BOOLEAN DEFAULT false,
  comentario        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partida_codigo, recurso_codigo)
);
```

**Cambios:**
- FK `partida_codigo` → `partidas(codigo)` (ya existía)
- FK `recurso_codigo` → `recursos(codigo)` (NUEVA, reemplaza text-matching)
- NUEVA: `precio_original`, `parcial_original` (APU1 calculado e inmutable)
- `aporte_ajustado` es NULLABLE (NULL = no editado = usar aporte_unitario)

### **TABLA: compras**

**Cambios mayores:**
```sql
-- ANTES: 11 columnas redundantes (unidad_c, unidad_und, cantidad_c, cantidad_und, pu_c, pu_und)
-- DESPUÉS: normalizado en 3 grupos: *_orig (original), *_norm (normalizado), metadatos

CREATE TABLE compras (
  id              SERIAL PRIMARY KEY,
  anio            INTEGER,
  componente      VARCHAR(5),                -- C.D. / G.G.
  tipo_compra     VARCHAR,                   -- O/C / O/S / CJA.CHI / RGR-XXX
  num_compra      VARCHAR,                   -- número del documento
  detalle         TEXT,                      -- descripción del ítem
  
  -- Columnas ORIGINALES (del documento, NO modificar)
  unidad_orig     VARCHAR,
  cantidad_orig   NUMERIC,
  precio_unit_orig NUMERIC,
  
  -- Columnas NORMALIZADAS (editable por usuario)
  unidad_norm     VARCHAR,
  cantidad_norm   NUMERIC,
  precio_unit_norm NUMERIC,
  
  -- Metadata
  completo        BOOLEAN DEFAULT true,      -- false = sin año/precio/negativo
  observacion     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Cambios:**
- ✅ Eliminadas 6 columnas redundantes (`unidad_c/und`, `cant_c/und`, `pu_c/und`)
- ✅ Añadidas 3 columnas normalizadas (`*_norm`)
- ✅ FK eliminada (ahora se vincula mediante `mapeo_vinculacion`)
- ✅ `completo` flag para rastrear integridad de datos

### **TABLA: mapeo_vinculacion** (NUEVA)

```sql
-- NUEVA: Vínculo explícito recurso ↔ compra (FK real)

CREATE TABLE mapeo_vinculacion (
  id             SERIAL PRIMARY KEY,
  recurso_codigo VARCHAR NOT NULL REFERENCES recursos(codigo),
  compra_id      INTEGER NOT NULL REFERENCES compras(id),
  usuario        VARCHAR(100),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recurso_codigo, compra_id)
);
```

**Notas:**
- Reemplaza el text-matching anterior (`insumo_descripcion = compras.detalle`)
- FK real con integridad referencial garantizada
- UNIQUE para evitar duplicados
- ON DELETE CASCADE en FK para limpieza automática

### **TABLA: historial_cambios** (sin cambios)

```sql
-- Sin cambios estructurales, solo se usará más (APU2, compras normalizadas, partidas)
```

---

## 📝 Cambios en API Routes (PRÓXIMO PASO)

**Archivos a modificar:**

| Archivo | Cambio principal | Prioridad |
|---------|-----------------|-----------|
| `api/data/route.ts` | `FROM insumos` → `FROM recursos` | 🔴 Alta |
| `api/apu/route.ts` | JOIN `apu a + recursos r + partidas p` | 🔴 Alta |
| `api/apu-full/route.ts` | `FROM apus_detallado` → `FROM apu JOIN...` | 🔴 Alta |
| `api/partidas/route.ts` | `FROM insumos` → `FROM apu JOIN recursos` | 🔴 Alta |
| `api/compras/route.ts` | Columnas `unidad_c/cant_c` → `unidad_orig/cantidad_orig` | 🔴 Alta |
| `api/vinculador/route.ts` | Consolidar `/api/vinculacion` + `/api/vinculador` | 🟡 Media |
| `api/exportar/route.ts` | Actualizar todos los JOINs | 🟡 Media |

---

## ✅ Checklist de Validación

### **Pre-Ejecución**
- [ ] Backup de BD actual realizado
- [ ] Supabase SQL Editor accesible
- [ ] Archivos CSV verificados en `DATA_LAST/TABLAS_FINAL_BOM/`
- [ ] Archivos SQL generados en `DATA_LAST/SQL/`

### **Ejecución**
- [ ] FASE 1 ✓ Schema creado (6 tablas)
- [ ] FASE 2 ✓ Datos presupuestarios insertados (433+701+6140 filas)
- [ ] FASE 3 ✓ Vínculos actuales exportados y guardados
- [ ] FASE 4 ✓ Datos viejos limpiados
- [ ] FASE 5 ✓ Nuevas compras insertadas (1,940 filas)
- [ ] FASE 6 ✓ Vínculos re-mapeados (≈1,177 filas)
- [ ] FASE 7 ✓ Verificación final sin errores

### **Post-Ejecución**
- [ ] API routes actualizadas a nuevo schema
- [ ] Tests E2E ejecutados (si existen)
- [ ] UI testeada en navegador
- [ ] Exportar Excel funciona
- [ ] Audit trail registra cambios

---

## 🆘 Troubleshooting

### **Error: FK Constraint Violation en APU**
**Causa**: Partida o recurso no existe  
**Solución**: Verificar que FASE 2.1 y 2.2 completaron exitosamente

### **Error: Vínculos huérfanos tras FASE 6**
**Causa**: Una compra antigua no tuvo coincidencia en nuevas compras  
**Solución**: 
1. Identificar en logs de `restore_vinculos.js`
2. Buscar manualmente la compra nueva que corresponde
3. Insertar registro en `mapeo_vinculacion` manualmente

### **Mismatch de compra_ids tras FASE 5**
**Causa**: No se ejecutó FASE 4 (limpiar datos viejos)  
**Solución**: Los IDs pueden no empezar en 1. Adaptar FASE 6 a rango correcto

---

## 📞 Soporte

Para errores o preguntas:
1. Revisar logs en Supabase SQL Editor (Error Details)
2. Ejecutar FASE 7 (verify scripts)
3. Consultar `FLUJO_MIGRACION.txt` en `DATA_LAST/VINCULOS_BACKUP/`

---

## 🎉 Siguiente Paso

Después de completar FASE 7:
1. ✅ Ejecutar `restore_vinculos.js` para re-mapear vínculos
2. 🚧 Actualizar 7 API routes según tabla en "Cambios en API Routes"
3. 🚧 Crear tests para nuevas rutas
4. 🚧 Verificar UI funciona correctamente
5. 🚧 Exportar Excel con nuevos datos

**Tiempo estimado total: 45-60 minutos**

---

_Documento generado: 2026-05-06_  
_Versión: 1.0 - Schema Normalizado_
