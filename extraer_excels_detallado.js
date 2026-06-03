const XLSX = require('xlsx');
const path = require('path');

console.log('🔍 EXTRACCIÓN DETALLADA DE EXCELS\n');
console.log('═'.repeat(200));

const lastDir = 'DATA_LAST/ULTIMO';
const files = [
  { name: 'ACU.xlsx', path: `${lastDir}/ACU.xlsx` },
  { name: 'INSUMOS.xlsx', path: `${lastDir}/INSUMOS.xlsx` },
  { name: 'PRESUPUESTO.xlsx', path: `${lastDir}/PRESUPUESTO.xlsx` }
];

files.forEach(file => {
  console.log(`\n📊 ARCHIVO: ${file.name}`);
  console.log('─'.repeat(200));

  try {
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');

    console.log(`\nHOJA: [${sheetName}]`);
    console.log(`Dimensiones totales: ${range.e.r + 1} filas × ${range.e.c + 1} columnas\n`);

    // Leer TODA la hoja como arreglo de arreglos para ver la estructura cruda
    console.log('📍 ESTRUCTURA CRUDA (primeras 15 filas):\n');

    for (let r = 0; r < Math.min(15, range.e.r + 1); r++) {
      let rowStr = `Fila ${(r + 1).toString().padStart(3)}: `;
      let cellValues = [];

      for (let c = 0; c <= Math.min(17, range.e.c); c++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        const cell = sheet[cellAddr];
        const val = cell ? String(cell.v || '').substring(0, 40) : '';
        cellValues.push(val || '-');
      }

      console.log(rowStr + cellValues.join(' | '));
    }

    // Detectar dónde empiezan los datos reales
    console.log(`\n\n🔎 BÚSQUEDA DE FILA DE ENCABEZADOS:\n`);

    let headerRow = -1;
    let headerKeys = [];

    for (let r = 0; r <= range.e.r; r++) {
      let cellCount = 0;
      let hasKeywords = false;
      let cells = [];

      for (let c = 0; c <= Math.min(17, range.e.c); c++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        const cell = sheet[cellAddr];
        const val = cell ? String(cell.v || '').trim() : '';

        if (val) {
          cellCount++;
          cells.push({ col: c, val: val });

          // Buscar palabras clave que indiquen encabezado
          const keywords = ['Código', 'Descripción', 'Item', 'Unidad', 'Cantidad', 'Costo', 'Precio', 'Total', 'Unid', 'Cant'];
          if (keywords.some(kw => val.includes(kw))) {
            hasKeywords = true;
          }
        }
      }

      if (cellCount >= 3 && hasKeywords) {
        headerRow = r;
        headerKeys = cells.map(c => ({ col: c.col, name: c.val }));
        console.log(`  ✓ Encontrada en fila ${r + 1}: ${cells.map(c => c.val).join(' | ')}`);
        break;
      }
    }

    if (headerRow > -1) {
      console.log(`\n✅ Fila de encabezados: ${headerRow + 1}`);
      console.log(`📊 Columnas identificadas (${headerKeys.length}):\n`);

      headerKeys.forEach((h, idx) => {
        console.log(`   ${idx + 1}. [Col ${String.fromCharCode(65 + h.col)}] ${h.name}`);
      });

      // Mostrar primeros registros después del header
      console.log(`\n\n📋 PRIMEROS 5 REGISTROS DE DATOS:\n`);

      for (let r = headerRow + 1; r < Math.min(headerRow + 6, range.e.r + 1); r++) {
        console.log(`   Registro ${r - headerRow}:`);

        headerKeys.forEach(h => {
          const cellAddr = XLSX.utils.encode_cell({ r: r, c: h.col });
          const cell = sheet[cellAddr];
          const val = cell ? String(cell.v || '') : '';
          if (val) {
            console.log(`     ${h.name}: ${val.substring(0, 80)}`);
          }
        });
        console.log();
      }

      // Contar registros válidos (sin vacíos)
      let validRecords = 0;
      for (let r = headerRow + 1; r <= range.e.r; r++) {
        let hasData = false;
        for (let c = 0; c <= range.e.c; c++) {
          const cellAddr = XLSX.utils.encode_cell({ r, c });
          const cell = sheet[cellAddr];
          if (cell && cell.v) {
            hasData = true;
            break;
          }
        }
        if (hasData) validRecords++;
      }

      console.log(`\n📊 ESTADÍSTICAS:`);
      console.log(`  Fila de encabezados: ${headerRow + 1}`);
      console.log(`  Registros válidos (con datos): ${validRecords}`);
      console.log(`  Rango de filas: ${headerRow + 2} a ${range.e.r + 1}`);
      console.log(`  Rango de columnas: A a ${String.fromCharCode(65 + Math.min(17, range.e.c))}`);
    } else {
      console.log(`  ❌ No se encontró encabezado claro\n`);
    }

  } catch (err) {
    console.error(`  ❌ ERROR: ${err.message}`);
  }

  console.log('\n' + '═'.repeat(200));
});

console.log('\n✅ ANÁLISIS COMPLETADO\n');
