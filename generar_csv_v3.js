const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('✅ GENERANDO CSV - VERSIÓN 3\n');
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

// Procesar APU
const resultado = [];
let currentPartida = null;
let currentNombrePartida = '';
let currentMetrado = 0;
let currentTipo = null;
let inHeaders = false;

const maxRow = 200;

console.log(`📝 PROCESANDO APU (filas 1-${maxRow})...\n`);

for (let row = 0; row < maxRow; row++) {
  const col1Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 0})];
  const col2Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 1})];
  const col10Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 9})];
  const col11Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 10})];
  const col13Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 12})];
  const col15Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 14})];

  const col1 = col1Cell ? String(col1Cell.v || '').trim() : '';
  const col2 = col2Cell ? String(col2Cell.v || '').trim() : '';
  const col10 = col10Cell ? String(col10Cell.v || '').trim() : '';
  const col11 = col11Cell ? (col11Cell.v) : '';
  const col13 = col13Cell ? (col13Cell.v) : '';
  const col15 = col15Cell ? (col15Cell.v) : '';

  // Detectar partida (patrón: OE.X.X.X.X en Col1)
  if (col1.match(/^OE\.|^O\.E\./) && !inHeaders) {
    currentPartida = col1;
    // El nombre está en la siguiente fila
    const nextRow = row + 1;
    const nextCol1Cell = apuSheet[XLSX.utils.encode_cell({r: nextRow, c: 0})];
    currentNombrePartida = nextCol1Cell ? String(nextCol1Cell.v || '').trim() : '';
    currentMetrado = presupuestoMap[currentPartida] || 0;
    inHeaders = false;

    console.log(`\n→ ${currentPartida}`);
    if (currentNombrePartida) {
      console.log(`  ${currentNombrePartida.substring(0, 60)}`);
    }
    console.log(`  Metrado: ${currentMetrado}`);
  }

  // Detectar headers (fila con "Código" y "Descripción")
  if (col1 === 'Código' && col2 === 'Descripción') {
    inHeaders = true;
    continue;
  }

  // Detectar tipo de insumo
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(col1) && currentPartida) {
    currentTipo = col1;
    console.log(`  • ${currentTipo}`);
    continue;
  }

  // Detectar insumo (código 9 dígitos + descripción en Col2)
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

console.log(`\n✓ Total: ${resultado.length} registros\n`);

// Generar CSV
console.log('💾 GENERANDO CSV...\n');

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

fs.writeFileSync('APU_COMPLETO_FINAL.csv', csvContent, 'utf-8');

console.log(`✅ Archivo: APU_COMPLETO_FINAL.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${resultado.length}\n`);

// Resumen
console.log('📊 RESUMEN:\n');
const partidas = new Set(resultado.map(r => r.partida_codigo));
const tipos = new Set(resultado.map(r => r.tipo_insumo));
const insumos = new Set(resultado.map(r => r.insumo_codigo));

console.log(`  ✓ Partidas: ${partidas.size}`);
console.log(`  ✓ Insumos: ${insumos.size}`);
console.log(`  ✓ Tipos: ${Array.from(tipos).join(', ')}`);

// Mostrar muestras
if (resultado.length > 0) {
  console.log(`\n📋 PRIMEROS 15 REGISTROS:\n`);
  resultado.slice(0, 15).forEach((r, idx) => {
    console.log(`${(idx+1).toString().padStart(2)}. ${r.partida_codigo} | ${r.tipo_insumo.padEnd(12)} | ${r.insumo_codigo} | ${r.insumo_descripcion.substring(0,35).padEnd(35)} | Incid=${r.incidencia_original} | Precio=${r.precio_unitario}`);
  });
}

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ CSV LISTO\n');
