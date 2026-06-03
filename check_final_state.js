require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check a sample with distinct values
    const result = await client.query(`
      SELECT DISTINCT descripcion, unidad, codigo_insumo
      FROM insumos
      ORDER BY descripcion
      LIMIT 10
    `);

    console.log('Sample of distinct insumos:');
    result.rows.forEach(row => {
      const isNumeric = /^[0-9]{5,}$/.test(row.descripcion);
      console.log(`  [${isNumeric ? '🔢' : '✓'}] "${row.descripcion}" | "${row.unidad}" | codigo: "${row.codigo_insumo}"`);
    });

    // Count by type
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN descripcion ~ '^[0-9]{5,}$' THEN 1 END) as numeric_rows,
        COUNT(CASE WHEN LENGTH(TRIM(descripcion)) < 15 THEN 1 END) as short_desc
      FROM insumos
    `);

    const stat = stats.rows[0];
    console.log(`\nStatistics:`);
    console.log(`  Total: ${stat.total}`);
    console.log(`  Numeric descriptions: ${stat.numeric_rows}`);
    console.log(`  Short descriptions (<15 chars): ${stat.short_desc}`);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
