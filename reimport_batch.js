require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reimport() {
  const client = await pool.connect();
  try {
    console.log('⚡ REIMPORTACIÓN POR LOTES\n');

    console.log('📖 Leyendo APUS_Extraidos_v2.csv...');
    const csvContent = fs.readFileSync('APUS_Extraidos_v2.csv', 'utf8');
    const lines = csvContent.split('\n');

    const apusRows = [];
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
          fields.push(current.replace(/^"|"$/g, '').trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.replace(/^"|"$/g, '').trim());

      if (fields.length >= 13) {
        apusRows.push([
          fields[0], fields[1], fields[2], fields[3],
          fields[4] ? parseFloat(fields[4]) : null, fields[5], fields[6] ? parseInt(fields[6]) : null, fields[7],
          fields[8], fields[9] ? parseFloat(fields[9]) : null,
          fields[10] ? parseFloat(fields[10]) : 0, fields[11] ? parseFloat(fields[11]) : 0, fields[12] ? parseFloat(fields[12]) : 0
        ]);
      }
    }

    console.log(`✓ ${apusRows.length} registros leídos\n`);

    // TRUNCATE
    console.log('🗑️  Vaciando tablas...');
    await client.query('TRUNCATE TABLE apus_detallado RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');
    console.log('✓ Tablas vaciadas\n');

    // Insertar en lotes de 500
    console.log('⏳ Insertando en apus_detallado (por lotes)...');
    const batchSize = 500;
    let inserted = 0;

    for (let batch = 0; batch < Math.ceil(apusRows.length / batchSize); batch++) {
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, apusRows.length);
      const batchRows = apusRows.slice(start, end);

      const placeholders = batchRows.map((_, i) => {
        const baseIdx = i * 13 + 1;
        return `($${baseIdx}, $${baseIdx+1}, $${baseIdx+2}, $${baseIdx+3}, $${baseIdx+4}, $${baseIdx+5}, $${baseIdx+6}, $${baseIdx+7}, $${baseIdx+8}, $${baseIdx+9}, $${baseIdx+10}, $${baseIdx+11}, $${baseIdx+12})`;
      }).join(',');

      const params = batchRows.flat();

      await client.query(
        `INSERT INTO apus_detallado ("Partida_Codigo", "Partida_Descripcion", "Partida_Rendimiento",
          "Partida_Unidad", "Partida_Costo_Unitario", "Tipo_Insumo", "Insumo_Codigo",
          "Insumo_Descripcion", "Insumo_Unidad", "Insumo_Recursos", "Insumo_Cantidad",
          "Insumo_Precio", "Insumo_Parcial") VALUES ${placeholders}`,
        params
      );

      inserted += batchRows.length;
      console.log(`  ✓ ${inserted}/${apusRows.length} inseridos`);
    }

    console.log(`✓ Inserción completada\n`);

    // INSERT INSUMOS
    console.log('⏳ Poblando insumos...');
    const insertResult = await client.query(`
      INSERT INTO insumos (
        codigo_partida, item_1, codigo_insumo, descripcion, unidad,
        incidencia_original, parcial_original, incidencia,
        cantidad_modificada, cantidad_adquirida
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
        0, 0
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
    `);

    console.log(`✓ ${insertResult.rowCount} insumos insertados\n`);

    // Verificación
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM apus_detallado) as apus,
        (SELECT COUNT(*) FROM insumos) as insumos,
        (SELECT COUNT(DISTINCT descripcion) FROM insumos) as unique_desc,
        (SELECT COUNT(CASE WHEN descripcion IS NULL OR descripcion = '' THEN 1 END) FROM insumos) as null_desc
    `);

    const st = stats.rows[0];
    console.log('✅ COMPLETADO:');
    console.log(`  apus_detallado: ${st.apus} registros`);
    console.log(`  insumos: ${st.insumos} registros`);
    console.log(`  descripciones únicas: ${st.unique_desc}`);
    console.log(`  descripciones nulas: ${st.null_desc}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

reimport();
