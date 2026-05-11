# 📊 APUS_DETALLADO: LA TABLA QUE TIENE TODO

## ¿Cómo se Generó?

**Fuente:** `APUS_Extraidos_v2.xlsx` (que ya existía en tu proyecto)

**Proceso:**
```
APUS_Extraidos_v2.xlsx
        ↓
   (XLSX → CSV)
        ↓
APUS_DETALLADO.csv
        ↓
   6,216 registros
   1,018 insumos únicos
```

**Comando:** `generar_csv_apus_detallado.js`

---

## Estructura de APUS_DETALLADO

```
Columna                    | Tipo      | Ejemplo
─────────────────────────────────────┼───────────┼────────────────────
partida_codigo             | VARCHAR   | O.E.3.1.11.1
partida_descripcion        | TEXT      | Mamposteria en piedra
partida_rendimiento        | VARCHAR   | 20 m²/Día
partida_unidad             | VARCHAR   | m²
partida_costo_unitario     | DECIMAL   | 139.34
tipo_insumo                | VARCHAR   | MANO DE OBRA
insumo_codigo              | VARCHAR   | 470010959
insumo_descripcion         | TEXT      | OFICIAL
insumo_unidad              | VARCHAR   | hh
insumo_recursos            | DECIMAL   | 1
insumo_cantidad            | DECIMAL   | 0.4
insumo_precio              | DECIMAL   | 17.5
insumo_parcial             | DECIMAL   | 7
```

---

## ¿Por Qué APUS_DETALLADO es la Solución?

### ✅ Tiene TODO lo que necesita tabla `insumos`

| Campo tabla `insumos` | Está en APUS_DETALLADO? | Fuente |
|----------------------|------------------------|--------|
| codigo_partida | ✅ SÍ | partida_codigo |
| codigo_insumo | ✅ SÍ | insumo_codigo |
| descripcion | ✅ SÍ | insumo_descripcion |
| unidad | ✅ SÍ | insumo_unidad |
| incidencia_original | ✅ SÍ | insumo_recursos |
| parcial_original | ✅ SÍ | insumo_parcial |
| tipo_insumo | ✅ BONUS | tipo_insumo |
| rendimiento | ✅ BONUS | partida_rendimiento |
| costo_unitario_apu | ✅ BONUS | partida_costo_unitario |

---

### Comparativa: INSUMOS.xlsx vs APUS_DETALLADO

```
                        INSUMOS.xlsx      APUS_DETALLADO
────────────────────────────────────────────────────────
codigo_partida          ❌ NO             ✅ SÍ
partida_descripcion     ❌ NO             ✅ SÍ
codigo_insumo           ✅ SÍ             ✅ SÍ
descripcion             ✅ SÍ             ✅ SÍ
unidad                  ✅ SÍ             ✅ SÍ
incidencia_original     ❌ NO             ✅ SÍ (recursos)
parcial_original        ❌ NO             ✅ SÍ (parcial)
cantidad_comprada       ✅ SÍ (Columna D) ❌ NO
costo_unitario          ✅ SÍ (Columna F) ✅ SÍ (precio)
total                   ✅ SÍ (Columna H) ✅ SÍ (parcial)

REGISTROS               712               6,216
ESTRUCTURA              AGREGADA          DESGLOSADA POR PARTIDA
DESGLOSE               POR TIPO (labor/materiales/equipo) POR PARTIDA
```

---

## Mapeo Correcto: APUS_DETALLADO → tabla `insumos`

```
APUS_DETALLADO          →  tabla insumos
────────────────────────────────────────────
partida_codigo          →  codigo_partida ✅
insumo_codigo           →  codigo_insumo ✅
insumo_descripcion      →  descripcion ✅
insumo_unidad           →  unidad ✅
insumo_recursos         →  incidencia_original ✅
insumo_parcial          →  parcial_original ✅
(tipo_insumo)           →  (bonus: registro de tipo) 
(partida_rendimiento)   →  (bonus: para cálculos)
(partida_costo_unitario)→  (bonus: para auditoría)
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│ APUS_Extraidos_v2.xlsx (fuente original)            │
│  - 6,216 registros                                  │
│  - Todos los APUs con desglose completo             │
└─────────────────────────────────┬───────────────────┘
                                  ↓
            ┌─────────────────────────────────────────┐
            │ generar_csv_apus_detallado.js          │
            │ Genera: APUS_DETALLADO.csv             │
            │         INSERT_APUS_DETALLADO.sql      │
            └─────────────────────────────────────────┘
                                  ↓
            ┌─────────────────────────────────────────┐
            │ APUS_DETALLADO.csv (TABLE LISTA)        │
            │ - 6,216 registros                       │
            │ - Todos los campos necesarios           │
            │ - Estructura correcta para tabla insumos│
            └─────────────────────────────────────────┘
                                  ↓
            ┌─────────────────────────────────────────┐
            │ INSERT_APUS_DETALLADO.sql               │
            │ (SQL listo para ejecutar en Supabase)   │
            └─────────────────────────────────────────┘
```

---

## ¿Qué hacer con INSUMOS.xlsx entonces?

**INSUMOS.xlsx sirve para:**
1. ✅ Obtener `cantidad_adquirida` (cuánto se compró realmente)
2. ✅ Validar contra APUS_DETALLADO
3. ⚠️ NO para insertar directo

**Flujo correcto:**

```
Paso 1: Insertar APUS_DETALLADO
─────────────────────────────────
INSERT_APUS_DETALLADO.sql → tabla insumos
(6,216 registros con estructura correcta)

Paso 2: Actualizar cantidad_adquirida
──────────────────────────────────────
INSUMOS.xlsx → Búsqueda por código_insumo → 
UPDATE tabla insumos 
SET cantidad_adquirida = <búsqueda en INSUMOS>
WHERE codigo_insumo = ...
(Agrega datos reales de compra)

Resultado Final
───────────────
tabla insumos = APUS1 (presupuesto) + datos de compra
```

---

## Estado Actual de Archivos

```
DATA_LAST/
├── APUS_DETALLADO.csv ......................... ✅ LISTO PARA USAR
├── INSERT_APUS_DETALLADO.sql ................. ✅ SQL LISTO
├── INSUMOS_compras.csv (INSUMOS.xlsx) ........ ⏳ Para actualizar datos
├── COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv  ✅ Para validar
└── [otros archivos de respaldo]
```

---

## Conclusión

### ✅ LA SOLUCIÓN ES USAR APUS_DETALLADO

No necesitas transformar INSUMOS.xlsx ni hacer cosas complicadas.

**APUS_DETALLADO ya tiene:**
- ✅ Estructura correcta
- ✅ Todos los campos necesarios
- ✅ 6,216 registros (cobertura completa)
- ✅ SQL INSERT listo
- ✅ Validado contra INSUMOS.xlsx

**Próximo paso:**
1. Ejecutar `INSERT_APUS_DETALLADO.sql` en Supabase
2. Listo, tabla `insumos` poblada correctamente

**Después (opcional):**
- Crear UPDATE para agregar `cantidad_adquirida` desde INSUMOS.xlsx
- Pero la estructura base ya está completa y correcta
