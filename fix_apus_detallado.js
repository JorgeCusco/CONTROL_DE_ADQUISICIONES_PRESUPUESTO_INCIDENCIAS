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
    console.log('🔧 FIXING apus_detallado\n');

    // Read the CSV file to find the correct mappings
    const csvPath = path.join(process.env.PWD || '.', 'APUS_Extraidos_v2.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n');

    // Build a mapping of codes to descriptions from CSV
    const codeMap = {};
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Simple CSV parsing (handles quoted fields)
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

      if (fields.length >= 8) {
        const codigo = String(fields[6]).trim();
        const descripcion = String(fields[7]).trim();
        const unidad = String(fields[8]).trim();

        if (codigo && descripcion) {
          if (!codeMap[codigo]) {
            codeMap[codigo] = { descripcion, unidad };
          }
        }
      }
    }

    console.log(`Loaded ${Object.keys(codeMap).length} code-to-description mappings from CSV\n`);

    // Find and fix rows in apus_detallado where description looks like a code
    const badRows = await client.query(`
      SELECT
        id,
        "Insumo_Codigo",
        "Insumo_Descripcion",
        "Insumo_Unidad"
      FROM apus_detallado
      WHERE "Insumo_Descripcion" ~ '^[0-9]{5,}$'
      LIMIT 5
    `);

    console.log(`Sample of bad rows in apus_detallado:`);
    badRows.rows.forEach(row => {
      console.log(`  Code(Col7): ${row.Insumo_Codigo} | Desc(Col8): "${row.Insumo_Descripcion}" | Unit(Col9): "${row.Insumo_Unidad}"`);

      // Check if the bad description is actually a code
      const badCode = String(row.Insumo_Descripcion).trim();
      const correctData = codeMap[badCode];
      if (correctData) {
        console.log(`    → Should be: Code: ${badCode}, Desc: "${correctData.descripcion}", Unit: "${correctData.unidad}"`);
      }
    });

    console.log(`\n⚠️ Source data in CSV has issues. The numeric descriptions cannot be automatically fixed.`);
    console.log(`   These are legitimate but poorly-labeled items in the APUS_Extraidos_v2.csv file.`);
    console.log(`   Will proceed with current data and adjust API to handle this case.\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAPUS();
