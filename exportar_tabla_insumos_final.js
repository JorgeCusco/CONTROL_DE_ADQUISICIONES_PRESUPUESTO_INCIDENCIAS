const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

async function exportar() {
  console.log('📥 EXPORTANDO TABLA INSUMOS COMPLETA Y FINAL\n');
  console.log('═'.repeat(150));

  try {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: '7_insumos_rado',
      user: 'postgres',
      password: 'Jo.9839514500'
    });

    const client = await pool.connect();

    console.log('\n1️⃣  Leyendo tabla insumos CON metrado_fijo y cantidad_adquirida...\n');
    
    const res = await client.query(`
      SELECT 
        i.id,
        i.codigo_partida,
        p.descripcion as partida_descripcion,
        p.metrado_fijo,
        p.unidad as partida_unidad,
        i.item_1,
        i.codigo_insumo,
        i.descripcion,
        i.unidad,
        i.incidencia_original,
        i.parcial_original,
        i.incidencia,
        i.cantidad_modificada,
        i.cantidad_adquirida,
        i.comentario,
        i.es_extra
      FROM insumos i
      LEFT JOIN partidas p ON i.codigo_partida = p.codigo
      ORDER BY i.codigo_partida, i.codigo_insumo
    `);

    console.log(`  ✓ ${res.rows.length} registros leídos\n`);

    // Generar CSV
    console.log('2️⃣  Generando CSV final...\n');

    const csvContent = stringify(res.rows, {
      header: true,
      columns: [
        'id',
        'codigo_partida',
        'partida_descripcion',
        'metrado_fijo',
        'partida_unidad',
        'item_1',
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

    fs.writeFileSync('DATA_LAST/TABLA_INSUMOS.csv', csvContent);

    console.log(`  ✓ CSV generado: DATA_LAST/TABLA_INSUMOS.csv\n`);
    console.log(`  Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Registros: ${res.rows.length}\n`);

    // Estadísticas
    console.log('═'.repeat(150));
    console.log('\n✅ TABLA INSUMOS COMPLETA\n');

    let conMetrado = 0;
    let conCantidad = 0;

    res.rows.forEach(row => {
      if (row.metrado_fijo > 0) conMetrado++;
      if (row.cantidad_adquirida > 0) conCantidad++;
    });

    console.log(`Archivo: DATA_LAST/TABLA_INSUMOS.csv\n`);
    console.log('Columnas incluidas:');
    console.log('  ✓ codigo_partida');
    console.log('  ✓ partida_descripcion');
    console.log('  ✓ metrado_fijo (cantidad presupuestada)');
    console.log('  ✓ codigo_insumo');
    console.log('  ✓ descripcion');
    console.log('  ✓ cantidad_adquirida (lo que se compró)');
    console.log('  ✓ Y todos los demás campos\n');

    console.log(`Cobertura de datos:`);
    console.log(`  ✓ Con metrado_fijo: ${conMetrado} (${(conMetrado/res.rows.length*100).toFixed(2)}%)`);
    console.log(`  ✓ Con cantidad_adquirida: ${conCantidad} (${(conCantidad/res.rows.length*100).toFixed(2)}%)\n`);

    // Ejemplos
    console.log('📋 EJEMPLOS:\n');
    res.rows.slice(0, 3).forEach((row, idx) => {
      console.log(`${idx + 1}. Partida: [${row.codigo_partida}] ${row.partida_descripcion || '(sin desc)'}`);
      console.log(`   Insumo: [${row.codigo_insumo}] ${row.descripcion}`);
      console.log(`   Metrado: ${row.metrado_fijo} | Cantidad adq: ${row.cantidad_adquirida}\n`);
    });

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

exportar();
