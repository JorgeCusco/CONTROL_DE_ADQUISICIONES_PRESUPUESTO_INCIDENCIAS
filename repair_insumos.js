require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function repair() {
  const client = await pool.connect();
  try {
    console.log('🔧 REPARANDO INSUMOS CORROMPIDOS\n');

    // Get all corrupted rows
    const corrupted = await client.query(`
      SELECT DISTINCT
        i.codigo_partida,
        i.descripcion as codigo_en_descripcion,
        i.unidad as desc_en_unidad
      FROM insumos i
      WHERE i.codigo_insumo = '0'
    `);

    console.log(`Found ${corrupted.rowCount} unique corrupted configurations\n`);

    // Delete corrupted rows
    console.log('🗑️  Deleting corrupted rows...');
    const deleteResult = await client.query(`
      DELETE FROM insumos
      WHERE codigo_insumo = '0'
    `);
    console.log(`✓ Deleted ${deleteResult.rowCount} corrupted rows\n`);

    // Rebuild insumos from apus_detallado
    console.log('📥 Rebuilding insumos from apus_detallado...');
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
        CAST(ROW_NUMBER() OVER (PARTITION BY "Partida_Codigo" ORDER BY "Insumo_Codigo") AS TEXT),
        SUBSTRING(CAST("Insumo_Codigo" AS TEXT), 1, 50) as codigo_insumo,
        SUBSTRING("Insumo_Descripcion", 1, 255) as descripcion,
        SUBSTRING("Insumo_Unidad", 1, 20) as unidad,
        "Insumo_Cantidad" as incidencia_original,
        "Insumo_Parcial" as parcial_original,
        "Insumo_Cantidad" as incidencia,
        0 as cantidad_modificada,
        0 as cantidad_adquirida
      FROM apus_detallado
      WHERE "Partida_Codigo" NOT IN (SELECT DISTINCT codigo_partida FROM insumos)
         OR NOT EXISTS (SELECT 1 FROM insumos WHERE codigo_partida = "Partida_Codigo")
      ON CONFLICT DO NOTHING
    `);

    console.log(`✓ Inserted ${insertResult.rowCount} rows\n`);

    // Verify
    const finalCount = await client.query('SELECT COUNT(*) as count FROM insumos');
    const corruptedCount = await client.query(`
      SELECT COUNT(*) as count FROM insumos
      WHERE codigo_insumo = '0' OR codigo_insumo IS NULL
    `);

    console.log('📊 Final Status:');
    console.log(`  Total insumos: ${finalCount.rows[0].count}`);
    console.log(`  Still corrupted: ${corruptedCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error during repair:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

repair();
