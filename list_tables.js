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
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
    console.log('Tables:', res.rows.map(r => r.table_name));
    
    const views = await pool.query("SELECT table_name FROM information_schema.views WHERE table_schema = 'public'");
    console.log('Views:', views.rows.map(r => r.table_name));
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
