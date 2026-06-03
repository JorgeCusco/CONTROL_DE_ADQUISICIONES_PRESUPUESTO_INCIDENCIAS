const XLSX = require('xlsx');

const filePath = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital/CONSOLIDADO_FINAL/CONSOLIDADO_TABLAS_DINAMICAS.xlsx';
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('✅ VERIFICACIÓN CORRECCIONES\n');
console.log(`Total filas: ${data.length}\n`);

console.log('📋 Primeras 5 filas:\n');
data.slice(0, 5).forEach((row, idx) => {
  console.log(`Fila ${idx + 1}:`);
  console.log(`  Partida: ${row.partida}`);
  console.log(`  Nombre: ${row.nombre_partida}`);
  console.log(`  Insumo: ${row.codigo_insumo} - ${row.descripcion_insumo}`);
  console.log(`  Cantidad: ${row.cantidad_insumo} ${row.unidad_insumo}`);
  console.log(`  Precio (unitario): $${row.precio}`);
  console.log(`  Parcial (del ACU): $${row.parcial}`);
  console.log('');
});

// Verificar que parcial ≠ cantidad × precio
console.log('📊 Verificando: Parcial vs (Cantidad × Precio)\n');
let coincidencias = 0;
let diferencias = 0;

data.slice(0, 100).forEach((row, idx) => {
  const cantidad = parseFloat(row.cantidad_insumo) || 0;
  const precio = parseFloat(row.precio) || 0;
  const parcial = parseFloat(row.parcial) || 0;
  const calculado = Math.round(cantidad * precio * 100) / 100;

  if (Math.abs(parcial - calculado) < 0.01) {
    coincidencias++;
  } else {
    diferencias++;
    if (diferencias <= 3) {
      console.log(`❌ Fila ${idx + 1}: ${row.codigo_insumo}`);
      console.log(`   Cantidad: ${cantidad}, Precio: $${precio}`);
      console.log(`   Parcial ACU: $${parcial}, Calculado: $${calculado}`);
    }
  }
});

console.log(`\n✅ De 100 filas: ${coincidencias} coinciden, ${diferencias} diferentes`);
console.log('(Las diferencias son normales - el ACU tiene sus propios cálculos)');
