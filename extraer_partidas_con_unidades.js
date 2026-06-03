const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(120));
console.log('📊 EXTRAYENDO PARTIDAS CON UNIDADES DE PRESUPUESTO.xlsx');
console.log('='.repeat(120));

const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';

// Leer Excel
const workbook = XLSX.readFile(presupuestoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Obtener rango completo
const range = XLSX.utils.decode_range(sheet['!ref']);
console.log(`\n📄 Rango de datos: ${sheet['!ref']}`);

const partidas = [];
let totalRowsRevisadas = 0;
let totalConUnidad = 0;
let totalSinUnidad = 0;

// Procesar cada fila manualmente
for (let row = range.s.r; row <= range.e.r; row++) {
  totalRowsRevisadas++;

  // Columna A: Item
  const cellA = sheet[`A${row + 1}`];
  const item = cellA ? String(cellA.v || '').trim() : '';

  // Solo procesar si tiene formato OE.X.X.X.X (partida final con 4 niveles)
  if (!item.match(/^OE\.\d+\.\d+\.\d+\.\d+$/)) {
    continue;
  }

  // Columna B: Descripción
  const cellB = sheet[`B${row + 1}`];
  const descripcion = cellB ? String(cellB.v || '').trim() : '';

  // Columna M: Unidad
  const cellM = sheet[`M${row + 1}`];
  const unidad = cellM ? String(cellM.v || '').trim() : '';

  // Columna N: Cantidad/Metrado Fijo
  const cellN = sheet[`N${row + 1}`];
  const cantidad = cellN ? parseFloat(cellN.v) : null;

  // Columna O: Precio Unitario
  const cellO = sheet[`O${row + 1}`];
  const precio = cellO ? parseFloat(cellO.v) : null;

  // Columna R: Total/Parcial
  const cellR = sheet[`R${row + 1}`];
  const total = cellR ? parseFloat(cellR.v) : null;

  // Verificar que tiene unidad, cantidad y precio
  if (unidad && cantidad !== null && precio !== null) {
    partidas.push({
      item,
      descripcion,
      unidad,
      cantidad: isNaN(cantidad) ? 0 : cantidad,
      precio: isNaN(precio) ? 0 : precio,
      total: isNaN(total) ? 0 : total
    });
    totalConUnidad++;
  } else {
    totalSinUnidad++;
  }
}

console.log(`\n✅ Análisis completado:`);
console.log(`   Total filas revisadas: ${totalRowsRevisadas}`);
console.log(`   Partidas finales encontradas: ${totalConUnidad + totalSinUnidad}`);
console.log(`   ✅ CON unidad/cantidad/precio: ${totalConUnidad}`);
console.log(`   ⚠️  SIN datos completos: ${totalSinUnidad}`);

// Mostrar ejemplos
console.log(`\n📋 Ejemplos de partidas extraídas:\n`);
partidas.slice(0, 10).forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.item} | ${p.descripcion}`);
  console.log(`   └─ ${p.cantidad} ${p.unidad} × S/ ${p.precio.toFixed(2)} = S/ ${p.total.toFixed(2)}`);
});

if (partidas.length > 10) {
  console.log(`\n   ... y ${partidas.length - 10} partidas más`);
}

// Generar CSV
console.log(`\n${'-'.repeat(120)}\n`);
console.log('📁 GENERANDO CSV...\n');

const csvHeader = 'item,descripcion,unidad,cantidad,precio_unitario,total\n';
const csvRows = partidas
  .map(p => {
    // Escapar descripciones que contengan comas
    const desc = p.descripcion.includes(',') ? `"${p.descripcion}"` : p.descripcion;
    return `${p.item},${desc},${p.unidad},${p.cantidad.toFixed(4)},${p.precio.toFixed(2)},${p.total.toFixed(2)}`;
  })
  .join('\n');

const csvContent = csvHeader + csvRows;

// Guardar CSV
const outputPath = 'DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_P_ACTUALIZADO.csv';

// Crear directorio si no existe
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(outputPath, csvContent, 'utf-8');

console.log(`✅ CSV generado exitosamente!`);
console.log(`\n   📁 Ubicación: ${outputPath}`);
console.log(`   📊 Registros: ${partidas.length}`);
console.log(`   💾 Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);

// Mostrar preview de las primeras líneas
console.log(`\n📄 Preview del CSV:\n`);
console.log(csvHeader.trim());
partidas.slice(0, 5).forEach(p => {
  const desc = p.descripcion.includes(',') ? `"${p.descripcion}"` : p.descripcion;
  console.log(`${p.item},${desc},${p.unidad},${p.cantidad.toFixed(4)},${p.precio.toFixed(2)},${p.total.toFixed(2)}`);
});
console.log(`...\n`);

// Estadísticas finales
console.log(`${'-'.repeat(120)}\n`);
console.log(`📊 ESTADÍSTICAS FINALES\n`);

const sumaMetrados = partidas.reduce((sum, p) => sum + p.cantidad, 0);
const sumaTotales = partidas.reduce((sum, p) => sum + p.total, 0);

console.log(`   Total cantidad (suma metrados): ${sumaMetrados.toFixed(2)}`);
console.log(`   Total presupuesto: S/ ${sumaTotales.toFixed(2)}`);
console.log(`   Promedio precio unitario: S/ ${(sumaTotales / partidas.length).toFixed(2)}`);

// Verificación
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`✅ LISTO PARA USAR\n`);
console.log(`   El CSV está listo para reemplazar PARTIDAS_P.csv`);
console.log(`   Contiene TODAS las partidas que tienen unidades`);
console.log(`   Y SOLAMENTE esas (las que pueden tener ACUs)\n`);
