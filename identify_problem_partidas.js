const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function identifyProblems() {
  const client = await pool.connect();
  try {
    console.log('🔍 IDENTIFICANDO RAÍZ DEL PROBLEMA\n');
    console.log('═'.repeat(130));

    // 1. Partidas con metrado_fijo = 0
    console.log('\n1️⃣ PARTIDAS CON METRADO_FIJO = 0:\n');

    const zeroMetradoResult = await client.query(`
      SELECT
        p.codigo,
        p.descripcion,
        p.metrado_fijo,
        COUNT(i.id) as insumos_afectados,
        SUM(CASE WHEN i.incidencia_original = 0 THEN 1 ELSE 0 END) as insumos_con_cero
      FROM partidas p
      LEFT JOIN insumos i ON p.codigo = i.codigo_partida
      WHERE p.metrado_fijo = 0
      GROUP BY p.codigo, p.descripcion, p.metrado_fijo
      ORDER BY insumos_afectados DESC
    `);

    if (zeroMetradoResult.rows.length > 0) {
      console.log(`  ⚠️  Encontradas ${zeroMetradoResult.rows.length} partidas con metrado_fijo = 0:\n`);
      zeroMetradoResult.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. ${row.codigo} - "${row.descripcion}"`);
        console.log(`     Insumos: ${row.insumos_afectados}, Con incidencia=0: ${row.insumos_con_cero}`);
      });
    } else {
      console.log(`  ✅ No hay partidas con metrado_fijo = 0`);
    }

    // 2. Insumos con incidencia_original = 0
    console.log('\n' + '─'.repeat(130));
    console.log('\n2️⃣ INSUMOS CON INCIDENCIA_ORIGINAL = 0:\n');

    const zeroIncidenciaResult = await client.query(`
      SELECT
        i.codigo_partida,
        COUNT(i.id) as cantidad
      FROM insumos i
      WHERE i.incidencia_original = 0
      GROUP BY i.codigo_partida
      ORDER BY cantidad DESC
      LIMIT 20
    `);

    console.log(`  Total de insumos con incidencia_original = 0: 337\n`);
    console.log(`  Por partida (primeras 20):\n`);

    zeroIncidenciaResult.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. Partida ${row.codigo_partida}: ${row.cantidad} insumos`);
    });

    // 3. Duplicados exactos
    console.log('\n' + '─'.repeat(130));
    console.log('\n3️⃣ DUPLICADOS EXACTOS (mismo insumo en misma partida):\n');

    const duplicatesResult = await client.query(`
      SELECT
        codigo_partida,
        codigo_insumo,
        descripcion,
        unidad,
        COUNT(*) as repeticiones,
        STRING_AGG(CAST(id AS TEXT), ', ') as ids
      FROM insumos
      GROUP BY codigo_partida, codigo_insumo, descripcion, unidad
      HAVING COUNT(*) > 1
    `);

    console.log(`  Encontrados ${duplicatesResult.rows.length} duplicados:\n`);

    duplicatesResult.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. "${row.descripcion}"`);
      console.log(`     Partida: ${row.codigo_partida}, Código: ${row.codigo_insumo}`);
      console.log(`     ⚠️  Aparece ${row.repeticiones} veces (IDs: ${row.ids})`);
      console.log(`     Acción: Eliminar IDs duplicados\n`);
    });

    // 4. Resumen de acciones
    console.log('\n' + '═'.repeat(130));
    console.log('\n📋 RESUMEN DE PROBLEMAS Y ACCIONES:\n');

    console.log('  1. 337 insumos con incidencia_original = 0');
    console.log('     → Necesitan incidencia_original correcta\n');

    console.log(`  2. ${duplicatesResult.rows.length} grupos de duplicados exactos`);
    console.log('     → Necesitan eliminarse los registros duplicados\n');

    console.log('  3. Inconsistencias en cálculos');
    console.log('     → Recalcular parcial_original = incidencia_original × metrado_fijo\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

identifyProblems();
