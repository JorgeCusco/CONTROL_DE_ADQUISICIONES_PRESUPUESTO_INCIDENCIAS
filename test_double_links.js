const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== ANÁLISIS DE DOBLES VÍNCULOS EN COMPRAS ===");

    // Caso A: Compras (compra_id) que están vinculadas a MÁS DE UN insumo diferente
    const multiLinkedCompras = await client.query(`
      SELECT m.compra_id, COUNT(DISTINCT m.codigo_insumo) as distinct_insumos,
             MIN(c.detalle) as compra_detalle
      FROM mapeo_vinculacion m
      LEFT JOIN compras_c c ON m.compra_id = c.id
      GROUP BY m.compra_id
      HAVING COUNT(DISTINCT m.codigo_insumo) > 1
      ORDER BY distinct_insumos DESC
    `);

    console.log(`\n1. Compras (compra_id) asociadas a múltiples insumos distintos: ${multiLinkedCompras.rowCount}`);
    if (multiLinkedCompras.rowCount > 0) {
      console.log(multiLinkedCompras.rows);
    } else {
      console.log("¡Excelente! Ninguna compra individual está vinculada a más de un insumo diferente.");
    }

    // Caso B: Vínculos duplicados exactos (el mismo compra_id y el mismo codigo_insumo registrados múltiples veces)
    const exactDuplicates = await client.query(`
      SELECT m.compra_id, m.codigo_insumo, COUNT(*) as qty,
             MIN(c.detalle) as compra_detalle
      FROM mapeo_vinculacion m
      LEFT JOIN compras_c c ON m.compra_id = c.id
      GROUP BY m.compra_id, m.codigo_insumo
      HAVING COUNT(*) > 1
      ORDER BY qty DESC
    `);

    console.log(`\n2. Vínculos duplicados exactos (mismo compra_id y mismo codigo_insumo registrados más de una vez): ${exactDuplicates.rowCount}`);
    if (exactDuplicates.rowCount > 0) {
      console.log(exactDuplicates.rows);
    } else {
      console.log("¡Excelente! No hay registros duplicados exactos en tu tabla de vinculación.");
    }

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
