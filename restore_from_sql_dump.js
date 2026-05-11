const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function restoreFromDump() {
  const client = await pool.connect();
  try {
    console.log('🔄 RESTAURANDO DESDE: local_backup.sql (28 Abril)\n');
    console.log('═'.repeat(110));

    // Paso 1: Limpiar tablas
    console.log('\n1️⃣  Limpiando tablas actuales...\n');

    const tablesToDrop = [
      'mapeo_vinculacion',
      'historial_cambios',
      'compras',
      'insumos',
      'partidas',
      'apus_detallado'
    ];

    for (const table of tablesToDrop) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`  ✅ Eliminada: ${table}`);
      } catch (e) {
        console.log(`  ⚠️  ${table}: ${e.message.split('\n')[0]}`);
      }
    }

    // Paso 2: Leer SQL dump
    console.log('\n2️⃣  Leyendo SQL dump...\n');

    const sqlFile = 'local_backup.sql';
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`❌ Archivo no encontrado: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    console.log(`  ✅ Archivo leído: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);

    // Paso 3: Parsear y ejecutar comandos
    console.log('\n3️⃣  Restaurando estructura y datos...\n');

    // Filtrar comentarios y comandos vacíos
    const lines = sqlContent.split('\n');
    let currentStatement = '';
    let statementCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      // Saltar comentarios
      if (line.trim().startsWith('--') || line.trim().startsWith('\\')) {
        continue;
      }

      currentStatement += line + '\n';

      // Ejecutar cuando encuentra ;
      if (line.includes(';')) {
        const statement = currentStatement.trim();
        if (statement.length > 0 && !statement.startsWith('--')) {
          try {
            await client.query(statement);
            statementCount++;
            if (statementCount % 100 === 0) {
              console.log(`  📍 ${statementCount} comandos ejecutados...`);
            }
          } catch (e) {
            errorCount++;
            if (errorCount <= 5) {
              console.log(`  ⚠️  Error (${errorCount}): ${e.message.split('\n')[0].substring(0, 80)}`);
            }
          }
        }
        currentStatement = '';
      }
    }

    console.log(`\n  ✅ Total ejecutados: ${statementCount}`);
    console.log(`  ⚠️  Total errores: ${errorCount}`);

    // Paso 4: Verificar
    console.log('\n4️⃣  Verificando restauración...\n');

    const verifyQueries = [
      { table: 'partidas', name: 'Partidas' },
      { table: 'insumos', name: 'Insumos' },
      { table: 'compras', name: 'Compras' },
      { table: 'mapeo_vinculacion', name: 'Vínculos' }
    ];

    console.log('  Conteo de registros:\n');
    let totalRecords = 0;

    for (const { table, name } of verifyQueries) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        totalRecords += count;
        console.log(`  ✅ ${name.padEnd(20)}: ${count.toLocaleString('es-ES')} registros`);
      } catch (e) {
        console.log(`  ❌ ${name.padEnd(20)}: Tabla no existe`);
      }
    }

    // Verificar incidencia_original
    console.log('\n  Validación de calidad:\n');

    try {
      const incidenceCheck = await client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN incidencia_original IS NOT NULL THEN 1 END) as with_incidencia,
          COUNT(CASE WHEN incidencia_original = 0 THEN 1 END) as zero_incidencia
        FROM insumos
      `);

      const stats = incidenceCheck.rows[0];
      console.log(`  ✅ Total insumos: ${stats.total}`);
      console.log(`  ✅ Con incidencia_original: ${stats.with_incidencia}`);
      console.log(`  ⚠️  Con incidencia = 0: ${stats.zero_incidencia}`);

    } catch (e) {
      console.log(`  ⚠️  No se pudo verificar insumos`);
    }

    console.log('\n' + '═'.repeat(110));
    console.log('\n✅ ¡RESTAURACIÓN COMPLETADA!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreFromDump();
