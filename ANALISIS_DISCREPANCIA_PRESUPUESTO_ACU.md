# 🔴 ANÁLISIS: DISCREPANCIA PRESUPUESTO vs ACUS_P

**Fecha**: 2026-05-07  
**Sistema**: 7_Insumos_Rado (Belempampa)  
**Conclusión**: ⚠️ **ACUS_P.csv está INCOMPLETO — faltan 71 partidas**

---

## 📊 COMPARATIVA EXACTA

| Métrica | Presupuesto | ACUS_P | Diferencia |
|---------|-------------|--------|-----------|
| **Total partidas (OE.X.X.X.X)** | 734 | 663 | -71 (-9.7%) |
| **Cobertura** | 100% | 90.3% | 🟡 **INCOMPLETO** |
| **Archivo** | PRESUPUESTO.xlsx | ACUS_P.csv | |
| **Fecha** | Original | 2026-05-05 | |

---

## 🔴 PARTIDAS FALTANTES (71 total)

### Distribución por sección:

```
OE.1 (Obras Provisionales)
  ❌ OE.1.1.3.1 — LIMPIEZA DE TERRENO

OE.2 (Estructura)
  ❌ OE.2.1.2.1 — EXCAVACIONES SIMPLES
  ❌ OE.2.3.9.7 — LOSAS COLABORANTE
  ❌ OE.2.3.9.8 — LOSAS DE CONCRETO
  ❌ OE.2.4.1.1 — Columnas metalicas
  ❌ OE.2.4.2.1 — Vigas Metalicas
  ❌ OE.2.4.2.2 — Plancha Metalica

OE.3 (Acabados)
  ❌ OE.3.4.2.23 — OTROS
  ❌ OE.3.4.3.1 — CIRCULACION INTERIOR
  ❌ OE.3.4.3.2 — VEREDAS
  ❌ OE.3.4.3.3 — CIRCULACION EN PATIO DE MANIOBRAS
  ❌ OE.3.5.2.2 — OTROS
  ❌ OE.3.5.2.3 — CONTRAZOCALOS DE CERAMICO

OE.4 (Sanitarios e Instalaciones) ← MAYOR PROBLEMA
  ❌ OE.4.1.1.1 — SUMINISTRO DE URINARIOS
  ❌ OE.4.1.1.2 — SUMINISTRO DE INODOROS
  ❌ OE.4.1.1.3 — SUMINISTRO DE LAVATORIOS
  ❌ OE.4.1.2.1 — SUMINISTRO DE ACCESORIOS PARA URINARIOS
  ❌ OE.4.1.2.2 — SUMINISTRO DE ACCESORIOS PARA INODOROS
  ❌ OE.4.1.2.3 — SUMINISTRO DE ACCESORIOS PARA LAVATORIOS
  ❌ OE.4.1.2.4 — SUMINISTRO DE GRIFERIA
  ❌ OE.4.1.2.5 — SUMINISTRO DE ACCESORIOS COMPLEMENTARIOS
  ❌ OE.4.1.3.1 — INSTALACIÓN DE URINARIOS
  ❌ OE.4.1.3.2 — INSTALACIÓN DE INODOROS
  ❌ OE.4.1.3.3 — INSTALACIÓN DE LAVATORIOS
  ❌ OE.4.1.4.1 — INSTALACIÓN DE ACCESORIOS PARA URINARIOS
  ❌ OE.4.1.4.2 — INSTALACIÓN DE ACCESORIOS PARA INODOROS
  ❌ OE.4.1.4.3 — INSTALACIÓN DE ACCESORIOS PARA LAVATORIOS
  ❌ OE.4.1.4.4 — INSTALACIÓN DE GRIFERIA
  ❌ OE.4.1.4.5 — INSTALACIÓN DE ACCESORIOS COMPLEMENTARIOS
  ❌ OE.4.2.3.1 — MOVIMIENTO DE TIERRAS
  ❌ OE.4.2.3.2 — REDES DE ALIMENTACIÓN EXTERIORES
  ❌ OE.4.2.6.1 — RED DE CISTERNA
  ❌ OE.4.2.6.2 — VALVULAS Y LLAVES
  ❌ OE.4.2.6.3 — ADITAMENTOS VARIOS
  ❌ OE.4.2.6.4 — EMPALME Y PRUEBAS HIDRAULICAS
  ... y 24 más
```

---

## ❓ ¿POR QUÉ FALTAN ESTAS PARTIDAS?

### Análisis de raíces:

**1️⃣ Problema en la extracción del ACU**
- ACUS_P.csv fue generado a partir de APUs (análisis de precios unitarios)
- No todas las partidas del presupuesto tienen ACUs/APUs detallados
- Algunas partidas pueden ser solo presupuestarias (suma de insumos) sin desglose individual

**2️⃣ Partidas sin insumos desglosados**
- Partidas como "SUMINISTRO DE GRIFERIA" pueden estar agregadas bajo otras partidas
- No todas las partidas finales necesariamente tienen un APU individualizado

**3️⃣ Estructura jerárquica del presupuesto**
```
Presupuesto:
  └─ OE.4 (Capitulo)
      └─ OE.4.1 (Subcapitulo)
          └─ OE.4.1.1 (Grupo)
              ├─ OE.4.1.1.1 ← Partida final CON insumos (en ACUS_P)
              ├─ OE.4.1.1.2 ← Partida final SIN insumos (FALTA en ACUS_P)
              └─ OE.4.1.1.3 ← Partida final SIN insumos (FALTA en ACUS_P)
```

---

## 🔍 INVESTIGACIÓN REQUERIDA

Para saber si esto es un error o diseño intencional, necesito responder:

### Pregunta 1: ¿Son las 71 partidas faltantes partidas "sumarias"?
```sql
-- En el presupuesto ORIGINAL:
-- ¿Las 71 partidas faltantes están calculadas como suma de otras?
-- O ¿son partidas independientes con sus propios insumos?
```

### Pregunta 2: ¿Están las partidas faltantes en otro ACU?
Buscar en:
- APUS_DETALLADO.csv (tiene 6,216 registros)
- APU_PRESUPUESTO_FINAL.csv (tiene 6,056 registros)
- EXCEL_EXTRAIDOS/ACU_COMPLETO.csv (tiene 13,384 registros)

### Pregunta 3: ¿Son partidas que NO necesitan ACU?
Algunas partidas de "SUMINISTRO" o "INSTALACIÓN" pueden estar:
- Valuadas por lumpsum (precio fijo sin desglose)
- Incluidas bajo otras partidas
- Sin APU porque no tienen análisis de insumos

---

## ✅ CHECKLIST DE VERIFICACIÓN

Para confirmar el estado de ACUS_P.csv:

```
¿ACUS_P.csv está correcto?

[ ] Contiene TODAS las 734 partidas del presupuesto → NO ❌
    └─ Faltan 71 partidas (9.7%)

[ ] Las partidas faltantes están en otro lugar → ? (REQUIERE VERIFICACIÓN)
    └─ Revisar APUS_DETALLADO.csv
    └─ Revisar APU_PRESUPUESTO_FINAL.csv

[ ] Las partidas faltantes no necesitan ACU → ? (REQUIERE VERIFICACIÓN)
    └─ Revisar si están marcadas como "sumarias" o "lumpsum"

[ ] El problema fue en la EXTRACCIÓN → PROBABLE
    └─ El script que generó ACUS_P.csv puede no haber capturado todas las partidas
```

---

## 🎯 ACCIONES RECOMENDADAS

### Opción A: Completar ACUS_P.csv
1. Identificar qué insumos corresponden a las 71 partidas faltantes
2. Agregar filas a ACUS_P.csv con esos insumos
3. Re-ejecutar SQL INSERT

### Opción B: Investigar si las partidas son "sumarias"
1. Revisar PRESUPUESTO.xlsx y ver si las 71 faltantes tienen cálculo especial
2. Si son sumarias (suma de otras), entonces ACUS_P.csv es correcto como está
3. Documentar esta decisión

### Opción C: Usar versión alternativa
1. Probar con APUS_DETALLADO.csv (tiene 6,216 registros, más de los 6,140 de ACUS_P)
2. Comparar si cubre todas las 734 partidas
3. Validar integridad de esa versión

---

## 📝 RESUMEN EJECUTIVO

| Aspecto | Estado | Acción |
|--------|--------|--------|
| **¿ACUS_P está incompleto?** | ✅ SÍ CONFIRMADO | 🔴 REQUIERE ACCIÓN |
| **¿Cuántas faltan?** | 71 de 734 (9.7%) | |
| **¿Dónde está el problema?** | Principalmente OE.4 (sanitarios) | |
| **¿Es un error?** | PROBABLE (en la extracción) | Necesita verificación |
| **¿Cuál es la fuente de verdad?** | PRESUPUESTO.xlsx | ✅ CONFIRMADO |
| **¿Se pueden hacer consultas sin estas partidas?** | SÍ, pero incompletas (90.3%) | |
| **Próximo paso** | Determinar si 71 partidas necesitan ACU | |

---

## 🔗 ARCHIVOS GENERADOS

- ✅ `PARTIDAS_FALTANTES_EN_ACUS.json` — Listado completo de 71 partidas con descripciones

---

## 💡 CONCLUSIÓN

**Tienes razón en cuestionarlo.** ACUS_P.csv **NO es tu base de datos final completa**. Faltan 71 partidas que SÍ existen en tu presupuesto original.

**Necesitas elegir:**
1. ¿Obtener los ACUs/insumos para las 71 partidas faltantes e insertarlos?
2. ¿O confirmar que esas partidas NO necesitan desglose de insumos?

Sin esta aclaración, no podemos proseguir con confianza a la base de datos final.
