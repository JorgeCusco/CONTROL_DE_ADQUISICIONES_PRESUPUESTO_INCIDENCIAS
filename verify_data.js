const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'Jo.9839514500',
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado'
});

async function verify() {
  try {
    console.log('📊 VERIFICACIÓN DE DATOS CARGADOS\n');

    // Count partidas
    const partidasResult = await pool.query('SELECT COUNT(*) FROM partidas');
    const partidasCount = parseInt(partidasResult.rows[0].count);
    console.log(`✓ Partidas: ${partidasCount}`);

    // Count insumos
    const insumosResult = await pool.query('SELECT COUNT(*) FROM insumos');
    const insumosCount = parseInt(insumosResult.rows[0].count);
    console.log(`✓ Insumos: ${insumosCount}`);

    // Sample data
    console.log('\n📋 MUESTRA DE 5 INSUMOS CARGADOS:\n');
    const sampleResult = await pool.query(`
      SELECT i.codigo_insumo, i.descripcion, i.unidad,
             i.incidencia_original, i.parcial_original, p.descripcion as partida
      FROM insumos i
      JOIN partidas p ON i.codigo_partida = p.codigo
      LIMIT 5
    `);

    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.codigo_insumo} - ${row.descripcion}`);
      console.log(`   Partida: ${row.partida}`);
      console.log(`   Unidad: ${row.unidad}`);
      console.log(`   Incidencia: ${row.incidencia_original}, Parcial: ${row.parcial_original}`);
      console.log('');
    });

    // Check specific insumo
    console.log('🔍 BÚSQUEDA: CEMENTO PORTLAND\n');
    const cementoResult = await pool.query(`
      SELECT i.codigo_insumo, i.descripcion, COUNT(*) as partidas_count,
             SUM(i.incidencia_original) as total_incidencia,
             SUM(i.parcial_original) as total_parcial
      FROM insumos i
      WHERE i.descripcion ILIKE '%CEMENTO%'
      GROUP BY i.codigo_insumo, i.descripcion
      LIMIT 5
    `);

    cementoResult.rows.forEach(row => {
      console.log(`${row.codigo_insumo} - ${row.descripcion}`);
      console.log(`  En ${row.partidas_count} partidas`);
      console.log(`  Total Incidencia: ${row.total_incidencia}`);
      console.log(`  Total Parcial: ${row.total_parcial}`);
      console.log('');
    });

    console.log('✅ VERIFICACIÓN COMPLETADA\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verify();
