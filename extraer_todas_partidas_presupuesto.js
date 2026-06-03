const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(120));
console.log('📊 EXTRAYENDO TODAS LAS PARTIDAS DE PRESUPUESTO.xlsx');
console.log('='.repeat(120));

const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';

// Leer Excel
const workbook = XLSX.readFile(presupuestoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);

console.log(`\n📄 Procesando Excel: ${sheet['!ref']}\n`);

const partidas = [];
let totalFilas = 0;

// Procesar cada fila
for (let row = range.s.r; row <= range.e.r; row++) {
  totalFilas++;

  // Columna A: Item (código)
  const cellA = sheet[`A${row + 1}`];
  const item = cellA ? String(cellA.v || '').trim() : '';

  // Solo procesar si tiene formato OE.X.X.X.X (partida final)
  if (!item.match(/^OE\.\d+\.\d+\.\d+\.\d+/)) {
    continue;
  }

  // Columna B: Descripción
  const cellB = sheet[`B${row + 1}`];
  const descripcion = cellB ? String(cellB.v || '').trim() : '';

  // Columna M: Unidad
  const cellM = sheet[`M${row + 1}`];
  const unidad = cellM ? String(cellM.v || '').trim() : '';

  // Columna N: Cantidad/Metrado
  const cellN = sheet[`N${row + 1}`];
  const cantidad = cellN && cellN.v ? parseFloat(cellN.v) : null;

  // Columna O: Precio Unitario
  const cellO = sheet[`O${row + 1}`];
  const precio = cellO && cellO.v ? parseFloat(cellO.v) : null;

  // Columna R: Total/Parcial
  const cellR = sheet[`R${row + 1}`];
  const total = cellR && cellR.v ? parseFloat(cellR.v) : null;

  // Agregar partida (aunque falten algunos datos)
  partidas.push({
    item,
    descripcion,
    unidad: unidad || '',
    cantidad: isNaN(cantidad) ? '' : (cantidad || ''),
    precio: isNaN(precio) ? '' : (precio || ''),
    total: isNaN(total) ? '' : (total || '')
  });
}

console.log(`✅ Partidas extraídas: ${partidas.length}`);
console.log(`   Total filas procesadas: ${totalFilas}\n`);

// Generar CSV
const csvHeader = 'item,descripcion,unidad,cantidad,precio_unitario,total\n';
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

// Guardar CSV
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'PARTIDAS_PRESUPUESTO.csv');
fs.writeFileSync(outputPath, csvContent, 'utf-8');

console.log(`✅ CSV GENERADO EXITOSAMENTE\n`);
console.log(`   📁 Ubicación: ${outputPath}`);
console.log(`   📊 Total partidas: ${partidas.length}`);
console.log(`   💾 Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);

// Estadísticas
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`📊 ESTADÍSTICAS\n`);

let conUnidad = 0;
let conCantidad = 0;
let conPrecio = 0;
let conTotal = 0;
let completas = 0;

partidas.forEach(p => {
  if (p.unidad) conUnidad++;
  if (p.cantidad !== '') conCantidad++;
  if (p.precio !== '') conPrecio++;
  if (p.total !== '') conTotal++;
  if (p.unidad && p.cantidad !== '' && p.precio !== '') completas++;
});

console.log(`   Total partidas: ${partidas.length}`);
console.log(`   ✅ Con UNIDAD: ${conUnidad} (${(conUnidad/partidas.length*100).toFixed(1)}%)`);
console.log(`   ✅ Con CANTIDAD: ${conCantidad} (${(conCantidad/partidas.length*100).toFixed(1)}%)`);
console.log(`   ✅ Con PRECIO: ${conPrecio} (${(conPrecio/partidas.length*100).toFixed(1)}%)`);
console.log(`   ✅ Con TOTAL: ${conTotal} (${(conTotal/partidas.length*100).toFixed(1)}%)`);
console.log(`   ✅ COMPLETAS (unidad+cantidad+precio): ${completas} (${(completas/partidas.length*100).toFixed(1)}%)`);

// Cálculos
const sumaCantidades = partidas.reduce((sum, p) => sum + (p.cantidad || 0), 0);
const sumaTotales = partidas.reduce((sum, p) => sum + (p.total || 0), 0);

console.log(`\n   💰 Presupuesto total: S/ ${sumaTotales.toFixed(2)}`);
console.log(`   📏 Total de metrados: ${sumaCantidades.toFixed(2)}`);

// Preview
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`📄 PREVIEW DEL CSV\n`);
console.log(`Header:`);
console.log(`${csvHeader.trim()}\n`);
console.log(`Primeras 10 partidas:\n`);
partidas.slice(0, 10).forEach((p, idx) => {
  let desc = p.descripcion;
  if (desc.includes(',') || desc.includes('"')) {
    desc = `"${desc.replace(/"/g, '""')}"`;
  }
  console.log(`${p.item},${desc},${p.unidad},${p.cantidad},${p.precio},${p.total}`);
});

if (partidas.length > 10) {
  console.log(`\n... ${partidas.length - 10} partidas más\n`);
}

console.log(`${'-'.repeat(120)}\n`);
console.log(`✅ LISTO PARA USAR\n`);
console.log(`   Ubicación: ${outputPath}\n`);
