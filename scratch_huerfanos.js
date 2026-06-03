const { Pool } = require('pg');
require('dotenv').config({ path: 'frontend/.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT e.codigo_insumo, e.estado, i.descripcion
      FROM estado_cuadre_insumos e
      LEFT JOIN insumos_p i ON e.codigo_insumo = i.codigo
      WHERE e.estado = 'Terminado'
        AND NOT EXISTS (
          SELECT 1 FROM mapeo_vinculacion m WHERE m.codigo_insumo = e.codigo_insumo
        )
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
