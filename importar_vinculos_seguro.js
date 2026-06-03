const fs = require('fs');
const xlsx = require('xlsx');
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
  console.log('🔄 Iniciando Importación Segura de Vínculos...');
  const wb = xlsx.readFile('DATA_LAST/ULTIMO/vinculos.xlsx');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
  
  let successCount = 0;
  let missingApuCount = 0;
  let missingCompraCount = 0;
  let alreadyExistsCount = 0;
  
  // Cache to avoid querying the same descriptions repeatedly
  const apuCache = {};
  const compraCache = {};
  
  const notFoundApus = new Set();
  const notFoundCompras = new Set();

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const descP = row[0] ? row[0].toString().trim() : null;
    const descC = row[1] ? row[1].toString().trim() : null;
    
    if (!descP || !descC) continue;
    
    // 1. Find APU Code
    let codigoInsumo = apuCache[descP];
    if (codigoInsumo === undefined) {
      const resApu = await pool.query('SELECT codigo_insumo FROM insumos_resumen WHERE descripcion_insumo = $1 LIMIT 1', [descP]);
      if (resApu.rows.length > 0) {
        codigoInsumo = resApu.rows[0].codigo_insumo;
        apuCache[descP] = codigoInsumo;
      } else {
        apuCache[descP] = null;
        codigoInsumo = null;
      }
    }
    
    if (!codigoInsumo) {
      missingApuCount++;
      notFoundApus.add(descP);
      continue;
    }
    
    // 2. Find Compra IDs (can be multiple purchases for the same item)
    let compraIds = compraCache[descC];
    if (compraIds === undefined) {
      const resCompra = await pool.query('SELECT id FROM compras_c WHERE detalle = $1', [descC]);
      if (resCompra.rows.length > 0) {
        compraIds = resCompra.rows.map(r => r.id);
        compraCache[descC] = compraIds;
      } else {
        compraCache[descC] = [];
        compraIds = [];
      }
    }
    
    if (compraIds.length === 0) {
      missingCompraCount++;
      notFoundCompras.add(descC);
      continue;
    }
    
    // 3. Insert Linkages
    let insertedAny = false;
    for (const cid of compraIds) {
      try {
        const res = await pool.query(`
          INSERT INTO mapeo_vinculacion (codigo_insumo, compra_id, usuario)
          VALUES ($1, $2, 'Auto Import (vinculos.xlsx)')
          ON CONFLICT (codigo_insumo, compra_id) DO NOTHING
          RETURNING id
        `, [codigoInsumo, cid]);
        
        if (res.rowCount > 0) {
          insertedAny = true;
          successCount++;
        }
      } catch (err) {
        console.error('Error insertando:', err.message);
      }
    }
    
    if (!insertedAny && compraIds.length > 0) {
      alreadyExistsCount++;
    }
  }
  
  console.log('\n📊 RESUMEN DE LA IMPORTACIÓN:');
  console.log('-------------------------------');
  console.log('✅ Nuevos Vínculos Exitosos:', successCount);
  console.log('⏭️ Vínculos ya existentes (Ignorados):', alreadyExistsCount);
  console.log('❌ Insumos NO encontrados en APU:', missingApuCount);
  console.log('❌ Compras NO encontradas en DB:', missingCompraCount);
  
  if (notFoundApus.size > 0) {
    console.log('\n⚠️ Ejemplo de Insumos (P) no encontrados (Rojos):');
    Array.from(notFoundApus).slice(0, 5).forEach(x => console.log('  - ' + x));
  }
  
  if (notFoundCompras.size > 0) {
    console.log('\n⚠️ Ejemplo de Compras (C) no encontradas (Rojos):');
    Array.from(notFoundCompras).slice(0, 5).forEach(x => console.log('  - ' + x));
  }
  
  await pool.end();
}
run();
