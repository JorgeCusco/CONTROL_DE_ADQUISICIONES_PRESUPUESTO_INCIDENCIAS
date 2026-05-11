const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function auditDataQuality() {
  const client = await pool.connect();
  try {
    console.log('🔎 AUDITORÍA DE CALIDAD DE DATOS - TABLA INSUMOS\n');
    console.log('═'.repeat(130));

    // 1. Valores NULL o 0 sospechosos
    console.log('\n❌ CAMPOS POTENCIALMENTE PROBLEMÁTICOS:\n');

    const nullCheck = await client.query(`
      SELECT
        COUNT(CASE WHEN codigo_partida IS NULL THEN 1 END) as null_codigo_partida,
        COUNT(CASE WHEN codigo_insumo IS NULL THEN 1 END) as null_codigo_insumo,
        COUNT(CASE WHEN descripcion IS NULL THEN 1 END) as null_descripcion,
        COUNT(CASE WHEN unidad IS NULL THEN 1 END) as null_unidad,
        COUNT(CASE WHEN incidencia_original IS NULL THEN 1 END) as null_incidencia,
        COUNT(CASE WHEN incidencia_original = 0 THEN 1 END) as zero_incidencia,
        COUNT(CASE WHEN parcial_original IS NULL THEN 1 END) as null_parcial,
        COUNT(CASE WHEN parcial_original = 0 THEN 1 END) as zero_parcial
      FROM insumos
    `);

    const nullStats = nullCheck.rows[0];
    console.log(`  • Código Partida NULL:           ${nullStats.null_codigo_partida}`);
    console.log(`  • Código Insumo NULL:            ${nullStats.null_codigo_insumo}`);
    console.log(`  • Descripción NULL:              ${nullStats.null_descripcion}`);
    console.log(`  • Unidad NULL:                   ${nullStats.null_unidad}`);
    console.log(`  • Incidencia Original NULL:      ${nullStats.null_incidencia}`);
    console.log(`  • Incidencia Original = 0:       ${nullStats.zero_incidencia}`);
    console.log(`  • Parcial Original NULL:         ${nullStats.null_parcial}`);
    console.log(`  • Parcial Original = 0:          ${nullStats.zero_parcial}`);

    // 2. Duplicados exactos
    console.log('\n' + '─'.repeat(130));
    console.log('\n🔄 DUPLICADOS DETECTADOS:\n');

    const duplicatesResult = await client.query(`
      SELECT
        codigo_partida,
        codigo_insumo,
        descripcion,
        unidad,
        COUNT(*) as repeticiones
      FROM insumos
      GROUP BY codigo_partida, codigo_insumo, descripcion, unidad
      HAVING COUNT(*) > 1
      ORDER BY repeticiones DESC
      LIMIT 20
    `);

    if (duplicatesResult.rows.length > 0) {
      console.log(`  Encontrados ${duplicatesResult.rows.length} grupos con duplicados:\n`);
      duplicatesResult.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. "${row.descripcion}"`);
        console.log(`     Partida: ${row.codigo_partida}, Código: ${row.codigo_insumo}, Unidad: ${row.unidad}`);
        console.log(`     ⚠️  Aparece ${row.repeticiones} veces`);
      });
    } else {
      console.log(`  ✅ No hay duplicados exactos`);
    }

    // 3. Inconsistencias de cálculo: parcial_original should = incidencia_original * metrado_fijo
    console.log('\n' + '─'.repeat(130));
    console.log('\n⚖️ VALIDACIÓN DE CÁLCULOS (parcial_original vs incidencia_original × metrado_fijo):\n');

    const calcCheck = await client.query(`
      SELECT
        i.id,
        i.descripcion,
        i.codigo_partida,
        i.incidencia_original,
        i.parcial_original,
        p.metrado_fijo,
        ROUND(i.incidencia_original * p.metrado_fijo, 4) as expected_parcial,
        CASE
          WHEN ABS(i.parcial_original - ROUND(i.incidencia_original * p.metrado_fijo, 4)) > 0.01
          THEN 'INCONSISTENTE'
          ELSE 'OK'
        END as estado
      FROM insumos i
      JOIN partidas p ON i.codigo_partida = p.codigo
      WHERE ABS(i.parcial_original - ROUND(i.incidencia_original * p.metrado_fijo, 4)) > 0.01
      LIMIT 20
    `);

    if (calcCheck.rows.length > 0) {
      console.log(`  ⚠️  Encontradas ${calcCheck.rows.length} inconsistencias en cálculos:\n`);
      calcCheck.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. "${row.descripcion}"`);
        console.log(`     Esperado: ${row.expected_parcial}, Real: ${row.parcial_original}`);
        console.log(`     Diferencia: ${Math.abs(row.parcial_original - row.expected_parcial)}`);
      });
    } else {
      console.log(`  ✅ Todos los cálculos de parcial_original son consistentes`);
    }

    // 4. Descripciones vacías o sospechosas
    console.log('\n' + '─'.repeat(130));
    console.log('\n📝 DESCRIPCIONES SOSPECHOSAS:\n');

    const descCheck = await client.query(`
      SELECT
        id,
        descripcion,
        LENGTH(TRIM(descripcion)) as longitud,
        COUNT(*) as repeticiones
      FROM insumos
      WHERE TRIM(descripcion) = ''
         OR descripcion LIKE '%null%'
         OR descripcion LIKE '%n/a%'
         OR descripcion LIKE '%sin info%'
      GROUP BY id, descripcion
      LIMIT 10
    `);

    if (descCheck.rows.length > 0) {
      console.log(`  ⚠️  Encontradas descripciones sospechosas:\n`);
      descCheck.rows.forEach((row, idx) => {
        console.log(`  ${idx + 1}. Descripción: "${row.descripcion}" (${row.longitud} caracteres)`);
      });
    } else {
      console.log(`  ✅ No hay descripciones vacías o sospechosas`);
    }

    // 5. Resumen de tablas relacionadas
    console.log('\n' + '═'.repeat(130));
    console.log('\n📊 RESUMEN DE TABLAS RELACIONADAS:\n');

    const partidasCount = await client.query('SELECT COUNT(*) as count FROM partidas');
    const insumosDupCheck = await client.query(`
      SELECT COUNT(DISTINCT codigo_insumo) as unique_insumos FROM insumos
    `);

    console.log(`  • Partidas en BD:                ${partidasCount.rows[0].count}`);
    console.log(`  • Insumos totales:               6084`);
    console.log(`  • Insumos únicos (por código):   ${insumosDupCheck.rows[0].unique_insumos}`);

    console.log('\n' + '═'.repeat(130));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

auditDataQuality();
