const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📊 LIMPIANDO Y PROCESANDO DATOS\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
const apuSheet = book.Sheets['APU'];

const range = XLSX.utils.decode_range(apuSheet['!ref']);
const maxRow = range.e.r + 1;

console.log(`\n✓ Hoja APU: ${maxRow} filas\n`);

// Procesar APU sheet
const apus = [];
let currentPartida = null;
let currentDescripcion = '';
let currentRendimiento = '';
let currentCostoUnitario = 0;
let currentTipo = null;
let inHeaders = false;

console.log('🔄 Procesando y limpiando datos...\n');

let procesedPartidas = 0;

for (let row = 0; row < maxRow; row++) {
  const colA = apuSheet[XLSX.utils.encode_cell({r: row, c: 0})];
  const colB = apuSheet[XLSX.utils.encode_cell({r: row, c: 1})];
  const colJ = apuSheet[XLSX.utils.encode_cell({r: row, c: 9})];
  const colK = apuSheet[XLSX.utils.encode_cell({r: row, c: 10})];
  const colM = apuSheet[XLSX.utils.encode_cell({r: row, c: 12})];
  const colO = apuSheet[XLSX.utils.encode_cell({r: row, c: 14})];
  const colP = apuSheet[XLSX.utils.encode_cell({r: row, c: 15})];
  const colN = apuSheet[XLSX.utils.encode_cell({r: row, c: 13})];

  const a = colA ? String(colA.v || '').trim() : '';
  const b = colB ? String(colB.v || '').trim() : '';
  const j = colJ ? String(colJ.v || '').trim() : '';
  const k = colK ? String(colK.v || '').trim() : '';
  const m = colM ? parseFloat(colM.v) : 0;
  const o = colO ? parseFloat(colO.v) : 0;
  const p = colP ? parseFloat(colP.v) : 0;
  let n = colN ? String(colN.v || '').trim() : '';

  // Limpiar rendimiento: quitar "Rendimiento:"
  if (n.startsWith('Rendimiento:')) {
    n = n.replace('Rendimiento:', '').trim();
  }

  // Detectar partida nueva
  if (a.match(/^O(\.)?E\./)) {
    currentPartida = a;
    currentDescripcion = '';
    currentRendimiento = '';
    currentCostoUnitario = 0;
    currentTipo = null;
    inHeaders = false;

    const nextRow = row + 1;
    const nextColA = apuSheet[XLSX.utils.encode_cell({r: nextRow, c: 0})];
    currentDescripcion = nextColA ? String(nextColA.v || '').trim() : '';

    const costRow = row + 2;
    const costCell = apuSheet[XLSX.utils.encode_cell({r: costRow, c: 15})];
    currentCostoUnitario = costCell ? parseFloat(costCell.v) || 0 : 0;

    currentRendimiento = n;

    procesedPartidas++;

    if (procesedPartidas % 100 === 0) {
      process.stdout.write('.');
    }
  }

  if (a === 'Código' && b === 'Descripción') {
    inHeaders = true;
    continue;
  }

  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(a) && currentPartida) {
    currentTipo = a;
    continue;
  }

  if (currentPartida && currentTipo && a && a.match(/^\d+$/) && b && j && inHeaders) {
    apus.push({
      partida_codigo: currentPartida,
      partida_descripcion: currentDescripcion,
      partida_rendimiento: currentRendimiento,
      partida_unidad: '',
      partida_costo_unitario: currentCostoUnitario,
      tipo_insumo: currentTipo,
      insumo_codigo: a,
      insumo_descripcion: b,
      insumo_unidad: j,
      insumo_recursos: k ? parseFloat(k) : 0,
      insumo_cantidad: m,
      insumo_precio: o,
      insumo_parcial: p
    });
  }
}

console.log('\n');
console.log(`✓ Total registros: ${apus.length}\n`);

// Generar CSV limpio
console.log('💾 GENERANDO CSV LIMPIO...\n');

const csvContent = stringify(apus, {
  header: true,
  columns: [
    'partida_codigo',
    'partida_descripcion',
    'partida_rendimiento',
    'partida_unidad',
    'partida_costo_unitario',
    'tipo_insumo',
    'insumo_codigo',
    'insumo_descripcion',
    'insumo_unidad',
    'insumo_recursos',
    'insumo_cantidad',
    'insumo_precio',
    'insumo_parcial'
  ]
});

fs.writeFileSync('DATA_LAST/APU_PRESUPUESTO_LIMPIO.csv', csvContent, 'utf-8');

console.log(`✅ CSV limpio guardado: DATA_LAST/APU_PRESUPUESTO_LIMPIO.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB\n`);

// Generar SQL
console.log('💾 GENERANDO SQL INSERT...\n');

let sqlContent = '-- SQL INSERT PARA TABLA apus_detallado\n';
sqlContent += '-- Generado automáticamente desde APU Y PRESUPUESTO.xlsx\n';
sqlContent += '-- Total de registros: ' + apus.length + '\n\n';

sqlContent += 'BEGIN TRANSACTION;\n\n';

sqlContent += 'INSERT INTO apus_detallado (\n';
sqlContent += '  partida_codigo,\n';
sqlContent += '  partida_descripcion,\n';
sqlContent += '  partida_rendimiento,\n';
sqlContent += '  partida_unidad,\n';
sqlContent += '  partida_costo_unitario,\n';
sqlContent += '  tipo_insumo,\n';
sqlContent += '  insumo_codigo,\n';
sqlContent += '  insumo_descripcion,\n';
sqlContent += '  insumo_unidad,\n';
sqlContent += '  insumo_recursos,\n';
sqlContent += '  insumo_cantidad,\n';
sqlContent += '  insumo_precio,\n';
sqlContent += '  insumo_parcial\n';
sqlContent += ') VALUES\n';

const valueLines = apus.map((a, idx) => {
  const isLast = idx === apus.length - 1;
  const ending = isLast ? ';' : ',';
  return `('${a.partida_codigo.replace(/'/g, "''")}', '${a.partida_descripcion.replace(/'/g, "''")}', '${a.partida_rendimiento.replace(/'/g, "''")}', '${a.partida_unidad || ''}', ${a.partida_costo_unitario}, '${a.tipo_insumo}', '${a.insumo_codigo}', '${a.insumo_descripcion.replace(/'/g, "''")}', '${a.insumo_unidad}', ${a.insumo_recursos}, ${a.insumo_cantidad}, ${a.insumo_precio}, ${a.insumo_parcial})${ending}`;
});

sqlContent += valueLines.join('\n');

sqlContent += '\n\nCOMMIT;\n';

fs.writeFileSync('DATA_LAST/INSERT_APUS_DETALLADO.sql', sqlContent, 'utf-8');

console.log(`✅ SQL guardado: DATA_LAST/INSERT_APUS_DETALLADO.sql`);
console.log(`   Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

// Mostrar análisis
console.log('📊 ANÁLISIS:\n');

const partidas = new Set(apus.map(a => a.partida_codigo));
const insumos = new Set(apus.map(a => a.insumo_codigo));
const tipos = new Set(apus.map(a => a.tipo_insumo));

console.log(`  ✓ Partidas únicas: ${partidas.size}`);
console.log(`  ✓ Insumos únicos: ${insumos.size}`);
console.log(`  ✓ Tipos: ${Array.from(tipos).join(', ')}\n`);

const byTipo = {};
apus.forEach(a => {
  byTipo[a.tipo_insumo] = (byTipo[a.tipo_insumo] || 0) + 1;
});

console.log('  Distribución por tipo:\n');
Object.entries(byTipo).sort((a, b) => b[1] - a[1]).forEach(([tipo, count]) => {
  console.log(`    ${tipo.padEnd(20)}: ${count} registros`);
});

// Mostrar primeros registros
console.log('\n\n📋 PRIMEROS 5 REGISTROS DEL CSV (RENDIMIENTO LIMPIO):\n');
apus.slice(0, 5).forEach((a, idx) => {
  console.log(`${(idx+1)}. [${a.partida_codigo}] ${a.partida_descripcion.substring(0, 35).padEnd(35)} | Rend: ${a.partida_rendimiento} | ${a.insumo_descripcion.substring(0, 30)}`);
});

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ ARCHIVOS LISTOS EN DATA_LAST/\n');
console.log('  • APU_PRESUPUESTO_LIMPIO.csv (CSV con rendimiento limpio)');
console.log('  • INSERT_APUS_DETALLADO.sql (SQL para ejecutar en Supabase)\n');
