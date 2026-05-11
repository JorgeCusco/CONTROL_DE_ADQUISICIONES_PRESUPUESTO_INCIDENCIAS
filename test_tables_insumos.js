const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== REVISIÓN DE TABLAS EN BASE DE DATOS ===");

    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'insumos%'
    `);
    console.log("Tables matching 'insumos%':", tables.rows);

    for (let row of tables.rows) {
      const count = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
      console.log(`- Table "${row.table_name}": ${count.rows[0].count} rows.`);
    }

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
