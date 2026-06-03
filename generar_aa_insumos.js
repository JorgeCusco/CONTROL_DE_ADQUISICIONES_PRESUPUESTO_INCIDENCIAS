const XLSX = require('xlsx');
const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

console.log('📋 GENERANDO AA.insumos.csv\n');
console.log('═'.repeat(150));

try {
  // 1. Leer partidas desde PARTIDAS.csv o BD
  console.log('\n1️⃣  Leyendo partidas de referencia...\n');

  const partidasCSV = fs.readFileSync('DATA_LAST/PARTIDAS.csv', 'utf-8');
  const partidasData = csvParse(partidasCSV, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  const partidasMap = new Map();
  partidasData.forEach(row => {
    const codigo = String(row.codigo || row['Código'] || '').trim();
    if (codigo) {
      partidasMap.set(codigo, {
        descripcion: row.descripcion || row['Descripción'] || '',
        metrado_fijo: parseFloat(row.metrado_fijo || row['Metrado'] || 0) || 0,
        precio_unitario: parseFloat(row.precio_unitario || row['Precio'] || 0) || 0
      });
    }
  });

  console.log(`  ✓ ${partidasMap.size} partidas cargadas\n`);

  // 2. Leer AA.apus_detallado.csv
  console.log('2️⃣  Leyendo AA.apus_detallado.csv...\n');

  const apusCSV = fs.readFileSync('DATA_LAST/AA.apus_detallado.csv', 'utf-8');
  const apusData = csvParse(apusCSV, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`  ✓ ${apusData.length} registros APU cargados\n`);

  // 3. Generar tabla insumos
  console.log('3️⃣  Procesando registros para tabla insumos...\n');

  const insumosArray = [];
  let id = 1;
  let conMetradoFijo = 0;
  let conIncidencia = 0;

  // Agrupar por partida + insumo para obtener registros únicos
  const insumosMap = new Map();

  apusData.forEach(row => {
    const partidaCodigo = String(row.partida_codigo || '').trim();
    const insumoCodigo = String(row.insumo_codigo || '').trim();

    const key = `${partidaCodigo}|${insumoCodigo}`;

    if (!insumosMap.has(key)) {
      const partida = partidasMap.get(partidaCodigo) || {};
      const metradoFijo = parseFloat(partida.metrado_fijo || 0) || 0;
      const incidenciaOriginal = parseFloat(row.insumo_cantidad || 0) || 0;
      const parcialOriginal = parseFloat(row.insumo_parcial || 0) || 0;

      if (metradoFijo > 0) conMetradoFijo++;
      if (incidenciaOriginal > 0) conIncidencia++;

      insumosMap.set(key, {
        codigo_partida: partidaCodigo,
        codigo_insumo: insumoCodigo,
        descripcion: String(row.insumo_descripcion || '').trim(),
        unidad: String(row.insumo_unidad || '').trim(),
        incidencia_original: incidenciaOriginal,
        parcial_original: parcialOriginal,
        metrado_fijo: metradoFijo,
        tipo_insumo: String(row.tipo_insumo || '').trim()
      });
    }
  });

  // Convertir a array con ID
  insumosMap.forEach(value => {
    insumosArray.push({
      id: id++,
      codigo_partida: value.codigo_partida,
      codigo_insumo: value.codigo_insumo,
      descripcion: value.descripcion,
      unidad: value.unidad,
      incidencia_original: value.incidencia_original,
      parcial_original: value.parcial_original,
      incidencia: value.incidencia_original, // Initially same as original
      cantidad_modificada: 0,
      cantidad_adquirida: 0,
      comentario: '',
      es_extra: false,
      metrado_fijo: value.metrado_fijo,
      tipo_insumo: value.tipo_insumo
    });
  });

  console.log(`  ✓ ${insumosArray.length} insumos únicos procesados\n`);
  console.log(`  ✓ Con metrado_fijo > 0: ${conMetradoFijo}`);
  console.log(`  ✓ Con incidencia_original > 0: ${conIncidencia}\n`);

  // 4. Generar CSV
  console.log('4️⃣  Escribiendo CSV final...\n');

  const csvContent = stringify(insumosArray, {
    header: true,
    columns: [
      'id',
      'codigo_partida',
      'codigo_insumo',
      'descripcion',
      'unidad',
      'incidencia_original',
      'parcial_original',
      'incidencia',
      'cantidad_modificada',
      'cantidad_adquirida',
      'comentario',
      'es_extra'
    ]
  });

  fs.writeFileSync('DATA_LAST/AA.insumos.csv', csvContent);
  console.log(`  ✓ Archivo: DATA_LAST/AA.insumos.csv\n`);

  // 5. Estadísticas
  console.log('═'.repeat(150));
  console.log('\n📊 ESTADÍSTICAS FINALES\n');

  let conCantidadAd = 0;
  let conComento = 0;
  let conExtra = 0;

  insumosArray.forEach(row => {
    if (row.cantidad_adquirida > 0) conCantidadAd++;
    if (row.comentario) conComento++;
    if (row.es_extra) conExtra++;
  });

  console.log(`Total insumos: ${insumosArray.length}`);
  console.log(`  ─ Con cantidad_adquirida: ${conCantidadAd} (${(conCantidadAd/insumosArray.length*100).toFixed(2)}%)`);
  console.log(`  ─ Con comentario: ${conComento}`);
  console.log(`  ─ Marcado es_extra: ${conExtra}\n`);

  // 6. Ejemplos
  console.log('📋 PRIMEROS 5 REGISTROS:\n');

  insumosArray.slice(0, 5).forEach((row, idx) => {
    console.log(`${idx + 1}. [ID: ${row.id}] [${row.codigo_partida}]→[${row.codigo_insumo}]`);
    console.log(`   Descripción: ${row.descripcion.substring(0, 60)}`);
    console.log(`   Incidencia: ${row.incidencia_original} | Parcial: ${row.parcial_original} | Metrado: ${row.metrado_fijo}\n`);
  });

  console.log('═'.repeat(150));
  console.log('\n✅ AA.insumos.csv GENERADO EXITOSAMENTE\n');
  console.log(`Archivo: DATA_LAST/AA.insumos.csv`);
  console.log(`Registros: ${insumosArray.length}`);
  console.log(`Columnas: 12 (id + partida + insumo + APU values)\n`);

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log(err);
}
