const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');

console.log('='.repeat(120));
console.log('📊 EXTRAYENDO PARTIDAS - CODIFICACIÓN UTF-8 CORRECTA');
console.log('='.repeat(120));

const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';

// Leer Excel
const workbook = XLSX.readFile(presupuestoPath, { cellFormula: false, cellStyles: false });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);

console.log(`\n📄 Rango: ${sheet['!ref']}\n`);

const partidas = [];
let totalFilas = 0;
let conUnidad = 0;

// Procesar cada fila
for (let row = range.s.r; row <= range.e.r; row++) {
  totalFilas++;

  // Columna A: item (fila + 1 porque Excel es 1-indexed)
  const cellA = sheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
  const item = cellA ? String(cellA.v || '').trim() : '';

  // Columna M (índice 12): UNIDAD - FILTRO CLAVE
  const cellM = sheet[XLSX.utils.encode_cell({ r: row, c: 12 })];
  const unidad = cellM ? String(cellM.v || '').trim() : '';

  // FILTRO: Solo si tiene UNIDAD
  if (!unidad) {
    continue;
  }

  conUnidad++;

  // Columna B (índice 1): descripción - COMPLETA
  const cellB = sheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
  const descripcion = cellB ? String(cellB.v || '').trim() : '';

  // Columna N (índice 13): cantidad/metrado fijo
  const cellN = sheet[XLSX.utils.encode_cell({ r: row, c: 13 })];
  let cantidad = '';
  if (cellN && cellN.v !== undefined && cellN.v !== null) {
    cantidad = cellN.v;
    if (typeof cantidad === 'number') {
      cantidad = cantidad.toString();
    } else {
      cantidad = String(cantidad).trim();
    }
  }

  // Columna O (índice 14): precio
  const cellO = sheet[XLSX.utils.encode_cell({ r: row, c: 14 })];
  let precio = '';
  if (cellO && cellO.v !== undefined && cellO.v !== null) {
    precio = cellO.v;
    if (typeof precio === 'number') {
      precio = precio.toString();
    } else {
      precio = String(precio).trim();
    }
  }

  // Columna R (índice 17): parcial/total
  const cellR = sheet[XLSX.utils.encode_cell({ r: row, c: 17 })];
  let total = '';
  if (cellR && cellR.v !== undefined && cellR.v !== null) {
    total = cellR.v;
    if (typeof total === 'number') {
      total = total.toString();
    } else {
      total = String(total).trim();
    }
  }

  // Agregar partida
  partidas.push({
    item,
    descripcion,
    unidad,
    cantidad,
    precio,
    total
  });
}

console.log(`✅ Total filas procesadas: ${totalFilas}`);
console.log(`✅ Partidas CON UNIDAD: ${conUnidad}\n`);

// Generar CSV con UTF-8 correcto
const csvHeader = 'item,descripcion,unidad,cantidad,precio,total\n';
const csvRows = partidas
  .map(p => {
    // Escapar descripciones que contengan comas o comillas
    let desc = p.descripcion;
    if (desc.includes(',') || desc.includes('"')) {
      desc = `"${desc.replace(/"/g, '""')}"`;
    }

    return `${p.item},${desc},${p.unidad},${p.cantidad},${p.precio},${p.total}`;
  })
  .join('\n');

const csvContent = csvHeader + csvRows;

// Guardar CSV con UTF-8 BOM (para Excel en Windows)
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'PARTIDAS_PRESUPUESTO_FINAL.csv');

// Escribir con BOM UTF-8
const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
const buffer = Buffer.concat([bom, Buffer.from(csvContent, 'utf8')]);
fs.writeFileSync(outputPath, buffer);

console.log(`✅ CSV GENERADO CON UTF-8\n`);
console.log(`   📁 Ubicación: ${outputPath}`);
console.log(`   📊 Total partidas: ${partidas.length}`);
console.log(`   💾 Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`);
console.log(`   🔤 Codificación: UTF-8 con BOM\n`);

// Preview
console.log(`${'-'.repeat(120)}\n`);
console.log(`📄 PREVIEW (primeros 15 registros)\n`);
console.log(`${csvHeader.trim()}`);

partidas.slice(0, 15).forEach(p => {
  let desc = p.descripcion;
  if (desc.includes(',') || desc.includes('"')) {
    desc = `"${desc.replace(/"/g, '""')}"`;
  }
  console.log(`${p.item},${desc},${p.unidad},${p.cantidad},${p.precio},${p.total}`);
});

if (partidas.length > 15) {
  console.log(`\n... ${partidas.length - 15} partidas más`);
}

console.log(`\n${'-'.repeat(120)}\n`);
console.log(`✅ ARCHIVO LISTO Y CORRECTO\n`);
console.log(`   ✅ Descripcionescompletascorrectamente codificadas`);
console.log(`   ✅ Caracteres españoles preservados (Á, é, ó, etc.)`);
console.log(`   ✅ Listo para importar a Excel\n`);
