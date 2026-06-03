const XLSX = require('xlsx');
const path = require('path');

const baseDir = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital';

// Extraer partidas del ACU
const acuPath = path.join(baseDir, 'SALDOS A MOD. 06 - ACU 16.05 v.02.xlsx');
const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];
const acuRange = XLSX.utils.decode_range(acuSheet['!ref'] || 'A1');

const partidasACU = new Set();

for (let r = 0; r <= acuRange.e.r; r++) {
  const cellA = acuSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const valA = cellA ? String(cellA.v || '').trim() : '';
  if (valA.startsWith('Partida:')) {
    const match = valA.match(/Partida:\s*(.+)/);
    if (match) {
      partidasACU.add(match[1].trim());
    }
  }
}

console.log(`Partidas encontradas en ACU: ${partidasACU.size}`);
console.log('Primeras 10:', Array.from(partidasACU).slice(0, 10));

// Extraer partidas del PRESUPUESTO
const presPath = path.join(baseDir, 'SALDOS A MOD. 06 - PRESUPUESTO 16.05 v.02.xlsx');
const presWb = XLSX.readFile(presPath);
const presSheet = presWb.Sheets[presWb.SheetNames[0]];
const presRange = XLSX.utils.decode_range(presSheet['!ref'] || 'A1');

const partidasPRES = new Set();
const detalles = [];

for (let r = 0; r <= presRange.e.r; r++) {
  const cellA = presSheet[XLSX.utils.encode_cell({ r, c: 0 })];
  const cellB = presSheet[XLSX.utils.encode_cell({ r, c: 1 })];
  const cellK = presSheet[XLSX.utils.encode_cell({ r, c: 10 })];
  const cellM = presSheet[XLSX.utils.encode_cell({ r, c: 12 })];

  const valA = cellA ? String(cellA.v || '').trim() : '';
  const valB = cellB ? String(cellB.v || '').trim() : '';
  const valK = cellK ? String(cellK.v || '').trim() : '';
  const valM = cellM ? (cellM.v || '') : '';

  if (/^OE\.\d+(\.\d+)+$/.test(valA)) {
    partidasPRES.add(valA);
    detalles.push({ partida: valA, nombre: valB, unidad: valK, metrado: valM });
  }
}

console.log(`\nPartidas encontradas en PRESUPUESTO: ${partidasPRES.size}`);
console.log('Primeras 10:', Array.from(partidasPRES).slice(0, 10));

// Comparar
const coincidentes = Array.from(partidasACU).filter(p => partidasPRES.has(p));
console.log(`\n✅ Partidas COINCIDENTES: ${coincidentes.length}`);
console.log('Ejemplos:', coincidentes.slice(0, 5));

// No coincidentes
const soloACU = Array.from(partidasACU).filter(p => !partidasPRES.has(p));
const soloPRES = Array.from(partidasPRES).filter(p => !partidasACU.has(p));

console.log(`\n❌ Solo en ACU: ${soloACU.length}`);
console.log('Ejemplos:', soloACU.slice(0, 5));

console.log(`\n❌ Solo en PRESUPUESTO: ${soloPRES.length}`);
console.log('Ejemplos:', soloPRES.slice(0, 5));

// Mostrar detalles de primeras partidas del presupuesto
console.log('\n📋 Detalles de primeras 5 partidas del PRESUPUESTO:');
detalles.slice(0, 5).forEach(d => {
  const enACU = partidasACU.has(d.partida) ? '✅' : '❌';
  console.log(`${enACU} ${d.partida} - ${d.nombre} - ${d.metrado} ${d.unidad}`);
});
