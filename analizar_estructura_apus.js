const XLSX = require('xlsx');

console.log('🔍 ANALIZANDO ESTRUCTURA DEL ARCHIVO EXCEL\n');
console.log('═'.repeat(160));

// Probar con diferentes archivos
const archivos = ['APU Y PRESUPUESTO.xlsx', 'APUS_Extraidos_v2.xlsx', 'APUS_LAST.xls'];

for (const archivo of archivos) {
  try {
    console.log(`\n\n📄 Intentando con: ${archivo}\n`);

    const book = XLSX.readFile(archivo);

    console.log(`Hojas disponibles: ${book.SheetNames.join(', ')}\n`);

    // Analizar la primera hoja que parezca ser APU
    let targetSheet = null;
    for (const sheetName of book.SheetNames) {
      if (sheetName.includes('APU') || sheetName.toLowerCase().includes('apu')) {
        targetSheet = sheetName;
        break;
      }
    }

    if (!targetSheet) {
      targetSheet = book.SheetNames[0];
    }

    console.log(`📋 Analizando hoja: ${targetSheet}\n`);

    const sheet = book.Sheets[targetSheet];
    const range = XLSX.utils.decode_range(sheet['!ref']);

    // Mostrar primeras 50 filas
    console.log('Primeras 30 filas (columnas A-P):\n');
    console.log('Fila | Col A | Col B | Col C | Col D | Col E | Col J | Col K | Col M | Col O | Col P');
    console.log('─'.repeat(160));

    for (let row = 0; row < 30; row++) {
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

    console.log('\n' + '═'.repeat(160));
    break;

  } catch (e) {
    console.log(`  ❌ No se pudo leer: ${e.message}\n`);
  }
}
