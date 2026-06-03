const { Pool } = require('pg');
require('dotenv').config({ path: './frontend/.env' });
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
});

async function run() {
  try {
    console.log('Eliminando tablas antiguas (insumos, partidas, compras, apus_detallado)...');
    await pool.query('DROP TABLE IF EXISTS insumos CASCADE');
    await pool.query('DROP TABLE IF EXISTS partidas CASCADE');
    await pool.query('DROP TABLE IF EXISTS compras CASCADE');
    await pool.query('DROP TABLE IF EXISTS apus_detallado CASCADE');
    console.log('✅ Tablas eliminadas exitosamente.');
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
