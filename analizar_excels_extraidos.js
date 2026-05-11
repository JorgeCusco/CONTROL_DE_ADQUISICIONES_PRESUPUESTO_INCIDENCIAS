const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');

console.log('🔬 ANÁLISIS DETALLADO DE ARCHIVOS EXTRAÍDOS\n');
console.log('═'.repeat(200));

const dir = 'DATA_LAST/EXCEL_EXTRAIDOS';

// ========================================
// 1. ANALIZAR ACU_COMPLETO.csv
// ========================================
console.log('\n1️⃣ ANÁLISIS ACU_COMPLETO.csv\n');

const acuRaw = fs.readFileSync(`${dir}/ACU_COMPLETO.csv`, 'utf-8');
const acuData = csvParse(acuRaw, { columns: true, skip_empty_lines: false, bom: true });

const acuStats = {
  totalRecords: acuData.length,
  conCodigo: 0,
  sinCodigo: 0,
  tiposInsumo: new Set(),
  partidas: new Set(),
  insumosUnicos: new Set(),
  registrosManoObra: 0,
  registrosMateriales: 0,
  registrosEquipo: 0,
  registrosSubcontratos: 0,
  registrosOtros: 0,
  ejemploPartida: null
};

acuData.forEach((row, idx) => {
  const codigo = String(row.Código || '').trim();
  const descripcion = String(row.Descripción || '').trim();
  const cantidad = parseFloat(row.Cantidad) || 0;

  if (codigo) {
    acuStats.conCodigo++;
    acuStats.insumosUnicos.add(codigo);

    // Detectar partida del registro (buscar en el contexto)
    if (idx < acuData.length - 1) {
      // Guardar primer ejemplo
      if (!acuStats.ejemploPartida && descripcion) {
        acuStats.ejemploPartida = {
          codigo: codigo,
          descripcion: descripcion,
          cantidad: cantidad,
          unidad: row['Unid.'] || ''
        };
      }
    }
  } else {
    acuStats.sinCodigo++;
  }

  // Categorizar por tipo de insumo (basado en descripción)
  if (descripcion.includes('MANO DE OBRA')) acuStats.registrosManoObra++;
  else if (descripcion.includes('MATERIALES')) acuStats.registrosMateriales++;
  else if (descripcion.includes('EQUIPO')) acuStats.registrosEquipo++;
  else if (descripcion.includes('SUBCONTRATOS')) acuStats.registrosSubcontratos++;
  else if (codigo) acuStats.registrosOtros++;
});

console.log(`📊 ESTADÍSTICAS GENERALES:`);
console.log(`  Total de registros: ${acuStats.totalRecords}`);
console.log(`  Registros con código: ${acuStats.conCodigo}`);
console.log(`  Registros sin código (categorías): ${acuStats.sinCodigo}`);
console.log(`  Insumos únicos: ${acuStats.insumosUnicos.size}`);
console.log(`  Registros por tipo:`);
console.log(`    - MANO DE OBRA: ${acuStats.registrosManoObra}`);
console.log(`    - MATERIALES: ${acuStats.registrosMateriales}`);
console.log(`    - EQUIPO: ${acuStats.registrosEquipo}`);
console.log(`    - SUBCONTRATOS: ${acuStats.registrosSubcontratos}`);
console.log(`    - Otros: ${acuStats.registrosOtros}`);

console.log(`\n📝 EJEMPLO DE INSUMO:`);
if (acuStats.ejemploPartida) {
  console.log(`  Código: ${acuStats.ejemploPartida.codigo}`);
  console.log(`  Descripción: ${acuStats.ejemploPartida.descripcion}`);
  console.log(`  Cantidad: ${acuStats.ejemploPartida.cantidad}`);
  console.log(`  Unidad: ${acuStats.ejemploPartida.unidad}`);
}

// ========================================
// 2. ANALIZAR INSUMOS_COMPLETO.csv
// ========================================
console.log('\n\n2️⃣ ANÁLISIS INSUMOS_COMPLETO.csv\n');

const insumosRaw = fs.readFileSync(`${dir}/INSUMOS_COMPLETO.csv`, 'utf-8');
const insumosData = csvParse(insumosRaw, { columns: true, skip_empty_lines: false, bom: true });

const insumosStats = {
  totalRecords: insumosData.length,
  conCodigo: 0,
  sinCodigo: 0,
  insumosUnicos: new Set(),
  totalAgregado: 0,
  preciosPromedio: {},
  registrosManoObra: 0,
  registrosMateriales: 0,
  ejemplos: []
};

insumosData.forEach((row) => {
  const codigo = String(row.Código || '').trim();
  const descripcion = String(row.Descripción || '').trim();
  const cantidad = parseFloat(row.Cantidad) || 0;
  const costo = parseFloat(row.Costo) || 0;
  const total = parseFloat(row.Total) || 0;

  if (codigo) {
    insumosStats.conCodigo++;
    insumosStats.insumosUnicos.add(codigo);
    insumosStats.totalAgregado += total;

    // Guardar ejemplos
    if (insumosStats.ejemplos.length < 5) {
      insumosStats.ejemplos.push({
        codigo,
        descripcion,
        cantidad,
        costo,
        total,
        unidad: row['Unid.'] || ''
      });
    }
  } else {
    insumosStats.sinCodigo++;
    if (descripcion.includes('MANO DE OBRA')) insumosStats.registrosManoObra++;
    else if (descripcion.includes('MATERIALES')) insumosStats.registrosMateriales++;
  }
});

console.log(`📊 ESTADÍSTICAS GENERALES:`);
console.log(`  Total de registros: ${insumosStats.totalRecords}`);
console.log(`  Registros con código: ${insumosStats.conCodigo}`);
console.log(`  Registros sin código (categorías): ${insumosStats.sinCodigo}`);
console.log(`  Insumos únicos: ${insumosStats.insumosUnicos.size}`);
console.log(`  Total agregado: $${insumosStats.totalAgregado.toFixed(2)}`);
console.log(`\n📝 EJEMPLOS DE INSUMOS:`);
insumosStats.ejemplos.forEach((ex, idx) => {
  console.log(`  ${idx + 1}. [${ex.codigo}] ${ex.descripcion}`);
  console.log(`     Unidad: ${ex.unidad}, Cant: ${ex.cantidad}, Costo Unit: $${ex.costo}`);
});

// ========================================
// 3. ANALIZAR PRESUPUESTO_COMPLETO.csv
// ========================================
console.log('\n\n3️⃣ ANÁLISIS PRESUPUESTO_COMPLETO.csv\n');

const presupuestoRaw = fs.readFileSync(`${dir}/PRESUPUESTO_COMPLETO.csv`, 'utf-8');
const presupuestoData = csvParse(presupuestoRaw, { columns: true, skip_empty_lines: false, bom: true });

const presupuestoStats = {
  totalRecords: presupuestoData.length,
  conItem: 0,
  sinItem: 0,
  itemsUnicos: new Set(),
  conCantidad: 0,
  sinCantidad: 0,
  totalBudget: 0,
  partidas: new Set(),
  ejemploPartidas: [],
  nivelDetalle: {}
};

presupuestoData.forEach((row) => {
  const item = String(row.Item || '').trim();
  const descripcion = String(row.Descripción || '').trim();
  const cantidad = parseFloat(row['Cant.']) || 0;
  const total = parseFloat(row.Total) || 0;

  if (item) {
    presupuestoStats.conItem++;
    presupuestoStats.itemsUnicos.add(item);
    presupuestoStats.totalBudget += total;

    // Detectar nivel de detalle por formato de código
    const nivel = item.split('.').length;
    presupuestoStats.nivelDetalle[nivel] = (presupuestoStats.nivelDetalle[nivel] || 0) + 1;

    // Guardar ejemplos de partidas detalladas
    if (cantidad > 0 && presupuestoStats.ejemploPartidas.length < 8) {
      presupuestoStats.ejemploPartidas.push({
        item,
        descripcion,
        cantidad,
        unidad: row['Unid.'] || '',
        precio: parseFloat(row.Precio) || 0,
        total
      });
    }

    // Si tiene cantidad, es una partida de trabajo
    if (cantidad > 0) presupuestoStats.conCantidad++;
  } else {
    presupuestoStats.sinCantidad++;
  }
});

console.log(`📊 ESTADÍSTICAS GENERALES:`);
console.log(`  Total de registros: ${presupuestoStats.totalRecords}`);
console.log(`  Items con código: ${presupuestoStats.conItem}`);
console.log(`  Items sin código: ${presupuestoStats.sinItem}`);
console.log(`  Items únicos: ${presupuestoStats.itemsUnicos.size}`);
console.log(`  Partidas con cantidad: ${presupuestoStats.conCantidad}`);
console.log(`  Items agregados (sin cantidad): ${presupuestoStats.sinCantidad}`);
console.log(`  Total presupuesto: $${presupuestoStats.totalBudget.toFixed(2)}\n`);

console.log(`📊 DISTRIBUCIÓN POR NIVEL DE DETALLE:`);
Object.entries(presupuestoStats.nivelDetalle).sort().forEach(([nivel, count]) => {
  console.log(`  Nivel ${nivel}: ${count} items`);
});

console.log(`\n📝 EJEMPLOS DE PARTIDAS DETALLADAS:`);
presupuestoStats.ejemploPartidas.forEach((ex, idx) => {
  console.log(`  ${idx + 1}. [${ex.item}] ${ex.descripcion.substring(0, 60)}`);
  console.log(`     Unidad: ${ex.unidad}, Cant: ${ex.cantidad}, Precio: $${ex.precio}, Total: $${ex.total}`);
});

// ========================================
// 4. ANÁLISIS COMPARATIVO
// ========================================
console.log('\n\n4️⃣ ANÁLISIS COMPARATIVO\n');

const insumosAcuSet = new Set(acuData
  .map(r => String(r.Código || '').trim())
  .filter(c => c));

const insumosInsumosSet = new Set(insumosData
  .map(r => String(r.Código || '').trim())
  .filter(c => c));

const interseccion = new Set([...insumosAcuSet].filter(x => insumosInsumosSet.has(x)));
const soloEnAcu = new Set([...insumosAcuSet].filter(x => !insumosInsumosSet.has(x)));
const soloEnInsumos = new Set([...insumosInsumosSet].filter(x => !insumosAcuSet.has(x)));

console.log(`📊 COMPARACIÓN ACU vs INSUMOS CATALOGO:`);
console.log(`  Insumos en ACU: ${insumosAcuSet.size}`);
console.log(`  Insumos en INSUMOS_CATALOGO: ${insumosInsumosSet.size}`);
console.log(`  Insumos comunes: ${interseccion.size}`);
console.log(`  Solo en ACU: ${soloEnAcu.size}`);
console.log(`  Solo en INSUMOS: ${soloEnInsumos.size}`);

console.log(`\n📊 PRESUPUESTO TOTAL:`);
console.log(`  Según PRESUPUESTO.xlsx: $${presupuestoStats.totalBudget.toFixed(2)}`);
console.log(`  Según INSUMOS.xlsx: $${insumosStats.totalAgregado.toFixed(2)}`);
const diferencia = Math.abs(presupuestoStats.totalBudget - insumosStats.totalAgregado);
console.log(`  Diferencia: $${diferencia.toFixed(2)}`);

console.log('\n═'.repeat(200));
console.log('\n✅ ANÁLISIS COMPLETADO\n');
