const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📊 EXTRAYENDO DATOS DE APU Y PRESUPUESTO.xlsx\n');
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

console.log('🔄 Procesando partidas e insumos...\n');

let procesedPartidas = 0;
let processedInsumos = 0;

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
  const n = colN ? String(colN.v || '').trim() : '';

  // Detectar partida nueva (formato: OE.X.X.X.X o O.E.X.X.X.X)
  if (a.match(/^O(\.)?E\./)) {
    currentPartida = a;
    currentDescripcion = '';
    currentRendimiento = '';
    currentCostoUnitario = 0;
    currentTipo = null;
    inHeaders = false;

    // El nombre está en la siguiente fila
    const nextRow = row + 1;
    const nextColA = apuSheet[XLSX.utils.encode_cell({r: nextRow, c: 0})];
    currentDescripcion = nextColA ? String(nextColA.v || '').trim() : '';

    // El costo unitario está 2 filas abajo en columna P
    const costRow = row + 2;
    const costCell = apuSheet[XLSX.utils.encode_cell({r: costRow, c: 15})];
    currentCostoUnitario = costCell ? parseFloat(costCell.v) || 0 : 0;

    // El rendimiento está en columna N (formato: "Rendimiento: 40 m²/día")
    const rendCell = apuSheet[XLSX.utils.encode_cell({r: row, c: 13})];
    currentRendimiento = rendCell ? String(rendCell.v || '').trim() : '';

    procesedPartidas++;

    if (procesedPartidas % 100 === 0) {
      process.stdout.write('.');
    }
  }

  // Detectar headers (fila con "Código" y "Descripción")
  if (a === 'Código' && b === 'Descripción') {
    inHeaders = true;
    continue;
  }

  // Detectar tipo de insumo (MANO DE OBRA, MATERIALES, EQUIPO)
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(a) && currentPartida) {
    currentTipo = a;
    continue;
  }

  // Detectar insumo (si tenemos partida, tipo y la fila tiene código en A)
  if (currentPartida && currentTipo && a && a.match(/^\d+$/) && b && j && inHeaders) {
    apus.push({
      partida_codigo: currentPartida,
      partida_descripcion: currentDescripcion,
      partida_rendimiento: currentRendimiento,
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
    processedInsumos++;
  }
}

console.log('\n');
console.log(`✓ Partidas procesadas: ${procesedPartidas}`);
console.log(`✓ Insumos extraídos: ${processedInsumos}\n`);

// Mostrar primeros registros
console.log('📋 PRIMEROS 10 REGISTROS:\n');
apus.slice(0, 10).forEach((a, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. [${a.partida_codigo}] ${a.insumo_descripcion.substring(0, 30).padEnd(30)} | Tipo: ${a.tipo_insumo.padEnd(15)} | Cantidad: ${a.insumo_cantidad}`);
});

// Generar CSV
console.log('\n💾 GENERANDO CSV...\n');

const csvContent = stringify(apus, {
  header: true,
  columns: [
    'partida_codigo',
    'partida_descripcion',
    'partida_rendimiento',
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

// Guardar en raíz y en DATA_LAST
fs.writeFileSync('APU_PRESUPUESTO_FINAL.csv', csvContent, 'utf-8');
fs.copyFileSync('APU_PRESUPUESTO_FINAL.csv', 'DATA_LAST/APU_PRESUPUESTO_FINAL.csv');

console.log(`✅ Archivos generados:`);
console.log(`   • APU_PRESUPUESTO_FINAL.csv (${(csvContent.length / 1024).toFixed(2)} KB) en raíz`);
console.log(`   • APU_PRESUPUESTO_FINAL.csv en DATA_LAST/`);
console.log(`   Registros: ${apus.length}\n`);

// Análisis
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

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ CSV GENERADO EN DATA_LAST/\n');
