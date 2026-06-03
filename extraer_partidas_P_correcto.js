const XLSX = require('xlsx');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

console.log('✅ EXTRACCIÓN CORRECTA PARTIDAS_P (desde PRESUPUESTO.xlsx)\n');
console.log('═'.repeat(200));

const presupuestoPath = 'DATA_LAST/ULTIMO/PRESUPUESTO.xlsx';
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';

// =====================================================
// EXTRAER PARTIDAS CON CANTIDAD, PRECIO Y TOTAL
// =====================================================
console.log('\n1️⃣ LEYENDO PRESUPUESTO.xlsx\n');

const presWb = XLSX.readFile(presupuestoPath);
const presSheet = presWb.Sheets[presWb.SheetNames[0]];
const presRange = XLSX.utils.decode_range(presSheet['!ref'] || 'A1');

let partidasData = [];

// Leer desde la fila 10 (después de metadatos)
for (let r = 10; r <= presRange.e.r; r++) {
  const cellA = presSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = presSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellM = presSheet[XLSX.utils.encode_cell({ r, c: 12 })];
  const cellN = presSheet[XLSX.utils.encode_cell({ r, c: 13 })];
  const cellO = presSheet[XLSX.utils.encode_cell({ r, c: 14 })];
  const cellR = presSheet[XLSX.utils.encode_cell({ r, c: 17 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valM = cellM ? String(cellM.v || '').trim() : '';
  const valN = cellN ? (cellN.v || '') : '';
  const valO = cellO ? (cellO.v || '') : '';
  const valR = cellR ? (cellR.v || '') : '';

  // Solo partidas de nivel 5 (OE.X.X.X.X con punto final)
  // Estas son las que tienen cantidad, precio y total
  if (valA && valA.match(/^OE\.\d+\.\d+\.\d+\.\d+$/) && valN && valN !== '') {
    const cantidad = parseFloat(valN) || 0;
    const precio = parseFloat(valO) || 0;
    const total = parseFloat(valR) || 0;

    partidasData.push({
      item: valA,
      descripcion: valB,
      unidad: valM,
      cantidad: cantidad,
      precio_unitario: precio,
      total: total,
      rendimiento: ''  // No disponible en PRESUPUESTO, se completa desde ACU si es necesario
    });
  }
}

console.log(`  ✓ ${partidasData.length} partidas de nivel 5 extraídas (con cantidad, precio, total)\n`);

// Generar CSV PARTIDAS_P
const csvPartidas = stringify(partidasData, {
  header: true,
  columns: [
    'item',
    'descripcion',
    'unidad',
    'cantidad',
    'precio_unitario',
    'total',
    'rendimiento'
  ]
});

// Agregar BOM UTF-8
const csvPartidosConBOM = '﻿' + csvPartidas;

fs.writeFileSync(`${outputDir}/PARTIDAS_P.csv`, csvPartidosConBOM, 'utf8');
console.log(`  ✓ Guardado: PARTIDAS_P.csv\n`);

// Leer ACU para obtener rendimientos
const acuPath = 'DATA_LAST/ULTIMO/ACU.xlsx';
const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

const rendimientosMap = new Map();

for (let r = 0; r <= acuRange.e.r; r++) {
  const cellA = acuSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellN = acuSheet[XLSX.utils.encode_cell({ r, c: 13 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valN = cellN ? String(cellN.v || '').trim() : '';

  if (valA.includes('Partida:')) {
    const partida = valA.replace('Partida: ', '').trim();
    if (valN.includes('Rendimiento:')) {
      const rend = valN.replace('Rendimiento: ', '').trim();
      if (!rendimientosMap.has(partida)) {
        rendimientosMap.set(partida, rend);
      }
    }
  }
}

// Actualizar rendimientos
for (let i = 0; i < partidasData.length; i++) {
  const rend = rendimientosMap.get(partidasData[i].item);
  if (rend) {
    partidasData[i].rendimiento = rend;
  }
}

// Regenerar CSV con rendimientos
const csvPartidosActualizado = stringify(partidasData, {
  header: true,
  columns: [
    'item',
    'descripcion',
    'unidad',
    'cantidad',
    'precio_unitario',
    'total',
    'rendimiento'
  ]
});

const csvPartidosActualizadoConBOM = '﻿' + csvPartidosActualizado;
fs.writeFileSync(`${outputDir}/PARTIDAS_P.csv`, csvPartidosActualizadoConBOM, 'utf8');

console.log(`  ✓ Rendimientos completados desde ACU.xlsx`);
console.log(`  ✓ ${rendimientosMap.size} rendimientos encontrados\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN FINAL\n');
console.log(`PARTIDAS_P.csv (CORRECTO)`);
console.log(`  Partidas de nivel 5: ${partidasData.length}`);
console.log(`  Estructura: item | descripcion | unidad | cantidad | precio_unitario | total | rendimiento\n`);

// Sample
console.log(`📋 Primeros 3 registros:\n`);
for (let i = 0; i < Math.min(3, partidasData.length); i++) {
  const p = partidasData[i];
  console.log(`  ${p.item} | ${p.descripcion.substring(0, 30)} | ${p.unidad} | ${p.cantidad} x ${p.precio_unitario} = ${p.total}`);
}

console.log('\n═'.repeat(200));
console.log('\n✅ EXTRACCIÓN PARTIDAS COMPLETADA\n');
console.log(`📁 Archivo guardado en: ${outputDir}/PARTIDAS_P.csv\n`);
