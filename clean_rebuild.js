require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function rebuild() {
  const client = await pool.connect();
  try {
    console.log('🔄 CLEAN REBUILD OF INSUMOS TABLE\n');

    // Delete ALL insumos
    console.log('Deleting all insumos...');
    const deleteResult = await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');
    console.log('✓ Table cleared\n');

    // Re-insert all from apus_detallado
    console.log('Rebuilding from apus_detallado...');
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
        CAST(ROW_NUMBER() OVER (PARTITION BY "Partida_Codigo" ORDER BY "Insumo_Codigo", "Insumo_Descripcion") AS TEXT) as item_1,
        COALESCE(CAST("Insumo_Codigo" AS TEXT), '') as codigo_insumo,
        SUBSTRING("Insumo_Descripcion", 1, 255) as descripcion,
        SUBSTRING("Insumo_Unidad", 1, 20) as unidad,
        "Insumo_Cantidad" as incidencia_original,
        "Insumo_Parcial" as parcial_original,
        "Insumo_Cantidad" as incidencia,
        0 as cantidad_modificada,
        0 as cantidad_adquirida
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
      ORDER BY "Partida_Codigo"
    `);

    console.log(`✓ Inserted ${insertResult.rowCount} rows\n`);

    // Verify
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(DISTINCT codigo_partida) as partidas,
        COUNT(DISTINCT descripcion) as descripciones,
        COUNT(CASE WHEN descripcion ~ '^[0-9]' THEN 1 END) as numeric_desc,
        COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) as null_desc
      FROM insumos
    `);

    const stat = stats.rows[0];
    console.log('✓ Verification:');
    console.log(`  Total insumos: ${stat.total}`);
    console.log(`  Unique partidas: ${stat.partidas}`);
    console.log(`  Unique descriptions: ${stat.descripciones}`);
    console.log(`  Numeric descriptions: ${stat.numeric_desc}`);
    console.log(`  NULL/empty descriptions: ${stat.null_desc}`);

    // Sample
    const sample = await client.query(`
      SELECT codigo_insumo, descripcion, unidad, codigo_partida
      FROM insumos
      LIMIT 6
    `);

    console.log('\n📋 Sample data:');
    sample.rows.forEach(row => {
      console.log(`  [${row.codigo_partida}] ${row.codigo_insumo || '(none)'}: ${row.descripcion} [${row.unidad}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

rebuild();
