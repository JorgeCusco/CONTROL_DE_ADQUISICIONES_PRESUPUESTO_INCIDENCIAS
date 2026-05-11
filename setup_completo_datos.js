require('dotenv').config();
const fs = require('fs');
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_CONNECTION_STRING
});

async function setupCompleto() {
  const client = await pool.connect();
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  SETUP COMPLETO: POBLADO DE TABLAS partidas, apus_detallado, insumos');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ========== PASO 1: VACIAR Y POBLAR apus_detallado ==========
    console.log('📋 PASO 1: Poblar apus_detallado desde APUS_Extraidos_v2.csv\n');

    console.log('🗑️  Vaciando apus_detallado...');
    await client.query('TRUNCATE TABLE apus_detallado RESTART IDENTITY CASCADE');
    console.log('✓ apus_detallado vaciada\n');

    console.log('📖 Leyendo APUS_Extraidos_v2.csv...');
    const csvContent = fs.readFileSync('APUS_Extraidos_v2.csv', 'utf8');
    const lines = csvContent.split('\n');

    // Parse CSV headers
    const headers = lines[0]
      .split(',')
      .map(h => h.replace(/^"|"$/g, '').trim());

    const registrosAPUS = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const row = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
      if (row.length < 13) continue;

      registrosAPUS.push({
        Partida_Codigo: row[0],
        Partida_Descripcion: row[1],
        Partida_Rendimiento: row[2],
        Partida_Unidad: row[3],
        Partida_Costo_Unitario: parseFloat(row[4]) || null,
        Tipo_Insumo: row[5],
        Insumo_Codigo: parseInt(row[6]) || null,
        Insumo_Descripcion: row[7],
        Insumo_Unidad: row[8],
        Insumo_Recursos: row[9] ? parseFloat(row[9]) : null,
        Insumo_Cantidad: parseFloat(row[10]) || 0,
        Insumo_Precio: parseFloat(row[11]) || 0,
        Insumo_Parcial: parseFloat(row[12]) || 0
      });
    }

    console.log(`✓ ${registrosAPUS.length} registros leídos del CSV\n`);

    // INSERT en apus_detallado
    console.log('⏳ Insertando en apus_detallado...');
    let insertedAPUS = 0;
    for (const reg of registrosAPUS) {
      try {
        await client.query(
          `INSERT INTO apus_detallado
           ("Partida_Codigo", "Partida_Descripcion", "Partida_Rendimiento", "Partida_Unidad",
            "Partida_Costo_Unitario", "Tipo_Insumo", "Insumo_Codigo", "Insumo_Descripcion",
            "Insumo_Unidad", "Insumo_Recursos", "Insumo_Cantidad", "Insumo_Precio", "Insumo_Parcial")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            reg.Partida_Codigo,
            reg.Partida_Descripcion,
            reg.Partida_Rendimiento,
            reg.Partida_Unidad,
            reg.Partida_Costo_Unitario,
            reg.Tipo_Insumo,
            reg.Insumo_Codigo,
            reg.Insumo_Descripcion,
            reg.Insumo_Unidad,
            reg.Insumo_Recursos,
            reg.Insumo_Cantidad,
            reg.Insumo_Precio,
            reg.Insumo_Parcial
          ]
        );
        insertedAPUS++;
      } catch (e) {
        console.log(`⚠️  Error en ${reg.Insumo_Codigo}: ${e.message.substring(0, 60)}`);
      }
    }
    console.log(`✓ ${insertedAPUS} registros insertados en apus_detallado\n`);

    // ========== PASO 2: VACIAR E INSERTAR insumos DESDE apus_detallado ==========
    console.log('📋 PASO 2: Poblar insumos derivado de apus_detallado\n');

    console.log('🗑️  Vaciando tabla insumos...');
    await client.query('DELETE FROM insumos');
    console.log('✓ Tabla insumos vaciada\n');

    console.log('⏳ Derivando insumos desde apus_detallado (via SQL)...');
    const resultInsertInsumos = await client.query(`
      INSERT INTO insumos (codigo_partida, codigo_insumo, descripcion, unidad,
                           incidencia_original, parcial_original, incidencia,
                           cantidad_modificada, cantidad_adquirida)
      SELECT
        SUBSTRING("Partida_Codigo", 1, 50) as codigo_partida,
        SUBSTRING(CAST("Insumo_Codigo" AS TEXT), 1, 50) as codigo_insumo,
        SUBSTRING("Insumo_Descripcion", 1, 255) as descripcion,
        SUBSTRING("Insumo_Unidad", 1, 20) as unidad,
        "Insumo_Cantidad" as incidencia_original,
        "Insumo_Parcial" as parcial_original,
        "Insumo_Cantidad" as incidencia,
        0 as cantidad_modificada,
        0 as cantidad_adquirida
      FROM apus_detallado
      WHERE "Partida_Codigo" IN (SELECT codigo FROM partidas)
    `);

    console.log(`✓ ${resultInsertInsumos.rowCount} insumos derivados e insertados\n`);

    // ========== PASO 3: ACTUALIZAR CON DATOS DE LISTA_INSUMOS.xls ==========
    console.log('📋 PASO 3: Actualizar insumos con datos de LISTA_INSUMOS.xls\n');

    console.log('📖 Leyendo LISTA_INSUMOS.xls...');
    const filePath = path.join(__dirname, 'LISTA_INSUMOS.xls');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataXLS = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const insumosActualizados = {};
    for (let i = 1; i < dataXLS.length; i++) {
      const row = dataXLS[i];
      if (!row[0]) continue;

      const codigoInsumo = String(row[0]).trim();
      insumosActualizados[codigoInsumo] = {
        descripcion: String(row[1] || '').trim(),
        unidad: String(row[2] || '').trim(),
        incidencia_original: parseFloat(row[3]) || 0,
        parcial_original: parseFloat(row[5]) || 0
      };
    }
    console.log(`✓ ${Object.keys(insumosActualizados).length} insumos con datos actualizados\n`);

    console.log('⏳ Actualizando insumos...');
    let updated = 0;
    for (const [codigo, datos] of Object.entries(insumosActualizados)) {
      try {
        const result = await client.query(
          `UPDATE insumos SET
             descripcion = $1,
             unidad = $2,
             incidencia_original = $3,
             parcial_original = $4,
             incidencia = $3
           WHERE codigo_insumo = $5`,
          [
            datos.descripcion,
            datos.unidad,
            datos.incidencia_original,
            datos.parcial_original,
            codigo
          ]
        );
        updated += result.rowCount;
      } catch (e) {
        // Silenciar errores de insumos que no existen
      }
    }
    console.log(`✓ ${updated} registros actualizados desde Excel\n`);

    // ========== VERIFICACIÓN FINAL ==========
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ SETUP COMPLETADO - VERIFICACIÓN FINAL');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const countPartidas = await client.query('SELECT COUNT(*) as count FROM partidas');
    const countAPUS = await client.query('SELECT COUNT(*) as count FROM apus_detallado');
    const countInsumos = await client.query('SELECT COUNT(*) as count FROM insumos');

    console.log('📊 Estado final de tablas:\n');
    console.log(`  partidas:        ${countPartidas.rows[0].count} registros`);
    console.log(`  apus_detallado:  ${countAPUS.rows[0].count} registros`);
    console.log(`  insumos:         ${countInsumos.rows[0].count} registros\n`);

    // Estadísticas por partida
    const statsPartida = await client.query(`
      SELECT codigo_partida, COUNT(*) as insumos_count
      FROM insumos
      GROUP BY codigo_partida
      ORDER BY insumos_count DESC
      LIMIT 5
    `);

    console.log('📈 Top 5 partidas por cantidad de insumos:\n');
    for (const row of statsPartida.rows) {
      console.log(`  ${row.codigo_partida}: ${row.insumos_count} insumos`);
    }

    console.log('\n✅ SETUP EXITOSO - Sistema listo para usar');

  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupCompleto();
