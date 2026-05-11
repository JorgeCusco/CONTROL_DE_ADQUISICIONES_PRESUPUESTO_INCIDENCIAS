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
    const updateResult = await client.query(`
      UPDATE insumos i
      SET
        descripcion = COALESCE(
          (SELECT SUBSTRING("Insumo_Descripcion", 1, 255) FROM apus_detallado a
           WHERE a."Partida_Codigo" = i.codigo_partida
           AND CAST(a."Insumo_Codigo" AS TEXT) = i.codigo_insumo
           LIMIT 1),
          i.descripcion
        ),
        unidad = COALESCE(
          (SELECT SUBSTRING("Insumo_Unidad", 1, 20) FROM apus_detallado a
           WHERE a."Partida_Codigo" = i.codigo_partida
           AND CAST(a."Insumo_Codigo" AS TEXT) = i.codigo_insumo
           LIMIT 1),
          i.unidad
        )
      WHERE codigo_insumo IS NOT NULL
        AND codigo_insumo != ''
    `);

    console.log(`✓ Updated ${updateResult.rowCount} rows with descriptions\n`);

    // Verify results
    const sample = await client.query(`
      SELECT id, codigo_partida, codigo_insumo, descripcion, unidad
      FROM insumos
      WHERE codigo_insumo IS NOT NULL
      LIMIT 3
    `);

    console.log('Sample of updated rows:');
    sample.rows.forEach(row => {
      console.log(`  ${row.codigo_insumo}: ${row.descripcion} (${row.unidad})`);
    });

    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN codigo_insumo IS NULL THEN 1 END) as null_code,
        COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) as null_desc
      FROM insumos
    `);

    const stat = stats.rows[0];
    console.log(`\n✓ Final Status:`);
    console.log(`  Total insumos: ${stat.total}`);
    console.log(`  NULL codigo_insumo: ${stat.null_code}`);
    console.log(`  NULL/empty descripcion: ${stat.null_desc}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
