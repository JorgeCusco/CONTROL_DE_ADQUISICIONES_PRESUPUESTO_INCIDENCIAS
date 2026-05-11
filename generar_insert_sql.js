const fs = require('fs');
const { parse: csvParse } = require('csv-parse/sync');

console.log('🏗️ FASE 3: GENERAR INSERT SQL\n');
console.log('═'.repeat(150));

try {
  const newBdDir = 'DATA_LAST/NUEVA_BD';

  // ================================================
  // 1. INSERT_PARTIDAS.sql
  // ================================================
  console.log('\n1️⃣  Leyendo partidas.csv...\n');

  const partidasRaw = fs.readFileSync(`${newBdDir}/partidas.csv`, 'utf-8');
  const partidas = csvParse(partidasRaw, { columns: true, skip_empty_lines: true, bom: true });

  console.log(`  ✓ ${partidas.length} registros`);

  let insertPartidas = `-- INSERT PARTIDAS
-- Tabla: partidas (El Alcance)
-- Registros: ${partidas.length}

BEGIN TRANSACTION;

INSERT INTO partidas (codigo, descripcion, unidad, metrado) VALUES
`;

  const partidasValues = partidas.map(row => {
    const codigo = String(row.codigo || '').replace(/'/g, "''");
    const desc = String(row.descripcion || '').replace(/'/g, "''");
    const unidad = String(row.unidad || '').replace(/'/g, "''");
    const metrado = parseFloat(row.metrado) || 0;
    return `('${codigo}', '${desc}', '${unidad}', ${metrado})`;
  });

  insertPartidas += partidasValues.join(',\n') + ';\n\nCOMMIT TRANSACTION;\n';

  fs.writeFileSync(`${newBdDir}/INSERT_partidas.sql`, insertPartidas);
  console.log(`  ✓ Generado: INSERT_partidas.sql (${(insertPartidas.length / 1024).toFixed(2)} KB)\n`);

  // ================================================
  // 2. INSERT_INSUMOS_CATALOGO.sql
  // ================================================
  console.log('2️⃣  Leyendo insumos_catalogo.csv...\n');

  const catalogoRaw = fs.readFileSync(`${newBdDir}/insumos_catalogo.csv`, 'utf-8');
  const catalogo = csvParse(catalogoRaw, { columns: true, skip_empty_lines: true, bom: true });

  console.log(`  ✓ ${catalogo.length} insumos únicos`);

  let insertCatalogo = `-- INSERT INSUMOS_CATALOGO
-- Tabla: insumos_catalogo (El Diccionario de Precios)
-- Registros: ${catalogo.length}

BEGIN TRANSACTION;

INSERT INTO insumos_catalogo (codigo, descripcion, unidad, precio_base) VALUES
`;

  const catalogoValues = catalogo.map(row => {
    const codigo = String(row.codigo || '').replace(/'/g, "''");
    const desc = String(row.descripcion || '').replace(/'/g, "''");
    const unidad = String(row.unidad || '').replace(/'/g, "''");
    const precio = parseFloat(row.precio_base) || 0;
    return `('${codigo}', '${desc}', '${unidad}', ${precio})`;
  });

  insertCatalogo += catalogoValues.join(',\n') + ';\n\nCOMMIT TRANSACTION;\n';

  fs.writeFileSync(`${newBdDir}/INSERT_insumos_catalogo.sql`, insertCatalogo);
  console.log(`  ✓ Generado: INSERT_insumos_catalogo.sql (${(insertCatalogo.length / 1024).toFixed(2)} KB)\n`);

  // ================================================
  // 3. INSERT_APU.sql
  // ================================================
  console.log('3️⃣  Leyendo apu.csv...\n');

  const apuRaw = fs.readFileSync(`${newBdDir}/apu.csv`, 'utf-8');
  const apu = csvParse(apuRaw, { columns: true, skip_empty_lines: true, bom: true });

  console.log(`  ✓ ${apu.length} relaciones`);

  let insertApu = `-- INSERT APU
-- Tabla: apu (El Motor de Relación)
-- Registros: ${apu.length}

BEGIN TRANSACTION;

INSERT INTO apu (id, partida_codigo, insumo_codigo, tipo_insumo, aporte_unitario, cuadrilla, rendimiento, aporte_ajustado, cantidad_adquirida, comentario, es_extra) VALUES
`;

  const apuValues = apu.map(row => {
    const id = parseInt(row.id) || 0;
    const partCodigo = String(row.partida_codigo || '').replace(/'/g, "''");
    const insuCodigo = String(row.insumo_codigo || '').replace(/'/g, "''");
    const tipoInsumo = String(row.tipo_insumo || '').replace(/'/g, "''");
    const aporteUnit = parseFloat(row.aporte_unitario) || 0;
    const cuadrilla = row.cuadrilla === '' || row.cuadrilla === 'null' || !row.cuadrilla
      ? 'NULL'
      : parseFloat(row.cuadrilla);
    const rendimiento = parseFloat(row.rendimiento) || 0;
    const aporteAjust = parseFloat(row.aporte_ajustado) || 0;
    const cantAd = parseFloat(row.cantidad_adquirida) || 0;
    const comentario = String(row.comentario || '').replace(/'/g, "''");
    const esExtra = row.es_extra === 'true' || row.es_extra === 'TRUE' ? 'true' : 'false';

    return `(${id}, '${partCodigo}', '${insuCodigo}', '${tipoInsumo}', ${aporteUnit}, ${cuadrilla}, ${rendimiento}, ${aporteAjust}, ${cantAd}, '${comentario}', ${esExtra})`;
  });

  insertApu += apuValues.join(',\n') + ';\n\nCOMMIT TRANSACTION;\n';

  fs.writeFileSync(`${newBdDir}/INSERT_apu.sql`, insertApu);
  console.log(`  ✓ Generado: INSERT_apu.sql (${(insertApu.length / 1024).toFixed(2)} KB)\n`);

  // ================================================
  // Resumen
  // ================================================
  console.log('═'.repeat(150));
  console.log('\n📊 RESUMEN\n');
  console.log('Archivos SQL generados:\n');
  console.log(`1. INSERT_partidas.sql (${partidas.length} registros)`);
  console.log(`2. INSERT_insumos_catalogo.sql (${catalogo.length} registros)`);
  console.log(`3. INSERT_apu.sql (${apu.length} registros)\n`);

  console.log('═'.repeat(150));
  console.log('\n✅ FASE 3 COMPLETADA\n');
  console.log('ORDEN DE EJECUCIÓN EN SUPABASE:\n');
  console.log('1. CREATE_SCHEMA.sql (crea tablas vacías)');
  console.log('2. INSERT_partidas.sql (carga 1,135 partidas)');
  console.log('3. INSERT_insumos_catalogo.sql (carga 1,014 insumos)');
  console.log('4. INSERT_apu.sql (carga 6,124 relaciones)\n');
  console.log('Próximo paso: FASE 4 — Actualizar API routes del frontend\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
