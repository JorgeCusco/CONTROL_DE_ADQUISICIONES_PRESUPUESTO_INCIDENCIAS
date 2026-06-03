const XLSX = require('xlsx');

const workbook = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
const apuSheet = workbook.Sheets['APU'];

console.log('📊 ANÁLISIS COMPLETO ESTRUCTURA APU\n');
console.log('═'.repeat(150));

const range = XLSX.utils.decode_range(apuSheet['!ref']);

// Obtener la fila de encabezados (fila 6 = row 5)
const headerRow = 5;
console.log('\n📋 ENCABEZADOS (Fila 6):\n');

const headers = {};
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddr = XLSX.utils.encode_cell({ r: headerRow, c: col });
  const cell = apuSheet[cellAddr];
  const value = cell ? String(cell.v || '').trim() : '';
  const colLetter = XLSX.utils.encode_col(col);
  headers[colLetter] = value;
  if (value) {
    console.log(`  ${colLetter}: ${value}`);
  }
}

console.log('\n' + '═'.repeat(150));
console.log('\n📋 ESTRUCTURA DE DATOS (primeros 30 registros):\n');

let partidaActual = { codigo: '', descripcion: '', rendimiento: '' };
let rowCount = 0;

// Leer fila 1 para partida inicial
const cell1A = apuSheet[XLSX.utils.encode_cell({ r: 0, c: 0 })];
const cell2A = apuSheet[XLSX.utils.encode_cell({ r: 1, c: 0 })];
if (cell1A) partidaActual.codigo = String(cell1A.v || '');
if (cell2A) partidaActual.descripcion = String(cell2A.v || '');

console.log(`Partida inicial: [${partidaActual.codigo}] ${partidaActual.descripcion}\n`);

for (let row = 6; row < Math.min(range.e.r + 1, 50); row++) {
  const cellA = apuSheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
  const cellB = apuSheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
  const valueA = cellA ? String(cellA.v || '').trim() : '';
  const valueB = cellB ? String(cellB.v || '').trim() : '';

  // Detectar nueva partida
  if (valueA && valueA.match(/^OE\./)) {
    console.log(`\n🔄 NUEVA PARTIDA: [${valueA}]`);
    partidaActual.codigo = valueA;
    // La descripción está en la siguiente fila
    const cellB2 = apuSheet[XLSX.utils.encode_cell({ r: row + 1, c: 0 })];
    if (cellB2) {
      partidaActual.descripcion = String(cellB2.v || '');
      console.log(`   Descripción: ${partidaActual.descripcion}`);
    }
    row += 5; // Skip header rows
    continue;
  }

  // Skip headers y categorías
  if (valueA === 'Código' || valueA === 'MANO DE OBRA' || valueA === 'MATERIALES' ||
      valueA === 'EQUIPO Y HERRAMIENTAS' || valueA === '' || !valueA) {
    continue;
  }

  if (valueA && valueB) {
    rowCount++;
    console.log(`${rowCount}. [${valueA}] ${valueB.substring(0, 40)}`);
    console.log(`   Cols:`, Object.entries(headers).filter(([_, h]) => h).map(([col, h]) => {
      const cellAddr = XLSX.utils.encode_cell({ r: row, c: XLSX.utils.decode_col(col) });
      const cell = apuSheet[cellAddr];
      const val = cell ? cell.v : '';
      return `${h}: ${val}`;
    }).join(' | '));
    console.log();

    if (rowCount >= 10) break;
  }
}
