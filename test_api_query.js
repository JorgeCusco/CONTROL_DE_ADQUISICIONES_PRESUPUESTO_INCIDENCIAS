require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function test() {
  const client = await pool.connect();
  try {
    // Run the exact same query the API runs
    const result = await client.query(`
      SELECT
        DISTINCT descripcion as nombre,
        unidad,
        SUM(incidencia) as meta_cantidad,
        0 as linked_count,
        0 as adquirido,
        0 as es_extra,
        COUNT(*) as total_registros
      FROM insumos
      GROUP BY descripcion, unidad
      ORDER BY descripcion
      LIMIT 10
    `);

    console.log('Direct database query results:\n');
    result.rows.forEach((row, i) => {
      console.log(`${i+1}. "${row.nombre}"`);
      console.log(`   Unit: "${row.unidad}"`);
      console.log(`   Count: ${row.total_registros}\n`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

test().catch(console.error);
