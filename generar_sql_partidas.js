const XLSX = require('xlsx');
const fs = require('fs');

console.log('📊 ANALIZANDO HOJA PRESUPUESTO Y GENERANDO SQL INSERT\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');
const presupuestoSheet = book.Sheets['PRESUPUESTO'];

// Leer datos de PRESUPUESTO
const presupuestoData = XLSX.utils.sheet_to_json(presupuestoSheet, { defval: '' });

console.log(`\n✓ Registros encontrados: ${presupuestoData.length}\n`);

// Mostrar primeras filas para verificar estructura
console.log('📋 PRIMERAS FILAS (para verificar mapeo):\n');
presupuestoData.slice(0, 5).forEach((row, idx) => {
  console.log(`${idx}. ${JSON.stringify(row)}`);
});

// Mapear datos según especificación del usuario
// A=Código, B=Descripción, C=Unidad, D=Metrado Fijo (y cantidad_presupuestada), E=Precio_unitario, F=Total
const partidas = [];

const headers = Object.keys(presupuestoData[0] || {});
console.log(`\n✓ Headers encontrados: ${headers.join(' | ')}\n`);

presupuestoData.forEach((row, idx) => {
  // Identificar columnas por índice (A=0, B=1, C=2, D=3, E=4, F=5)
  const headerArray = Object.keys(row);

  const codigo = row[headerArray[0]] || '';  // Columna A
  const descripcion = row[headerArray[1]] || '';  // Columna B
  const unidad = row[headerArray[2]] || '';  // Columna C
  const metrado_fijo = parseFloat(row[headerArray[3]]) || 0;  // Columna D
  const cantidad_presupuestada = parseFloat(row[headerArray[3]]) || 0;  // Columna D (igual)
  const precio_unitario = parseFloat(row[headerArray[4]]) || 0;  // Columna E
  const total = parseFloat(row[headerArray[5]]) || 0;  // Columna F

  if (codigo && codigo.trim()) {  // Solo si hay código
    partidas.push({
      codigo: String(codigo).trim(),
      descripcion: String(descripcion).trim(),
      unidad: String(unidad).trim(),
      metrado_fijo: metrado_fijo,
      cantidad_presupuestada: cantidad_presupuestada,
      precio_unitario_presupuestado: precio_unitario,
      total_presupuestado: total
    });
  }
});

console.log(`✓ Partidas procesadas: ${partidas.length}\n`);

// Mostrar resumen
console.log('📊 RESUMEN DE DATOS:\n');
partidas.slice(0, 10).forEach((p, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. [${p.codigo}] ${p.descripcion.substring(0, 50).padEnd(50)} | Unit: ${p.unidad.padEnd(10)} | Metrado: ${p.metrado_fijo}`);
});

// Generar SQL INSERT
console.log(`\n💾 GENERANDO SQL INSERT...\n`);

let sqlContent = '-- SQL INSERT PARA TABLA PARTIDAS\n';
sqlContent += '-- Generado automáticamente desde PRESUPUESTO.xlsx\n';
sqlContent += '-- Mapeo: A=código, B=descripción, C=unidad, D=metrado_fijo, E=precio_unitario, F=total\n\n';

sqlContent += 'BEGIN TRANSACTION;\n\n';

sqlContent += 'INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado) VALUES\n';

const valueLines = partidas.map((p, idx) => {
  const isLast = idx === partidas.length - 1;
  const ending = isLast ? ';' : ',';
  return `('${p.codigo.replace(/'/g, "''")}', '${p.descripcion.replace(/'/g, "''")}', '${p.unidad.replace(/'/g, "''")}', ${p.metrado_fijo}, ${p.cantidad_presupuestada}, ${p.precio_unitario_presupuestado}, ${p.total_presupuestado})${ending}`;
});

sqlContent += valueLines.join('\n');

sqlContent += '\n\nCOMMIT;\n';

// Guardar SQL
fs.writeFileSync('INSERT_PARTIDAS.sql', sqlContent, 'utf-8');

console.log(`✅ SQL guardado: INSERT_PARTIDAS.sql`);
console.log(`   Tamaño: ${(sqlContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${partidas.length}\n`);

// También generar versión alternativa con parámetros (para Node.js/pg)
console.log(`\n💾 GENERANDO SCRIPT NODE.JS PARA INSERT...\n`);

let nodeScript = `const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:Jo.9839514500@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function insertarPartidas() {
  const client = await pool.connect();
  try {
    console.log('📥 INSERTANDO PARTIDAS A SUPABASE\\n');
    console.log('═'.repeat(150));

    const partidas = ${JSON.stringify(partidas, null, 2)};

    let insertados = 0;

    for (const p of partidas) {
      try {
        await client.query(
          \`INSERT INTO partidas (codigo, descripcion, unidad, metrado_fijo, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado)
           VALUES ($1, $2, $3, $4, $5, $6, $7)\`,
          [p.codigo, p.descripcion, p.unidad, p.metrado_fijo, p.cantidad_presupuestada, p.precio_unitario_presupuestado, p.total_presupuestado]
        );
        insertados++;
      } catch (e) {
        console.error(\`  ❌ Error en \${p.codigo}: \${e.message.split('\\\\n')[0]}\`);
      }
    }

    console.log(\`\\n✅ Partidas insertadas: \${insertados} / \${partidas.length}\\n\`);

    // Verificar
    const result = await client.query('SELECT COUNT(*) as count FROM partidas');
    console.log(\`  📊 Total en BD: \${result.rows[0].count}\\n\`);

    console.log('═'.repeat(150));
    console.log('\\n✅ ¡PARTIDAS CARGADAS!\\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarPartidas();
`;

fs.writeFileSync('cargar_partidas_supabase.js', nodeScript, 'utf-8');

console.log(`✅ Script Node.js guardado: cargar_partidas_supabase.js\n`);

console.log('═'.repeat(160));
console.log('\n✅ LISTO PARA INSERTAR\n');
console.log('Opciones:');
console.log('  1️⃣  SQL directo: Ejecutar INSERT_PARTIDAS.sql en tu BD');
console.log('  2️⃣  Via Node.js: node cargar_partidas_supabase.js\n');
