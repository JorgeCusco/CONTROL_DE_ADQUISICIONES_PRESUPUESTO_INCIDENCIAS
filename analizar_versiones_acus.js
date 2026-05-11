const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_LAST';

const archivosACU = [
  'TABLAS_FINAL_BOM\\ACUS.csv',
  'TABLAS_FINAL_BOM\\ACUS_P.csv',
  'TABLAS_FINAL\\ACUS.csv',
  'APU_TODOS_COMPLETO.csv',
  'APU_COMPLETO_FINAL.csv',
  'APU_PRESUPUESTO_FINAL.csv',
  'APU_PRESUPUESTO_LIMPIO.csv',
  'APUS_DETALLADO.csv',
  'EXCEL_EXTRAIDOS\\ACU_COMPLETO.csv',
  'NUEVA_BD\\apu.csv'
];

console.log('='.repeat(100));
console.log('📊 ANÁLISIS DE VERSIONES DE ACUs');
console.log('='.repeat(100));

const resultados = [];

archivosACU.forEach(archivo => {
  const ruta = path.join(basePath, archivo);

  if (fs.existsSync(ruta)) {
    try {
      const stats = fs.statSync(ruta);
      const contenido = fs.readFileSync(ruta, 'utf-8');
      const lineas = contenido.split('\n').filter(l => l.trim());
      const header = lineas[0];
      const columnas = header.split(',').length;

      resultados.push({
        archivo: archivo.replace(/\\/g, '/'),
        existe: true,
        tamaño: (stats.size / 1024).toFixed(2) + ' KB',
        registros: lineas.length - 1,
        columnas: columnas,
        header: header.substring(0, 80) + '...',
        modificado: stats.mtime.toISOString().split('T')[0]
      });
    } catch (e) {
      resultados.push({
        archivo: archivo.replace(/\\/g, '/'),
        existe: true,
        error: e.message
      });
    }
  } else {
    resultados.push({
      archivo: archivo.replace(/\\/g, '/'),
      existe: false
    });
  }
});

console.log('\n📁 ARCHIVOS ACU ENCONTRADOS:\n');

resultados.forEach((r, idx) => {
  if (r.existe && !r.error) {
    console.log(`${idx + 1}. ${r.archivo}`);
    console.log(`   ├─ Tamaño: ${r.tamaño}`);
    console.log(`   ├─ Registros: ${r.registros}`);
    console.log(`   ├─ Columnas: ${r.columnas}`);
    console.log(`   ├─ Modificado: ${r.modificado}`);
    console.log(`   └─ Header: ${r.header}\n`);
  }
});

// Comparar contenidos
console.log('\n' + '='.repeat(100));
console.log('🔍 COMPARACIÓN DE CONTENIDOS');
console.log('='.repeat(100));

const comparadas = [
  ['TABLAS_FINAL_BOM\\ACUS.csv', 'TABLAS_FINAL_BOM\\ACUS_P.csv'],
  ['TABLAS_FINAL_BOM\\ACUS_P.csv', 'APUS_DETALLADO.csv'],
  ['TABLAS_FINAL_BOM\\ACUS.csv', 'EXCEL_EXTRAIDOS\\ACU_COMPLETO.csv'],
];

comparadas.forEach(([arch1, arch2]) => {
  const ruta1 = path.join(basePath, arch1);
  const ruta2 = path.join(basePath, arch2);

  if (fs.existsSync(ruta1) && fs.existsSync(ruta2)) {
    const stats1 = fs.statSync(ruta1);
    const stats2 = fs.statSync(ruta2);
    const content1 = fs.readFileSync(ruta1, 'utf-8');
    const content2 = fs.readFileSync(ruta2, 'utf-8');
    const igual = content1 === content2;

    console.log(`\n${arch1.split('\\').pop()} vs ${arch2.split('\\').pop()}`);
    console.log(`├─ ¿Iguales? ${igual ? '✅ SÍ' : '❌ NO'}`);
    console.log(`├─ Tamaño: ${(stats1.size / 1024).toFixed(0)} KB vs ${(stats2.size / 1024).toFixed(0)} KB`);
    console.log(`└─ Filas: ${content1.split('\n').length} vs ${content2.split('\n').length}`);
  }
});

// Resumen final
console.log('\n' + '='.repeat(100));
console.log('✅ RESUMEN FINAL');
console.log('='.repeat(100));

const finalBOM = resultados.find(r => r.archivo === 'TABLAS_FINAL_BOM/ACUS_P.csv');
const finalSQL = 'DATA_LAST/SQL/03_INSERT_apu.sql';

console.log(`\n🎯 BASE DE DATOS FINAL RECOMENDADA:`);
console.log(`\n   ARCHIVO: TABLAS_FINAL_BOM/ACUS_P.csv`);
if (finalBOM) {
  console.log(`   ├─ Registros: ${finalBOM.registros}`);
  console.log(`   ├─ Columnas: ${finalBOM.columnas}`);
  console.log(`   ├─ Tamaño: ${finalBOM.tamaño}`);
  console.log(`   └─ Última actualización: ${finalBOM.modificado}`);
}

console.log(`\n   SQL CORRESPONDIENTE: DATA_LAST/SQL/03_INSERT_apu.sql`);

if (fs.existsSync(path.join(basePath, 'TABLAS_FINAL_BOM', 'README.md'))) {
  console.log(`\n   📖 Ver: TABLAS_FINAL_BOM/README.md para documentación completa`);
}

console.log('\n' + '='.repeat(100) + '\n');
