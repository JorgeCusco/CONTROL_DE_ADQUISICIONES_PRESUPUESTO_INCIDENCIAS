const XLSX = require('xlsx');
const fs = require('fs');
const { Pool } = require('pg');

console.log('='.repeat(120));
console.log('📊 COMPARACIÓN: BD ACTUAL vs PRESUPUESTO.xlsx');
console.log('='.repeat(120));

// 1. Contar partidas en BD
console.log('\n1️⃣ PARTIDAS EN BASE DE DATOS ACTUAL\n');

const pool = new Pool({
  host: 'localhost',
  database: '7_insumos_rado',
  user: 'postgres',
  password: 'Jo.9839514500',
  port: 5432
});

pool.connect()
  .then(async client => {
    try {
      // Consulta 1: Total de partidas
      const result1 = await client.query('SELECT COUNT(*) as total FROM partidas');
      const totalPartidas = result1.rows[0].total;
      console.log(`   Total partidas en tabla: ${totalPartidas}`);

      // Consulta 2: Partidas con metrado_fijo
      const result2 = await client.query(
        'SELECT COUNT(*) as total FROM partidas WHERE metrado_fijo IS NOT NULL AND metrado_fijo > 0'
      );
      const conMetrado = result2.rows[0].total;
      console.log(`   ✅ Con metrado_fijo > 0: ${conMetrado}`);

      // Consulta 3: Muestra de partidas
      const result3 = await client.query(
        'SELECT codigo, descripcion, metrado_fijo FROM partidas LIMIT 10'
      );
      console.log(`\n   Ejemplos de partidas en BD:`);
      result3.rows.forEach((row, idx) => {
        console.log(`      ${idx + 1}. ${row.codigo} | ${row.descripcion.substring(0, 50)} | metrado: ${row.metrado_fijo}`);
      });

      client.release();

      // 2. Analizar PRESUPUESTO.xlsx más detalladamente
      console.log('\n' + '='.repeat(120));
      console.log('\n2️⃣ ANÁLISIS DETALLADO DE PRESUPUESTO.xlsx\n');

      const presupuestoPath = 'e:\\00_OFI_PRESUPUESTOS_progra\\7_Insumos_rado\\DATA_ULTIMO_ULTIMO\\REFERENCIA\\PRESUPUESTO.xlsx';
      const workbook = XLSX.readFile(presupuestoPath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const range = XLSX.utils.decode_range(sheet['!ref']);

      let contadores = {
        total_filas: 0,
        con_codigo_oe: 0,
        partidas_nivel4: 0,
        con_unidad_col_m: 0,
        con_cantidad_col_n: 0,
        con_precio_col_o: 0,
        con_total_col_r: 0,
        con_todos_los_datos: 0
      };

      const partidasExcel = new Map();
      const partidasSinUnidad = new Map();

      // Revisar cada fila
      for (let row = range.s.r; row <= range.e.r; row++) {
        contadores.total_filas++;

        const cellA = sheet[`A${row + 1}`];
        const item = cellA ? String(cellA.v || '').trim() : '';

        // Contar cualquier código OE
        if (item.match(/^OE\./)) {
          contadores.con_codigo_oe++;

          // Si es partida nivel 4 (OE.X.X.X.X)
          if (item.match(/^OE\.\d+\.\d+\.\d+\.\d+$/)) {
            contadores.partidas_nivel4++;

            const cellB = sheet[`B${row + 1}`];
            const desc = cellB ? String(cellB.v || '').trim() : '';

            const cellM = sheet[`M${row + 1}`];
            const unidad = cellM ? String(cellM.v || '').trim() : '';

            const cellN = sheet[`N${row + 1}`];
            const cantidad = cellN ? cellN.v : null;

            const cellO = sheet[`O${row + 1}`];
            const precio = cellO ? cellO.v : null;

            const cellR = sheet[`R${row + 1}`];
            const total = cellR ? cellR.v : null;

            if (unidad) contadores.con_unidad_col_m++;
            if (cantidad !== null && cantidad !== undefined) contadores.con_cantidad_col_n++;
            if (precio !== null && precio !== undefined) contadores.con_precio_col_o++;
            if (total !== null && total !== undefined) contadores.con_total_col_r++;

            if (unidad && cantidad !== null && precio !== null) {
              contadores.con_todos_los_datos++;
              partidasExcel.set(item, { desc, unidad, cantidad, precio });
            } else {
              partidasSinUnidad.set(item, { desc, unidad: unidad || 'SIN', cantidad, precio });
            }
          }
        }
      }

      console.log(`   Total filas en Excel: ${contadores.total_filas}`);
      console.log(`   Filas con código OE: ${contadores.con_codigo_oe}`);
      console.log(`   Partidas nivel 4 (OE.X.X.X.X): ${contadores.partidas_nivel4}`);
      console.log(`\n   De esas ${contadores.partidas_nivel4} partidas nivel 4:`);
      console.log(`      ✅ Con UNIDAD (col M): ${contadores.con_unidad_col_m}`);
      console.log(`      ✅ Con CANTIDAD (col N): ${contadores.con_cantidad_col_n}`);
      console.log(`      ✅ Con PRECIO (col O): ${contadores.con_precio_col_o}`);
      console.log(`      ✅ Con TOTAL (col R): ${contadores.con_total_col_r}`);
      console.log(`      🎯 CON TODOS LOS DATOS: ${contadores.con_todos_los_datos}`);

      // 3. Comparación
      console.log('\n' + '='.repeat(120));
      console.log('\n3️⃣ COMPARACIÓN FINAL\n');

      const enBdNoEnExcel = [];
      const enExcelNoEnBd = [];

      // BD vs Excel
      const result4 = await client.query('SELECT codigo FROM partidas');
      const partidasBd = new Set(result4.rows.map(r => r.codigo));

      result4.rows.forEach(row => {
        if (!partidasExcel.has(row.codigo) && !partidasSinUnidad.has(row.codigo)) {
          enBdNoEnExcel.push(row.codigo);
        }
      });

      Array.from(partidasExcel.keys()).forEach(codigo => {
        if (!partidasBd.has(codigo)) {
          enExcelNoEnBd.push(codigo);
        }
      });

      console.log(`   BD actual: ${totalPartidas} partidas`);
      console.log(`   Excel (con todos datos): ${contadores.con_todos_los_datos} partidas`);
      console.log(`   Excel (sin algunos datos): ${partidasSinUnidad.size} partidas`);
      console.log(`\n   ✅ EN AMBOS: ${totalPartidas - enBdNoEnExcel.length}`);
      console.log(`   ❌ EN BD pero NO en EXCEL: ${enBdNoEnExcel.length}`);
      console.log(`   ⚠️  EN EXCEL pero NO en BD: ${enExcelNoEnBd.length}`);

      // Verificación final
      console.log('\n' + '='.repeat(120));
      console.log('\n4️⃣ PREGUNTA CRÍTICA\n');

      if (totalPartidas === 1135) {
        console.log(`   ❓ Tu BD tiene 1,135 partidas`);
        console.log(`   ❓ El PRESUPUESTO.xlsx tiene ${contadores.con_todos_los_datos} partidas con unidad`);
        console.log(`   ❓ Diferencia: ${1135 - contadores.con_todos_los_datos}`);
        console.log(`\n   🤔 ¿Las 1,135 en la BD vienen de otra fuente?`);
        console.log(`   🤔 ¿O el Excel está incompleto?`);
      } else {
        console.log(`   📊 BD actual: ${totalPartidas} partidas`);
        console.log(`   📊 Excel completo: ${contadores.con_todos_los_datos} con todos los datos`);
        console.log(`   📊 Excel incompleto: ${partidasSinUnidad.size} sin todos los datos`);
      }

      console.log('\n' + '='.repeat(120) + '\n');

      await pool.end();

    } catch (e) {
      console.error('Error:', e.message);
      process.exit(1);
    }
  });
