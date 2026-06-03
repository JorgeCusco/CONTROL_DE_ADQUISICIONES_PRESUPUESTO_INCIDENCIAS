require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function rebuild() {
  const client = await pool.connect();
  try {
    console.log('🔄 FINAL CLEAN REBUILD\n');

    await client.query('BEGIN');

    // Get current count for reference
    const before = await client.query('SELECT COUNT(*) as count FROM insumos');
    console.log(`Before: ${before.rows[0].count} insumos\n`);

    // Delete all
    const deleteResult = await client.query('DELETE FROM insumos');
    console.log(`Deleted: ${deleteResult.rowCount} rows`);

    // Insert from apus_detallado
    const insertResult = await client.query(`
      INSERT INTO insumos (
        codigo_partida,
        item_1,
        codigo_insumo,
        descripcion,
        unidad,
        incidencia_original,
        parcial_original,
        incidencia,
        cantidad_modificada,
        cantidad_adquirida
      )
      SELECT
        "Partida_Codigo",
        ROW_NUMBER()::TEXT OVER (PARTITION BY "Partida_Codigo" ORDER BY "Insumo_Codigo", "Insumo_Descripcion"),
        COALESCE("Insumo_Codigo"::TEXT, ''),
        "Insumo_Descripcion",
        "Insumo_Unidad",
        "Insumo_Cantidad",
        "Insumo_Parcial",
        "Insumo_Cantidad",
        0,
        0
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
    `);

    console.log(`Inserted: ${insertResult.rowCount} rows\n`);

    await client.query('COMMIT');

    // Verify
    const after = await client.query('SELECT COUNT(*) as count FROM insumos');
    console.log(`After: ${after.rows[0].count} insumos`);

    // Sample
    const sample = await client.query(`
      SELECT codigo_insumo, descripcion, unidad
      FROM insumos
      WHERE descripcion NOT LIKE '%m²%'
        AND descripcion NOT LIKE '%Día%'
      LIMIT 5
    `);

    console.log('\nSample of clean data:');
    sample.rows.forEach(row => {
      console.log(`  ${row.codigo_insumo || '(none)'}: ${row.descripcion} [${row.unidad}]`);
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

rebuild();
