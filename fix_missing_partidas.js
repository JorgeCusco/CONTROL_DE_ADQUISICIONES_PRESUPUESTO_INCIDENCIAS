const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: './frontend/.env' });
const csv = require('csv-parse/sync');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
});

async function run() {
  try {
    const apusContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
    const apusCSV = csv.parse(apusContent, { columns: true, skip_empty_lines: true });
    
    const res = await pool.query('SELECT DISTINCT a.item_partida FROM acus a LEFT JOIN partidas_p p ON a.item_partida = p.item WHERE p.item IS NULL');
    const missing = res.rows.map(r => r.item_partida);
    console.log('Missing items in DB:', missing.length);
    let count = 0;
    
    if (missing.length > 0) {
      for (const m of missing) {
        const aCSV = apusCSV.find(a => a.partida_codigo === m || a.partida_codigo === m.replace('OE.', 'O.E.'));
        if(aCSV) {
            let precio = parseFloat(aCSV.partida_costo_unitario);
            if (isNaN(precio)) precio = 0;
            
            try {
                await pool.query('INSERT INTO partidas_p (item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p) VALUES ($1, $2, $3, $4, $5, $6)',
                [m, aCSV.partida_descripcion, aCSV.partida_unidad, 0, precio, 0]);
                count++;
            } catch (err) {
                console.error('Error inserting', m, err.message);
                break;
            }
        }
      }
      console.log('✅ Missing partidas inserted: ' + count);
    }
  } catch(e) { console.error(e); } finally { pool.end(); }
}
run();
