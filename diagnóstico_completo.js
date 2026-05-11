const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500'
});

async function diagnostico() {
  console.log('\n🔍 DIAGNÓSTICO DETALLADO DE TABLAS\n');
  console.log('═'.repeat(150));

  try {
    const client = await pool.connect();

    // 1. PARTIDAS - verificar metrado_fijo
    console.log('\n1️⃣  PARTIDAS - Verificando metrado_fijo\n');
    const partRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN metrado_fijo > 0 THEN 1 END) as con_metrado,
        COUNT(CASE WHEN metrado_fijo = 0 THEN 1 END) as sin_metrado
      FROM partidas
    `);
    const partStats = partRes.rows[0];
    console.log(`  Total: ${partStats.total}`);
    console.log(`  Con metrado_fijo > 0: ${partStats.con_metrado} (${(partStats.con_metrado/partStats.total*100).toFixed(2)}%)`);
    console.log(`  Con metrado_fijo = 0: ${partStats.sin_metrado} (${(partStats.sin_metrado/partStats.total*100).toFixed(2)}%)`);
    
    if (partStats.con_metrado === 0) {
      console.log('  ⚠️  PROBLEMA: Todas las partidas tienen metrado_fijo=0');
    } else {
      console.log('  ✓ Metrados cargados correctamente');
    }

    // 2. INSUMOS - verificar integridad
    console.log('\n2️⃣  INSUMOS - Verificando estructura\n');
    const insRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT codigo_partida) as partidas_únicas,
        COUNT(DISTINCT codigo_insumo) as insumos_únicos,
        COUNT(CASE WHEN incidencia_original > 0 THEN 1 END) as con_incidencia,
        COUNT(CASE WHEN incidencia_original = 0 THEN 1 END) as sin_incidencia,
        COUNT(CASE WHEN cantidad_adquirida > 0 THEN 1 END) as con_cantidad_adq
      FROM insumos
    `);
    const insStats = insRes.rows[0];
    console.log(`  Total registros: ${insStats.total}`);
    console.log(`  Partidas únicas: ${insStats.partidas_únicas}`);
    console.log(`  Insumos únicos: ${insStats.insumos_únicos}`);
    console.log(`  Con incidencia_original > 0: ${insStats.con_incidencia} (${(insStats.con_incidencia/insStats.total*100).toFixed(2)}%)`);
    console.log(`  Con incidencia_original = 0: ${insStats.sin_incidencia} (${(insStats.sin_incidencia/insStats.total*100).toFixed(2)}%)`);
    console.log(`  Con cantidad_adquirida: ${insStats.con_cantidad_adq}`);

    // 3. INSUMOS - Verificar FKs
    console.log('\n3️⃣  INSUMOS - Integridad Referencial\n');
    const fkRes = await client.query(`
      SELECT 
        COUNT(*) as total_insumos,
        COUNT(CASE WHEN codigo_partida IN (SELECT codigo FROM partidas) THEN 1 END) as con_fk_válida,
        COUNT(CASE WHEN codigo_partida NOT IN (SELECT codigo FROM partidas) THEN 1 END) as fk_inválida
      FROM insumos
    `);
    const fkStats = fkRes.rows[0];
    console.log(`  Total insumos: ${fkStats.total_insumos}`);
    console.log(`  Con FK válida a partidas: ${fkStats.con_fk_válida} ✓`);
    console.log(`  Con FK inválida: ${fkStats.fk_inválida}`);
    
    if (fkStats.fk_inválida > 0) {
      console.log('  ⚠️  PROBLEMA: Hay insumos con código_partida inexistente');
    }

    // 4. APUS_DETALLADO - verificar estructura
    console.log('\n4️⃣  APUS_DETALLADO - Verificando estructura\n');
    const apuRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT partida_codigo) as partidas_únicas,
        COUNT(DISTINCT insumo_codigo) as insumos_únicos
      FROM apus_detallado
    `);
    const apuStats = apuRes.rows[0];
    console.log(`  Total registros: ${apuStats.total}`);
    console.log(`  Partidas únicas: ${apuStats.partidas_únicas}`);
    console.log(`  Insumos únicos: ${apuStats.insumos_únicos}`);

    // 5. COMPRAS - estado
    console.log('\n5️⃣  COMPRAS - Estado\n');
    const compRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cantidad_und > 0 THEN 1 END) as con_cantidad,
        COUNT(DISTINCT insumo_descripcion) as descripciones_únicas
      FROM compras
    `);
    const compStats = compRes.rows[0];
    console.log(`  Total registros: ${compStats.total}`);
    console.log(`  Con cantidad > 0: ${compStats.con_cantidad}`);
    console.log(`  Descripciones únicas: ${compStats.descripciones_únicas}`);

    // 6. MAPEO VINCULACIÓN
    console.log('\n6️⃣  MAPEO_VINCULACION\n');
    const mapRes = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN insumo_nombre IS NOT NULL THEN 1 END) as con_insumo,
        COUNT(CASE WHEN compra_id IS NOT NULL THEN 1 END) as con_compra_id
      FROM mapeo_vinculacion
    `);
    const mapStats = mapRes.rows[0];
    console.log(`  Total mapeos: ${mapStats.total}`);
    console.log(`  Con insumo_nombre: ${mapStats.con_insumo}`);
    console.log(`  Con compra_id: ${mapStats.con_compra_id}`);

    // ANÁLISIS FINAL
    console.log('\n' + '═'.repeat(150));
    console.log('\n📋 RESUMEN Y RECOMENDACIONES\n');

    let issues = [];
    let warnings = [];

    if (partStats.sin_metrado > 0) {
      warnings.push(`⚠️  ${partStats.sin_metrado} partidas tienen metrado_fijo=0 (revisar si es intencional)`);
    }

    if (insStats.sin_incidencia > 0) {
      warnings.push(`⚠️  ${insStats.sin_incidencia} insumos tienen incidencia_original=0 (revisar si es intencional)`);
    }

    if (fkStats.fk_inválida > 0) {
      issues.push(`❌ ${fkStats.fk_inválida} insumos tienen código_partida inexistente`);
    }

    if (insStats.con_cantidad_adq === 0) {
      warnings.push(`⚠️  cantidad_adquirida no está cargada (está vacío)`);
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ TODAS LAS VALIDACIONES PASARON - Sistema completamente funcional\n');
      console.log('Estado actual:');
      console.log(`  • ${partStats.total} partidas cargadas`);
      console.log(`  • ${insStats.total} insumos cargados`);
      console.log(`  • ${apuStats.total} registros APU desglosados`);
      console.log(`  • ${compStats.total} documentos de compra cargados`);
      console.log(`  • ${mapStats.total} vinculaciones APU-Compra establecidas`);
      console.log('\n  👉 LISTO PARA PRODUCCIÓN - Procede con las operaciones del sistema');
    } else {
      if (issues.length > 0) {
        console.log('❌ PROBLEMAS CRÍTICOS:');
        issues.forEach(i => console.log(`   ${i}`));
      }
      if (warnings.length > 0) {
        console.log('\n⚠️  ADVERTENCIAS:');
        warnings.forEach(w => console.log(`   ${w}`));
      }
    }

    client.release();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  await pool.end();
}

diagnostico();
