const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500'
});

async function verificarEsquemas() {
  const client = await pool.connect();

  try {
    console.log('📋 ESQUEMAS DE TABLAS\n');
    console.log('═'.repeat(150));

    const tablas = ['partidas', 'apus_detallado', 'insumos'];

    for (const tabla of tablas) {
      console.log(`\n🔍 TABLA: ${tabla}\n`);

      const result = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tabla]);

      if (result.rows.length === 0) {
        console.log(`   ⚠️  Tabla no existe\n`);
        continue;
      }

      result.rows.forEach((col, idx) => {
        const nullable = col.is_nullable === 'YES' ? '✓ nullable' : '✗ NOT NULL';
        const defaultVal = col.column_default ? ` = ${col.column_default}` : '';
        console.log(`   ${(idx + 1).toString().padStart(2)}. ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${nullable}${defaultVal}`);
      });
    }

    console.log('\n' + '═'.repeat(150));

  } finally {
    client.release();
    await pool.end();
  }
}

verificarEsquemas();
