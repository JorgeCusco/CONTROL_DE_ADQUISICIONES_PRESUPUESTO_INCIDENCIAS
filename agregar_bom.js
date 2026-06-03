const fs = require('fs');

const inputDir = 'DATA_LAST/TABLAS_FINAL_UTF8';
const outputDir = 'DATA_LAST/TABLAS_FINAL_BOM';

const files = ['ACUS.csv', 'PARTIDAS_TODAS.csv', 'INSUMOS.csv'];

files.forEach(file => {
  const content = fs.readFileSync(`${inputDir}/${file}`, 'utf8');
  const utf8bom = '﻿' + content;
  fs.writeFileSync(`${outputDir}/${file}`, utf8bom, 'utf8');
  console.log(`✓ ${file} generado con BOM UTF-8`);
});

console.log('\n✅ Archivos regenerados con BOM para Excel');
