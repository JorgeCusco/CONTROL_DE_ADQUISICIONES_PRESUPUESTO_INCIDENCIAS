require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Check if there are still rows with codigo_insumo = '0'
    const zeroRows = await client.query(`
      SELECT COUNT(*) as count FROM insumos
      WHERE codigo_insumo = '0'
    `);

    console.log(`Rows with codigo_insumo='0': ${zeroRows.rows[0].count}`);

    // Check if there are any with codigo_insumo = NULL
    const nullRows = await client.query(`
      SELECT COUNT(*) as count FROM insumos
      WHERE codigo_insumo IS NULL OR codigo_insumo = ''
    `);

    console.log(`Rows with NULL/empty codigo_insumo: ${nullRows.rows[0].count}`);

    // Check a sample of the repaired rows
    const sample = await client.query(`
      SELECT id, codigo_partida, codigo_insumo, descripcion, unidad
      FROM insumos
      WHERE codigo_partida IN ('O.E.3.1.11.1')
      LIMIT 5
    `);

    console.log('\nSample of repaired insumos:');
    sample.rows.forEach(row => {
      console.log(`  ${row.codigo_insumo}: ${row.descripcion} (${row.unidad})`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
