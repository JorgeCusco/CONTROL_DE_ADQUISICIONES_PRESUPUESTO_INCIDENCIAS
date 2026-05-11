const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(120));
console.log('📊 COMPARACIÓN: PRESUPUESTO.xlsx vs ACUS_P.csv');
console.log('='.repeat(120));

// 1. Leer PRESUPUESTO.xlsx
const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';
const acusPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_LAST\\TABLAS_FINAL_BOM\\ACUS_P.csv';

console.log('\n1️⃣ LEYENDO PRESUPUESTO.xlsx...\n');

if (!fs.existsSync(presupuestoPath)) {
  console.log(`❌ Archivo no encontrado: ${presupuestoPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(presupuestoPath);
console.log(`✅ Archivo cargado`);
console.log(`📄 Hojas encontradas: ${workbook.SheetNames.join(', ')}`);

// Analizar cada hoja
const partidasExcel = new Set();
const detalleExcel = {};

workbook.SheetNames.forEach((sheetName, idx) => {
  console.log(`\n   Hoja ${idx + 1}: "${sheetName}"`);

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`   ├─ Registros: ${data.length}`);

  // Buscar columnas que contengan código de partida
  if (data.length > 0) {
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    console.log(`   ├─ Columnas: ${keys.slice(0, 5).join(', ')}...`);

    // Buscar patrones OE.X.X.X.X
    const codigosCandidatos = keys.filter(k =>
      k.toLowerCase().includes('partida') ||
      k.toLowerCase().includes('codigo') ||
      k.toLowerCase().includes('item')
    );

    console.log(`   └─ Campos de código potenciales: ${codigosCandidatos.join(', ')}`);

    // Extraer códigos de partida
    data.forEach(row => {
      for (const campo of codigosCandidatos) {
        const valor = row[campo];
        if (valor && typeof valor === 'string' && valor.match(/^OE\.\d+/)) {
          const codigo = valor.trim().split(' ')[0];
          if (codigo.match(/^OE\.\d+/)) {
            partidasExcel.add(codigo);
            if (!detalleExcel[codigo]) {
              detalleExcel[codigo] = {
                descripcion: row[Object.keys(row).find(k => k.toLowerCase().includes('desc'))] || 'N/A',
                fuente: sheetName
              };
            }
          }
        }
      }
    });
  }
});

console.log(`\n✅ Total partidas únicas extraídas del Excel: ${partidasExcel.size}`);

// 2. Leer ACUS_P.csv
console.log('\n' + '='.repeat(120));
console.log('\n2️⃣ LEYENDO ACUS_P.csv...\n');

const csvContent = fs.readFileSync(acusPath, 'utf-8');
const lines = csvContent.split('\n').filter(l => l.trim());
const header = lines[0].split(',');
const itemIndex = header.findIndex(h => h.includes('item'));

const partidasAcus = new Set();
const detalleAcus = {};

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(',');
  const codigo = values[itemIndex] ? values[itemIndex].trim() : null;

  if (codigo && codigo.match(/^OE\.\d+/)) {
    const clean = codigo.split(' ')[0];
    partidasAcus.add(clean);
    if (!detalleAcus[clean]) {
      detalleAcus[clean] = {
        nombre_partida: values[1] ? values[1].trim() : 'N/A',
        insumos_count: 0
      };
    }
    detalleAcus[clean].insumos_count++;
  }
}

console.log(`✅ Total partidas únicas en ACUS_P.csv: ${partidasAcus.size}`);

// 3. Comparación
console.log('\n' + '='.repeat(120));
console.log('\n3️⃣ COMPARACIÓN\n');

const enExcelNoEnAcus = Array.from(partidasExcel).filter(p => !partidasAcus.has(p));
const enAcusNoEnExcel = Array.from(partidasAcus).filter(p => !partidasExcel.has(p));
const enAmbos = Array.from(partidasExcel).filter(p => partidasAcus.has(p));

console.log(`📊 EXCEL: ${partidasExcel.size} partidas`);
console.log(`📊 ACUS: ${partidasAcus.size} partidas`);
console.log(`✅ EN AMBOS: ${enAmbos.length} partidas`);
console.log(`❌ EN EXCEL pero NO en ACUS: ${enExcelNoEnAcus.length} partidas`);
console.log(`⚠️ EN ACUS pero NO en EXCEL: ${enAcusNoEnExcel.length} partidas`);

if (enExcelNoEnAcus.length > 0) {
  console.log(`\n🔴 PARTIDAS FALTANTES EN ACUS_P.csv:\n`);
  enExcelNoEnAcus.slice(0, 20).forEach(p => {
    const detalle = detalleExcel[p];
    console.log(`   ${p}`);
    if (detalle) {
      console.log(`      └─ ${detalle.descripcion || 'Sin descripción'}`);
    }
  });
  if (enExcelNoEnAcus.length > 20) {
    console.log(`   ... y ${enExcelNoEnAcus.length - 20} más`);
  }
}

if (enAcusNoEnExcel.length > 0) {
  console.log(`\n🟡 PARTIDAS EN ACUS pero NO en EXCEL:\n`);
  enAcusNoEnExcel.slice(0, 10).forEach(p => {
    const detalle = detalleAcus[p];
    console.log(`   ${p}`);
    if (detalle) {
      console.log(`      ├─ ${detalle.nombre_partida}`);
      console.log(`      └─ Insumos: ${detalle.insumos_count}`);
    }
  });
  if (enAcusNoEnExcel.length > 10) {
    console.log(`   ... y ${enAcusNoEnExcel.length - 10} más`);
  }
}

// 4. Análisis de diferencias
console.log('\n' + '='.repeat(120));
console.log('\n4️⃣ ANÁLISIS DETALLADO\n');

const porcExcel = (enExcelNoEnAcus.length / partidasExcel.size * 100).toFixed(1);
console.log(`📉 Cobertura de ACUS: ${((enAmbos.length / partidasExcel.size) * 100).toFixed(1)}% del presupuesto`);
console.log(`📊 Partidas faltantes: ${porcExcel}% (${enExcelNoEnAcus.length}/${partidasExcel.size})`);

// Guardar resultado para análisis manual
const resultado = {
  timestamp: new Date().toISOString(),
  excel: {
    total: partidasExcel.size,
    partidas: Array.from(partidasExcel).sort()
  },
  acus: {
    total: partidasAcus.size,
    partidas: Array.from(partidasAcus).sort()
  },
  faltantes: {
    en_excel_no_en_acus: enExcelNoEnAcus.sort(),
    en_acus_no_en_excel: enAcusNoEnExcel.sort()
  }
};

fs.writeFileSync('comparacion_presupuesto_acus.json', JSON.stringify(resultado, null, 2));
console.log(`\n✅ Resultado guardado en: comparacion_presupuesto_acus.json`);

console.log('\n' + '='.repeat(120));
