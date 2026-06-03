const fs = require('fs');
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
  console.log('🔍 Buscando y limpiando vínculos duplicados...');
  const client = await pool.connect();
  
  try {
    const res = await client.query(`
      SELECT m.id, m.compra_id, m.codigo_insumo, ir.descripcion_insumo, c.detalle, c.num_compra
      FROM mapeo_vinculacion m
      JOIN insumos_resumen ir ON m.codigo_insumo = ir.codigo_insumo
      JOIN compras_c c ON m.compra_id = c.id
      WHERE m.compra_id IN (
        SELECT compra_id FROM mapeo_vinculacion GROUP BY compra_id HAVING COUNT(*) > 1
      )
      ORDER BY m.compra_id, m.id
    `);

    if (res.rows.length === 0) {
      console.log('✅ No se encontraron vínculos duplicados.');
      return;
    }

    const duplicates = res.rows;
    const toKeep = new Set();
    const toDelete = [];
    const report = [];

    duplicates.forEach(row => {
      if (!toKeep.has(row.compra_id)) {
        toKeep.add(row.compra_id);
        report.push(`MANTENIDO: Compra ${row.compra_id} (${row.detalle}) vinculada a [${row.codigo_insumo}] ${row.descripcion_insumo}`);
      } else {
        toDelete.push(row.id);
        report.push(`BORRADO: Vínculo duplicado de Compra ${row.compra_id} con [${row.codigo_insumo}] ${row.descripcion_insumo}`);
      }
    });

    if (toDelete.length > 0) {
      await client.query('DELETE FROM mapeo_vinculacion WHERE id = ANY($1)', [toDelete]);
      console.log(`✅ Se eliminaron ${toDelete.length} vínculos duplicados.`);
      fs.writeFileSync('reporte_limpieza_duplicados.txt', report.join('\n'));
      console.log('📝 Reporte guardado en reporte_limpieza_duplicados.txt');
    }

  } catch (e) {
    console.error('❌ Error:', e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
