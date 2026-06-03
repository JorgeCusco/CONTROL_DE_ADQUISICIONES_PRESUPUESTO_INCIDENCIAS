const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hcdqzxkqhqgvbwplrmko.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZHF6eGtxaHFndmJ3cGxybWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEwMjE0NDcsImV4cCI6MjAxNjU5NzQ0N30.AQFG-pf_5zPmkVdC_OvVkgJGVJfVjsJ-PiVqVqy3tYE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function evaluarTablas() {
  console.log('📊 EVALUANDO ESTADO DE TABLAS EN SUPABASE\n');
  console.log('═'.repeat(150));

  try {
    // 1. Partidas
    console.log('\n1️⃣  TABLA: partidas\n');
    const { count: partidasCount, error: e1 } = await supabase
      .from('partidas')
      .select('*', { count: 'exact', head: true });
    
    if (!e1) {
      console.log(`  ✓ Total registros: ${partidasCount}`);
      
      const { data: sample1 } = await supabase
        .from('partidas')
        .select('codigo, descripcion, metrado_fijo')
        .limit(3);
      console.log('  ✓ Sample:');
      sample1?.forEach(r => console.log(`    - [${r.codigo}] ${r.descripcion?.substring(0, 40)} | metrado_fijo: ${r.metrado_fijo}`));
    } else {
      console.log(`  ✗ Error: ${e1.message}`);
    }

    // 2. Insumos
    console.log('\n2️⃣  TABLA: insumos\n');
    const { count: insumosCount, error: e2 } = await supabase
      .from('insumos')
      .select('*', { count: 'exact', head: true });
    
    if (!e2) {
      console.log(`  ✓ Total registros: ${insumosCount}`);
      
      const { data: sample2 } = await supabase
        .from('insumos')
        .select('codigo_partida, codigo_insumo, descripcion, incidencia_original, cantidad_adquirida')
        .limit(3);
      console.log('  ✓ Sample:');
      sample2?.forEach(r => console.log(`    - Part:[${r.codigo_partida}] Insumo:[${r.codigo_insumo}] ${r.descripcion?.substring(0, 30)} | incidencia_orig: ${r.incidencia_original} | cant_acq: ${r.cantidad_adquirida}`));
    } else {
      console.log(`  ✗ Error: ${e2.message}`);
    }

    // 3. Compras
    console.log('\n3️⃣  TABLA: compras\n');
    const { count: comprasCount, error: e3 } = await supabase
      .from('compras')
      .select('*', { count: 'exact', head: true });
    
    if (!e3) {
      console.log(`  ✓ Total registros: ${comprasCount}`);
      
      const { data: sample3 } = await supabase
        .from('compras')
        .select('insumo_descripcion, unidad_und, cantidad_und, precio_und')
        .limit(3);
      console.log('  ✓ Sample:');
      sample3?.forEach(r => console.log(`    - ${r.insumo_descripcion?.substring(0, 30)} | ${r.cantidad_und} ${r.unidad_und} @ ${r.precio_und}`));
    } else {
      console.log(`  ✗ Error: ${e3.message}`);
    }

    // 4. APUs Detallado
    console.log('\n4️⃣  TABLA: apus_detallado\n');
    const { count: apusCount, error: e4 } = await supabase
      .from('apus_detallado')
      .select('*', { count: 'exact', head: true });
    
    if (!e4) {
      console.log(`  ✓ Total registros: ${apusCount}`);
      
      const { data: sample4 } = await supabase
        .from('apus_detallado')
        .select('partida_codigo, insumo_codigo, insumo_descripcion, tipo_insumo')
        .limit(3);
      console.log('  ✓ Sample:');
      sample4?.forEach(r => console.log(`    - [${r.partida_codigo}] Insumo:[${r.insumo_codigo}] ${r.insumo_descripcion?.substring(0, 25)} (${r.tipo_insumo})`));
    } else {
      console.log(`  ✗ Error: ${e4.message}`);
    }

    // 5. Mapeo Vinculación
    console.log('\n5️⃣  TABLA: mapeo_vinculacion\n');
    const { count: mapeoCount, error: e5 } = await supabase
      .from('mapeo_vinculacion')
      .select('*', { count: 'exact', head: true });
    
    if (!e5) {
      console.log(`  ✓ Total registros: ${mapeoCount}`);
    } else {
      console.log(`  ✗ Error: ${e5.message}`);
    }

    // 6. Historial Cambios
    console.log('\n6️⃣  TABLA: historial_cambios\n');
    const { count: historialCount, error: e6 } = await supabase
      .from('historial_cambios')
      .select('*', { count: 'exact', head: true });
    
    if (!e6) {
      console.log(`  ✓ Total registros: ${historialCount}`);
    } else {
      console.log(`  ✗ Error: ${e6.message}`);
    }

    // ANÁLISIS CRÍTICO
    console.log('\n' + '═'.repeat(150));
    console.log('\n📋 DIAGNÓSTICO\n');

    const tablesStatus = [
      { nombre: 'partidas', count: partidasCount, error: e1, critico: true },
      { nombre: 'insumos', count: insumosCount, error: e2, critico: true },
      { nombre: 'apus_detallado', count: apusCount, error: e4, critico: true },
      { nombre: 'compras', count: comprasCount, error: e3, critico: false },
      { nombre: 'mapeo_vinculacion', count: mapeoCount, error: e5, critico: false },
      { nombre: 'historial_cambios', count: historialCount, error: e6, critico: false }
    ];

    let allGood = true;
    tablesStatus.forEach(t => {
      const status = t.error ? '❌' : t.count === 0 ? '⚠️' : '✅';
      const marker = t.critico ? '🔴 CRÍTICO' : '🔵 SECUNDARIO';
      console.log(`${status} ${t.nombre.padEnd(25)} ${marker.padEnd(20)} registros: ${t.count || 'ERROR'}`);
      
      if (t.critico && (t.error || t.count === 0)) allGood = false;
    });

    console.log('\n' + '═'.repeat(150));
    console.log('\n🎯 EVALUACIÓN FINAL\n');

    if (allGood && partidasCount > 0 && insumosCount > 0 && apusCount > 0) {
      console.log('✅ EXCELENTE - Tus tablas están LISTAS para usar');
      console.log(`   - partidas: ${partidasCount} registros ✓`);
      console.log(`   - insumos: ${insumosCount} registros ✓`);
      console.log(`   - apus_detallado: ${apusCount} registros ✓`);
      console.log(`   - compras: ${comprasCount} registros`);
      console.log('\n   👉 El sistema está completamente cargado y operativo\n');
    } else if (insumosCount === 0 || partidasCount === 0) {
      console.log('⚠️ INCOMPLETO - Faltan datos críticos');
      console.log(`   - partidas: ${partidasCount > 0 ? '✓' : '❌ FALTA CARGAR'}`);
      console.log(`   - insumos: ${insumosCount > 0 ? '✓' : '❌ FALTA CARGAR'}`);
      console.log(`   - apus_detallado: ${apusCount > 0 ? '✓' : '❌ FALTA CARGAR'}`);
      console.log('\n   👉 Necesitas ejecutar los SQL INSERT en Supabase\n');
    } else {
      console.log('⚠️ PARCIAL - Algunas tablas necesitan revisión');
    }

  } catch (err) {
    console.error('❌ Error conectando a Supabase:', err.message);
  }
}

evaluarTablas();
