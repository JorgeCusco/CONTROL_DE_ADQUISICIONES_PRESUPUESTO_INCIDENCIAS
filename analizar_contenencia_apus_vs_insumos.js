const fs = require('fs');
const csv = require('csv-parse/sync');
const XLSX = require('xlsx');

console.log('🔍 ANÁLISIS: ¿APUS_DETALLADO contiene INSUMOS.xlsx?\n');
console.log('═'.repeat(200));

// 1. Leer APUS_DETALLADO.csv
console.log('\n1️⃣  Leyendo APUS_DETALLADO.csv...\n');

const apusContent = fs.readFileSync('DATA_LAST/APUS_DETALLADO.csv', 'utf-8');
const apusRecords = csv.parse(apusContent, {
  columns: true,
  skip_empty_lines: true,
  bom: true
});

const apusCodigos = new Set(apusRecords.map(r => String(r.insumo_codigo).trim()));
console.log(`  ✓ APUS_DETALLADO: ${apusRecords.length} registros`);
console.log(`  ✓ Insumos únicos: ${apusCodigos.size}\n`);

// 2. Leer INSUMOS.xlsx
console.log('2️⃣  Leyendo DATA_LAST/INSUMOS.xlsx...\n');

const insumosBook = XLSX.readFile('DATA_LAST/INSUMOS.xlsx');
const insumosSheet = insumosBook.Sheets['Sheet'];
const insumosData = XLSX.utils.sheet_to_json(insumosSheet, { defval: '' });

const insumosCodigos = new Set();
const insumosArray = [];

insumosData.forEach(row => {
  if (row.Código && String(row.Código).trim()) {
    const codigo = String(row.Código).trim();
    insumosCodigos.add(codigo);
    insumosArray.push({
      codigo: codigo,
      descripcion: row.Descripción,
      cantidad: parseFloat(row.Cantidad) || 0,
      costo: parseFloat(row.Costo) || 0,
      total: parseFloat(row.Total) || 0
    });
  }
});

console.log(`  ✓ INSUMOS.xlsx: ${insumosData.length} registros`);
console.log(`  ✓ Insumos con código: ${insumosCodigos.size}\n`);

// 3. ANÁLISIS
console.log('3️⃣  ANÁLISIS DE CONTENENCIA\n');

const enAmbos = new Set([...apusCodigos].filter(x => insumosCodigos.has(x)));
const soloEnApus = new Set([...apusCodigos].filter(x => !insumosCodigos.has(x)));
const soloEnInsumos = new Set([...insumosCodigos].filter(x => !apusCodigos.has(x)));

const pctApusEnInsumos = ((enAmbos.size / apusCodigos.size) * 100).toFixed(2);
const pctInsumosEnApus = ((enAmbos.size / insumosCodigos.size) * 100).toFixed(2);

console.log('COMPARATIVA:\n');
console.log(`  📊 APUS_DETALLADO:    ${apusCodigos.size} insumos únicos`);
console.log(`  📊 INSUMOS.xlsx:      ${insumosCodigos.size} insumos únicos\n`);

console.log(`  ✅ EN AMBOS:          ${enAmbos.size} insumos`);
console.log(`     - Del total APUS:  ${pctApusEnInsumos}% (${enAmbos.size}/${apusCodigos.size})`);
console.log(`     - Del total XLSX:  ${pctInsumosEnApus}% (${enAmbos.size}/${insumosCodigos.size})\n`);

console.log(`  ⚠️  SOLO EN APUS:      ${soloEnApus.size} insumos (${((soloEnApus.size/apusCodigos.size)*100).toFixed(2)}%)`);
console.log(`     → NO están en INSUMOS.xlsx\n`);

console.log(`  ⚠️  SOLO EN INSUMOS:   ${soloEnInsumos.size} insumos (${((soloEnInsumos.size/insumosCodigos.size)*100).toFixed(2)}%)`);
console.log(`     → NO están en APUS_DETALLADO\n`);

// 4. CONCLUSIÓN
console.log('\n' + '═'.repeat(200));
console.log('\n🎯 CONCLUSIÓN\n');

if (soloEnInsumos.size === 0) {
  console.log('✅ APUS_DETALLADO CONTIENE INSUMOS.xlsx (100%)');
  console.log('   → Todos los insumos de INSUMOS.xlsx están en APUS_DETALLADO');
  console.log('   → APUS_DETALLADO es SUPERSET de INSUMOS.xlsx\n');
} else if (soloEnApus.size === 0) {
  console.log('❌ INSUMOS.xlsx CONTIENE APUS_DETALLADO (100%)');
  console.log('   → Todos los insumos de APUS_DETALLADO están en INSUMOS.xlsx');
  console.log('   → INSUMOS.xlsx es SUPERSET de APUS_DETALLADO\n');
} else {
  console.log('⚠️  INTERSECCIÓN PARCIAL');
  console.log(`   → ${pctApusEnInsumos}% de APUS está en INSUMOS.xlsx`);
  console.log(`   → ${pctInsumosEnApus}% de INSUMOS.xlsx está en APUS\n`);
}

// 5. Ejemplos
console.log('\n📋 EJEMPLOS DE DIFERENCIAS:\n');

if (soloEnInsumos.size > 0) {
  console.log('Insumos en INSUMOS.xlsx QUE NO están en APUS_DETALLADO:\n');
  Array.from(soloEnInsumos).slice(0, 10).forEach((cod, idx) => {
    const item = insumosArray.find(i => i.codigo === cod);
    console.log(`  ${(idx+1).toString().padStart(2)}. [${cod}] ${item.descripcion.substring(0, 50)} | Qty: ${item.cantidad} | Total: ${item.total}`);
  });
}

if (soloEnApus.size > 0) {
  console.log('\n\nInsumos en APUS_DETALLADO QUE NO están en INSUMOS.xlsx:\n');
  Array.from(soloEnApus).slice(0, 10).forEach((cod, idx) => {
    const item = apusRecords.find(r => String(r.insumo_codigo).trim() === cod);
    console.log(`  ${(idx+1).toString().padStart(2)}. [${cod}] ${item.insumo_descripcion.substring(0, 50)}`);
  });
}

// 6. Datos Económicos
console.log('\n\n' + '═'.repeat(200));
console.log('\n💰 ANÁLISIS ECONÓMICO\n');

// Total en INSUMOS.xlsx
const totalInsumos = insumosArray.reduce((sum, item) => sum + item.total, 0);

// Total que está en APUS (por los que están en ambos)
const totalEnAmbos = insumosArray
  .filter(item => apusCodigos.has(item.codigo))
  .reduce((sum, item) => sum + item.total, 0);

const totalSoloEnInsumos = insumosArray
  .filter(item => !apusCodigos.has(item.codigo))
  .reduce((sum, item) => sum + item.total, 0);

console.log(`Total comprado (INSUMOS.xlsx):          ${totalInsumos.toFixed(2)}`);
console.log(`Total que está en APUS:                ${totalEnAmbos.toFixed(2)} (${((totalEnAmbos/totalInsumos)*100).toFixed(2)}%)`);
console.log(`Total NO contemplado en APUS:          ${totalSoloEnInsumos.toFixed(2)} (${((totalSoloEnInsumos/totalInsumos)*100).toFixed(2)}%)\n`);

console.log('═'.repeat(200) + '\n');
