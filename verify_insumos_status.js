const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function verifyStatus() {
  const client = await pool.connect();
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE ESTADO DE INSUMOS\n');
    console.log('═'.repeat(120));

    // Total de insumos
    const totalResult = await client.query(`
      SELECT COUNT(*) as total FROM insumos
    `);
    const total = totalResult.rows[0].total;

    // Con incidencia_original
    const withResult = await client.query(`
      SELECT COUNT(*) as count FROM insumos WHERE incidencia_original IS NOT NULL
    `);
    const withIncidencia = withResult.rows[0].count;

    // Sin incidencia_original
    const withoutResult = await client.query(`
      SELECT COUNT(*) as count FROM insumos WHERE incidencia_original IS NULL
    `);
    const withoutIncidencia = withoutResult.rows[0].count;

    console.log(`\n📊 ESTADÍSTICAS GENERALES:\n`);
    console.log(`  Total de insumos:              ${total}`);
    console.log(`  Con incidencia_original:       ${withIncidencia} (${((withIncidencia/total)*100).toFixed(2)}%)`);
    console.log(`  Sin incidencia_original:       ${withoutIncidencia} (${((withoutIncidencia/total)*100).toFixed(2)}%)`);

    console.log(`\n` + '─'.repeat(120));

    // Vinculaciones
    const vinculacionResult = await client.query(`
      SELECT COUNT(*) as total FROM mapeo_vinculacion
    `);
    const vinculaciones = vinculacionResult.rows[0].total;

    // Compras
    const comprasResult = await client.query(`
      SELECT COUNT(*) as total FROM compras
    `);
    const compras = comprasResult.rows[0].total;

    // Compras vinculadas
    const comprasVinculadasResult = await client.query(`
      SELECT COUNT(DISTINCT compra_id) as count FROM mapeo_vinculacion
    `);
    const comprasVinculadas = comprasVinculadasResult.rows[0].count;

    console.log(`\n🔗 ESTADO DE VINCULACIÓN:\n`);
    console.log(`  Total de compras:              ${compras}`);
    console.log(`  Compras vinculadas:            ${comprasVinculadas} (${((comprasVinculadas/compras)*100).toFixed(2)}%)`);
    console.log(`  Compras sin vincular:          ${compras - comprasVinculadas} (${(((compras-comprasVinculadas)/compras)*100).toFixed(2)}%)`);
    console.log(`  Total de vínculos:             ${vinculaciones}`);

    console.log(`\n` + '═'.repeat(120));

    // Muestreo de datos
    console.log(`\n📋 MUESTREO DE PRIMEROS 5 INSUMOS:\n`);
    const sampleResult = await client.query(`
      SELECT
        id,
        codigo_partida,
        codigo_insumo,
        descripcion,
        unidad,
        incidencia_original,
        cantidad_modificada
      FROM insumos
      LIMIT 5
    `);

    sampleResult.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.descripcion}`);
      console.log(`   Código: ${row.codigo_insumo}`);
      console.log(`   Partida: ${row.codigo_partida}`);
      console.log(`   Incidencia Original: ${row.incidencia_original}`);
      console.log(`   Cantidad Modificada: ${row.cantidad_modificada}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyStatus();
