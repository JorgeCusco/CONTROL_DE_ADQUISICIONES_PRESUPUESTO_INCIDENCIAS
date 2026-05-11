const XLSX = require('xlsx');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');
const path = require('path');

console.log('📥 EXTRACCIÓN COMPLETA Y GENERACIÓN DE CSV\n');
console.log('═'.repeat(180));

const lastDir = 'DATA_LAST/ULTIMO';
const outputDir = 'DATA_LAST/EXCEL_EXTRAIDOS';

// Crear carpeta de salida
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\n✓ Carpeta creada: ${outputDir}\n`);
}

try {
  // ========================================
  // 1. EXTRAER ACU.xlsx COMPLETO
  // ========================================
  console.log('1️⃣ EXTRAYENDO ACU.xlsx\n');

  const acuWb = XLSX.readFile(`${lastDir}/ACU.xlsx`);
  const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
  const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

  let acuData = [];
  let headerRowAcu = 16; // Fila 17 (0-indexed)

  // Leer encabezados
  let acuHeaders = [];
  for (let c = 0; c <= Math.min(16, acuRange.e.c); c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRowAcu, c });
    const cell = acuSheet[cellAddr];
    acuHeaders[c] = cell ? String(cell.v || '').trim() : '';
  }

  // Leer todos los registros
  for (let r = headerRowAcu + 1; r <= acuRange.e.r; r++) {
    let row = {};
    let hasData = false;

    for (let c = 0; c <= acuRange.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      const cell = acuSheet[cellAddr];
      const val = cell ? cell.v : null;

      if (val) hasData = true;
      row[acuHeaders[c] || `col_${c}`] = val || '';
    }

    if (hasData) {
      acuData.push(row);
    }
  }

  console.log(`  ✓ ${acuData.length} registros extraídos de ACU\n`);

  const csvAcu = stringify(acuData, {
    header: true,
    columns: acuHeaders.filter(h => h)
  });

  fs.writeFileSync(`${outputDir}/ACU_COMPLETO.csv`, csvAcu);
  console.log(`  ✓ Guardado: ACU_COMPLETO.csv (${(csvAcu.length / 1024 / 1024).toFixed(2)} MB)\n`);

  // ========================================
  // 2. EXTRAER INSUMOS.xlsx COMPLETO
  // ========================================
  console.log('2️⃣ EXTRAYENDO INSUMOS.xlsx\n');

  const insumosWb = XLSX.readFile(`${lastDir}/INSUMOS.xlsx`);
  const insumosSheet = insumosWb.Sheets[insumosWb.SheetNames[0]];
  const insumosRange = XLSX.utils.decode_range(insumosSheet['!ref'] || 'A1');

  let insumosData = [];
  let headerRowInsumos = 8; // Fila 9 (0-indexed)

  // Leer encabezados
  let insumosHeaders = [];
  for (let c = 0; c <= Math.min(14, insumosRange.e.c); c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRowInsumos, c });
    const cell = insumosSheet[cellAddr];
    insumosHeaders[c] = cell ? String(cell.v || '').trim() : '';
  }

  // Leer todos los registros
  for (let r = headerRowInsumos + 1; r <= insumosRange.e.r; r++) {
    let row = {};
    let hasData = false;

    for (let c = 0; c <= insumosRange.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      const cell = insumosSheet[cellAddr];
      const val = cell ? cell.v : null;

      if (val) hasData = true;
      row[insumosHeaders[c] || `col_${c}`] = val || '';
    }

    if (hasData) {
      insumosData.push(row);
    }
  }

  console.log(`  ✓ ${insumosData.length} registros extraídos de INSUMOS\n`);

  const csvInsumos = stringify(insumosData, {
    header: true,
    columns: insumosHeaders.filter(h => h)
  });

  fs.writeFileSync(`${outputDir}/INSUMOS_COMPLETO.csv`, csvInsumos);
  console.log(`  ✓ Guardado: INSUMOS_COMPLETO.csv (${(csvInsumos.length / 1024 / 1024).toFixed(2)} MB)\n`);

  // ========================================
  // 3. EXTRAER PRESUPUESTO.xlsx COMPLETO
  // ========================================
  console.log('3️⃣ EXTRAYENDO PRESUPUESTO.xlsx\n');

  const presupuestoWb = XLSX.readFile(`${lastDir}/PRESUPUESTO.xlsx`);
  const presupuestoSheet = presupuestoWb.Sheets[presupuestoWb.SheetNames[0]];
  const presupuestoRange = XLSX.utils.decode_range(presupuestoSheet['!ref'] || 'A1');

  let presupuestoData = [];
  let headerRowPresupuesto = 9; // Fila 10 (0-indexed)

  // Leer encabezados
  let presupuestoHeaders = [];
  for (let c = 0; c <= Math.min(17, presupuestoRange.e.c); c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: headerRowPresupuesto, c });
    const cell = presupuestoSheet[cellAddr];
    presupuestoHeaders[c] = cell ? String(cell.v || '').trim() : '';
  }

  // Leer todos los registros
  for (let r = headerRowPresupuesto + 1; r <= presupuestoRange.e.r; r++) {
    let row = {};
    let hasData = false;

    for (let c = 0; c <= presupuestoRange.e.c; c++) {
      const cellAddr = XLSX.utils.encode_cell({ r, c });
      const cell = presupuestoSheet[cellAddr];
      const val = cell ? cell.v : null;

      if (val) hasData = true;
      row[presupuestoHeaders[c] || `col_${c}`] = val || '';
    }

    if (hasData) {
      presupuestoData.push(row);
    }
  }

  console.log(`  ✓ ${presupuestoData.length} registros extraídos de PRESUPUESTO\n`);

  const csvPresupuesto = stringify(presupuestoData, {
    header: true,
    columns: presupuestoHeaders.filter(h => h)
  });

  fs.writeFileSync(`${outputDir}/PRESUPUESTO_COMPLETO.csv`, csvPresupuesto);
  console.log(`  ✓ Guardado: PRESUPUESTO_COMPLETO.csv (${(csvPresupuesto.length / 1024 / 1024).toFixed(2)} MB)\n`);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('═'.repeat(180));
  console.log('\n📊 EXTRACCIÓN COMPLETADA\n');
  console.log('ARCHIVOS GENERADOS:\n');
  console.log(`1. ACU_COMPLETO.csv`);
  console.log(`   Registros: ${acuData.length}`);
  console.log(`   Columnas: ${acuHeaders.filter(h => h).join(', ')}\n`);

  console.log(`2. INSUMOS_COMPLETO.csv`);
  console.log(`   Registros: ${insumosData.length}`);
  console.log(`   Columnas: ${insumosHeaders.filter(h => h).join(', ')}\n`);

  console.log(`3. PRESUPUESTO_COMPLETO.csv`);
  console.log(`   Registros: ${presupuestoData.length}`);
  console.log(`   Columnas: ${presupuestoHeaders.filter(h => h).join(', ')}\n`);

  console.log(`📁 Ubicación: ${outputDir}/\n`);
  console.log('═'.repeat(180));
  console.log('\n✅ EXTRACCIÓN FINAL COMPLETADA\n');

} catch (err) {
  console.error(`\n❌ Error: ${err.message}\n`);
  process.exit(1);
}
