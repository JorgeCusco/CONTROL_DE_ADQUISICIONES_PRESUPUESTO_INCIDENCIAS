const XLSX = require('xlsx');

console.log('🔬 ANÁLISIS DETALLADO ESTRUCTURA ACU - PARTIDAS\n');
console.log('═'.repeat(220));

const acuPath = 'DATA_LAST/ULTIMO/ACU.xlsx';
const workbook = XLSX.readFile(acuPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

console.log('\n📍 LECTURA DE ESTRUCTURA PARTIDA (primeras 4 partidas):\n');

// Mostrar filas 12-60 en detalle para ver 4 partidas completas
for (let r = 11; r <= 95; r++) {
  let hasData = false;
  let rowData = [];

  for (let c = 0; c <= 16; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[cellAddr];
    const val = cell ? String(cell.v || '').trim() : '';
    const col = String.fromCharCode(65 + c);

    if (val) {
      hasData = true;
      rowData.push(`${col}="${val.substring(0, 45)}"`);
    }
  }

  if (hasData) {
    console.log(`Fila ${(r + 1).toString().padStart(3)}: ${rowData.join(' | ')}`);
  }
}

console.log('\n\n═'.repeat(220));
console.log('\n✅ FIN DEL ANÁLISIS\n');
