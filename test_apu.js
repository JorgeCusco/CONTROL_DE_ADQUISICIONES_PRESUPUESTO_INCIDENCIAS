const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT MIN(id) as id, descripcion_insumo as descripcion, MAX(unidad) as unidad,
             SUM(cantidad_p) as incidencia_original, SUM(parcial_p) as parcial_original,
             SUM(COALESCE(cantidad_c, cantidad_p)) as cantidad_2
      FROM acus
      WHERE item_partida = 'O.E.3.1.11.1'
      GROUP BY codigo_insumo, descripcion_insumo
      ORDER BY MIN(id)
    `);
    console.log("Rows returned:", res.rows.length);
    console.log(res.rows.slice(0, 2));
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
