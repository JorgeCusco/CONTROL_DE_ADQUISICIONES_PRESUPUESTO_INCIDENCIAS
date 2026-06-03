const XLSX = require('xlsx');

const workbook = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');

console.log('📊 ANÁLISIS DE ESTRUCTURA - APU Y PRESUPUESTO.xlsx\n');
console.log('═'.repeat(150));

console.log('\n🔍 HOJAS DISPONIBLES:\n');
workbook.SheetNames.forEach((name, idx) => {
  const sheet = workbook.Sheets[name];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  console.log(`  ${idx + 1}. [${name}] - ${range.e.r + 1} filas, ${range.e.c + 1} columnas`);
});

console.log('\n' + '═'.repeat(150));
console.log('\n1️⃣  HOJA: APU\n');

const apuSheet = workbook.Sheets['APU'];
const apuData = XLSX.utils.sheet_to_json(apuSheet, { defval: '' });

console.log(`Total registros: ${apuData.length}`);
console.log('\n📋 COLUMNAS DISPONIBLES:\n');

if (apuData.length > 0) {
  const firstRow = apuData[0];
  const columns = Object.keys(firstRow);

  columns.forEach((col, idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. [${col}]`);
  });

  console.log('\n\n📋 PRIMEROS 3 REGISTROS COMPLETOS:\n');

  apuData.slice(0, 3).forEach((row, idx) => {
    console.log(`\nRegistro ${idx + 1}:`);
    Object.entries(row).forEach(([key, value]) => {
      console.log(`  ${key}: ${String(value).substring(0, 60)}`);
    });
  });
}

console.log('\n' + '═'.repeat(150));
console.log('\n2️⃣  HOJA: PRESUPUESTO\n');

const presSheet = workbook.Sheets['PRESUPUESTO'];
const presData = XLSX.utils.sheet_to_json(presSheet, { defval: '' });

console.log(`Total registros: ${presData.length}`);
console.log('\n📋 COLUMNAS DISPONIBLES:\n');

if (presData.length > 0) {
  const firstRow = presData[0];
  const columns = Object.keys(firstRow);

  columns.forEach((col, idx) => {
    console.log(`  ${(idx + 1).toString().padStart(2)}. [${col}]`);
  });

  console.log('\n\n📋 PRIMER REGISTRO:\n');

  const row = presData[0];
  Object.entries(row).forEach(([key, value]) => {
    console.log(`  ${key}: ${String(value).substring(0, 60)}`);
  });
}
