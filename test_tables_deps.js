const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, 
  host: process.env.DB_HOST, 
  database: process.env.DB_NAME, 
  password: process.env.DB_PASSWORD, 
  port: process.env.DB_PORT, 
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== CHECKING DEPENDENCIES ON 'insumos' TABLE ===");
    const deps = await client.query(`
      SELECT 
          co.tgname AS trigger_name,
          c.relname AS dependent_table
      FROM pg_trigger co
      JOIN pg_class c ON co.tgrelid = c.oid
      WHERE co.tgrelid = 'insumos'::regclass;
    `).catch(e => { return { rows: [] } });
    console.log("Triggers:", deps.rows);

    const views = await client.query(`
      SELECT viewname, definition 
      FROM pg_views 
      WHERE definition LIKE '%insumos%' AND viewname NOT LIKE 'pg_%'
    `);
    console.log("Views containing 'insumos' in definition:");
    views.rows.forEach(v => {
      console.log(`- View: ${v.viewname}`);
    });

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
