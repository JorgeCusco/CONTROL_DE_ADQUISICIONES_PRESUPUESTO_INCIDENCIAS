# 🔍 DIAGNÓSTICO: Compatibilidad INSUMOS.xlsx con tabla `insumos` Supabase

## Estructura de INSUMOS.xlsx

```
Columna | Header       | Tipo          | Ejemplo
────────┼──────────────┼───────────────┼─────────────────
A       | Código       | VARCHAR       | 470020001
B       | Descripción  | VARCHAR       | OPERARIO
C       | Unid.        | VARCHAR       | hh
D       | Cantidad     | DECIMAL       | 40066.3919
E       | (vacío)      | -             | -
F       | Costo        | DECIMAL       | 20.67
G       | (vacío)      | -             | -
H       | Total        | DECIMAL       | 828172.32
```

**Total registros:** 711
**Estructura:** Resumen por insumo (sin desglose por partida)

---

## Estructura tabla `insumos` Supabase

```
Columna                      | Tipo       | Requerido | Descripción
─────────────────────────────┼────────────┼───────────┼──────────────────────
id                           | SERIAL PK  | SÍ        | ID único
codigo_partida               | VARCHAR FK | SÍ        | Referencia a partida
codigo_insumo                | VARCHAR    | SÍ        | Código del insumo
descripcion                  | TEXT       | SÍ        | Descripción
unidad                       | VARCHAR    | SÍ        | Unidad
incidencia_original          | DECIMAL    | SÍ        | APU1: incidencia por partida
parcial_original             | DECIMAL    | SÍ        | APU1: total = incidencia × precio
incidencia                   | DECIMAL    | NO        | APU2: editable
cantidad_modificada          | DECIMAL    | NO        | APU2: cantidad
cantidad_adquirida           | DECIMAL    | NO        | Total comprado
comentario                   | TEXT       | NO        | Notas
es_extra                     | BOOLEAN    | NO        | ¿Es fuera de presupuesto?
```

---

## DIAGNÓSTICO: ⚠️ INCOMPATIBILIDAD CRÍTICA

### Problema 1: **FALTA `codigo_partida`** ❌

**INSUMOS.xlsx NO tiene:**
- Referencia a qué partida pertenece cada insumo
- Solo agrupa por tipo (MANO DE OBRA, MATERIALES, EQUIPO)

**tabla `insumos` REQUIERE:**
- `codigo_partida` FK (referencia a tabla partidas)
- SIN esto, NO puedes insertar

**Impacto:** 🚨 CRÍTICO - No se puede cargar sin este dato

**Solución:**
- Necesitas **vincular cada insumo con su partida**
- Opción A: Usar APU_PRESUPUESTO_LIMPIO.csv (ya tiene codigo_partida)
- Opción B: Crear script que vincule código insumo → partidas

---

### Problema 2: **Semántica de Cantidades Incorrecta** ⚠️

**INSUMOS.xlsx:**
```
Columna D: Cantidad = 40066.3919 (TOTAL comprado de ese insumo)
Columna F: Costo = 20.67 (precio unitario)
Columna H: Total = 828172.32 (cantidad × costo = 40066.39 × 20.67)
```

**tabla `insumos` espera:**
```
incidencia_original = Cantidad POR PARTIDA (ej: 0.2 hh por m²)
parcial_original = incidencia × precio unitario
cantidad_adquirida = Total comprado (aquí va tu TOTAL)
```

**Diferencia:**
- INSUMOS.xlsx: TOTAL agregado de todas las partidas
- tabla `insumos`: Desglosado POR PARTIDA

**Impacto:** ⚠️ MODERADO - Necesita re-mapeo semántico

**Solución:**
- `cantidad_adquirida` ← `Cantidad` (columna D)
- `incidencia_original` ← ??? (no existe en INSUMOS.xlsx)
- `parcial_original` ← ??? (no existe en INSUMOS.xlsx)

---

### Problema 3: **Falta Información de APU1** ❌

**INSUMOS.xlsx NO tiene:**
- `incidencia_original` (cantidad unitaria × partida)
- `parcial_original` (cálculo base del APU)
- Desglose por partida

**tabla `insumos` REQUIERE:**
- AMBOS campos (son FK a apus_detallado, implícitamente)
- Son fundamentales para auditoria y cálculos

**Impacto:** 🚨 CRÍTICO - Pierde trazabilidad APU

**Solución:**
- Obtener de APU_PRESUPUESTO_LIMPIO.csv
- O dejar como 0/NULL con comentario

---

### Problema 4: **No hay comentario/es_extra** ⚠️

**INSUMOS.xlsx NO tiene:**
- Campo de comentario
- Flag es_extra (¿fue fuera de presupuesto?)

**Impacto:** ✅ MENOR - Pueden ser NULL/FALSE

---

## MAPEO POSIBLE (Si se resuelven problemas)

```
INSUMOS.xlsx          →  tabla insumos          →  Notas
──────────────────────────────────────────────────────────────────
(vacío)               →  id                     →  AUTO GENERATED
(FALTAN DATOS)        →  codigo_partida        →  ⚠️ NECESARIO VINCULAR
A: Código             →  codigo_insumo         →  ✅ 1:1
B: Descripción        →  descripcion           →  ✅ 1:1 (pero revisar tipos)
C: Unid.              →  unidad                →  ✅ 1:1
(FALTAN DATOS)        →  incidencia_original   →  ⚠️ Usar APU
(FALTAN DATOS)        →  parcial_original      →  ⚠️ Usar APU
(FALTAN DATOS)        →  incidencia            →  ⚠️ Usar APU o 0
D: Cantidad           →  cantidad_adquirida    →  ✅ 1:1
(vacío)               →  cantidad_modificada   →  ⚠️ Dejar 0
(vacío)               →  comentario            →  ⚠️ Dejar vacío
(vacío)               →  es_extra              →  ⚠️ Dejar FALSE
```

---

## CONCLUSIÓN Y RECOMENDACIÓN

### Status: ⚠️ NO COMPATIBLE - REQUIERE TRANSFORMACIÓN

**No puedes insertar directamente INSUMOS.xlsx a tabla `insumos`**

Razones:
1. ❌ Falta `codigo_partida` (FK requerida)
2. ❌ Estructura diferente (agregada vs desglosada)
3. ❌ Faltan campos críticos (incidencia_original, parcial_original)
4. ⚠️ Semántica incorrecta de cantidades

---

## OPCIONES DE SOLUCIÓN

### ✅ OPCIÓN A: Usar APU_PRESUPUESTO_LIMPIO.csv (RECOMENDADO)

**Ventajas:**
- ✅ Tiene `codigo_partida`
- ✅ Tiene `incidencia_original` y `parcial_original`
- ✅ Estructura correcta para tabla `insumos`
- ✅ Ya tiene CSV listo
- ✅ SQL (INSERT_INSUMOS.sql) ya generado

**Desventajas:**
- No incluye `cantidad_adquirida` (datos de compra reales)

**Acción:**
```
1. Ejecutar INSERT_INSUMOS.sql en Supabase
2. Después, hacer UPDATE desde INSUMOS.xlsx:
   UPDATE insumos 
   SET cantidad_adquirida = (búsqueda en INSUMOS.xlsx)
   WHERE codigo_insumo = ...
```

---

### ⚠️ OPCIÓN B: Transformar INSUMOS.xlsx

**Pasos:**
1. Extraer INSUMOS.xlsx a CSV
2. Crear script para vincular cada insumo → partida
3. Agregar columnas incidencia_original, parcial_original (desde APU)
4. Generar SQL INSERT transformado

**Desventajas:**
- Complejo: necesita fuzzy matching o lookup manual
- Riesgo de errores en vinculación

---

### ❌ OPCIÓN C: Intentar insertar como está

**Resultado:** FALLO (FK `codigo_partida` requerida)

---

## RECOMENDACIÓN FINAL

### 🎯 **USA OPCIÓN A:**

1. **Ahora:**
   ```bash
   # Ejecutar en Supabase
   INSERT_INSUMOS.sql
   ```
   Esto carga 6,052 insumos con estructura correcta

2. **Después:**
   - Crear script para UPDATE `cantidad_adquirida` desde INSUMOS.xlsx
   - Usa código insumo como clave de búsqueda
   - Busca cantidad total en INSUMOS.xlsx y asigna a cantidad_adquirida

3. **Resultado:**
   - ✅ Tabla `insumos` completa y consistente
   - ✅ Con APU1 (presupuesto) e información de compra

---

## CSV de INSUMOS.xlsx (Por si lo necesitas)

Aún así, puedo:
1. ✅ Convertir INSUMOS.xlsx a CSV (DATA_LAST/INSUMOS_COMPRAS.csv)
2. ✅ Crear script UPDATE para vincular cantidad_adquirida
3. ⚠️ NO crear INSERT directo (sería incorrecto)

¿Quieres que genere el CSV + UPDATE script?
