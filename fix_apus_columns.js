require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAPUS() {
  const client = await pool.connect();
  try {
    console.log('🔧 FIXING apus_detallado COLUMNS\n');

    // Read CSV and build complete mapping
    const csvPath = path.join(process.env.PWD || '.', 'APUS_Extraidos_v2.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');

    const codeMap = {};
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const fields = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.replace(/^"|"$/g, ''));

      if (fields.length >= 10) {
        const codigo = String(fields[6]).trim();
        const descripcion = String(fields[7]).trim();
        const unidad = String(fields[8]).trim();

        if (codigo && descripcion) {
          codeMap[codigo] = { descripcion, unidad };
        }
      }
    }

    console.log(`Loaded ${Object.keys(codeMap).length} mappings\n`);

    // Fix the rows where Insumo_Codigo is NULL
    let fixed = 0;
    const badCodes = await client.query(`
      SELECT DISTINCT "Insumo_Descripcion" as bad_code
      FROM apus_detallado
      WHERE "Insumo_Codigo" IS NULL
        AND "Insumo_Descripcion" ~ '^[0-9]{5,}$'
    `);

    console.log(`Found ${badCodes.rowCount} distinct bad codes to fix\n`);

    for (const row of badCodes.rows) {
      const badCode = String(row.bad_code).trim();
      const correctData = codeMap[badCode];

      if (correctData) {
        const updateResult = await client.query(`
          UPDATE apus_detallado
          SET
            "Insumo_Codigo" = $1,
            "Insumo_Descripcion" = $2,
            "Insumo_Unidad" = $3
          WHERE "Insumo_Codigo" IS NULL
            AND "Insumo_Descripcion" = $4
        `, [parseInt(badCode) || badCode, correctData.descripcion, correctData.unidad, badCode]);

        if (updateResult.rowCount > 0) {
          fixed += updateResult.rowCount;
          console.log(`✓ Fixed ${updateResult.rowCount} rows with code ${badCode}`);
        }
      }
    }

    console.log(`\n✓ Total fixed: ${fixed} rows\n`);

    // Rebuild insumos from the fixed apus_detallado
    console.log('Rebuilding insumos table...');
    await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');

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

    // Verify
    const stats = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN descripcion ~ '^[0-9]{5,}$' THEN 1 END) as numeric_desc,
        COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) as null_desc
      FROM insumos
    `);

    const stat = stats.rows[0];
    console.log('✓ Final Status:');
    console.log(`  Total insumos: ${stat.total}`);
    console.log(`  Numeric descriptions: ${stat.numeric_desc}`);
    console.log(`  NULL/empty descriptions: ${stat.null_desc}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAPUS();
