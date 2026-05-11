const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 ANÁLISIS COMPLETO DE EXCELS\n');
console.log('═'.repeat(180));

const lastDir = 'DATA_LAST/ULTIMO';
const files = [
  { name: 'ACU.xlsx', path: `${lastDir}/ACU.xlsx` },
  { name: 'INSUMOS.xlsx', path: `${lastDir}/INSUMOS.xlsx` },
  { name: 'PRESUPUESTO.xlsx', path: `${lastDir}/PRESUPUESTO.xlsx` }
];

files.forEach(file => {
  console.log(`\n📊 ARCHIVO: ${file.name}`);
  console.log('─'.repeat(180));

  try {
    const workbook = XLSX.readFile(file.path);

    console.log(`\nHOJAS DISPONIBLES: ${workbook.SheetNames.length}`);
    workbook.SheetNames.forEach((sheetName, idx) => {
      console.log(`  ${idx + 1}. [${sheetName}]`);
    });

    // Analizar cada hoja
    workbook.SheetNames.forEach(sheetName => {
      console.log(`\n━━━ HOJA: ${sheetName} ━━━`);

      const sheet = workbook.Sheets[sheetName];
      const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
      const rows = range.e.r + 1;
      const cols = range.e.c + 1;

      console.log(`  Dimensiones: ${rows} filas × ${cols} columnas`);

      // Leer como JSON para ver estructura
      const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      console.log(`  Registros de datos: ${data.length}`);

      if (data.length > 0) {
        console.log(`\n  📋 COLUMNAS DETECTADAS:\n`);

        const firstRow = data[0];
        const columns = Object.keys(firstRow);

        columns.forEach((col, idx) => {
          console.log(`     ${(idx + 1).toString().padStart(2)}. [${col}]`);
        });

        console.log(`\n  📌 PRIMEROS 3 REGISTROS:\n`);

        data.slice(0, 3).forEach((row, rowIdx) => {
          console.log(`     Fila ${rowIdx + 1}:`);
          columns.forEach(col => {
            const val = String(row[col] || '').substring(0, 60);
            if (val) {
              console.log(`       ${col}: ${val}`);
            }
          });
          console.log();
        });
      }

      // Analizar raw si hay merged cells o estructura compleja
      console.log(`  📊 ANÁLISIS RAW (primeras 10 filas):\n`);
      for (let r = range.s.r; r < Math.min(range.s.r + 10, range.e.r + 1); r++) {
        let rowStr = `     Fila ${r + 1}: `;
        const rowData = [];
        for (let c = range.s.c; c < Math.min(range.s.c + 15, range.e.c + 1); c++) {
          const cellAddr = XLSX.utils.encode_cell({ r, c });
          const cell = sheet[cellAddr];
          if (cell && cell.v) {
            rowData.push(`${XLSX.utils.encode_col(c)}="${String(cell.v).substring(0, 20)}"`);
          }
        }
        if (rowData.length > 0) {
          console.log(rowStr + rowData.join(' | '));
        }
      }
    });

  } catch (err) {
    console.error(`  ❌ ERROR al leer: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(180));
});

console.log('\n✅ ANÁLISIS COMPLETADO\n');
