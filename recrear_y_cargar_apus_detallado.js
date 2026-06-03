const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parse/sync');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function recrearYCargarAPUsDetallado() {
  const client = await pool.connect();
  try {
    console.log('🔄 RECREANDO TABLA apus_detallado Y CARGANDO DATOS\n');
    console.log('═'.repeat(160));

    // 1. Verificar y recrear tabla
    console.log('\n1️⃣  Recreando tabla apus_detallado...\n');

    await client.query('DROP TABLE IF EXISTS apus_detallado CASCADE');
    console.log('  ✅ Tabla eliminada (si existía)');

    const createTableQuery = `
      CREATE TABLE apus_detallado (
        id SERIAL PRIMARY KEY,
        partida_codigo VARCHAR(50) NOT NULL,
        partida_descripcion TEXT,
        partida_rendimiento VARCHAR(100),
        partida_unidad VARCHAR(50),
        partida_costo_unitario DECIMAL(12, 4),
        tipo_insumo VARCHAR(50),
        insumo_codigo VARCHAR(50),
        insumo_descripcion TEXT,
        insumo_unidad VARCHAR(50),
        insumo_recursos DECIMAL(10, 4),
        insumo_cantidad DECIMAL(10, 4),
        insumo_precio DECIMAL(12, 4),
        insumo_parcial DECIMAL(12, 4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('  ✅ Tabla creada correctamente\n');

    // 2. Leer CSV
    console.log('2️⃣  Leyendo APUS_Extraidos_v2.csv...\n');

    const csvContent = fs.readFileSync('APUS_Extraidos_v2.csv', 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });

    console.log(`  ✅ CSV leído: ${records.length} registros\n`);

    // 3. Cargar datos
    console.log('3️⃣  Cargando datos (esto toma un momento)...\n');

    let insertados = 0;
    let errores = 0;
    let batches = 0;

    for (const record of records) {
      try {
        await client.query(
          `INSERT INTO apus_detallado (
            partida_codigo,
            partida_descripcion,
            partida_rendimiento,
            partida_unidad,
            partida_costo_unitario,
            tipo_insumo,
            insumo_codigo,
            insumo_descripcion,
            insumo_unidad,
            insumo_recursos,
            insumo_cantidad,
            insumo_precio,
            insumo_parcial
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            record.Partida_Codigo || '',
            record.Partida_Descripcion || '',
            record.Partida_Rendimiento || '',
            record.Partida_Unidad || '',
            parseFloat(record.Partida_Costo_Unitario) || 0,
            record.Tipo_Insumo || '',
            record.Insumo_Codigo || '',
            record.Insumo_Descripcion || '',
            record.Insumo_Unidad || '',
            parseFloat(record.Insumo_Recursos) || 0,
            parseFloat(record.Insumo_Cantidad) || 0,
            parseFloat(record.Insumo_Precio) || 0,
            parseFloat(record.Insumo_Parcial) || 0
          ]
        );
        insertados++;

        if (insertados % 500 === 0) {
          batches++;
          process.stdout.write('.');
        }
      } catch (e) {
        errores++;
      }
    }

    console.log('\n  ✅ Carga completada\n');

    // 4. Verificar
    console.log('4️⃣  Verificando datos...\n');

    const countResult = await client.query('SELECT COUNT(*) as count FROM apus_detallado');
    const countPartidas = await client.query(
      'SELECT COUNT(DISTINCT partida_codigo) as count FROM apus_detallado'
    );
    const countInsumos = await client.query(
      'SELECT COUNT(DISTINCT insumo_codigo) as count FROM apus_detallado'
    );
    const countTipos = await client.query(
      'SELECT DISTINCT tipo_insumo, COUNT(*) as count FROM apus_detallado GROUP BY tipo_insumo'
    );

    console.log(`  📊 Total registros: ${countResult.rows[0].count}`);
    console.log(`  📊 Partidas únicas: ${countPartidas.rows[0].count}`);
    console.log(`  📊 Insumos únicos: ${countInsumos.rows[0].count}`);
    console.log(`  ✅ Insertados: ${insertados}`);
    console.log(`  ❌ Errores: ${errores}\n`);

    console.log('  Distribución por tipo de insumo:\n');
    countTipos.rows.forEach(row => {
      console.log(`    ${row.tipo_insumo.padEnd(20)}: ${row.count} registros`);
    });

    // 5. Muestras
    console.log('\n5️⃣  Muestreo de datos:\n');

    const sample = await client.query(`
      SELECT
        partida_codigo,
        partida_descripcion,
        partida_rendimiento,
        partida_costo_unitario,
        tipo_insumo,
        insumo_descripcion,
        insumo_precio
      FROM apus_detallado
      LIMIT 10
    `);

    sample.rows.forEach((row, idx) => {
      console.log(`  ${(idx+1).toString().padStart(2)}. [${row.partida_codigo}] ${row.partida_descripcion.substring(0, 40).padEnd(40)} | Rendimiento: ${row.partida_rendimiento} | Costo: ${row.partida_costo_unitario}`);
    });

    console.log('\n' + '═'.repeat(160));
    console.log('\n✅ ¡TABLA apus_detallado RECREADA Y CARGADA!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

recrearYCargarAPUsDetallado();
