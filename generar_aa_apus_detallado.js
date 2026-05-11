const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📋 GENERANDO AA.apus_detallado.csv\n');
console.log('═'.repeat(150));

try {
  // 1. Leer APU Y PRESUPUESTO.xlsx - hoja APU
  console.log('\n1️⃣  Leyendo hoja APU de "APU Y PRESUPUESTO.xlsx"...\n');

  const workbook = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
  const apuSheet = workbook.Sheets['APU'];

  if (!apuSheet) {
    throw new Error('No se encontró la hoja "APU" en el archivo');
  }

  const apuData = XLSX.utils.sheet_to_json(apuSheet, { defval: '' });

  console.log(`  ✓ Total registros en hoja APU: ${apuData.length}\n`);

  // 2. Procesar datos para estructura apus_detallado
  console.log('2️⃣  Procesando datos para estructura apus_detallado...\n');

  const apusDetallado = [];
  let conDescripcion = 0;
  let sinDescripcion = 0;
  let conInsumo = 0;
  let sinInsumo = 0;

  apuData.forEach((row, idx) => {
    // Detectar campos disponibles en la hoja
    const partidaCodigo = String(row['Partida'] || row['codigo_partida'] || row['Código Partida'] || '').trim();
    const partidaDescripcion = String(row['Descripción Partida'] || row['descripcion_partida'] || row['Descripción'] || '').trim();
    const partidaRendimiento = parseFloat(row['Rendimiento'] || row['rendimiento'] || 0) || 0;
    const partidaUnidad = String(row['Unidad Partida'] || row['unidad_partida'] || row['Unidad'] || '').trim();
    const partidaCostoUnitario = parseFloat(row['Costo Unitario'] || row['costo_unitario'] || 0) || 0;

    const tipoInsumo = String(row['Tipo Insumo'] || row['tipo_insumo'] || row['Tipo'] || '').trim();
    const insumoCodigo = String(row['Código Insumo'] || row['insumo_codigo'] || row['Código'] || '').trim();
    const insumoDescripcion = String(row['Descripción Insumo'] || row['insumo_descripcion'] || row['Descripción Insumo'] || '').trim();
    const insumoUnidad = String(row['Unidad Insumo'] || row['insumo_unidad'] || row['Unidad'] || '').trim();
    const insumoRecursos = String(row['Recursos'] || row['insumo_recursos'] || row['Recursos'] || '').trim();
    const insumoCantidad = parseFloat(row['Cantidad'] || row['insumo_cantidad'] || 0) || 0;
    const insumoPrecio = parseFloat(row['Precio'] || row['insumo_precio'] || 0) || 0;
    const insumoParcial = parseFloat(row['Parcial'] || row['insumo_parcial'] || 0) || 0;

    if (partidaDescripcion) conDescripcion++;
    else sinDescripcion++;

    if (insumoCodigo) conInsumo++;
    else sinInsumo++;

    apusDetallado.push({
      partida_codigo: partidaCodigo,
      partida_descripcion: partidaDescripcion,
      partida_rendimiento: partidaRendimiento,
      partida_unidad: partidaUnidad,
      partida_costo_unitario: partidaCostoUnitario,
      tipo_insumo: tipoInsumo,
      insumo_codigo: insumoCodigo,
      insumo_descripcion: insumoDescripcion,
      insumo_unidad: insumoUnidad,
      insumo_recursos: insumoRecursos,
      insumo_cantidad: insumoCantidad,
      insumo_precio: insumoPrecio,
      insumo_parcial: insumoParcial
    });
  });

  console.log(`  ✓ ${apusDetallado.length} registros procesados\n`);
  console.log(`  ✓ Con descripción partida: ${conDescripcion} (${(conDescripcion/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Sin descripción partida: ${sinDescripcion}`);
  console.log(`  ✓ Con código insumo: ${conInsumo} (${(conInsumo/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Sin código insumo: ${sinInsumo}\n`);

  // 3. Generar CSV
  console.log('3️⃣  Escribiendo CSV final...\n');

  const csvContent = stringify(apusDetallado, {
    header: true,
    columns: [
      'partida_codigo',
      'partida_descripcion',
      'partida_rendimiento',
      'partida_unidad',
      'partida_costo_unitario',
      'tipo_insumo',
      'insumo_codigo',
      'insumo_descripcion',
      'insumo_unidad',
      'insumo_recursos',
      'insumo_cantidad',
      'insumo_precio',
      'insumo_parcial'
    ]
  });

  fs.writeFileSync('DATA_LAST/AA.apus_detallado.csv', csvContent);
  console.log(`  ✓ CSV generado: DATA_LAST/AA.apus_detallado.csv\n`);

  // 4. Estadísticas finales
  console.log('═'.repeat(150));
  console.log('\n📊 ESTADÍSTICAS FINALES\n');

  let conCantidad = 0;
  let conPrecio = 0;
  let conParcial = 0;
  let totalCantidad = 0;
  let totalPrecio = 0;
  let totalParcial = 0;

  apusDetallado.forEach(row => {
    if (row.insumo_cantidad > 0) conCantidad++;
    if (row.insumo_precio > 0) conPrecio++;
    if (row.insumo_parcial > 0) conParcial++;

    totalCantidad += row.insumo_cantidad;
    totalPrecio += row.insumo_precio;
    totalParcial += row.insumo_parcial;
  });

  console.log(`Total registros: ${apusDetallado.length}`);
  console.log(`  ─ Con cantidad > 0: ${conCantidad} (${(conCantidad/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ─ Con precio > 0: ${conPrecio} (${(conPrecio/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ─ Con parcial > 0: ${conParcial} (${(conParcial/apusDetallado.length*100).toFixed(2)}%)\n`);

  console.log(`Sumas totales:`);
  console.log(`  ─ Total cantidad: ${totalCantidad.toFixed(4)}`);
  console.log(`  ─ Total precio: ${totalPrecio.toFixed(2)}`);
  console.log(`  ─ Total parcial: ${totalParcial.toFixed(2)}\n`);

  // 5. Ejemplos
  console.log('📋 PRIMEROS 3 REGISTROS:\n');
  apusDetallado.slice(0, 3).forEach((row, idx) => {
    console.log(`${idx + 1}. [${row.partida_codigo}] ${row.partida_descripcion.substring(0, 50)}`);
    console.log(`   → Insumo: [${row.insumo_codigo}] ${row.insumo_descripcion.substring(0, 50)}`);
    console.log(`   → Cantidad: ${row.insumo_cantidad} | Precio: ${row.insumo_precio} | Parcial: ${row.insumo_parcial}\n`);
  });

  console.log('═'.repeat(150));
  console.log('\n✅ AA.apus_detallado.csv GENERADO EXITOSAMENTE\n');
  console.log('Archivo: DATA_LAST/AA.apus_detallado.csv');
  console.log(`Registros: ${apusDetallado.length}`);
  console.log('Estructura: 13 columnas (partida + insumo details)');
  console.log('Listo para importar a tabla apus_detallado en Supabase\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log(err);
}
