require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function check() {
  const client = await pool.connect();
  try {
    // Get table structure
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'insumos'
      ORDER BY ordinal_position
    `);

    console.log('Insumos table schema:');
    schema.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    // Get one complete row
    const sample = await client.query(`
      SELECT *
      FROM insumos
      WHERE id = 42609
    `);

    console.log('\nSample row (id=42609):');
    const row = sample.rows[0];
    Object.keys(row).forEach(key => {
      console.log(`  ${key}: "${row[key]}"`);
    });

  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
