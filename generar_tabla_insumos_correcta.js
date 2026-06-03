const { Pool } = require('pg');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

async function generarCorrectamente() {
  console.log('✅ GENERANDO TABLA INSUMOS CORRECTA (SIN ERRORES)\n');
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

    // 1. LIMPIAR cantidad_adquirida (ponerlo a 0)
    console.log('\n1️⃣  Limpiando cantidad_adquirida (ponerlo a CERO)...\n');
    
    await client.query('UPDATE insumos SET cantidad_adquirida = 0');
    const limpieRes = await client.query('SELECT COUNT(*) as total FROM insumos WHERE cantidad_adquirida = 0');
    
    console.log(`  ✓ ${limpieRes.rows[0].total} registros limpiados (cantidad_adquirida = 0)\n`);

    // 2. CARGAR metrado_fijo desde INSERT_PARTIDAS.sql
    console.log('2️⃣  Cargando metrado_fijo desde INSERT_PARTIDAS.sql...\n');

    const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');
    const lines = sqlContent.split('\n').filter(l => l.trim().startsWith("('OE"));

    let metradosCargados = 0;
    
    for (const line of lines) {
      const match = line.match(/^\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)/);
      if (match) {
        const codigo = match[1];
        const metrado = parseFloat(match[4]);

        await client.query(
          'UPDATE partidas SET metrado_fijo = $1 WHERE codigo = $2',
          [metrado, codigo]
        );
        metradosCargados++;
      }
    }

    console.log(`  ✓ ${metradosCargados} metrados cargados\n`);

    // 3. VERIFICAR ESTADO
    console.log('3️⃣  Verificando estado final...\n');

    const verificarPartRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN metrado_fijo > 0 THEN 1 END) as con_valor
      FROM partidas
    `);
    const partStats = verificarPartRes.rows[0];

    const verificarInsRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cantidad_adquirida = 0 THEN 1 END) as en_cero
      FROM insumos
    `);
    const insStats = verificarInsRes.rows[0];

    console.log(`  Partidas:`);
    console.log(`    - Total: ${partStats.total}`);
    console.log(`    - Con metrado_fijo > 0: ${partStats.con_valor}`);
    console.log(`    - Con metrado_fijo = 0: ${partStats.total - partStats.con_valor}\n`);

    console.log(`  Insumos:`);
    console.log(`    - Total: ${insStats.total}`);
    console.log(`    - Con cantidad_adquirida = 0: ${insStats.en_cero}\n`);

    // 4. EXPORTAR A CSV
    console.log('4️⃣  Exportando tabla a CSV...\n');

    const csvRes = await client.query(`
      SELECT 
        i.id,
        i.codigo_partida,
        p.descripcion as partida_descripcion,
        p.metrado_fijo,
        p.unidad as partida_unidad,
        i.item_1,
        i.codigo_insumo,
        i.descripcion,
        i.unidad,
        i.incidencia_original,
        i.parcial_original,
        i.incidencia,
        i.cantidad_modificada,
        i.cantidad_adquirida,
        i.comentario,
        i.es_extra
      FROM insumos i
      LEFT JOIN partidas p ON i.codigo_partida = p.codigo
      ORDER BY i.codigo_partida, i.codigo_insumo
    `);

    const csvContent = stringify(csvRes.rows, {
      header: true,
      columns: [
        'id',
        'codigo_partida',
        'partida_descripcion',
        'metrado_fijo',
        'partida_unidad',
        'item_1',
        'codigo_insumo',
        'descripcion',
        'unidad',
        'incidencia_original',
        'parcial_original',
        'incidencia',
        'cantidad_modificada',
        'cantidad_adquirida',
        'comentario',
        'es_extra'
      ]
    });

    fs.writeFileSync('DATA_LAST/TABLA_INSUMOS.csv', csvContent);

    console.log(`  ✓ CSV generado: DATA_LAST/TABLA_INSUMOS.csv\n`);
    console.log(`  Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Registros: ${csvRes.rows.length}\n`);

    // 5. RESUMEN FINAL
    console.log('═'.repeat(150));
    console.log('\n✅ TABLA INSUMOS GENERADA CORRECTAMENTE\n');

    console.log('Archivo: DATA_LAST/TABLA_INSUMOS.csv\n');

    console.log('COLUMNAS (16 totales):');
    console.log('  1. id');
    console.log('  2. codigo_partida');
    console.log('  3. partida_descripcion (descripción de la partida)');
    console.log('  4. metrado_fijo (cantidad presupuestada)');
    console.log('  5. partida_unidad');
    console.log('  6. item_1');
    console.log('  7. codigo_insumo');
    console.log('  8. descripcion (descripción del insumo)');
    console.log('  9. unidad');
    console.log('  10. incidencia_original (cantidad APU1)');
    console.log('  11. parcial_original (total APU1)');
    console.log('  12. incidencia (cantidad APU2)');
    console.log('  13. cantidad_modificada');
    console.log('  14. cantidad_adquirida (SIEMPRE = 0)');
    console.log('  15. comentario');
    console.log('  16. es_extra\n');

    console.log('ESTADO DE DATOS:');
    console.log(`  ✓ ${partStats.con_valor}/${partStats.total} partidas con metrado_fijo > 0`);
    console.log(`  ✓ ${insStats.en_cero}/${insStats.total} insumos con cantidad_adquirida = 0\n`);

    // Mostrar ejemplos
    console.log('EJEMPLOS DE REGISTROS:\n');
    csvRes.rows.slice(0, 3).forEach((row, idx) => {
      console.log(`${idx + 1}. Partida: [${row.codigo_partida}] ${row.partida_descripcion || '(sin descripción)'}`);
      console.log(`   Insumo: [${row.codigo_insumo}] ${row.descripcion}`);
      console.log(`   Metrado: ${row.metrado_fijo} | Cantidad adquirida: ${row.cantidad_adquirida}`);
      console.log();
    });

    console.log('═'.repeat(150));

    client.release();
    await pool.end();

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log(err);
  }
}

generarCorrectamente();
