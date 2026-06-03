const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔬 ANÁLISIS DETALLADO Y PRECISO: APU Y PRESUPUESTO.xlsx\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');

console.log('\n📋 HOJAS DISPONIBLES EN EL ARCHIVO:\n');
book.SheetNames.forEach((name, idx) => {
  console.log(`  ${idx + 1}. "${name}"`);
});

// Analizar cada hoja detalladamente
book.SheetNames.forEach((sheetName) => {
  const sheet = book.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`\n\n${'═'.repeat(160)}`);
  console.log(`\n📊 ANÁLISIS DETALLADO DE: "${sheetName}"\n`);
  console.log(`Total de registros: ${data.length}\n`);

  if (data.length === 0) {
    console.log('  ⚠️ Esta hoja está vacía\n');
    return;
  }

  // Obtener todas las columnas
  const allHeaders = new Set();
  data.forEach(row => {
    Object.keys(row).forEach(h => allHeaders.add(h));
  });
  const headers = Array.from(allHeaders);

  console.log('📋 ESTRUCTURA DE COLUMNAS:\n');
  headers.forEach((header, idx) => {
    console.log(`  ${idx + 1}. "${header}"`);
  });

  console.log(`\n\n📝 PRIMERAS 10 FILAS (SIN OMITIR NINGUN DATO):\n`);
  console.log('─'.repeat(160));

  data.slice(0, 10).forEach((row, rowIdx) => {
    console.log(`\n  FILA ${rowIdx + 1}:`);
    let hasData = false;
    headers.forEach(header => {
      const value = row[header];
      if (value !== null && value !== undefined && value !== '') {
        console.log(`    ${header.padEnd(40)} = ${value}`);
        hasData = true;
      }
    });
    if (!hasData) {
      console.log(`    (Fila vacía)`);
    }
  });

  // Análisis de patrones
  console.log(`\n\n${'─'.repeat(160)}`);
  console.log(`\n🔍 ANÁLISIS DE PATRONES Y ESTRUCTURA:\n`);

  // 1. Detectar columnas clave
  console.log('  1️⃣ COLUMNAS CLAVE DETECTADAS:\n');

  const keyPatterns = {
    'ITEM/Partida': ['item', 'partida', 'codigo_partida', 'part'],
    'Nombre Partida': ['nombre', 'descripcion_partida', 'desc_partida'],
    'Código Insumo': ['codigo', 'codigo_insumo', 'cod_insumo'],
    'Descripción Insumo': ['descripcion', 'descripcion_insumo', 'desc_insumo'],
    'Tipo Insumo': ['tipo', 'tipo_insumo', 'categoria'],
    'Cantidad/Incidencia': ['cantidad', 'incidencia', 'cant', 'qty'],
    'Unidad': ['unidad', 'unid', 'unit'],
    'Precio Unitario': ['precio', 'precio_unitario', 'pu', 'valor_unitario'],
    'Total': ['total', 'subtotal', 'monto']
  };

  Object.entries(keyPatterns).forEach(([pattern, keywords]) => {
    const found = headers.find(h =>
      keywords.some(k => h.toLowerCase().includes(k))
    );
    if (found) {
      console.log(`     ✓ ${pattern.padEnd(25)} → "${found}"`);
    }
  });

  // 2. Muestras de valores para entender estructura
  console.log(`\n\n  2️⃣ MUESTRAS DE VALORES (para identificar patrón):\n`);

  const sampleRows = data.slice(0, Math.min(194, data.length));

  // Encontrar partidas únicas
  const partidas = new Map();
  sampleRows.forEach(row => {
    const partida = Object.values(row).find(v =>
      typeof v === 'string' && (v.startsWith('OE') || v.startsWith('O.E'))
    );
    if (partida && !partidas.has(partida)) {
      partidas.set(partida, row);
    }
  });

  console.log(`     Partidas únicas encontradas: ${partidas.size}\n`);

  // Mostrar estructura de una partida
  if (partidas.size > 0) {
    const firstPartida = Array.from(partidas.entries())[0];
    console.log(`     EJEMPLO - Partida: "${firstPartida[0]}"\n`);
    Object.entries(firstPartida[1]).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        console.log(`       ${key}: ${value}`);
      }
    });
  }

  // 3. Detectar si hay múltiples insumos por partida
  console.log(`\n\n  3️⃣ ESTRUCTURA DE DATOS:\n`);

  const dataByPartida = {};
  sampleRows.forEach(row => {
    const partida = Object.values(row).find(v =>
      typeof v === 'string' && (v.startsWith('OE') || v.startsWith('O.E'))
    );
    if (partida) {
      if (!dataByPartida[partida]) {
        dataByPartida[partida] = [];
      }
      dataByPartida[partida].push(row);
    }
  });

  const avg = Object.values(dataByPartida).reduce((sum, arr) => sum + arr.length, 0) /
              Object.keys(dataByPartida).length;
  console.log(`     Insumos promedio por partida: ${avg.toFixed(1)}`);

  // Mostrar distribución
  const distribution = {};
  Object.values(dataByPartida).forEach(arr => {
    const count = arr.length;
    distribution[count] = (distribution[count] || 0) + 1;
  });

  console.log(`     Distribución:`);
  Object.entries(distribution).sort().forEach(([count, freq]) => {
    console.log(`       - ${count} insumo(s) por partida: ${freq} partida(s)`);
  });

  // 4. Detectar tipos de insumos
  console.log(`\n\n  4️⃣ CATEGORÍAS DE INSUMOS:\n`);

  const tipos = new Set();
  sampleRows.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === 'string' &&
          ['MANO DE OBRA', 'MATERIALES', 'EQUIPO', 'MANODEO BRA', 'MATERIAL', 'MAQUINARIA'].some(t =>
            value.toUpperCase().includes(t)
          )) {
        tipos.add(value);
      }
    });
  });

  if (tipos.size > 0) {
    console.log(`     Tipos encontrados:`);
    Array.from(tipos).forEach(t => console.log(`       - ${t}`));
  } else {
    console.log(`     ⚠️ No se detectaron tipos claros de MANO DE OBRA/MATERIALES/EQUIPO`);
  }

  console.log(`\n\n${'═'.repeat(160)}`);
});

console.log('\n\n💡 INSTRUCCIONES PARA MAPEO CORRECTO:\n');
console.log(`  1. Cada PARTIDA (ej: OE.1.1.1.1) tiene múltiples INSUMOS`);
console.log(`  2. Cada INSUMO tiene:`);
console.log(`     - Código de insumo`);
console.log(`     - Descripción`);
console.log(`     - Tipo (MANO DE OBRA / MATERIALES / EQUIPO)`);
console.log(`     - Cantidad ← ESTO ES incidencia_original`);
console.log(`     - Unidad`);
console.log(`     - Precio unitario`);
console.log(`     - Total (cantidad × precio)`);
console.log(`\n  3. El METRADO FIJO es el metrado de la PARTIDA (constante para todos sus insumos)`);
console.log(`  4. incidencia_original = cantidad del APU`);
console.log(`  5. parcial_original = cantidad × metrado_fijo\n`);

console.log('═'.repeat(160) + '\n');
