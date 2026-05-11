const fs = require('fs');
const path = require('path');
const { parse: csvParse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

console.log('🏗️ FASE 1: GENERAR 3 CSV PARA NUEVA BD\n');
console.log('═'.repeat(150));

try {
  // Crear carpeta NUEVA_BD
  const newBdDir = 'DATA_LAST/NUEVA_BD';
  if (!fs.existsSync(newBdDir)) {
    fs.mkdirSync(newBdDir, { recursive: true });
    console.log(`\n✓ Carpeta creada: ${newBdDir}\n`);
  }

  // ============================================
  // 1. GENERAR PARTIDAS.CSV (simplificada)
  // ============================================
  console.log('1️⃣  PARTIDAS.csv\n');

  const partidasRaw = fs.readFileSync('DATA_LAST/partidas.csv', 'utf-8');
  const partidasData = csvParse(partidasRaw, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  const partidasSimple = partidasData.map(row => ({
    codigo: row.codigo,
    descripcion: row.descripcion,
    unidad: row.unidad,
    metrado: parseFloat(row.metrado_fijo) || 0
  }));

  const csvPartidas = stringify(partidasSimple, {
    header: true,
    columns: ['codigo', 'descripcion', 'unidad', 'metrado']
  });

  fs.writeFileSync(`${newBdDir}/partidas.csv`, csvPartidas);
  console.log(`  ✓ ${partidasSimple.length} partidas`);
  console.log(`  ✓ Columnas: codigo, descripcion, unidad, metrado\n`);

  // ============================================
  // 2. GENERAR INSUMOS_CATALOGO.CSV (catálogo único)
  // ============================================
  console.log('2️⃣  INSUMOS_CATALOGO.csv\n');

  const apusRaw = fs.readFileSync('DATA_LAST/AA.apus_detallado.csv', 'utf-8');
  const apusData = csvParse(apusRaw, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  const insumosCatalogo = new Map();
  apusData.forEach(row => {
    const codigo = String(row.insumo_codigo || '').trim();
    if (codigo && !insumosCatalogo.has(codigo)) {
      insumosCatalogo.set(codigo, {
        codigo: codigo,
        descripcion: String(row.insumo_descripcion || '').trim(),
        unidad: String(row.insumo_unidad || '').trim(),
        precio_base: parseFloat(row.insumo_precio) || 0
      });
    }
  });

  const catalogoArray = Array.from(insumosCatalogo.values()).sort((a, b) =>
    a.codigo.localeCompare(b.codigo)
  );

  const csvCatalogo = stringify(catalogoArray, {
    header: true,
    columns: ['codigo', 'descripcion', 'unidad', 'precio_base']
  });

  fs.writeFileSync(`${newBdDir}/insumos_catalogo.csv`, csvCatalogo);
  console.log(`  ✓ ${catalogoArray.length} insumos únicos`);
  console.log(`  ✓ Columnas: codigo, descripcion, unidad, precio_base\n`);

  // ============================================
  // 3. GENERAR APU.CSV (relaciones)
  // ============================================
  console.log('3️⃣  APU.csv\n');

  const apuRelaciones = new Map();
  let contador = 1;

  apusData.forEach(row => {
    const partidaCodigo = String(row.partida_codigo || '').trim();
    const insumoCodigo = String(row.insumo_codigo || '').trim();
    const key = `${partidaCodigo}|${insumoCodigo}`;

    if (partidaCodigo && insumoCodigo && !apuRelaciones.has(key)) {
      apuRelaciones.set(key, {
        id: contador++,
        partida_codigo: partidaCodigo,
        insumo_codigo: insumoCodigo,
        tipo_insumo: String(row.tipo_insumo || '').trim(),
        aporte_unitario: parseFloat(row.insumo_cantidad) || 0,
        cuadrilla: row.insumo_recursos === '-' ? null : parseFloat(row.insumo_recursos) || null,
        rendimiento: parseFloat(row.partida_rendimiento) || 0,
        aporte_ajustado: parseFloat(row.insumo_cantidad) || 0,
        cantidad_adquirida: 0,
        comentario: '',
        es_extra: false
      });
    }
  });

  const apuArray = Array.from(apuRelaciones.values()).sort((a, b) =>
    a.partida_codigo.localeCompare(b.partida_codigo) ||
    a.insumo_codigo.localeCompare(b.insumo_codigo)
  );

  // Reasignar IDs secuenciales
  apuArray.forEach((row, idx) => {
    row.id = idx + 1;
  });

  const csvApu = stringify(apuArray, {
    header: true,
    columns: [
      'id', 'partida_codigo', 'insumo_codigo', 'tipo_insumo',
      'aporte_unitario', 'cuadrilla', 'rendimiento',
      'aporte_ajustado', 'cantidad_adquirida', 'comentario', 'es_extra'
    ]
  });

  fs.writeFileSync(`${newBdDir}/apu.csv`, csvApu);
  console.log(`  ✓ ${apuArray.length} relaciones partida↔insumo`);
  console.log(`  ✓ Columnas: id, partida_codigo, insumo_codigo, tipo_insumo, ...`);
  console.log(`  ✓ aporte_unitario = insumo_cantidad original`);
  console.log(`  ✓ aporte_ajustado = campo editable (inicia igual que aporte_unitario)\n`);

  // ============================================
  // 4. ESTADÍSTICAS
  // ============================================
  console.log('═'.repeat(150));
  console.log('\n📊 ESTADÍSTICAS\n');

  // Análisis de datos
  let conCuadrilla = 0;
  let sinCuadrilla = 0;
  let maxRendimiento = 0;
  let sinRendimiento = 0;

  apuArray.forEach(row => {
    if (row.cuadrilla) conCuadrilla++;
    else sinCuadrilla++;

    if (row.rendimiento > 0) maxRendimiento = Math.max(maxRendimiento, row.rendimiento);
    else sinRendimiento++;
  });

  console.log(`PARTIDAS:`);
  console.log(`  Total: ${partidasSimple.length}`);
  console.log(`  Con metrado > 0: ${partidasSimple.filter(p => p.metrado > 0).length}\n`);

  console.log(`CATÁLOGO INSUMOS:`);
  console.log(`  Únicos: ${catalogoArray.length}`);
  console.log(`  Precio mínimo: $${Math.min(...catalogoArray.map(c => c.precio_base)).toFixed(2)}`);
  console.log(`  Precio máximo: $${Math.max(...catalogoArray.map(c => c.precio_base)).toFixed(2)}\n`);

  console.log(`RELACIONES APU:`);
  console.log(`  Total: ${apuArray.length}`);
  console.log(`  Con cuadrilla: ${conCuadrilla}`);
  console.log(`  Sin cuadrilla (materiales): ${sinCuadrilla}`);
  console.log(`  Con rendimiento: ${apuArray.length - sinRendimiento}`);
  console.log(`  Max rendimiento: ${maxRendimiento.toFixed(2)}\n`);

  console.log('═'.repeat(150));
  console.log('\n✅ FASE 1 COMPLETADA\n');
  console.log(`📁 Archivos generados en: ${newBdDir}/\n`);
  console.log('Próximo paso: FASE 2 — Generar CREATE_SCHEMA.sql\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
