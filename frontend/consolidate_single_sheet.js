const XLSX = require('xlsx');
const path = require('path');

const baseDir = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital';

console.log('📊 Consolidando TODO en una sola hoja...\n');

// ============ 1. LEER ACU ============
console.log('📖 Leyendo ACU...');
const acuPath = path.join(baseDir, 'SALDOS A MOD. 06 - ACU 16.05 v.02.xlsx');
const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

// Primero: extraer partidas y sus metrados del PRESUPUESTO
const metradosMap = new Map(); // partida → { nombre, metrado, unidad_metrado }

console.log('📖 Leyendo PRESUPUESTO para metrados...');
const presPath = path.join(baseDir, 'SALDOS A MOD. 06 - PRESUPUESTO 16.05 v.02.xlsx');
const presWb = XLSX.readFile(presPath);
const presSheet = presWb.Sheets[presWb.SheetNames[0]];
const presRange = XLSX.utils.decode_range(presSheet['!ref'] || 'A1');

for (let r = 0; r <= presRange.e.r; r++) {
  const cellA = presSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = presSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellK = presSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = presSheet[XLSX.utils.encode_cell({ r, c: 12 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valK = cellK ? String(cellK.v || '').trim() : '';
  const valM = cellM ? (cellM.v || '') : '';

  if (/^OE\.\d+(\.\d+)+$/.test(valA)) {
    const metrado = parseFloat(valM) || 0;
    metradosMap.set(valA, {
      nombre: valB,
      metrado,
      unidad_metrado: valK
    });
  }
}

console.log(`✅ ${metradosMap.size} partidas con metrados`);

// Segundo: procesar ACU y crear tabla unificada
const dataConsolidada = [
  ['partida', 'nombre_partida', 'rendimiento', 'metrado_partida', 'unidad_metrado', 'clasificador', 'codigo_insumo', 'descripcion_insumo', 'unidad_insumo', 'recursos', 'cantidad_insumo', 'precio', 'parcial']
];

let currentPartida = null;
let currentNombrePartida = null;
let currentRendimiento = null;
let currentClasificador = null;
let currentMetrado = 0;
let currentUnidadMetrado = '';

const clasificadores = ['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUB-CONTRATOS'];

for (let r = 0; r <= acuRange.e.r; r++) {
  const cellA = acuSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = acuSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellJ = acuSheet[XLSX.utils.encode_cell({ r, c: 9 })];
  const cellK = acuSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = acuSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellO = acuSheet[XLSX.utils.encode_cell({ r, c: 14 })];
  const cellP = acuSheet[XLSX.utils.encode_cell({ r, c: 15 })];
  const cellQ = acuSheet[XLSX.utils.encode_cell({ r, c: 16 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valJ = cellJ ? String(cellJ.v || '').trim() : '';
  const valK = cellK ? (cellK.v || '') : '';
  const valM = cellM ? (cellM.v || '') : '';
  const valO = cellO ? String(cellO.v || '').trim() : '';
  const valP = cellP ? (cellP.v || '') : '';
  const valQ = cellQ ? (cellQ.v || '') : '';

  // Detectar PARTIDA
  if (valA.startsWith('Partida:')) {
    const match = valA.match(/Partida:\s*(.+)/);
    if (match) {
      currentPartida = match[1].trim();
      currentNombrePartida = null;
      const rendMatch = valO.match(/Rendimiento:\s*(.+)/);
      currentRendimiento = rendMatch ? rendMatch[1].trim() : '';
      currentClasificador = null;

      // Obtener metrado del presupuesto
      const metData = metradosMap.get(currentPartida) || { nombre: '', metrado: 0, unidad_metrado: '' };
      currentMetrado = metData.metrado;
      currentUnidadMetrado = metData.unidad_metrado;
    }
    continue;
  }

  // Detectar NOMBRE PARTIDA
  if (currentPartida && !currentNombrePartida && valA && !valA.includes('Código') && !clasificadores.includes(valA)) {
    currentNombrePartida = valA;
    continue;
  }

  // Detectar CLASIFICADOR
  if (clasificadores.some(cl => valA.includes(cl))) {
    currentClasificador = valA.split('|')[0].trim();
    continue;
  }

  // Detectar INSUMO
  if (currentPartida && currentClasificador && valA && /^\d+$/.test(valA) && valJ) {
    const codigo = valA;
    const descripcion = valB;
    const unidad = valJ;
    const recursos = valK || '';
    const cantidad = parseFloat(valM) || 0;
    const precio = parseFloat(valP) || 0;
    const parcial = parseFloat(valQ) || 0;

    dataConsolidada.push([
      currentPartida,
      currentNombrePartida || '',
      currentRendimiento || '',
      currentMetrado,
      currentUnidadMetrado,
      currentClasificador,
      codigo,
      descripcion,
      unidad,
      recursos,
      cantidad.toFixed(4),
      precio.toFixed(2),
      parcial.toFixed(2)
    ]);
  }
}

console.log(`✅ Tabla consolidada: ${dataConsolidada.length - 1} filas de datos`);

// ============ 3. CREAR EXCEL ============
console.log('📝 Creando Excel...');
const newWb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(dataConsolidada);

// Ajustar ancho de columnas
ws['!cols'] = [
  { wch: 15 },  // partida
  { wch: 35 },  // nombre_partida
  { wch: 18 },  // rendimiento
  { wch: 15 },  // metrado_partida
  { wch: 15 },  // unidad_metrado
  { wch: 18 },  // clasificador
  { wch: 15 },  // codigo_insumo
  { wch: 35 },  // descripcion_insumo
  { wch: 12 },  // unidad_insumo
  { wch: 12 },  // recursos
  { wch: 15 },  // cantidad_insumo
  { wch: 12 },  // precio
  { wch: 12 }   // parcial
];

XLSX.utils.book_append_sheet(newWb, ws, 'CONSOLIDADO');

const outputPath = path.join(baseDir, 'CONSOLIDADO_TABLAS_DINAMICAS.xlsx');
XLSX.writeFile(newWb, outputPath);

console.log(`\n✅ Excel generado: ${outputPath}`);
console.log(`\n📊 Resumen:`);
console.log(`   • Total de filas: ${dataConsolidada.length - 1}`);
console.log(`   • Columnas: 13`);
console.log(`   • Estructura: partida | nombre | rendimiento | metrado | unidad | clasificador | codigo_insumo | descripcion | unidad_insumo | recursos | cantidad | precio | parcial`);
