require('dotenv').config();
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function generarInforme() {
  const client = await pool.connect();
  try {
    console.log('📋 Generando informe de desajustes...\n');

    // Leer LISTA_INSUMOS.xls
    const filePath = path.join(process.env.PWD || '.', 'LISTA_INSUMOS.xls');
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dataXLS = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const listaInsumos = {};
    for (let i = 1; i < dataXLS.length; i++) {
      const row = dataXLS[i];
      if (!row[0]) continue;

      const codigo = String(row[0]).trim();
      const descripcion = String(row[1] || '').trim().toUpperCase();
      const unidad = String(row[2] || '').trim();
      const cantidad = row[3] ? parseFloat(row[3]) : 0;
      const costo = row[4] ? parseFloat(row[4]) : 0;
      const total = row[5] ? parseFloat(row[5]) : 0;

      if (codigo && descripcion) {
        listaInsumos[descripcion.substring(0, 100)] = {
          codigo,
          descripcion,
          unidad,
          cantidad,
          costo,
          total
        };
      }
    }

    // Obtener insumos de apus_detallado
    const apusInsumos = await client.query(`
      SELECT DISTINCT
        UPPER(SUBSTRING("Insumo_Descripcion", 1, 100)) as desc_norm,
        "Insumo_Descripcion" as desc_original,
        "Insumo_Codigo",
        "Insumo_Unidad",
        COUNT(DISTINCT "Partida_Codigo") as partidas_count,
        STRING_AGG(DISTINCT "Partida_Codigo", ', ') as partidas_list,
        SUM("Insumo_Cantidad") as total_cantidad
      FROM apus_detallado
      WHERE "Insumo_Descripcion" IS NOT NULL AND "Insumo_Descripcion" != ''
      GROUP BY UPPER(SUBSTRING("Insumo_Descripcion", 1, 100)), "Insumo_Descripcion", "Insumo_Codigo", "Insumo_Unidad"
      ORDER BY desc_original
    `);

    // Preparar datos para Excel
    const sinAPU = [];
    const soloEnAPU = [];

    // 1. Insumos de LISTA que NO están en APU
    for (const [descNorm, data] of Object.entries(listaInsumos)) {
      const encontrado = apusInsumos.rows.find(row => row.desc_norm === descNorm);
      if (!encontrado) {
        sinAPU.push({
          'Código': data.codigo,
          'Descripción LISTA': data.descripcion,
          'Unidad LISTA': data.unidad,
          'Cantidad LISTA': data.cantidad,
          'Costo Unit.': data.costo,
          'Total': data.total,
          'Status': 'NO TIENE APU'
        });
      }
    }

    // 2. Insumos en APU que NO están en LISTA
    for (const apuRow of apusInsumos.rows) {
      if (!listaInsumos[apuRow.desc_norm]) {
        soloEnAPU.push({
          'Código APU': apuRow.Insumo_Codigo,
          'Descripción APU': apuRow.desc_original,
          'Unidad APU': apuRow.Insumo_Unidad,
          'Partidas': apuRow.partidas_count,
          'Lista Partidas': apuRow.partidas_list,
          'Cantidad Total': parseFloat(apuRow.total_cantidad).toFixed(4),
          'Status': 'SOLO EN APU'
        });
      }
    }

    // Crear workbook con múltiples sheets
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumen
    const resumen = [
      ['RESUMEN DE COBERTURA'],
      [],
      ['LISTA_INSUMOS total', Object.keys(listaInsumos).length],
      ['apus_detallado total', apusInsumos.rowCount],
      ['Con cobertura (en ambos)', Object.keys(listaInsumos).length - sinAPU.length],
      ['Sin APU (LISTA pero no APU)', sinAPU.length],
      ['Solo en APU (APU pero no LISTA)', soloEnAPU.length],
      ['Porcentaje cobertura', `${(((Object.keys(listaInsumos).length - sinAPU.length) / Object.keys(listaInsumos).length) * 100).toFixed(1)}%`]
    ];
    const wsResumen = XLSX.utils.aoa_to_sheet(resumen);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    // Sheet 2: Sin APU
    if (sinAPU.length > 0) {
      const wsSinAPU = XLSX.utils.json_to_sheet(sinAPU);
      wsSinAPU['!cols'] = [
        { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, wsSinAPU, 'Sin APU (254)');
    }

    // Sheet 3: Solo en APU
    if (soloEnAPU.length > 0) {
      const wsSoloAPU = XLSX.utils.json_to_sheet(soloEnAPU);
      wsSoloAPU['!cols'] = [
        { wch: 12 }, { wch: 50 }, { wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(wb, wsSoloAPU, 'Solo en APU (262)');
    }

    // Guardar
    const outputPath = 'Informe_Desajustes_Insumos.xlsx';
    XLSX.writeFile(wb, outputPath);
    console.log(`✅ Informe generado: ${outputPath}\n`);
    console.log(`📊 Contenido:`);
    console.log(`  • Sheet 1: Resumen general`);
    console.log(`  • Sheet 2: ${sinAPU.length} insumos SIN APU`);
    console.log(`  • Sheet 3: ${soloEnAPU.length} insumos SOLO EN APU\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

generarInforme();
