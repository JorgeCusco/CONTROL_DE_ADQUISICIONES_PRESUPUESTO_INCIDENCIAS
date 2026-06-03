const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:SxucXihjIVEMUCAD@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  console.log('Fijando precios y parciales faltantes en la DB...');
  
  // Update null prices with original price
  await client.query(`
    UPDATE acus
    SET precio_c = precio_p
    WHERE precio_c IS NULL;
  `);

  // Update null parcial_c
  await client.query(`
    UPDATE acus
    SET parcial_c = ROUND((COALESCE(cantidad_c, cantidad_p) * COALESCE(precio_c, precio_p))::numeric, 2)
    WHERE parcial_c IS NULL OR parcial_c != ROUND((COALESCE(cantidad_c, cantidad_p) * COALESCE(precio_c, precio_p))::numeric, 2);
  `);
  
  console.log('Fijado con exito.');
  await client.end();
}
run();
