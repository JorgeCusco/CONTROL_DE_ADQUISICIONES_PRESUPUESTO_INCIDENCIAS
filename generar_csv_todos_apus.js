const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('✅ PROCESANDO TODOS LOS APUs (ARCHIVO COMPLETO)\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');
const apuSheet = book.Sheets['APU'];
const presupuestoSheet = book.Sheets['PRESUPUESTO'];

// Leer presupuesto
const presupuestoData = XLSX.utils.sheet_to_json(presupuestoSheet, { defval: '' });
const presupuestoMap = {};
presupuestoData.forEach(row => {
  const item = row['Item'] || '';
  if (item) {
    presupuestoMap[item] = parseFloat(row['Cant.']) || 0;
  }
});

console.log(`✓ Presupuesto: ${Object.keys(presupuestoMap).length} partidas\n`);

// Procesar TODO el APU
const resultado = [];
let currentPartida = null;
let currentNombrePartida = '';
let currentMetrado = 0;
let currentTipo = null;
let inHeaders = false;

const range = XLSX.utils.decode_range(apuSheet['!ref']);
const maxRow = range.e.r + 1; // Todas las filas

console.log(`📝 PROCESANDO APU (${maxRow} filas totales)...\n`);

let procesedPartidas = 0;

for (let row = 0; row < maxRow; row++) {
  const col1Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 0})];
  const col2Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 1})];
  const col10Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 9})];
  const col11Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 10})];
  const col15Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 14})];

  const col1 = col1Cell ? String(col1Cell.v || '').trim() : '';
  const col2 = col2Cell ? String(col2Cell.v || '').trim() : '';
  const col10 = col10Cell ? String(col10Cell.v || '').trim() : '';
  const col11 = col11Cell ? (col11Cell.v) : '';
  const col15 = col15Cell ? (col15Cell.v) : '';

  // Detectar partida nueva
  if (col1.match(/^OE\.|^O\.E\./) && !inHeaders) {
    currentPartida = col1;

    // El nombre está en la siguiente fila
    const nextRow = row + 1;
    const nextCol1Cell = apuSheet[XLSX.utils.encode_cell({r: nextRow, c: 0})];
    currentNombrePartida = nextCol1Cell ? String(nextCol1Cell.v || '').trim() : '';
    currentMetrado = presupuestoMap[currentPartida] || 0;
    inHeaders = false;

    procesedPartidas++;

    if (procesedPartidas % 50 === 0) {
      process.stdout.write('.');
    }
  }

  // Detectar headers
  if (col1 === 'Código' && col2 === 'Descripción') {
    inHeaders = true;
    continue;
  }

  // Detectar tipo
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(col1) && currentPartida) {
    currentTipo = col1;
    continue;
  }

  // Detectar insumo
  if (currentPartida && currentTipo && col1.match(/^\d{9}$/) && col2) {
    const cantAPU = parseFloat(String(col11 || 0).replace(',', '.')) || 0;
    const precUnitario = parseFloat(String(col15 || 0).replace(',', '.')) || 0;
    const parcialAPU = cantAPU * precUnitario;

    resultado.push({
      partida_codigo: currentPartida,
      partida_nombre: currentNombrePartida,
      metrado_fijo: currentMetrado,
      tipo_insumo: currentTipo,
      insumo_codigo: col1,
      insumo_descripcion: col2,
      unidad: col10,
      incidencia_original: cantAPU,
      precio_unitario: precUnitario,
      parcial_original: parcialAPU,
      incidencia_x_metrado: cantAPU * currentMetrado
    });
  }
}

console.log('\n');
console.log(`\n✓ Partidas procesadas: ${procesedPartidas}`);
console.log(`✓ Total registros: ${resultado.length}\n`);

// Generar CSV
console.log('💾 GENERANDO CSV CON TODOS LOS APUs...\n');

const csvContent = stringify(resultado, {
  header: true,
  columns: [
    'partida_codigo',
    'partida_nombre',
    'metrado_fijo',
    'tipo_insumo',
    'insumo_codigo',
    'insumo_descripcion',
    'unidad',
    'incidencia_original',
    'precio_unitario',
    'parcial_original',
    'incidencia_x_metrado'
  ]
});

fs.writeFileSync('APU_TODOS_COMPLETO.csv', csvContent, 'utf-8');

console.log(`✅ Archivo: APU_TODOS_COMPLETO.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${resultado.length}\n`);

// Análisis
console.log('📊 ANÁLISIS:\n');

const partidas = new Set(resultado.map(r => r.partida_codigo));
const tipos = new Set(resultado.map(r => r.tipo_insumo));
const insumos = new Set(resultado.map(r => r.insumo_codigo));
const conDatos = resultado.filter(r => r.incidencia_original > 0);
const sinDatos = resultado.filter(r => r.incidencia_original === 0);

console.log(`  ✓ Partidas: ${partidas.size}`);
console.log(`  ✓ Insumos únicos: ${insumos.size}`);
console.log(`  ✓ Tipos: ${Array.from(tipos).join(', ')}`);
console.log(`  ✅ Con incidencia > 0: ${conDatos.length} (${((conDatos.length/resultado.length)*100).toFixed(2)}%)`);
console.log(`  ⚠️  Sin incidencia (=0): ${sinDatos.length} (${((sinDatos.length/resultado.length)*100).toFixed(2)}%)`);

// Mostrar distribución por tipo
console.log(`\n  Distribución por tipo:\n`);
const byTipo = {};
resultado.forEach(r => {
  byTipo[r.tipo_insumo] = (byTipo[r.tipo_insumo] || 0) + 1;
});
Object.entries(byTipo).sort((a, b) => b[1] - a[1]).forEach(([tipo, count]) => {
  const conData = resultado.filter(r => r.tipo_insumo === tipo && r.incidencia_original > 0).length;
  console.log(`    ${tipo.padEnd(20)}: ${count} total | ${conData} con datos`);
});

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ CSV CON TODOS LOS APUs LISTO\n');
