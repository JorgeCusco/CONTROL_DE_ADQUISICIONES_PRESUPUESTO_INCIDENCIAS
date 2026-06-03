# 📊 ANÁLISIS DE VARIACIONES EN CÓDIGOS DE PARTIDAS

**Fecha**: 2026-05-07  
**BD**: 7_insumos_rado  
**Total de códigos únicos**: 1,135

---

## 📋 CASUÍSTICA ENCONTRADA

### Situación Actual

Se identificaron **4 variaciones principales** en el formato de códigos:

| Variación | Cantidad | % | Ejemplos |
|-----------|----------|---|----------|
| **OE normal (sin ceros izq)** | 1,065 | 93.8% | OE.1.1.1.1, OE.2.3.7.1 |
| **Con ceros a izquierda** | 69 | 6.1% | OE.6.01.01.07, OE.6.02.21 |
| **O.E. con puntos** | 1 | 0.09% | O.E.3.1.11.1 |
| **TOTAL** | **1,135** | **100%** | |

---

## 🔍 ANÁLISIS DETALLADO POR VARIACIÓN

### 1️⃣ FORMATO NORMAL (1,065 códigos) ✅
**Estado**: Correcto, no requiere cambios  
**Patrón**: `OE.X.X.X.X` o `OE.X.X.X.X.X` o `OE.X.X.X.X.X.X`

```
Ejemplos:
  OE.1.1.1.1        (5 segmentos)
  OE.1.1.3.1.1      (6 segmentos)
  OE.2.4.2.2.2.1    (7 segmentos)
```

**Características**:
- Prefijo: `OE` sin punto intermedio
- Separador: punto (`.`)
- Números sin ceros a izquierda
- Longitud variable: 4-7 segmentos según nivel jerárquico

---

### 2️⃣ CON CEROS A LA IZQUIERDA (69 códigos) ⚠️
**Estado**: Requiere normalización  
**Patrón**: `OE.6.0X.0Y.ZZ` (algunos segmentos con ceros a izquierda)

```
Ejemplos:
  OE.6.01.01.07  →  OE.6.1.1.7    (remover 01→1, 01→1, 07→7)
  OE.6.02.21     →  OE.6.2.21     (remover 02→2)
  OE.6.03.17     →  OE.6.3.17     (remover 03→3)
  OE.6.03.26     →  OE.6.3.26     (remover 03→3)
```

**Ubicación**: Concentrados principalmente en OE.6.XX.XX (especialidad 6)

**Detalle de los 69**:
- OE.6.01.* → 15 códigos (requieren: 01→1)
- OE.6.02.* → 3 códigos (requieren: 02→2)
- OE.6.03.* → 19 códigos (requieren: 03→3)
- OE.6.04.* → 5 códigos (requieren: 04→4)
- OE.6.05.* → 10 códigos (requieren: 05→5)
- OE.6.06.* → 13 códigos (requieren: 06→6)
- OE.6.08.* → 4 códigos (requieren: 08→8)

---

### 3️⃣ FORMATO CON PUNTOS ENTRE O-E (1 código) 🔴
**Estado**: Requiere normalización (único anomalía)  
**Patrón**: `O.E.X.X.X.X`

```
Encontrado:
  O.E.3.1.11.1  →  OE.3.1.11.1  (remover punto entre O y E)
```

**Tipo de error**: Puntuación inconsistente en prefijo

---

## 📐 ESTRUCTURA JERÁRQUICA

Los códigos siguen este patrón jerárquico:
```
OE.X.Y.Z.W[.V][.U]
│  │ │ │ │  │  │
│  │ │ │ │  │  └─ Nivel 6 (sub-sub-sub)
│  │ │ │ │  └───── Nivel 5 (sub-sub)
│  │ │ │ └─────── Nivel 4 (sub-item)
│  │ │ └────────── Nivel 3 (ítem)
│  │ └──────────── Nivel 2 (capítulo)
│  └───────────── Nivel 1 (grupo)
└──────────────── Prefijo (siempre OE)
```

**Distribución por longitud**:
- 4 segmentos (3 separadores): 143 códigos → `OE.3.12.1`
- 5 segmentos (4 separadores): 663 códigos → `OE.1.1.1.1` (mayoría)
- 6 segmentos (5 separadores): 318 códigos → `OE.1.1.3.1.1`
- 7 segmentos (6 separadores): 11 códigos → `OE.2.4.2.2.2.1`

---

## 🔧 PROCEDIMIENTO DE NORMALIZACIÓN

### Paso 1: Identificar y Clasificar
```javascript
// Expresión regular para detectar variaciones
const variaciones = {
  conPuntoEnPrefijo: /^O\.E\./,          // O.E.3.1.11.1
  conCerosIzquierda: /\.0[0-9]/,         // OE.01.01.07
  normal: /^OE\.[0-9]+/                  // OE.1.1.1.1
};
```

### Paso 2: Reglas de Normalización

| Variación | Regla | Ejemplo |
|-----------|-------|---------|
| **Puntos en prefijo** | Remover punto entre O y E | `O.E.3.1.11.1` → `OE.3.1.11.1` |
| **Ceros a izquierda** | Convertir cada segmento a número, devolver a string | `OE.6.01.01.07` → `OE.6.1.1.7` |
| **Normal** | Sin cambios | `OE.1.1.1.1` → `OE.1.1.1.1` ✓ |

### Paso 3: Algoritmo de Normalización
```
ENTRADA: codigo_original (string)

1. Remover espacios al inicio/fin
2. Reemplazar "O.E." por "OE"
3. Dividir por "." en segmentos
4. Para cada segmento:
     a. Convertir a número entero (parseInt)
     b. Convertir de vuelta a string (toString)
   → Esto remueve ceros a izquierda automáticamente
5. Unir segmentos con "."
6. Validar que comience con "OE"
7. Validar que tenga 4-7 segmentos
8. SALIDA: codigo_normalizado

EJEMPLOS:
  "O.E.3.1.11.1"     → ["OE","3","1","11","1"] → "OE.3.1.11.1" ✓
  "OE.6.01.01.07"    → ["OE","6","1","1","7"] → "OE.6.1.1.7" ✓
  "OE.1.1.1.1"       → ["OE","1","1","1","1"] → "OE.1.1.1.1" ✓
```

### Paso 4: Validación POST-NORMALIZACIÓN
```
Validaciones a aplicar:
  1. Longitud: debe contener 4-7 segmentos exactos
  2. Prefijo: debe ser exactamente "OE"
  3. Números: todos los segmentos deben ser enteros >= 1
  4. Separador: solo puntos (.), sin guiones o espacios
  5. Resultado único: código normalizado debe ser único en tabla
```

---

## 📊 IMPACTO DE NORMALIZACIÓN

### Códigos a Cambiar
- **Con ceros a izquierda**: 69 códigos
- **Con puntos en prefijo**: 1 código
- **SUBTOTAL A CAMBIAR**: 70 códigos (6.2%)
- **Sin cambios necesarios**: 1,065 códigos (93.8%)

### Riesgos Identificados
1. ⚠️ **Integridad referencial**: FKs en tabla `insumos` apuntan a `partidas.codigo`
   - Si normalizamos, debe hacerse en ambas tablas simultáneamente
   - De lo contrario, se pierden las relaciones

2. ⚠️ **Histórico de cambios**: `historial_cambios` registra antiguos códigos
   - No se debe modificar histórico, solo registrar el cambio como normalización

3. ⚠️ **Datos en memoria/cache**: Si hay caché o sesiones que referencia códigos antiguos
   - Necesaria invalidación post-normalización

---

## 🎯 RECOMENDACIONES TÉCNICAS

### Opción A: Normalización en Base de Datos (Permanente)
**Ventaja**: Una sola ejecución, afecta toda futura consulta  
**Desventaja**: Destructiva, requiere transacción ACID  

**Pasos**:
1. Crear tabla temporal `partidas_backup` (copia de seguridad)
2. Crear columna `codigo_normalizado` en `partidas`
3. Llenar `codigo_normalizado` con valores normalizados
4. Validar que NO hay duplicados en `codigo_normalizado`
5. Actualizar FK en `insumos` (cambiar `codigo_partida`)
6. Cambiar PK en `partidas` (de `codigo` a `codigo_normalizado`)
7. Registrar cambios en `historial_cambios`
8. Eliminar columna `codigo` antigua

**Tiempo estimado**: 2-3 horas (con validación meticulosa)

### Opción B: Normalización en Aplicación (Runtime)
**Ventaja**: No modifica BD, reversible  
**Desventaja**: Overhead en cada lectura, datos "sucios" en BD  

**Pasos**:
1. Crear función `normalizarCodigo(codigo)` en `lib/` compartida
2. Aplicar en TODAS las consultas: `SELECT DISTINCT CODIGO_NORMALIZADO(codigo) FROM ...`
3. Aplicar en búsquedas: `WHERE CODIGO_NORMALIZADO(codigo) = ?`
4. Aplicar en UI: mostrar siempre versión normalizada

**Riesgo**: Inconsistencia si no se aplica en todos lados

---

## 🔐 Procedimiento Seguro Recomendado

**Paso 1 - Validación Pre-Cambio** (sin escritura)
```sql
-- Verificar que normalización no crea duplicados
SELECT codigo_normalizado, COUNT(*) FROM (
  SELECT CASE 
    WHEN codigo LIKE 'O.E.%' THEN 'OE' || SUBSTR(codigo, 2)
    ELSE codigo
  END as codigo_normalizado
  FROM partidas
) GROUP BY codigo_normalizado HAVING COUNT(*) > 1;
-- Resultado esperado: 0 filas
```

**Paso 2 - Backup**
```sql
CREATE TABLE partidas_backup AS SELECT * FROM partidas;
```

**Paso 3 - Actualizar Prefijo** (O.E. → OE)
```sql
UPDATE partidas 
SET codigo = 'OE' || SUBSTR(codigo, 2) 
WHERE codigo LIKE 'O.E.%';
```

**Paso 4 - Remover Ceros a Izquierda** (per segment)
```sql
-- Esto es más complejo, requiere función custom o loop
-- Ver sección SQL Implementation debajo
```

**Paso 5 - Validar FK**
```sql
SELECT * FROM insumos WHERE codigo_partida NOT IN (SELECT codigo FROM partidas);
-- Resultado esperado: 0 filas
```

**Paso 6 - Audit Trail**
```sql
INSERT INTO historial_cambios (tabla, campo, valor_anterior, valor_nuevo, usuario, modulo)
SELECT 'partidas', 'codigo', codigo_viejo, codigo_nuevo, 'sistema', 'normalizacion'
FROM cambios_aplicados;
```

---

## 💾 Implementación SQL (Pseudo-código)

```sql
-- Función para normalizar un código
CREATE OR REPLACE FUNCTION normalizar_codigo(codigo_in TEXT)
RETURNS TEXT AS $$
DECLARE
  resultado TEXT;
  segmentos TEXT[];
  i INT;
BEGIN
  -- Paso 1: Remover espacios
  resultado := TRIM(codigo_in);
  
  -- Paso 2: Reemplazar O.E. por OE
  resultado := REGEXP_REPLACE(resultado, '^O\.E\.', 'OE.');
  
  -- Paso 3: Dividir en segmentos
  segmentos := STRING_TO_ARRAY(resultado, '.');
  
  -- Paso 4: Procesar cada segmento
  FOR i IN 1..ARRAY_LENGTH(segmentos, 1) LOOP
    IF segmentos[i] ~ '^[0-9]+$' THEN
      -- Convertir a número y de vuelta a string (remueve ceros a izquierda)
      segmentos[i] := (segmentos[i]::INTEGER)::TEXT;
    END IF;
  END LOOP;
  
  -- Paso 5: Reunir segmentos
  resultado := ARRAY_TO_STRING(segmentos, '.');
  
  RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todos los códigos
UPDATE partidas 
SET codigo = normalizar_codigo(codigo)
WHERE codigo != normalizar_codigo(codigo);

-- Verificar cambios
SELECT codigo, normalizar_codigo(codigo) as normalizado 
FROM partidas 
WHERE codigo != normalizar_codigo(codigo);
```

---

## 📝 Resumen Ejecutivo

| Aspecto | Situación | Recomendación |
|---------|-----------|---|
| **Códigos normales** | 93.8% (1,065) | Mantener sin cambios |
| **Con ceros a izq.** | 6.1% (69) | Normalizar |
| **Anomalías** | 0.09% (1) | Normalizar |
| **Procedimiento** | Texto 70 códigos | Ejecutar normalización en BD |
| **Riesgo** | Medium (FK references) | Validar después de cada paso |
| **Reversibilidad** | Con backup | Hacer backup antes |
| **Timing** | Cuando sea conveniente | No es operación crítica |

---

## ✅ Conclusión

**El problema es bien definido y soluble:**

1. ✓ Casuística identificada: solo 3 variaciones (puntos, ceros, normal)
2. ✓ Procedimiento claro: normalizar a `OE.X.Y.Z...` sin ceros a izquierda
3. ✓ Impacto cuantificable: 70 códigos (6.2%) requieren cambios
4. ✓ Riesgos identificados: FK relationships, historial audit trail
5. ✓ Implementación factible: Función SQL + transacción + validación

**Próximo paso cuando lo decidas:** Ejecutar normalización con los pasos 1-6 del procedimiento seguro recomendado.
