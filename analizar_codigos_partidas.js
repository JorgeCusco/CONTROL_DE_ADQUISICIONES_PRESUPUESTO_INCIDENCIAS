const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500',
  port: 5432
});

async function analizarCodigos() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT DISTINCT codigo
      FROM partidas
      ORDER BY codigo
      LIMIT 100
    `);

    console.log('CÓDIGOS DE PARTIDAS ENCONTRADOS:\n');
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.codigo}`);
    });

    console.log(`\nTOTAL: ${result.rows.length} códigos únicos (primeros 100)`);

  } finally {
    client.release();
    await pool.end();
  }
}

analizarCodigos().catch(console.error);
