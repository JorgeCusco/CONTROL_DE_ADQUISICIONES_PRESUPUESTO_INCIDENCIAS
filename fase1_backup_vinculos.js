const fs = require('fs');
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
  console.log('📦 Fase 1: Extrayendo huella digital de vínculos actuales...');
  try {
    const res = await pool.query(`
      SELECT m.codigo_insumo, c.num_compra, c.detalle, c.anio, m.usuario, m.factor_conversion
      FROM mapeo_vinculacion m
      JOIN compras_c c ON m.compra_id = c.id
    `);
    fs.writeFileSync('backup_vinculos_identidad.json', JSON.stringify(res.rows, null, 2));
    console.log(`✅ ¡Fase 1 completada! ${res.rows.length} vínculos respaldados por identidad.`);
  } catch (e) {
    console.error('❌ Error en Fase 1:', e);
  } finally {
    pool.end();
  }
}
run();
