const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📊 GENERANDO CSV DESDE APUS_Extraidos_v2.xlsx\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APUS_Extraidos_v2.xlsx');
const sheet = book.Sheets['Sheet1'];

// Leer datos
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`\n✓ Registros encontrados: ${data.length}\n`);

// Mapear según estructura real
const apus = [];

data.forEach((row) => {
  apus.push({
    partida_codigo: row.Partida_Codigo || '',
    partida_descripcion: row.Partida_Descripcion || '',
    partida_rendimiento: row.Partida_Rendimiento || '',
    partida_unidad: row.Partida_Unidad || '',
    partida_costo_unitario: parseFloat(row.Partida_Costo_Unitario) || 0,
    tipo_insumo: row.Tipo_Insumo || '',
    insumo_codigo: row.Insumo_Codigo || '',
    insumo_descripcion: row.Insumo_Descripcion || '',
    insumo_unidad: row.Insumo_Unidad || '',
    insumo_recursos: parseFloat(row.Insumo_Recursos) || 0,
    insumo_cantidad: parseFloat(row.Insumo_Cantidad) || 0,
    insumo_precio: parseFloat(row.Insumo_Precio) || 0,
    insumo_parcial: parseFloat(row.Insumo_Parcial) || 0
  });
});

console.log(`✓ APUs procesados: ${apus.length}\n`);

// Mostrar primeros registros
console.log('📋 PRIMEROS 10 REGISTROS:\n');
apus.slice(0, 10).forEach((a, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. [${a.partida_codigo}] ${a.partida_descripcion.substring(0, 35).padEnd(35)} | ${a.tipo_insumo.padEnd(15)} | ${a.insumo_descripcion.substring(0, 30)}`);
});

// Generar CSV
console.log('\n💾 GENERANDO CSV...\n');

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

fs.writeFileSync('APUS_DETALLADO.csv', csvContent, 'utf-8');
fs.copyFileSync('APUS_DETALLADO.csv', 'DATA_LAST/APUS_DETALLADO.csv');

console.log(`✅ Archivos generados:`);
console.log(`   • APUS_DETALLADO.csv (${(csvContent.length / 1024).toFixed(2)} KB) en raíz`);
console.log(`   • APUS_DETALLADO.csv en DATA_LAST/`);
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
Object.entries(byTipo).forEach(([tipo, count]) => {
  console.log(`    ${tipo.padEnd(20)}: ${count} registros`);
});

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ CSV LISTO EN DATA_LAST/\n');
