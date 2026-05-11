const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function restoreFromCSV() {
  const client = await pool.connect();
  try {
    console.log('🔄 RESTAURANDO DESDE RESPALDOS CSV (Método Robusto)\n');
    console.log('═'.repeat(110));

    // 1. Partidas
    console.log('\n1️⃣  Cargando BACKUP_PARTIDAS.csv...\n');

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

    const partidasFile = fs.readFileSync('BACKUP_PARTIDAS.csv', 'utf-8');
    const partidasLines = partidasFile.split('\n').slice(1).filter(l => l.trim());

    let insertedPartidas = 0;
    for (const line of partidasLines) {
      const parts = line.split('\t');
      if (parts.length >= 7) {
        try {
          await client.query(
            `INSERT INTO partidas VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              parts[0].trim(),
              parts[1].replace(/^"|"$/g, '').trim(),
              parts[2].trim(),
              parseFloat(parts[3]) || 0,
              parseFloat(parts[4]) || 0,
              parseFloat(parts[5]) || 0,
              parseFloat(parts[6]) || 0
            ]
          );
          insertedPartidas++;
        } catch (e) {
          // Ignorar errores
        }
      }
    }
    console.log(`  ✅ Insertadas ${insertedPartidas} partidas`);

    // 2. Insumos
    console.log('\n2️⃣  Cargando BACKUP_INSUMOS.csv...\n');

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

    const insumosFile = fs.readFileSync('BACKUP_INSUMOS.csv', 'utf-8');
    const insumosLines = insumosFile.split('\n').slice(1).filter(l => l.trim());

    let insertedInsumos = 0;
    let errors = 0;

    for (const line of insumosLines) {
      const parts = line.split('\t');
      if (parts.length >= 13) {
        try {
          await client.query(
            `INSERT INTO insumos VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              parseInt(parts[0]),
              parts[1].trim(),
              parts[2].trim() || null,
              parts[3].trim(),
              parts[4].replace(/^"|"$/g, '').trim(),
              parts[5].replace(/^"|"$/g, '').trim(),
              parseFloat(parts[6]) || 0,
              parseFloat(parts[7]) || 0,
              parseFloat(parts[8]) || 0,
              parseFloat(parts[9]) || 0,
              parseFloat(parts[10]) || 0,
              parts[11].trim() || null,
              parts[12].trim() === 'true'
            ]
          );
          insertedInsumos++;
        } catch (e) {
          errors++;
        }
      }
    }
    console.log(`  ✅ Insertados ${insertedInsumos} insumos`);
    if (errors > 0) {
      console.log(`  ⚠️  Errores ignorados: ${errors}`);
    }

    // 3. Verificar
    console.log('\n3️⃣  Verificando restauración...\n');

    const partidasCheck = await client.query('SELECT COUNT(*) as count FROM partidas');
    const insumosCheck = await client.query('SELECT COUNT(*) as count FROM insumos');
    const incidenciaCheck = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original > 0'
    );
    const incidenciaZeroCheck = await client.query(
      'SELECT COUNT(*) as count FROM insumos WHERE incidencia_original = 0'
    );

    console.log(`  📊 Partidas: ${partidasCheck.rows[0].count}`);
    console.log(`  📊 Insumos totales: ${insumosCheck.rows[0].count}`);
    console.log(`  ✅ Insumos CON incidencia_original > 0: ${incidenciaCheck.rows[0].count}`);
    console.log(`  ⚠️  Insumos CON incidencia_original = 0: ${incidenciaZeroCheck.rows[0].count}`);

    console.log('\n' + '═'.repeat(110));
    console.log('\n✅ ¡RESTAURACIÓN COMPLETADA!\n');

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreFromCSV();
