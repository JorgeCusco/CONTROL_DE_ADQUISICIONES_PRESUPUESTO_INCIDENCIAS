const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== ANÁLISIS DE INSUMOS CON EL MISMO CÓDIGO (DIVERGENCIAS) ===");

    // 1. Insumos con el mismo código pero diferentes nombres/descripciones
    const diffDescriptions = await client.query(`
      SELECT codigo_insumo, COUNT(DISTINCT descripcion_insumo) as qty_names,
             ARRAY_AGG(DISTINCT descripcion_insumo) as nombres
      FROM acus
      GROUP BY codigo_insumo
      HAVING COUNT(DISTINCT descripcion_insumo) > 1
      ORDER BY qty_names DESC
      LIMIT 20
    `);

    console.log(`\n1. Insumos con el mismo código pero con DIFERENTES nombres en el presupuesto: ${diffDescriptions.rowCount}`);
    if (diffDescriptions.rowCount > 0) {
      console.log(diffDescriptions.rows);
    } else {
      console.log("¡Excelente! Todos los insumos con el mismo código tienen exactamente el mismo nombre.");
    }

    // 2. Insumos con el mismo código pero con DIFERENTES unidades de medida
    const diffUnits = await client.query(`
      SELECT codigo_insumo, COUNT(DISTINCT unidad) as qty_units,
             ARRAY_AGG(DISTINCT unidad) as unidades,
             MIN(descripcion_insumo) as nombre_muestra
      FROM acus
      GROUP BY codigo_insumo
      HAVING COUNT(DISTINCT unidad) > 1
      ORDER BY qty_units DESC
      LIMIT 20
    `);

    console.log(`\n2. Insumos con el mismo código pero con DIFERENTES unidades de medida: ${diffUnits.rowCount}`);
    if (diffUnits.rowCount > 0) {
      console.log(diffUnits.rows);
    } else {
      console.log("¡Excelente! Todos los insumos con el mismo código tienen la misma unidad de medida.");
    }

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
