require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function investigate() {
  const client = await pool.connect();
  try {
    // Find rows with weird descriptions
    const badRows = await client.query(`
      SELECT DISTINCT descripcion
      FROM insumos
      WHERE descripcion IN ('70  y 120 mm2', '7280.45', '856.5', '936.42')
      LIMIT 1
    `);

    console.log('Bad descriptions found in insumos:');
    console.log(badRows.rows.map(r => r.descripcion).join(', '));

    // Check if these exist in apus_detallado
    const apusBadRows = await client.query(`
      SELECT DISTINCT "Insumo_Descripcion", "Insumo_Unidad", "Partida_Descripcion"
      FROM apus_detallado
      WHERE "Insumo_Descripcion" IN ('70  y 120 mm2', '7280.45', '856.5', '936.42')
      LIMIT 3
    `);

    console.log(`\nThese also exist in apus_detallado: ${apusBadRows.rowCount > 0}`);

    // Check what's in apus_detallado with these unidades
    const unitCheck = await client.query(`
      SELECT "Insumo_Descripcion", "Insumo_Unidad"
      FROM apus_detallado
      WHERE "Insumo_Unidad" IN ('65 und/Día', 'EQUIPO', 'MATERIALES', 'MANO DE OBRA')
      LIMIT 5
    `);

    console.log('\nSample of rows with unit values that appear as descriptions:');
    unitCheck.rows.forEach(row => {
      console.log(`  Desc: "${row.Insumo_Descripcion}" | Unit: "${row.Insumo_Unidad}"`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

investigate().catch(console.error);
