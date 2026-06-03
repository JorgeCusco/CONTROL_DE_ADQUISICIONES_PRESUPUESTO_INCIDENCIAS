require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING,
  max: 5
});

// Parser CSV robusto
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());

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
        cells.push(current.trim().replace(/^"|"$/g, '').replace('""', '"'));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^"|"$/g, '').replace('""', '"'));

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

async function upload() {
  try {
    console.log('🚀 SUBIDA FINAL_FINAL.csv A SUPABASE\n');

    const apusRows = parseCSV(path.join(__dirname, 'APUS_Extraidos_v2.csv'));
    const finalRows = parseCSV(path.join(__dirname, 'FINAL_FINAL.csv'));

    console.log(`✓ Archivos parseados\n`);

    // Mapear insumos a partidas
    const insumoPartidaMap = new Map();
    const partidas = new Set();

    apusRows.forEach(row => {
      const cod = (row.Insumo_Codigo || '').trim();
      const part = (row.Partida_Codigo || '').trim();
      if (cod && part) {
        if (!insumoPartidaMap.has(cod)) insumoPartidaMap.set(cod, []);
        insumoPartidaMap.get(cod).push({ codigo: part, item: row.Item_1 });
        partidas.add(part);
      }
    });

    console.log(`📊 ${insumoPartidaMap.size} insumos, ${partidas.size} partidas\n`);

    const client = await pool.connect();
    try {
      console.log('⏳ Insertando...');
      let inserted = 0;

      for (const row of finalRows) {
        const codigo = (row.codigo_insumo || '').trim();
        const desc = (row.descripcion || '').trim();
        const unit = (row.unidad || '').trim();
        const incid = parseFloat(row.incidencia_original) || 0;
        const parc = parseFloat(row.parcial_original) || 0;

        if (!codigo || !desc) continue;

        const parts = insumoPartidaMap.get(codigo) || [];
        for (const part of parts) {
          try {
            await client.query(
              `INSERT INTO insumos (codigo_partida, item_1, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT DO NOTHING`,
              [part.codigo, part.item, codigo, desc, unit, incid, parc, incid, 0, 0]
            );
            inserted++;
          } catch (e) {
            console.log(`⚠️  Error en ${codigo}: ${e.message.substring(0, 50)}`);
          }
        }
      }

      console.log(`✓ ${inserted} insumos insertados\n`);

      const { rows: [c] } = await client.query('SELECT COUNT(*) as cnt FROM insumos');
      console.log(`✅ COMPLETADO - Total en Supabase: ${c.cnt} insumos`);

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
