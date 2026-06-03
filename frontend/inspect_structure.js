const XLSX = require('xlsx');
const path = require('path');

const baseDir = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital';

const files = [
  'SALDOS A MOD. 06 - ACU 16.05 v.02.xlsx',
  'SALDOS A MOD. 06 - INSUMOS 16.05 v.02.xlsx',
  'SALDOS A MOD. 06 - PRESUPUESTO 16.05 v.02.xlsx'
];

files.forEach(fileName => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📄 ${fileName}`);
  console.log('='.repeat(80));

  try {
    const wb = XLSX.readFile(path.join(baseDir, fileName));
    const sheetNames = wb.SheetNames;

    console.log(`\n📋 Hojas: ${sheetNames.join(', ')}`);

    // Leer cada hoja
    sheetNames.forEach((sheetName, idx) => {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`📑 Hoja: "${sheetName}"`);
      console.log('─'.repeat(60));

      const sheet = wb.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

      console.log(`Rango: ${sheet['!ref']}`);
      console.log(`Filas totales: ${range.e.r + 1}, Columnas: ${range.e.c + 1}\n`);

      // Mostrar primeras 30 filas
      const maxRows = Math.min(30, range.e.r + 1);
      const maxCols = Math.min(20, range.e.c + 1); // Primeras 20 columnas

      for (let r = 0; r < maxRows; r++) {
        const rowData = [];
        for (let c = 0; c < maxCols; c++) {
          const cell = sheet[XLSX.utils.encode_cell({ r, c })];
          const val = cell ? (cell.v || '') : '';
          rowData.push(String(val).substring(0, 25)); // Primeros 25 chars
        }
        console.log(`Fila ${String(r + 1).padStart(4)}: ${rowData.join(' | ')}`);
      }

      if (maxRows < range.e.r + 1) {
        console.log(`\n... (${range.e.r + 1 - maxRows} filas más)`);
      }
    });
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
});
