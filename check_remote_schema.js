require('dotenv').config();
const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'apus_detallado'
      ORDER BY ordinal_position
    `);
    console.log('Schema for apus_detallado:');
    res.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type}`);
    });
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await client.end();
  }
}

checkSchema();
