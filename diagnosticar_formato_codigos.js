const fs = require('fs');
const csv = require('csv-parse/sync');

console.log('🔍 INVESTIGANDO FORMATO DE CÓDIGOS\n');
console.log('═'.repeat(150));

// 1. Códigos en INSERT_PARTIDAS.sql
console.log('\n1️⃣  FORMATO en INSERT_PARTIDAS.sql:\n');
const sqlContent = fs.readFileSync('DATA_LAST/INSERT_PARTIDAS.sql', 'utf-8');
const sqlCodigos = [];

sqlContent.split('\n').forEach(line => {
  const match = line.match(/^\('(O[^']+)'/);
  if (match) sqlCodigos.push(match[1]);
});

console.log(`  Total: ${sqlCodigos.length}`);
console.log(`  Ejemplos:\n`);
sqlCodigos.slice(0, 5).forEach(c => console.log(`    - ${c}`));

// 2. Códigos en APUS_DETALLADO.csv
console.log('\n\n2️⃣  FORMATO en APUS_DETALLADO.csv:\n');
const apusContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
const apusRecords = csv.parse(apusContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

const apusCodigos = [...new Set(apusRecords.map(r => r.partida_codigo))];
console.log(`  Total: ${apusCodigos.length}`);
console.log(`  Ejemplos:\n`);
apusCodigos.slice(0, 5).forEach(c => console.log(`    - ${c}`));

// 3. Análisis de formato
console.log('\n\n3️⃣  ANÁLISIS DE FORMATO\n');

const conPuntosOE = apusCodigos.filter(c => c.match(/^O\.E\./)).length;
const sinPuntosOE = apusCodigos.filter(c => c.match(/^OE\./) && !c.match(/^O\.E\./)).length;
const otros = apusCodigos.length - conPuntosOE - sinPuntosOE;

console.log(`  En APUS_DETALLADO.csv:`);
console.log(`    - Con formato "O.E.": ${conPuntosOE}`);
console.log(`    - Con formato "OE.": ${sinPuntosOE}`);
console.log(`    - Otros: ${otros}\n`);

const ejemploConPuntos = apusCodigos.find(c => c.match(/^O\.E\./));
const ejemploSinPuntos = apusCodigos.find(c => c.match(/^OE\./) && !c.match(/^O\.E\./));

console.log(`  Ejemplo con "O.E.": ${ejemploConPuntos}`);
console.log(`  Ejemplo con "OE.": ${ejemploSinPuntos}\n`);

console.log('═'.repeat(150));
console.log('\n🎯 PROBLEMA IDENTIFICADO\n');
console.log(`INSERT_PARTIDAS.sql usa formato: "OE.X.X.X.X"`);
console.log(`APUS_DETALLADO.csv usa AMBOS formatos:`);
console.log(`  - ${conPuntosOE} con "O.E.X.X.X.X"`);
console.log(`  - ${sinPuntosOE} con "OE.X.X.X.X"`);
console.log(`\n⚠️  ESTO CAUSA MISMATCH EN EL MATCH!\n`);
console.log(`Las partidas con "O.E." no encuentran descripción porque se busca "OE."\n`);

