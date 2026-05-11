const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');

function normalizarCodigo(codigo) {
  if (!codigo) return codigo;
  return codigo.replace(/^O\.E\./, 'OE.');
}

async function completarTablaInsumos() {
  console.log('📋 COMPLETAR TABLA INSUMOS - BASE EN BD\n');
  console.log('═'.repeat(150));

  try {
    // 1. Extraer metrado_fijo de INSERT_PARTIDAS.sql
    console.log('\n1️⃣  Extrayendo metrado_fijo desde INSERT_PARTIDAS.sql...\n');
    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');

    const metradoMap = new Map();
    const lines = sqlContent.split('\n');

    lines.forEach(line => {
      line = line.trim();
      if (line.match(/^\('OE\./)) {
        const valores = [];
        let current = '';
        let inQuote = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === "'" && (i === 0 || line[i-1] !== '\\')) {
            inQuote = !inQuote;
            if (!inQuote && current) {
              valores.push(current);
              current = '';
            }
          } else if (inQuote) {
            current += char;
          } else if (char === ',' || char === ')') {
            if (current.trim()) {
              valores.push(current.trim());
              current = '';
            }
          } else if (!inQuote && /[0-9\.]/.test(char)) {
            current += char;
          }
        }

        if (valores.length >= 3) {
          const codigo = valores[0];
          const metrado = parseFloat(valores[3]) || 0;
          metradoMap.set(codigo, metrado);
        }
      }
    });

    console.log(`  ✓ ${metradoMap.size} metrados cargados\n`);

    // 2. Leer INSUMOS.xlsx para cantidad_adquirida
    console.log('2️⃣  Leyendo INSUMOS.xlsx...\n');
    const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
    const insumosSheet = insumosBook.Sheets['Sheet'];
    const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

    const cantidadMap = new Map();
    insumosXlsx.forEach(row => {
      const codigo = String(row.Código || '').trim();
      if (codigo) {
        cantidadMap.set(codigo, {
          cantidad: parseFloat(row.Cantidad) || 0,
          costo: parseFloat(row.Costo) || 0,
          total: parseFloat(row.Total) || 0
        });
      }
    });

    console.log(`  ✓ ${cantidadMap.size} insumos de compra cargados\n`);

    // 3. Conectar a BD y leer tabla insumos
    console.log('3️⃣  Leyendo tabla insumos de BD...\n');
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: '7_insumos_rado',
      user: 'postgres',
      password: 'Jo.9839514500'
    });

    const client = await pool.connect();
    const insumosDBRes = await client.query(`
      SELECT
        id,
        codigo_partida,
        codigo_insumo,
        descripcion,
        cantidad_adquirida,
        incidencia_original,
        parcial_original
      FROM insumos
      ORDER BY id
    `);

    console.log(`  ✓ ${insumosDBRes.rows.length} insumos leídos de BD\n`);

    // 4. COMPLETAR datos
    console.log('4️⃣  Completando datos de cada registro...\n');

    let updates = [];
    let conCantidad = 0;
    let sinCantidad = 0;
    let conMetrado = 0;
    let sinMetrado = 0;

    insumosDBRes.rows.forEach(insumo => {
      const codigoPartidaNorm = normalizarCodigo(insumo.codigo_partida);
      const metrado = metradoMap.get(codigoPartidaNorm) || 0;
      const compra = cantidadMap.get(insumo.codigo_insumo) || {};
      const cantidad = compra.cantidad || 0;

      if (cantidad > 0) conCantidad++;
      else sinCantidad++;

      if (metrado > 0) conMetrado++;
      else sinMetrado++;

      updates.push({
        id: insumo.id,
        codigo_partida: insumo.codigo_partida,
        codigo_insumo: insumo.codigo_insumo,
        descripcion: insumo.descripcion,
        cantidad_adquirida_actual: insumo.cantidad_adquirida,
        cantidad_adquirida_nueva: cantidad,
        incidencia_original: insumo.incidencia_original,
        parcial_original: insumo.parcial_original,
        metrado_fijo: metrado
      });
    });

    console.log(`  ✓ Análisis completado\n`);
    console.log(`  Cantidad_adquirida:`);
    console.log(`    - Registros que TENDRÁN valor: ${conCantidad} (${(conCantidad/insumosDBRes.rows.length*100).toFixed(2)}%)`);
    console.log(`    - Registros que NO tendrán valor: ${sinCantidad}\n`);
    console.log(`  Metrado_fijo:`);
    console.log(`    - Registros que TENDRÁN valor: ${conMetrado} (${(conMetrado/insumosDBRes.rows.length*100).toFixed(2)}%)`);
    console.log(`    - Registros que NO tendrán valor: ${sinMetrado}\n`);

    // 5. Generar CSV de actualización
    console.log('5️⃣  Generando CSV de actualización...\n');

    const csvContent = stringify(updates, {
      header: true,
      columns: [
        'id',
        'codigo_partida',
        'codigo_insumo',
        'descripcion',
        'cantidad_adquirida_actual',
        'cantidad_adquirida_nueva',
        'incidencia_original',
        'parcial_original',
        'metrado_fijo'
      ]
    });

    fs.writeFileSync('DATA_LAST/INSUMOS_COMPLETAR.csv', csvContent);
    console.log(`  ✓ CSV generado: DATA_LAST/INSUMOS_COMPLETAR.csv\n`);

    // 6. Generar UPDATE SQL
    console.log('6️⃣  Generando UPDATE SQL...\n');

    let updateSQL = `-- UPDATE TABLA INSUMOS - Completar cantidad_adquirida y metrado_fijo
-- Base: 6,202 registros existentes en tabla insumos
-- Fuentes: INSUMOS.xlsx + INSERT_PARTIDAS.sql

BEGIN TRANSACTION;

`;

    updates.forEach(row => {
      if (row.cantidad_adquirida_nueva > 0 || row.metrado_fijo > 0) {
        updateSQL += `UPDATE insumos SET cantidad_adquirida = ${row.cantidad_adquirida_nueva} WHERE id = ${row.id};\n`;
      }
    });

    updateSQL += `\nCOMMIT TRANSACTION;\n`;

    fs.writeFileSync('DATA_LAST/UPDATE_INSUMOS.sql', updateSQL);

    console.log(`  ✓ SQL generado: DATA_LAST/UPDATE_INSUMOS.sql\n`);
    console.log(`  Líneas de UPDATE: ${updates.filter(u => u.cantidad_adquirida_nueva > 0 || u.metrado_fijo > 0).length}\n`);

    // 7. Resumen
    console.log('═'.repeat(150));
    console.log('\n✅ COMPLETACIÓN DE TABLA INSUMOS LISTA\n');

    console.log('ARCHIVOS GENERADOS:\n');
    console.log('1. DATA_LAST/INSUMOS_COMPLETAR.csv');
    console.log('   - Vista previa de qué será completado');
    console.log('   - Columnas: id, codigo, cantidad_actual, cantidad_nueva, metrado_fijo\n');

    console.log('2. DATA_LAST/UPDATE_INSUMOS.sql');
    console.log('   - Script SQL para actualizar tabla insumos');
    console.log('   - Actualiza cantidad_adquirida desde INSUMOS.xlsx\n');

    console.log('PRÓXIMO PASO:\n');
    console.log('Ejecutar en tu BD:\n');
    console.log('  psql -h localhost -U postgres -d 7_insumos_rado -f DATA_LAST/UPDATE_INSUMOS.sql\n');

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
    console.log(err);
  }
}

completarTablaInsumos();
