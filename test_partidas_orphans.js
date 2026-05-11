const { Pool } = require('pg');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log("=== ANÁLISIS DE PARTIDAS HUÉRFANAS ===");

    // Caso 1: APU lines in acus that reference a partida item_partida that DOES NOT exist in partidas_p
    const orphanedApus = await client.query(`
      SELECT DISTINCT a.item_partida, COUNT(*) as count_acus
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE p.item IS NULL
      GROUP BY a.item_partida
      ORDER BY a.item_partida
    `);
    
    console.log(`\n1. Partidas referenciadas en ACUs (acus) que NO EXISTEN en el catálogo oficial (partidas_p): ${orphanedApus.rowCount}`);
    if (orphanedApus.rowCount > 0) {
      console.log(orphanedApus.rows);
    } else {
      console.log("¡Excelente! No hay registros en ACUs que apunten a partidas inexistentes.");
    }

    // Caso 2: Partidas in partidas_p that have NO APU breakdown in acus
    const emptyPartidas = await client.query(`
      SELECT p.item, p.descripcion, p.unidad, p.cantidad_p
      FROM partidas_p p
      LEFT JOIN acus a ON p.item = a.item_partida
      WHERE a.id IS NULL
      ORDER BY p.item
    `);

    console.log(`\n2. Partidas oficiales (partidas_p) que NO TIENEN ningún análisis de costo (acus): ${emptyPartidas.rowCount}`);
    if (emptyPartidas.rowCount > 0) {
      console.log("Muestra de las partidas sin APU:");
      console.log(emptyPartidas.rows);
    } else {
      console.log("¡Excelente! Todas las partidas oficiales tienen al menos un insumo en ACUs.");
    }

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
