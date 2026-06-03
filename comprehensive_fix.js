require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fix() {
  const client = await pool.connect();
  try {
    console.log('🔧 COMPREHENSIVE DATA FIX\n');

    // Step 1: Identify all rows where descripcion looks like a code (numeric)
    const corruptedRows = await client.query(`
      SELECT
        id,
        codigo_partida,
        codigo_insumo,
        descripcion,
        unidad
      FROM insumos
      WHERE descripcion ~ '^[0-9]{6,}$'
      OR (LENGTH(descripcion) < 10 AND unidad LIKE '% %')
    `);

    console.log(`Found ${corruptedRows.rowCount} potentially corrupted rows\n`);

    // Step 2: Delete all rows with NULL codigo_insumo and rebuild from apus_detallado
    console.log('Deleting NULL codigo_insumo rows...');
    const deleteResult = await client.query(`
      DELETE FROM insumos
      WHERE codigo_insumo IS NULL OR codigo_insumo = ''
    `);
    console.log(`✓ Deleted ${deleteResult.rowCount} rows\n`);

    // Step 3: Delete rows with numeric-looking descripcion
    console.log('Deleting rows with corrupted data...');
    const deleteCorrupted = await client.query(`
      DELETE FROM insumos
      WHERE descripcion ~ '^[0-9]{6,}$'
    `);
    console.log(`✓ Deleted ${deleteCorrupted.rowCount} corrupted rows\n`);

    // Step 4: Re-insert all from apus_detallado
    console.log('Re-inserting all insumos from apus_detallado...');
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
      ORDER BY "Partida_Codigo"
    `);

    console.log(`✓ Inserted ${insertResult.rowCount} rows\n`);

    // Final verification
    const finalStats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN descripcion ~ '^[0-9]' THEN 1 END) as numeric_desc,
        COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) as null_desc
      FROM insumos
    `);

    const stat = finalStats.rows[0];
    console.log('✓ Final Status:');
    console.log(`  Total insumos: ${stat.total}`);
    console.log(`  Rows with numeric descripcion: ${stat.numeric_desc}`);
    console.log(`  Rows with NULL/empty descripcion: ${stat.null_desc}`);

    // Sample
    const sample = await client.query(`
      SELECT codigo_insumo, descripcion, unidad
      FROM insumos
      LIMIT 5
    `);

    console.log('\nSample of repaired data:');
    sample.rows.forEach(row => {
      console.log(`  ${row.codigo_insumo || '(NULL)'}: ${row.descripcion} [${row.unidad}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
