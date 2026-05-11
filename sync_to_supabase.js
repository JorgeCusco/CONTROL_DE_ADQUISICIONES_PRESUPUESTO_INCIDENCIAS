require('dotenv').config();
const { Pool } = require('pg');

// Pool local
const localPool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Pool Supabase
const supabasePool = new Pool({
  connectionString: process.env.SUPABASE_CONNECTION_STRING
});

async function sync() {
  try {
    console.log('🔄 SINCRONIZANDO A SUPABASE\n');

    // Test
    console.log('✓ Conectando a PostgreSQL local...');
    await localPool.query('SELECT 1');
    console.log('✓ Conectando a Supabase...');
    await supabasePool.query('SELECT 1');
    console.log('✓ Ambas conexiones OK\n');

    // Read from local
    console.log('📥 Leyendo datos de PostgreSQL local...');
    const { rows: partidas } = await localPool.query('SELECT * FROM partidas ORDER BY codigo');
    const { rows: insumos } = await localPool.query('SELECT * FROM insumos ORDER BY id');
    console.log(`✓ ${partidas.length} partidas leídas`);
    console.log(`✓ ${insumos.length} insumos leídos\n`);

    // Write to Supabase
    const client = await supabasePool.connect();
    try {
      await client.query('BEGIN');

      // Clear
      console.log('🧹 Limpiando Supabase...');
      await client.query('DELETE FROM insumos');
      await client.query('DELETE FROM partidas');
      console.log('✓ Limpado\n');

      // Insert partidas
      console.log('⏳ Subiendo partidas a Supabase...');
      for (const p of partidas) {
        await client.query(
          'INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo) VALUES ($1, $2, $3, $4)',
          [p.codigo, p.descripcion, p.unidad, p.metrado_fijo]
        );
      }
      console.log(`✓ ${partidas.length} partidas subidas\n`);

      // Insert insumos
      console.log('⏳ Subiendo insumos a Supabase...');
      for (let i = 0; i < insumos.length; i++) {
        const ins = insumos[i];
        await client.query(
          `INSERT INTO insumos
           (codigo_partida, item_1, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [ins.codigo_partida, ins.item_1, ins.codigo_insumo, ins.descripcion, ins.unidad, ins.incidencia_original, ins.parcial_original, ins.incidencia, ins.cantidad_modificada, ins.cantidad_adquirida]
        );
        if ((i + 1) % 1000 === 0) console.log(`  ✓ ${i + 1}/${insumos.length} insumos...`);
      }
      console.log(`✓ ${insumos.length} insumos subidos\n`);

      await client.query('COMMIT');
      console.log('✅ SINCRONIZACIÓN COMPLETADA\n');

      // Verify
      const { rows: [{ count: pCount }] } = await client.query('SELECT COUNT(*) FROM partidas');
      const { rows: [{ count: iCount }] } = await client.query('SELECT COUNT(*) FROM insumos');
      console.log('📊 SUPABASE:');
      console.log(`✓ ${pCount} partidas`);
      console.log(`✓ ${iCount} insumos`);

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
    await localPool.end();
    await supabasePool.end();
  }
}

sync();
