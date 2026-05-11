const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500'
});

async function getStructure() {
  try {
    const client = await pool.connect();

    // Tabla partidas
    console.log('📋 ESTRUCTURA TABLA: partidas\n');
    const partRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'partidas'
      ORDER BY ordinal_position
    `);
    partRes.rows.forEach(r => {
      console.log(`  ${r.column_name.padEnd(25)} | ${r.data_type.padEnd(20)} | ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Tabla insumos
    console.log('\n\n📋 ESTRUCTURA TABLA: insumos\n');
    const insRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'insumos'
      ORDER BY ordinal_position
    `);
    insRes.rows.forEach(r => {
      console.log(`  ${r.column_name.padEnd(25)} | ${r.data_type.padEnd(20)} | ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Tabla apus_detallado
    console.log('\n\n📋 ESTRUCTURA TABLA: apus_detallado\n');
    const apuRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'apus_detallado'
      ORDER BY ordinal_position
    `);
    if (apuRes.rows.length === 0) {
      console.log('  ❌ Tabla no existe o está vacía');
    } else {
      apuRes.rows.forEach(r => {
        console.log(`  ${r.column_name.padEnd(25)} | ${r.data_type.padEnd(20)} | ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Tabla compras
    console.log('\n\n📋 ESTRUCTURA TABLA: compras\n');
    const compRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'compras'
      ORDER BY ordinal_position
    `);
    compRes.rows.forEach(r => {
      console.log(`  ${r.column_name.padEnd(25)} | ${r.data_type.padEnd(20)} | ${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    client.release();
  } catch (err) {
    console.error('Error:', err.message);
  }
  await pool.end();
}

getStructure();
