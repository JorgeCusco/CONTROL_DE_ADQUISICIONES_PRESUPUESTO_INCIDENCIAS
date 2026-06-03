const XLSX = require('xlsx');
const fs = require('fs');
const csv = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

console.log('📊 GENERANDO SQL PARA INSUMOS Y COMPARANDO CON INSUMOS.xlsx\n');
console.log('═'.repeat(160));

// 1. Leer APU_PRESUPUESTO_LIMPIO.csv
console.log('\n1️⃣  Leyendo APU_PRESUPUESTO_LIMPIO.csv...\n');

const csvContent = fs.readFileSync('DATA_LAST/APU_PRESUPUESTO_LIMPIO.csv', 'utf-8');
const apuRecords = csv.parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

console.log(`  ✓ APU: ${apuRecords.length} registros\n`);

// Extraer insumos únicos por partida (estructura table insumos)
const insumosMap = new Map();
let idCounter = 1;

apuRecords.forEach((record) => {
  const key = `${record.partida_codigo}|${record.insumo_codigo}`;

  if (!insumosMap.has(key)) {
    insumosMap.set(key, {
      id: idCounter++,
      codigo_partida: record.partida_codigo,
      codigo_insumo: record.insumo_codigo,
      descripcion: record.insumo_descripcion,
      unidad: record.insumo_unidad,
      incidencia_original: parseFloat(record.insumo_recursos) || 0,
      parcial_original: parseFloat(record.insumo_parcial) || 0,
      incidencia: parseFloat(record.insumo_recursos) || 0,
      cantidad_modificada: 0,
      cantidad_adquirida: 0,
      comentario: '',
      es_extra: false
    });
  }
});

const insumosArray = Array.from(insumosMap.values());

console.log(`  ✓ Insumos únicos extraídos: ${insumosArray.length}\n`);

// 2. Leer INSUMOS.xlsx
console.log('2️⃣  Leyendo DATA_LAST/INSUMOS.xlsx...\n');

const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
const insumosSheet = insumosBook.Sheets['Sheet'];
const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

console.log(`  ✓ Insumos XLSX: ${insumosXlsx.length} registros\n`);

// 3. Comparar
console.log('3️⃣  COMPARATIVA: APU vs INSUMOS.xlsx\n');

// Insumos del APU
const apuCodigos = new Set(insumosArray.map(i => i.codigo_insumo));
console.log(`  📊 APU: ${apuCodigos.size} insumos únicos`);

// Insumos del XLSX (que tienen código)
const xlsxConCodigo = insumosXlsx.filter(i => i.Código && String(i.Código).trim());
const xlsxCodigos = new Set(xlsxConCodigo.map(i => String(i.Código).trim()));
console.log(`  📊 XLSX: ${xlsxCodigos.size} insumos únicos\n`);

// Intersección
const inAmbos = new Set([...apuCodigos].filter(x => xlsxCodigos.has(x)));
const soloEnApu = new Set([...apuCodigos].filter(x => !xlsxCodigos.has(x)));
const soloEnXlsx = new Set([...xlsxCodigos].filter(x => !apuCodigos.has(x)));

console.log(`  ✅ En ambos: ${inAmbos.size} insumos`);
console.log(`  ⚠️  Solo en APU: ${soloEnApu.size} insumos`);
console.log(`  ⚠️  Solo en XLSX: ${soloEnXlsx.size} insumos\n`);

// Mostrar ejemplos
if (soloEnApu.size > 0) {
  console.log(`  Ejemplos de insumos SOLO EN APU:\n`);
  Array.from(soloEnApu).slice(0, 10).forEach((cod, idx) => {
    const insumo = insumosArray.find(i => i.codigo_insumo === cod);
    console.log(`    ${(idx+1).toString().padStart(2)}. [${cod}] ${insumo.descripcion.substring(0, 40)}`);
  });
}

if (soloEnXlsx.size > 0) {
  console.log(`\n  Ejemplos de insumos SOLO EN XLSX:\n`);
  Array.from(soloEnXlsx).slice(0, 10).forEach((cod, idx) => {
    const xlsxItem = xlsxConCodigo.find(i => String(i.Código).trim() === cod);
    console.log(`    ${(idx+1).toString().padStart(2)}. [${cod}] ${xlsxItem.Descripción.substring(0, 40)}`);
  });
}

// 4. Generar SQL
console.log('\n\n4️⃣  GENERANDO SQL INSERT PARA TABLA insumos...\n');

let sqlContent = '-- SQL INSERT PARA TABLA insumos\n';
sqlContent += '-- Generado desde APU_PRESUPUESTO_LIMPIO.csv\n';
sqlContent += '-- Total de registros: ' + insumosArray.length + '\n\n';

sqlContent += 'BEGIN TRANSACTION;\n\n';

sqlContent += 'INSERT INTO insumos (\n';
sqlContent += '  codigo_partida,\n';
sqlContent += '  codigo_insumo,\n';
sqlContent += '  descripcion,\n';
sqlContent += '  unidad,\n';
sqlContent += '  incidencia_original,\n';
sqlContent += '  parcial_original,\n';
sqlContent += '  incidencia,\n';
sqlContent += '  cantidad_modificada,\n';
sqlContent += '  cantidad_adquirida,\n';
sqlContent += '  comentario,\n';
sqlContent += '  es_extra\n';
sqlContent += ') VALUES\n';

const valueLines = insumosArray.map((i, idx) => {
  const isLast = idx === insumosArray.length - 1;
  const ending = isLast ? ';' : ',';
  return `('${i.codigo_partida}', '${i.codigo_insumo}', '${i.descripcion.replace(/'/g, "''")}', '${i.unidad}', ${i.incidencia_original}, ${i.parcial_original}, ${i.incidencia}, ${i.cantidad_modificada}, ${i.cantidad_adquirida}, '${i.comentario}', ${i.es_extra})${ending}`;
});

sqlContent += valueLines.join('\n');
sqlContent += '\n\nCOMMIT;\n';

fs.writeFileSync('DATA_LAST/INSERT_INSUMOS.sql', sqlContent, 'utf-8');

console.log(`✅ SQL guardado: DATA_LAST/INSERT_INSUMOS.sql`);
console.log(`   Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);

// 5. Generar CSV de comparativa
console.log('5️⃣  GENERANDO CSV DE COMPARATIVA...\n');

const comparativa = [];

// Agregar todos los insumos APU con flag de si está en XLSX
insumosArray.forEach(insumo => {
  const enXlsx = xlsxCodigos.has(insumo.codigo_insumo);
  const xlsxItem = xlsxConCodigo.find(i => String(i.Código).trim() === insumo.codigo_insumo);

  comparativa.push({
    estado: enXlsx ? 'COMPRADO' : 'NO COMPRADO',
    codigo_insumo: insumo.codigo_insumo,
    descripcion_apu: insumo.descripcion,
    descripcion_xlsx: xlsxItem ? xlsxItem.Descripción : '',
    unidad_apu: insumo.unidad,
    unidad_xlsx: xlsxItem ? xlsxItem['Unid.'] : '',
    cantidad_apu: insumo.incidencia_original,
    cantidad_xlsx: xlsxItem ? xlsxItem.Cantidad : 0,
    precio_xlsx: xlsxItem ? xlsxItem.Costo : 0,
    total_xlsx: xlsxItem ? xlsxItem.Total : 0
  });
});

const comparativaContent = stringify(comparativa, {
  header: true,
  columns: [
    'estado',
    'codigo_insumo',
    'descripcion_apu',
    'descripcion_xlsx',
    'unidad_apu',
    'unidad_xlsx',
    'cantidad_apu',
    'cantidad_xlsx',
    'precio_xlsx',
    'total_xlsx'
  ]
});

fs.writeFileSync('DATA_LAST/COMPARATIVA_APU_vs_INSUMOS.csv', comparativaContent, 'utf-8');

console.log(`✅ CSV de comparativa guardado: DATA_LAST/COMPARATIVA_APU_vs_INSUMOS.csv`);
console.log(`   Tamaño: ${(comparativaContent.length / 1024).toFixed(2)} KB\n`);

// 6. Resumen
console.log('\n' + '═'.repeat(160));
console.log('\n📊 RESUMEN FINAL\n');

console.log('Insumos del APU por estado:\n');
const estadoCount = comparativa.reduce((acc, item) => {
  acc[item.estado] = (acc[item.estado] || 0) + 1;
  return acc;
}, {});

Object.entries(estadoCount).forEach(([estado, count]) => {
  const pct = ((count / comparativa.length) * 100).toFixed(2);
  console.log(`  ${estado.padEnd(15)}: ${count.toString().padStart(5)} (${pct}%)`);
});

console.log('\n\n📁 ARCHIVOS GENERADOS EN DATA_LAST/:\n');
console.log('  • INSERT_INSUMOS.sql ........................ SQL para cargar insumos a Supabase');
console.log('  • COMPARATIVA_APU_vs_INSUMOS.csv ........... Comparativa detallada APU vs XLSX');
console.log('\n');
