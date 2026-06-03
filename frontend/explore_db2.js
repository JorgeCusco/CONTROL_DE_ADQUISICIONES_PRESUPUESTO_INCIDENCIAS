const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:SxucXihjIVEMUCAD@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  // Verificar columnas en acus para incidencias
  const resAcus = await client.query('SELECT codigo_insumo, cantidad_p, cantidad_c, unidad FROM acus LIMIT 5');
  console.log('acus:', resAcus.rows);

  // Verificar unidades en insumos_p
  const resInsumos = await client.query('SELECT codigo, descripcion, unidad FROM insumos_p LIMIT 5');
  console.log('insumos_p:', resInsumos.rows);
  
  await client.end();
}
run();
