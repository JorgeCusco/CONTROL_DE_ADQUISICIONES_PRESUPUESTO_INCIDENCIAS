const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function cleanLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function restoreFast() {
  const client = await pool.connect();
  try {
    console.log('⚡ RESTAURACIÓN RÁPIDA CON BATCHES\n');
    console.log('═'.repeat(110));

    // Limpiar
    console.log('\n1️⃣  Limpiando tablas...');
    await client.query('DROP TABLE IF EXISTS mapeo_vinculacion CASCADE');
    await client.query('DROP TABLE IF EXISTS historial_cambios CASCADE');
    await client.query('DROP TABLE IF EXISTS compras CASCADE');
    await client.query('DROP TABLE IF EXISTS insumos CASCADE');
    await client.query('DROP TABLE IF EXISTS apus_detallado CASCADE');
    await client.query('DROP TABLE IF EXISTS partidas CASCADE');
    console.log('  ✅ Hecho');

    // Crear tablas
    console.log('\n2️⃣  Creando tablas...');
    await client.query(`
      CREATE TABLE partidas (
        codigo VARCHAR(50) PRIMARY KEY,
        descripcion TEXT,
        unidad VARCHAR(20),
        metrado_fijo DECIMAL(12, 4),
        cantidad_presupuestada DECIMAL(12, 4),
        precio_unitario_presupuestado DECIMAL(12, 4),
        total_presupuestado DECIMAL(12, 4)
      )
    `);
    await client.query(`
      CREATE TABLE insumos (
        id INTEGER PRIMARY KEY,
        codigo_partida VARCHAR(50),
        item_1 VARCHAR(50),
        codigo_insumo VARCHAR(50),
        descripcion TEXT,
        unidad VARCHAR(20),
        incidencia_original DECIMAL(12, 4),
        parcial_original DECIMAL(12, 4),
        incidencia DECIMAL(12, 4),
        cantidad_modificada DECIMAL(12, 4),
        cantidad_adquirida DECIMAL(12, 4),
        comentario TEXT,
        es_extra BOOLEAN,
        FOREIGN KEY (codigo_partida) REFERENCES partidas(codigo)
      )
    `);
    await client.query(`
      CREATE TABLE compras (
        id INTEGER PRIMARY KEY,
        tipo_c VARCHAR(50),
        anio_c INTEGER,
        orden_doc VARCHAR(100),
        detalle_compra TEXT,
        unidad_und VARCHAR(20),
        cantidad_und DECIMAL(12, 4),
        precio_und DECIMAL(12, 4),
        insumo_descripcion TEXT,
        observacion TEXT
      )
    `);
    await client.query(`
      CREATE TABLE mapeo_vinculacion (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        insumo_nombre TEXT,
        compra_id INTEGER REFERENCES compras(id),
        usuario VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('  ✅ Hecho');

    // Cargar partidas en batch
    console.log('\n3️⃣  Cargando partidas...');
    const partidasLines = fs.readFileSync('BACKUP_PARTIDAS.csv', 'utf-8').split('\n');
    let batch = [];
    let batchSize = 100;

    for (let i = 1; i < partidasLines.length; i++) {
      const line = partidasLines[i].trim();
      if (!line) continue;

      const parts = await cleanLine(line);
      if (parts.length < 7) continue;

      batch.push([
        parts[0],
        parts[1].replace(/^"|"$/g, ''),
        parts[2],
        parseFloat(parts[3]) || 0,
        parseFloat(parts[4]) || 0,
        parseFloat(parts[5]) || 0,
        parseFloat(parts[6]) || 0
      ]);

      if (batch.length >= batchSize) {
        const text = batch.map((_, i) => {
          const idx = i + 1;
          return `($${idx * 7 - 6},$${idx * 7 - 5},$${idx * 7 - 4},$${idx * 7 - 3},$${idx * 7 - 2},$${idx * 7 - 1},$${idx * 7})`;
        }).join(',');

        const values = batch.flat();
        await client.query(
          `INSERT INTO partidas VALUES ${text}`,
          values
        );
        batch = [];
      }
    }

    if (batch.length > 0) {
      const text = batch.map((_, i) => {
        const idx = i + 1;
        return `($${idx * 7 - 6},$${idx * 7 - 5},$${idx * 7 - 4},$${idx * 7 - 3},$${idx * 7 - 2},$${idx * 7 - 1},$${idx * 7})`;
      }).join(',');
      const values = batch.flat();
      await client.query(`INSERT INTO partidas VALUES ${text}`, values);
    }

    const countPartidas = await client.query('SELECT COUNT(*) as c FROM partidas');
    console.log(`  ✅ Insertadas ${countPartidas.rows[0].c} partidas`);

    // Cargar insumos en batch
    console.log('\n4️⃣  Cargando insumos...');
    const insumosLines = fs.readFileSync('BACKUP_INSUMOS.csv', 'utf-8').split('\n');
    batch = [];
    batchSize = 100;

    for (let i = 1; i < insumosLines.length; i++) {
      const line = insumosLines[i].trim();
      if (!line) continue;

      const parts = await cleanLine(line);
      if (parts.length < 13) continue;

      batch.push([
        parseInt(parts[0]),
        parts[1],
        parts[2] || null,
        parts[3],
        parts[4].replace(/^"|"$/g, ''),
        parts[5].replace(/^"|"$/g, ''),
        parseFloat(parts[6]) || 0,
        parseFloat(parts[7]) || 0,
        parseFloat(parts[8]) || 0,
        parseFloat(parts[9]) || 0,
        parseFloat(parts[10]) || 0,
        parts[11] || null,
        parts[12] === 'true'
      ]);

      if (batch.length >= batchSize) {
        const text = batch.map((_, i) => {
          const idx = i + 1;
          const baseIdx = (idx - 1) * 13;
          return `($${baseIdx + 1},$${baseIdx + 2},$${baseIdx + 3},$${baseIdx + 4},$${baseIdx + 5},$${baseIdx + 6},$${baseIdx + 7},$${baseIdx + 8},$${baseIdx + 9},$${baseIdx + 10},$${baseIdx + 11},$${baseIdx + 12},$${baseIdx + 13})`;
        }).join(',');

        const values = batch.flat();
        await client.query(
          `INSERT INTO insumos VALUES ${text}`,
          values
        );
        batch = [];
        process.stdout.write('.');
      }
    }

    if (batch.length > 0) {
      const text = batch.map((_, i) => {
        const idx = i + 1;
        const baseIdx = (idx - 1) * 13;
        return `($${baseIdx + 1},$${baseIdx + 2},$${baseIdx + 3},$${baseIdx + 4},$${baseIdx + 5},$${baseIdx + 6},$${baseIdx + 7},$${baseIdx + 8},$${baseIdx + 9},$${baseIdx + 10},$${baseIdx + 11},$${baseIdx + 12},$${baseIdx + 13})`;
      }).join(',');
      const values = batch.flat();
      await client.query(`INSERT INTO insumos VALUES ${text}`, values);
    }

    console.log();
    const countInsumos = await client.query('SELECT COUNT(*) as c FROM insumos');
    console.log(`  ✅ Insertados ${countInsumos.rows[0].c} insumos`);

    // Verificar
    console.log('\n5️⃣  Verificando...\n');
    const countIncidencia = await client.query(
      'SELECT COUNT(*) as c FROM insumos WHERE incidencia_original > 0'
    );

    console.log(`  📊 Partidas: ${countPartidas.rows[0].c}`);
    console.log(`  📊 Insumos totales: ${countInsumos.rows[0].c}`);
    console.log(`  ✅ Con incidencia_original > 0: ${countIncidencia.rows[0].c}`);

    console.log('\n' + '═'.repeat(110));
    console.log('\n✅ ¡RESTAURACIÓN COMPLETADA!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreFast();
