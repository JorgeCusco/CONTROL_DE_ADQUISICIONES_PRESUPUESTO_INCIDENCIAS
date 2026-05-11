const XLSX = require('xlsx');

const workbook = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
const apuSheet = workbook.Sheets['APU'];

console.log('📊 ANÁLISIS RAW DEL SHEET APU\n');
console.log('═'.repeat(150));

// Leer range
const range = XLSX.utils.decode_range(apuSheet['!ref']);
console.log(`\nRango: ${apuSheet['!ref']}`);
console.log(`Filas: ${range.s.r} a ${range.e.r} (total: ${range.e.r - range.s.r + 1})`);
console.log(`Columnas: A a ${XLSX.utils.encode_col(range.e.c)}\n`);

// Mostrar primeras 15 filas, primeras 10 columnas
console.log('\n🔍 PRIMERAS 15 FILAS (raw data):\n');

for (let row = range.s.r; row < Math.min(range.s.r + 15, range.e.r + 1); row++) {
  console.log(`Fila ${row + 1}:`);
  for (let col = range.s.c; col < Math.min(range.s.c + 10, range.e.c + 1); col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
    const cell = apuSheet[cellAddr];
    const value = cell ? (cell.v !== undefined ? cell.v : cell.f) : '';
    const colLetter = XLSX.utils.encode_col(col);
    if (value) {
      console.log(`  ${colLetter}: ${String(value).substring(0, 50)}`);
    }
  }
  console.log();
}

console.log('═'.repeat(150));
console.log('\n📋 BÚSQUEDA DE ESTRUCTURA: ¿Dónde empiezan los datos reales?\n');

// Buscar donde empieza el patrón de datos reales
let headerRowEnd = -1;
for (let row = range.s.r; row < range.e.r + 1 && row < range.s.r + 50; row++) {
  const cellA = apuSheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
  const cellB = apuSheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
  const valueA = cellA ? String(cellA.v || '') : '';
  const valueB = cellB ? String(cellB.v || '') : '';

  if (valueA === 'Código' || valueB === 'Descripción') {
    console.log(`✓ Encabezados en fila ${row + 1}`);
    console.log(`  A${row + 1}: ${valueA}`);
    console.log(`  B${row + 1}: ${valueB}\n`);
    headerRowEnd = row;
    break;
  }
}

if (headerRowEnd >= 0) {
  console.log(`\n📋 PRIMEROS 5 REGISTROS DE DATOS (después de fila ${headerRowEnd + 1}):\n`);

  for (let row = headerRowEnd + 1; row < Math.min(headerRowEnd + 6, range.e.r + 1); row++) {
    console.log(`Fila ${row + 1}:`);
    const cells = {};
    for (let col = range.s.c; col < Math.min(range.s.c + 16, range.e.c + 1); col++) {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = apuSheet[cellAddr];
      const value = cell ? cell.v : '';
      if (value) {
        const colLetter = XLSX.utils.encode_col(col);
        cells[colLetter] = value;
      }
    }
    Object.entries(cells).forEach(([col, val]) => {
      console.log(`  ${col}: ${String(val).substring(0, 60)}`);
    });
    console.log();
  }
}
