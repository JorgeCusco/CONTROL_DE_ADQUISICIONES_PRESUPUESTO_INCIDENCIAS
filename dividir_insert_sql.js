const fs = require('fs');
const path = require('path');

console.log('🔄 DIVIDIENDO INSERTS EN CHUNKS\n');
console.log('═'.repeat(150));

function dividirArchivo(inputFile, chunkSize = 500) {
  const content = fs.readFileSync(inputFile, 'utf-8');
  const lines = content.split('\n');

  let insertCount = 0;
  let chunks = [];
  let currentChunk = '';
  let currentInsertCount = 0;
  let header = '';
  let inHeader = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Acumular encabezado
    if (inHeader && (line.startsWith('--') || line.startsWith('BEGIN') || line === '')) {
      header += line + '\n';
      if (line.startsWith('BEGIN')) {
        inHeader = false;
      }
      continue;
    }

    // Contar INSERTs
    if (line.trim().startsWith('INSERT INTO')) {
      currentInsertCount++;
      insertCount++;
    }

    currentChunk += line + '\n';

    // Crear nuevo chunk cuando alcanza el tamaño
    if (currentInsertCount >= chunkSize && line.includes(');')) {
      chunks.push({
        header: header,
        content: currentChunk,
        count: currentInsertCount
      });
      currentChunk = '';
      currentInsertCount = 0;
    }
  }

  // Último chunk
  if (currentChunk.trim()) {
    chunks.push({
      header: header,
      content: currentChunk,
      count: currentInsertCount
    });
  }

  return chunks;
}

// Procesar apus_detallado
console.log('\n1️⃣  Dividiendo INSERT_AA.apus_detallado.sql...\n');

const apusChunks = dividirArchivo('DATA_LAST/INSERT_AA.apus_detallado.sql', 500);

apusChunks.forEach((chunk, idx) => {
  const filename = `DATA_LAST/INSERT_AA.apus_detallado_PART${idx + 1}.sql`;
  const content = chunk.header + '\n' + chunk.content + '\nCOMMIT TRANSACTION;\n';
  fs.writeFileSync(filename, content);
  console.log(`  ✓ Part ${idx + 1}: ${chunk.count} registros (${(content.length / 1024).toFixed(2)} KB)`);
});

console.log(`\n  Total: ${apusChunks.length} archivos generados\n`);

// Procesar insumos
console.log('2️⃣  Dividiendo INSERT_AA.insumos.sql...\n');

const insumosChunks = dividirArchivo('DATA_LAST/INSERT_AA.insumos.sql', 500);

insumosChunks.forEach((chunk, idx) => {
  const filename = `DATA_LAST/INSERT_AA.insumos_PART${idx + 1}.sql`;
  const content = chunk.header + '\n' + chunk.content + '\nCOMMIT TRANSACTION;\n';
  fs.writeFileSync(filename, content);
  console.log(`  ✓ Part ${idx + 1}: ${chunk.count} registros (${(content.length / 1024).toFixed(2)} KB)`);
});

console.log(`\n  Total: ${insumosChunks.length} archivos generados\n`);

console.log('═'.repeat(150));
console.log('\n✅ DIVISIÓN COMPLETADA\n');
console.log(`APUS_DETALLADO: ${apusChunks.length} partes`);
console.log(`INSUMOS: ${insumosChunks.length} partes\n`);
console.log('📝 INSTRUCCIONES:\n');
console.log('1. Ejecuta en orden las PARTS de apus_detallado (1 → final)');
console.log('2. Luego ejecuta en orden las PARTS de insumos (1 → final)');
console.log('3. En Supabase SQL Editor: copia y pega cada parte, luego "Run"\n');
