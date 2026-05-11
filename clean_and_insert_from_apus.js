require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING
});

async function cleanAndInsert() {
  const client = await pool.connect();
  try {
    console.log('🔄 OPERACIÓN COMPLETA: BORRAR E REINSERTAR\n');

    // 1. BORRAR tabla insumos
    console.log('🗑️  Borrando tabla insumos...');
    await client.query('DELETE FROM insumos');
    console.log('✓ Tabla insumos limpiada\n');

    // 2. Leer APUS_Extraidos_v2.csv (única fuente de verdad)
    console.log('📖 Leyendo APUS_Extraidos_v2.csv...');
    const csvContent = fs.readFileSync('APUS_Extraidos_v2.csv', 'utf8');
    const lines = csvContent.split('\n');

    const insumosMap = {}; // codigo_partida|codigo_insumo -> datos
    const registrosUnicos = new Set();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const row = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
      if (row.length < 13) continue;

      const codigoPartida = row[0];
      const codigoInsumo = row[6];

      if (!codigoPartida || !codigoInsumo) continue;

      const key = `${codigoPartida}|${codigoInsumo}`;
      if (registrosUnicos.has(key)) continue;
      registrosUnicos.add(key);

      // Validar y limpiar
      let descripcion = row[7] || 'SIN DESCRIPCION';
      let unidad = row[8] || '';
      let incidencia = parseFloat(row[10]) || 0;
      let precio = parseFloat(row[11]) || 0;
      let parcial = parseFloat(row[12]) || 0;

      // Validar largo de campos
      if (codigoInsumo.length > 20) {
        console.log(`⚠️  Código muy largo: ${codigoInsumo.substring(0, 30)}...`);
        continue;
      }

      if (descripcion.length > 255) {
        descripcion = descripcion.substring(0, 255);
      }

      if (unidad.length > 50) {
        unidad = unidad.substring(0, 50);
      }

      insumosMap[key] = {
        codigo_partida: codigoPartida,
        codigo_insumo: codigoInsumo,
        descripcion: descripcion,
        unidad: unidad,
        incidencia_original: incidencia,
        parcial_original: parcial
      };
    }

    const insumosArray = Object.values(insumosMap);
    console.log(`✓ Total registros válidos: ${insumosArray.length}\n`);

    // 3. Insertar TODOS
    console.log('⏳ Insertando en Supabase (sin ON CONFLICT)...\n');
    let inserted = 0;
    let errors = 0;
    const errorDetails = [];

    for (const ins of insumosArray) {
      try {
        await client.query(
          `INSERT INTO insumos
          (codigo_partida, codigo_insumo, descripcion, unidad, incidencia_original, parcial_original, incidencia, cantidad_modificada, cantidad_adquirida)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            ins.codigo_partida,
            ins.codigo_insumo,
            ins.descripcion,
            ins.unidad,
            ins.incidencia_original,
            ins.parcial_original,
            ins.incidencia_original,
            0,
            0
          ]
        );
        inserted++;

        if (inserted % 1000 === 0) {
          console.log(`  ✓ ${inserted}/${insumosArray.length} insertados...`);
        }
      } catch (e) {
        errors++;
        if (errorDetails.length < 10) {
          errorDetails.push(`${ins.codigo_insumo} (${ins.codigo_partida}): ${e.message.substring(0, 50)}`);
        }
      }
    }

    console.log(`\n✓ ${inserted} insumos insertados\n`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errores encontrados`);
      if (errorDetails.length > 0) {
        console.log('Primeros errores:');
        errorDetails.forEach(e => console.log(`  - ${e}`));
      }
      console.log();
    }

    const { rows: [{ count }] } = await client.query('SELECT COUNT(*) FROM insumos');
    console.log(`✅ OPERACIÓN COMPLETADA\n`);
    console.log(`📊 Estado final:`);
    console.log(`   • Insumos en Supabase: ${count}`);
    console.log(`   • Exitosos: ${inserted}`);
    console.log(`   • Errores: ${errors}`);

  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanAndInsert();
