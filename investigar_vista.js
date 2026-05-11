const { Pool } = require('pg');
require('dotenv').config({ path: './frontend/.env' });
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
});
async function run() {
  console.log('🔍 Investigando insumos_resumen...');
  try {
    const res = await pool.query("SELECT view_definition FROM information_schema.views WHERE table_name = 'insumos_resumen'");
    if (res.rows.length > 0) {
      console.log('ES UNA VISTA. Definición:');
      console.log(res.rows[0].view_definition);
    } else {
      const resMat = await pool.query("SELECT definition FROM pg_matviews WHERE matviewname = 'insumos_resumen'");
      if (resMat.rows.length > 0) {
        console.log('ES UNA VISTA MATERIALIZADA. Definición:');
        console.log(resMat.rows[0].definition);
      } else {
        const resTab = await pool.query("SELECT table_type FROM information_schema.tables WHERE table_name = 'insumos_resumen'");
        console.log('ES UNA TABLA BASE. Tipo:', resTab.rows[0]?.table_type);
      }
    }
  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    pool.end();
  }
}
run();
