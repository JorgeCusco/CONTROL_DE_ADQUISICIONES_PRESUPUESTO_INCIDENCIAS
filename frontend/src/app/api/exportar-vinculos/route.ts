import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET() {
  const client = await pool.connect();
  
  try {
    // Consulta principal: cruza Insumos con sus Compras vinculadas
    const query = `
      SELECT
        i.item_1 AS "ITEM (P)",
        'MATERIALES' AS "PROCEDENCIA",
        i.codigo_partida AS "CODIGO",
        i.descripcion AS "DESCRIPCION (P)",
        i.unidad AS "UNIDAD (P)",
        i.cantidad_modificada AS "CANTIDAD (P)",
        0 AS "COSTO (P)",
        0 AS "TOTAL (P)",
        c.id AS "ITEM (C)",
        c.anio_c AS "AÑO (C)",
        c.tipo_c AS "TIPO (C)",
        c.orden_doc AS "ORDEN/DOC",
        c.detalle_compra AS "DETALLE COMPRA",
        c.unidad_c AS "UNIDAD (C)",
        c.cant_c AS "CANT (C)",
        c.pu_c AS "PU (C)",
        c.total_c AS "TOTAL (C)",
        '' AS "EXP. (C)",
        c.opinion_comentario AS "OPINION/COMENTARIO",
        c.observacion AS "OBSERVACION",
        '' AS "ESPECIALIDAD"
      FROM mapeo_vinculacion mv
      JOIN insumos i ON mv.insumo_nombre = i.descripcion
      JOIN compras c ON mv.compra_id = c.id
      ORDER BY i.codigo_partida, i.descripcion, c.id
    `;
    
    const { rows } = await client.query(query);

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vinculados Totales');

    // Definir columnas y anchos aproximados
    sheet.columns = [
      { header: 'ITEM (P)', key: 'ITEM (P)', width: 10 },
      { header: 'PROCEDENCIA', key: 'PROCEDENCIA', width: 15 },
      { header: 'CODIGO', key: 'CODIGO', width: 15 },
      { header: 'DESCRIPCION (P)', key: 'DESCRIPCION (P)', width: 50 },
      { header: 'UNIDAD (P)', key: 'UNIDAD (P)', width: 12 },
      { header: 'CANTIDAD (P)', key: 'CANTIDAD (P)', width: 15 },
      { header: 'COSTO (P)', key: 'COSTO (P)', width: 15 },
      { header: 'TOTAL (P)', key: 'TOTAL (P)', width: 15 },
      { header: 'ITEM (C)', key: 'ITEM (C)', width: 10 },
      { header: 'AÑO (C)', key: 'AÑO (C)', width: 10 },
      { header: 'TIPO (C)', key: 'TIPO (C)', width: 10 },
      { header: 'ORDEN/DOC', key: 'ORDEN/DOC', width: 15 },
      { header: 'DETALLE COMPRA', key: 'DETALLE COMPRA', width: 60 },
      { header: 'UNIDAD (C)', key: 'UNIDAD (C)', width: 12 },
      { header: 'CANT (C)', key: 'CANT (C)', width: 15 },
      { header: 'PU (C)', key: 'PU (C)', width: 15 },
      { header: 'TOTAL (C)', key: 'TOTAL (C)', width: 15 },
      { header: 'EXP. (C)', key: 'EXP. (C)', width: 10 },
      { header: 'OPINION/COMENTARIO', key: 'OPINION/COMENTARIO', width: 30 },
      { header: 'OBSERVACION', key: 'OBSERVACION', width: 30 },
      { header: 'ESPECIALIDAD', key: 'ESPECIALIDAD', width: 15 }
    ];

    // Dar estilo a la cabecera (Fondo rojo para Presupuesto, Azul para Compras)
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
      };
      
      // Presupuesto (Columnas 1 a 8) -> Rojo claro/Salmón
      if (colNumber <= 8) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97777' } };
      } 
      // Compras (Columnas 9 a 21) -> Azul
      else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      }
    });

    // Agregar las filas de datos
    rows.forEach(r => {
      const row = sheet.addRow(r);
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'}
        };
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="Base_Datos_Vinculados.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
    
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Fallo al exportar' }, { status: 500 });
  } finally {
    client.release();
  }
}
