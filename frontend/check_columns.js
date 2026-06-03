const XLSX = require('xlsx');
const path = require('path');

const baseDir = 'e:/00_OFI_PRESUPUESTOS_progra/7_Insumos_rado/datos_hospital';
const acuPath = path.join(baseDir, 'SALDOS A MOD. 06 - ACU 16.05 v.02.xlsx');
const acuWb = XLSX.readFile(acuPath);
const acuSheet = acuWb.Sheets[acuWb.SheetNames[0]];

console.log('Fila 18 (primer insumo de MANO DE OBRA en OE.1.1.1.01):\n');

const r = 17; // Fila 18 (index 17)
for (let c = 0; c < 25; c++) {
  const cell = acuSheet[XLSX.utils.encode_cell({ r, c })];
  const val = cell ? String(cell.v || '') : '';
  const col = String.fromCharCode(65 + c);
  if (val) {
    console.log(`Columna ${col} (${c}): "${val}"`);
  }
}

console.log('\n🔍 Buscando "Parcial" en los headers (fila 16):\n');
const r16 = 15; // Fila 16
for (let c = 0; c < 25; c++) {
  const cell = acuSheet[XLSX.utils.encode_cell({ r: r16, c })];
  const val = cell ? String(cell.v || '').trim() : '';
  const col = String.fromCharCode(65 + c);
  if (val.toLowerCase().includes('parcial') || val.toLowerCase().includes('precio') || val.toLowerCase().includes('cantidad')) {
    console.log(`Columna ${col} (${c}): "${val}"`);
  }
}
