const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');

function normalizarCodigo(codigo) {
  if (!codigo) return codigo;
  return codigo.replace(/^O\.E\./, 'OE.');
}

async function generarCSVCompleto() {
  console.log('🔄 REGENERANDO CSV CON NORMALIZACIÓN DE CÓDIGOS\n');
  console.log('═'.repeat(150));

  try {
    console.log('\n1️⃣  Extrayendo metrado_fijo (normalizando códigos)...\n');
    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');

    const partidasMap = new Map();
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

        if (valores.length >= 4) {
          const codigo = normalizarCodigo(valores[0]);
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

    console.log('2️⃣  Leyendo INSUMOS.xlsx...\n');
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

    console.log('4️⃣  Haciendo MATCH entre 3 fuentes (con normalización)...\n');

    const csvFinal = [];
    let conDescripcion = 0;
    let sinDescripcion = 0;

    insumosDBRes.rows.forEach(insumo => {
      const codigoPartidaNormalizado = normalizarCodigo(insumo.codigo_partida);
      const partida = partidasMap.get(codigoPartidaNormalizado) || {};
      const compra = insumosComprasMap.get(insumo.codigo_insumo) || {};

      if (partida.descripcion) {
        conDescripcion++;
      } else {
        sinDescripcion++;
      }

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

    console.log(`  ✓ ${csvFinal.length} registros procesados\n`);
    console.log(`  ✓ Con descripción: ${conDescripcion}`);
    console.log(`  ✓ Sin descripción: ${sinDescripcion}\n`);

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
    console.log(`  ✓ CSV actualizado: COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv\n`);

    console.log('═'.repeat(150));
    console.log('\n📊 ESTADÍSTICAS FINALES\n');

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

    console.log(`Total insumos: ${csvFinal.length}`);
    console.log(`\nDATA COMPLETENESS:`);
    console.log(`  ─ Con partida_descripcion: ${conDescripcion} (${(conDescripcion/csvFinal.length*100).toFixed(2)}%) ✅`);
    console.log(`  ─ Sin partida_descripcion: ${sinDescripcion} (${(sinDescripcion/csvFinal.length*100).toFixed(2)}%) ⚠️`);
    console.log(`  ─ Con cantidad_adquirida: ${conCompra} (${(conCompra/csvFinal.length*100).toFixed(2)}%)`);
    console.log(`  ─ Con metrado_fijo > 0: ${conMetrado} (${(conMetrado/csvFinal.length*100).toFixed(2)}%)\n`);

    console.log('═'.repeat(150));
    console.log('\n✅ CSV ACTUALIZADO Y COMPLETO\n');
    console.log('Archivo: DATA_LAST/COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv');
    console.log(`\n✓ Casi TODAS las partidas tienen descripción (${conDescripcion}/${csvFinal.length})`);
    console.log(`✓ Normalización de códigos aplicada (O.E. -> OE.)`);
    console.log(`✓ Match exitoso entre INSERT_PARTIDAS.sql + INSUMOS.xlsx + BD\n`);

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

generarCSVCompleto();
