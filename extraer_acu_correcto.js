const XLSX = require('xlsx');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

console.log('✅ EXTRACCIÓN CORRECTA DE ACU.xlsx\n');
console.log('═'.repeat(200));

const acuPath = 'DATA_LAST/ULTIMO/ACU.xlsx';
const presupuestoPath = 'DATA_LAST/ULTIMO/PRESUPUESTO.xlsx';
const insumosPath = 'DATA_LAST/ULTIMO/INSUMOS.xlsx';

const outputDir = 'DATA_LAST/TABLAS_FINAL';

// Crear carpeta
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// =====================================================
// 1. EXTRAER ACU CORRECTAMENTE
// =====================================================
console.log('\n1️⃣ EXTRAYENDO ACU.xlsx\n');

const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

let acusData = [];
let currentPartida = null;
let currentDescripcion = null;
let currentRendimiento = null;
let currentTipo = null;

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

  // Detectar partida
  if (valA.includes('Partida:')) {
    currentPartida = valA.replace('Partida: ', '').trim();

    // Rendimiento está en la MISMA FILA (Columna N)
    if (valN.includes('Rendimiento:')) {
      currentRendimiento = valN.replace('Rendimiento: ', '').trim();
    }
    continue;
  }

  // Detectar descripción (línea después de partida)
  if (currentPartida && !valA && !valB && valA !== 'Código' && valA !== 'MANO DE OBRA' && valA !== 'MATERIALES' && valA !== 'EQUIPO') {
    if (valA && !valA.includes('Costo')) {
      currentDescripcion = valA;
    }
  }

  // Si la fila anterior está vacía y esta tiene descripción = descripción de partida
  if (currentPartida && !currentDescripcion && valA) {
    if (!valA.includes('Código') && !valA.includes('Rendimiento') && !['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(valA)) {
      currentDescripcion = valA;
    }
  }

  // Detectar clasificador
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(valA)) {
    currentTipo = valA;
  }

  // Detectar insumo (tiene código)
  if (currentPartida && valA && !valA.includes('Código') && !valA.includes('Costo') && !['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(valA) && valJ) {
    acusData.push({
      item_partida: currentPartida,
      descripcion_partida: currentDescripcion || '',
      rendimiento: currentRendimiento || '',
      tipo_insumo: currentTipo || '',
      codigo_insumo: valA,
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
    'item_partida',
    'descripcion_partida',
    'rendimiento',
    'tipo_insumo',
    'codigo_insumo',
    'descripcion_insumo',
    'unidad',
    'recursos',
    'cantidad',
    'precio',
    'parcial'
  ]
});

// Reemplazar encabezado para que sea más legible
const csvAcusLines = csvAcus.split('\n');
csvAcusLines[0] = 'item,descripcion,rendimiento,tipo,codigo,descripcion_insumo,unidad,recursos,cantidad,precio,parcial';
const csvAcusFinal = csvAcusLines.join('\n');

fs.writeFileSync(`${outputDir}/ACUS.csv`, csvAcusFinal);
console.log(`  ✓ Guardado: ACUS.csv\n`);

// =====================================================
// 2. EXTRAER PARTIDAS DE PRESUPUESTO
// =====================================================
console.log('2️⃣ EXTRAYENDO PARTIDAS del PRESUPUESTO.xlsx\n');

const presupuestoWb = XLSX.readFile(presupuestoPath);
const presupuestoSheet = presupuestoWb.Sheets[presupuestoWb.SheetNames[0]];
const presupuestoRange = XLSX.utils.decode_range(presupuestoSheet['!ref'] || 'A1');

let partidasData = [];
let headerRowPresupuesto = 9; // Fila 10 (0-indexed)

// Leer PRESUPUESTO línea por línea (solo partidas detalladas con cantidad)
for (let r = headerRowPresupuesto + 1; r <= presupuestoRange.e.r; r++) {
  const cellA = presupuestoSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = presupuestoSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellM = presupuestoSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellN = presupuestoSheet[XLSX.utils.encode_cell({ r, c: 13 })];
  const cellR = presupuestoSheet[XLSX.utils.encode_cell({ r, c: 17 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valN = cellN ? (cellN.v || '') : '';
  const valR = cellR ? (cellR.v || '') : '';

  // Solo partidas detalladas (nivel 5 o con cantidad > 0)
  if (valA && valN && parseFloat(valN) > 0) {
    // Filtrar solo partidas de 5 niveles (OE.X.X.X.X)
    const niveles = valA.split('.').length;
    if (niveles === 5) {
      partidasData.push({
        item: valA,
        descripcion: valB,
        cantidad: parseFloat(valN) || 0,
        total: valR !== '' ? parseFloat(valR) : 0
      });
    }
  }
}

console.log(`  ✓ ${partidasData.length} partidas detalladas extraídas\n`);

// Generar CSV PARTIDAS
const csvPartidas = stringify(partidasData, {
  header: true,
  columns: ['item', 'descripcion', 'cantidad', 'total']
});

fs.writeFileSync(`${outputDir}/PARTIDAS.csv`, csvPartidas);
console.log(`  ✓ Guardado: PARTIDAS.csv\n`);

// =====================================================
// 3. EXTRAER INSUMOS (AGREGADOS)
// =====================================================
console.log('3️⃣ EXTRAYENDO INSUMOS AGREGADOS\n');

const insumosWb = XLSX.readFile(insumosPath);
const insumosSheet = insumosWb.Sheets[insumosWb.SheetNames[0]];
const insumosRange = XLSX.utils.decode_range(insumosSheet['!ref'] || 'A1');

let insumosData = [];
let headerRowInsumos = 8; // Fila 9 (0-indexed)

// Leer INSUMOS (solo con código)
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

  // Solo con código
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

// Generar CSV INSUMOS
const csvInsumos = stringify(insumosData, {
  header: true,
  columns: ['codigo', 'descripcion', 'unidad', 'cantidad_insumo', 'costo', 'total']
});

fs.writeFileSync(`${outputDir}/INSUMOS.csv`, csvInsumos);
console.log(`  ✓ Guardado: INSUMOS.csv\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN\n');
console.log(`ACUS.csv`);
console.log(`  Relaciones partida↔insumo: ${acusData.length}`);
console.log(`  Estructura: item_partida | descripcion_partida | rendimiento | tipo_insumo | codigo_insumo | descripcion_insumo | unidad | recursos | cantidad | precio | parcial\n`);

console.log(`PARTIDAS.csv`);
console.log(`  Partidas detalladas: ${partidasData.length}`);
console.log(`  Estructura: item | descripcion | cantidad | total\n`);

console.log(`INSUMOS.csv`);
console.log(`  Insumos agregados: ${insumosData.length}`);
console.log(`  Estructura: codigo | descripcion | unidad | cantidad_insumo | costo | total\n`);

console.log('═'.repeat(200));
console.log('\n✅ EXTRACCIÓN COMPLETADA\n');
console.log(`📁 Archivos guardados en: ${outputDir}/\n`);
