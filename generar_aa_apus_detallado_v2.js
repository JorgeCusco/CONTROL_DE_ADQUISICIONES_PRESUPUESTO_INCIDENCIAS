const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📋 GENERANDO AA.apus_detallado.csv (V2 - Parser para estructura compleja)\n');
console.log('═'.repeat(150));

try {
  const workbook = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
  const apuSheet = workbook.Sheets['APU'];

  console.log('\n1️⃣  Parseando hoja APU con estructura de partidas...\n');

  const range = XLSX.utils.decode_range(apuSheet['!ref']);
  const apusDetallado = [];

  let partidaActual = {
    codigo: '',
    descripcion: '',
    rendimiento: 0,
    unidad: '',
    costo_unitario: 0
  };

  let tipoInsumoActual = '';
  let enHeaderRow = false;

  // Iterar por filas
  for (let row = range.s.r; row <= range.e.r; row++) {
    const cellA = apuSheet[XLSX.utils.encode_cell({ r: row, c: 0 })];
    const cellB = apuSheet[XLSX.utils.encode_cell({ r: row, c: 1 })];
    const cellJ = apuSheet[XLSX.utils.encode_cell({ r: row, c: 9 })];
    const cellK = apuSheet[XLSX.utils.encode_cell({ r: row, c: 10 })];
    const cellM = apuSheet[XLSX.utils.encode_cell({ r: row, c: 12 })];
    const cellO = apuSheet[XLSX.utils.encode_cell({ r: row, c: 14 })];
    const cellP = apuSheet[XLSX.utils.encode_cell({ r: row, c: 15 })];

    const valueA = cellA ? String(cellA.v || '').trim() : '';
    const valueB = cellB ? String(cellB.v || '').trim() : '';

    // Detectar nueva partida (empieza con OE.)
    if (valueA.match(/^OE\./)) {
      partidaActual.codigo = valueA;
      // La descripción está en la siguiente fila
      const nextRowCellA = apuSheet[XLSX.utils.encode_cell({ r: row + 1, c: 0 })];
      if (nextRowCellA && !String(nextRowCellA.v || '').match(/^OE\./)) {
        partidaActual.descripcion = String(nextRowCellA.v || '').trim();
      }
      // Buscar rendimiento en filas cercanas
      for (let checkRow = row; checkRow < Math.min(row + 6, range.e.r); checkRow++) {
        const cell = apuSheet[XLSX.utils.encode_cell({ r: checkRow, c: 0 })];
        if (cell) {
          const txt = String(cell.v || '').toLowerCase();
          if (txt.includes('rendimiento')) {
            const match = txt.match(/(\d+(?:\.\d+)?)\s*m/);
            if (match) {
              partidaActual.rendimiento = parseFloat(match[1]);
            }
            break;
          }
        }
      }
      continue;
    }

    // Detectar cambio de tipo de insumo (MANO DE OBRA, MATERIALES, etc.)
    if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO Y HERRAMIENTAS', 'SUBCONTRATOS'].includes(valueA)) {
      tipoInsumoActual = valueA;
      const cellP_tipo = apuSheet[XLSX.utils.encode_cell({ r: row, c: 15 })];
      if (cellP_tipo && !isNaN(parseFloat(cellP_tipo.v))) {
        partidaActual.costo_unitario = parseFloat(cellP_tipo.v);
      }
      continue;
    }

    // Detectar fila de encabezados
    if (valueA === 'Código') {
      enHeaderRow = true;
      continue;
    }

    // Parsear registros de insumo
    if (enHeaderRow && valueA && valueB && valueA !== 'Código') {
      const insumoCodigo = valueA;
      const insumoDescripcion = valueB;
      const insumoUnidad = cellJ ? String(cellJ.v || '').trim() : '';
      const insumoRecursos = cellK ? String(cellK.v || '').trim() : '';
      const insumoCantidad = cellM ? (isNaN(cellM.v) ? 0 : parseFloat(cellM.v)) : 0;
      const insumoPrecio = cellO ? (isNaN(cellO.v) ? 0 : parseFloat(cellO.v)) : 0;
      const insumoParcial = cellP ? (isNaN(cellP.v) ? 0 : parseFloat(cellP.v)) : 0;

      // Solo agregar si es un registro válido (tiene código de insumo que no es categoría)
      if (insumoCodigo && !['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'HERRAMIENTAS'].includes(insumoCodigo)) {
        apusDetallado.push({
          partida_codigo: partidaActual.codigo,
          partida_descripcion: partidaActual.descripcion,
          partida_rendimiento: partidaActual.rendimiento,
          partida_unidad: partidaActual.unidad,
          partida_costo_unitario: partidaActual.costo_unitario,
          tipo_insumo: tipoInsumoActual,
          insumo_codigo: insumoCodigo,
          insumo_descripcion: insumoDescripcion,
          insumo_unidad: insumoUnidad,
          insumo_recursos: insumoRecursos,
          insumo_cantidad: insumoCantidad,
          insumo_precio: insumoPrecio,
          insumo_parcial: insumoParcial
        });
      }
    }
  }

  console.log(`  ✓ ${apusDetallado.length} registros parseados\n`);

  // 2. Estadísticas
  console.log('2️⃣  Validando datos...\n');

  let conPartida = 0;
  let conInsumo = 0;
  let conCantidad = 0;
  let conPrecio = 0;
  let conParcial = 0;

  apusDetallado.forEach(row => {
    if (row.partida_codigo) conPartida++;
    if (row.insumo_codigo) conInsumo++;
    if (row.insumo_cantidad > 0) conCantidad++;
    if (row.insumo_precio > 0) conPrecio++;
    if (row.insumo_parcial > 0) conParcial++;
  });

  console.log(`  ✓ Con partida_codigo: ${conPartida} (${(conPartida/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Con insumo_codigo: ${conInsumo} (${(conInsumo/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Con cantidad > 0: ${conCantidad} (${(conCantidad/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Con precio > 0: ${conPrecio} (${(conPrecio/apusDetallado.length*100).toFixed(2)}%)`);
  console.log(`  ✓ Con parcial > 0: ${conParcial} (${(conParcial/apusDetallado.length*100).toFixed(2)}%)\n`);

  // 3. Generar CSV
  console.log('3️⃣  Escribiendo CSV...\n');

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
  console.log(`  ✓ Archivo: DATA_LAST/AA.apus_detallado.csv\n`);

  // 4. Ejemplos
  console.log('═'.repeat(150));
  console.log('\n📋 PRIMEROS 5 REGISTROS:\n');

  apusDetallado.slice(0, 5).forEach((row, idx) => {
    console.log(`${idx + 1}. [${row.partida_codigo}] ${row.partida_descripcion.substring(0, 50)}`);
    console.log(`   → [${row.tipo_insumo}] ${row.insumo_codigo}: ${row.insumo_descripcion.substring(0, 50)}`);
    console.log(`   → Cantidad: ${row.insumo_cantidad} | Precio: ${row.insumo_precio} | Parcial: ${row.insumo_parcial}\n`);
  });

  console.log('═'.repeat(150));
  console.log('\n✅ AA.apus_detallado.csv GENERADO\n');
  console.log(`Archivo: DATA_LAST/AA.apus_detallado.csv`);
  console.log(`Registros: ${apusDetallado.length}`);
  console.log(`Columnas: 13 (partida + tipo + insumo details)\n`);

} catch (err) {
  console.error('❌ Error:', err.message);
  console.log(err);
}
