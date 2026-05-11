const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function checkFreeInsumos() {
  const client = await pool.connect();
  try {
    console.log('Consultando insumos sin incidencia_original...\n');

    // Insumos sin incidencia_original
    const result = await client.query(`
      SELECT
        id,
        codigo_partida,
        codigo_insumo,
        descripcion,
        unidad,
        incidencia_original
      FROM insumos
      WHERE incidencia_original IS NULL
      ORDER BY codigo_partida, descripcion
    `);

    const freeInsumos = result.rows;
    console.log(`📋 TOTAL DE INSUMOS SIN incidencia_original: ${freeInsumos.length}`);
    console.log('─'.repeat(120));

    // Agrupar por descripción para ver duplicados
    const byDescription = {};
    freeInsumos.forEach(insumo => {
      if (!byDescription[insumo.descripcion]) {
        byDescription[insumo.descripcion] = [];
      }
      byDescription[insumo.descripcion].push(insumo);
    });

    const uniqueCount = Object.keys(byDescription).length;
    console.log(`\n📊 Insumos únicos (por descripción): ${uniqueCount}`);
    console.log(`📌 Registros totales con duplicados: ${freeInsumos.length}`);
    console.log(`   Promedio: ${(freeInsumos.length / uniqueCount).toFixed(2)} registros por insumo\n`);

    // Mostrar primeros 40 únicos
    const unique = Object.keys(byDescription).slice(0, 40);
    console.log(`Mostrando primeros ${Math.min(40, uniqueCount)} insumos únicos:\n`);

    unique.forEach((desc, idx) => {
      const records = byDescription[desc];
      console.log(`${idx + 1}. ${desc}`);
      console.log(`   Unidad: ${records[0].unidad}`);
      console.log(`   Aparece en ${records.length} partida(s)`);
      console.log();
    });

    if (uniqueCount > 40) {
      console.log(`... y ${uniqueCount - 40} más\n`);
    }

    // Resumen por unidad
    console.log('\n' + '─'.repeat(120));
    console.log('RESUMEN POR UNIDAD:\n');

    const byUnit = {};
    freeInsumos.forEach(insumo => {
      byUnit[insumo.unidad] = (byUnit[insumo.unidad] || 0) + 1;
    });

    Object.entries(byUnit)
      .sort((a, b) => b[1] - a[1])
      .forEach(([unit, count]) => {
        console.log(`  ${unit.padEnd(15)} : ${count} registros`);
      });

    console.log(`\n💾 Total general: ${freeInsumos.length} registros sin incidencia_original`);

    // Exportar a CSV
    const csv = ['id,codigo_partida,codigo_insumo,descripcion,unidad'];
    freeInsumos.forEach(insumo => {
      csv.push(`${insumo.id},"${insumo.codigo_partida || ''}","${insumo.codigo_insumo || ''}","${insumo.descripcion}","${insumo.unidad}"`);
    });

    const fs = require('fs');
    fs.writeFileSync('INSUMOS_LIBRES.csv', csv.join('\n'));
    console.log(`\n✅ Guardado en INSUMOS_LIBRES.csv`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkFreeInsumos();
