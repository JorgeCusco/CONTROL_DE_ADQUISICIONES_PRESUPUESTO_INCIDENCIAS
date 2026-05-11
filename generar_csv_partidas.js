const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📊 GENERANDO CSV DESDE PRESUPUESTO.xlsx\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');
const presupuestoSheet = book.Sheets['PRESUPUESTO'];

// Leer datos de PRESUPUESTO
const presupuestoData = XLSX.utils.sheet_to_json(presupuestoSheet, { defval: '' });

console.log(`\n✓ Registros encontrados: ${presupuestoData.length}\n`);

// Mapear datos según especificación
// A=Código, B=Descripción, C=Unidad, D=Metrado Fijo, E=Precio_unitario, F=Total
const partidas = [];

presupuestoData.forEach((row) => {
  const headerArray = Object.keys(row);

  const codigo = row[headerArray[0]] || '';  // Columna A
  const descripcion = row[headerArray[1]] || '';  // Columna B
  const unidad = row[headerArray[2]] || '';  // Columna C
  const metrado_fijo = parseFloat(row[headerArray[3]]) || 0;  // Columna D
  const cantidad_presupuestada = parseFloat(row[headerArray[3]]) || 0;  // Columna D (igual)
  const precio_unitario = parseFloat(row[headerArray[4]]) || 0;  // Columna E
  const total = parseFloat(row[headerArray[5]]) || 0;  // Columna F

  if (codigo && codigo.trim()) {  // Solo si hay código
    partidas.push({
      codigo: String(codigo).trim(),
      descripcion: String(descripcion).trim(),
      unidad: String(unidad).trim(),
      metrado_fijo: metrado_fijo,
      cantidad_presupuestada: cantidad_presupuestada,
      precio_unitario_presupuestado: precio_unitario,
      total_presupuestado: total
    });
  }
});

console.log(`✓ Partidas procesadas: ${partidas.length}\n`);

// Generar CSV
console.log('💾 GENERANDO CSV...\n');

const csvContent = stringify(partidas, {
  header: true,
  columns: [
    'codigo',
    'descripcion',
    'unidad',
    'metrado_fijo',
    'cantidad_presupuestada',
    'precio_unitario_presupuestado',
    'total_presupuestado'
  ]
});

fs.writeFileSync('PARTIDAS.csv', csvContent, 'utf-8');

console.log(`✅ Archivo: PARTIDAS.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${partidas.length}\n`);

// Mostrar primeros registros
console.log('📋 PRIMEROS 10 REGISTROS:\n');
partidas.slice(0, 10).forEach((p, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. [${p.codigo}] ${p.descripcion.substring(0, 50).padEnd(50)} | Metrado: ${p.metrado_fijo}`);
});

console.log(`\n${'═'.repeat(160)}`);
console.log('\n✅ CSV LISTO\n');
