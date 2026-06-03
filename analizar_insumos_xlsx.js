const XLSX = require('xlsx');

console.log('🔍 ANALIZANDO DATA_LAST/INSUMOS.xlsx\n');
console.log('═'.repeat(200));

const book = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');

console.log(`\n📋 Hojas disponibles: ${book.SheetNames.join(', ')}\n`);

for (const sheetName of book.SheetNames) {
  console.log(`${'═'.repeat(200)}\n`);
  console.log(`📄 HOJA: ${sheetName}\n`);

  const sheet = book.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const range = XLSX.utils.decode_range(sheet['!ref']);

  console.log(`Dimensiones: ${data.length} filas x ${Object.keys(data[0] || {}).length} columnas\n`);

  // Mostrar headers
  const headers = Object.keys(data[0] || {});
  console.log('📌 HEADERS (Columnas):\n');
  headers.forEach((h, idx) => {
    console.log(`  ${(idx+1).toString().padStart(2)}. ${h}`);
  });

  // Mostrar primeras 10 filas
  console.log(`\n\n📋 PRIMERAS 10 FILAS DE DATOS:\n`);
  console.log('Row | ' + headers.map(h => h.substring(0, 15).padEnd(15)).join(' | '));
  console.log('─'.repeat(200));

  data.slice(0, 10).forEach((row, idx) => {
    const values = headers.map(h => String(row[h] || '').substring(0, 15).padEnd(15));
    console.log(`${(idx+1).toString().padStart(3)} | ${values.join(' | ')}`);
  });

  console.log(`\n\n📊 ANÁLISIS DE VALORES:\n`);

  // Contar valores únicos para campos clave
  const firstRow = data[0] || {};
  const keyFields = ['codigo_partida', 'codigo_insumo', 'descripcion', 'tipo_insumo', 'unidad'];

  for (const field of keyFields) {
    if (headers.includes(field)) {
      const values = data.map(r => r[field]).filter(v => v);
      const unique = new Set(values).size;
      console.log(`  ${field.padEnd(20)}: ${unique} únicos (total ${values.length})`);
    }
  }
}

console.log(`\n\n${'═'.repeat(200)}\n`);
console.log('🔍 EVALUACIÓN DE COMPATIBILIDAD CON TABLA insumos\n');
console.log('Tabla insumos esperada:\n');
console.log(`  - id (SERIAL PK)`);
console.log(`  - codigo_partida (VARCHAR FK → partidas)`);
console.log(`  - codigo_insumo (VARCHAR)`);
console.log(`  - descripcion (TEXT)`);
console.log(`  - unidad (VARCHAR)`);
console.log(`  - incidencia_original (DECIMAL)`);
console.log(`  - parcial_original (DECIMAL)`);
console.log(`  - incidencia (DECIMAL)`);
console.log(`  - cantidad_modificada (DECIMAL)`);
console.log(`  - cantidad_adquirida (DECIMAL)`);
console.log(`  - comentario (TEXT)`);
console.log(`  - es_extra (BOOLEAN)\n`);
