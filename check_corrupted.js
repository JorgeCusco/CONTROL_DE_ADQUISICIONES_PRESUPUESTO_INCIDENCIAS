require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Look for rows where descripcion looks like a code
    const corrupted = await client.query(`
      SELECT id, codigo_insumo, descripcion, unidad
      FROM insumos
      WHERE descripcion ~ '^[0-9]{6,}$'
      LIMIT 10
    `);

    console.log('Rows where descripcion looks like a code:');
    corrupted.rows.forEach(row => {
      console.log(`  ID: ${row.id}`);
      console.log(`    codigo_insumo: "${row.codigo_insumo}"`);
      console.log(`    descripcion: "${row.descripcion}"`);
      console.log(`    unidad: "${row.unidad}"`);
      console.log();
    });

    console.log(`\nTotal rows with numeric descripcion: ${corrupted.rowCount}`);

    // Check if there's a pattern - maybe codigo_insumo is in descripcion?
    const pattern = await client.query(`
      SELECT COUNT(*) as count
      FROM insumos
      WHERE descripcion = codigo_insumo
    `);

    console.log(`Rows where descripcion equals codigo_insumo: ${pattern.rows[0].count}`);

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
