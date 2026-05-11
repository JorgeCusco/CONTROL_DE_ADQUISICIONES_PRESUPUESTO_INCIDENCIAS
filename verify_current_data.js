require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verify() {
  const client = await pool.connect();
  try {
    // Get distinct descriptions
    const result = await client.query(`
      SELECT DISTINCT descripcion, unidad
      FROM insumos
      WHERE descripcion IN ('100020415', '10020098', '10020469')
      LIMIT 5
    `);

    console.log('Direct query for those values:');
    result.rows.forEach(row => {
      console.log(`  Desc: "${row.descripcion}" | Unit: "${row.unidad}"`);
    });

    // Check what the GROUP BY query returns
    const groupResult = await client.query(`
      SELECT DISTINCT descripcion as nombre, unidad
      FROM insumos
      WHERE descripcion IN ('100020415', '10020098', '10020469')
      LIMIT 5
    `);

    console.log('\nUsing GROUP BY query:');
    groupResult.rows.forEach(row => {
      console.log(`  Nombre: "${row.nombre}" | Unit: "${row.unidad}"`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

verify().catch(console.error);
