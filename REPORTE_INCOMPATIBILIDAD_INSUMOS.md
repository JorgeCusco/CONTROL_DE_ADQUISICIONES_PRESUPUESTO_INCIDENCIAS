# 🚨 Reporte de Incompatibilidad - INSUMOS.xlsx

## Problema Identificado

**INSUMOS.xlsx NO ES COMPATIBLE con la tabla `insumos` de Supabase**

---

## Comparativa

### Estructura de INSUMOS.xlsx (Actual)

```
Código | Descripción | Unid. | Cantidad | Costo | Total
───────────────────────────────────────────────────────
470020001 | OPERARIO | hh | 40066.39 | 20.67 | 828172.32
470020003 | PEON | hh | 47162.44 | 15.88 | 748939.59
```

**Tipo**: Resumen de insumos adquiridos (por tipo/código, sin partida)
**Registros**: 712
**Campos**: Código, Descripción, Unidad, Cantidad, Costo, Total

---

### Estructura Esperada para tabla `insumos` (Supabase)

```
codigo_partida | codigo_insumo | descripcion | unidad | incidencia_original | parcial_original | ...
───────────────────────────────────────────────────────────────────────────────────────────────────
OE.1.1.1.1     | 470020001    | OPERARIO    | hh     | 0.2                | 4.13            | ...
OE.1.1.1.1     | 470010959    | OFICIAL     | hh     | 4                  | 14              | ...
```

**Tipo**: Insumos desagregados por partida
**Campos**: codigo_partida (FK), codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, etc.

---

## Principales Incompatibilidades

| Problema | INSUMOS.xlsx | Tabla insumos | Impacto |
|----------|-------------|---------------|---------|
| **Sin codigo_partida** | ❌ NO tiene | ✅ REQUERIDO | No sabe a qué partida pertenece cada insumo |
| **Sin incidencia_original** | ❌ Tiene "Cantidad" (total) | ✅ REQUERIDO | No coincide con APU1 (cantidad unitaria x partida) |
| **Sin parcial_original** | ❌ Tiene "Total" (agregado) | ✅ REQUERIDO | No tiene cálculo desglosado |
| **Estructura** | ❌ Resumen por insumo | ✅ Por partida x insumo | Granularidad diferente |
| **Registros** | 712 | 6,056 esperados | Datos incompletos |

---

## ¿De dónde vienen los datos correctos?

**Los insumos correctos están en:**

### ✅ OPCIÓN A: APU_PRESUPUESTO_LIMPIO.csv (RECOMENDADO)
- **Fuente**: DATA_LAST/APU Y PRESUPUESTO.xlsx → Hoja APU
- **Registros**: 6,056 insumos
- **Estructura**: 
  - partida_codigo ✅
  - insumo_codigo ✅
  - insumo_descripcion ✅
  - insumo_recursos (incidencia) ✅
  - insumo_cantidad ✅
  - insumo_precio ✅
  - insumo_parcial ✅
- **Estado**: Listo para cargar

### ✅ OPCIÓN B: APUS_DETALLADO.csv
- **Fuente**: APUS_Extraidos_v2.xlsx
- **Registros**: 6,216 insumos
- **Misma estructura que APU_PRESUPUESTO_LIMPIO**

---

## ¿Qué es INSUMOS.xlsx entonces?

INSUMOS.xlsx parece ser un **resumen de compras/adquisiciones realizadas**, no la estructura de insumos del APU.

- ✅ Útil para tabla `compras` (órdenes de compra)
- ❌ NO apto para tabla `insumos` (estructura de APU)

---

## Recomendación

### ❌ NO USAR INSUMOS.xlsx para tabla `insumos`

### ✅ USAR APU_PRESUPUESTO_LIMPIO.csv para tabla `insumos`

**Pasos:**
1. Generar script SQL desde APU_PRESUPUESTO_LIMPIO.csv
2. Mapear:
   - partida_codigo → codigo_partida (FK)
   - insumo_codigo → codigo_insumo
   - insumo_descripcion → descripcion
   - insumo_unidad → unidad
   - insumo_recursos → incidencia_original
   - insumo_parcial → parcial_original
   - (Otros campos → valores por defecto o NULL)

---

## Siguiente Acción

¿Generamos el SQL para cargar insumos desde APU_PRESUPUESTO_LIMPIO.csv?
