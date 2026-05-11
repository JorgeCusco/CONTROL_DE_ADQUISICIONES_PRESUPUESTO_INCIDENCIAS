const XLSX = require('xlsx');

console.log('🔬 ANÁLISIS CUIDADOSO DE ESTRUCTURA ACU\n');
console.log('═'.repeat(200));

const acuPath = 'DATA_LAST/ULTIMO/ACU.xlsx';
const workbook = XLSX.readFile(acuPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

console.log('\n📍 LEYENDO ACU.xlsx LÍNEA POR LÍNEA (primeras 50 filas):\n');

// Leer crudo para ver la estructura real
for (let r = 0; r < 50; r++) {
  let rowData = [];
  for (let c = 0; c <= 16; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[cellAddr];
    const val = cell ? String(cell.v || '').trim() : '';
    const col = String.fromCharCode(65 + c);

    if (val) {
      rowData.push(`${col}="${val.substring(0, 50)}"`);
    }
  }

  if (rowData.length > 0) {
    console.log(`Fila ${(r + 1).toString().padStart(3)}: ${rowData.join(' | ')}`);
  }
}

console.log('\n\n' + '═'.repeat(200));
console.log('\n🔎 ANÁLISIS DE ESTRUCTURA:\n');

// Buscar patrones
let headerRow = -1;
let partidas = [];
let rendimientos = [];
let clasificadores = new Set();

// Buscar líneas con "Partida:" o "Item:"
for (let r = 0; r <= Math.min(100, range.e.r); r++) {
  const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = sheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellF = sheet[XLSX.utils.encode_cell({ r, c: 5 })];
  const cellN = sheet[XLSX.utils.encode_cell({ r, c: 13 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valF = cellF ? String(cellF.v || '').trim() : '';
  const valN = cellN ? String(cellN.v || '').trim() : '';

  // Buscar líneas de partida
  if (valA.includes('Partida:') || valA.match(/^[A-Z]+\.\d+/)) {
    console.log(`✓ Línea ${r + 1}: Partida encontrada`);
    console.log(`  Columna A: ${valA}`);
    console.log(`  Columna B: ${valB}`);
    console.log(`  Columna F: ${valF}`);
    console.log(`  Columna N: ${valN}`);
    partidas.push({ row: r, codigo: valA });
  }

  // Buscar Rendimiento
  if (valA.includes('Rendimiento:') || valF.includes('Rendimiento:') || valN.includes('Rendimiento:')) {
    console.log(`✓ Línea ${r + 1}: RENDIMIENTO encontrado`);
    console.log(`  Columna A: ${valA}`);
    console.log(`  Columna F: ${valF}`);
    console.log(`  Columna N: ${valN}`);
    rendimientos.push({ row: r, valor: valN || valF });
  }

  // Buscar clasificadores
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUBCONTRATOS'].some(c => valA.includes(c) || valB.includes(c))) {
    console.log(`✓ Línea ${r + 1}: CLASIFICADOR encontrado`);
    console.log(`  Columna A: ${valA}`);
    console.log(`  Columna B: ${valB}`);
    clasificadores.add(valA || valB);
  }

  // Buscar encabezado
  if (valA === 'Código' || valA.includes('Código')) {
    console.log(`✓ Línea ${r + 1}: ENCABEZADO encontrado`);
    headerRow = r;
  }
}

console.log(`\n\n📊 HALLAZGOS:`);
console.log(`  Partidas detectadas: ${partidas.length}`);
console.log(`  Rendimientos detectados: ${rendimientos.length}`);
console.log(`  Clasificadores únicos: ${Array.from(clasificadores).join(', ')}`);
console.log(`  Fila de encabezado: ${headerRow + 1}`);

console.log('\n═'.repeat(200));
console.log('\n✅ ANÁLISIS COMPLETADO\n');
