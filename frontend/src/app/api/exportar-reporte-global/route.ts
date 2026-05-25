import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT 
          i.codigo as codigo,
          i.descripcion as nombre,
          i.unidad,
          -- Meta Adquirido (Compras)
          COALESCE((
              SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c))
              FROM mapeo_vinculacion m
              JOIN compras_c c ON m.compra_id = c.id
              WHERE m.codigo_insumo = i.codigo
          ), 0) as total_adquirido,
          -- Suma APU Modificada (Expediente)
          COALESCE((
              SELECT SUM(COALESCE(a.cantidad_c, a.cantidad_p) * COALESCE(p.cantidad_p, 0))
              FROM acus a
              LEFT JOIN partidas_p p ON a.item_partida = p.item
              WHERE a.codigo_insumo = i.codigo
          ), 0) as suma_apu,
          COALESCE(e.estado, 'Pendiente') as estado,
          e.comentario
      FROM insumos_p i
      LEFT JOIN estado_cuadre_insumos e ON i.codigo = e.codigo_insumo
      ORDER BY i.descripcion
    `);

    const apusResult = await client.query(`
      SELECT 
             a.codigo_insumo,
             COALESCE(p.item, a.item_partida) as item,
             COALESCE(MAX(p.descripcion), '[PARTIDA FALTANTE EN PRESUPUESTO]') as partida_desc,
             COALESCE(MAX(p.cantidad_p), 0) as metrado_fijo,
             MAX(i.descripcion) as descripcion_insumo,
             SUM(a.cantidad_p) as incidencia_expediente,
             (SUM(a.cantidad_p) * COALESCE(MAX(p.cantidad_p), 0)) as cantidad_expediente,
             SUM(COALESCE(a.cantidad_c, a.cantidad_p)) as incidencia_modificada,
             (SUM(COALESCE(a.cantidad_c, a.cantidad_p)) * COALESCE(MAX(p.cantidad_p), 0)) as cantidad_modificada,
             MAX(e.comentario) as observaciones
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      LEFT JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN estado_cuadre_insumos e ON a.codigo_insumo = e.codigo_insumo
      GROUP BY a.item_partida, p.item, a.codigo_insumo
      ORDER BY a.codigo_insumo, COALESCE(p.item, a.item_partida)
    `);

    const apusGemeloResult = await client.query(`
      SELECT 
             p.item as partida_item,
             p.descripcion as partida_desc,
             COALESCE(p.cantidad_p, 0) as metrado_fijo,
             COALESCE(p.rendimiento_p, '1') as rendimiento,
             a.codigo_insumo,
             a.descripcion_insumo as descripcion,
             MAX(a.unidad) as unidad,
             SUM(a.cantidad_p) as cant_orig,
             SUM(a.parcial_p) as parcial_orig,
             SUM(COALESCE(a.cantidad_c, a.cantidad_p)) as cant_mod,
             SUM(COALESCE(a.parcial_c, a.parcial_p)) as parcial_mod
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      GROUP BY p.item, p.descripcion, p.cantidad_p, p.rendimiento_p, a.codigo_insumo, a.descripcion_insumo
      ORDER BY p.item ASC, a.codigo_insumo ASC
    `);

    client.release();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte Global Cuadre');

    // Header styling
    const headerBg = 'FF1e293b';
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    const headerFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: headerBg } };
    const headerAlignment = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

    // Headers
    const headers = [
      'Código', 
      'Nombre del Insumo', 
      'Unidad', 
      'Total Adquirido (Meta)', 
      'Suma APU (Modificado)', 
      'Diferencia (Meta - APU)', 
      'Estado de Cuadre', 
      'Nota de Justificación'
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;
    headerRow.alignment = headerAlignment;
    headerRow.height = 25;

    // Column widths
    worksheet.columns = [
      { width: 15 },  // Código
      { width: 50 },  // Nombre
      { width: 10 },  // Unidad
      { width: 22 },  // Adquirido
      { width: 22 },  // APU
      { width: 22 },  // Diferencia
      { width: 20 },  // Estado
      { width: 50 },  // Comentario
    ];

    // Data rows
    result.rows.forEach((row, index) => {
      const adquirido = Number(row.total_adquirido) || 0;
      const sumaApu = Number(row.suma_apu) || 0;
      const diferencia = adquirido - sumaApu;

      const dataRow = worksheet.addRow([
        row.codigo || '',
        row.nombre || '',
        row.unidad || '',
        adquirido,
        sumaApu,
        diferencia,
        row.estado || 'Pendiente',
        row.comentario || ''
      ]);

      // Alternate row coloring
      if (index % 2 === 1) {
        dataRow.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF8FAFC' } };
      }

      // Number formatting
      dataRow.getCell(4).numFmt = '#,##0.0000';
      dataRow.getCell(5).numFmt = '#,##0.0000';
      dataRow.getCell(6).numFmt = '#,##0.0000';

      // Diferencia coloring
      const diffCell = dataRow.getCell(6);
      if (Math.abs(diferencia) < 0.0001) {
        diffCell.font = { color: { argb: 'FF166534' } }; // Green
      } else {
        diffCell.font = { color: { argb: 'FFDC2626' } }; // Red
      }

      // Status coloring
      const estadoCell = dataRow.getCell(7);
      if (row.estado === 'Terminado') {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFDCFCE7' } };
        estadoCell.font = { color: { argb: 'FF166534' }, bold: true };
      } else if (row.estado === 'Cuadre Parcial') {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFDBEAFE' } };
        estadoCell.font = { color: { argb: 'FF1D4ED8' }, bold: true };
      } else if (row.estado === 'Excedente') {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF08A' } };
        estadoCell.font = { color: { argb: 'FF854D0E' }, bold: true };
      } else {
        estadoCell.font = { color: { argb: 'FF64748B' } };
      }

      dataRow.alignment = { vertical: 'middle' as const };
      dataRow.getCell(8).alignment = { vertical: 'middle', wrapText: true };
    });

    // Freeze header
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    // -------------------------------------------------------------
    // HOJA 2: DETALLE DE APUS
    // -------------------------------------------------------------
    const worksheetApu = workbook.addWorksheet('Detalle de APUs');

    const headerApuBg = 'FF2563EB'; // Blue to match the image
    const headerApuFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
    const headerApuFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: headerApuBg } };
    const headerApuAlignment = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

    const headersApu = [
      'Codigo Insumo',
      'ITEM',
      'PARTIDA',
      'METRADO',
      'Descripcion Insumo',
      'INCIDENCIA SEGUN EXPEDIENTE',
      'CANTIDAD SEGUN EXPEDIENTE',
      'INCIDENCIA MODIFICADO',
      'CANTIDAD MODIFICADA',
      'VARIACION DE INCIDENCIA',
      'VARIACION CANTIDAD',
      'OBSERVACIONES'
    ];
    
    const headerRowApu = worksheetApu.addRow(headersApu);
    headerRowApu.font = headerApuFont;
    headerRowApu.fill = headerApuFill;
    headerRowApu.alignment = headerApuAlignment;
    headerRowApu.height = 30;

    worksheetApu.columns = [
      { width: 15 },  // Codigo Insumo
      { width: 15 },  // ITEM
      { width: 45 },  // PARTIDA
      { width: 12 },  // METRADO
      { width: 55 },  // Descripcion Insumo
      { width: 25 },  // INCIDENCIA SEGUN EXPEDIENTE
      { width: 25 },  // CANTIDAD SEGUN EXPEDIENTE
      { width: 25 },  // INCIDENCIA MODIFICADO
      { width: 25 },  // CANTIDAD MODIFICADA
      { width: 25 },  // VARIACION DE INCIDENCIA
      { width: 25 },  // VARIACION CANTIDAD
      { width: 35 }   // OBSERVACIONES
    ];

    apusResult.rows.forEach((row) => {
      const inc_exp = Number(row.incidencia_expediente) || 0;
      const cant_exp = Number(row.cantidad_expediente) || 0;
      const inc_mod = Number(row.incidencia_modificada) || 0;
      const cant_mod = Number(row.cantidad_modificada) || 0;
      
      const var_inc = inc_mod - inc_exp;
      const var_cant = cant_mod - cant_exp;

      const dataRow = worksheetApu.addRow([
        row.codigo_insumo || '',
        row.item || '',
        row.partida_desc || '',
        Number(row.metrado_fijo) || 0,
        row.descripcion_insumo || '',
        inc_exp,
        cant_exp,
        inc_mod,
        cant_mod,
        var_inc,
        var_cant,
        row.observaciones || ''
      ]);

      // Row fill matching the image (light orange/yellow)
      dataRow.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFDE68A' } }; // yellow-200
      
      // Border lines
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });

      // Number formatting
      dataRow.getCell(4).numFmt = '#,##0.00';
      dataRow.getCell(6).numFmt = '#,##0.000000';
      dataRow.getCell(7).numFmt = '#,##0.0000';
      dataRow.getCell(8).numFmt = '#,##0.000000';
      dataRow.getCell(9).numFmt = '#,##0.0000';
      dataRow.getCell(10).numFmt = '#,##0.000000';
      dataRow.getCell(11).numFmt = '#,##0.0000';

      // Alignment
      dataRow.alignment = { vertical: 'middle' as const };
    });

    worksheetApu.views = [{ state: 'frozen', ySplit: 1 }];

    // -------------------------------------------------------------
    // HOJA 3: APU GEMELO (ESTILO UI)
    // -------------------------------------------------------------
    const wsGemelo = workbook.addWorksheet('APU Gemelo (Estilo UI)');

    wsGemelo.columns = [
      { width: 45 }, { width: 8 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, // Antiguo (A-F)
      { width: 3 }, // Espaciador (G)
      { width: 45 }, { width: 8 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }  // Nuevo (H-M)
    ];

    // Agrupar por Partida
    const partidasMap = new Map();
    apusGemeloResult.rows.forEach(row => {
      const item = row.partida_item || '[SIN PARTIDA]';
      if (!partidasMap.has(item)) {
        partidasMap.set(item, {
          item: item,
          desc: row.partida_desc || '',
          metrado_fijo: Number(row.metrado_fijo) || 0,
          rendimiento: row.rendimiento || '1',
          insumos: []
        });
      }
      partidasMap.get(item).insumos.push({ ...row });
    });

    Array.from(partidasMap.values()).forEach((partida, idx) => {
      if (idx > 0) {
        const spacer = wsGemelo.addRow([]);
        spacer.height = 15;
      }

      // Title Row
      const mf = partida.metrado_fijo.toFixed(4);
      const titleRow = wsGemelo.addRow([
        `📜 APU Antiguo (Original)             Metrado Fijo: ${mf}   Rend: ${partida.rendimiento}`, '', '', '', '', '',
        '',
        `✨ APU Nuevo (Modificado)             Metrado Fijo: ${mf}   Rend: ${partida.rendimiento}`, '', '', '', '', ''
      ]);
      wsGemelo.mergeCells(titleRow.number, 1, titleRow.number, 6);
      wsGemelo.mergeCells(titleRow.number, 8, titleRow.number, 13);
      titleRow.font = { bold: true, size: 10 };
      titleRow.height = 25;
      titleRow.alignment = { vertical: 'middle' };
      
      titleRow.getCell(1).font = { color: { argb: 'FF475569' }, bold: true };
      titleRow.getCell(8).font = { color: { argb: 'FF1D4ED8' }, bold: true };

      // Header Row
      const headerRow = wsGemelo.addRow([
        'Insumo', 'Unid', 'Cant', 'Inci X M', 'P.U.', 'Parcial',
        '',
        'Insumo', 'Unid', 'Cant (N)', 'Inci X M', 'P.U. (N)', 'Parcial (N)'
      ]);
      headerRow.font = { bold: true, size: 9 };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      
      for (let c=1; c<=6; c++) {
        headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Gris Slate UI
      }
      for (let c=8; c<=13; c++) {
        headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } }; // Azul claro UI
      }

      let totalAntiguo = 0;
      let totalNuevo = 0;

      partida.insumos.forEach((ins: any) => {
        const cantOrig = Number(ins.cant_orig) || 0;
        const parcialOrig = Number(ins.parcial_orig) || 0;
        let precioOrig = cantOrig > 0 ? parcialOrig / cantOrig : 0;
        
        const cantMod = Number(ins.cant_mod) || 0;
        const parcialMod = Number(ins.parcial_mod) || 0;
        let precioMod = cantMod > 0 ? parcialMod / cantMod : 0;

        if (ins.unidad && ins.unidad.includes('%')) {
           precioOrig = cantOrig > 0 ? (parcialOrig * 100) / cantOrig : 0;
           precioMod = cantMod > 0 ? (parcialMod * 100) / cantMod : 0;
        }

        const inciOrigXM = cantOrig * partida.metrado_fijo;
        const inciModXM = cantMod * partida.metrado_fijo;

        totalAntiguo += parcialOrig;
        totalNuevo += parcialMod;

        const isModified = Math.abs(cantMod - cantOrig) > 0.000001;

        const dataRow = wsGemelo.addRow([
          ins.descripcion || '',
          ins.unidad || '',
          cantOrig,
          inciOrigXM,
          precioOrig,
          parcialOrig,
          '',
          ins.descripcion || '',
          ins.unidad || '',
          cantMod,
          inciModXM,
          precioMod,
          parcialMod
        ]);

        dataRow.font = { size: 9 };
        
        for(let c of [1,2,3,4,5,6,8,9,10,11,12,13]) {
          dataRow.getCell(c).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
          dataRow.getCell(c).alignment = { vertical: 'middle' };
        }
        
        for(let c of [3,4,5,6, 10,11,12,13]) dataRow.getCell(c).alignment = { horizontal: 'right', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };

        dataRow.getCell(3).numFmt = '#,##0.0000';
        dataRow.getCell(4).numFmt = '#,##0.0000';
        dataRow.getCell(5).numFmt = '#,##0.00';
        dataRow.getCell(6).numFmt = '#,##0.0000';
        
        dataRow.getCell(10).numFmt = '#,##0.0000';
        dataRow.getCell(11).numFmt = '#,##0.0000';
        dataRow.getCell(12).numFmt = '#,##0.00';
        dataRow.getCell(13).numFmt = '#,##0.0000';

        if (isModified) {
          dataRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF08A' } }; // Amarillo UI
          dataRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF08A' } };
          dataRow.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } }; // Celeste UI
          dataRow.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBFDBFE' } };
          
          for(let c of [3,4,6,10,11,13]) dataRow.getCell(c).font = { bold: true, size: 9 };
          dataRow.getCell(12).font = { color: { argb: 'FF166534' }, bold: true, size: 9 };
          dataRow.getCell(13).font = { color: { argb: 'FF1D4ED8' }, bold: true, size: 9 };
        }
      });

      const totalRow = wsGemelo.addRow([
        '', '', '', '', 'TOTAL:', totalAntiguo,
        '',
        '', '', '', '', 'TOTAL NUEVO:', totalNuevo
      ]);
      totalRow.font = { bold: true, size: 9 };
      totalRow.getCell(5).alignment = { horizontal: 'right' };
      totalRow.getCell(6).alignment = { horizontal: 'right' };
      totalRow.getCell(6).numFmt = '#,##0.0000';
      
      totalRow.getCell(12).alignment = { horizontal: 'right' };
      totalRow.getCell(12).font = { bold: true, color: { argb: 'FF1D4ED8' } };
      totalRow.getCell(13).alignment = { horizontal: 'right' };
      totalRow.getCell(13).font = { bold: true, color: { argb: 'FF1D4ED8' } };
      totalRow.getCell(13).numFmt = '#,##0.0000';
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `reporte-global-cuadre-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Global Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
