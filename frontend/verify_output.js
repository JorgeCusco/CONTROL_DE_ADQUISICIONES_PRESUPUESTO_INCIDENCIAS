const XLSX = require('xlsx');
const path = require('path');

const filePath = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital/CONSOLIDADO_TABLAS_DINAMICAS.xlsx';
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('📊 VERIFICACIÓN DEL CONSOLIDADO\n');
console.log(`Total de filas: ${data.length}`);
console.log(`Columnas: ${Object.keys(data[0]).join(', ')}\n`);

console.log('📋 Primeras 5 filas:\n');
data.slice(0, 5).forEach((row, idx) => {
  console.log(`Fila ${idx + 1}:`);
  console.log(`  Partida: ${row.partida}`);
  console.log(`  Nombre: ${row.nombre_partida}`);
  console.log(`  Metrado: ${row.metrado_partida} ${row.unidad_metrado}`);
  console.log(`  Clasificador: ${row.clasificador}`);
  console.log(`  Insumo: ${row.codigo_insumo} - ${row.descripcion_insumo}`);
  console.log(`  Cantidad: ${row.cantidad_insumo} ${row.unidad_insumo} × $${row.precio} = $${row.parcial}\n`);
});

console.log('✅ Archivo listo para tablas dinámicas');
