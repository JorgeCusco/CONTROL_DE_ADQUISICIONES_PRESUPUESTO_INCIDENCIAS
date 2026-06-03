const fs = require('fs');
const XLSX = require('xlsx');

console.log('='.repeat(120));
console.log('🔍 IDENTIFICANDO FUENTE DE LAS 1,135 PARTIDAS');
console.log('='.repeat(120));

const archivos = [
  'DATA_LAST/PARTIDAS.csv',
  'DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_P.csv',
  'DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_TODAS.csv',
  'DATA_LAST/EXCEL_EXTRAIDOS/PRESUPUESTO_COMPLETO.csv',
  'DATA_LAST/NUEVA_BD/partidas.csv',
  'DATA_LAST/AA.partidas.csv',
  'DATA_LAST/APU Y PRESUPUESTO.xlsx',
  'DATA_LAST/BD_FINAL/partidas.csv',
  'DATA_LAST/BD_FINAL/partidas.xlsx'
];

const resultados = [];

archivos.forEach(archivo => {
  try {
    if (!fs.existsSync(archivo)) {
      resultados.push({ archivo, existe: false });
      return;
    }

    let registros = 0;

    if (archivo.endsWith('.csv')) {
      const content = fs.readFileSync(archivo, 'utf-8');
      registros = content.split('\n').filter(l => l.trim()).length - 1; // -1 por header
    } else if (archivo.endsWith('.xlsx')) {
      try {
        const wb = XLSX.readFile(archivo);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        registros = data.length;
      } catch (e) {
        registros = 0;
      }
    }

    if (registros > 0) {
      resultados.push({
        archivo,
        existe: true,
        registros,
        tamaño: (fs.statSync(archivo).size / 1024).toFixed(2) + ' KB'
      });
    }
  } catch (e) {
    // ignorar
  }
});

resultados.sort((a, b) => (b.registros || 0) - (a.registros || 0));

console.log('\n📂 ARCHIVOS DE PARTIDAS ENCONTRADOS:\n');

resultados.forEach((r, idx) => {
  if (r.existe) {
    const marca = r.registros === 1135 ? '🎯 PROBABLE' : r.registros > 700 ? '⚠️  POSIBLE' : '';
    console.log(`${idx + 1}. ${r.archivo}`);
    console.log(`   ├─ Registros: ${r.registros} ${marca}`);
    console.log(`   └─ Tamaño: ${r.tamaño}\n`);
  }
});

// Verificar el candidato más probable
const probable = resultados.find(r => r.registros === 1135);

if (probable) {
  console.log('='.repeat(120));
  console.log(`\n🎯 FUENTE PROBABLE: ${probable.archivo}\n`);

  let primerasLineas = [];

  if (probable.archivo.endsWith('.csv')) {
    const content = fs.readFileSync(probable.archivo, 'utf-8');
    primerasLineas = content.split('\n').slice(0, 11);
  } else {
    const wb = XLSX.readFile(probable.archivo);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    console.log('Primeras 5 registros:\n');
    data.slice(0, 5).forEach((row, idx) => {
      console.log(`${idx + 1}. ${JSON.stringify(row).substring(0, 100)}...`);
    });
  }

  if (primerasLineas.length > 0) {
    console.log('Primeras líneas del archivo:\n');
    primerasLineas.slice(0, 6).forEach((line, idx) => {
      console.log(`${idx + 1}. ${line.substring(0, 100)}`);
    });
  }
} else {
  console.log('\n❌ No se encontró archivo con exactamente 1,135 registros');
  console.log('\n⚠️  Archivos más cercanos:');
  resultados.filter(r => r.registros > 700 && r.registros < 1200).forEach(r => {
    console.log(`   ${r.archivo}: ${r.registros} registros`);
  });
}

console.log('\n' + '='.repeat(120) + '\n');
