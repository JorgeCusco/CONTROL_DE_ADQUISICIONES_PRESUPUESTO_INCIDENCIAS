const { Pool } = require('pg');
const fs = require('fs');
const XLSX = require('xlsx');

async function analizar() {
  console.log('🔍 ANALIZANDO POR QUÉ FALTAN DATOS\n');
  console.log('═'.repeat(150));

  try {
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: '7_insumos_rado',
      user: 'postgres',
      password: 'Jo.9839514500'
    });

    const client = await pool.connect();

    // 1. Verificar metrado_fijo en tabla partidas
    console.log('\n1️⃣  METRADO_FIJO EN TABLA PARTIDAS\n');
    const partRes = await client.query(`
      SELECT COUNT(*) as total, COUNT(CASE WHEN metrado_fijo > 0 THEN 1 END) as con_valor
      FROM partidas
    `);
    const partStats = partRes.rows[0];
    console.log(`  Total partidas: ${partStats.total}`);
    console.log(`  Con metrado_fijo > 0: ${partStats.con_valor}`);
    console.log(`  Con metrado_fijo = 0: ${partStats.total - partStats.con_valor}\n`);

    // Sample
    const samplePartRes = await client.query(`
      SELECT codigo, descripcion, metrado_fijo FROM partidas LIMIT 3
    `);
    console.log(`  Ejemplos:\n`);
    samplePartRes.rows.forEach(r => {
      console.log(`    - [${r.codigo}] ${r.descripcion.substring(0, 40)} | metrado: ${r.metrado_fijo}`);
    });

    // 2. Verificar cantidad_adquirida en tabla insumos
    console.log('\n\n2️⃣  CANTIDAD_ADQUIRIDA EN TABLA INSUMOS\n');
    const insRes = await client.query(`
      SELECT COUNT(*) as total, COUNT(CASE WHEN cantidad_adquirida > 0 THEN 1 END) as con_valor
      FROM insumos
    `);
    const insStats = insRes.rows[0];
    console.log(`  Total insumos: ${insStats.total}`);
    console.log(`  Con cantidad_adquirida > 0: ${insStats.con_valor}`);
    console.log(`  Con cantidad_adquirida = 0: ${insStats.total - insStats.con_valor}\n`);

    // 3. Verificar INSERT_PARTIDAS.sql
    console.log('\n3️⃣  CONTENIDO DE INSERT_PARTIDAS.sql\n');
    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');
    const lines = sqlContent.split('\n').filter(l => l.trim().startsWith("('OE"));
    
    console.log(`  Total líneas de INSERT: ${lines.length}\n`);
    
    // Extraer sample
    const samples = [];
    lines.slice(0, 3).forEach(line => {
      const match = line.match(/^\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)/);
      if (match) {
        samples.push({
          codigo: match[1],
          desc: match[2],
          metrado: match[4]
        });
      }
    });

    console.log(`  Ejemplos de INSERT_PARTIDAS.sql:\n`);
    samples.forEach(s => {
      console.log(`    - [${s.codigo}] ${s.desc.substring(0, 30)} | metrado: ${s.metrado}`);
    });

    // 4. Verificar INSUMOS.xlsx
    console.log('\n\n4️⃣  CONTENIDO DE INSUMOS.xlsx\n');
    const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
    const insumosSheet = insumosBook.Sheets['Sheet'];
    const insumosData = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

    console.log(`  Total registros: ${insumosData.length}\n`);
    console.log(`  Ejemplos:\n`);
    insumosData.slice(0, 3).forEach(row => {
      console.log(`    - [${row.Código}] ${row.Descripción.substring(0, 30)} | Cantidad: ${row.Cantidad}`);
    });

    console.log('\n═'.repeat(150));
    console.log('\n🎯 ANÁLISIS\n');

    if (partStats.con_valor === 0) {
      console.log('❌ PROBLEMA 1: metrado_fijo = 0 en TODAS las partidas');
      console.log('   Causa: Los datos de INSERT_PARTIDAS.sql NO fueron cargados correctamente en la BD');
      console.log('   Solución: Necesito ejecutar INSERT_PARTIDAS.sql nuevamente\n');
    } else {
      console.log('✅ metrado_fijo está cargado en tabla partidas\n');
    }

    if (insStats.con_valor === 0) {
      console.log('❌ PROBLEMA 2: cantidad_adquirida = 0 en TODOS los insumos');
      console.log('   Causa: Los datos de INSUMOS.xlsx NO fueron cargados en tabla insumos');
      console.log('   Solución: Necesito ejecutar UPDATE_INSUMOS.sql\n');
    } else {
      console.log('✅ cantidad_adquirida está cargado en tabla insumos\n');
    }

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

analizar();
