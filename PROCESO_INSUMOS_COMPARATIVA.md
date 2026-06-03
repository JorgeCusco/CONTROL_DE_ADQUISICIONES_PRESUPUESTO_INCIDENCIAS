# 📋 Proceso: Análisis de Insumos y Generación de SQL + Comparativa

## Objetivo
Generar SQL para cargar insumos en Supabase desde APU_PRESUPUESTO_LIMPIO.csv Y comparar con INSUMOS.xlsx para identificar:
- Qué insumos del APU se compraron
- Qué insumos se compraron que no estaban en APU
- Discrepancias entre presupuesto (APU) y realidad (compras)

---

## Paso 1: Análisis Previo - ¿Es compatible INSUMOS.xlsx?

**Problema**: INSUMOS.xlsx parece ser un resumen de compras, no estructura de APU

**Solución**: Crear script para evaluar:
1. Estructura de INSUMOS.xlsx
2. Comparar con estructura esperada de tabla `insumos`
3. Identificar incompatibilidades

**Script**: `analizar_insumos_xlsx.js`
```javascript
// Lee INSUMOS.xlsx y muestra headers + primeras filas
// Compara con estructura esperada de tabla insumos
```

**Resultado**: ❌ INCOMPATIBLE
- INSUMOS.xlsx NO tiene `codigo_partida` (partida asociada)
- INSUMOS.xlsx es resumen (712 registros), no desglose por partida (6,056)
- Mapeo incorrecto de campos

---

## Paso 2: Decisión - Usar APU_PRESUPUESTO_LIMPIO.csv

**Razón**: APU_PRESUPUESTO_LIMPIO.csv tiene:
- ✅ Estructura correcta (partida + insumo)
- ✅ 6,056 registros (cobertura completa)
- ✅ Todos los campos necesarios

**Ventaja adicional**: Permite comparar APU (presupuesto) vs INSUMOS.xlsx (realidad)

---

## Paso 3: Crear Script para Generar SQL + Comparativa

**Script**: `generar_sql_insumos_y_comparar.js`

### Lógica del Script:

```
┌─────────────────────────────────────────────────────────┐
│ 1. LEER APU_PRESUPUESTO_LIMPIO.csv                      │
│    - 6,056 registros de insumos                         │
│    - Campos: partida_codigo, insumo_codigo, etc.        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. EXTRAER INSUMOS ÚNICOS                               │
│    - Map: codigo_partida|insumo_codigo → insumo object  │
│    - Resultado: 6,052 insumos únicos                    │
│    - Generar ID secuencial (1, 2, 3...)                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. LEER INSUMOS.xlsx                                    │
│    - 712 registros                                      │
│    - Extraer: Código, Descripción, Unidad, Cantidad... │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. COMPARAR                                             │
│    - APU códigos vs XLSX códigos                        │
│    - Intersección (en ambos)                            │
│    - Solo en APU (no comprado)                          │
│    - Solo en XLSX (extra)                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. GENERAR SQL INSERT                                   │
│    - INSERT INTO insumos (campos...)                    │
│    - 6,052 registros únicos                             │
│    - Transacción BEGIN/COMMIT                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. GENERAR CSV COMPARATIVA                              │
│    - Cada insumo APU con estado (COMPRADO/NO COMPRADO)  │
│    - Datos XLSX: cantidad, precio, total                │
│    - Facilita análisis de qué se compró vs presupuesto  │
└─────────────────────────────────────────────────────────┘
```

---

## Paso 4: Detalles Técnicos del Script

### Sección 1: Lectura y Extracción

```javascript
const csvContent = fs.readFileSync('DATA_LAST/APU_PRESUPUESTO_LIMPIO.csv', 'utf-8');
const apuRecords = csv.parse(csvContent, { columns: true });

// Usar Map para garantizar insumos únicos por (partida, insumo_codigo)
const insumosMap = new Map();
apuRecords.forEach((record) => {
  const key = `${record.partida_codigo}|${record.insumo_codigo}`;
  if (!insumosMap.has(key)) {
    insumosMap.set(key, {
      id: idCounter++,
      codigo_partida: record.partida_codigo,
      codigo_insumo: record.insumo_codigo,
      descripcion: record.insumo_descripcion,
      unidad: record.insumo_unidad,
      incidencia_original: parseFloat(record.insumo_recursos),
      parcial_original: parseFloat(record.insumo_parcial),
      incidencia: parseFloat(record.insumo_recursos),
      cantidad_modificada: 0,  // Se completará luego
      cantidad_adquirida: 0,   // Se completará luego
      comentario: '',
      es_extra: false
    });
  }
});
```

**Por qué usar Map:**
- Garantiza registro único por (partida, insumo)
- Evita duplicados
- Permite rápida búsqueda

---

### Sección 2: Lectura XLSX

```javascript
const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
const insumosSheet = insumosBook.Sheets['Sheet'];
const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

// Filtrar solo registros con código
const xlsxConCodigo = insumosXlsx.filter(i => i.Código && String(i.Código).trim());
const xlsxCodigos = new Set(xlsxConCodigo.map(i => String(i.Código).trim()));
```

**Importante**: Convertir a string primero (algunos códigos pueden ser números)

---

### Sección 3: Comparativa

```javascript
const apuCodigos = new Set(insumosArray.map(i => i.codigo_insumo));

const inAmbos = new Set([...apuCodigos].filter(x => xlsxCodigos.has(x)));
const soloEnApu = new Set([...apuCodigos].filter(x => !xlsxCodigos.has(x)));
const soloEnXlsx = new Set([...xlsxCodigos].filter(x => !apuCodigos.has(x)));

console.log(`✅ En ambos: ${inAmbos.size}`);
console.log(`⚠️  Solo en APU: ${soloEnApu.size}`);
console.log(`⚠️  Solo en XLSX: ${soloEnXlsx.size}`);
```

---

### Sección 4: Generar SQL

```javascript
let sqlContent = 'BEGIN TRANSACTION;\n\n';
sqlContent += 'INSERT INTO insumos (...) VALUES\n';

const valueLines = insumosArray.map((i, idx) => {
  const isLast = idx === insumosArray.length - 1;
  const ending = isLast ? ';' : ',';
  return `('${i.codigo_partida}', '${i.codigo_insumo}', '${i.descripcion.replace(/'/g, "''")}', ...)${ending}`;
});

sqlContent += valueLines.join('\n');
sqlContent += '\n\nCOMMIT;\n';

fs.writeFileSync('DATA_LAST/INSERT_INSUMOS.sql', sqlContent, 'utf-8');
```

**Puntos clave:**
- Escapar comillas simples en strings: `'${str.replace(/'/g, "''")}'`
- Transacción para integridad
- Último registro termina con `;`, otros con `,`

---

### Sección 5: Generar CSV Comparativa

```javascript
const comparativa = [];

insumosArray.forEach(insumo => {
  const enXlsx = xlsxCodigos.has(insumo.codigo_insumo);
  const xlsxItem = xlsxConCodigo.find(i => String(i.Código).trim() === insumo.codigo_insumo);

  comparativa.push({
    estado: enXlsx ? 'COMPRADO' : 'NO COMPRADO',
    codigo_insumo: insumo.codigo_insumo,
    descripcion_apu: insumo.descripcion,
    descripcion_xlsx: xlsxItem ? xlsxItem.Descripción : '',
    cantidad_apu: insumo.incidencia_original,
    cantidad_xlsx: xlsxItem ? xlsxItem.Cantidad : 0,
    precio_xlsx: xlsxItem ? xlsxItem.Costo : 0,
    total_xlsx: xlsxItem ? xlsxItem.Total : 0
  });
});

const csv = stringify(comparativa, { header: true, columns: [...] });
fs.writeFileSync('DATA_LAST/COMPARATIVA_APU_vs_INSUMOS.csv', csv);
```

**Ventaja**: CSV facilita análisis en Excel/Google Sheets

---

## Resultados Obtenidos

```
APU:                945 insumos únicos
XLSX:               702 insumos únicos

Análisis:
  ✅ En ambos:      640 (67.7%) - COMPRADOS
  ⚠️  Solo APU:     305 (32.3%) - NO COMPRADOS  
  ⚠️  Solo XLSX:     62 (8.8%) - EXTRAS

De 6,052 registros:
  ✅ COMPRADO:      5,531 (91.39%)
  ❌ NO COMPRADO:     521 (8.61%)
```

---

## Archivos Generados

```
DATA_LAST/
├── INSERT_INSUMOS.sql ................... SQL para cargar a Supabase
├── COMPARATIVA_APU_vs_INSUMOS.csv ....... Análisis detallado
└── [Otros archivos existentes]
```

---

## Pasos para Replicar

### Si quieres hacer algo similar con otros datos:

1. **Preparar CSV de origen** (APU)
   ```javascript
   fs.readFileSync('tu_archivo.csv', 'utf-8')
   csv.parse(csvContent, { columns: true })
   ```

2. **Preparar XLSX de referencia**
   ```javascript
   XLSX.readFile('tu_referencia.xlsx')
   sheet_to_json(sheet)
   ```

3. **Mapear estructura para tabla**
   ```javascript
   const map = new Map();
   forEach(record => {
     const key = `${record.campo1}|${record.campo2}`;
     if (!map.has(key)) map.set(key, {...});
   });
   ```

4. **Comparar Sets**
   ```javascript
   const A = new Set([...]);
   const B = new Set([...]);
   const inAmbos = [...A].filter(x => B.has(x));
   ```

5. **Generar SQL** (con escapado de strings)
6. **Generar CSV comparativa** (para análisis humano)

---

## Insights Clave

### ✅ Lo que funcionó bien:
- Usar Map para deduplicación
- Separar SQL de análisis
- CSV comparativa para análisis visual
- Transacción SQL para integridad

### ⚠️ Cuidados importantes:
- Escapar comillas simples en SQL: `'${str.replace(/'/g, "''")}'`
- Convertir a string números antes de .trim(): `String(i.Código).trim()`
- Validar datos XLSX (algunos campos pueden ser números, no strings)
- Transacción BEGIN/COMMIT en SQL

### 🎯 Próximos pasos:
1. Ejecutar INSERT_INSUMOS.sql en Supabase
2. Revisar COMPARATIVA_APU_vs_INSUMOS.csv para identificar qué NO se compró
3. Actualizar cantidad_adquirida desde INSUMOS.xlsx si es necesario

---

## Comando para ejecutar:

```bash
node generar_sql_insumos_y_comparar.js
```

Esto genera automáticamente:
- INSERT_INSUMOS.sql ✅
- COMPARATIVA_APU_vs_INSUMOS.csv ✅
- Reporte en consola ✅
