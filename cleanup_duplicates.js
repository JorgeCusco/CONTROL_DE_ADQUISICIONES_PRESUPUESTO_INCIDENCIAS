require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('🧹 CLEANING UP DUPLICATES\n');

    // Delete ALL rows with numeric-looking descripcion
    const deleteCorrupted = await client.query(`
      DELETE FROM insumos
      WHERE descripcion ~ '^[0-9]{5,}$'
        OR (LENGTH(TRIM(descripcion)) < 10 AND descripcion ~ '^[0-9]')
    `);

    console.log(`✓ Deleted ${deleteCorrupted.rowCount} corrupted rows\n`);

    // Verify final state
    const finalStats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN descripcion ~ '^[0-9]' THEN 1 END) as numeric_desc,
        COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) as null_desc
      FROM insumos
    `);

    const stat = finalStats.rows[0];
    console.log('✓ Final Status:');
    console.log(`  Total insumos: ${stat.total}`);
    console.log(`  Rows with numeric descripcion: ${stat.numeric_desc}`);
    console.log(`  Rows with NULL/empty descripcion: ${stat.null_desc}`);

    // Verify data quality
    const quality = await client.query(`
      SELECT
        COUNT(DISTINCT codigo_partida) as unique_partidas,
        COUNT(DISTINCT descripcion) as unique_descripciones
      FROM insumos
    `);

    const q = quality.rows[0];
    console.log(`\n📊 Data Quality:`);
    console.log(`  Unique partidas: ${q.unique_partidas}`);
    console.log(`  Unique descriptions: ${q.unique_descripciones}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
