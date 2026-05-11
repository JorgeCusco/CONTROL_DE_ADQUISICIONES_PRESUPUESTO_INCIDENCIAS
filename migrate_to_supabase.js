const { Pool } = require('pg');

// Conexión a PostgreSQL Local (origen)
const localPool = new Pool({
  user: 'postgres',
  password: 'Jo.9839514500',
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado'
});

// Conexión a Supabase (destino)
const supabasePool = new Pool({
  user: 'postgres.lwuhsendnfwxenoryuzs',
  password: 'Jo.9839514500',
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres'
});

async function migrate() {
  try {
    console.log('🔄 INICIANDO MIGRACIÓN A SUPABASE\n');

    // Test connections
    console.log('🧪 Verificando conexiones...');
    const localTest = await localPool.query('SELECT 1');
    const supabaseTest = await supabasePool.query('SELECT 1');
    console.log('✓ Conexión local OK');
    console.log('✓ Conexión Supabase OK\n');

    // Get data from local
    console.log('📥 Leyendo datos de PostgreSQL local...');
    const partidasResult = await localPool.query('SELECT * FROM partidas ORDER BY codigo');
    const insumosResult = await localPool.query('SELECT * FROM insumos ORDER BY id');

    const partidas = partidasResult.rows;
    const insumos = insumosResult.rows;

    console.log(`✓ ${partidas.length} partidas`);
    console.log(`✓ ${insumos.length} insumos\n`);

    // Migrate to Supabase
    const supabaseClient = await supabasePool.connect();
    try {
      await supabaseClient.query('BEGIN');

      // Clear existing data
      console.log('🧹 Limpiando datos en Supabase...');
      await supabaseClient.query('DELETE FROM insumos');
      await supabaseClient.query('DELETE FROM partidas');
      console.log('✓ Tablas limpiadas\n');

      // Insert partidas
      console.log('⏳ Insertando partidas a Supabase...');
      let partidaCount = 0;

      for (const partida of partidas) {
        await supabaseClient.query(
          `INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (codigo) DO UPDATE SET descripcion=$2, unidad=$3, metrado_fijo=$4`,
          [
            partida.codigo,
            partida.descripcion || null,
            partida.unidad || null,
            partida.metrado_fijo || null
          ]
        );
        partidaCount++;
      }
      console.log(`✓ ${partidaCount} partidas insertadas\n`);

      // Insert insumos
      console.log('⏳ Insertando insumos a Supabase...');
      let insumoCount = 0;

      for (const insumo of insumos) {
        await supabaseClient.query(
          `INSERT INTO insumos
           (codigo_partida, item_1, codigo_insumo, descripcion, unidad,
            incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            insumo.codigo_partida,
            insumo.item_1 || null,
            insumo.codigo_insumo,
            insumo.descripcion,
            insumo.unidad || null,
            insumo.incidencia_original || 0,
            insumo.parcial_original || 0,
            insumo.incidencia || 0,
            insumo.cantidad_modificada || 0,
            insumo.cantidad_adquirida || 0
          ]
        );
        insumoCount++;

        if (insumoCount % 500 === 0) {
          console.log(`  ✓ ${insumoCount} insumos insertados...`);
        }
      }

      console.log(`✓ ${insumoCount} insumos insertados\n`);

      await supabaseClient.query('COMMIT');
      console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');

      // Verify
      const supabasePartidas = await supabaseClient.query('SELECT COUNT(*) FROM partidas');
      const supabaseInsumos = await supabaseClient.query('SELECT COUNT(*) FROM insumos');

      console.log('📊 VERIFICACIÓN EN SUPABASE:');
      console.log(`✓ Partidas: ${supabasePartidas.rows[0].count}`);
      console.log(`✓ Insumos: ${supabaseInsumos.rows[0].count}`);

    } catch (error) {
      await supabaseClient.query('ROLLBACK');
      throw error;
    } finally {
      supabaseClient.release();
    }

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

migrate();
