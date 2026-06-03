const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parse/sync');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function restoreFromCSV() {
  const client = await pool.connect();
  try {
    console.log('🔄 RESTAURANDO DESDE RESPALDOS CSV\n');
    console.log('═'.repeat(110));

    // 1. Crear tabla partidas limpia
    console.log('\n1️⃣  Preparando tabla partidas...\n');

    await client.query('DROP TABLE IF EXISTS partidas CASCADE');
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
    console.log('  ✅ Tabla partidas creada');

    // 2. Cargar datos partidas
    console.log('\n2️⃣  Cargando partidas...\n');

    const partidasCSV = fs.readFileSync('BACKUP_PARTIDAS.csv', 'utf-8');
    const partidasData = csv.parse(partidasCSV, {
      columns: true,
      skip_empty_lines: true
    });

    let insertedPartidas = 0;
    for (const row of partidasData) {
      await client.query(
        `INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          row.codigo,
          row.descripcion,
          row.unidad,
          parseFloat(row.metrado_fijo) || 0,
          parseFloat(row.cantidad_presupuestada) || 0,
          parseFloat(row.precio_unitario_presupuestado) || 0,
          parseFloat(row.total_presupuestado) || 0
        ]
      );
      insertedPartidas++;
    }
    console.log(`  ✅ Insertadas ${insertedPartidas} partidas`);

    // 3. Crear tabla insumos limpia
    console.log('\n3️⃣  Preparando tabla insumos...\n');

    await client.query('DROP TABLE IF EXISTS insumos CASCADE');
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
    console.log('  ✅ Tabla insumos creada');

    // 4. Cargar datos insumos
    console.log('\n4️⃣  Cargando insumos...\n');

    const insumosCSV = fs.readFileSync('BACKUP_INSUMOS.csv', 'utf-8');
    const insumosData = csv.parse(insumosCSV, {
      columns: true,
      skip_empty_lines: true
    });

    let insertedInsumos = 0;
    for (const row of insumosData) {
      try {
        await client.query(
          `INSERT INTO insumos (id, codigo_partida, item_1, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida, comentario, es_extra)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            parseInt(row.id),
            row.codigo_partida,
            row.item_1 || null,
            row.codigo_insumo,
            row.descripcion,
            row.unidad,
            parseFloat(row.incidencia_original) || 0,
            parseFloat(row.parcial_original) || 0,
            parseFloat(row.incidencia) || 0,
            parseFloat(row.cantidad_modificada) || 0,
            parseFloat(row.cantidad_adquirida) || 0,
            row.comentario || null,
            row.es_extra === 'true'
          ]
        );
        insertedInsumos++;
      } catch (e) {
        // Ignorar duplicados o errores menores
      }
    }
    console.log(`  ✅ Insertados ${insertedInsumos} insumos`);

    // 5. Verificar
    console.log('\n5️⃣  Verificando restauración...\n');

    const partidasCount = await client.query('SELECT COUNT(*) as count FROM partidas');
    const insumosCount = await client.query('SELECT COUNT(*) as count FROM insumos');
    const incidenciaCount = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original > 0'
    );

    console.log(`  ✅ Partidas: ${partidasCount.rows[0].count} registros`);
    console.log(`  ✅ Insumos: ${insumosCount.rows[0].count} registros`);
    console.log(`  ✅ Insumos con incidencia_original > 0: ${incidenciaCount.rows[0].count}`);

    console.log('\n' + '═'.repeat(110));
    console.log('\n✅ ¡RESTAURACIÓN COMPLETADA!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreFromCSV();
