const fs = require('fs');
const csv = require('csv-parse/sync');
const { Pool } = require('pg');

async function generarInsertFaltantes() {
  console.log('🔨 GENERANDO INSERT PARA 106 PARTIDAS FALTANTES\n');
  console.log('═'.repeat(150));

  try {
    // 1. Leer APUS_DETALLADO.csv
    console.log('\n1️⃣  Leyendo partidas de APUS_DETALLADO.csv...\n');
    const apusContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
    const apusRecords = csv.parse(apusContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });

    // Map único de partidas desde APUS_DETALLADO
    const apusPartidas = new Map();
    apusRecords.forEach(r => {
      const codigo = r.partida_codigo;
      if (codigo && !apusPartidas.has(codigo)) {
        apusPartidas.set(codigo, {
          codigo: codigo,
          descripcion: r.partida_descripcion,
          unidad: r.partida_unidad,
          rendimiento: r.partida_rendimiento,
          costo_unitario: parseFloat(r.partida_costo_unitario) || 0
        });
      }
    });

    console.log(`  ✓ ${apusPartidas.size} partidas únicas en APUS_DETALLADO\n`);

    // 2. Obtener partidas que ya existen en BD
    console.log('2️⃣  Obteniendo partidas existentes en BD...\n');
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: '7_insumos_rado',
      user: 'postgres',
      password: 'Jo.9839514500'
    });

    const client = await pool.connect();
    const existentes = await client.query(`SELECT codigo FROM partidas`);
    const codigosExistentes = new Set(existentes.rows.map(r => r.codigo));

    console.log(`  ✓ ${codigosExistentes.size} partidas ya existen en BD\n`);

    // 3. Encontrar faltantes
    console.log('3️⃣  Identificando partidas faltantes...\n');
    const faltantes = [];

    apusPartidas.forEach((partida, codigo) => {
      if (!codigosExistentes.has(codigo)) {
        faltantes.push(partida);
      }
    });

    console.log(`  ✓ ${faltantes.length} partidas necesitan ser insertadas\n`);

    if (faltantes.length > 0) {
      console.log('  Ejemplos de partidas a insertar:');
      faltantes.slice(0, 5).forEach(p => {
        console.log(`    - [${p.codigo}] ${p.descripcion.substring(0, 50)}`);
      });
      console.log();
    }

    // 4. Generar INSERT SQL
    console.log('4️⃣  Generando INSERT SQL...\n');

    let sql = `-- INSERT PARA PARTIDAS FALTANTES (desde APUS_DETALLADO.csv)
-- Generado automáticamente
-- Estas partidas NO estaban en INSERT_PARTIDAS.sql pero SÍ en APUS_DETALLADO.csv

BEGIN TRANSACTION;

INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado) VALUES
`;

    const valores = faltantes.map(p => {
      const desc = p.descripcion.replace(/'/g, "''"); // Escape quotes
      const unidad = p.unidad ? p.unidad.replace(/'/g, "''") : '';
      return `('${p.codigo}', '${desc}', '${unidad}', 0, 0, ${p.costo_unitario}, 0)`;
    });

    sql += valores.join(',\n') + ';\n\n';
    sql += 'COMMIT TRANSACTION;\n';

    fs.writeFileSync('DATA_LAST/INSERT_PARTIDAS_FALTANTES.sql', sql);

    console.log(`  ✓ SQL generado: DATA_LAST/INSERT_PARTIDAS_FALTANTES.sql\n`);
    console.log(`  Tamaño: ${(sql.length / 1024).toFixed(2)} KB\n`);
    console.log(`  Registros: ${faltantes.length}\n`);

    // 5. Información resumida
    console.log('═'.repeat(150));
    console.log('\n📋 RESUMEN\n');
    console.log(`INSERT_PARTIDAS.sql (original):      1,134 partidas`);
    console.log(`INSERT_PARTIDAS_FALTANTES.sql (nuevo): ${faltantes.length} partidas`);
    console.log(`Total después de aplicar ambos:       ${1134 + faltantes.length}\n`);

    console.log('🎯 PRÓXIMO PASO:\n');
    console.log(`Ejecutar en tu BD:\n`);
    console.log(`  psql -h localhost -U postgres -d 7_insumos_rado -f DATA_LAST/INSERT_PARTIDAS_FALTANTES.sql\n`);

    console.log('✅ Después, el CSV COMPLETO_MATCH_PARTIDAS_INSUMOS_COMPRAS.csv tendrá TODAS las descripciones\n');

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

generarInsertFaltantes();
