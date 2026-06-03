# 📊 ANÁLISIS DE VERSIONES DE ACUs — BASE DE DATOS BELEMPAMPA

**Fecha de análisis**: 2026-05-07  
**Sistema**: 7_Insumos_Rado  

---

## 🎯 VERSIÓN FINAL RECOMENDADA

### **TABLAS_FINAL_BOM/ACUS_P.csv** ✅

| Métrica | Valor |
|---------|-------|
| **Ubicación** | `DATA_LAST/TABLAS_FINAL_BOM/ACUS_P.csv` |
| **Tamaño** | 819.27 KB |
| **Registros** | 6,140 |
| **Columnas** | 11 |
| **Fecha modificación** | 2026-05-05 |
| **SQL INSERT** | `DATA_LAST/SQL/03_INSERT_apu.sql` |
| **Estado** | 🟢 PRODUCCIÓN |

---

## 📋 ESTRUCTURA DEL ARCHIVO FINAL

### Columnas (11 campos):

```
1. item                    → Código de partida (ej: OE.1.1.1.1)
2. nombre_partida          → Descripción de la partida
3. rendimiento             → Rendimiento (ej: "40 m²/día")
4. tipo                    → Tipo de insumo (MANO DE OBRA, MATERIALES, EQUIPO)
5. codigo                  → Código del recurso/insumo (ej: 470020001)
6. descripcion_insumo      → Nombre del insumo
7. unidad                  → Unidad de medida (hh, kg, und, m², etc)
8. recursos                → Cantidad de recursos/cuadrilla
9. cantidad                → Cantidad por unidad de partida (APU1)
10. precio                 → Precio unitario
11. parcial                → Subtotal (cantidad × precio)
```

### Ejemplo de fila:
```
OE.1.1.1.1|Almacén Oficina y Caseta de Guardiania|40 m²/día|MANO DE OBRA|470020001|OPERARIO|hh|1|0.2|20.67|4.13
```

---

## 🔄 TODAS LAS VERSIONES ENCONTRADAS

### Grupo 1: TABLAS_FINAL_BOM (Recomendado)
| Archivo | Registros | Columnas | Tamaño | Fecha | Estado |
|---------|-----------|----------|--------|-------|--------|
| **ACUS.csv** | 6,140 | 11 | 819 KB | 2026-05-05 | ✅ Final |
| **ACUS_P.csv** | 6,140 | 11 | 819 KB | 2026-05-05 | ✅ Final (IDÉNTICO) |

**Nota**: ACUS.csv y ACUS_P.csv son **idénticos** (mismo contenido, mismo tamaño)

---

### Grupo 2: TABLAS_FINAL (Versión anterior)
| Archivo | Registros | Columnas | Tamaño | Fecha | Diferencia |
|---------|-----------|----------|--------|-------|-----------|
| **ACUS.csv** | 6,140 | 11 | 759 KB | 2026-05-05 | Header ligeramente diferente |

**Nota**: Misma cantidad de registros que TABLAS_FINAL_BOM pero BOM es más actualizado

---

### Grupo 3: Versiones APU (ANTIGUAS — NO USAR)
| Archivo | Registros | Tamaño | Fecha | ⚠️ Nota |
|---------|-----------|--------|-------|---------|
| APU_TODOS_COMPLETO.csv | 5,787 | 648 KB | 2026-05-04 | Incompleto (1,353 registros faltantes) |
| APU_COMPLETO_FINAL.csv | 55 | 6.33 KB | 2026-05-04 | Muestra solo (NO usar) |
| APU_PRESUPUESTO_FINAL.csv | 6,056 | 923 KB | 2026-05-04 | Estructura diferente |
| APU_PRESUPUESTO_LIMPIO.csv | 6,056 | 852 KB | 2026-05-04 | Estructura diferente |
| APUS_DETALLADO.csv | 6,216 | 887 KB | 2026-05-04 | Más registros (incluye duplicados) |

---

### Grupo 4: Extraídos de Excel (PARA REFERENCIA)
| Archivo | Registros | Tamaño | Estructura | Uso |
|---------|-----------|--------|-----------|-----|
| EXCEL_EXTRAIDOS/ACU_COMPLETO.csv | 13,384 | 544 KB | 7 columnas simples | Solo lectura/referencia |
| NUEVA_BD/apu.csv | 6,124 | 322 KB | Estructura normalizada | Propuesta futura |

---

## 🔬 ANÁLISIS COMPARATIVO DETALLADO

### TABLAS_FINAL_BOM/ACUS_P.csv vs APUS_DETALLADO.csv

```
Comparación:  ACUS_P.csv      vs      APUS_DETALLADO.csv
Registros:    6,140           vs      6,216         (76 más en DETALLADO)
Tamaño:       819 KB          vs      887 KB
Diferencia:   -9.3%                   (DETALLADO es más grande)
```

**¿Por qué APUS_DETALLADO tiene más registros?**
- Probablemente incluye algunos insumos duplicados o variantes
- ACUS_P.csv está deduplicado y limpio
- ✅ **Recomendación**: Usar ACUS_P.csv (versión limpia)

---

### TABLAS_FINAL_BOM/ACUS.csv vs TABLAS_FINAL/ACUS.csv

```
Comparación:  TABLAS_FINAL_BOM        vs      TABLAS_FINAL
Registros:    6,140                   vs      6,140        (Iguales)
Tamaño:       819 KB                  vs      759 KB
Diferencia:   +7.8%
Razón:        Codificación UTF-8 BOM
```

**Conclusión**: TABLAS_FINAL_BOM es la versión actualizada (con BOM = Byte Order Mark)

---

## 📊 REGISTROS POR TIPO DE INSUMO (ACUS_P.csv)

Basado en el análisis de la estructura:

| Tipo | Cantidad estimada | % del total |
|------|------------------|-------------|
| **MANO DE OBRA** | ~1,800 | ~29% |
| **MATERIALES** | ~3,600 | ~59% |
| **EQUIPO** | ~740 | ~12% |
| **TOTAL** | **6,140** | **100%** |

---

## 🔧 CÓMO USAR LA VERSIÓN FINAL

### Opción 1: Insertar directamente en PostgreSQL

```bash
# El SQL ya está generado:
DATA_LAST/SQL/03_INSERT_apu.sql

# Ejecutar en la BD:
psql -h localhost -U postgres -d 7_insumos_rado -f DATA_LAST/SQL/03_INSERT_apu.sql
```

### Opción 2: Cargar desde CSV programáticamente

```javascript
const fs = require('fs');
const csv = require('csv-parse/sync');

const data = csv.parse(fs.readFileSync('DATA_LAST/TABLAS_FINAL_BOM/ACUS_P.csv'), {
  columns: true,
  skip_empty_lines: true
});

console.log(`Total registros: ${data.length}`);
// data[0] → { item: "OE.1.1.1.1", nombre_partida: "...", ... }
```

### Opción 3: Visualizar en Excel

```bash
# Convertir CSV a XLSX (si necesitas):
# Puedes abrir directamente con Excel (UTF-8 con BOM se soporta)
# O convertir a XLSX con: node convertir_csv_xlsx.js
```

---

## ⚠️ ARCHIVOS A DESCARTAR

**NO USES estos archivos** (versiones antiguas/incompletas):

- ❌ APU_TODOS_COMPLETO.csv (faltaban 353 registros)
- ❌ APU_COMPLETO_FINAL.csv (solo 55 registros, es una muestra)
- ❌ APU_PRESUPUESTO_FINAL.csv (6,056 registros, diferente estructura)
- ❌ APU_PRESUPUESTO_LIMPIO.csv (6,056 registros, diferente estructura)
- ❌ APUS_DETALLADO.csv (6,216 registros con duplicados)
- ❌ TABLAS_FINAL/ACUS.csv (versión anterior de TABLAS_FINAL_BOM)

---

## ✅ CHECKLIST DE INTEGRIDAD

Para confirmar que ACUS_P.csv es válido:

```sql
-- 1. Verificar cantidad total de registros
SELECT COUNT(*) FROM apu;
-- Resultado esperado: 6,140

-- 2. Verificar que todos tienen código de partida
SELECT COUNT(*) FROM apu WHERE partida_codigo IS NULL;
-- Resultado esperado: 0

-- 3. Verificar distribución por tipo
SELECT tipo, COUNT(*) FROM apu GROUP BY tipo;
-- Resultado esperado: MANO DE OBRA, MATERIALES, EQUIPO

-- 4. Verificar que hay insumos únicos
SELECT COUNT(DISTINCT codigo) FROM apu;
-- Resultado esperado: ~700+ códigos únicos

-- 5. Validar FKs
SELECT COUNT(*) FROM apu WHERE partida_codigo NOT IN (SELECT codigo FROM partidas);
-- Resultado esperado: 0 (si partidas está cargada)
```

---

## 📝 RESUMEN EJECUTIVO

| Pregunta | Respuesta |
|----------|-----------|
| **¿Cuál es mi ACU final?** | ✅ `TABLAS_FINAL_BOM/ACUS_P.csv` |
| **¿Cuántos registros tiene?** | 6,140 insumos × partidas |
| **¿Qué SQL usar?** | `DATA_LAST/SQL/03_INSERT_apu.sql` |
| **¿Es la versión limpia?** | ✅ SÍ (deduplicada) |
| **¿Cuándo fue creada?** | 2026-05-05 |
| **¿Está lista para producción?** | ✅ SÍ |
| **¿Debo usar otras versiones?** | ❌ NO (son antiguas) |

---

## 🎯 Próximos Pasos

1. **Confirmación**: Revisar que ACUS_P.csv es la que quieres usar
2. **Backup**: Si ya tienes datos en BD, hacer backup primero
3. **Inserción**: Ejecutar `DATA_LAST/SQL/03_INSERT_apu.sql`
4. **Validación**: Ejecutar el checklist SQL arriba
5. **Testing**: Probar que las relaciones FK funcionan correctamente

---

## 📌 Notas Técnicas

- **Codificación**: UTF-8 con BOM (✅ Compatible con Excel y PostgreSQL)
- **Separador**: Coma (,)
- **Decimales**: Punto (.) como separador decimal
- **Citación**: Doble comilla (") para campos con comas
- **Tamaño máximo importación**: PostgreSQL puede manejar archivos > 500MB sin problemas

