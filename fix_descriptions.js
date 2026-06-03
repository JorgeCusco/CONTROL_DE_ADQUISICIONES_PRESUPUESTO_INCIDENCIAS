require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fix() {
  const client = await pool.connect();
  try {
    console.log('🔧 FIXING DESCRIPTIONS IN INSUMOS\n');

    // Update all rows with descriptions from apus_detallado
    // Match by codigo_partida and codigo_insumo (or by row position if codigo is NULL)
    const updateResult = await client.query(`
      UPDATE insumos i
      SET
        descripcion = COALESCE(
          (SELECT "Insumo_Descripcion" FROM apus_detallado a
           WHERE a."Partida_Codigo" = i.codigo_partida
           AND CAST(a."Insumo_Codigo" AS TEXT) = i.codigo_insumo
           LIMIT 1),
          i.descripcion
        ),
        unidad = COALESCE(
          (SELECT "Insumo_Unidad" FROM apus_detallado a
           WHERE a."Partida_Codigo" = i.codigo_partida
           AND CAST(a."Insumo_Codigo" AS TEXT) = i.codigo_insumo
           LIMIT 1),
          i.unidad
        )
      WHERE codigo_insumo IS NOT NULL
    `);

    console.log(`Updated ${updateResult.rowCount} rows with descriptions\n`);

    // For rows with NULL codigo_insumo, try to restore from position-based matching
    const nullCodeRows = await client.query(`
      SELECT DISTINCT codigo_partida
      FROM insumos
      WHERE codigo_insumo IS NULL
      LIMIT 5
    `);

    console.log(`Partidas with NULL codigo_insumo: ${nullCodeRows.rowCount}`);

    // Sample of what we're fixing
    const sample = await client.query(`
      SELECT id, codigo_partida, codigo_insumo, descripcion, unidad
      FROM insumos
      WHERE codigo_insumo IS NULL
      LIMIT 3
    `);

    console.log('\nSample of NULL codigo_insumo rows:');
    sample.rows.forEach(row => {
      console.log(`  ID: ${row.id}, Partida: ${row.codigo_partida}`);
      console.log(`    Codigo: ${row.codigo_insumo}, Desc: "${row.descripcion}", Unit: "${row.unidad}"`);
    });

    // Final verification
    const nullDescCount = await client.query(`
      SELECT COUNT(*) as count
      FROM insumos
      WHERE descripcion IS NULL OR descripcion = ''
    `);

    console.log(`\nRows with NULL/empty descripcion after fix: ${nullDescCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
