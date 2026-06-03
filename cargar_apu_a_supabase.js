const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parse/sync');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function cargarAPU() {
  const client = await pool.connect();
  try {
    console.log('📥 CARGANDO CSV A SUPABASE\n');
    console.log('═'.repeat(150));

    // 1. Leer CSV
    console.log('\n1️⃣  Leyendo CSV...\n');

    const csvContent = fs.readFileSync('APU_COMPLETO_FINAL.csv', 'utf-8');
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

    // 3. Procesar y cargar datos
    console.log('3️⃣  Cargando datos en Supabase...\n');

    // Primero: Cargar partidas únicas
    const partidasMap = new Map();
    records.forEach(record => {
      const key = record.partida_codigo;
      if (!partidasMap.has(key)) {
        partidasMap.set(key, {
          codigo: record.partida_codigo,
          descripcion: record.partida_nombre,
          unidad: '', // A inferir del primer insumo
          metrado_fijo: parseFloat(record.metrado_fijo) || 0,
          cantidad_presupuestada: 0,
          precio_unitario_presupuestado: 0,
          total_presupuestado: 0
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
            partida.cantidad_presupuestada,
            partida.precio_unitario_presupuestado,
            partida.total_presupuestado
          ]
        );
        insPartidas++;
      } catch (e) {
        // Ignorar duplicados
      }
    }

    console.log(`  ✅ Partidas cargadas: ${insPartidas}`);

    // Segundo: Cargar insumos
    let insInsumos = 0;
    let idCounter = 1;

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
      } catch (e) {
        console.error(`  ⚠️  Error en ${record.insumo_codigo}: ${e.message.split('\n')[0]}`);
      }
    }

    console.log(`  ✅ Insumos cargados: ${insInsumos}\n`);

    // 4. Verificar
    console.log('4️⃣  Verificando carga...\n');

    const countPartidas = await client.query('SELECT COUNT(*) as count FROM partidas');
    const countInsumos = await client.query('SELECT COUNT(*) as count FROM insumos');
    const countIncidencia = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original > 0'
    );

    console.log(`  📊 Partidas en BD: ${countPartidas.rows[0].count}`);
    console.log(`  📊 Insumos en BD: ${countInsumos.rows[0].count}`);
    console.log(`  ✅ Con incidencia_original > 0: ${countIncidencia.rows[0].count}`);

    // 5. Muestras
    console.log('\n5️⃣  Muestreo de datos cargados:\n');

    const sample = await client.query(`
      SELECT
        codigo_partida,
        codigo_insumo,
        descripcion,
        incidencia_original,
        parcial_original
      FROM insumos
      LIMIT 10
    `);

    sample.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.codigo_partida} | ${row.codigo_insumo} | ${row.descripcion.substring(0, 40).padEnd(40)} | Incid: ${row.incidencia_original}`);
    });

    console.log('\n' + '═'.repeat(150));
    console.log('\n✅ ¡DATOS CARGADOS CORRECTAMENTE A SUPABASE!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cargarAPU();
