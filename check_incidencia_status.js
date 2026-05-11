const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function checkIncidencia() {
  const client = await pool.connect();
  try {
    console.log('🔍 VERIFICANDO INCIDENCIA_ORIGINAL DE LOS APUs\n');
    console.log('═'.repeat(110));

    // Estadísticas generales
    const statsResult = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN incidencia_original IS NULL THEN 1 END) as null_count,
        COUNT(CASE WHEN incidencia_original = 0 THEN 1 END) as zero_count,
        COUNT(CASE WHEN incidencia_original > 0 THEN 1 END) as with_value_count,
        ROUND(AVG(incidencia_original), 4) as promedio,
        MIN(incidencia_original) as minimo,
        MAX(incidencia_original) as maximo
      FROM insumos
    `);

    const stats = statsResult.rows[0];
    console.log('\n📊 ESTADÍSTICAS DE incidencia_original:\n');
    console.log(`  Total insumos: ${stats.total}`);
    console.log(`  NULL: ${stats.null_count}`);
    console.log(`  = 0: ${stats.zero_count}`);
    console.log(`  > 0: ${stats.with_value_count} ✅`);
    console.log(`  Porcentaje cargado: ${((stats.with_value_count / stats.total) * 100).toFixed(2)}%`);
    console.log(`  Promedio: ${stats.promedio}`);
    console.log(`  Min: ${stats.minimo}, Max: ${stats.maximo}`);

    // Muestreo de algunos registros CON datos
    console.log('\n' + '─'.repeat(110));
    console.log('\n✅ MUESTREO DE INSUMOS CON INCIDENCIA_ORIGINAL > 0:\n');

    const samplingResult = await client.query(`
      SELECT
        id,
        descripcion,
        codigo_partida,
        incidencia_original,
        parcial_original
      FROM insumos
      WHERE incidencia_original > 0
      ORDER BY RANDOM()
      LIMIT 10
    `);

    samplingResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. "${row.descripcion}"`);
      console.log(`   Incidencia Original: ${row.incidencia_original}`);
      console.log(`   Parcial Original: ${row.parcial_original}`);
      console.log(`   Partida: ${row.codigo_partida}\n`);
    });

    // Contar por partida
    console.log('─'.repeat(110));
    console.log('\n📈 INSUMOS CON DATOS POR PARTIDA (primeras 20):\n');

    const byPartidaResult = await client.query(`
      SELECT
        codigo_partida,
        COUNT(*) as total,
        COUNT(CASE WHEN incidencia_original > 0 THEN 1 END) as con_datos
      FROM insumos
      GROUP BY codigo_partida
      ORDER BY con_datos DESC
      LIMIT 20
    `);

    byPartidaResult.rows.forEach((row, idx) => {
      const porcentaje = ((row.con_datos / row.total) * 100).toFixed(0);
      console.log(`${idx + 1}. Partida ${row.codigo_partida}: ${row.con_datos}/${row.total} (${porcentaje}%)`);
    });

    console.log('\n' + '═'.repeat(110));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkIncidencia();
