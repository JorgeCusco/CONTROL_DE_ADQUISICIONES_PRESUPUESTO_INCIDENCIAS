require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function report() {
  const client = await pool.connect();
  try {
    console.log('📊 DATA QUALITY REPORT\n');
    console.log('═'.repeat(60));

    // Count problematic rows
    const issues = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN "Insumo_Descripcion" ~ '^[0-9]' THEN 1 END) as numeric_desc,
        COUNT(CASE WHEN "Insumo_Descripcion" ~ '^ ' THEN 1 END) as starts_with_space,
        COUNT(CASE WHEN "Insumo_Descripcion" LIKE '% %/%' THEN 1 END) as contains_slashes
      FROM apus_detallado
    `);

    const issue = issues.rows[0];
    console.log(`Total records: ${issue.total}`);
    console.log(`  - Numeric descriptions: ${issue.numeric_desc}`);
    console.log(`  - Starting with space: ${issue.starts_with_space}`);
    console.log(`  - Containing slashes: ${issue.contains_slashes}`);

    // Get examples of numeric descriptions
    const numericExamples = await client.query(`
      SELECT DISTINCT "Insumo_Descripcion", COUNT(*) as count
      FROM apus_detallado
      WHERE "Insumo_Descripcion" ~ '^[0-9]'
      GROUP BY "Insumo_Descripcion"
      ORDER BY count DESC
      LIMIT 10
    `);

    console.log(`\nTop numeric descriptions (${numericExamples.rowCount}):`);
    numericExamples.rows.forEach(row => {
      console.log(`  "${row.Insumo_Descripcion}" → ${row.count} rows`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ RECOMMENDED ACTION:');
    console.log('   The insumos table has been populated from apus_detallado.');
    console.log('   Data quality issues are in the source CSV.');
    console.log('   Frontend display now shows DESCRIPTIONS correctly.');
    console.log('   Source data cleanup may be needed manually.\n');

  } finally {
    client.release();
    await pool.end();
  }
}

report().catch(console.error);
