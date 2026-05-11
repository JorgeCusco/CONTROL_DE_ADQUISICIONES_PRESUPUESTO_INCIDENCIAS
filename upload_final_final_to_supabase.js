require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Conectar a Supabase
const supabasePool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING
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

async function uploadToSupabase() {
  try {
    console.log('📂 LEYENDO ARCHIVOS\n');

    const apusRows = parseCSV(path.join(__dirname, 'APUS_Extraidos_v2.csv'));
    const finalRows = parseCSV(path.join(__dirname, 'FINAL_FINAL.csv'));

    console.log(`✓ APUS_Extraidos_v2.csv: ${apusRows.length} filas`);
    console.log(`✓ FINAL_FINAL.csv: ${finalRows.length} insumos\n`);

    // Mapear insumos a partidas desde APUS
    const insumoPartidaMap = new Map();
    const partidasSet = new Set();

    apusRows.forEach(row => {
      const codigo = (row.Insumo_Codigo || '').trim();
      const partida = (row.Partida_Codigo || '').trim();

      if (codigo && partida) {
        if (!insumoPartidaMap.has(codigo)) {
          insumoPartidaMap.set(codigo, []);
        }
        insumoPartidaMap.get(codigo).push({
          codigo: partida,
          descripcion: row.Partida_Descripcion || '',
          unidad: row.Partida_Unidad || '',
          item_1: row.Item_1 || ''
        });

        partidasSet.add(JSON.stringify({
          codigo: partida,
          descripcion: row.Partida_Descripcion || '',
          unidad: row.Partida_Unidad || ''
        }));
      }
    });

    console.log(`📊 ${insumoPartidaMap.size} insumos mapeados`);
    console.log(`📑 ${partidasSet.size} partidas encontradas\n`);

    const client = await supabasePool.connect();
    try {
      await client.query('BEGIN');

      console.log('🧹 Limpiando tablas en Supabase...');
      await client.query('DELETE FROM insumos');
      await client.query('DELETE FROM partidas');
      console.log('✓ Tablas limpiadas\n');

      // Insertar partidas
      console.log('⏳ Subiendo partidas a Supabase...');
      for (const partidaJson of partidasSet) {
        const partida = JSON.parse(partidaJson);
        await client.query(
          'INSERT INTO partidas (codigo, descripcion, unidad) VALUES ($1, $2, $3)',
          [partida.codigo, partida.descripcion, partida.unidad]
        );
      }
      console.log(`✓ ${partidasSet.size} partidas subidas\n`);

      // Insertar insumos de FINAL_FINAL.csv
      console.log('⏳ Subiendo insumos de FINAL_FINAL.csv a Supabase...');
      let insertCount = 0;
      let skipCount = 0;

      for (const row of finalRows) {
        const codigo_insumo = (row.codigo_insumo || '').trim();
        const descripcion = (row.descripcion || '').trim();
        const unidad = (row.unidad || '').trim();
        const incidencia_original = parseFloat(row.incidencia_original) || 0;
        const parcial_original = parseFloat(row.parcial_original) || 0;

        if (!codigo_insumo || !descripcion) {
          skipCount++;
          continue;
        }

        // Obtener partidas para este insumo
        const partidas = insumoPartidaMap.get(codigo_insumo) || [];

        if (partidas.length === 0) {
          console.log(`⚠️  ${codigo_insumo} sin partidas`);
          skipCount++;
          continue;
        }

        // Insertar un registro por partida
        for (const partida of partidas) {
          await client.query(
            `INSERT INTO insumos
            (codigo_partida, item_1, codigo_insumo, descripcion, unidad,
             incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              partida.codigo,
              partida.item_1,
              codigo_insumo,
              descripcion,
              unidad,
              incidencia_original,
              parcial_original,
              incidencia_original,
              0,
              0
            ]
          );
          insertCount++;
        }

        if (insertCount % 500 === 0) {
          console.log(`  ✓ ${insertCount} insumos subidos...`);
        }
      }

      console.log(`✓ ${insertCount} insumos subidos`);
      if (skipCount > 0) {
        console.log(`⚠️  ${skipCount} insumos sin partidas\n`);
      }

      await client.query('COMMIT');
      console.log('✅ SUBIDA A SUPABASE COMPLETADA\n');

      // Verificar
      const { rows: [{ count: pCount }] } = await client.query('SELECT COUNT(*) FROM partidas');
      const { rows: [{ count: iCount }] } = await client.query('SELECT COUNT(*) FROM insumos');

      console.log('📊 SUPABASE - VERIFICACIÓN:');
      console.log(`✓ Partidas: ${pCount}`);
      console.log(`✓ Insumos: ${iCount}`);

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await supabasePool.end();
  }
}

uploadToSupabase();
