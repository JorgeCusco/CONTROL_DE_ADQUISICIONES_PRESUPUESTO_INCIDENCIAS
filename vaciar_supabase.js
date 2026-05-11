const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function vaciarTablas() {
  const client = await pool.connect();
  try {
    console.log('🗑️  VACIANDO TODAS LAS TABLAS DE SUPABASE\n');
    console.log('═'.repeat(130));

    // Tablas a limpiar (en orden de dependencia)
    const tablas = [
      'mapeo_vinculacion',
      'historial_cambios',
      'compras',
      'insumos',
      'apus_detallado',
      'partidas'
    ];

    console.log('\n1️⃣  Eliminando registros...\n');

    for (const tabla of tablas) {
      try {
        const result = await client.query(`DELETE FROM ${tabla}`);
        console.log(`  ✅ ${tabla.padEnd(25)}: ${result.rowCount} registros eliminados`);
      } catch (e) {
        if (e.message.includes('does not exist')) {
          console.log(`  ⚠️  ${tabla.padEnd(25)}: tabla no existe`);
        } else {
          console.log(`  ❌ ${tabla.padEnd(25)}: error`);
        }
      }
    }

    console.log('\n2️⃣  Verificando estado...\n');

    for (const tabla of tablas) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${tabla}`);
        const count = result.rows[0].count;
        if (count === 0) {
          console.log(`  ✅ ${tabla.padEnd(25)}: VACÍA (${count} registros)`);
        } else {
          console.log(`  ⚠️  ${tabla.padEnd(25)}: aún tiene ${count} registros`);
        }
      } catch (e) {
        //
      }
    }

    console.log('\n' + '═'.repeat(130));
    console.log('\n✅ ¡TABLAS VACIADAS! Listo para subir nuevamente.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

vaciarTablas();
