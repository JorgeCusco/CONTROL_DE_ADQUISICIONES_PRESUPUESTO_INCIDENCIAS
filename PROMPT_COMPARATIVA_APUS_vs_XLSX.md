# 📋 PROMPT: Comparar INSERT_APUS_DETALLADO con INSUMOS.xlsx

## Objetivo
Comparar datos de APUS_DETALLADO.csv (o INSERT_APUS_DETALLADO.sql) con INSUMOS.xlsx para identificar qué se compró y qué no.

---

## Paso 1: Entender los Datos

**APUS_DETALLADO.csv:**
- Fuente: APUS_Extraidos_v2.xlsx
- 6,216 registros
- 1,018 insumos únicos
- Contiene: partida_codigo, insumo_codigo, insumo_descripcion, tipo_insumo, insumo_unidad, insumo_precio, etc.
- Representa el **PRESUPUESTO** (lo que debería comprarse)

**INSUMOS.xlsx:**
- 712 registros
- 702 insumos con código
- Contiene: Código, Descripción, Unidad, Cantidad, Costo, Total
- Representa la **REALIDAD** (lo que se compró)

---

## Paso 2: Crear Script de Comparativa

**Archivo:** `comparar_apus_detallado_con_insumos.js`

### Estructura del Script:

```
┌──────────────────────────────────────────────┐
│ 1. LEER APUS_DETALLADO.csv                   │
│    - 6,216 registros                         │
│    - Extraer insumos únicos                  │
│    - Resultado: 1,018 insumos                │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 2. LEER INSUMOS.xlsx                         │
│    - 712 registros                           │
│    - Filtrar con código                      │
│    - Resultado: 702 insumos                  │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 3. COMPARAR CÓDIGOS                          │
│    - Qué está en ambos (COMPRADO)            │
│    - Qué solo en APUS (NO COMPRADO)          │
│    - Qué solo en XLSX (EXTRA)                │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 4. ANÁLISIS POR TIPO                         │
│    - MANO DE OBRA vs MATERIALES vs EQUIPO    │
│    - % de compra por tipo                    │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 5. GENERAR CSV COMPARATIVA                   │
│    - Estado (COMPRADO/NO COMPRADO)           │
│    - Datos de ambas fuentes                  │
│    - Para análisis en Excel                  │
└──────────────────────────────────────────────┘
```

---

## Paso 3: Código Principal

### Lectura de APUS_DETALLADO

```javascript
const csvContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
const apusRecords = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

// Extraer únicos por código insumo
const apusMap = new Map();
apusRecords.forEach((record) => {
  const key = record.insumo_codigo;
  
  if (!apusMap.has(key)) {
    apusMap.set(key, {
      insumo_codigo: record.insumo_codigo,
      insumo_descripcion: record.insumo_descripcion,
      tipo_insumo: record.tipo_insumo,
      insumo_unidad: record.insumo_unidad,
      insumo_precio: parseFloat(record.insumo_precio) || 0,
      partidas_donde_aparece: 1  // Cuenta en cuántas partidas aparece
    });
  } else {
    apusMap.get(key).partidas_donde_aparece++;
  }
});

const apusArray = Array.from(apusMap.values());
```

**Por qué así:**
- Map garantiza un registro por código insumo (sin duplicados)
- Registra en cuántas partidas aparece (útil para análisis)

---

### Lectura de INSUMOS.xlsx

```javascript
const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
const insumosSheet = insumosBook.Sheets['Sheet'];
const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

// Filtrar solo los con código
const xlsxConCodigo = insumosXlsx.filter(i => i.Código && String(i.Código).trim());
const xlsxCodigos = new Set(xlsxConCodigo.map(i => String(i.Código).trim()));
```

**Importante:**
- Convertir a string antes de .trim() (algunos códigos son números)
- Filtrar registros vacíos o sin código

---

### Comparativa (Sets)

```javascript
const apusCodigos = new Set(apusArray.map(a => a.insumo_codigo));

const inAmbos = new Set([...apusCodigos].filter(x => xlsxCodigos.has(x)));
const soloEnApus = new Set([...apusCodigos].filter(x => !xlsxCodigos.has(x)));
const soloEnXlsx = new Set([...xlsxCodigos].filter(x => !apusCodigos.has(x)));

console.log(`✅ En ambos: ${inAmbos.size} (${((inAmbos.size/apusCodigos.size)*100).toFixed(2)}%)`);
console.log(`⚠️  Solo en APUS: ${soloEnApus.size} (${((soloEnApus.size/apusCodigos.size)*100).toFixed(2)}%)`);
console.log(`⚠️  Solo en XLSX: ${soloEnXlsx.size}`);
```

**Por qué Sets:**
- Búsqueda O(1) en lugar de O(n)
- Operaciones de conjuntos (intersección, diferencia) fáciles
- Rendimiento con 1,000+ elementos

---

### Análisis por Tipo

```javascript
const byTipo = {};
comparativa.forEach(item => {
  if (!byTipo[item.tipo_insumo]) {
    byTipo[item.tipo_insumo] = { total: 0, comprado: 0, no_comprado: 0 };
  }
  byTipo[item.tipo_insumo].total++;
  if (item.estado === 'COMPRADO') {
    byTipo[item.tipo_insumo].comprado++;
  } else {
    byTipo[item.tipo_insumo].no_comprado++;
  }
});

// Mostrar estadísticas
Object.entries(byTipo).forEach(([tipo, data]) => {
  const pctCompra = ((data.comprado / data.total) * 100).toFixed(2);
  console.log(`${tipo.padEnd(20)} | ${data.total} | ${data.comprado} | ${pctCompra}% | ${data.no_comprado}`);
});
```

**Resultado:**
```
Tipo                 | Total | Comprado | % Compra | No Comprado
MANO DE OBRA         |     3 |        3 |  100.00% |           0
MATERIALES           |   915 |      610 |   66.67% |         305
EQUIPO               |   100 |       88 |   88.00% |          12
```

---

### Generar CSV Comparativa

```javascript
const comparativa = [];

apusArray.forEach(insumo => {
  const enXlsx = xlsxCodigos.has(insumo.insumo_codigo);
  const xlsxItem = xlsxArray.find(x => x.codigo === insumo.insumo_codigo);

  comparativa.push({
    estado: enXlsx ? 'COMPRADO' : 'NO COMPRADO',
    tipo_insumo: insumo.tipo_insumo,
    codigo_insumo: insumo.insumo_codigo,
    descripcion_apus: insumo.insumo_descripcion,
    descripcion_xlsx: xlsxItem ? xlsxItem.descripcion : '',
    unidad_apus: insumo.insumo_unidad,
    unidad_xlsx: xlsxItem ? xlsxItem.unidad : '',
    precio_apus: insumo.insumo_precio,
    precio_xlsx: xlsxItem ? xlsxItem.costo : 0,
    cantidad_xlsx: xlsxItem ? xlsxItem.cantidad : 0,
    total_xlsx: xlsxItem ? xlsxItem.total : 0,
    partidas_donde_aparece: insumo.partidas_donde_aparece
  });
});

const comparativaContent = stringify(comparativa, {
  header: true,
  columns: ['estado', 'tipo_insumo', 'codigo_insumo', 'descripcion_apus', 'descripcion_xlsx', ...]
});

fs.writeFileSync('DATA_LAST/COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv', comparativaContent);
```

**Ventajas:**
- Cada fila = 1 insumo con su estado
- Datos de ambas fuentes para análisis
- Fácil abrir en Excel/Google Sheets
- Permite filtrar y analizar manualmente

---

## Resultados de Esta Ejecución

```
APUS_DETALLADO:       1,018 insumos únicos
INSUMOS.xlsx:         702 insumos únicos

Comparativa:
  ✅ COMPRADO:        701 (68.86%)
  ❌ NO COMPRADO:     317 (31.14%)
  ⚠️  EXTRAS:         1

Por Tipo:
  MANO DE OBRA:       100% comprado
  MATERIALES:         66.67% comprado (305 NO COMPRADOS)
  EQUIPO:             88% comprado
```

---

## Qué Significa

| Estado | Insumos | Implicación |
|--------|---------|------------|
| **COMPRADO** | 701 | Están en APUS y en XLSX (se compraron según presupuesto) |
| **NO COMPRADO** | 317 | Están en APUS pero NO en XLSX (presupuestados pero no comprados) |
| **EXTRAS** | 1 | En XLSX pero NO en APUS (se compró algo no presupuestado) |

---

## Archivos Generados

```
DATA_LAST/
├── COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv  ← Nueva comparativa
└── [Otros archivos]
```

**Contenido CSV:**
- Fila 1: Headers
- Fila 2-1019: Cada insumo APUS con estado
- Columnas: estado, tipo, código, descripciones, precios, cantidades, etc.

---

## Adaptaciones Posibles

### Si quieres comparar con otro archivo:

1. **Cambiar fuente APUS:**
   ```javascript
   fs.readFileSync('tu_otro_apu.csv', 'utf-8')
   ```

2. **Cambiar fuente XLSX:**
   ```javascript
   XLSX.readFile('tu_otro_xlsx.xlsx')
   ```

3. **Cambiar columnas de salida:**
   ```javascript
   columns: ['estado', 'codigo', 'descripcion', ...]
   ```

4. **Filtros adicionales:**
   ```javascript
   comparativa.filter(item => item.estado === 'NO COMPRADO')
   ```

---

## Comando para Ejecutar

```bash
node comparar_apus_detallado_con_insumos.js
```

---

## Key Insights

✅ **68.86% de insumos APUS se compraron**
- Buena cobertura (mayormente comprado lo presupuestado)

⚠️ **31.14% NO se compró**
- Principalmente MATERIALES (305 de 915)
- Solo 12 EQUIPOS no se compraron
- Mano de obra 100% comprada

💡 **MATERIALES tiene menor %**
- Posible por cambios de diseño o optimizaciones
- Verificar cuáles son los 305 no comprados

---

## Conclusión

Este proceso permite:
1. ✅ Validar que se compró según presupuesto
2. ⚠️ Identificar qué presupuestado NO se compró
3. 🔍 Analizar discrepancias por tipo
4. 📊 Generar CSV para análisis avanzado en Excel
