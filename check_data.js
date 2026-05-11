require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    const count = await client.query('SELECT COUNT(*) FROM insumos');
    console.log('Total insumos:', count.rows[0].count);

    const samples = await client.query(`
      SELECT id, codigo_insumo, descripcion, codigo_partida, unidad
      FROM insumos
      WHERE codigo_partida = 'OE.1'
      LIMIT 5
    `);
    console.log('\nSample insumos from partida OE.1:');
    samples.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Codigo: "${row.codigo_insumo}", Desc: "${row.descripcion}"`);
    });

    const nullDesc = await client.query('SELECT COUNT(*) as null_count FROM insumos WHERE descripcion IS NULL OR descripcion = \'\'');
    console.log('\nInsumos with NULL/empty descripcion:', nullDesc.rows[0].null_count);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
