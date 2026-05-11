require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING,
  statement_timeout: 60000,
  query_timeout: 60000
});

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^["']|["']$/g, ''));

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function upload() {
  try {
    console.log('⚡ SUBIDA RÁPIDA A SUPABASE\n');

    const apusRows = parseCSV(path.join(__dirname, 'APUS_Extraidos_v2.csv'));
    const finalRows = parseCSV(path.join(__dirname, 'FINAL_FINAL.csv'));

    console.log(`✓ CSV leídos\n`);

    const insumoPartidaMap = new Map();
    const partidas = [];

    apusRows.forEach(row => {
      const codigo = (row.Insumo_Codigo || '').trim();
      const codPart = (row.Partida_Codigo || '').trim();

      if (codigo && codPart) {
        if (!insumoPartidaMap.has(codigo)) {
          insumoPartidaMap.set(codigo, []);
        }
        insumoPartidaMap.get(codigo).push({ codigo: codPart, desc: row.Partida_Descripcion, unit: row.Partida_Unidad, item: row.Item_1 });

        if (!partidas.find(p => p.codigo === codPart)) {
          partidas.push({ codigo: codPart, desc: row.Partida_Descripcion, unit: row.Partida_Unidad });
        }
      }
    });

    const client = await pool.connect();
    try {
      // Insert partidas
      console.log('⏳ Insertando partidas...');
      for (const p of partidas) {
        await client.query(
          'INSERT INTO partidas (codigo, descripcion, unidad) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [p.codigo, p.desc, p.unit]
        );
      }
      console.log(`✓ ${partidas.length} partidas\n`);

      // Insert insumos
      console.log('⏳ Insertando insumos FINAL_FINAL.csv...');
      let count = 0;
      for (const row of finalRows) {
        const codigo = (row.codigo_insumo || '').trim();
        const desc = (row.descripcion || '').trim();
        const unit = (row.unidad || '').trim();
        const incid = parseFloat(row.incidencia_original) || 0;
        const parc = parseFloat(row.parcial_original) || 0;

        if (!codigo || !desc) continue;

        const parts = insumoPartidaMap.get(codigo) || [];
        for (const part of parts) {
          await client.query(
            `INSERT INTO insumos (codigo_partida, item_1, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [part.codigo, part.item, codigo, desc, unit, incid, parc, incid, 0, 0]
          );
          count++;
        }
      }
      console.log(`✓ ${count} insumos subidos\n`);

      const { rows: [p] } = await client.query('SELECT COUNT(*) as c FROM partidas');
      const { rows: [i] } = await client.query('SELECT COUNT(*) as c FROM insumos');

      console.log('✅ COMPLETADO');
      console.log(`📊 Supabase: ${p.c} partidas, ${i.c} insumos`);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

upload();
