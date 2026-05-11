const XLSX = require('xlsx');

const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';

console.log('='.repeat(120));
console.log('🔍 INSPECCIÓN DETALLADA DE PRESUPUESTO.xlsx');
console.log('='.repeat(120));

const workbook = XLSX.readFile(presupuestoPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Obtener rango
console.log(`\nRango de datos: ${sheet['!ref']}\n`);

// Obtener primeras 50 filas en formato raw
const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Total de registros leídos: ${data.length}\n`);
console.log('Primeros 20 registros:\n');

data.slice(0, 20).forEach((row, idx) => {
  console.log(`\nFila ${idx + 1}:`);
  const keys = Object.keys(row);
  keys.slice(0, 10).forEach(key => {
    const val = String(row[key]).substring(0, 60);
    if (val && val !== 'undefined' && val.trim()) {
      console.log(`  ${key}: ${val}`);
    }
  });
});

// Buscar patrón OE en toda la estructura
console.log('\n' + '='.repeat(120));
console.log('\n🔎 BUSCANDO CÓDIGOS OE.X.X.X.X EN DATOS...\n');

let codigosEncontrados = [];
let patronesObservados = [];

data.forEach(row => {
  Object.entries(row).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      const matches = value.match(/OE\.\d+\.[\d\.]+/g);
      if (matches) {
        matches.forEach(codigo => {
          if (!codigosEncontrados.includes(codigo)) {
            codigosEncontrados.push(codigo);
            patronesObservados.push({
              codigo,
              columna: key,
              ejemplo: value.substring(0, 50)
            });
          }
        });
      }
    }
  });
});

if (codigosEncontrados.length > 0) {
  console.log(`✅ Encontrados ${codigosEncontrados.length} códigos OE únicos\n`);
  codigosEncontrados.slice(0, 15).forEach(c => console.log(`   ${c}`));
  if (codigosEncontrados.length > 15) {
    console.log(`   ... y ${codigosEncontrados.length - 15} más`);
  }
} else {
  console.log(`❌ No se encontraron códigos OE en los datos\n`);
  console.log('Mostrando todas las columnas del archivo:\n');
  if (data.length > 0) {
    const allKeys = new Set();
    data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
    Array.from(allKeys).forEach(k => {
      const values = data
        .map(r => r[k])
        .filter(v => v && v !== 'undefined' && String(v).trim())
        .slice(0, 3);
      if (values.length > 0) {
        console.log(`\n📄 ${k}:`);
        values.forEach((v, i) => {
          console.log(`   [${i + 1}] ${String(v).substring(0, 70)}`);
        });
      }
    });
  }
}

// Mostrar estadísticas
console.log('\n' + '='.repeat(120));
console.log('\n📊 ESTADÍSTICAS DEL ARCHIVO\n');
console.log(`Total hojas: ${workbook.SheetNames.length}`);
console.log(`Hojas: ${workbook.SheetNames.join(', ')}`);
console.log(`Registros en hoja principal: ${data.length}`);
console.log(`Columnas totales: ${Object.keys(data[0] || {}).length}`);

// Buscar información útil en la estructura
console.log(`\n🔍 PRIMERAS COLUMNAS CON DATOS:\n`);
if (data.length > 0) {
  const firstRow = data[0];
  Object.entries(firstRow)
    .filter(([k, v]) => v && String(v).trim())
    .slice(0, 8)
    .forEach(([k, v]) => {
      console.log(`${k}: ${String(v).substring(0, 50)}`);
    });
}

console.log('\n' + '='.repeat(120) + '\n');
