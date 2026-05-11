const { Pool } = require('pg');
const fs = require('fs');
const XLSX = require('xlsx');

async function cargarTodos() {
  console.log('⚡ CARGANDO TODOS LOS DATOS FALTANTES\n');
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

    // 1. CARGAR METRADO_FIJO desde INSERT_PARTIDAS.sql
    console.log('\n1️⃣  Cargando metrado_fijo en tabla partidas...\n');

    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');
    const lines = sqlContent.split('\n').filter(l => l.trim().startsWith("('OE"));

    let cargados = 0;
    for (const line of lines) {
      const match = line.match(/^\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)/);
      if (match) {
        const codigo = match[1];
        const metrado = parseFloat(match[4]);

        await client.query(
          'UPDATE partidas SET metrado_fijo = $1 WHERE codigo = $2',
          [metrado, codigo]
        );
        cargados++;
      }
    }

    console.log(`  ✓ ${cargados} metrados cargados\n`);

    // 2. CARGAR CANTIDAD_ADQUIRIDA desde INSUMOS.xlsx
    console.log('2️⃣  Cargando cantidad_adquirida en tabla insumos...\n');

    const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
    const insumosSheet = insumosBook.Sheets['Sheet'];
    const insumosData = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

    let actualizados = 0;
    for (const row of insumosData) {
      const codigo = String(row.Código || '').trim();
      const cantidad = parseFloat(row.Cantidad) || 0;

      if (codigo && cantidad > 0) {
        const result = await client.query(
          'UPDATE insumos SET cantidad_adquirida = $1 WHERE codigo_insumo = $2',
          [cantidad, codigo]
        );
        if (result.rowCount > 0) actualizados++;
      }
    }

    console.log(`  ✓ ${actualizados} insumos actualizados con cantidad_adquirida\n`);

    // 3. VERIFICAR RESULTADOS
    console.log('3️⃣  Verificando datos cargados...\n');

    const partRes = await client.query(`
      SELECT COUNT(*) as total, COUNT(CASE WHEN metrado_fijo > 0 THEN 1 END) as con_valor
      FROM partidas
    `);
    const partStats = partRes.rows[0];

    const insRes = await client.query(`
      SELECT COUNT(*) as total, COUNT(CASE WHEN cantidad_adquirida > 0 THEN 1 END) as con_valor
      FROM insumos
    `);
    const insStats = insRes.rows[0];

    console.log(`  Partidas con metrado_fijo > 0: ${partStats.con_valor}/${partStats.total}`);
    console.log(`  Insumos con cantidad_adquirida > 0: ${insStats.con_valor}/${insStats.total}\n`);

    console.log('═'.repeat(150));
    console.log('\n✅ DATOS CARGADOS EXITOSAMENTE\n');

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

cargarTodos();
