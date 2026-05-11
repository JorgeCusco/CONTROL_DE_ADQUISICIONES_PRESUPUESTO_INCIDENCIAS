const { Pool } = require('pg');
const fs = require('fs');
const readline = require('readline');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function cleanLine(line) {
  // Parser simple pero robusto para CSV mal formateado
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

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

async function restoreClean() {
  const client = await pool.connect();
  try {
    console.log('🧹 LIMPIANDO Y RESTAURANDO DATOS\n');
    console.log('═'.repeat(110));

    // Limpiar tablas
    console.log('\n1️⃣  Limpiando tablas...\n');

    await client.query('DROP TABLE IF EXISTS mapeo_vinculacion CASCADE');
    await client.query('DROP TABLE IF EXISTS historial_cambios CASCADE');
    await client.query('DROP TABLE IF EXISTS compras CASCADE');
    await client.query('DROP TABLE IF EXISTS insumos CASCADE');
    await client.query('DROP TABLE IF EXISTS apus_detallado CASCADE');
    await client.query('DROP TABLE IF EXISTS partidas CASCADE');

    // Crear tablas
    console.log('  ✅ Tablas eliminadas\n');

    console.log('2️⃣  Creando tablas nuevas...\n');

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

    console.log('  ✅ Tablas creadas\n');

    // Cargar partidas
    console.log('3️⃣  Cargando partidas...\n');

    const partidasLines = fs.readFileSync('BACKUP_PARTIDAS.csv', 'utf-8').split('\n');
    let insertedPartidas = 0;

    for (let i = 1; i < partidasLines.length; i++) {
      const line = partidasLines[i].trim();
      if (!line) continue;

      const parts = await cleanLine(line);
      if (parts.length < 7) continue;

      try {
        await client.query(
          'INSERT INTO partidas VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [
            parts[0],
            parts[1].replace(/^"|"$/g, ''),
            parts[2],
            parseFloat(parts[3]) || 0,
            parseFloat(parts[4]) || 0,
            parseFloat(parts[5]) || 0,
            parseFloat(parts[6]) || 0
          ]
        );
        insertedPartidas++;
      } catch (e) {
        // Ignorar
      }
    }

    console.log(`  ✅ Insertadas ${insertedPartidas} partidas`);

    // Cargar insumos
    console.log('\n4️⃣  Cargando insumos...\n');

    const insumosLines = fs.readFileSync('BACKUP_INSUMOS.csv', 'utf-8').split('\n');
    let insertedInsumos = 0;
    let skipped = 0;

    for (let i = 1; i < insumosLines.length; i++) {
      const line = insumosLines[i].trim();
      if (!line) continue;

      const parts = await cleanLine(line);
      if (parts.length < 13) {
        skipped++;
        continue;
      }

      try {
        await client.query(
          'INSERT INTO insumos VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
          [
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
          ]
        );
        insertedInsumos++;
      } catch (e) {
        skipped++;
      }
    }

    console.log(`  ✅ Insertados ${insertedInsumos} insumos`);
    if (skipped > 0) console.log(`  ⚠️  Omitidos: ${skipped}`);

    // Verificar
    console.log('\n5️⃣  Verificando...\n');

    const countPartidas = await client.query('SELECT COUNT(*) as c FROM partidas');
    const countInsumos = await client.query('SELECT COUNT(*) as c FROM insumos');
    const countIncidencia = await client.query(
      'SELECT COUNT(*) as c FROM insumos WHERE incidencia_original > 0'
    );

    console.log(`  📊 Partidas: ${countPartidas.rows[0].c}`);
    console.log(`  📊 Insumos: ${countInsumos.rows[0].c}`);
    console.log(`  ✅ Con incidencia_original > 0: ${countIncidencia.rows[0].c}`);

    console.log('\n' + '═'.repeat(110));
    console.log('\n✅ ¡LISTO! Base de datos restaurada.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreClean();
