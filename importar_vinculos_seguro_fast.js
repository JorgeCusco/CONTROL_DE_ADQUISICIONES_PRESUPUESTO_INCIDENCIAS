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
  console.log('🚀 Iniciando Importación Ultrarrápida y Segura de Vínculos...');
  const wb = xlsx.readFile('DATA_LAST/ULTIMO/vinculos.xlsx');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
  
  // Pre-load DB to memory
  console.log('1. Cargando BD en memoria...');
  const resApus = await pool.query('SELECT codigo_insumo, descripcion_insumo FROM insumos_resumen');
  const apuMap = {};
  for(const r of resApus.rows) apuMap[r.descripcion_insumo] = r.codigo_insumo;
  
  const resCompras = await pool.query('SELECT id, detalle FROM compras_c');
  const compraMap = {};
  for(const r of resCompras.rows) {
      if(!compraMap[r.detalle]) compraMap[r.detalle] = [];
      compraMap[r.detalle].push(r.id);
  }
  
  console.log('2. Cruzando datos y validando...');
  
  let successCount = 0;
  let missingApuCount = 0;
  let missingCompraCount = 0;
  let alreadyExistsCount = 0;
  
  const notFoundApus = new Set();
  const notFoundCompras = new Set();
  const insertQueries = [];

  for (let i = 2; i < data.length; i++) {
    const row = data[i];
    const descP = row[0] ? row[0].toString().trim() : null;
    const descC = row[1] ? row[1].toString().trim() : null;
    if (!descP || !descC) continue;
    
    const codigoInsumo = apuMap[descP];
    if (!codigoInsumo) {
      missingApuCount++;
      notFoundApus.add(descP);
      continue;
    }
    
    const compraIds = compraMap[descC];
    if (!compraIds || compraIds.length === 0) {
      missingCompraCount++;
      notFoundCompras.add(descC);
      continue;
    }
    
    for (const cid of compraIds) {
        insertQueries.push(`('${codigoInsumo}', ${cid}, 'Auto Import')`);
    }
  }
  
  if (insertQueries.length > 0) {
      console.log(`3. Insertando ${insertQueries.length} vinculaciones potenciales en bloque (ignoring conflicts)...`);
      const chunkSize = 1000;
      for (let i = 0; i < insertQueries.length; i += chunkSize) {
          const chunk = insertQueries.slice(i, i + chunkSize);
          const query = `
            INSERT INTO mapeo_vinculacion (codigo_insumo, compra_id, usuario)
            VALUES ${chunk.join(',')}
            ON CONFLICT (codigo_insumo, compra_id) DO NOTHING
            RETURNING id
          `;
          try {
              const res = await pool.query(query);
              successCount += res.rowCount;
              alreadyExistsCount += (chunk.length - res.rowCount);
          } catch(e) {
              console.error('Error in batch insert:', e.message);
          }
      }
  }

  console.log('\n📊 RESUMEN DE LA IMPORTACIÓN SEGURA:');
  console.log('------------------------------------');
  console.log('✅ Nuevos Vínculos Insertados:', successCount);
  console.log('⏭️ Vínculos ya existentes (Ignorados):', alreadyExistsCount);
  console.log('❌ Insumos NO encontrados en APU:', missingApuCount);
  console.log('❌ Compras NO encontradas en DB:', missingCompraCount);
  
  await pool.end();
}
run();
