const XLSX = require('xlsx');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

console.log('✅ EXTRACCIÓN COMPRAS.xlsx\n');
console.log('═'.repeat(200));

const comprasPath = 'DATA_LAST/ULTIMO/COMPRAS.xlsx';
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';

// =====================================================
// EXTRAER COMPRAS
// =====================================================
console.log('\n1️⃣ LEYENDO COMPRAS.xlsx\n');

const comprasWb = XLSX.readFile(comprasPath);
const comprasSheet = comprasWb.Sheets[comprasWb.SheetNames[0]];
const comprasRange = XLSX.utils.decode_range(comprasSheet['!ref'] || 'A1');

let comprasData = [];
let headerRow = -1;

// Detectar fila de encabezado
for (let r = 0; r <= Math.min(5, comprasRange.e.r); r++) {
  const cellA = comprasSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const valA = cellA ? String(cellA.v || '').trim().toLowerCase() : '';

  if (valA.includes('anio') || valA.includes('año')) {
    headerRow = r;
    break;
  }
}

if (headerRow === -1) headerRow = 0;
console.log(`  Fila de encabezado: ${headerRow + 1}\n`);

// Leer desde la fila después del encabezado
for (let r = headerRow + 1; r <= comprasRange.e.r; r++) {
  const cellA = comprasSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = comprasSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellC = comprasSheet[XLSX.utils.encode_cell({ r, c: 2 })];
  const cellD = comprasSheet[XLSX.utils.encode_cell({ r, c: 3 })];
  const cellE = comprasSheet[XLSX.utils.encode_cell({ r, c: 4 })];
  const cellF = comprasSheet[XLSX.utils.encode_cell({ r, c: 5 })];
  const cellG = comprasSheet[XLSX.utils.encode_cell({ r, c: 6 })];
  const cellH = comprasSheet[XLSX.utils.encode_cell({ r, c: 7 })];

  const valA = cellA ? (cellA.v || '') : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valC = cellC ? String(cellC.v || '').trim() : '';
  const valD = cellD ? String(cellD.v || '').trim() : '';
  const valE = cellE ? (cellE.v || '') : '';
  const valF = cellF ? (cellF.v || '') : '';
  const valG = cellG ? String(cellG.v || '').trim() : '';
  const valH = cellH ? String(cellH.v || '').trim() : '';

  // Cualquier fila que tenga al menos detalle se considera data
  if (valC) {
    const cantidad = valE !== '' ? parseFloat(valE) : 0;
    const precioUnit = valF !== '' ? parseFloat(valF) : 0;
    const total = cantidad * precioUnit;
    const completo = (valA !== '' && valA !== null && valF !== '' && valF !== null);

    comprasData.push({
      anio: valA !== '' && valA !== null ? valA : '',
      componente: valB,
      detalle: valC,
      unidad: valD,
      cantidad: cantidad,
      precio_unit: precioUnit,
      total: total,
      tipo_compra: valG,
      num_compra: valH,
      completo: completo ? 'true' : 'false'
    });
  }
}

console.log(`  ✓ ${comprasData.length} registros de compra extraídos`);
console.log(`  ✓ Registros completos (con año + precio): ${comprasData.filter(r => r.completo === 'true').length}`);
console.log(`  ✓ Registros incompletos (sin año o sin precio): ${comprasData.filter(r => r.completo === 'false').length}\n`);

// Generar CSV COMPRAS_C
const csvCompras = stringify(comprasData, {
  header: true,
  columns: [
    'anio',
    'componente',
    'detalle',
    'unidad',
    'cantidad',
    'precio_unit',
    'total',
    'tipo_compra',
    'num_compra',
    'completo'
  ]
});

// Agregar BOM UTF-8
const csvComprasConBOM = '﻿' + csvCompras;

fs.writeFileSync(`${outputDir}/COMPRAS_C.csv`, csvComprasConBOM, 'utf8');
console.log(`  ✓ Guardado: COMPRAS_C.csv\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN FINAL\n');
console.log(`COMPRAS_C.csv`);
console.log(`  Registros totales: ${comprasData.length}`);
console.log(`  Completitud: ${((comprasData.filter(r => r.completo === 'true').length / comprasData.length) * 100).toFixed(1)}%`);
console.log(`  Estructura: anio | componente | detalle | unidad | cantidad | precio_unit | total | tipo_compra | num_compra | completo\n`);

console.log('═'.repeat(200));
console.log('\n✅ EXTRACCIÓN COMPLETADA\n');
console.log(`📁 Archivo guardado en: ${outputDir}/COMPRAS_C.csv\n`);
