require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function rebuild() {
  const client = await pool.connect();
  try {
    console.log('🔄 FINAL CLEAN REBUILD v2\n');

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
        CAST(ROW_NUMBER() OVER (PARTITION BY "Partida_Codigo" ORDER BY "Insumo_Codigo", "Insumo_Descripcion") AS TEXT),
        COALESCE(CAST("Insumo_Codigo" AS TEXT), ''),
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

    // Verify
    const after = await client.query('SELECT COUNT(*) as count FROM insumos');
    console.log(`✓ Final count: ${after.rows[0].count} insumos`);

    // Check data quality
    const quality = await client.query(`
      SELECT
        COUNT(CASE WHEN descripcion IS NULL THEN 1 END) as null_desc,
        COUNT(CASE WHEN unidad IS NULL THEN 1 END) as null_unit,
        MIN(LENGTH(descripcion)) as min_desc_len,
        MAX(LENGTH(descripcion)) as max_desc_len
      FROM insumos
    `);

    const q = quality.rows[0];
    console.log(`\nData Quality:`);
    console.log(`  NULL descriptions: ${q.null_desc}`);
    console.log(`  NULL units: ${q.null_unit}`);
    console.log(`  Desc length range: ${q.min_desc_len} - ${q.max_desc_len}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

rebuild();
