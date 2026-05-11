require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check for NULL or 0 in Insumo_Codigo
    const nullCodes = await client.query(`
      SELECT
        COUNT(*) as count_null,
        (SELECT COUNT(*) FROM apus_detallado WHERE "Insumo_Codigo" = 0) as count_zero,
        (SELECT COUNT(*) FROM apus_detallado) as total
      FROM apus_detallado
      WHERE "Insumo_Codigo" IS NULL
    `);

    const result = nullCodes.rows[0];
    console.log(`apus_detallado stats:`);
    console.log(`  Total rows: ${result.total}`);
    console.log(`  NULL Insumo_Codigo: ${result.count_null}`);
    console.log(`  Zero Insumo_Codigo: ${result.count_zero}`);

    // Sample rows with NULL Insumo_Codigo
    const samples = await client.query(`
      SELECT
        "Partida_Codigo",
        "Insumo_Codigo",
        "Insumo_Descripcion",
        "Tipo_Insumo"
      FROM apus_detallado
      WHERE "Insumo_Codigo" IS NULL
      LIMIT 3
    `);

    console.log('\nSample rows with NULL Insumo_Codigo:');
    samples.rows.forEach(row => {
      console.log(`  Type: ${row.Tipo_Insumo}, Desc: ${row.Insumo_Descripcion}`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
