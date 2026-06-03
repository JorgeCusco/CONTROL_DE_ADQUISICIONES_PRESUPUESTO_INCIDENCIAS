const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

console.log('✅ GENERAR INSERT SQL PARA SCHEMA NORMALIZADO\n');
console.log('═'.repeat(200));

const csvDir = 'DATA_LAST/TABLAS_FINAL_BOM';
const sqlDir = 'DATA_LAST/SQL';

// Crear carpeta SQL
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

// =====================================================
// 1. INSERTAR PARTIDAS
// =====================================================
console.log('\n1️⃣ GENERANDO 01_INSERT_partidas.sql\n');

let csvPartidas = fs.readFileSync(path.join(csvDir, 'PARTIDAS_P.csv'), 'utf8');
if (csvPartidas.charCodeAt(0) === 0xFEFF) {
  csvPartidas = csvPartidas.slice(1);
}
const partidasData = parse(csvPartidas, { columns: true });

let sqlPartidas = `-- Partidas del presupuesto (expediente técnico)
-- Fuente: PARTIDAS_P.csv (${partidasData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO partidas (codigo, descripcion, unidad, cantidad, precio_unitario, total_presupuestado, rendimiento)
VALUES
`;

const sqlPartidosRows = partidasData.map((row, idx) => {
  const codigo = row.item ? `'${row.item.replace(/'/g, "''")}'` : 'NULL';
  const desc = row.descripcion ? `'${row.descripcion.replace(/'/g, "''")}'` : 'NULL';
  const unidad = row.unidad ? `'${row.unidad.replace(/'/g, "''")}'` : 'NULL';
  const cantidad = row.cantidad !== '' && row.cantidad !== undefined ? parseFloat(row.cantidad) : 0;
  const precio = row.precio_unitario !== '' && row.precio_unitario !== undefined ? parseFloat(row.precio_unitario) : 0;
  const total = row.total !== '' && row.total !== undefined ? parseFloat(row.total) : 0;
  const rend = row.rendimiento ? `'${row.rendimiento.replace(/'/g, "''")}'` : 'NULL';

  const comma = idx === partidasData.length - 1 ? ';' : ',';
  return `  (${codigo}, ${desc}, ${unidad}, ${cantidad}, ${precio}, ${total}, ${rend})${comma}`;
});

sqlPartidas += sqlPartidosRows.join('\n');
sqlPartidas += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, '01_INSERT_partidas.sql'), '﻿' + sqlPartidas, 'utf8');
console.log(`  ✓ ${partidasData.length} partidas extraídas`);
console.log(`  ✓ Guardado: 01_INSERT_partidas.sql\n`);

// =====================================================
// 2. INSERTAR RECURSOS (INSUMOS DEDUPLICADOS)
// =====================================================
console.log('2️⃣ GENERANDO 02_INSERT_recursos.sql\n');

let csvInsumos = fs.readFileSync(path.join(csvDir, 'INSUMOS_P.csv'), 'utf8');
if (csvInsumos.charCodeAt(0) === 0xFEFF) {
  csvInsumos = csvInsumos.slice(1);
}
const insumosData = parse(csvInsumos, { columns: true });

// Deduplicar por código
const insumosMap = new Map();
insumosData.forEach(row => {
  if (!insumosMap.has(row.codigo)) {
    insumosMap.set(row.codigo, row);
  }
});

let sqlRecursos = `-- Catálogo de recursos (insumos únicos del presupuesto)
-- Fuente: INSUMOS_P.csv (${insumosData.length} registros, ${insumosMap.size} únicos)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO recursos (codigo, descripcion, unidad, precio_base, tipo)
VALUES
`;

const insumosArray = Array.from(insumosMap.values());
const sqlRecursosRows = insumosArray.map((row, idx) => {
  const codigo = row.codigo ? `'${row.codigo.replace(/'/g, "''")}'` : 'NULL';
  const desc = row.descripcion ? `'${row.descripcion.replace(/'/g, "''")}'` : 'NULL';
  const unidad = row.unidad ? `'${row.unidad.replace(/'/g, "''")}'` : 'NULL';
  const precio = row.costo !== '' && row.costo !== undefined ? parseFloat(row.costo) : 0;
  // Inferir tipo desde descripción si está disponible, sino usar MATERIALES por defecto
  let tipo = 'MATERIALES';
  if (row.tipo) {
    tipo = row.tipo;
  } else if (desc && desc.includes('OPERARIO')) {
    tipo = 'MANO DE OBRA';
  } else if (desc && (desc.includes('EQUIPO') || desc.includes('MAQUINA'))) {
    tipo = 'EQUIPO';
  }
  const tipoSql = `'${tipo.replace(/'/g, "''")}'`;

  const comma = idx === insumosArray.length - 1 ? ';' : ',';
  return `  (${codigo}, ${desc}, ${unidad}, ${precio}, ${tipoSql})${comma}`;
});

sqlRecursos += sqlRecursosRows.join('\n');
sqlRecursos += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, '02_INSERT_recursos.sql'), '﻿' + sqlRecursos, 'utf8');
console.log(`  ✓ ${insumosArray.length} recursos únicos extraídos (de ${insumosData.length} registros)`);
console.log(`  ✓ Guardado: 02_INSERT_recursos.sql\n`);

// =====================================================
// 3. INSERTAR APU (con pricing desde INSUMOS)
// =====================================================
console.log('3️⃣ GENERANDO 03_INSERT_apu.sql\n');

let csvAcus = fs.readFileSync(path.join(csvDir, 'ACUS_P.csv'), 'utf8');
if (csvAcus.charCodeAt(0) === 0xFEFF) {
  csvAcus = csvAcus.slice(1);
}
const acusData = parse(csvAcus, { columns: true });

// Mapear insumos por código para obtener precio_base
const insumoPrecioMap = new Map();
insumosArray.forEach(insumo => {
  const precio = insumo.costo !== '' && insumo.costo !== undefined ? parseFloat(insumo.costo) : 0;
  insumoPrecioMap.set(insumo.codigo, precio);
});

let sqlApu = `-- APU (Análisis de Precios Unitarios) del presupuesto
-- Relaciones partida ↔ recurso con datos APU1
-- Fuente: ACUS_P.csv (${acusData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO apu (partida_codigo, recurso_codigo, tipo, aporte_unitario, cuadrilla, rendimiento, precio_original, parcial_original)
VALUES
`;

const sqlApuRows = acusData.map((row, idx) => {
  const partida = row.item ? `'${row.item.replace(/'/g, "''")}'` : 'NULL';
  const recurso = row.codigo ? `'${row.codigo.replace(/'/g, "''")}'` : 'NULL';
  const tipo = row.tipo ? `'${row.tipo.replace(/'/g, "''")}'` : 'NULL';
  const aporte = row.cantidad !== '' && row.cantidad !== undefined ? parseFloat(row.cantidad) : 0;
  const cuadrilla = row.recursos !== '' && row.recursos !== undefined ? parseFloat(row.recursos) : 0;
  const rend = row.rendimiento ? `'${row.rendimiento.replace(/'/g, "''")}'` : 'NULL';

  // Obtener precio del insumo
  const precioBase = insumoPrecioMap.get(row.codigo) || 0;
  const precioOriginal = precioBase;
  const parcialOriginal = aporte * precioOriginal;

  const comma = idx === acusData.length - 1 ? ';' : ',';
  return `  (${partida}, ${recurso}, ${tipo}, ${aporte}, ${cuadrilla}, ${rend}, ${precioOriginal}, ${parcialOriginal})${comma}`;
});

sqlApu += sqlApuRows.join('\n');
sqlApu += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, '03_INSERT_apu.sql'), '﻿' + sqlApu, 'utf8');
console.log(`  ✓ ${acusData.length} relaciones partida-recurso extraídas`);
console.log(`  ✓ Guardado: 03_INSERT_apu.sql\n`);

// =====================================================
// 4. INSERTAR COMPRAS
// =====================================================
console.log('4️⃣ GENERANDO 04_INSERT_compras.sql\n');

let csvCompras = fs.readFileSync(path.join(csvDir, 'COMPRAS_C.csv'), 'utf8');
if (csvCompras.charCodeAt(0) === 0xFEFF) {
  csvCompras = csvCompras.slice(1);
}
const comprasData = parse(csvCompras, { columns: true });

let sqlCompras = `-- Compras realizadas (órdenes de compra, caja chica, etc.)
-- Fuente: COMPRAS_C.csv (${comprasData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO compras (anio, componente, tipo_compra, num_compra, detalle, unidad_orig, cantidad_orig, precio_unit_orig, completo)
VALUES
`;

const sqlComprasRows = comprasData.map((row, idx) => {
  const anio = row.anio !== '' && row.anio !== undefined && row.anio !== 'null' ? parseInt(row.anio) : 'NULL';
  const comp = row.componente ? `'${row.componente.replace(/'/g, "''")}'` : 'NULL';
  const tipo = row.tipo_compra ? `'${row.tipo_compra.replace(/'/g, "''")}'` : 'NULL';
  const num = row.num_compra ? `'${row.num_compra.toString().replace(/'/g, "''")}'` : 'NULL';
  const det = row.detalle ? `'${row.detalle.replace(/'/g, "''")}'` : 'NULL';
  const uni = row.unidad ? `'${row.unidad.replace(/'/g, "''")}'` : 'NULL';
  const cant = row.cantidad !== '' && row.cantidad !== undefined ? parseFloat(row.cantidad) : 0;
  const precio = row.precio_unit !== '' && row.precio_unit !== undefined ? parseFloat(row.precio_unit) : 0;
  const completo = row.completo === 'true' ? 'true' : 'false';

  const comma = idx === comprasData.length - 1 ? ';' : ',';
  return `  (${anio}, ${comp}, ${tipo}, ${num}, ${det}, ${uni}, ${cant}, ${precio}, ${completo})${comma}`;
});

sqlCompras += sqlComprasRows.join('\n');
sqlCompras += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, '04_INSERT_compras.sql'), '﻿' + sqlCompras, 'utf8');
console.log(`  ✓ ${comprasData.length} compras extraídas`);
console.log(`  ✓ Completas: ${comprasData.filter(r => r.completo === 'true').length} | Incompletas: ${comprasData.filter(r => r.completo === 'false').length}`);
console.log(`  ✓ Guardado: 04_INSERT_compras.sql\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN FINAL\n');
console.log(`PRESUPUESTO (_P):`);
console.log(`  01_INSERT_partidas.sql     ${partidasData.length} partidas`);
console.log(`  02_INSERT_recursos.sql     ${insumosArray.length} recursos únicos`);
console.log(`  03_INSERT_apu.sql          ${acusData.length} relaciones APU\n`);
console.log(`COMPRAS (_C):`);
console.log(`  04_INSERT_compras.sql      ${comprasData.length} registros de compra\n`);

console.log('═'.repeat(200));
console.log('\n✅ GENERACIÓN COMPLETADA\n');
console.log(`📁 Archivos SQL guardados en: ${sqlDir}/\n`);
console.log(`⚠️ SIGUIENTE: Ejecutar en Supabase en este orden:\n`);
console.log(`  1. 00_CREATE_SCHEMA.sql   (crea tablas)`);
console.log(`  2. 01_INSERT_partidas.sql`);
console.log(`  3. 02_INSERT_recursos.sql`);
console.log(`  4. 03_INSERT_apu.sql`);
console.log(`  5. 04_INSERT_compras.sql\n`);
