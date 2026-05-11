require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check the rows that should have been fixed
    const result = await client.query(`
      SELECT
        "Insumo_Codigo",
        "Insumo_Descripcion",
        "Insumo_Unidad"
      FROM apus_detallado
      WHERE "Insumo_Codigo" IN (470020001, 470020003, 100020415, 10020098)
      LIMIT 5
    `);

    console.log('Sample of rows that should be fixed:');
    result.rows.forEach(row => {
      console.log(`  Code: ${row.Insumo_Codigo} | Desc: "${row.Insumo_Descripcion}" | Unit: "${row.Insumo_Unidad}"`);
    });

    // Check for any rows still with NULL codigo
    const nullCount = await client.query(`
      SELECT COUNT(*) as count FROM apus_detallado
      WHERE "Insumo_Codigo" IS NULL
    `);

    console.log(`\nRows with NULL Insumo_Codigo: ${nullCount.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
