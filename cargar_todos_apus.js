const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parse/sync');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function cargarTodosAPUs() {
  const client = await pool.connect();
  try {
    console.log('📥 CARGANDO TODOS LOS APUs A SUPABASE\n');
    console.log('═'.repeat(160));

    // 1. Leer CSV
    console.log('\n1️⃣  Leyendo CSV completo...\n');

    const csvContent = fs.readFileSync('APU_TODOS_COMPLETO.csv', 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`  ✅ CSV leído: ${records.length} registros\n`);

    // 2. Limpiar tablas
    console.log('2️⃣  Preparando base de datos...\n');

    await client.query('DELETE FROM insumos');
    await client.query('DELETE FROM partidas');

    console.log('  ✅ Tablas limpiadas\n');

    // 3. Cargar partidas únicas
    console.log('3️⃣  Cargando partidas...\n');

    const partidasMap = new Map();
    records.forEach(record => {
      const key = record.partida_codigo;
      if (!partidasMap.has(key)) {
        partidasMap.set(key, {
          codigo: record.partida_codigo,
          descripcion: record.partida_nombre,
          unidad: '',
          metrado_fijo: parseFloat(record.metrado_fijo) || 0
        });
      }
    });

    let insPartidas = 0;
    for (const [key, partida] of partidasMap) {
      try {
        await client.query(
          `INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            partida.codigo,
            partida.descripcion,
            partida.unidad,
            partida.metrado_fijo,
            0,
            0,
            0
          ]
        );
        insPartidas++;
      } catch (e) {
        //
      }
    }

    console.log(`  ✅ Partidas cargadas: ${insPartidas}\n`);

    // 4. Cargar insumos
    console.log('4️⃣  Cargando insumos (esto toma un momento)...\n');

    let insInsumos = 0;
    let idCounter = 1;
    let batches = 0;

    for (const record of records) {
      try {
        await client.query(
          `INSERT INTO insumos (id, codigo_partida, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida, comentario, es_extra)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            idCounter++,
            record.partida_codigo,
            record.insumo_codigo,
            record.insumo_descripcion,
            record.unidad,
            parseFloat(record.incidencia_original) || 0,
            parseFloat(record.parcial_original) || 0,
            parseFloat(record.incidencia_original) || 0,
            0,
            0,
            '',
            false
          ]
        );
        insInsumos++;

        if (insInsumos % 500 === 0) {
          batches++;
          process.stdout.write('.');
        }
      } catch (e) {
        //
      }
    }

    console.log('\n  ✅ Insumos cargados: ' + insInsumos + '\n');

    // 5. Verificar
    console.log('5️⃣  Verificando carga...\n');

    const countPartidas = await client.query('SELECT COUNT(*) as count FROM partidas');
    const countInsumos = await client.query('SELECT COUNT(*) as count FROM insumos');
    const countIncidencia = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original > 0'
    );
    const countZero = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original = 0'
    );

    console.log(`  📊 Partidas: ${countPartidas.rows[0].count}`);
    console.log(`  📊 Insumos totales: ${countInsumos.rows[0].count}`);
    console.log(`  ✅ Con incidencia > 0: ${countIncidencia.rows[0].count} (${((countIncidencia.rows[0].count/countInsumos.rows[0].count)*100).toFixed(2)}%)`);
    console.log(`  ⚠️  Con incidencia = 0: ${countZero.rows[0].count} (${((countZero.rows[0].count/countInsumos.rows[0].count)*100).toFixed(2)}%)\n`);

    // 6. Análisis de insumos sin datos
    console.log('6️⃣  ANÁLISIS DE INSUMOS SIN DATOS (incidencia_original = 0):\n');

    const sinDatos = await client.query(`
      SELECT
        tipo_insumo,
        COUNT(*) as total,
        COUNT(DISTINCT codigo_insumo) as insumos_unicos
      FROM insumos
      WHERE incidencia_original = 0
      GROUP BY tipo_insumo
      ORDER BY total DESC
    `);

    sinDatos.rows.forEach(row => {
      console.log(`  ${row.tipo_insumo.padEnd(20)}: ${row.total} registros | ${row.insumos_unicos} únicos`);
    });

    // 7. Ejemplos de insumos sin datos
    console.log(`\n7️⃣  EJEMPLOS DE INSUMOS SIN DATOS:\n`);

    const ejemplos = await client.query(`
      SELECT DISTINCT
        tipo_insumo,
        codigo_insumo,
        descripcion,
        unidad
      FROM insumos
      WHERE incidencia_original = 0
      ORDER BY tipo_insumo, codigo_insumo
      LIMIT 20
    `);

    ejemplos.rows.forEach((row, idx) => {
      console.log(`  ${(idx+1).toString().padStart(2)}. [${row.tipo_insumo.padEnd(12)}] ${row.codigo_insumo} - ${row.descripcion.substring(0, 50)}`);
    });

    console.log(`\n${'═'.repeat(160)}`);
    console.log('\n✅ ¡TODOS LOS APUs CARGADOS!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cargarTodosAPUs();
