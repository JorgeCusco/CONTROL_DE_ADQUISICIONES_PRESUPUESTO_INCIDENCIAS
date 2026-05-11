require('dotenv').config();
const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reimport() {
  const client = await pool.connect();
  try {
    console.log('🔄 REIMPORTACIÓN LIMPIA DESDE CSV\n');

    // Leer CSV directamente
    console.log('📖 Leyendo APUS_Extraidos_v2.csv...');
    const csvContent = fs.readFileSync('APUS_Extraidos_v2.csv', 'utf8');
    const lines = csvContent.split('\n');

    // Procesar header
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    console.log(`Headers: ${headers.join(', ')}\n`);

    // Parsed datos
    const apusRows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Parse CSV with proper quote handling
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
        apusRows.push({
          // Columnas A-E (Partida)
          Partida_Codigo: fields[0],
          Partida_Descripcion: fields[1],
          Partida_Rendimiento: fields[2],
          Partida_Unidad: fields[3],
          Partida_Costo_Unitario: fields[4],
          // Columnas F-M (Insumo)
          Tipo_Insumo: fields[5],
          Insumo_Codigo: fields[6],
          Insumo_Descripcion: fields[7],
          Insumo_Unidad: fields[8],
          Insumo_Recursos: fields[9],
          Insumo_Cantidad: fields[10],
          Insumo_Precio: fields[11],
          Insumo_Parcial: fields[12]
        });
      }
    }

    console.log(`✓ ${apusRows.length} registros leídos\n`);

    // TRUNCATE apus_detallado
    console.log('🗑️  Vaciando apus_detallado...');
    await client.query('TRUNCATE TABLE apus_detallado RESTART IDENTITY CASCADE');
    console.log('✓ apus_detallado vaciada\n');

    // INSERT en apus_detallado
    console.log('⏳ Insertando en apus_detallado...');
    for (const row of apusRows) {
      try {
        await client.query(
          `INSERT INTO apus_detallado (
            "Partida_Codigo", "Partida_Descripcion", "Partida_Rendimiento", "Partida_Unidad",
            "Partida_Costo_Unitario", "Tipo_Insumo", "Insumo_Codigo", "Insumo_Descripcion",
            "Insumo_Unidad", "Insumo_Recursos", "Insumo_Cantidad", "Insumo_Precio", "Insumo_Parcial"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            row.Partida_Codigo,
            row.Partida_Descripcion,
            row.Partida_Rendimiento,
            row.Partida_Unidad,
            row.Partida_Costo_Unitario ? parseFloat(row.Partida_Costo_Unitario) : null,
            row.Tipo_Insumo,
            row.Insumo_Codigo ? parseInt(row.Insumo_Codigo) : null,
            row.Insumo_Descripcion,
            row.Insumo_Unidad,
            row.Insumo_Recursos ? parseFloat(row.Insumo_Recursos) : null,
            row.Insumo_Cantidad ? parseFloat(row.Insumo_Cantidad) : 0,
            row.Insumo_Precio ? parseFloat(row.Insumo_Precio) : 0,
            row.Insumo_Parcial ? parseFloat(row.Insumo_Parcial) : 0
          ]
        );
      } catch (e) {
        console.error(`Error en ${row.Insumo_Codigo}: ${e.message.substring(0, 80)}`);
      }
    }
    console.log(`✓ ${apusRows.length} registros insertados\n`);

    // TRUNCATE insumos
    console.log('🗑️  Vaciando insumos...');
    await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');
    console.log('✓ insumos vaciada\n');

    // Insertar en insumos desde apus_detallado
    console.log('⏳ Poblando insumos desde apus_detallado...');
    const insertInsumos = await client.query(`
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
        0,
        0
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
    `);

    console.log(`✓ ${insertInsumos.rowCount} insumos insertados\n`);

    // Verificación
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM apus_detallado) as apus_count,
        (SELECT COUNT(*) FROM insumos) as insumos_count,
        (SELECT COUNT(DISTINCT descripcion) FROM insumos) as unique_desc
    `);

    const stat = stats.rows[0];
    console.log('✅ VERIFICACIÓN FINAL:');
    console.log(`  apus_detallado: ${stat.apus_count} registros`);
    console.log(`  insumos: ${stat.insumos_count} registros`);
    console.log(`  insumos únicos: ${stat.unique_desc} descripciones distintas\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

reimport();
