const fs = require('fs');
const { parse } = require('csv-parse/sync');
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
  console.log('🔄 Iniciando carga de COMPRAS_C...');
  const file = fs.readFileSync('DATA_LAST/TABLAS_FINAL_BOM/COMPRAS_C.csv', 'utf8').replace(/^\uFEFF/, '');
  const records = parse(file, { columns: true, skip_empty_lines: true });

  const client = await pool.connect();
  try {
    console.log('🗑️ Vaciando tablas en Supabase...');
    await client.query('DELETE FROM mapeo_vinculacion');
    await client.query('DELETE FROM compras_c');
    console.log('  ✓ Tablas vaciadas.');

    const batchSize = 100;
    let count = 0;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];
      
      batch.forEach((r, idx) => {
        const cant = parseFloat(r.cantidad) || 0;
        const pu = parseFloat(r.precio_unit) || 0;
        const total = cant * pu;
        const base = idx * 13;
        
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13})`);
        
        values.push(
          r.anio || '2024',
          r.componente || null,
          r.detalle || null,
          r.unidad || 'UND',
          cant,
          pu,
          total,
          r.unidad || 'UND',
          cant,
          pu,
          r.tipo_compra || null,
          r.num_compra || null,
          r.completo || null
        );
      });

      await client.query(`
        INSERT INTO compras_c (
          anio, componente, detalle, 
          unidad, cantidad_c, precio_unit_c, total_c,
          unidad_und, cantidad_und, precio_und,
          tipo_compra, num_compra, completo
        ) VALUES ${placeholders.join(', ')}
      `, values);
      
      count += batch.length;
      console.log(`  ⏳ Insertados ${count} / ${records.length} registros...`);
    }
    
    console.log(`✅ ¡Éxito! Se subieron ${count} compras correctamente.`);
  } catch (e) {
    console.error('❌ Error fatal:', e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
