const fs = require('fs');
const path = require('path');

console.log('✅ RENOMBRAR CSVs DEL PRESUPUESTO CON SUFIJO _P\n');
console.log('═'.repeat(200));

const sourceDir = 'DATA_LAST/TABLAS_FINAL_BOM';

const archivos = [
  { original: 'ACUS.csv', nuevo: 'ACUS_P.csv' },
  { original: 'PARTIDAS_TODAS.csv', nuevo: 'PARTIDAS_P.csv' },
  { original: 'INSUMOS.csv', nuevo: 'INSUMOS_P.csv' }
];

console.log('\n📋 COPIANDO ARCHIVOS CON SUFIJO _P\n');

let copiados = 0;

archivos.forEach(({ original, nuevo }) => {
  const sourcePath = path.join(sourceDir, original);
  const destPath = path.join(sourceDir, nuevo);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    const stats = fs.statSync(destPath);
    const lineas = fs.readFileSync(destPath, 'utf8').split('\n').length - 1;
    console.log(`  ✓ ${original} → ${nuevo}`);
    console.log(`    Tamaño: ${(stats.size / 1024).toFixed(2)} KB | Filas: ${lineas}`);
    copiados++;
  } else {
    console.log(`  ✗ ${original} NO ENCONTRADO`);
  }
});

console.log(`\n  Total copiados: ${copiados}/${archivos.length}\n`);

// Listar archivos finales en la carpeta
console.log('═'.repeat(200));
console.log('\n📁 ARCHIVOS EN DATA_LAST/TABLAS_FINAL_BOM/ (finales)\n');

const archivosFinales = fs.readdirSync(sourceDir).filter(f => f.endsWith('.csv'));

archivosFinales.forEach(archivo => {
  const filePath = path.join(sourceDir, archivo);
  const stats = fs.statSync(filePath);
  const lineas = fs.readFileSync(filePath, 'utf8').split('\n').length - 1;
  const tipo = archivo.includes('_P') ? '[PRESUPUESTO]' : archivo.includes('_C') ? '[COMPRAS]' : '[SIN SUFIJO]';

  console.log(`  ${archivo.padEnd(30)} ${tipo.padEnd(20)} ${lineas.toString().padStart(6)} filas  ${(stats.size / 1024).toFixed(2).padStart(8)} KB`);
});

console.log('\n═'.repeat(200));
console.log('\n✅ RENOMBRADO COMPLETADO\n');
console.log(`📊 Total archivos CSV: ${archivosFinales.length}\n`);
