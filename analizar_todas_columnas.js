const XLSX = require('xlsx');

console.log('🔍 ANALIZANDO TODAS LAS COLUMNAS\n');
console.log('═'.repeat(200));

const book = XLSX.readFile('APUS_Extraidos_v2.xlsx');
const sheet = book.Sheets['Sheet1'];

// Obtener solo los headers
console.log('\n📋 HEADERS (Fila 0):\n');

const range = XLSX.utils.decode_range(sheet['!ref']);
const maxCol = range.e.c;

for (let col = 0; col <= maxCol; col++) {
  const cell = sheet[XLSX.utils.encode_cell({r: 0, c: col})];
  const colLetter = XLSX.utils.encode_col(col);
  const value = cell ? String(cell.v || '') : '';
  console.log(`  Columna ${colLetter.padEnd(2)} (${col.toString().padStart(2)}): ${value}`);
}

// Mostrar primeras 5 filas de datos
console.log('\n\n📋 PRIMERAS 5 FILAS DE DATOS:\n');

for (let row = 1; row <= 5; row++) {
  console.log(`\nFila ${row}:`);
  for (let col = 0; col <= Math.min(maxCol, 20); col++) {
    const cell = sheet[XLSX.utils.encode_cell({r: row, c: col})];
    const colLetter = XLSX.utils.encode_col(col);
    const value = cell ? String(cell.v || '') : '';
    if (value) {
      console.log(`  ${colLetter}: ${value}`);
    }
  }
}

console.log('\n' + '═'.repeat(200));
