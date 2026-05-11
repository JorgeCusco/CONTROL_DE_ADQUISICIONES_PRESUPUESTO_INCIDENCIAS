const XLSX = require('xlsx');
const fs = require('fs');

console.log('='.repeat(120));
console.log('📋 COMPARACIÓN: PARTIDAS FINALES PRESUPUESTO vs ACUS_P');
console.log('='.repeat(120));

// 1. Extraer partidas del PRESUPUESTO.xlsx
const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';
const workbook = XLSX.readFile(presupuestoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

const partidasPresupuesto = new Map(); // codigo -> descripcion

data.forEach(row => {
  Object.entries(row).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      const matches = value.match(/OE\.(\d+)\.(\d+)\.(\d+)\.(\d+)/g);
      if (matches) {
        matches.forEach(codigo => {
          const desc = row['__EMPTY_1'] || '';
          if (!partidasPresupuesto.has(codigo)) {
            partidasPresupuesto.set(codigo, String(desc).trim());
          }
        });
      }
    }
  });
});

console.log(`\n1️⃣ PRESUPUESTO.xlsx`);
console.log(`   Total partidas finales (OE.X.X.X.X): ${partidasPresupuesto.size}`);
console.log(`   Ejemplos: ${Array.from(partidasPresupuesto.keys()).slice(0, 5).join(', ')}`);

// 2. Extraer partidas del ACUS_P.csv
const csvPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_LAST\\TABLAS_FINAL_BOM\\ACUS_P.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(l => l.trim());
const header = lines[0].split(',');
const itemIndex = header.findIndex(h => h.includes('item'));

const partidasAcus = new Map(); // codigo -> nombre_partida

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  const codigo = values[itemIndex] ? values[itemIndex].trim() : null;

  if (codigo && codigo.match(/^OE\.\d+\.\d+\.\d+\.\d+$/)) {
    const nombre = values[1] ? values[1].trim().replace(/^"|"$/g, '') : 'N/A';
    if (!partidasAcus.has(codigo)) {
      partidasAcus.set(codigo, nombre);
    }
  }
}

console.log(`\n2️⃣ ACUS_P.csv`);
console.log(`   Total partidas finales (OE.X.X.X.X): ${partidasAcus.size}`);
console.log(`   Ejemplos: ${Array.from(partidasAcus.keys()).slice(0, 5).join(', ')}`);

// 3. Comparar
const enPresupuestoNoEnAcus = Array.from(partidasPresupuesto.keys()).filter(
  p => !partidasAcus.has(p)
);
const enAcusNoEnPresupuesto = Array.from(partidasAcus.keys()).filter(
  p => !partidasPresupuesto.has(p)
);
const enAmbos = Array.from(partidasPresupuesto.keys()).filter(
  p => partidasAcus.has(p)
);

console.log(`\n${'-'.repeat(120)}\n`);
console.log(`✅ EN AMBOS: ${enAmbos.length}`);
console.log(`❌ FALTANTES EN ACUS: ${enPresupuestoNoEnAcus.length}`);
console.log(`⚠️ EN ACUS pero NO en PRESUPUESTO: ${enAcusNoEnPresupuesto.length}`);

const porcentajeCobertura = ((enAmbos.length / partidasPresupuesto.size) * 100).toFixed(1);
console.log(`\n📊 Cobertura de ACUS: ${porcentajeCobertura}% (${enAmbos.length}/${partidasPresupuesto.size})`);

// 4. Mostrar faltantes
if (enPresupuestoNoEnAcus.length > 0) {
  console.log(`\n${'-'.repeat(120)}\n`);
  console.log(`🔴 PARTIDAS FALTANTES EN ACUS_P.csv (${enPresupuestoNoEnAcus.length} total):\n`);

  // Agrupar por prefijo
  const agrupadaos = {};
  enPresupuestoNoEnAcus.forEach(codigo => {
    const prefijo = codigo.substring(0, codigo.lastIndexOf('.'));
    if (!agrupadaos[prefijo]) agrupadaos[prefijo] = [];
    agrupadaos[prefijo].push(codigo);
  });

  Object.entries(agrupadaos).slice(0, 15).forEach(([prefijo, codigos]) => {
    console.log(`\n   ${prefijo} → ${codigos.length} partidas faltantes:`);
    codigos.slice(0, 5).forEach(codigo => {
      const desc = partidasPresupuesto.get(codigo);
      console.log(`      ❌ ${codigo} | ${desc.substring(0, 60)}`);
    });
    if (codigos.length > 5) {
      console.log(`      ... y ${codigos.length - 5} más`);
    }
  });

  if (Object.keys(agrupadaos).length > 15) {
    console.log(`\n   ... y ${Object.keys(agrupadaos).length - 15} grupos más`);
  }
}

// 5. Resumen final
console.log(`\n${'-'.repeat(120)}\n`);
console.log(`📌 CONCLUSIÓN:\n`);

if (porcentajeCobertura >= 95) {
  console.log(`   ✅ ACUS_P.csv cubre ${porcentajeCobertura}% del presupuesto`);
  console.log(`   ℹ️  Solo faltan ${enPresupuestoNoEnAcus.length} partidas (pueden ser excepciones)`);
} else if (porcentajeCobertura >= 85) {
  console.log(`   🟡 ACUS_P.csv cubre ${porcentajeCobertura}% del presupuesto`);
  console.log(`   ⚠️  Faltan ${enPresupuestoNoEnAcus.length} partidas significativas`);
} else {
  console.log(`   🔴 ACUS_P.csv cubre SOLO ${porcentajeCobertura}% del presupuesto`);
  console.log(`   ❌ Faltan ${enPresupuestoNoEnAcus.length} partidas — REQUIERE CORRECCIÓN`);
}

// Guardar listado de faltantes
const faltantes = enPresupuestoNoEnAcus.map(codigo => ({
  codigo,
  descripcion: partidasPresupuesto.get(codigo)
}));

fs.writeFileSync(
  'PARTIDAS_FALTANTES_EN_ACUS.json',
  JSON.stringify(
    {
      total_presupuesto: partidasPresupuesto.size,
      total_acus: partidasAcus.size,
      cobertura_pct: porcentajeCobertura,
      faltantes_count: enPresupuestoNoEnAcus.length,
      faltantes: faltantes
    },
    null,
    2
  )
);

console.log(`\n✅ Listado de faltantes guardado en: PARTIDAS_FALTANTES_EN_ACUS.json`);
console.log(`\n${'-'.repeat(120)}\n`);
