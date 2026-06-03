require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check DISTINCT descripcion values
    const result = await client.query(`
      SELECT DISTINCT descripcion, unidad
      FROM insumos
      LIMIT 10
    `);

    console.log('Sample distinct insumos (by descripcion):');
    result.rows.forEach(row => {
      console.log(`  Desc: "${row.descripcion}" | Unit: "${row.unidad}"`);
    });

    // Also check if codigo_insumo appears as descripcion anywhere
    const nullDescResult = await client.query(`
      SELECT COUNT(*) as count
      FROM insumos
      WHERE descripcion IS NULL OR descripcion = ''
    `);

    console.log(`\nNULL/empty descripcion count: ${nullDescResult.rows[0].count}`);

    // Check what's being returned by the GROUP BY query
    const groupResult = await client.query(`
      SELECT descripcion, unidad, COUNT(*) as cnt
      FROM insumos
      GROUP BY descripcion, unidad
      LIMIT 5
    `);

    console.log('\nGROUP BY results:');
    groupResult.rows.forEach(row => {
      console.log(`  Desc: "${row.descripcion}" | Unit: "${row.unidad}" | Count: ${row.cnt}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
