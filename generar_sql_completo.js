const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

console.log('✅ GENERAR SQL PARA SUPABASE\n');
console.log('═'.repeat(200));

const csvDir = 'DATA_LAST/TABLAS_FINAL_BOM';
const sqlDir = 'DATA_LAST/SQL';

// Crear carpeta SQL
if (!fs.existsSync(sqlDir)) {
  fs.mkdirSync(sqlDir, { recursive: true });
}

// =====================================================
// 1. INSERTAR PARTIDAS_P
// =====================================================
console.log('\n1️⃣ GENERANDO INSERT_partidas_P.sql\n');

let csvPartidas = fs.readFileSync(path.join(csvDir, 'PARTIDAS_P.csv'), 'utf8');
// Remover BOM UTF-8
if (csvPartidas.charCodeAt(0) === 0xFEFF) {
  csvPartidas = csvPartidas.slice(1);
}
const partidasData = parse(csvPartidas, { columns: true });

let sqlPartidas = `-- Partidas del presupuesto (expediente técnico con cantidad, precio y total)
-- Fuente: PARTIDAS_P.csv (${partidasData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO partidas (codigo, descripcion, unidad, cantidad_presupuestada, precio_unitario_presupuestado, total_presupuestado, rendimiento, origen)
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
  return `  (${codigo}, ${desc}, ${unidad}, ${cantidad}, ${precio}, ${total}, ${rend}, 'P')${comma}`;
});

sqlPartidas += sqlPartidosRows.join('\n');
sqlPartidas += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, 'INSERT_partidas_P.sql'), '﻿' + sqlPartidas, 'utf8');
console.log(`  ✓ ${partidasData.length} partidas extraídas (con cantidad, precio, total)`);
console.log(`  ✓ Guardado: INSERT_partidas_P.sql\n`);

// =====================================================
// 2. INSERTAR INSUMOS_CATALOGO_P (DEDUPLICADO)
// =====================================================
console.log('2️⃣ GENERANDO INSERT_insumos_catalogo_P.sql\n');

let csvInsumos = fs.readFileSync(path.join(csvDir, 'INSUMOS_P.csv'), 'utf8');
// Remover BOM UTF-8
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

let sqlInsumos = `-- Catálogo de insumos único (presupuesto)
-- Fuente: INSUMOS_P.csv (${insumosData.length} registros, ${insumosMap.size} únicos)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO insumos_catalogo (codigo, descripcion, unidad, precio_base, total, origen)
VALUES
`;

const insumosArray = Array.from(insumosMap.values());
const sqlInsumosRows = insumosArray.map((row, idx) => {
  const codigo = row.codigo ? `'${row.codigo.replace(/'/g, "''")}'` : 'NULL';
  const desc = row.descripcion ? `'${row.descripcion.replace(/'/g, "''")}'` : 'NULL';
  const unidad = row.unidad ? `'${row.unidad.replace(/'/g, "''")}'` : 'NULL';
  const precio = row.costo !== '' && row.costo !== undefined ? parseFloat(row.costo) : 0;
  const total = row.total !== '' && row.total !== undefined ? parseFloat(row.total) : 0;

  const comma = idx === insumosArray.length - 1 ? ';' : ',';
  return `  (${codigo}, ${desc}, ${unidad}, ${precio}, ${total}, 'P')${comma}`;
});

sqlInsumos += sqlInsumosRows.join('\n');
sqlInsumos += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, 'INSERT_insumos_catalogo_P.sql'), '﻿' + sqlInsumos, 'utf8');
console.log(`  ✓ ${insumosArray.length} insumos únicos extraídos (de ${insumosData.length} registros)`);
console.log(`  ✓ Guardado: INSERT_insumos_catalogo_P.sql\n`);

// =====================================================
// 3. INSERTAR APU_P
// =====================================================
console.log('3️⃣ GENERANDO INSERT_apu_P.sql\n');

let csvAcus = fs.readFileSync(path.join(csvDir, 'ACUS_P.csv'), 'utf8');
// Remover BOM UTF-8
if (csvAcus.charCodeAt(0) === 0xFEFF) {
  csvAcus = csvAcus.slice(1);
}
const acusData = parse(csvAcus, { columns: true });

let sqlApu = `-- APU (Análisis de Precios Unitarios) del presupuesto
-- Relaciones partida ↔ insumo
-- Fuente: ACUS_P.csv (${acusData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO apu (partida_codigo, insumo_codigo, tipo_insumo, aporte_unitario, cuadrilla, rendimiento, origen)
VALUES
`;

const sqlApuRows = acusData.map((row, idx) => {
  const partida = row.item ? `'${row.item.replace(/'/g, "''")}'` : 'NULL';
  const insumo = row.codigo ? `'${row.codigo.replace(/'/g, "''")}'` : 'NULL';
  const tipo = row.tipo ? `'${row.tipo.replace(/'/g, "''")}'` : 'NULL';
  const aporte = row.cantidad !== '' && row.cantidad !== undefined ? parseFloat(row.cantidad) : 0;
  const cuadrilla = row.recursos !== '' && row.recursos !== undefined ? parseFloat(row.recursos) : 0;
  const rend = row.rendimiento ? `'${row.rendimiento.replace(/'/g, "''")}'` : 'NULL';

  const comma = idx === acusData.length - 1 ? ';' : ',';
  return `  (${partida}, ${insumo}, ${tipo}, ${aporte}, ${cuadrilla}, ${rend}, 'P')${comma}`;
});

sqlApu += sqlApuRows.join('\n');
sqlApu += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, 'INSERT_apu_P.sql'), '﻿' + sqlApu, 'utf8');
console.log(`  ✓ ${acusData.length} relaciones partida-insumo extraídas`);
console.log(`  ✓ Guardado: INSERT_apu_P.sql\n`);

// =====================================================
// 4. INSERTAR COMPRAS_C
// =====================================================
console.log('4️⃣ GENERANDO INSERT_compras_C.sql\n');

let csvCompras = fs.readFileSync(path.join(csvDir, 'COMPRAS_C.csv'), 'utf8');
// Remover BOM UTF-8
if (csvCompras.charCodeAt(0) === 0xFEFF) {
  csvCompras = csvCompras.slice(1);
}
const comprasData = parse(csvCompras, { columns: true });

let sqlCompras = `-- Compras realizadas (ordenes de compra, caja chica, etc.)
-- Fuente: COMPRAS_C.csv (${comprasData.length} registros)
-- Fecha: ${new Date().toISOString()}

BEGIN;

INSERT INTO compras (anio, componente, detalle, unidad, cantidad, precio_unit, total, tipo_compra, num_compra, completo, origen)
VALUES
`;

const sqlComprasRows = comprasData.map((row, idx) => {
  const anio = row.anio !== '' && row.anio !== undefined && row.anio !== 'null' ? parseInt(row.anio) : 'NULL';
  const comp = row.componente ? `'${row.componente.replace(/'/g, "''")}'` : 'NULL';
  const det = row.detalle ? `'${row.detalle.replace(/'/g, "''")}'` : 'NULL';
  const uni = row.unidad ? `'${row.unidad.replace(/'/g, "''")}'` : 'NULL';
  const cant = row.cantidad !== '' && row.cantidad !== undefined ? parseFloat(row.cantidad) : 0;
  const precio = row.precio_unit !== '' && row.precio_unit !== undefined ? parseFloat(row.precio_unit) : 0;
  const total = row.total !== '' && row.total !== undefined ? parseFloat(row.total) : 0;
  const tipo = row.tipo_compra ? `'${row.tipo_compra.replace(/'/g, "''")}'` : 'NULL';
  const num = row.num_compra ? `'${row.num_compra.toString().replace(/'/g, "''")}'` : 'NULL';
  const completo = row.completo === 'true' ? 'true' : 'false';

  const comma = idx === comprasData.length - 1 ? ';' : ',';
  return `  (${anio}, ${comp}, ${det}, ${uni}, ${cant}, ${precio}, ${total}, ${tipo}, ${num}, ${completo}, 'C')${comma}`;
});

sqlCompras += sqlComprasRows.join('\n');
sqlCompras += `

COMMIT;
`;

fs.writeFileSync(path.join(sqlDir, 'INSERT_compras_C.sql'), '﻿' + sqlCompras, 'utf8');
console.log(`  ✓ ${comprasData.length} compras extraídas`);
console.log(`  ✓ Completas: ${comprasData.filter(r => r.completo === 'true').length} | Incompletas: ${comprasData.filter(r => r.completo === 'false').length}`);
console.log(`  ✓ Guardado: INSERT_compras_C.sql\n`);

// =====================================================
// RESUMEN
// =====================================================
console.log('═'.repeat(200));
console.log('\n📊 RESUMEN FINAL\n');
console.log(`PRESUPUESTO (_P):`);
console.log(`  INSERT_partidas_P.sql         ${partidasData.length} partidas`);
console.log(`  INSERT_insumos_catalogo_P.sql ${insumosArray.length} insumos únicos`);
console.log(`  INSERT_apu_P.sql              ${acusData.length} relaciones APU\n`);
console.log(`COMPRAS (_C):`);
console.log(`  INSERT_compras_C.sql          ${comprasData.length} registros de compra\n`);

console.log('═'.repeat(200));
console.log('\n✅ GENERACIÓN COMPLETADA\n');
console.log(`📁 Archivos SQL guardados en: ${sqlDir}/\n`);
console.log(`⚠️ SIGUIENTE: Ejecutar en Supabase en este orden:`);
console.log(`  1. INSERT_partidas_P.sql`);
console.log(`  2. INSERT_insumos_catalogo_P.sql`);
console.log(`  3. INSERT_apu_P.sql`);
console.log(`  4. INSERT_compras_C.sql\n`);
