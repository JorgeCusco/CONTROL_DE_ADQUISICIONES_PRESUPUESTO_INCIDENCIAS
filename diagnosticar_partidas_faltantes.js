const fs = require('fs');
const { Pool } = require('pg');

async function diagnosticar() {
  console.log('🔍 INVESTIGANDO PARTIDAS SIN DESCRIPCIÓN\n');
  console.log('═'.repeat(150));

  try {
    // 1. Extraer partidas desde SQL
    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');
    const sqlPartidas = new Set();

    const lines = sqlContent.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line.match(/^\('OE\./)) {
        const match = line.match(/^\('([^']+)'/);
        if (match) {
          sqlPartidas.add(match[1]);
        }
      }
    });

    console.log(`\n1️⃣  Partidas en INSERT_PARTIDAS.sql: ${sqlPartidas.size}\n`);
    console.log('  Ejemplos:');
    Array.from(sqlPartidas).slice(0, 5).forEach(p => console.log(`    - ${p}`));

    // 2. Leer partidas desde BD
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: '7_insumos_rado',
      user: 'postgres',
      password: 'Jo.9839514500'
    });

    const client = await pool.connect();

    const insumosRes = await client.query(`
      SELECT DISTINCT codigo_partida FROM insumos ORDER BY codigo_partida
    `);

    const bdPartidas = new Set(insumosRes.rows.map(r => r.codigo_partida));
    console.log(`\n\n2️⃣  Partidas en tabla insumos (BD): ${bdPartidas.size}\n`);
    console.log('  Ejemplos:');
    Array.from(bdPartidas).slice(0, 5).forEach(p => console.log(`    - ${p}`));

    // 3. Encontrar partidas sin descripción
    console.log(`\n\n3️⃣  ANÁLISIS DE INCOMPATIBILIDAD\n`);

    const enBdPeroNoEnSql = new Set([...bdPartidas].filter(p => !sqlPartidas.has(p)));
    const enSqlPeroNoEnBd = new Set([...sqlPartidas].filter(p => !bdPartidas.has(p)));
    const enAmbos = new Set([...bdPartidas].filter(p => sqlPartidas.has(p)));

    console.log(`  ✓ En AMBOS (tienen descripción): ${enAmbos.size}`);
    console.log(`  ❌ En BD pero NO en SQL (SIN descripción): ${enBdPeroNoEnSql.size}`);
    console.log(`  ⚠️  En SQL pero NO en BD (descripción "huérfana"): ${enSqlPeroNoEnBd.size}`);

    if (enBdPeroNoEnSql.size > 0) {
      console.log(`\n  PARTIDAS SIN DESCRIPCIÓN (en BD pero no en SQL):\n`);
      Array.from(enBdPeroNoEnSql).sort().slice(0, 20).forEach(p => {
        console.log(`    - ${p}`);
      });

      if (enBdPeroNoEnSql.size > 20) {
        console.log(`    ... y ${enBdPeroNoEnSql.size - 20} más\n`);
      }

      // Obtener sample de insumos de esas partidas
      console.log(`\n  EJEMPLO DE INSUMOS CON PARTIDA SIN DESCRIPCIÓN:\n`);
      const sample = Array.from(enBdPeroNoEnSql).slice(0, 3);

      for (const partida of sample) {
        const insRes = await client.query(
          `SELECT codigo_insumo, descripcion, incidencia_original FROM insumos WHERE codigo_partida = $1 LIMIT 2`,
          [partida]
        );
        console.log(`  Partida: ${partida}`);
        insRes.rows.forEach(r => {
          console.log(`    - Insumo: [${r.codigo_insumo}] ${r.descripcion} | incidencia: ${r.incidencia_original}`);
        });
        console.log();
      }
    }

    // 4. Verificar dónde vinieron esas partidas
    console.log(`\n═`.repeat(150));
    console.log(`\n🔎 ¿DE DÓNDE VINIERON ESAS PARTIDAS?\n`);

    const problema = Array.from(enBdPeroNoEnSql).slice(0, 1)[0];
    if (problema) {
      console.log(`Investigando: ${problema}\n`);

      const countRes = await client.query(
        `SELECT COUNT(*) as count FROM insumos WHERE codigo_partida = $1`,
        [problema]
      );

      console.log(`  Total insumos con esta partida: ${countRes.rows[0].count}`);
      console.log(`  Origen: PROBABLEMENTE de INSERT_INSUMOS.sql o carga anterior`);
      console.log(`  Estado: Estos insumos NO tienen partida_descripcion ni metrado_fijo`);
    }

    console.log(`\n\n═`.repeat(150));
    console.log(`\n📋 CONCLUSIÓN\n`);
    console.log(`Las ${enBdPeroNoEnSql.size} partidas sin descripción vinieron de:\n`);
    console.log(`1. INSERT_INSUMOS.sql (INSERT_APUS_DETALLADO.sql) ← Cargó insumos pero algunas partidas no están en INSERT_PARTIDAS.sql`);
    console.log(`2. No están en INSERT_PARTIDAS.sql porque quizá:`);
    console.log(`   - Son partidas que fueron añadidas al proyecto después`);
    console.log(`   - Son sub-partidas (O.E.X.X.X.X vs O.E.X.X.X)`);
    console.log(`   - El archivo PRESUPUESTO.xlsx no las incluye\n`);

    console.log(`SOLUCIONES:\n`);
    console.log(`1. Opción A: Ignorarlas (si son pocas y no críticas)`);
    console.log(`2. Opción B: Investigar en PRESUPUESTO.xlsx o APUS_DETALLADO.csv si existen`);
    console.log(`3. Opción C: Crear INSERT manual para esas partidas faltantes\n`);

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

diagnosticar();
