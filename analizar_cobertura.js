require('dotenv').config();
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function analizar() {
  const client = await pool.connect();
  try {
    console.log('📊 ANÁLISIS DE COBERTURA INSUMOS\n');
    console.log('═'.repeat(70));

    // Leer LISTA_INSUMOS.xls
    console.log('\n📖 Leyendo LISTA_INSUMOS.xls...');
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

      if (codigo && descripcion) {
        listaInsumos[descripcion.substring(0, 100)] = {
          codigo,
          descripcion
        };
      }
    }

    console.log(`✓ ${Object.keys(listaInsumos).length} insumos en LISTA_INSUMOS\n`);

    // Obtener insumos únicos de apus_detallado
    console.log('📖 Leyendo insumos de apus_detallado...');
    const apusInsumos = await client.query(`
      SELECT DISTINCT
        UPPER(SUBSTRING("Insumo_Descripcion", 1, 100)) as desc_norm,
        "Insumo_Descripcion" as desc_original,
        "Insumo_Codigo",
        COUNT(DISTINCT "Partida_Codigo") as partidas_count
      FROM apus_detallado
      WHERE "Insumo_Descripcion" IS NOT NULL AND "Insumo_Descripcion" != ''
      GROUP BY UPPER(SUBSTRING("Insumo_Descripcion", 1, 100)), "Insumo_Descripcion", "Insumo_Codigo"
      ORDER BY desc_original
    `);

    console.log(`✓ ${apusInsumos.rowCount} insumos únicos en apus_detallado\n`);

    // Comparar
    const conAPU = [];
    const sinAPU = [];
    const enAPUnoEnLista = [];

    // 1. Insumos de LISTA que están en APU
    for (const [descNorm, data] of Object.entries(listaInsumos)) {
      const encontrado = apusInsumos.rows.find(row => row.desc_norm === descNorm);
      if (encontrado) {
        conAPU.push({
          codigo: data.codigo,
          descripcion: data.descripcion,
          apuPartidas: encontrado.partidas_count,
          apuDescripcion: encontrado.desc_original
        });
      } else {
        sinAPU.push({
          codigo: data.codigo,
          descripcion: data.descripcion
        });
      }
    }

    // 2. Insumos en APU que NO están en LISTA
    for (const apuRow of apusInsumos.rows) {
      if (!listaInsumos[apuRow.desc_norm]) {
        enAPUnoEnLista.push({
          descripcion: apuRow.desc_original,
          codigo: apuRow.Insumo_Codigo,
          partidas: apuRow.partidas_count
        });
      }
    }

    // Reporte
    console.log('═'.repeat(70));
    console.log('\n✅ INSUMOS CON COBERTURA (en LISTA y en APU)');
    console.log(`Total: ${conAPU.length}/${Object.keys(listaInsumos).length}`);
    console.log(`Porcentaje: ${((conAPU.length / Object.keys(listaInsumos).length) * 100).toFixed(1)}%\n`);

    if (sinAPU.length > 0) {
      console.log('═'.repeat(70));
      console.log(`\n⚠️  INSUMOS SIN APU (en LISTA pero NO en apus_detallado)`);
      console.log(`Total: ${sinAPU.length}\n`);
      sinAPU.slice(0, 10).forEach(item => {
        console.log(`  • [${item.codigo}] ${item.descripcion.substring(0, 60)}`);
      });
      if (sinAPU.length > 10) console.log(`  ... y ${sinAPU.length - 10} más`);
    }

    if (enAPUnoEnLista.length > 0) {
      console.log('\n═'.repeat(70));
      console.log(`\n🔍 INSUMOS SOLO EN APU (en apus_detallado pero NO en LISTA)`);
      console.log(`Total: ${enAPUnoEnLista.length}\n`);
      enAPUnoEnLista.slice(0, 10).forEach(item => {
        console.log(`  • [${item.codigo}] ${item.descripcion.substring(0, 60)} (${item.partidas} partidas)`);
      });
      if (enAPUnoEnLista.length > 10) console.log(`  ... y ${enAPUnoEnLista.length - 10} más`);
    }

    console.log('\n═'.repeat(70));
    console.log('\n📈 RESUMEN:');
    console.log(`  LISTA_INSUMOS total:        ${Object.keys(listaInsumos).length}`);
    console.log(`  apus_detallado total:       ${apusInsumos.rowCount}`);
    console.log(`  Con cobertura (ambos):      ${conAPU.length}`);
    console.log(`  Solo en LISTA (sin APU):    ${sinAPU.length}`);
    console.log(`  Solo en APU (no en LISTA):  ${enAPUnoEnLista.length}`);
    console.log(`  Cobertura:                  ${((conAPU.length / Object.keys(listaInsumos).length) * 100).toFixed(1)}%\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

analizar();
