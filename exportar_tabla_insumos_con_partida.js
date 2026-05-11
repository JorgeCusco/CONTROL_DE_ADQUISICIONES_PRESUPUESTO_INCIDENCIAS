const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

async function exportarInsumos() {
  console.log('📥 EXPORTANDO TABLA INSUMOS CON DESCRIPCIÓN DE PARTIDA\n');
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

    console.log('\n1️⃣  Leyendo tabla insumos con JOIN a partidas...\n');
    
    const res = await client.query(`
      SELECT 
        i.id,
        i.codigo_partida,
        p.descripcion as partida_descripcion,
        p.metrado_fijo,
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
    console.log('2️⃣  Generando CSV con descripción...\n');

    const csvContent = stringify(res.rows, {
      header: true,
      columns: [
        'id',
        'codigo_partida',
        'partida_descripcion',
        'metrado_fijo',
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

    console.log(`  ✓ CSV creado: DATA_LAST/TABLA_INSUMOS.csv\n`);
    console.log(`  Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Registros: ${res.rows.length}\n`);

    console.log('═'.repeat(150));
    console.log('\n✅ TABLA INSUMOS COMPLETA CON PARTIDA\n');
    console.log('Archivo: DATA_LAST/TABLA_INSUMOS.csv');
    console.log(`\nColumnas incluidas:`);
    console.log(`  ✓ codigo_partida`);
    console.log(`  ✓ partida_descripcion (NUEVA)`);
    console.log(`  ✓ metrado_fijo (NUEVA)`);
    console.log(`  ✓ codigo_insumo`);
    console.log(`  ✓ descripcion`);
    console.log(`  ✓ Y todos los demás campos\n`);

    // Mostrar ejemplos
    console.log('📋 EJEMPLOS DE REGISTROS:\n');
    res.rows.slice(0, 3).forEach((row, idx) => {
      console.log(`${idx + 1}. [${row.codigo_partida}] ${row.partida_descripcion || '(sin descripción)'}`);
      console.log(`   Insumo: [${row.codigo_insumo}] ${row.descripcion}`);
      console.log(`   Metrado: ${row.metrado_fijo} | Cantidad adq: ${row.cantidad_adquirida}\n`);
    });

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

exportarInsumos();
