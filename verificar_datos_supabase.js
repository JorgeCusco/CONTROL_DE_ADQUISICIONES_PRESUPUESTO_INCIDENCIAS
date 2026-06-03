const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.lwuhsendnfwxenoryuzs',
  password: 'Jo.9839514500',
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres'
});

console.log('🔍 VERIFICANDO DATOS EN SUPABASE\n');
console.log('═'.repeat(150));

(async () => {
  try {
    const client = await pool.connect();

    // 1. Verificar tabla partidas
    console.log('\n1️⃣  TABLA PARTIDAS\n');
    const partRes = await client.query('SELECT COUNT(*) as total FROM partidas');
    console.log(`  Total registros: ${partRes.rows[0].total}`);
    if (partRes.rows[0].total > 0) {
      const sample = await client.query('SELECT * FROM partidas LIMIT 3');
      console.log('  Primeros 3:');
      sample.rows.forEach(row => {
        console.log(`    - ${row.codigo}: ${row.descripcion.substring(0, 50)}`);
      });
    }

    // 2. Verificar tabla apus_detallado
    console.log('\n2️⃣  TABLA APUS_DETALLADO\n');
    const apuRes = await client.query('SELECT COUNT(*) as total FROM apus_detallado');
    console.log(`  Total registros: ${apuRes.rows[0].total}`);
    if (apuRes.rows[0].total > 0) {
      const sample = await client.query('SELECT * FROM apus_detallado LIMIT 2');
      console.log('  Primeros 2:');
      sample.rows.forEach(row => {
        console.log(`    - [${row.partida_codigo}] ${row.partida_descripcion.substring(0, 40)} → ${row.insumo_codigo}: ${row.insumo_descripcion.substring(0, 40)}`);
      });
    }

    // 3. Verificar tabla insumos
    console.log('\n3️⃣  TABLA INSUMOS\n');
    const insRes = await client.query('SELECT COUNT(*) as total FROM insumos');
    console.log(`  Total registros: ${insRes.rows[0].total}`);

    // Contar cuántos tienen descripcion
    const descRes = await client.query('SELECT COUNT(*) as con_desc FROM insumos WHERE descripcion IS NOT NULL AND descripcion != \'\'');
    console.log(`  Con descripcion: ${descRes.rows[0].con_desc}`);

    // Obtener DISTINCT descripciones (lo que busca el buscador)
    const uniqueDescRes = await client.query('SELECT DISTINCT descripcion FROM insumos WHERE descripcion IS NOT NULL AND descripcion != \'\' ORDER BY descripcion LIMIT 20');
    console.log(`  Descripciones únicas (primeras 20):\n`);
    uniqueDescRes.rows.forEach((row, idx) => {
      console.log(`    ${(idx + 1).toString().padStart(2)}. ${row.descripcion}`);
    });

    // Primeros registros completos
    console.log('\n  Primeros 3 registros COMPLETOS:\n');
    const sample = await client.query('SELECT id, codigo_partida, codigo_insumo, descripcion, unidad, item_1 FROM insumos LIMIT 3');
    sample.rows.forEach((row, idx) => {
      console.log(`    ${idx + 1}. ID: ${row.id} | Partida: ${row.codigo_partida} | Insumo: ${row.codigo_insumo}`);
      console.log(`       Descripción: ${row.descripcion}`);
      console.log(`       Unidad: ${row.unidad} | item_1: ${row.item_1}\n`);
    });

    // 4. Resumo
    console.log('═'.repeat(150));
    console.log('\n📊 RESUMEN\n');
    console.log(`PARTIDAS: ${partRes.rows[0].total} registros ✓`);
    console.log(`APUS_DETALLADO: ${apuRes.rows[0].total} registros ${apuRes.rows[0].total > 0 ? '✓' : '❌'}`);
    console.log(`INSUMOS: ${insRes.rows[0].total} registros ${insRes.rows[0].total > 0 ? '✓' : '❌'}`);
    console.log(`  - Con descripcion: ${descRes.rows[0].con_desc} ${descRes.rows[0].con_desc > 0 ? '✓' : '❌'}\n`);

    if (uniqueDescRes.rows.length > 0) {
      console.log('✅ EL BUSCADOR DEBERÍA ENCONTRAR RESULTADOS\n');
    } else {
      console.log('❌ EL BUSCADOR NO ENCONTRARÁ RESULTADOS - Falta llenar descripcion\n');
    }

    client.release();
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
