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
    const res = await pool.query("SELECT pid, now() - query_start AS duration, query, state FROM pg_stat_activity WHERE (query ILIKE '%compras_c%' OR query ILIKE '%mapeo_vinculacion%') AND pid <> pg_backend_pid()");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
