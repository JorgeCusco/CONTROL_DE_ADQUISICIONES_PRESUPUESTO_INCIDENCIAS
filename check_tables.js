const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500'
});

async function checkTables() {
  console.log('📊 EVALUANDO ESTADO DE TABLAS EN POSTGRESQL\n');
  console.log('═'.repeat(150));

  try {
    const client = await pool.connect();

    // Obtener todas las tablas
    const tablesRes = await client.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `);

    const tables = ['partidas', 'insumos', 'compras', 'apus_detallado', 'mapeo_vinculacion', 'historial_cambios'];
    
    const status = {};
    
    for (const table of tables) {
      try {
        const countRes = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(countRes.rows[0].count);
        
        const sampleRes = await client.query(`SELECT * FROM ${table} LIMIT 2`);
        
        status[table] = {
          count: count,
          exists: true,
          sample: sampleRes.rows[0],
          columns: Object.keys(sampleRes.rows[0] || {})
        };
      } catch (e) {
        status[table] = {
          count: 0,
          exists: false,
          error: e.message
        };
      }
    }

    // Mostrar resultados
    console.log('\n1️⃣  TABLA: partidas\n');
    if (status.partidas.exists) {
      console.log(`  ✓ Total registros: ${status.partidas.count}`);
      if (status.partidas.sample) {
        const s = status.partidas.sample;
        console.log(`  ✓ Sample: [${s.codigo}] ${s.descripcion?.substring(0,40)} | metrado: ${s.metrado_fijo}`);
      }
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.partidas.error}`);
    }

    console.log('\n2️⃣  TABLA: insumos\n');
    if (status.insumos.exists) {
      console.log(`  ✓ Total registros: ${status.insumos.count}`);
      if (status.insumos.sample) {
        const s = status.insumos.sample;
        console.log(`  ✓ Sample: Part:[${s.codigo_partida}] Insumo:[${s.codigo_insumo}] | incidencia_orig: ${s.incidencia_original}`);
      }
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.insumos.error}`);
    }

    console.log('\n3️⃣  TABLA: apus_detallado\n');
    if (status.apus_detallado.exists) {
      console.log(`  ✓ Total registros: ${status.apus_detallado.count}`);
      if (status.apus_detallado.sample) {
        const s = status.apus_detallado.sample;
        console.log(`  ✓ Sample: [${s.partida_codigo}] Insumo:[${s.insumo_codigo}] (${s.tipo_insumo})`);
      }
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.apus_detallado.error}`);
    }

    console.log('\n4️⃣  TABLA: compras\n');
    if (status.compras.exists) {
      console.log(`  ✓ Total registros: ${status.compras.count}`);
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.compras.error}`);
    }

    console.log('\n5️⃣  TABLA: mapeo_vinculacion\n');
    if (status.mapeo_vinculacion.exists) {
      console.log(`  ✓ Total registros: ${status.mapeo_vinculacion.count}`);
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.mapeo_vinculacion.error}`);
    }

    console.log('\n6️⃣  TABLA: historial_cambios\n');
    if (status.historial_cambios.exists) {
      console.log(`  ✓ Total registros: ${status.historial_cambios.count}`);
    } else {
      console.log(`  ✗ Tabla no existe o error: ${status.historial_cambios.error}`);
    }

    // ANÁLISIS
    console.log('\n' + '═'.repeat(150));
    console.log('\n🎯 EVALUACIÓN FINAL\n');

    const criticalTables = ['partidas', 'insumos', 'apus_detallado'];
    const allCriticalOk = criticalTables.every(t => status[t].exists && status[t].count > 0);

    if (allCriticalOk) {
      console.log('✅ EXCELENTE - Tus tablas están LISTAS para usar\n');
      console.log('   Tabla                 Registros    Estado');
      console.log('   ─'.repeat(50));
      console.log(`   partidas              ${status.partidas.count.toString().padEnd(12)} ✓`);
      console.log(`   insumos               ${status.insumos.count.toString().padEnd(12)} ✓`);
      console.log(`   apus_detallado        ${status.apus_detallado.count.toString().padEnd(12)} ✓`);
      console.log(`   compras               ${status.compras.count.toString().padEnd(12)} ${status.compras.exists ? '✓' : '⚠️ (opcional)'}`);
      console.log('\n   👉 El sistema está completamente cargado y OPERATIVO\n');
    } else {
      console.log('❌ INCOMPLETO - Faltan datos críticos\n');
      console.log('   Tabla                 Registros    Estado');
      console.log('   ─'.repeat(50));
      console.log(`   partidas              ${status.partidas.count || '✗'}        ${status.partidas.exists && status.partidas.count > 0 ? '✓' : '❌ FALTA'}`);
      console.log(`   insumos               ${status.insumos.count || '✗'}        ${status.insumos.exists && status.insumos.count > 0 ? '✓' : '❌ FALTA'}`);
      console.log(`   apus_detallado        ${status.apus_detallado.count || '✗'}        ${status.apus_detallado.exists && status.apus_detallado.count > 0 ? '✓' : '❌ FALTA'}`);
      console.log('\n   👉 Necesitas ejecutar los SQL INSERT en tu base de datos\n');
    }

    client.release();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n⚠️ No se pudo conectar a PostgreSQL');
    console.log('   Verifica que:');
    console.log('   1. PostgreSQL esté corriendo en localhost:5432');
    console.log('   2. La base de datos 7_insumos_rado exista');
    console.log('   3. Las credenciales sean correctas (user: postgres)');
  }

  await pool.end();
}

checkTables();
