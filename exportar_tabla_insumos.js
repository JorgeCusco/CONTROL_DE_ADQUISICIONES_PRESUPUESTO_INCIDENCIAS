const { Pool } = require('pg');
const { stringify } = require('csv-stringify/sync');
const fs = require('fs');

async function exportarInsumos() {
  console.log('📥 EXPORTANDO TABLA INSUMOS A CSV\n');
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

    console.log('\n1️⃣  Leyendo tabla insumos completa...\n');
    
    const res = await client.query(`
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

    console.log(`  ✓ ${res.rows.length} registros leídos\n`);

    // Generar CSV
    console.log('2️⃣  Generando CSV...\n');

    const csvContent = stringify(res.rows, {
      header: true,
      columns: [
        'id',
        'codigo_partida',
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

    console.log(`  ✓ CSV creado: DATA_LAST/TABLA_INSUMOS.csv\n`);
    console.log(`  Tamaño: ${(csvContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Registros: ${res.rows.length}\n`);

    console.log('═'.repeat(150));
    console.log('\n✅ TABLA EXPORTADA\n');
    console.log('Archivo: DATA_LAST/TABLA_INSUMOS.csv');
    console.log(`Contiene: ${res.rows.length} insumos con TODOS los campos\n`);

    client.release();
    await pool.end();

  } catch (err) {
    console.error('Error:', err.message);
  }
}

exportarInsumos();
