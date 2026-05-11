require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function rebuild() {
  const client = await pool.connect();
  try {
    console.log('🔄 FINAL CLEAN REBUILD v3\n');

    // Delete all
    const deleteResult = await client.query('DELETE FROM insumos');
    console.log(`Deleted: ${deleteResult.rowCount} rows\n`);

    // Insert from apus_detallado with SUBSTRING to truncate fields
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
        SUBSTRING("Insumo_Descripcion", 1, 255),
        SUBSTRING("Insumo_Unidad", 1, 20),
        "Insumo_Cantidad",
        "Insumo_Parcial",
        "Insumo_Cantidad",
        0,
        0
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
    `);

    console.log(`✓ Inserted: ${insertResult.rowCount} rows\n`);

    // Verify
    const after = await client.query('SELECT COUNT(*) as count FROM insumos');
    console.log(`✓ Final count: ${after.rows[0].count} insumos`);

    // Sample
    const sample = await client.query(`
      SELECT codigo_insumo, descripcion, unidad, codigo_partida
      FROM insumos
      ORDER BY id
      LIMIT 10
    `);

    console.log('\n📋 Sample data:');
    sample.rows.forEach(row => {
      console.log(`  [${row.codigo_partida}] ${row.codigo_insumo || '(none)'}: ${row.descripcion.substring(0, 40)}... [${row.unidad}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

rebuild();
