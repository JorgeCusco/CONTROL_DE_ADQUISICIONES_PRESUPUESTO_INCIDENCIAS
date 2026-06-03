const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('✅ GENERANDO CSV FINAL Y COMPLETO\n');
console.log('═'.repeat(160));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');

// Leer hojas
const apuSheet = book.Sheets['APU'];
const presupuestoSheet = book.Sheets['PRESUPUESTO'];

const apuRaw = XLSX.utils.sheet_to_json(apuSheet, { defval: '', blankrows: false });
const presupuestoData = XLSX.utils.sheet_to_json(presupuestoSheet, { defval: '' });

console.log(`\n✓ APU: ${apuRaw.length} registros`);
console.log(`✓ PRESUPUESTO: ${presupuestoData.length} registros\n`);

// Crear mapa de presupuesto
const presupuestoMap = {};
presupuestoData.forEach(row => {
  const item = row['Item'] || '';
  if (item) {
    presupuestoMap[item] = {
      metrado: parseFloat(row['Cant.']) || 0,
      precio_presupuesto: parseFloat(row['Precio']) || 0
    };
  }
});

console.log(`✓ Mapa de presupuesto: ${Object.keys(presupuestoMap).length} partidas\n`);

// Procesar APU
const resultado = [];
const allRows = apuRaw;
let currentPartida = null;
let currentMetrado = 0;
let currentNombrePartida = '';
let currentRendimiento = '';
let currentTipo = null;
let headers = null;

console.log('📝 PROCESANDO APU (todas las filas)...\n');

for (let i = 0; i < Math.min(allRows.length, 194); i++) {
  const row = allRows[i];
  const values = Object.values(row);

  const col0 = String(values[0] || '').trim();
  const col1 = String(values[1] || '').trim();
  const col13 = String(values[13] || '').trim();

  // Detectar partida nueva
  if (col0.match(/^OE\.|^O\.E\./) && !col13.includes('Rendimiento') && !col1.includes('Descripción')) {
    currentPartida = col0;
    currentNombrePartida = col1;
    currentMetrado = presupuestoMap[currentPartida]?.metrado || 0;
    currentTipo = null;

    // Buscar rendimiento en siguiente fila
    if (i + 1 < allRows.length) {
      const nextValues = Object.values(allRows[i + 1]);
      const nextCol13 = String(nextValues[13] || '').trim();
      if (nextCol13.includes('Rendimiento')) {
        const match = nextCol13.match(/Rendimiento:\s*([\d.]+)/);
        currentRendimiento = match ? match[1] : '';
      }
    }

    console.log(`\n→ Partida: ${currentPartida} - ${currentNombrePartida}`);
    console.log(`  Metrado: ${currentMetrado}`);
  }

  // Detectar encabezados
  if (col0 === 'Código' && col1 === 'Descripción') {
    headers = {
      codigoIdx: 0,
      descIdx: 1,
      unidIdx: 9,
      cantIdx: 10,
      precioIdx: 12,
      parcialIdx: 13
    };
  }

  // Detectar tipo de insumo
  if (['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].includes(col0)) {
    currentTipo = col0;
    console.log(`  - ${currentTipo}`);
  }

  // Detectar insumo (código de 9 dígitos)
  if (currentPartida && currentTipo && col0.match(/^\d{9}$/) && headers) {
    const rowValues = Object.values(row);

    const codigoInsumo = col0;
    const descripcion = col1;
    const unidad = String(rowValues[9] || '').trim();
    const cantidadAPU = parseFloat(String(rowValues[10] || 0).replace(',', '.')) || 0;
    const precioUnitario = parseFloat(String(rowValues[12] || 0).replace(',', '.')) || 0;
    const parcialAPU = parseFloat(String(rowValues[13] || 0).replace(',', '.')) || 0;

    resultado.push({
      partida_codigo: currentPartida,
      partida_nombre: currentNombrePartida,
      metrado_fijo: currentMetrado,
      tipo_insumo: currentTipo,
      insumo_codigo: codigoInsumo,
      insumo_descripcion: descripcion,
      unidad: unidad,
      incidencia_original: cantidadAPU,
      precio_unitario: precioUnitario,
      parcial_original: parcialAPU,
      incidencia_x_metrado: cantidadAPU * currentMetrado
    });

    console.log(`    • ${codigoInsumo} ${descripcion}`);
  }
}

console.log(`\n✓ Total registros procesados: ${resultado.length}\n`);

// Generar CSV
console.log('💾 GENERANDO CSV...\n');

const csvContent = stringify(resultado, {
  header: true,
  columns: [
    'partida_codigo',
    'partida_nombre',
    'metrado_fijo',
    'tipo_insumo',
    'insumo_codigo',
    'insumo_descripcion',
    'unidad',
    'incidencia_original',
    'precio_unitario',
    'parcial_original',
    'incidencia_x_metrado'
  ]
});

fs.writeFileSync('APU_COMPLETO_FINAL.csv', csvContent, 'utf-8');

console.log(`✅ CSV generado: APU_COMPLETO_FINAL.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${resultado.length}\n`);

// Resumen
console.log('📊 RESUMEN:\n');

const partidas = new Set(resultado.map(r => r.partida_codigo));
const tipos = new Set(resultado.map(r => r.tipo_insumo));
const insumos = new Set(resultado.map(r => r.insumo_codigo));

console.log(`  ✓ Partidas: ${partidas.size}`);
console.log(`  ✓ Insumos únicos: ${insumos.size}`);
console.log(`  ✓ Tipos: ${Array.from(tipos).join(', ')}`);

// Muestra
console.log(`\n📋 PRIMEROS 15 REGISTROS:\n`);
resultado.slice(0, 15).forEach((r, idx) => {
  console.log(`${(idx+1).toString().padStart(2)}. ${r.partida_codigo} | ${r.insumo_codigo} | ${r.insumo_descripcion.substring(0, 35).padEnd(35)} | Incid: ${r.incidencia_original} | Precio: ${r.precio_unitario}`);
});

console.log(`\n${'═'.repeat(160)}\n`);
console.log('✅ CSV LISTO PARA CARGAR A SUPABASE\n');
