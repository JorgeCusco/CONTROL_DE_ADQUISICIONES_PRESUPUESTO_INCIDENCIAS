const XLSX = require('xlsx');
const fs = require('fs');

console.log('📊 ANALIZANDO: APU Y PRESUPUESTO.xlsx\n');
console.log('═'.repeat(140));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');

console.log('\n📋 HOJAS DISPONIBLES:\n');
book.SheetNames.forEach((name, idx) => {
  console.log(`  ${idx + 1}. "${name}"`);
});

console.log('\n' + '═'.repeat(140));
console.log('\n🔍 ANALIZANDO CADA HOJA (primeras 194 filas):\n');

book.SheetNames.forEach((sheetName) => {
  const sheet = book.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`\n📄 Hoja: "${sheetName}"`);
  console.log(`   Total registros: ${data.length}`);
  console.log(`   ─ Columnas encontradas:\n`);

  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    headers.forEach((h, idx) => {
      console.log(`      ${idx + 1}. ${h}`);
    });

    console.log(`\n   ─ Primeras 5 filas (para identificar patrón):\n`);

    data.slice(0, 5).forEach((row, idx) => {
      console.log(`      Fila ${idx + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          console.log(`        ${key}: ${value}`);
        }
      });
      console.log();
    });

    // Buscar patrones
    console.log(`   ─ PATRONES DETECTADOS:\n`);

    // Columnas clave
    const itemCol = headers.find(h => h.toLowerCase().includes('item'));
    const partidaCol = headers.find(h => h.toLowerCase().includes('partida'));
    const codigoCol = headers.find(h => h.toLowerCase().includes('codigo'));
    const descripcionCol = headers.find(h => h.toLowerCase().includes('descripcion'));
    const tipoCol = headers.find(h => h.toLowerCase().includes('tipo'));
    const cantidadCol = headers.find(h => h.toLowerCase().includes('cantidad'));
    const precioCol = headers.find(h => h.toLowerCase().includes('precio'));
    const totalCol = headers.find(h => h.toLowerCase().includes('total'));
    const unidadCol = headers.find(h => h.toLowerCase().includes('unidad'));

    if (itemCol) console.log(`      ✓ ITEM/Partida: ${itemCol}`);
    if (partidaCol) console.log(`      ✓ PARTIDA: ${partidaCol}`);
    if (codigoCol) console.log(`      ✓ CODIGO: ${codigoCol}`);
    if (descripcionCol) console.log(`      ✓ DESCRIPCION: ${descripcionCol}`);
    if (tipoCol) console.log(`      ✓ TIPO (MANO/MATERIAL/EQUIPO): ${tipoCol}`);
    if (cantidadCol) console.log(`      ✓ CANTIDAD: ${cantidadCol}`);
    if (precioCol) console.log(`      ✓ PRECIO: ${precioCol}`);
    if (totalCol) console.log(`      ✓ TOTAL: ${totalCol}`);
    if (unidadCol) console.log(`      ✓ UNIDAD: ${unidadCol}`);

    // Detectar si hay tabla de APU y tabla de PRESUPUESTO
    console.log(`\n   ─ ESTRUCTURA DETECTADA:\n`);

    // Verificar si hay datos de APU (con código de insumo)
    const withCode = data.filter(row => row[codigoCol] !== null && row[codigoCol] !== undefined);
    if (withCode.length > 0) {
      console.log(`      ✓ Registros con CODIGO DE INSUMO: ${withCode.length}`);
    }

    // Verificar si hay partidas únicas
    const partidas = new Set();
    data.forEach(row => {
      if (row[partidaCol]) partidas.add(row[partidaCol]);
      if (row[itemCol]) partidas.add(row[itemCol]);
    });
    console.log(`      ✓ Partidas únicas detectadas: ${partidas.size}`);

    // Verificar tipos
    if (tipoCol) {
      const tipos = new Set();
      data.forEach(row => {
        if (row[tipoCol]) tipos.add(row[tipoCol]);
      });
      console.log(`      ✓ Tipos detectados: ${Array.from(tipos).join(', ')}`);
    }
  }

  console.log(`\n${'─'.repeat(140)}`);
});

console.log('\n' + '═'.repeat(140));
