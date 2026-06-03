require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    const partidas = await client.query('SELECT codigo, descripcion FROM partidas LIMIT 5');
    console.log('Sample partidas:');
    partidas.rows.forEach(row => {
      console.log(`  ${row.codigo} - ${row.descripcion}`);
    });

    const insumosSample = await client.query(`
      SELECT id, codigo_insumo, descripcion, codigo_partida, unidad
      FROM insumos
      LIMIT 5
    `);
    console.log('\nSample insumos (first 5):');
    insumosSample.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Codigo: "${row.codigo_insumo}", Desc: "${row.descripcion}", Partida: ${row.codigo_partida}`);
    });

    // Check if codigo_insumo has NULL values
    const nullCodeInsumo = await client.query('SELECT COUNT(*) as count FROM insumos WHERE codigo_insumo IS NULL OR codigo_insumo = \'\'');
    console.log('\nInsumos with NULL/empty codigo_insumo:', nullCodeInsumo.rows[0].count);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
