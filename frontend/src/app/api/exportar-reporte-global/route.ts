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
             a.codigo_insumo,
             COALESCE(p.item, a.item_partida) as item,
             COALESCE(MAX(p.descripcion), '[PARTIDA FALTANTE EN PRESUPUESTO]') as partida_desc,
             COALESCE(MAX(p.cantidad_p), 0) as metrado_fijo,
             MAX(i.descripcion) as descripcion_insumo,
             MAX(i.unidad) as unidad,
             SUM(a.cantidad_p) as incidencia_expediente,
             (SUM(a.cantidad_p) * COALESCE(MAX(p.cantidad_p), 0)) as cantidad_expediente,
             SUM(COALESCE(a.cantidad_c, a.cantidad_p)) as incidencia_modificada,
             (SUM(COALESCE(a.cantidad_c, a.cantidad_p)) * COALESCE(MAX(p.cantidad_p), 0)) as cantidad_modificada
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      LEFT JOIN insumos_p i ON a.codigo_insumo = i.codigo
      GROUP BY a.item_partida, p.item, a.codigo_insumo
      ORDER BY COALESCE(p.item, a.item_partida) ASC, a.codigo_insumo ASC
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
    // HOJA 3: APUS GEMELO COMPARATIVO
    // -------------------------------------------------------------
    const wsGemelo = workbook.addWorksheet('APUs Gemelo Comparativo');

    // Filas 1 y 2 para Cabeceras Anidadas
    const titleRow = wsGemelo.addRow([
      'DATOS DE LA PARTIDA E INSUMO', '', '', '', '', '',
      'APU ORIGINAL (EXPEDIENTE)', '',
      'APU GEMELO (EDITADO)', '',
      'COMPARATIVO', ''
    ]);
    
    const subHeadersGemelo = [
      'Item', 'Descripción de Partida', 'Metrado', 'Cód. Insumo', 'Descripción Insumo', 'Und',
      'Incidencia', 'Parcial',
      'Incidencia', 'Parcial',
      'Dif. Incidencia', 'Dif. Parcial'
    ];
    const headerRowGemelo = wsGemelo.addRow(subHeadersGemelo);

    // Merge superheaders
    wsGemelo.mergeCells('A1:F1');
    wsGemelo.mergeCells('G1:H1');
    wsGemelo.mergeCells('I1:J1');
    wsGemelo.mergeCells('K1:L1');

    // Estilos de cabecera principal (Fila 1)
    titleRow.height = 25;
    titleRow.alignment = { horizontal: 'center', vertical: 'middle', bold: true };
    titleRow.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    
    titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e293b' } }; // Slate 800
    titleRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF475569' } }; // Slate 600 (Gris oscuro/azulado)
    titleRow.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }; // Emerald 600 (Verde)
    titleRow.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCA8A04' } }; // Yellow 600 (Ambar/Dorado)

    // Estilos de subcabecera (Fila 2)
    headerRowGemelo.height = 30;
    headerRowGemelo.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
    headerRowGemelo.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    
    // Asignar colores a subcabeceras según el bloque
    for (let col = 1; col <= 6; col++) headerRowGemelo.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } }; // Slate 700
    for (let col = 7; col <= 8; col++) headerRowGemelo.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF64748B' } }; // Slate 500
    for (let col = 9; col <= 10; col++) headerRowGemelo.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }; // Emerald 500
    for (let col = 11; col <= 12; col++) headerRowGemelo.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEAB308' } }; // Yellow 500

    // Anchos de columna
    wsGemelo.columns = [
      { width: 15 }, // Item
      { width: 40 }, // Partida
      { width: 12 }, // Metrado
      { width: 15 }, // Codigo
      { width: 45 }, // Insumo
      { width: 8 },  // Und
      { width: 16 }, // Inc Orig
      { width: 16 }, // Par Orig
      { width: 16 }, // Inc Gem
      { width: 16 }, // Par Gem
      { width: 16 }, // Var Inc
      { width: 16 }  // Var Par
    ];

    let currentItem = '';

    apusGemeloResult.rows.forEach((row) => {
      const inc_orig = Number(row.incidencia_expediente) || 0;
      const par_orig = Number(row.cantidad_expediente) || 0;
      const inc_edit = Number(row.incidencia_modificada) || 0;
      const par_edit = Number(row.cantidad_modificada) || 0;
      
      const dif_inc = inc_edit - inc_orig;
      const dif_par = par_edit - par_orig;
      
      const item = row.item || '';
      
      // Añadir fila divisora si cambia de partida para mantener elegancia
      if (currentItem !== '' && currentItem !== item) {
         const spacer = wsGemelo.addRow(new Array(12).fill(''));
         spacer.height = 5;
         spacer.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCBD5E1' } }; // Slate 300
      }
      currentItem = item;

      const dataRow = wsGemelo.addRow([
        item,
        row.partida_desc || '',
        Number(row.metrado_fijo) || 0,
        row.codigo_insumo || '',
        row.descripcion_insumo || '',
        row.unidad || '',
        inc_orig,
        par_orig,
        inc_edit,
        par_edit,
        dif_inc,
        dif_par
      ]);

      // Bordes
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
      });

      // Formato numérico
      dataRow.getCell(3).numFmt = '#,##0.00';
      dataRow.getCell(7).numFmt = '#,##0.000000';
      dataRow.getCell(8).numFmt = '#,##0.0000';
      dataRow.getCell(9).numFmt = '#,##0.000000';
      dataRow.getCell(10).numFmt = '#,##0.0000';
      dataRow.getCell(11).numFmt = '#,##0.000000';
      dataRow.getCell(12).numFmt = '#,##0.0000';

      // Resaltado tenue si hubo modificación
      if (Math.abs(dif_inc) > 0.000001) {
        // Fondo verde súper tenue para el gemelo indicando cambio
        dataRow.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; // Emerald 100
        dataRow.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; 
        
        // Letra roja si es negativo, o verde oscuro si es positivo
        const fontColor = dif_inc > 0 ? 'FF065F46' : 'FF991B1B'; // Emerald 800 or Red 800
        dataRow.getCell(11).font = { color: { argb: fontColor }, bold: true };
        dataRow.getCell(12).font = { color: { argb: fontColor }, bold: true };
      }
    });

    wsGemelo.views = [{ state: 'frozen', ySplit: 2 }];

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
