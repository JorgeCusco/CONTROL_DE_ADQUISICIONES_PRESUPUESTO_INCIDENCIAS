const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { parse: csvParse } = require('csv-parse/sync');

console.log('📦 CONSOLIDANDO BASE DE DATOS FINAL\n');
console.log('═'.repeat(150));

try {
  // Crear carpeta FINAL si no existe
  const finalDir = 'DATA_LAST/BD_FINAL';
  if (!fs.existsSync(finalDir)) {
    fs.mkdirSync(finalDir, { recursive: true });
  }

  // 1. PARTIDAS
  console.log('\n1️⃣  PARTIDAS\n');

  const partidasCSV = fs.readFileSync('DATA_LAST/PARTIDAS.csv', 'utf-8');
  const partidasData = csvParse(partidasCSV, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`  ✓ ${partidasData.length} registros`);

  // Excel
  const wbPartidas = XLSX.utils.book_new();
  const wsPartidas = XLSX.utils.json_to_sheet(partidasData);
  XLSX.utils.book_append_sheet(wbPartidas, wsPartidas, 'partidas');
  XLSX.writeFile(wbPartidas, `${finalDir}/partidas.xlsx`);
  console.log(`  ✓ Excel: partidas.xlsx`);

  // CSV
  fs.copyFileSync('DATA_LAST/AA.partidas.csv', `${finalDir}/partidas.csv`);
  console.log(`  ✓ CSV: partidas.csv`);

  // 2. APUS_DETALLADO
  console.log('\n2️⃣  APUS_DETALLADO\n');

  const apusCSV = fs.readFileSync('DATA_LAST/AA.apus_detallado.csv', 'utf-8');
  const apusData = csvParse(apusCSV, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`  ✓ ${apusData.length} registros`);

  // Excel
  const wbApus = XLSX.utils.book_new();
  const wsApus = XLSX.utils.json_to_sheet(apusData);
  XLSX.utils.book_append_sheet(wbApus, wsApus, 'apus_detallado');
  XLSX.writeFile(wbApus, `${finalDir}/apus_detallado.xlsx`);
  console.log(`  ✓ Excel: apus_detallado.xlsx`);

  // CSV
  fs.copyFileSync('DATA_LAST/AA.apus_detallado.csv', `${finalDir}/apus_detallado.csv`);
  console.log(`  ✓ CSV: apus_detallado.csv`);

  // 3. INSUMOS
  console.log('\n3️⃣  INSUMOS\n');

  const insumosCSV = fs.readFileSync('DATA_LAST/AA.insumos.csv', 'utf-8');
  const insumosData = csvParse(insumosCSV, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`  ✓ ${insumosData.length} registros`);

  // Excel
  const wbInsumos = XLSX.utils.book_new();
  const wsInsumos = XLSX.utils.json_to_sheet(insumosData);
  XLSX.utils.book_append_sheet(wbInsumos, wsInsumos, 'insumos');
  XLSX.writeFile(wbInsumos, `${finalDir}/insumos.xlsx`);
  console.log(`  ✓ Excel: insumos.xlsx`);

  // CSV
  fs.copyFileSync('DATA_LAST/AA.insumos.csv', `${finalDir}/insumos.csv`);
  console.log(`  ✓ CSV: insumos.csv`);

  // 4. COPIAR INSERT SQL CONSOLIDADOS
  console.log('\n4️⃣  INSERT SQL\n');

  fs.copyFileSync('DATA_LAST/INSERT_AA.apus_detallado.sql', `${finalDir}/INSERT_apus_detallado.sql`);
  console.log(`  ✓ SQL: INSERT_apus_detallado.sql (6,140 registros)`);

  fs.copyFileSync('DATA_LAST/INSERT_AA.insumos.sql', `${finalDir}/INSERT_insumos.sql`);
  console.log(`  ✓ SQL: INSERT_insumos.sql (6,124 registros)`);

  // 5. CREAR README
  console.log('\n5️⃣  Generando README\n');

  const readme = `# BASE DE DATOS FINAL - BELEMPAMPA

## 📊 Tablas Incluidas

### 1. PARTIDAS (1,135 registros)
**Presupuesto base del proyecto**
- Código de partida (OE.X.X.X.X)
- Descripción
- Unidad de medida
- Metrado fijo (cantidad presupuestada)
- Precio unitario presupuestado
- Total presupuestado

Archivos:
- partidas.xlsx
- partidas.csv
- INSERT_partidas.sql (ya ejecutado en Supabase)

---

### 2. APUS_DETALLADO (6,140 registros)
**Análisis de Precios Unitarios - Desglose por insumo**
- Partida (código y descripción)
- Rendimiento y costo unitario de partida
- Tipo de insumo (MANO DE OBRA, MATERIALES, EQUIPO)
- Insumo (código, descripción, unidad)
- Recursos, Cantidad, Precio, Parcial

Archivos:
- apus_detallado.xlsx
- apus_detallado.csv
- INSERT_apus_detallado.sql

---

### 3. INSUMOS (6,124 registros)
**Tabla de control - Insumos únicos por partida**
- Código de partida
- Código y descripción del insumo
- Unidad de medida
- Incidencia original (cantidad según APU)
- Parcial original (costo total según APU)
- Campos para edición: incidencia, cantidad_modificada, cantidad_adquirida
- Comentarios y flags (es_extra)

Archivos:
- insumos.xlsx
- insumos.csv
- INSERT_insumos.sql

---

## 🔄 ORDEN DE INSERCIÓN EN SUPABASE

1. ✅ **PARTIDAS** - Ya insertada
2. ⏳ **APUS_DETALLADO** - Ejecutar INSERT_apus_detallado.sql
3. ⏳ **INSUMOS** - Ejecutar INSERT_insumos.sql

---

## 📁 ESTRUCTURA DE CARPETA

\`\`\`
BD_FINAL/
├── partidas.xlsx          (Excel)
├── partidas.csv           (CSV)
├── apus_detallado.xlsx    (Excel)
├── apus_detallado.csv     (CSV)
├── insumos.xlsx           (Excel)
├── insumos.csv            (CSV)
├── INSERT_apus_detallado.sql
├── INSERT_insumos.sql
└── README.md (este archivo)
\`\`\`

---

## 📝 CÓMO USAR

### Importar a Supabase:
1. Abre Supabase SQL Editor
2. Copia contenido de INSERT_apus_detallado.sql → Run
3. Copia contenido de INSERT_insumos.sql → Run

### Usar en Excel/Sheets:
- Abre cualquier archivo .xlsx para ver/editar datos
- CSV también disponible para importar a otras aplicaciones

### Respaldar datos:
- Todos los formatos (Excel, CSV, SQL) están aquí
- Puedes usar cualquiera según tus necesidades

---

## 📊 RESUMEN DE DATOS

| Tabla | Registros | Columnas | Archivo |
|-------|-----------|----------|---------|
| PARTIDAS | 1,135 | 7 | partidas.xlsx |
| APUS_DETALLADO | 6,140 | 13 | apus_detallado.xlsx |
| INSUMOS | 6,124 | 12 | insumos.xlsx |

---

**Generado:** ${new Date().toLocaleString()}
**Proyecto:** Belempampa - Sistema de Control de Insumos
**BD:** 7_insumos_rado (Supabase)
`;

  fs.writeFileSync(`${finalDir}/README.md`, readme);
  console.log(`  ✓ README.md generado\n`);

  // 6. Resumen
  console.log('═'.repeat(150));
  console.log('\n✅ BASE DE DATOS FINAL CONSOLIDADA\n');
  console.log(`📁 Ubicación: DATA_LAST/BD_FINAL/\n`);
  console.log('📋 Archivos:\n');

  const files = fs.readdirSync(finalDir).sort();
  files.forEach((file, idx) => {
    const filepath = path.join(finalDir, file);
    const stats = fs.statSync(filepath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ${(idx + 1).toString().padStart(2)}. ${file.padEnd(35)} (${size} KB)`);
  });

  console.log('\n' + '═'.repeat(150));
  console.log('\n✨ TODO LISTO PARA SUPABASE\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log(err);
}
