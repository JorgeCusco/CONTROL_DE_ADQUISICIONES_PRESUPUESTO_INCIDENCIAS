require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check if apus_detallado has the correct data
    const apusData = await client.query(`
      SELECT
        "Insumo_Codigo",
        "Insumo_Descripcion",
        "Insumo_Unidad"
      FROM apus_detallado
      WHERE "Insumo_Codigo" IN ('470020001', '470020003', '300020001')
      LIMIT 3
    `);

    console.log('Data from apus_detallado for same codes:');
    apusData.rows.forEach(row => {
      console.log(`  Codigo: "${row.Insumo_Codigo}"`);
      console.log(`  Descripcion: "${row.Insumo_Descripcion}"`);
      console.log(`  Unidad: "${row.Insumo_Unidad}"`);
      console.log();
    });

    // Count how many corrupted rows there are
    const corruptedCount = await client.query(`
      SELECT COUNT(*) as count FROM insumos
      WHERE codigo_insumo = '0'
    `);

    console.log(`Total rows with codigo_insumo='0': ${corruptedCount.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
