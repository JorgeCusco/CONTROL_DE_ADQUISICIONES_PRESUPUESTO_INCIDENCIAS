const fs = require('fs');
const csv = require('csv-parse/sync');

console.log('🔍 BUSCANDO LAS 106 PARTIDAS FALTANTES EN LOS SOURCE FILES\n');
console.log('═'.repeat(150));

// Partidas que faltan
const faltantes = [
  'O.E.3.1.11.1', 'OE.1.1.1.2', 'OE.1.1.1.3', 'OE.1.1.2.1', 'OE.1.1.2.2',
  'OE.2.4.1.1', 'OE.2.4.1.10', 'OE.2.4.1.11'
];

// 1. Buscar en APUS_DETALLADO.csv
console.log('\n1️⃣  Buscando en APUS_DETALLADO.csv...\n');
try {
  const apusContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
  const apusRecords = csv.parse(apusContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  const apusPartidas = new Set(apusRecords.map(r => r.partida_codigo));
  const encontradasEnApus = faltantes.filter(p => apusPartidas.has(p));

  console.log(`  Total partidas en APUS_DETALLADO: ${apusPartidas.size}`);
  console.log(`  Partidas faltantes encontradas en APUS: ${encontradasEnApus.length}`);
  if (encontradasEnApus.length > 0) {
    console.log(`  Ejemplos:\n`);
    encontradasEnApus.slice(0, 5).forEach(p => {
      const sample = apusRecords.find(r => r.partida_codigo === p);
      console.log(`    - ${p}: ${sample.partida_descripcion.substring(0, 50)}`);
    });
  }
} catch (e) {
  console.log(`  ❌ Error: ${e.message}`);
}

// 2. Buscar en APU_PRESUPUESTO_LIMPIO.csv
console.log('\n\n2️⃣  Buscando en APU_PRESUPUESTO_LIMPIO.csv...\n');
try {
  const apuContent = fs.readFileSync('DATA_LAST/APU_PRESUPUESTO_LIMPIO.csv', 'utf-8');
  const apuRecords = csv.parse(apuContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  const apuPartidas = new Set(apuRecords.map(r => r.partida_codigo));
  const encontradasEnApu = faltantes.filter(p => apuPartidas.has(p));

  console.log(`  Total partidas en APU_PRESUPUESTO: ${apuPartidas.size}`);
  console.log(`  Partidas faltantes encontradas: ${encontradasEnApu.length}`);
  if (encontradasEnApu.length > 0) {
    console.log(`  Ejemplos:\n`);
    encontradasEnApu.slice(0, 5).forEach(p => {
      const sample = apuRecords.find(r => r.partida_codigo === p);
      console.log(`    - ${p}: ${sample.partida_descripcion.substring(0, 50)}`);
    });
  }
} catch (e) {
  console.log(`  ❌ Error: ${e.message}`);
}

console.log('\n═'.repeat(150));
console.log('\n🎯 EXPLICACIÓN\n');
console.log(`Las 106 partidas sin descripción provienen de APUS_DETALLADO.csv`);
console.log(`Pero estas partidas NO están en INSERT_PARTIDAS.sql`);
console.log(`\n¿POR QUÉ?\n`);
console.log(`Probablemente porque:\n`);
console.log(`1. INSERT_PARTIDAS.sql se generó de PRESUPUESTO.xlsx (solo las partidas principales)`);
console.log(`2. APUS_DETALLADO.csv tiene más partidas (incluyendo sub-partidas)`);
console.log(`3. Cuando cargaste INSERT_INSUMOS.sql, cargó insumos de partidas que no existían aún\n`);

console.log(`SOLUCIÓN:\n`);
console.log(`Necesito generar un INSERT adicional para esas 106 partidas faltantes`);
console.log(`extrayéndolas de APUS_DETALLADO.csv\n`);
