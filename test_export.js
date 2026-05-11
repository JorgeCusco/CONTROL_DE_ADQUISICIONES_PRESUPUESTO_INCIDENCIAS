const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT COUNT(*)
      FROM compras_c c
      LEFT JOIN mapeo_vinculacion m ON c.id = m.compra_id
      LEFT JOIN (
        SELECT DISTINCT ON (codigo_insumo) codigo_insumo, descripcion_insumo
        FROM insumos_resumen
      ) ir ON m.codigo_insumo = ir.codigo_insumo
    `);
    console.log("Improved query rows count:", res.rows[0].count);
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
