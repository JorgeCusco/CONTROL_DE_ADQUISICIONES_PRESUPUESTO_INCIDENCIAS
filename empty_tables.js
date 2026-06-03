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
  console.log('🗑️ Vaciando tablas...');
  try {
    await pool.query('DELETE FROM mapeo_vinculacion');
    console.log('  ✓ mapeo_vinculacion vaciada');
    await pool.query('DELETE FROM compras_c');
    console.log('  ✓ compras_c vaciada');
  } catch (e) {
    console.error('❌ Error al vaciar:', e);
  } finally {
    pool.end();
  }
}
run();
