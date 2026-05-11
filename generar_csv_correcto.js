const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('✅ GENERANDO CSV - ACCESO DIRECTO A CELDAS\n');
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

// Procesar APU por celdas
const resultado = [];
let currentPartida = null;
let currentMetrado = 0;
let currentNombrePartida = '';
let currentTipo = null;

// Get sheet range
const range = XLSX.utils.decode_range(apuSheet['!ref']);
const maxRow = Math.min(200, range.e.r); // Limitar a 200 filas

console.log(`📝 PROCESANDO APU (filas 1-${maxRow})...\n`);

for (let row = 0; row <= maxRow; row++) {
  // Leer columnas principales
  const col1Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 0})];
  const col2Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 1})];
  const col10Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 9})];
  const col11Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 10})];
  const col13Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 12})];
  const col14Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 13})];
  const col15Cell = apuSheet[XLSX.utils.encode_cell({r: row, c: 14})];

  const col1 = col1Cell ? String(col1Cell.v || '').trim() : '';
  const col2 = col2Cell ? String(col2Cell.v || '').trim() : '';
  const col10 = col10Cell ? String(col10Cell.v || '').trim() : '';
  const col11 = col11Cell ? String(col11Cell.v || '') : '';
  const col13 = col13Cell ? String(col13Cell.v || '') : '';
  const col14 = col14Cell ? String(col14Cell.v || '').trim() : '';
  const col15 = col15Cell ? String(col15Cell.v || '') : '';

  // Detectar partida nueva
  if (col1.match(/^OE\.|^O\.E\./) && !col14.includes('Rendimiento') && col2 && !col2.includes('Código')) {
    currentPartida = col1;
    currentNombrePartida = col2;
    currentMetrado = presupuestoMap[currentPartida] || 0;
    currentTipo = null;

    console.log(`\n→ ${currentPartida} | ${currentNombrePartida} | Metrado: ${currentMetrado}`);
  }

  // Detectar tipo
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(col1)) {
    currentTipo = col1;
    console.log(`  • ${currentTipo}`);
  }

  // Detectar insumo (código de 9 dígitos en col 1)
  if (currentPartida && currentTipo && col1.match(/^\d{9}$/) && col2) {
    const cantidadAPU = parseFloat(col11.replace(',', '.')) || 0;
    const precioUnitario = parseFloat(col15.replace(',', '.')) || 0;
    const parcialAPU = cantidadAPU * precioUnitario;

    resultado.push({
      partida_codigo: currentPartida,
      partida_nombre: currentNombrePartida,
      metrado_fijo: currentMetrado,
      tipo_insumo: currentTipo,
      insumo_codigo: col1,
      insumo_descripcion: col2,
      unidad: col10,
      incidencia_original: cantidadAPU,
      precio_unitario: precioUnitario,
      parcial_original: parcialAPU,
      incidencia_x_metrado: cantidadAPU * currentMetrado
    });
  }
}

console.log(`\n✓ Registros procesados: ${resultado.length}\n`);

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

console.log(`✅ CSV generado: APU_COMPLETO_FINAL.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${resultado.length}\n`);

// Resumen
console.log('📊 RESUMEN:\n');
const partidas = new Set(resultado.map(r => r.partida_codigo));
const tipos = new Set(resultado.map(r => r.tipo_insumo));
const insumos = new Set(resultado.map(r => r.insumo_codigo));

console.log(`  ✓ Partidas únicas: ${partidas.size}`);
console.log(`  ✓ Insumos únicos: ${insumos.size}`);
console.log(`  ✓ Tipos: ${Array.from(tipos).join(', ')}`);

// Muestras
console.log(`\n📋 PRIMEROS 20 REGISTROS:\n`);
resultado.slice(0, 20).forEach((r, idx) => {
  const desc = r.insumo_descripcion.substring(0, 40).padEnd(40);
  console.log(`${(idx+1).toString().padStart(2)}. ${r.partida_codigo} | ${r.tipo_insumo.padEnd(12)} | ${r.insumo_codigo} | ${desc} | Incid: ${r.incidencia_original} | Precio: ${r.precio_unitario}`);
});

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ LISTO PARA CARGAR A SUPABASE\n');
