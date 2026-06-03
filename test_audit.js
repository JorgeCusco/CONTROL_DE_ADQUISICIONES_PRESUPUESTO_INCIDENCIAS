const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== ANÁLISIS DE VINCULACIONES Y COMPRAS ===");

    // 1. Vinculaciones con compras inexistentes
    const orphanedCompras = await client.query(`
      SELECT m.id, m.compra_id, m.codigo_insumo
      FROM mapeo_vinculacion m
      LEFT JOIN compras_c c ON m.compra_id = c.id
      WHERE c.id IS NULL
    `);
    console.log(`\n1. Vinculaciones apuntando a compras inexistentes: ${orphanedCompras.rowCount}`);
    if (orphanedCompras.rowCount > 0) {
      console.log(orphanedCompras.rows.slice(0, 10));
    }

    // 2. Vinculaciones con insumos inexistentes (como el 999999998)
    const orphanedInsumos = await client.query(`
      SELECT m.id, m.compra_id, m.codigo_insumo, c.detalle as compra_detalle
      FROM mapeo_vinculacion m
      LEFT JOIN insumos_p i ON m.codigo_insumo = i.codigo
      LEFT JOIN compras_c c ON m.compra_id = c.id
      WHERE i.codigo IS NULL
    `);
    console.log(`\n2. Vinculaciones apuntando a insumos inexistentes en presupuesto actual: ${orphanedInsumos.rowCount}`);
    if (orphanedInsumos.rowCount > 0) {
      console.log(orphanedInsumos.rows.slice(0, 10));
    }

    // 3. Compras registradas en compras_c que están COMPLETAMENTE LIBRES (sin ninguna vinculación)
    const freeCompras = await client.query(`
      SELECT COUNT(*) as count 
      FROM compras_c c
      LEFT JOIN mapeo_vinculacion m ON c.id = m.compra_id
      WHERE m.id IS NULL
    `);
    console.log(`\n3. Compras registradas que están TOTALMENTE LIBRES (sin vincular a ningún insumo): ${freeCompras.rows[0].count}`);

    // Mostrar una muestra de estas compras libres
    if (Number(freeCompras.rows[0].count) > 0) {
      const freeSample = await client.query(`
        SELECT c.id, c.tipo_compra, c.num_compra, c.detalle, c.unidad_und, c.cantidad_und, c.precio_und, (c.cantidad_und * c.precio_und) as total
        FROM compras_c c
        LEFT JOIN mapeo_vinculacion m ON c.id = m.compra_id
        WHERE m.id IS NULL
        ORDER BY c.id DESC
        LIMIT 5
      `);
      console.log("Muestra de compras libres:");
      console.log(freeSample.rows);
    }

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
