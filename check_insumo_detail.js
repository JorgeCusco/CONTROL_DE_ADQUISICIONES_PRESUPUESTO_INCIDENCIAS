require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check insumos where codigo_insumo is "100020415"
    const result = await client.query(`
      SELECT
        id,
        codigo_insumo,
        descripcion,
        unidad,
        codigo_partida
      FROM insumos
      WHERE codigo_insumo IN ('100020415', '10020098', '10020469')
      LIMIT 10
    `);

    console.log('Insumos for those codes:');
    result.rows.forEach(row => {
      console.log(`  Codigo: ${row.codigo_insumo}`);
      console.log(`  Descripcion: ${row.descripcion}`);
      console.log(`  Unidad: ${row.unidad}`);
      console.log(`  ---`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
