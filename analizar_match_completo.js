const XLSX = require('xlsx');
const fs = require('fs');
const csv = require('csv-parse/sync');

console.log('🔍 ANÁLISIS COMPLETO DE MATCH - FUENTES DEL MISMO PROGRAMA DELFÍN\n');
console.log('═'.repeat(180));

try {
  // 1. LEER APU Y PRESUPUESTO.xlsx
  console.log('\n1️⃣  LEYENDO "APU Y PRESUPUESTO.xlsx" (3 hojas)\n');
  
  const book = XLSX.readFile('DATA_LAST/APU Y PRESUPUESTO.xlsx');
  console.log(`  Hojas disponibles: ${book.SheetNames.join(', ')}\n`);

  // Analizar cada hoja
  const hojas = {};
  
  book.SheetNames.forEach(sheetName => {
    const sheet = book.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    hojas[sheetName] = data;
    console.log(`  📄 Hoja "${sheetName}": ${data.length} registros`);
  });

  // 2. LEER PARTIDAS.csv
  console.log('\n\n2️⃣  LEYENDO PARTIDAS.csv\n');
  
  const partidasCSV = fs.readFileSync('DATA_LAST/PARTIDAS.csv', 'utf-8');
  const partidasRecords = csv.parse(partidasCSV, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`  Total registros: ${partidasRecords.length}\n`);
  console.log(`  Columnas: ${Object.keys(partidasRecords[0] || {}).join(', ')}\n`);

  // 3. ANÁLISIS DE MATCH
  console.log('═'.repeat(180));
  console.log('\n3️⃣  ANÁLISIS DE MATCH\n');

  // Identificar hojas por contenido
  let hojaPRESUPUESTO = null;
  let hojaAPU = null;
  let hojaINSUMOS = null;

  book.SheetNames.forEach(name => {
    const data = hojas[name];
    const firstRow = data[0] || {};
    const headers = Object.keys(firstRow);
    
    if (headers.some(h => h.toLowerCase().includes('metrado')) || 
        headers.some(h => h.toLowerCase().includes('presupuesto'))) {
      hojaPRESUPUESTO = name;
    }
    if (headers.some(h => h.toLowerCase().includes('apu')) || 
        headers.some(h => h.toLowerCase().includes('rendimiento'))) {
      hojaAPU = name;
    }
    if (headers.some(h => h.toLowerCase().includes('insumo')) || 
        headers.some(h => h.toLowerCase().includes('cantidad')) ||
        headers.some(h => h.toLowerCase().includes('costo'))) {
      hojaINSUMOS = name;
    }
  });

  console.log(`  Hoja PRESUPUESTO identificada: ${hojaPRESUPUESTO}`);
  console.log(`  Hoja APU identificada: ${hojaAPU}`);
  console.log(`  Hoja INSUMOS identificada: ${hojaINSUMOS}\n`);

  // 4. COMPARAR PARTIDAS
  console.log('\n4️⃣  COMPARANDO PARTIDAS\n');

  const presupuestoData = hojas[hojaPRESUPUESTO] || [];
  
  // Extraer códigos de partida
  const partidasExcel = new Set();
  const partidasCSVSet = new Set(partidasRecords.map(r => String(r.codigo || r.Codigo || '').trim()));

  presupuestoData.forEach(row => {
    const codigo = Object.values(row)[0]; // Primera columna usualmente es código
    if (codigo && String(codigo).match(/OE\.|O\.E\./)) {
      partidasExcel.add(String(codigo).trim());
    }
  });

  console.log(`  Partidas en PRESUPUESTO (Excel): ${partidasExcel.size}`);
  console.log(`  Partidas en PARTIDAS.csv: ${partidasCSVSet.size}\n`);

  // Match
  const enAmbos = new Set([...partidasExcel].filter(p => partidasCSVSet.has(p)));
  const soloEnExcel = new Set([...partidasExcel].filter(p => !partidasCSVSet.has(p)));
  const soloEnCSV = new Set([...partidasCSVSet].filter(p => !partidasExcel.has(p)));

  console.log(`  ✅ En AMBOS: ${enAmbos.size}`);
  console.log(`  ⚠️  Solo en Excel: ${soloEnExcel.size}`);
  console.log(`  ⚠️  Solo en CSV: ${soloEnCSV.size}\n`);

  if (soloEnExcel.size > 0) {
    console.log(`  Ejemplos Solo en Excel:\n`);
    Array.from(soloEnExcel).slice(0, 5).forEach(p => console.log(`    - ${p}`));
  }

  // 5. VERIFICAR ESTRUCTURA
  console.log('\n\n5️⃣  VERIFICANDO ESTRUCTURA DE DATOS\n');

  const presupuestoHeaders = Object.keys(presupuestoData[0] || {});
  console.log(`  Columnas en PRESUPUESTO:\n`);
  presupuestoHeaders.slice(0, 10).forEach(h => console.log(`    - ${h}`));

  const insumosData = hojas[hojaINSUMOS] || [];
  const insumosHeaders = Object.keys(insumosData[0] || {});
  console.log(`\n  Columnas en INSUMOS:\n`);
  insumosHeaders.slice(0, 10).forEach(h => console.log(`    - ${h}`));

  // 6. CONCLUSIÓN
  console.log('\n═'.repeat(180));
  console.log('\n🎯 CONCLUSIÓN\n');

  const todoMatch = (soloEnExcel.size === 0 && soloEnCSV.size === 0);

  if (todoMatch) {
    console.log('✅ PERFECTO - TODO CUADRA\n');
    console.log('  - Todas las partidas de Excel están en PARTIDAS.csv');
    console.log('  - Todas las partidas de CSV están en Excel');
    console.log('  - ESTÁ LISTO PARA SUBABASE\n');
  } else {
    console.log('⚠️  DISCREPANCIAS ENCONTRADAS\n');
    console.log(`  - ${soloEnExcel.size} partidas en Excel que NO están en PARTIDAS.csv`);
    console.log(`  - ${soloEnCSV.size} partidas en CSV que NO están en Excel`);
    console.log('  - NECESITA REVISIÓN ANTES DE SUPABASE\n');
  }

  // 7. PRÓXIMOS PASOS
  console.log('\n📋 PRÓXIMOS PASOS:\n');
  console.log('1. ✓ PARTIDAS - Ya subido a Supabase');
  console.log('2. ⏳ APUS_DETALLADO - Generar desde hoja APU');
  console.log('3. ⏳ INSUMOS - Generar desde hoja INSUMOS\n');

} catch (err) {
  console.error('Error:', err.message);
}
