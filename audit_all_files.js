const XLSX = require('xlsx');
const fs = require('fs');

console.log('🔎 AUDITORÍA COMPLETA DE ARCHIVOS\n');
console.log('═'.repeat(130));

// 1. APUS_Extraidos_v2.xlsx
if (fs.existsSync('APUS_Extraidos_v2.xlsx')) {
  console.log('\n📊 APUS_Extraidos_v2.xlsx\n');
  const book = XLSX.readFile('APUS_Extraidos_v2.xlsx');

  book.SheetNames.forEach((sheetName, idx) => {
    const sheet = book.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  Hoja ${idx + 1}: "${sheetName}"`);
    console.log(`    Registros: ${data.length}`);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log(`    Columnas: ${headers.slice(0, 8).join(', ')}...`);

      // Buscar columnas clave
      const incidenciaCol = headers.find(h => h.toLowerCase().includes('incidencia'));
      const parcialCol = headers.find(h => h.toLowerCase().includes('parcial'));
      const rendimientoCol = headers.find(h => h.toLowerCase().includes('rendimiento'));

      if (incidenciaCol) console.log(`    ✅ Tiene incidencia_original: ${incidenciaCol}`);
      if (parcialCol) console.log(`    ✅ Tiene parcial: ${parcialCol}`);
      if (rendimientoCol) console.log(`    ✅ Tiene rendimiento: ${rendimientoCol}`);
    }
    console.log();
  });
}

// 2. INSUMOS_completar.xlsx
if (fs.existsSync('INSUMOS_completar.xlsx')) {
  console.log('\n📊 INSUMOS_completar.xlsx\n');
  const book = XLSX.readFile('INSUMOS_completar.xlsx');

  book.SheetNames.forEach((sheetName, idx) => {
    const sheet = book.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  Hoja ${idx + 1}: "${sheetName}"`);
    console.log(`    Registros: ${data.length}`);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log(`    Columnas: ${headers.join(', ')}`);

      // Mostrar primer registro
      console.log(`    Ejemplo primer registro:`);
      Object.entries(data[0]).forEach(([key, value]) => {
        if (value) console.log(`      ${key}: ${value}`);
      });
    }
    console.log();
  });
}

// 3. PROGRAMA.xlsx
if (fs.existsSync('PROGRAMA.xlsx')) {
  console.log('\n📊 PROGRAMA.xlsx\n');
  const book = XLSX.readFile('PROGRAMA.xlsx');

  book.SheetNames.forEach((sheetName, idx) => {
    const sheet = book.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  Hoja ${idx + 1}: "${sheetName}"`);
    console.log(`    Registros: ${data.length}`);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log(`    Columnas: ${headers.join(', ')}`);

      // Buscar metrado
      const metradoCol = headers.find(h => h.toLowerCase().includes('metrado'));
      if (metradoCol) console.log(`    ✅ Tiene metrado: ${metradoCol}`);
    }
    console.log();
  });
}

// 4. NUEVA_DATA.xlsx
if (fs.existsSync('NUEVA_DATA.xlsx')) {
  console.log('\n📊 NUEVA_DATA.xlsx\n');
  const book = XLSX.readFile('NUEVA_DATA.xlsx');

  book.SheetNames.forEach((sheetName, idx) => {
    const sheet = book.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`  Hoja ${idx + 1}: "${sheetName}"`);
    console.log(`    Registros: ${data.length}`);
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      console.log(`    Columnas: ${headers.slice(0, 10).join(', ')}...`);
    }
    console.log();
  });
}

console.log('\n' + '═'.repeat(130));
console.log('\n💡 RESUMEN: Dónde están tus datos:\n');
console.log('  ✅ APUs (incidencia_original): APUS_Extraidos_v2.xlsx');
console.log('  ✅ Metrado Fijo: PROGRAMA.xlsx o NUEVA_DATA.xlsx');
console.log('  ✅ Insumos: INSUMOS_completar.xlsx');
console.log('  ❌ Metrado Fijo en BD Supabase: = 0 (NO CARGADO)');
console.log('  ❌ Incidencia Original en BD Supabase: = 0 (NO CARGADO)\n');
