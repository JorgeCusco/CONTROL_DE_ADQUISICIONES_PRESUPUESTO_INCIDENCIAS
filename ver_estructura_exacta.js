const XLSX = require('xlsx');

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');
const apuSheet = book.Sheets['APU'];
const apuRaw = XLSX.utils.sheet_to_json(apuSheet, { defval: '', blankrows: false });

console.log('📊 ESTRUCTURA EXACTA DE LAS PRIMERAS 30 FILAS\n');
console.log('═'.repeat(180));

apuRaw.slice(0, 30).forEach((row, idx) => {
  console.log(`\n🔹 FILA ${idx + 1}:`);
  console.log('Índice → Valor:');

  Object.entries(row).forEach(([key, value], colIdx) => {
    if (value !== null && value !== undefined && value !== '') {
      console.log(`  [${colIdx}] ${key.padEnd(30)} = "${value}"`);
    }
  });
});

console.log(`\n${'═'.repeat(180)}`);
console.log('\n💡 CLAVE DE INTERPRETACIÓN:\n');
console.log('  Fila 1: Código de Partida + Nombre');
console.log('  Fila 2: Rendimiento + Costo unitario');
console.log('  Fila 3: Encabezados (Código, Parcial, Descripción, etc)');
console.log('  Fila 4+: Datos reales de insumos');
