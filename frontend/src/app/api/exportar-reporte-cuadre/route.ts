import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      insumoCodigo, 
      insumoNombre, 
      estado, 
      comentario, 
      globalAdquirido, 
      sumParcial2, 
      diff2, 
      precioPromedio, 
      compras, 
      apuData 
    } = data;

    const workbook = new ExcelJS.Workbook();
    
    // -------------------------------------------------------------
    // HOJA 1: RESUMEN Y CIERRE DE FLUJO
    // -------------------------------------------------------------
    const wsResumen = workbook.addWorksheet('Resumen de Cuadre');
    
    // Título Principal
    wsResumen.mergeCells('A1:D1');
    const titleCell = wsResumen.getCell('A1');
    titleCell.value = 'REPORTE DE AJUSTE MANUAL Y CUADRE DE ADQUISICIONES';
    titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Datos del Insumo
    wsResumen.getCell('A3').value = 'Insumo:';
    wsResumen.getCell('A3').font = { bold: true };
    wsResumen.getCell('B3').value = `${insumoCodigo} - ${insumoNombre}`;
    wsResumen.mergeCells('B3:D3');

    // Cierre de Flujo
    wsResumen.getCell('A5').value = 'Estado Actual del Insumo:';
    wsResumen.getCell('A5').font = { bold: true };
    wsResumen.getCell('B5').value = estado;
    
    // Colores según estado
    if (estado === 'Terminado') wsResumen.getCell('B5').font = { color: { argb: 'FF166534' }, bold: true };
    else if (estado === 'Excedente') wsResumen.getCell('B5').font = { color: { argb: 'FF9A3412' }, bold: true };
    else wsResumen.getCell('B5').font = { bold: true };

    wsResumen.getCell('A6').value = 'Nota de Justificación:';
    wsResumen.getCell('A6').font = { bold: true };
    wsResumen.getCell('B6').value = comentario || 'Ninguna';
    wsResumen.mergeCells('B6:D8');
    wsResumen.getCell('B6').alignment = { vertical: 'top', wrapText: true };

    // Métricas
    wsResumen.getCell('A10').value = 'Meta de Cuadre Global (Adquirido):';
    wsResumen.getCell('A10').font = { bold: true };
    wsResumen.getCell('B10').value = globalAdquirido;
    wsResumen.getCell('B10').numFmt = '#,##0.0000';

    wsResumen.getCell('A11').value = 'Suma APU (Expediente Modificado):';
    wsResumen.getCell('A11').font = { bold: true };
    wsResumen.getCell('B11').value = sumParcial2;
    wsResumen.getCell('B11').numFmt = '#,##0.0000';

    wsResumen.getCell('A12').value = 'Diferencia (Falta/Exceso):';
    wsResumen.getCell('A12').font = { bold: true };
    wsResumen.getCell('B12').value = diff2;
    wsResumen.getCell('B12').numFmt = '#,##0.0000';
    if (Math.abs(diff2) < 0.0001) {
       wsResumen.getCell('C12').value = '✅ Cuadre Exacto';
       wsResumen.getCell('C12').font = { color: { argb: 'FF16A34A' }, bold: true };
    } else if (diff2 > 0) {
       wsResumen.getCell('C12').value = '⚠️ Falta (Aumentar incidencia)';
       wsResumen.getCell('C12').font = { color: { argb: 'FFDC2626' }, bold: true };
    } else {
       wsResumen.getCell('C12').value = '⚠️ Exceso (Reducir incidencia)';
       wsResumen.getCell('C12').font = { color: { argb: 'FFDC2626' }, bold: true };
    }

    wsResumen.getCell('A13').value = 'Precio Promedio Ponderado (PPP):';
    wsResumen.getCell('A13').font = { bold: true };
    wsResumen.getCell('B13').value = precioPromedio;
    wsResumen.getCell('B13').numFmt = '"S/" #,##0.0000';

    wsResumen.columns = [
      { width: 35 }, { width: 25 }, { width: 30 }, { width: 20 }
    ];

    // -------------------------------------------------------------
    // HOJA 2: COMPRAS
    // -------------------------------------------------------------
    if (compras && compras.length > 0) {
      const wsCompras = workbook.addWorksheet('Detalle de Compras');
      wsCompras.addRow(['Orden/Doc', 'Detalle', 'Unidad Orig', 'Cant Orig', 'Precio Orig', 'Unidad (Edit)', 'Cant Und (Edit)', 'Precio Unit', 'Total']);
      
      const headerCompras = wsCompras.getRow(1);
      headerCompras.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerCompras.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
      
      compras.forEach((c: any) => {
        wsCompras.addRow([
          c.orden,
          c.detalle,
          c.unidad_orig,
          c.cant_orig,
          c.precio_orig,
          c.unidad,
          c.cantidad_und,
          c.precio_unit,
          c.cantidad_und * c.precio_unit
        ]);
      });

      wsCompras.columns = [
        { width: 15 }, { width: 40 }, { width: 12 }, { width: 12 }, { width: 12 }, 
        { width: 15 }, { width: 15 }, { width: 12 }, { width: 15 }
      ];
    }

    // -------------------------------------------------------------
    // HOJA 3: APUS (INCIDENCIAS)
    // -------------------------------------------------------------
    if (apuData && apuData.length > 0) {
      const wsApu = workbook.addWorksheet('Edición de APUs');
      wsApu.addRow([
        'Item 1', 'Código Partida', 'Descripción', 'Unidad', 'Cantidad 1', 'Metrado Fijo', 
        'Parcial 1', 'Precio Orig', 'CANTIDAD 2', 'Parcial 2', 'Precio Nuevo', 'Costo Total Nuevo'
      ]);

      const headerApu = wsApu.getRow(1);
      headerApu.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerApu.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };

      apuData.forEach((a: any) => {
        const parcial2 = Number(a.cantidad_2) * Number(a.metrado_fijo);
        const costoNuevo = parcial2 * Number(precioPromedio);
        
        wsApu.addRow([
          a.item_1,
          a.codigo_partida,
          a.partida_desc,
          a.unidad,
          a.cantidad_1,
          a.metrado_fijo,
          a.parcial_1,
          a.precio_unit_original,
          a.cantidad_2,
          parcial2,
          precioPromedio,
          costoNuevo
        ]);
      });

      wsApu.columns = [
        { width: 12 }, { width: 15 }, { width: 40 }, { width: 10 }, { width: 12 }, { width: 12 },
        { width: 12 }, { width: 12 }, { width: 15 }, { width: 12 }, { width: 15 }, { width: 18 }
      ];
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Reporte-Cuadre-${insumoCodigo}-${new Date().getTime()}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Report Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
