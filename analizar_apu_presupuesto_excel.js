const XLSX = require('xlsx');

console.log('🔍 ANALIZANDO ESTRUCTURA DE DATA_LAST/APU Y PRESUPUESTO.xlsx\n');
console.log('═'.repeat(200));

const book = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');

console.log(`\nHojas disponibles: ${book.SheetNames.join(', ')}\n`);

// Analizar cada hoja
for (const sheetName of book.SheetNames) {
  console.log(`\n${'═'.repeat(200)}`);
  console.log(`📋 ANALIZANDO HOJA: ${sheetName}\n`);

  const sheet = book.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);

  console.log(`Dimensiones: ${range.e.r + 1} filas x ${range.e.c + 1} columnas\n`);

  // Mostrar headers (fila 0)
  console.log('Headers (Fila 0):');
  for (let col = 0; col <= Math.min(range.e.c, 20); col++) {
    const cell = sheet[XLSX.utils.encode_cell({r: 0, c: col})];
    const colLetter = XLSX.utils.encode_col(col);
    const value = cell ? String(cell.v || '') : '';
    if (value) {
      console.log(`  ${colLetter.padEnd(2)}: ${value}`);
    }
  }

  // Mostrar primeras 15 filas
  console.log(`\n\nPrimeras 15 filas de datos:\n`);
  console.log('Fila | Col A | Col B | Col C | Col D | Col E | Col J | Col K | Col M | Col O | Col P');
  console.log('─'.repeat(160));

  for (let row = 0; row < 15; row++) {
    const colA = sheet[XLSX.utils.encode_cell({r: row, c: 0})];
    const colB = sheet[XLSX.utils.encode_cell({r: row, c: 1})];
    const colC = sheet[XLSX.utils.encode_cell({r: row, c: 2})];
    const colD = sheet[XLSX.utils.encode_cell({r: row, c: 3})];
    const colE = sheet[XLSX.utils.encode_cell({r: row, c: 4})];
    const colJ = sheet[XLSX.utils.encode_cell({r: row, c: 9})];
    const colK = sheet[XLSX.utils.encode_cell({r: row, c: 10})];
    const colM = sheet[XLSX.utils.encode_cell({r: row, c: 12})];
    const colO = sheet[XLSX.utils.encode_cell({r: row, c: 14})];
    const colP = sheet[XLSX.utils.encode_cell({r: row, c: 15})];

    const a = colA ? String(colA.v || '').substring(0, 12) : '';
    const b = colB ? String(colB.v || '').substring(0, 12) : '';
    const c = colC ? String(colC.v || '').substring(0, 12) : '';
    const d = colD ? String(colD.v || '').substring(0, 12) : '';
    const e = colE ? String(colE.v || '').substring(0, 12) : '';
    const j = colJ ? String(colJ.v || '').substring(0, 12) : '';
    const k = colK ? String(colK.v || '').substring(0, 12) : '';
    const m = colM ? String(colM.v || '').substring(0, 12) : '';
    const o = colO ? String(colO.v || '').substring(0, 12) : '';
    const p = colP ? String(colP.v || '').substring(0, 12) : '';

    console.log(`${row.toString().padStart(3)} | ${a.padEnd(12)} | ${b.padEnd(12)} | ${c.padEnd(12)} | ${d.padEnd(12)} | ${e.padEnd(12)} | ${j.padEnd(12)} | ${k.padEnd(12)} | ${m.padEnd(12)} | ${o.padEnd(12)} | ${p.padEnd(12)}`);
  }
}

console.log(`\n${'═'.repeat(200)}\n`);
