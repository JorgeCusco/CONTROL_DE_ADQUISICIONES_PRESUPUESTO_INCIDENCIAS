const { Pool } = require('pg');
require('dotenv').config({ path: './frontend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log('--- INICIANDO AUDITORIA NUEVO ESQUEMA ---');
  try {
    const client = await pool.connect();

    // 1. Check Partidas
    const partidas = await client.query('SELECT COUNT(*) FROM partidas_p');
    console.log(`- Total Partidas en partidas_p: ${partidas.rows[0].count}`);

    // 2. Check Acus
    const acus = await client.query('SELECT COUNT(*) FROM acus');
    console.log(`- Total Insumos desglosados en acus: ${acus.rows[0].count}`);
    
    const unlinked = await client.query(`
      SELECT COUNT(*) FROM acus a 
      LEFT JOIN partidas_p p ON a.item_partida = p.item 
      WHERE p.item IS NULL
    `);
    console.log(`- Acus sin partida válida (Huerfanos): ${unlinked.rows[0].count}`);

    // 3. Check Compras
    const compras = await client.query('SELECT COUNT(*) FROM compras_c');
    console.log(`- Total Compras Registradas: ${compras.rows[0].count}`);

    const mapped = await client.query('SELECT COUNT(DISTINCT compra_id) FROM mapeo_vinculacion');
    console.log(`- Compras Vinculadas: ${mapped.rows[0].count}`);

    // 4. Mapeos huerfanos
    const mappedUnlinked = await client.query(`
      SELECT COUNT(*) FROM mapeo_vinculacion m
      LEFT JOIN compras_c c ON m.compra_id = c.id
      WHERE c.id IS NULL
    `);
    console.log(`- Mapeos apuntando a compras borradas: ${mappedUnlinked.rows[0].count}`);

    // 5. Insumos Resumen
    const resumen = await client.query('SELECT COUNT(*) FROM insumos_resumen');
    console.log(`- Total Insumos en la vista resumen: ${resumen.rows[0].count}`);

    client.release();
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

main();
