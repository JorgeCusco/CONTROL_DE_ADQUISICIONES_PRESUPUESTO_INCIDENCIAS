const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function restoreBackup() {
  const client = await pool.connect();
  try {
    console.log('🔄 INICIANDO RESTAURACIÓN DE RESPALDO...\n');
    console.log('═'.repeat(100));

    // Paso 1: Vaciar tablas
    console.log('\n1️⃣  Vaciando tablas actuales...\n');

    const tablesToClear = [
      'mapeo_vinculacion',
      'historial_cambios',
      'insumos',
      'partidas',
      'apus_detallado',
      'compras'
    ];

    for (const table of tablesToClear) {
      try {
        await client.query(`DELETE FROM ${table}`);
        console.log(`  ✅ Limpiada: ${table}`);
      } catch (e) {
        console.log(`  ⚠️  ${table} no existe o error: ${e.message.split('\n')[0]}`);
      }
    }

    // Paso 2: Leer y ejecutar SQL dump
    console.log('\n2️⃣  Leyendo archivo de respaldo SQL...\n');

    const sqlFile = 'BACKUP_DATA.sql';
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`❌ Archivo no encontrado: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    console.log(`  ✅ Archivo leído (${(sqlContent.length / 1024).toFixed(2)} KB)`);

    // Paso 3: Ejecutar SQL
    console.log('\n3️⃣  Restaurando datos...\n');

    // Dividir por punto y coma y ejecutar cada comando
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`  📋 Total de comandos SQL: ${statements.length}`);

    let executed = 0;
    for (const statement of statements) {
      try {
        await client.query(statement);
        executed++;
      } catch (e) {
        console.error(`  ❌ Error ejecutando: ${statement.substring(0, 50)}...`);
        console.error(`     ${e.message.split('\n')[0]}`);
      }
    }

    console.log(`  ✅ Comandos ejecutados: ${executed}/${statements.length}`);

    // Paso 4: Verificar
    console.log('\n4️⃣  Verificando restauración...\n');

    const verifyQueries = [
      { table: 'partidas', name: 'Partidas' },
      { table: 'insumos', name: 'Insumos' },
      { table: 'compras', name: 'Compras' },
      { table: 'mapeo_vinculacion', name: 'Vínculos' }
    ];

    for (const { table, name } of verifyQueries) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`  ✅ ${name.padEnd(20)}: ${count} registros`);
      } catch (e) {
        console.log(`  ❌ ${name.padEnd(20)}: Error`);
      }
    }

    console.log('\n' + '═'.repeat(100));
    console.log('\n✅ ¡RESTAURACIÓN COMPLETADA!\n');

  } catch (error) {
    console.error('❌ Error durante restauración:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

restoreBackup();
