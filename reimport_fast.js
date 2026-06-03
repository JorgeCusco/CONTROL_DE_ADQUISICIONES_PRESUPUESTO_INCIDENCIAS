require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reimport() {
  const client = await pool.connect();
  try {
    console.log('⚡ REIMPORTACIÓN RÁPIDA\n');

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
        apusRows.push({
          pc: fields[0], pd: fields[1], pr: fields[2], pu: fields[3],
          pcu: fields[4], ti: fields[5], ic: fields[6], id: fields[7],
          iu: fields[8], ir: fields[9], iq: fields[10], ip: fields[11], iparcial: fields[12]
        });
      }
    }

    console.log(`✓ ${apusRows.length} registros leídos\n`);

    // TRUNCATE
    console.log('🗑️  Vaciando tablas...');
    await client.query('TRUNCATE TABLE apus_detallado RESTART IDENTITY CASCADE');
    await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');
    console.log('✓ Tablas vaciadas\n');

    // INSERT APUS en 1 sola query
    console.log('⏳ Insertando en apus_detallado...');
    const apusValues = apusRows.map((r, i) => {
      const base = i * 13;
      return `(
        $${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5},
        $${base+6}, $${base+7}, $${base+8}, $${base+9}, $${base+10},
        $${base+11}, $${base+12}, $${base+13}
      )`;
    }).join(',');

    const apusParams = apusRows.flatMap(r => [
      r.pc, r.pd, r.pr, r.pu,
      r.pcu ? parseFloat(r.pcu) : null, r.ti, r.ic ? parseInt(r.ic) : null, r.id,
      r.iu, r.ir ? parseFloat(r.ir) : null,
      r.iq ? parseFloat(r.iq) : 0, r.ip ? parseFloat(r.ip) : 0, r.iparcial ? parseFloat(r.iparcial) : 0
    ]);

    await client.query(
      `INSERT INTO apus_detallado ("Partida_Codigo", "Partida_Descripcion", "Partida_Rendimiento",
        "Partida_Unidad", "Partida_Costo_Unitario", "Tipo_Insumo", "Insumo_Codigo",
        "Insumo_Descripcion", "Insumo_Unidad", "Insumo_Recursos", "Insumo_Cantidad",
        "Insumo_Precio", "Insumo_Parcial") VALUES ${apusValues}`,
      apusParams
    );
    console.log(`✓ ${apusRows.length} registros insertados\n`);

    // INSERT INSUMOS desde apus_detallado
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
        (SELECT COUNT(DISTINCT descripcion) FROM insumos) as unique_desc
    `);

    const st = stats.rows[0];
    console.log('✅ COMPLETADO:');
    console.log(`  apus_detallado: ${st.apus}`);
    console.log(`  insumos: ${st.insumos}`);
    console.log(`  descripciones únicas: ${st.unique_desc}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

reimport();
