const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:SxucXihjIVEMUCAD@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query('SELECT item_partida, codigo_insumo, descripcion_insumo, unidad, cantidad_p, precio_p, parcial_p FROM acus LIMIT 10');
  console.log('acus sample:', res.rows);
  
  await client.end();
}
run();
