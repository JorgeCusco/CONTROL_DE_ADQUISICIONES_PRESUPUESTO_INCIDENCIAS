const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("--- ORPHANED VINCULACIONES ---");
    const orphans = await client.query(`
      SELECT m.codigo_insumo, COUNT(m.compra_id) as total_compras
      FROM mapeo_vinculacion m
      LEFT JOIN insumos_p i ON m.codigo_insumo = i.codigo
      WHERE i.codigo IS NULL
      GROUP BY m.codigo_insumo
    `);
    console.log(`Found ${orphans.rowCount} insumo codes in mapeo_vinculacion that NO LONGER exist in the new CSV data.`);
    if (orphans.rowCount > 0) {
      console.log(orphans.rows);
    }
    
    const countVinculaciones = await client.query('SELECT COUNT(*) FROM mapeo_vinculacion');
    console.log("Total records in mapeo_vinculacion:", countVinculaciones.rows[0].count);
    
    const linkedButMissing = await client.query(`
      SELECT m.compra_id, m.codigo_insumo
      FROM mapeo_vinculacion m
      LEFT JOIN insumos_p i ON m.codigo_insumo = i.codigo
      WHERE i.codigo IS NULL
      LIMIT 10
    `);
    console.log("\nSome orphaned compras:", linkedButMissing.rows);

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
