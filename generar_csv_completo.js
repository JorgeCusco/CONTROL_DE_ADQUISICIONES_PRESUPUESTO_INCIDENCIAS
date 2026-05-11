const XLSX = require('xlsx');
const fs = require('fs');
const { stringify } = require('csv-stringify/sync');

console.log('📝 GENERANDO CSV COMPLETO Y ESTRUCTURADO\n');
console.log('═'.repeat(150));

const book = XLSX.readFile('APU Y PRESUPUESTO.xlsx');

// Leer ambas hojas
const apuSheet = book.Sheets['APU'];
const presupuestoSheet = book.Sheets['PRESUPUESTO'];

const apuRaw = XLSX.utils.sheet_to_json(apuSheet, { defval: '' });
const presupuestoData = XLSX.utils.sheet_to_json(presupuestoSheet, { defval: '' });

console.log(`\n✓ APU: ${apuRaw.length} registros leídos`);
console.log(`✓ PRESUPUESTO: ${presupuestoData.length} registros leídos\n`);

// Crear map de presupuesto para búsqueda rápida
const presupuestoMap = {};
presupuestoData.forEach(row => {
  const item = row['Item'] || row['item'];
  if (item) {
    presupuestoMap[item] = row;
  }
});

console.log(`✓ Mapa de presupuesto creado: ${Object.keys(presupuestoMap).length} partidas\n`);

// Procesar APU para extraer estructura
console.log('📊 PROCESANDO ESTRUCTURA DEL APU...\n');

const resultado = [];
let currentPartida = null;
let currentMetrado = null;
let currentRendimiento = null;
let currentTipo = null;
let currentNombrePartida = null;

// Las primeras 194 filas según el usuario
const primeras194 = apuRaw.slice(0, 194);

console.log(`Procesando primeras 194 filas...\n`);

primeras194.forEach((row, idx) => {
  // La estructura es:
  // - Primera columna tiene el código de partida (OE.X.X.X.X)
  // - Segunda columna tiene descripción o "Rendimiento: X"

  const col1 = String(Object.values(row)[0] || '');
  const col2 = String(Object.values(row)[1] || '');
  const col3 = String(Object.values(row)[2] || '');

  // Detectar si es inicio de partida
  if (col1.match(/^OE\.|^O\.E\./)) {
    // Si col2 NO contiene "Rendimiento:", es nueva partida
    if (!col2.includes('Rendimiento')) {
      currentPartida = col1;
      currentNombrePartida = col2;
      currentMetrado = null;
      currentRendimiento = null;
      console.log(`  → Partida: ${currentPartida} - ${currentNombrePartida}`);

      // Buscar en presupuesto
      const presRow = presupuestoMap[currentPartida];
      if (presRow) {
        currentMetrado = presRow['Cant.'] || 0;
        console.log(`     Metrado (Cant.): ${currentMetrado}`);
      }
    } else if (col2.includes('Rendimiento')) {
      // Es línea de rendimiento
      const match = col2.match(/Rendimiento:\s*([\d.]+)\s*(\w+\/\w+)/);
      if (match) {
        currentRendimiento = match[1];
      }
    }
  }

  // Detectar tipo de insumo (MANO DE OBRA, MATERIALES, EQUIPO)
  if (col1 && ['MANO DE OBRA', 'MATERIALES', 'EQUIPO'].some(t => col1.includes(t))) {
    currentTipo = col1;
    console.log(`    - ${currentTipo}`);
  }

  // Detectar línea de insumo (tiene código)
  if (currentPartida && currentTipo && col1 && col1.match(/^\d{9}$/)) {
    // Es un código de insumo
    const codigoInsumo = col1;
    const descripcion = col2 || '';
    const unidad = col3 || '';

    // Obtener cantidad, precio, total del resto de columnas
    const cols = Object.values(row);
    let cantidad = null;
    let precio = null;
    let total = null;

    // Según la estructura, tenemos: Código, Parcial, Descripción, Unid., Recursos, Cantidad, Precio
    // Esto corresponde a índices específicos en el array
    if (cols.length >= 7) {
      cantidad = cols[5] || null; // Índice 5 = Cantidad
      precio = cols[6] || null;   // Índice 6 = Precio
      total = cols[1] || null;    // Índice 1 = Parcial
    }

    resultado.push({
      'PARTIDA_CODIGO': currentPartida,
      'PARTIDA_NOMBRE': currentNombrePartida,
      'METRADO_FIJO': currentMetrado || 0,
      'RENDIMIENTO': currentRendimiento || '',
      'TIPO_INSUMO': currentTipo,
      'INSUMO_CODIGO': codigoInsumo,
      'INSUMO_DESCRIPCION': descripcion,
      'UNIDAD': unidad,
      'CANTIDAD_APU': cantidad || 0,
      'PRECIO_UNITARIO': precio || 0,
      'PARCIAL_APU': total || 0
    });

    console.log(`      • ${codigoInsumo} - ${descripcion} (${unidad}): Cant=${cantidad}, Precio=${precio}`);
  }
});

console.log(`\n✓ Registros procesados: ${resultado.length}\n`);

// Generar CSV
console.log('💾 GENERANDO CSV...\n');

const csvContent = stringify(resultado, {
  header: true,
  columns: [
    'PARTIDA_CODIGO',
    'PARTIDA_NOMBRE',
    'METRADO_FIJO',
    'RENDIMIENTO',
    'TIPO_INSUMO',
    'INSUMO_CODIGO',
    'INSUMO_DESCRIPCION',
    'UNIDAD',
    'CANTIDAD_APU',
    'PRECIO_UNITARIO',
    'PARCIAL_APU'
  ]
});

fs.writeFileSync('APU_COMPLETO_ESTRUCTURADO.csv', csvContent);

console.log(`✅ CSV generado: APU_COMPLETO_ESTRUCTURADO.csv`);
console.log(`   Tamaño: ${(csvContent.length / 1024).toFixed(2)} KB`);
console.log(`   Registros: ${resultado.length}`);

// Mostrar resumen
console.log(`\n📊 RESUMEN DE DATOS:\n`);

const partidas = new Set(resultado.map(r => r.PARTIDA_CODIGO));
const insumos = new Set(resultado.map(r => r.INSUMO_CODIGO));
const tipos = new Set(resultado.map(r => r.TIPO_INSUMO));

console.log(`  Partidas únicas: ${partidas.size}`);
console.log(`  Insumos únicos: ${insumos.size}`);
console.log(`  Tipos de insumo: ${Array.from(tipos).join(', ')}`);

// Mostrar primeros 10 registros
console.log(`\n📋 PRIMEROS 10 REGISTROS DEL CSV:\n`);
resultado.slice(0, 10).forEach((row, idx) => {
  console.log(`${idx + 1}. ${row.PARTIDA_CODIGO} - ${row.INSUMO_CODIGO} - ${row.INSUMO_DESCRIPCION}`);
});

console.log(`\n${'═'.repeat(150)}`);
console.log(`\n✅ CSV LISTO PARA CARGAR A SUPABASE\n`);
