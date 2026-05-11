const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔍 ANALIZANDO ESTRUCTURA DE INSUMOS.xlsx - Hoja "insumos"\n');
console.log('═'.repeat(200));

const book = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');

console.log(`\n📋 Hojas disponibles: ${book.SheetNames.join(', ')}\n`);

// Buscar la hoja "insumos"
let targetSheet = null;
for (const sheetName of book.SheetNames) {
  if (sheetName.toLowerCase().includes('insumo') || sheetName === 'Sheet') {
    targetSheet = sheetName;
  }
}

if (!targetSheet) {
  targetSheet = book.SheetNames[0];
}

console.log(`📄 Analizando hoja: ${targetSheet}\n`);

const sheet = book.Sheets[targetSheet];
const range = XLSX.utils.decode_range(sheet['!ref']);

console.log(`Dimensiones: ${range.e.r + 1} filas x ${range.e.c + 1} columnas\n`);

// Mostrar headers y primeras filas
console.log('📊 ESTRUCTURA DE LA HOJA:\n');
console.log('Columna | Header | Fila 1 | Fila 2 | Fila 3\n');

for (let col = 0; col <= Math.min(range.e.c, 10); col++) {
  const colLetter = XLSX.utils.encode_col(col);

  const headerCell = sheet[XLSX.utils.encode_cell({r: 0, c: col})];
  const row1Cell = sheet[XLSX.utils.encode_cell({r: 1, c: col})];
  const row2Cell = sheet[XLSX.utils.encode_cell({r: 2, c: col})];
  const row3Cell = sheet[XLSX.utils.encode_cell({r: 3, c: col})];

  const header = headerCell ? String(headerCell.v || '').substring(0, 15) : '';
  const row1 = row1Cell ? String(row1Cell.v || '').substring(0, 15) : '';
  const row2 = row2Cell ? String(row2Cell.v || '').substring(0, 15) : '';
  const row3 = row3Cell ? String(row3Cell.v || '').substring(0, 15) : '';

  console.log(`${colLetter.padEnd(8)} | ${header.padEnd(15)} | ${row1.padEnd(15)} | ${row2.padEnd(15)} | ${row3.padEnd(15)}`);
}

// Leer datos
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log(`\n\n✓ Total registros: ${data.length}\n`);

// Mostrar primeros 10 registros
console.log('📋 PRIMEROS 10 REGISTROS:\n');
const headers = Object.keys(data[0] || {});
console.log('Row | ' + headers.slice(0, 8).map(h => h.substring(0, 12).padEnd(12)).join(' | '));
console.log('─'.repeat(160));

data.slice(0, 10).forEach((row, idx) => {
  const values = headers.slice(0, 8).map(h => String(row[h] || '').substring(0, 12).padEnd(12));
  console.log(`${(idx+1).toString().padStart(3)} | ${values.join(' | ')}`);
});

// Análisis de estructura según lo que dice el usuario
console.log(`\n\n${'═'.repeat(200)}\n`);
console.log('📋 MAPEO SEGÚN DESCRIPCIÓN DEL USUARIO:\n');
console.log('Usuario dice:             | Columna | Header real | Valor ejemplo\n');

const colA = sheet[XLSX.utils.encode_cell({r: 0, c: 0})];
const colB = sheet[XLSX.utils.encode_cell({r: 0, c: 1})];
const colC = sheet[XLSX.utils.encode_cell({r: 0, c: 2})];
const colD = sheet[XLSX.utils.encode_cell({r: 0, c: 3})];
const colF = sheet[XLSX.utils.encode_cell({r: 0, c: 5})];
const colH = sheet[XLSX.utils.encode_cell({r: 0, c: 7})];

const colAval = sheet[XLSX.utils.encode_cell({r: 1, c: 0})];
const colBval = sheet[XLSX.utils.encode_cell({r: 1, c: 1})];
const colCval = sheet[XLSX.utils.encode_cell({r: 1, c: 2})];
const colDval = sheet[XLSX.utils.encode_cell({r: 1, c: 3})];
const colFval = sheet[XLSX.utils.encode_cell({r: 1, c: 5})];
const colHval = sheet[XLSX.utils.encode_cell({r: 1, c: 7})];

console.log(`codigo_insumo             | A      | ${String(colA?.v || '').padEnd(11)} | ${String(colAval?.v || '').substring(0, 15)}`);
console.log(`descripcion               | B      | ${String(colB?.v || '').padEnd(11)} | ${String(colBval?.v || '').substring(0, 15)}`);
console.log(`unidad                    | C      | ${String(colC?.v || '').padEnd(11)} | ${String(colCval?.v || '').substring(0, 15)}`);
console.log(`cantidad                  | D      | ${String(colD?.v || '').padEnd(11)} | ${String(colDval?.v || '').substring(0, 15)}`);
console.log(`costo                     | F      | ${String(colF?.v || '').padEnd(11)} | ${String(colFval?.v || '').substring(0, 15)}`);
console.log(`total/parcial             | H      | ${String(colH?.v || '').padEnd(11)} | ${String(colHval?.v || '').substring(0, 15)}`);

console.log(`\n\n${'═'.repeat(200)}\n`);
