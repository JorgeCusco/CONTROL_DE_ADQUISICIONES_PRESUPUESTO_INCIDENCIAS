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
  console.log('🔗 Fase 3: Restaurando vínculos por identidad...');
  const backup = JSON.parse(fs.readFileSync('backup_vinculos_identidad.json', 'utf8'));
  const client = await pool.connect();
  
  try {
    // 1. Cargar todas las nuevas compras en memoria para matchear rápido
    const { rows: nuevasCompras } = await client.query('SELECT id, num_compra, detalle, anio FROM compras_c');
    
    // Crear un mapa de búsqueda: "num-detalle-anio" -> id
    const compraMap = new Map();
    nuevasCompras.forEach(c => {
      const key = `${c.num_compra}|${c.detalle}|${c.anio}`;
      compraMap.set(key, c.id);
    });

    console.log(`  ✓ Memoria cargada: ${nuevasCompras.length} compras indexadas.`);

    let vinculados = 0;
    let noEncontrados = 0;
    
    // Preparar batch de inserción
    const batchSize = 100;
    const recordsToInsert = [];

    for (const link of backup) {
      const key = `${link.num_compra}|${link.detalle}|${link.anio}`;
      const newId = compraMap.get(key);

      if (newId) {
        recordsToInsert.push({
          codigo_insumo: link.codigo_insumo,
          compra_id: newId,
          factor_conversion: link.factor_conversion || 1.0,
          usuario: link.usuario || 'Restore Plan'
        });
        vinculados++;
      } else {
        noEncontrados++;
      }
    }

    // Insertar en bloques
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      const values = [];
      const placeholders = [];
      
      batch.forEach((r, idx) => {
        const base = idx * 4;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        values.push(r.codigo_insumo, r.compra_id, r.factor_conversion, r.usuario);
      });

      await client.query(`
        INSERT INTO mapeo_vinculacion (codigo_insumo, compra_id, factor_conversion, usuario)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (codigo_insumo, compra_id) DO NOTHING
      `, values);
    }

    console.log(`✅ Fase 3 completada.`);
    console.log(`   - Vínculos restaurados: ${vinculados}`);
    console.log(`   - Vínculos perdidos (no matchearon): ${noEncontrados}`);

  } catch (e) {
    console.error('❌ Error en Fase 3:', e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
