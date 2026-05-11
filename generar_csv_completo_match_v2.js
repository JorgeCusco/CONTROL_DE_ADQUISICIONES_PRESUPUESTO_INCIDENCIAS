const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');

async function generarCSVCompleto() {
  console.log('🔄 GENERANDO CSV COMPLETO CON MATCH DE 3 FUENTES\n');
  console.log('═'.repeat(150));

  try {
    // 1. EXTRAER DATOS DE INSERT_PARTIDAS.sql - VERSIÓN MEJORADA
    console.log('\n1️⃣  Extrayendo metrado_fijo desde INSERT_PARTIDAS.sql...\n');
    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');

    const partidasMap = new Map();

    // Parser mejorado: busca líneas que empiezan con (
    const lines = sqlContent.split('\n');

    lines.forEach(line => {
      line = line.trim();

      // Detectar líneas de valores: ('codigo', 'descripcion', 'unidad', numero, ...)
      if (line.match(/^\('OE\./)) {
        // Extraer valores entre comillas simples y números
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
          } else if (!inQuote && current && /[0-9\.]/.test(line[i-1])) {
            current += char;
          }
        }

        // valores[0] = codigo, valores[1] = descripcion, valores[2] = unidad, valores[3] = metrado
        if (valores.length >= 4) {
          const codigo = valores[0];
          const descripcion = valores[1];
          const unidad = valores[2];
          const metrado = parseFloat(valores[3]);
          const precio = parseFloat(valores[4]) || 0;

          if (codigo && codigo.startsWith('OE')) {
            partidasMap.set(codigo, {
              codigo,
              descripcion,
              unidad,
              metrado_fijo: metrado,
              precio_unitario: precio
            });
          }
        }
      }
    });

    console.log(`  ✓ ${partidasMap.size} partidas extraídas con metrado_fijo\n`);

    // Mostrar ejemplos
    if (partidasMap.size > 0) {
      console.log('  Ejemplos extraídos:');
      let count = 0;
      for (const [codigo, data] of partidasMap) {
        if (count >= 3) break;
        console.log(`    - [${codigo}] ${data.descripcion.substring(0, 40)} | metrado: ${data.metrado_fijo}`);
        count++;
      }
      console.log();
    }

    // 2. LEER INSUMOS.xlsx
    console.log('2️⃣  Leyendo INSUMOS.xlsx para cantidad_adquirida...\n');
    const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
    const insumosSheet = insumosBook.Sheets['Sheet'];
    const insumosXlsx = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

    const insumosComprasMap = new Map();
    insumosXlsx.forEach(row => {
      const codigo = String(row.Código || '').trim();
      if (codigo) {
        insumosComprasMap.set(codigo, {
          codigo: codigo,
          descripcion: row.Descripción,
          unidad: row['Unid.'],
          cantidad_adquirida: parseFloat(row.Cantidad) || 0,
          costo_unitario: parseFloat(row.Costo) || 0,
          total_comprado: parseFloat(row.Total) || 0
        });
      }
    });

    console.log(`  ✓ ${insumosComprasMap.size} insumos de compra extraídos\n`);

    // 3. LEER TABLA INSUMOS DE BD
    console.log('3️⃣  Leyendo tabla insumos de PostgreSQL...\n');
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
        item_1,
        codigo_insumo,
        descripcion,
        unidad,
        incidencia_original,
        parcial_original,
        incidencia,
        cantidad_modificada,
        cantidad_adquirida,
        comentario,
        es_extra
      FROM insumos
      ORDER BY codigo_partida, codigo_insumo
    `);

    console.log(`  ✓ ${insumosDBRes.rows.length} insumos leídos de BD\n`);

    // 4. HACER EL MATCH COMPLETO
    console.log('4️⃣  Haciendo MATCH entre 3 fuentes...\n');

    const csvFinal = [];

    insumosDBRes.rows.forEach(insumo => {
      const partida = partidasMap.get(insumo.codigo_partida) || {};
      const compra = insumosComprasMap.get(insumo.codigo_insumo) || {};

      csvFinal.push({
        codigo_partida: insumo.codigo_partida,
        partida_descripcion: partida.descripcion || '',
        metrado_fijo: partida.metrado_fijo || 0,
        precio_unitario_partida: partida.precio_unitario || 0,
        codigo_insumo: insumo.codigo_insumo,
        descripcion_insumo: insumo.descripcion,
        unidad_insumo: insumo.unidad,
        item_1: insumo.item_1 || '',
        incidencia_original: insumo.incidencia_original,
        parcial_original: insumo.parcial_original,
        incidencia_actual: insumo.incidencia,
        cantidad_modificada: insumo.cantidad_modificada,
        descripcion_compra: compra.descripcion || '',
        cantidad_adquirida: compra.cantidad_adquirida || insumo.cantidad_adquirida || 0,
        costo_unitario: compra.costo_unitario || 0,
        total_comprado: compra.total_comprado || 0,
        comentario: insumo.comentario || '',
        es_extra: insumo.es_extra || false
      });
    });

    console.log(`  ✓ ${csvFinal.length} registros completos generados\n`);

    // 5. ESCRIBIR CSV
    console.log('5️⃣  Escribiendo CSV final...\n');

    const csvContent = stringify(csvFinal, {
      header: true,
      columns: [
        'codigo_partida',
        'partida_descripcion',
        'metrado_fijo',
        'precio_unitario_partida',
        'codigo_insumo',
        'descripcion_insumo',
        'unidad_insumo',
        'item_1',
        'incidencia_original',
        'parcial_original',
        'incidencia_actual',
        'cantidad_modificada',
        'descripcion_compra',
        'cantidad_adquirida',
        'costo_unitario',
        'total_comprado',
        'comentario',
        'es_extra'
      ]
    });

    fs.writeFileSync('DATA_LAST/COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv', csvContent);
    console.log(`  ✓ CSV creado: DATA_LAST/COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv\n`);

    // 6. ESTADÍSTICAS
    console.log('═'.repeat(150));
    console.log('\n📊 ESTADÍSTICAS DEL MATCH\n');

    let conCompra = 0;
    let sinCompra = 0;
    let conMetrado = 0;
    let sinMetrado = 0;

    csvFinal.forEach(row => {
      if (row.cantidad_adquirida > 0) conCompra++;
      else sinCompra++;

      if (row.metrado_fijo > 0) conMetrado++;
      else sinMetrado++;
    });

    console.log(`  Total insumos: ${csvFinal.length}`);
    console.log(`  ─ Con cantidad_adquirida: ${conCompra} (${(conCompra/csvFinal.length*100).toFixed(2)}%)`);
    console.log(`  ─ Sin cantidad_adquirida: ${sinCompra} (${(sinCompra/csvFinal.length*100).toFixed(2)}%)`);
    console.log(`\n  ─ Con metrado_fijo > 0: ${conMetrado} (${(conMetrado/csvFinal.length*100).toFixed(2)}%)`);
    console.log(`  ─ Con metrado_fijo = 0: ${sinMetrado} (${(sinMetrado/csvFinal.length*100).toFixed(2)}%)`);

    // Ejemplos
    console.log('\n📋 EJEMPLOS DE REGISTROS COMPLETOS:\n');
    csvFinal.slice(0, 3).forEach((row, idx) => {
      console.log(`${idx + 1}. [${row.codigo_partida}] -> Insumo:[${row.codigo_insumo}]`);
      console.log(`   Partida: ${row.partida_descripcion.substring(0, 50)}`);
      console.log(`   Insumo: ${row.descripcion_insumo.substring(0, 50)}`);
      console.log(`   Metrado: ${row.metrado_fijo} | Comprado: ${row.cantidad_adquirida} | Total: $${row.total_comprado.toFixed(2)}`);
      console.log();
    });

    console.log('═'.repeat(150));
    console.log('\n✅ CSV COMPLETO GENERADO EXITOSAMENTE\n');
    console.log('Archivo: DATA_LAST/COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv');
    console.log('\nEste CSV contiene:');
    console.log('  ✓ Metrado_fijo desde INSERT_PARTIDAS.sql');
    console.log('  ✓ Cantidad_adquirida desde INSUMOS.xlsx');
    console.log('  ✓ Incidencia_original y parcial_original desde BD');
    console.log('  ✓ Todos los datos de partidas e insumos combinados\n');

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
    console.log(err);
  }
}

generarCSVCompleto();
