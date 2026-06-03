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
    console.log('Killing connections...');
    await pool.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()");
    console.log('Connections killed.');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
