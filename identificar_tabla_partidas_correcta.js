const fs = require('fs');
const { execSync } = require('child_process');

console.log('='.repeat(120));
console.log('🎯 IDENTIFICANDO TABLA DE PARTIDAS CORRECTA');
console.log('='.repeat(120));

const archivos = [
  'DATA_LAST/PARTIDAS.csv',
  'DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_P.csv',
  'DATA_LAST/TABLAS_FINAL_BOM/PARTIDAS_TODAS.csv',
  'DATA_LAST/AA.partidas.csv',
  'DATA_LAST/NUEVA_BD/partidas.csv',
  'DATA_LAST/BD_FINAL/partidas.csv',
];

const analisis = [];

archivos.forEach(archivo => {
  if (!fs.existsSync(archivo)) {
    return;
  }

  const content = fs.readFileSync(archivo, 'utf-8');
  const lineas = content.split('\n').filter(l => l.trim());
  const header = lineas[0];
  const registros = lineas.length - 1;

  // Extraer nombre de columnas
  const columnas = header.split(',');

  // Contar partidas únicas
  const partidasSet = new Set();
  for (let i = 1; i < lineas.length; i++) {
    const primerComa = lineas[i].indexOf(',');
    const partida = lineas[i].substring(0, primerComa).trim();
    if (partida) {
      partidasSet.add(partida);
    }
  }

  // Verificar que tenga columnas clave
  const tieneUnidad = header.includes('unidad');
  const tieneMetrado = header.includes('metrado');
  const tienePrecio = header.includes('precio');
  const tieneTotal = header.includes('total');

  analisis.push({
    archivo: archivo.replace(/DATA_LAST\//g, ''),
    registros,
    partidasUnicas: partidasSet.size,
    header: header.substring(0, 100),
    columnas: columnas.length,
    tieneUnidad,
    tieneMetrado,
    tienePrecio,
    tieneTotal,
    scores: (tieneUnidad ? 1 : 0) + (tieneMetrado ? 1 : 0) + (tienePrecio ? 1 : 0) + (tieneTotal ? 1 : 0)
  });
});

// Ordenar por score
analisis.sort((a, b) => {
  if (b.scores !== a.scores) return b.scores - a.scores;
  if (b.partidasUnicas !== a.partidasUnicas) return b.partidasUnicas - a.partidasUnicas;
  return 0;
});

console.log('\n📋 ANÁLISIS DE OPCIONES\n');

analisis.forEach((a, idx) => {
  console.log(`${idx + 1}. ${a.archivo}`);
  console.log(`   ├─ Registros: ${a.registros}`);
  console.log(`   ├─ Partidas únicas: ${a.partidasUnicas}`);
  console.log(`   ├─ Columnas: ${a.columnas}`);
  console.log(`   ├─ Tiene UNIDAD: ${a.tieneUnidad ? '✅' : '❌'}`);
  console.log(`   ├─ Tiene METRADO: ${a.tieneMetrado ? '✅' : '❌'}`);
  console.log(`   ├─ Tiene PRECIO: ${a.tienePrecio ? '✅' : '❌'}`);
  console.log(`   ├─ Tiene TOTAL: ${a.tieneTotal ? '✅' : '❌'}`);
  console.log(`   └─ Score: ${a.scores}/4\n`);
});

console.log('='.repeat(120));
console.log('\n🎯 RECOMENDACIÓN\n');

const mejor = analisis[0];

if (mejor.scores === 4 && mejor.partidasUnicas === 1135) {
  console.log(`✅ USA: ${mejor.archivo}`);
  console.log(`\n   Razones:`);
  console.log(`   ✅ Tiene las 1,135 partidas`);
  console.log(`   ✅ Tiene TODAS las columnas necesarias`);
  console.log(`   ✅ Es la fuente de verdad para tu BD`);
} else {
  console.log(`✅ MEJOR OPCIÓN: ${mejor.archivo}`);
  console.log(`\n   Por qué:`);
  console.log(`   ✅ ${mejor.partidasUnicas} partidas`);
  console.log(`   ✅ Score: ${mejor.scores}/4 (columnas completas)`);
}

// Mostrar preview del archivo recomendado
console.log(`\n${'-'.repeat(120)}`);
console.log(`\n📄 PREVIEW DEL ARCHIVO RECOMENDADO\n`);

const archivoRecomendado = mejor.archivo.includes('/')
  ? 'DATA_LAST/' + mejor.archivo
  : 'DATA_LAST/' + mejor.archivo;

if (fs.existsSync(archivoRecomendado)) {
  const content = fs.readFileSync(archivoRecomendado, 'utf-8');
  const lineas = content.split('\n').filter(l => l.trim());

  console.log('Header:');
  console.log(`${lineas[0]}\n`);

  console.log('Primeros 5 registros:\n');
  for (let i = 1; i <= Math.min(5, lineas.length - 1); i++) {
    console.log(`${i}. ${lineas[i]}`);
  }
}

console.log(`\n${'-'.repeat(120)}\n`);
