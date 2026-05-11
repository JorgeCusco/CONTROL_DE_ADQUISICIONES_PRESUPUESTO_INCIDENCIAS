const XLSX = require('xlsx');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

console.log('✅ EXTRACCIÓN FINAL Y CORRECTA DE ACU\n');
console.log('═'.repeat(200));

const acuPath = 'DATA_LAST/ULTIMO/ACU.xlsx';
const presupuestoPath = 'DATA_LAST/ULTIMO/PRESUPUESTO.xlsx';
const insumosPath = 'DATA_LAST/ULTIMO/INSUMOS.xlsx';

const outputDir = 'DATA_LAST/TABLAS_FINAL';

// =====================================================
// 1. EXTRAER ACU DE FORMA CORRECTA
// =====================================================
console.log('\n1️⃣ EXTRAYENDO ACU.xlsx CON NOMBRE DE PARTIDA COMPLETO\n');

const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

let acusData = [];
let currentPartida = null;
let currentNombrePartida = null;
let currentRendimiento = null;
let currentTipo = null;
let waitingForNombre = false;

// Leer línea por línea
for (let r = 0; r <= acuRange.e.r; r++) {
  const cellA = acuSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = acuSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellJ = acuSheet[XLSX.utils.encode_cell({ r, c: 9 })];
  const cellK = acuSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = acuSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellP = acuSheet[XLSX.utils.encode_cell({ r, c: 15 })];
  const cellQ = acuSheet[XLSX.utils.encode_cell({ r, c: 16 })];
  const cellN = acuSheet[XLSX.utils.encode_cell({ r, c: 13 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valJ = cellJ ? String(cellJ.v || '').trim() : '';
  const valK = cellK ? String(cellK.v || '').trim() : '';
  const valM = cellM ? (cellM.v || '') : '';
  const valP = cellP ? (cellP.v || '') : '';
  const valQ = cellQ ? (cellQ.v || '') : '';
  const valN = cellN ? String(cellN.v || '').trim() : '';

  // ========== DETECTAR PARTIDA ==========
  if (valA.includes('Partida:')) {
    // Extraer item (quitar "Partida: ")
    currentPartida = valA.replace('Partida: ', '').trim();

    // Rendimiento está en MISMA FILA (Columna N)
    if (valN.includes('Rendimiento:')) {
      currentRendimiento = valN.replace('Rendimiento: ', '').trim();
    }

    // La PRÓXIMA fila tendrá el nombre de la partida en Columna A
    waitingForNombre = true;
    continue;
  }

  // ========== DETECTAR NOMBRE DE PARTIDA (fila después de Partida:) ==========
  if (waitingForNombre && valA && !valA.includes('Código') && !valA.includes('Rendimiento')) {
    currentNombrePartida = valA;
    waitingForNombre = false;
    continue;
  }

  // ========== DETECTAR CLASIFICADOR ==========
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUB-CONTRATOS'].includes(valA)) {
    currentTipo = valA;
  }

  // ========== DETECTAR INSUMO (tiene código y cantidad) ==========
  if (currentPartida && valA && !valA.includes('Código') && !valA.includes('Costo') && !['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUB-CONTRATOS'].includes(valA) && valJ) {
    acusData.push({
      item: currentPartida,
      nombre_partida: currentNombrePartida || '',
      rendimiento: currentRendimiento || '',
      tipo: currentTipo || '',
      codigo: valA,
      descripcion_insumo: valB,
      unidad: valJ,
      recursos: valK || '',
      cantidad: valM !== '' ? parseFloat(valM) : '',
      precio: valP !== '' ? parseFloat(valP) : '',
      parcial: valQ !== '' ? parseFloat(valQ) : ''
    });
  }
}

console.log(`  ✓ ${acusData.length} relaciones partida-insumo extraídas\n`);

// Generar CSV ACUS
const csvAcus = stringify(acusData, {
  header: true,
  columns: [
    'item',
    'nombre_partida',
    'rendimiento',
    'tipo',
    'codigo',
    'descripcion_insumo',
    'unidad',
    'recursos',
    'cantidad',
    'precio',
    'parcial'
  ]
});

fs.writeFileSync(`${outputDir}/ACUS.csv`, csvAcus, 'utf8');
console.log(`  ✓ Guardado: ACUS.csv\n`);

// =====================================================
// 2. EXTRAER PARTIDAS DE PRESUPUESTO (TODAS)
// =====================================================
console.log('2️⃣ EXTRAYENDO TODAS LAS PARTIDAS del ACU\n');

// Usar datos de ACUS para extraer partidas únicas
const partidasUnicasMap = new Map();

acusData.forEach(row => {
  const key = row.item;
  if (!partidasUnicasMap.has(key)) {
    partidasUnicasMap.set(key, {
      item: row.item,
      nombre: row.nombre_partida,
      rendimiento: row.rendimiento
    });
  }
});

const partidasAllData = Array.from(partidasUnicasMap.values());

console.log(`  ✓ ${partidasAllData.length} partidas únicas extraídas del ACU\n`);

// Generar CSV PARTIDAS_ALL
const csvPartidas = stringify(partidasAllData, {
  header: true,
  columns: ['item', 'nombre', 'rendimiento']
});

fs.writeFileSync(`${outputDir}/PARTIDAS_TODAS.csv`, csvPartidas, 'utf8');
console.log(`  ✓ Guardado: PARTIDAS_TODAS.csv\n`);

// =====================================================
// 3. EXTRAER INSUMOS (AGREGADOS) - SIN CAMBIOS
// =====================================================
console.log('3️⃣ EXTRAYENDO INSUMOS AGREGADOS\n');

const insumosWb = XLSX.readFile(insumosPath);
const insumosSheet = insumosWb.Sheets[insumosWb.SheetNames[0]];
const insumosRange = XLSX.utils.decode_range(insumosSheet['!ref'] || 'A1');

let insumosData = [];
let headerRowInsumos = 8;

for (let r = headerRowInsumos + 1; r <= insumosRange.e.r; r++) {
  const cellA = insumosSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = insumosSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellJ = insumosSheet[XLSX.utils.encode_cell({ r, c: 9 })];
  const cellK = insumosSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = insumosSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellO = insumosSheet[XLSX.utils.encode_cell({ r, c: 14 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valJ = cellJ ? String(cellJ.v || '').trim() : '';
  const valK = cellK ? (cellK.v || '') : '';
  const valM = cellM ? (cellM.v || '') : '';
  const valO = cellO ? (cellO.v || '') : '';

  if (valA && valA !== 'Código' && /^\d+$/.test(valA)) {
    insumosData.push({
      codigo: valA,
      descripcion: valB,
      unidad: valJ,
      cantidad_insumo: valK !== '' ? parseFloat(valK) : 0,
      costo: valM !== '' ? parseFloat(valM) : 0,
      total: valO !== '' ? parseFloat(valO) : 0
    });
  }
}

console.log(`  ✓ ${insumosData.length} insumos agregados extraídos\n`);

const csvInsumos = stringify(insumosData, {
  header: true,
  columns: ['codigo', 'descripcion', 'unidad', 'cantidad_insumo', 'costo', 'total']
});

fs.writeFileSync(`${outputDir}/INSUMOS.csv`, csvInsumos, 'utf8');
console.log(`  ✓ Guardado: INSUMOS.csv\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN FINAL\n');
console.log(`ACUS.csv`);
console.log(`  Relaciones partida↔insumo: ${acusData.length}`);
console.log(`  Estructura: item | nombre_partida | rendimiento | tipo | codigo | descripcion_insumo | unidad | recursos | cantidad | precio | parcial\n`);

console.log(`PARTIDAS_TODAS.csv`);
console.log(`  Partidas: ${partidasAllData.length}`);
console.log(`  Estructura: item | nombre | rendimiento\n`);

console.log(`INSUMOS.csv`);
console.log(`  Insumos agregados: ${insumosData.length}`);
console.log(`  Estructura: codigo | descripcion | unidad | cantidad_insumo | costo | total\n`);

console.log('═'.repeat(200));
console.log('\n✅ EXTRACCIÓN FINAL COMPLETADA\n');
console.log(`📁 Archivos guardados en: ${outputDir}/\n`);
