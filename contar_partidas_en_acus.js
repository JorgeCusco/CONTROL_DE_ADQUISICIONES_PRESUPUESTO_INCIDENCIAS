const fs = require('fs');

console.log('='.repeat(120));
console.log('📊 ANÁLISIS DE ACUS.csv vs PARTIDAS.csv');
console.log('='.repeat(120));

// 1. Analizar ACUS.csv
console.log('\n1️⃣ ACUS.csv (TABLAS_FINAL_BOM)\n');

const acusPath = 'DATA_LAST/TABLAS_FINAL_BOM/ACUS.csv';
const acusContent = fs.readFileSync(acusPath, 'utf-8');
const acusLineas = acusContent.split('\n').filter(l => l.trim());

console.log(`   Total líneas: ${acusLineas.length}`);
console.log(`   Total registros (sin header): ${acusLineas.length - 1}`);

// Extraer partidas únicas
const partidasEnAcus = new Set();
for (let i = 1; i < acusLineas.length; i++) {
  const valores = acusLineas[i].split(',');
  const partida = valores[0] ? valores[0].trim() : '';
  if (partida.match(/^OE\.\d+/)) {
    partidasEnAcus.add(partida);
  }
}

console.log(`   ✅ Partidas ÚNICAS en ACUS.csv: ${partidasEnAcus.size}`);

// 2. Analizar PARTIDAS.csv
console.log('\n2️⃣ PARTIDAS.csv (DATA_LAST)\n');

const partidasPath = 'DATA_LAST/PARTIDAS.csv';
const partidasContent = fs.readFileSync(partidasPath, 'utf-8');
const partidasLineas = partidasContent.split('\n').filter(l => l.trim());

console.log(`   Total registros: ${partidasLineas.length - 1}`);

const partidasEnPartidas = new Set();
for (let i = 1; i < partidasLineas.length; i++) {
  const valores = partidasLineas[i].split(',');
  const partida = valores[0] ? valores[0].trim() : '';
  if (partida.match(/^OE\.\d+/)) {
    partidasEnPartidas.add(partida);
  }
}

console.log(`   ✅ Partidas ÚNICAS en PARTIDAS.csv: ${partidasEnPartidas.size}`);

// 3. Comparación
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`📊 COMPARACIÓN\n`);

const enAcusNoEnPartidas = Array.from(partidasEnAcus).filter(p => !partidasEnPartidas.has(p));
const enPartidasNoEnAcus = Array.from(partidasEnPartidas).filter(p => !partidasEnAcus.has(p));
const enAmbos = Array.from(partidasEnAcus).filter(p => partidasEnPartidas.has(p));

console.log(`   ACUS.csv tiene: ${partidasEnAcus.size} partidas únicas`);
console.log(`   PARTIDAS.csv tiene: ${partidasEnPartidas.size} partidas únicas`);
console.log(`\n   ✅ EN AMBOS: ${enAmbos.length}`);
console.log(`   ❌ EN ACUS pero NO en PARTIDAS: ${enAcusNoEnPartidas.length}`);
console.log(`   ⚠️  EN PARTIDAS pero NO en ACUS: ${enPartidasNoEnAcus.length}`);

// 4. Verificar si ACUS tiene TODAS las 1,135
console.log(`\n${'-'.repeat(120)}\n`);

if (partidasEnAcus.size === 1135) {
  console.log(`✅ CORRECTO: ACUS.csv TIENE las 1,135 partidas\n`);
  console.log(`   ACUS.csv: ${partidasEnAcus.size} partidas (COMPLETO)`);
  console.log(`   Registros insumos en ACUS: ${acusLineas.length - 1}`);
  console.log(`   Promedio insumos por partida: ${((acusLineas.length - 1) / partidasEnAcus.size).toFixed(1)}`);
} else if (partidasEnAcus.size > 1100) {
  console.log(`🟡 CASI COMPLETO: ACUS.csv tiene ${partidasEnAcus.size}/1,135 partidas`);
  console.log(`   Faltan: ${1135 - partidasEnAcus.size} partidas\n`);

  if (enPartidasNoEnAcus.length > 0) {
    console.log(`   Partidas faltantes (muestra):`);
    enPartidasNoEnAcus.slice(0, 10).forEach(p => {
      console.log(`      ❌ ${p}`);
    });
    if (enPartidasNoEnAcus.length > 10) {
      console.log(`      ... y ${enPartidasNoEnAcus.length - 10} más`);
    }
  }
} else {
  console.log(`❌ INCOMPLETO: ACUS.csv solo tiene ${partidasEnAcus.size}/1,135 partidas`);
  console.log(`   Falta ${1135 - partidasEnAcus.size} partidas`);
}

console.log(`\n${'-'.repeat(120)}\n`);
