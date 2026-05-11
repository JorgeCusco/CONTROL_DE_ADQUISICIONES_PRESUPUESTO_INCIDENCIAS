const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT m.codigo_insumo, COUNT(*) as count
      FROM mapeo_vinculacion m
      LEFT JOIN insumos_p i ON m.codigo_insumo = i.codigo
      WHERE i.codigo IS NULL
      GROUP BY m.codigo_insumo
    `);
    console.log("Distinct missing codes in 320 rows:", res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
