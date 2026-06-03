const XLSX = require('xlsx');
const path = require('path');

const baseDir = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital';

console.log('📊 Iniciando consolidación...\n');

// ============ 1. LEER ACU ============
console.log('📖 Leyendo ACU...');
const acuPath = path.join(baseDir, 'SALDOS A MOD. 06 - ACU 16.05 v.02.xlsx');
const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

const partidas = new Map(); // partida → { nombre, rendimiento, metrado }
const insumosMap = new Map(); // codigo → { descripcion, unidad, cantidad_total, costo_unitario, total }
const relacionesPI = []; // partida-insumo relations

let currentPartida = null;
let currentNombrePartida = null;
let currentRendimiento = null;
let currentClasificador = null;

const clasificadores = ['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'SUB-CONTRATOS'];

for (let r = 0; r <= acuRange.e.r; r++) {
  const cellA = acuSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = acuSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellJ = acuSheet[XLSX.utils.encode_cell({ r, c: 9 })];
  const cellK = acuSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = acuSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellO = acuSheet[XLSX.utils.encode_cell({ r, c: 14 })]; // Rendimiento está en O
  const cellP = acuSheet[XLSX.utils.encode_cell({ r, c: 15 })];
  const cellQ = acuSheet[XLSX.utils.encode_cell({ r, c: 16 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valJ = cellJ ? String(cellJ.v || '').trim() : '';
  const valK = cellK ? (cellK.v || '') : '';
  const valM = cellM ? (cellM.v || '') : '';
  const valO = cellO ? String(cellO.v || '').trim() : ''; // Rendimiento
  const valP = cellP ? (cellP.v || '') : '';
  const valQ = cellQ ? (cellQ.v || '') : '';

  // Detectar PARTIDA
  if (valA.startsWith('Partida:')) {
    const match = valA.match(/Partida:\s*(.+)/);
    if (match) {
      currentPartida = match[1].trim();
      currentNombrePartida = null; // Reset para la siguiente fila
      // Rendimiento está en columna O (misma fila)
      const rendMatch = valO.match(/Rendimiento:\s*(.+)/);
      currentRendimiento = rendMatch ? rendMatch[1].trim() : '';
      currentClasificador = null;
    }
    continue;
  }

  // Detectar NOMBRE PARTIDA (primera fila después de Partida: sin "Código")
  if (currentPartida && !currentNombrePartida && valA && !valA.includes('Código') && !clasificadores.includes(valA)) {
    currentNombrePartida = valA;
    if (!partidas.has(currentPartida)) {
      partidas.set(currentPartida, {
        nombre: currentNombrePartida,
        rendimiento: currentRendimiento,
        metrado: null
      });
    }
    continue;
  }

  // Detectar CLASIFICADOR
  if (clasificadores.some(cl => valA.includes(cl))) {
    currentClasificador = valA.split('|')[0].trim();
    continue;
  }

  // Detectar INSUMO (código numérico en A, unidad en J)
  if (currentPartida && currentClasificador && valA && /^\d+$/.test(valA) && valJ) {
    const codigo = valA;
    const descripcion = valB;
    const unidad = valJ;
    const recursos = valK || '';
    const cantidad = parseFloat(valM) || 0;
    const precio = parseFloat(valP) || 0;
    const parcial = parseFloat(valQ) || 0;

    // Agregar a INSUMOS
    if (insumosMap.has(codigo)) {
      const insumo = insumosMap.get(codigo);
      insumo.cantidad_total += cantidad;
      insumo.total += parcial;
    } else {
      insumosMap.set(codigo, {
        descripcion,
        unidad,
        cantidad_total: cantidad,
        costo_unitario: precio,
        total: parcial
      });
    }

    // Agregar relación PARTIDA-INSUMO
    relacionesPI.push({
      partida: currentPartida,
      codigo_insumo: codigo,
      clasificador: currentClasificador,
      recursos,
      cantidad: cantidad,
      precio,
      parcial
    });
  }
}

console.log(`✅ ACU procesado: ${partidas.size} partidas, ${insumosMap.size} insumos únicos, ${relacionesPI.length} relaciones`);

// ============ 2. LEER PRESUPUESTO ============
console.log('📖 Leyendo PRESUPUESTO...');
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

  // Buscar partidas exactas (formato OE.1.1.1.01)
  if (/^OE\.\d+(\.\d+)+$/.test(valA) && partidas.has(valA)) {
    const metrado = parseFloat(valM) || 0;
    const pData = partidas.get(valA);
    pData.metrado = metrado;
    pData.unidad_metrado = valK; // Unidad de medida
  }
}

console.log(`✅ PRESUPUESTO procesado: ${[...partidas.values()].filter(p => p.metrado !== null).length} con metrados`);

// ============ 3. GENERAR DATOS PARA HOJAS ============

// HOJA 1: PARTIDAS
const dataPartidas = [
  ['partida', 'nombre', 'rendimiento', 'metrado', 'unidad_metrado']
];
partidas.forEach((data, partida) => {
  dataPartidas.push([
    partida,
    data.nombre || '',
    data.rendimiento || '',
    data.metrado || 0,
    data.unidad_metrado || ''
  ]);
});

// HOJA 2: INSUMOS_CONSOLIDADOS
const dataInsumos = [
  ['codigo', 'descripcion', 'unidad', 'cantidad_total', 'costo_unitario', 'total']
];
insumosMap.forEach((data, codigo) => {
  dataInsumos.push([
    codigo,
    data.descripcion,
    data.unidad,
    data.cantidad_total.toFixed(4),
    data.costo_unitario.toFixed(2),
    data.total.toFixed(2)
  ]);
});

// HOJA 3: PARTIDAS_INSUMOS
const dataRelaciones = [
  ['partida', 'codigo_insumo', 'clasificador', 'recursos', 'cantidad', 'precio', 'parcial']
];
relacionesPI.forEach(rel => {
  dataRelaciones.push([
    rel.partida,
    rel.codigo_insumo,
    rel.clasificador,
    rel.recursos,
    rel.cantidad.toFixed(4),
    rel.precio.toFixed(2),
    rel.parcial.toFixed(2)
  ]);
});

// ============ 4. CREAR EXCEL ============
console.log('📝 Creando Excel...');
const newWb = XLSX.utils.book_new();

const wsPartidas = XLSX.utils.aoa_to_sheet(dataPartidas);
const wsInsumos = XLSX.utils.aoa_to_sheet(dataInsumos);
const wsRelaciones = XLSX.utils.aoa_to_sheet(dataRelaciones);

// Ajustar ancho de columnas
wsPartidas['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
wsInsumos['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
wsRelaciones['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];

XLSX.utils.book_append_sheet(newWb, wsPartidas, 'PARTIDAS');
XLSX.utils.book_append_sheet(newWb, wsInsumos, 'INSUMOS_CONSOLIDADOS');
XLSX.utils.book_append_sheet(newWb, wsRelaciones, 'PARTIDAS_INSUMOS');

const outputPath = path.join(baseDir, 'TABLAS_DINAMICAS_CONSOLIDADAS.xlsx');
XLSX.writeFile(newWb, outputPath);

console.log(`\n✅ Excel generado: ${outputPath}`);
console.log(`\n📊 Resumen:`);
console.log(`   • PARTIDAS: ${dataPartidas.length - 1} filas`);
console.log(`   • INSUMOS_CONSOLIDADOS: ${dataInsumos.length - 1} filas`);
console.log(`   • PARTIDAS_INSUMOS: ${dataRelaciones.length - 1} filas`);
