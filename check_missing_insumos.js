const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^["']|["']$/g, ''));

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

console.log('📂 Analizando datos...\n');

const apusRows = parseCSV(path.join(__dirname, 'APUS_Extraidos_v2.csv'));
const libro4Rows = parseCSV(path.join(__dirname, 'Libro4.csv'));

// Get insumos from APUS
const apusInsumos = new Set();
apusRows.forEach(row => {
  const codigo = row.Insumo_Codigo || '';
  if (codigo) apusInsumos.add(codigo);
});

console.log(`Total de insumos en APUS_Extraidos_v2.csv: ${apusInsumos.size}`);
console.log(`Total de insumos en Libro4.csv: ${libro4Rows.length}\n`);

// Find missing insumos
console.log('📋 INSUMOS SIN PARTIDAS (No se insertaron):\n');
let missingCount = 0;
libro4Rows.forEach(row => {
  const codigo = row.codigo_insumo || '';
  const descripcion = row.descripcion || '';

  if (!apusInsumos.has(codigo)) {
    console.log(`${codigo} - ${descripcion}`);
    console.log(`   Incidencia Total: ${row.incidencia_original}`);
    console.log(`   Parcial Total: ${row.parcial_original}\n`);
    missingCount++;
  }
});

if (missingCount === 0) {
  console.log('✅ Todos los insumos se insertaron correctamente');
} else {
  console.log(`❌ ${missingCount} insumos faltaron de insertar`);
}
