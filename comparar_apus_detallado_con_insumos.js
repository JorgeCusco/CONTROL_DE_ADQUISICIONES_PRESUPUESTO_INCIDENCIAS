const XLSX = require('xlsx');
const fs = require('fs');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

console.log('📊 COMPARANDO APUS_DETALLADO.csv CON INSUMOS.xlsx\n');
console.log('═'.repeat(160));

// 1. Leer APUS_DETALLADO.csv
console.log('\n1️⃣  Leyendo DATA_LAST/APUS_DETALLADO.csv...\n');

const csvContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
const apusRecords = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

console.log(`  ✓ APUS_DETALLADO: ${apusRecords.length} registros\n`);

// Extraer insumos únicos del APUS
const apusMap = new Map();
apusRecords.forEach((record) => {
  const key = record.insumo_codigo;

  if (!apusMap.has(key)) {
    apusMap.set(key, {
      insumo_codigo: record.insumo_codigo,
      insumo_descripcion: record.insumo_descripcion,
      tipo_insumo: record.tipo_insumo,
      insumo_unidad: record.insumo_unidad,
      insumo_recursos: parseFloat(record.insumo_recursos) || 0,
      insumo_precio: parseFloat(record.insumo_precio) || 0,
      partidas_donde_aparece: 1
    });
  } else {
    apusMap.get(key).partidas_donde_aparece++;
  }
});

const apusArray = Array.from(apusMap.values());

console.log(`  ✓ Insumos únicos en APUS: ${apusArray.length}\n`);

// 2. Leer INSUMOS.xlsx
console.log('2️⃣  Leyendo DATA_LAST/INSUMOS.xlsx...\n');

const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
const insumosSheet = insumosBook.Sheets['Sheet'];
const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

console.log(`  ✓ INSUMOS.xlsx: ${insumosXlsx.length} registros\n`);

// Filtrar insumos con código
const xlsxConCodigo = insumosXlsx.filter(i => i.Código && String(i.Código).trim());
const xlsxCodigos = new Set(xlsxConCodigo.map(i => String(i.Código).trim()));
const xlsxArray = xlsxConCodigo.map(i => ({
  codigo: String(i.Código).trim(),
  descripcion: i.Descripción,
  unidad: i['Unid.'],
  cantidad: parseFloat(i.Cantidad) || 0,
  costo: parseFloat(i.Costo) || 0,
  total: parseFloat(i.Total) || 0
}));

console.log(`  ✓ Insumos XLSX con código: ${xlsxCodigos.size}\n`);

// 3. COMPARATIVA
console.log('3️⃣  COMPARATIVA: APUS_DETALLADO vs INSUMOS.xlsx\n');

const apusCodigos = new Set(apusArray.map(a => a.insumo_codigo));

const inAmbos = new Set([...apusCodigos].filter(x => xlsxCodigos.has(x)));
const soloEnApus = new Set([...apusCodigos].filter(x => !xlsxCodigos.has(x)));
const soloEnXlsx = new Set([...xlsxCodigos].filter(x => !apusCodigos.has(x)));

console.log(`  📊 APUS: ${apusCodigos.size} insumos únicos`);
console.log(`  📊 XLSX: ${xlsxCodigos.size} insumos únicos\n`);

console.log(`  ✅ En ambos: ${inAmbos.size} insumos (${((inAmbos.size/apusCodigos.size)*100).toFixed(2)}%)`);
console.log(`  ⚠️  Solo en APUS: ${soloEnApus.size} insumos (${((soloEnApus.size/apusCodigos.size)*100).toFixed(2)}%)`);
console.log(`  ⚠️  Solo en XLSX: ${soloEnXlsx.size} insumos\n`);

// Mostrar ejemplos
if (soloEnApus.size > 0) {
  console.log(`  Ejemplos de insumos SOLO EN APUS (NO COMPRADOS):\n`);
  Array.from(soloEnApus).slice(0, 10).forEach((cod, idx) => {
    const insumo = apusArray.find(a => a.insumo_codigo === cod);
    console.log(`    ${(idx+1).toString().padStart(2)}. [${cod}] ${insumo.insumo_descripcion.substring(0, 50)}`);
  });
}

if (soloEnXlsx.size > 0) {
  console.log(`\n  Ejemplos de insumos SOLO EN XLSX (EXTRAS):\n`);
  Array.from(soloEnXlsx).slice(0, 10).forEach((cod, idx) => {
    const xlsxItem = xlsxArray.find(x => x.codigo === cod);
    console.log(`    ${(idx+1).toString().padStart(2)}. [${cod}] ${xlsxItem.descripcion.substring(0, 50)}`);
  });
}

// 4. Generar CSV Comparativa
console.log('\n\n4️⃣  GENERANDO CSV DE COMPARATIVA...\n');

const comparativa = [];

// Agregar todos los insumos APUS con estado
apusArray.forEach(insumo => {
  const enXlsx = xlsxCodigos.has(insumo.insumo_codigo);
  const xlsxItem = xlsxArray.find(x => x.codigo === insumo.insumo_codigo);

  comparativa.push({
    estado: enXlsx ? 'COMPRADO' : 'NO COMPRADO',
    tipo_insumo: insumo.tipo_insumo,
    codigo_insumo: insumo.insumo_codigo,
    descripcion_apus: insumo.insumo_descripcion,
    descripcion_xlsx: xlsxItem ? xlsxItem.descripcion : '',
    unidad_apus: insumo.insumo_unidad,
    unidad_xlsx: xlsxItem ? xlsxItem.unidad : '',
    precio_apus: insumo.insumo_precio,
    precio_xlsx: xlsxItem ? xlsxItem.costo : 0,
    cantidad_xlsx: xlsxItem ? xlsxItem.cantidad : 0,
    total_xlsx: xlsxItem ? xlsxItem.total : 0,
    partidas_donde_aparece: insumo.partidas_donde_aparece
  });
});

const comparativaContent = stringify(comparativa, {
  header: true,
  columns: [
    'estado',
    'tipo_insumo',
    'codigo_insumo',
    'descripcion_apus',
    'descripcion_xlsx',
    'unidad_apus',
    'unidad_xlsx',
    'precio_apus',
    'precio_xlsx',
    'cantidad_xlsx',
    'total_xlsx',
    'partidas_donde_aparece'
  ]
});

fs.writeFileSync('DATA_LAST/COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv', comparativaContent, 'utf-8');

console.log(`✅ CSV guardado: DATA_LAST/COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv`);
console.log(`   Tamaño: ${(comparativaContent.length / 1024).toFixed(2)} KB\n`);

// 5. Análisis por tipo
console.log('\n5️⃣  ANÁLISIS POR TIPO DE INSUMO\n');

const byTipo = {};
comparativa.forEach(item => {
  if (!byTipo[item.tipo_insumo]) {
    byTipo[item.tipo_insumo] = { total: 0, comprado: 0, no_comprado: 0 };
  }
  byTipo[item.tipo_insumo].total++;
  if (item.estado === 'COMPRADO') {
    byTipo[item.tipo_insumo].comprado++;
  } else {
    byTipo[item.tipo_insumo].no_comprado++;
  }
});

console.log('Tipo de Insumo      | Total | Comprado | % Compra | No Comprado\n');
Object.entries(byTipo).forEach(([tipo, data]) => {
  const pctCompra = ((data.comprado / data.total) * 100).toFixed(2);
  console.log(`${tipo.padEnd(17)} | ${data.total.toString().padStart(5)} | ${data.comprado.toString().padStart(8)} | ${pctCompra.padStart(7)}% | ${data.no_comprado.toString().padStart(11)}`);
});

// 6. Resumen final
console.log('\n\n' + '═'.repeat(160));
console.log('\n📊 RESUMEN FINAL\n');

const estadoCount = comparativa.reduce((acc, item) => {
  acc[item.estado] = (acc[item.estado] || 0) + 1;
  return acc;
}, {});

console.log('Estado de Insumos APUS:\n');
Object.entries(estadoCount).forEach(([estado, count]) => {
  const pct = ((count / comparativa.length) * 100).toFixed(2);
  console.log(`  ${estado.padEnd(15)}: ${count.toString().padStart(5)} (${pct}%)`);
});

console.log('\n\n📁 ARCHIVOS GENERADOS EN DATA_LAST/:\n');
console.log('  • COMPARATIVA_APUS_DETALLADO_vs_INSUMOS.csv .... Comparativa detallada\n');

console.log('═'.repeat(160) + '\n');
