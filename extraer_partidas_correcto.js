const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(120));
console.log('📊 EXTRAYENDO PARTIDAS CON UNIDAD DE PRESUPUESTO.xlsx');
console.log('='.repeat(120));

const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';

// Leer Excel
const workbook = XLSX.readFile(presupuestoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);

console.log(`\n📄 Rango: ${sheet['!ref']}\n`);

const partidas = [];
let totalFilas = 0;
let conUnidad = 0;

// Procesar cada fila
for (let row = range.s.r; row <= range.e.r; row++) {
  totalFilas++;

  // Columna A: item
  const cellA = sheet[`A${row + 1}`];
  const item = cellA ? String(cellA.v || '').trim() : '';

  // Columna M: UNIDAD (FILTRO CLAVE)
  const cellM = sheet[`M${row + 1}`];
  const unidad = cellM ? String(cellM.v || '').trim() : '';

  // FILTRO: Solo si tiene UNIDAD
  if (!unidad) {
    continue;
  }

  // Si tiene unidad, incluir TODO
  conUnidad++;

  // Columna B: descripción
  const cellB = sheet[`B${row + 1}`];
  const descripcion = cellB ? String(cellB.v || '').trim() : '';

  // Columna N: cantidad/metrado fijo
  const cellN = sheet[`N${row + 1}`];
  let cantidad = cellN && cellN.v !== undefined ? cellN.v : '';
  if (cantidad !== '' && typeof cantidad === 'number') {
    cantidad = cantidad.toString();
  }

  // Columna O: precio
  const cellO = sheet[`O${row + 1}`];
  let precio = cellO && cellO.v !== undefined ? cellO.v : '';
  if (precio !== '' && typeof precio === 'number') {
    precio = precio.toString();
  }

  // Columna R: parcial/total
  const cellR = sheet[`R${row + 1}`];
  let total = cellR && cellR.v !== undefined ? cellR.v : '';
  if (total !== '' && typeof total === 'number') {
    total = total.toString();
  }

  // Agregar partida COMPLETA
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

// Generar CSV
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

// Guardar CSV
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'PARTIDAS_PRESUPUESTO_FINAL.csv');
fs.writeFileSync(outputPath, csvContent, 'utf-8');

console.log(`✅ CSV GENERADO\n`);
console.log(`   📁 Ubicación: ${outputPath}`);
console.log(`   📊 Total partidas: ${partidas.length}`);
console.log(`   💾 Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB\n`);

// Análisis de datos
console.log(`${'-'.repeat(120)}\n`);
console.log(`📊 ANÁLISIS DE DATOS\n`);

let conCantidad = 0;
let conPrecio = 0;
let conTotal = 0;

partidas.forEach(p => {
  if (p.cantidad !== '') conCantidad++;
  if (p.precio !== '') conPrecio++;
  if (p.total !== '') conTotal++;
});

console.log(`   ✅ Con CANTIDAD: ${conCantidad}/${partidas.length}`);
console.log(`   ✅ Con PRECIO: ${conPrecio}/${partidas.length}`);
console.log(`   ✅ Con TOTAL: ${conTotal}/${partidas.length}`);

// Preview
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`📄 PREVIEW\n`);
console.log(`${csvHeader.trim()}\n`);

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
console.log(`✅ ARCHIVO LISTO\n`);
console.log(`   Ruta: ${outputPath}`);
console.log(`   Filtro: SOLO partidas CON UNIDAD (columna M)`);
console.log(`   Datos: TODOS incluidos (aunque sean vacíos o cero)\n`);
