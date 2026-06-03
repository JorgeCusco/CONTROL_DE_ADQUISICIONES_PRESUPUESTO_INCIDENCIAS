import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const query = `
      WITH consolidado AS (
        SELECT codigo, descripcion, unidad, costo_p FROM insumos_p
        UNION
        SELECT codigo_insumo as codigo, descripcion_insumo as descripcion, MAX(unidad) as unidad, MAX(precio_p) as costo_p
        FROM acus
        WHERE codigo_insumo NOT IN (SELECT codigo FROM insumos_p) AND codigo_insumo IS NOT NULL AND codigo_insumo != ''
        GROUP BY codigo_insumo, descripcion_insumo
      )
      SELECT 
        c.codigo, 
        c.descripcion, 
        c.unidad, 
        c.costo_p as precio_original,
        (
          SELECT SUM(comp.precio_und * COALESCE(comp.cantidad_und, comp.cantidad_c)) / NULLIF(SUM(COALESCE(comp.cantidad_und, comp.cantidad_c)), 0)
          FROM mapeo_vinculacion m
          JOIN compras_c comp ON m.compra_id = comp.id
          WHERE m.codigo_insumo = c.codigo
        ) as ppp_calculado,
        (
          SELECT SUM(COALESCE(comp.cantidad_und, comp.cantidad_c))
          FROM mapeo_vinculacion m
          JOIN compras_c comp ON m.compra_id = comp.id
          WHERE m.codigo_insumo = c.codigo
        ) as cantidad_comprada
      FROM consolidado c
      ORDER BY c.descripcion ASC
    `;

    const result = await client.query(query);
    client.release();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Catálogo PPP');

    // Header styling
    const headerBg = 'FF1e293b';
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    const headerFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: headerBg } };
    const headerAlignment = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

    const headers = [
      'Código', 
      'Descripción del Insumo', 
      'Und.', 
      'P.U. Expediente (S/.)', 
      'P.P.P. (S/.)', 
      'Cantidad Comprada',
      'Diferencia P.U.'
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;
    headerRow.alignment = headerAlignment;
    headerRow.height = 25;

    worksheet.columns = [
      { width: 15 },  // Código
      { width: 60 },  // Nombre
      { width: 10 },  // Unidad
      { width: 22 },  // PU Expediente
      { width: 22 },  // PPP
      { width: 22 },  // Cantidad comprada
      { width: 22 },  // Diferencia
    ];

    result.rows.forEach((row, index) => {
      const precioOrig = Number(row.precio_original) || 0;
      const ppp = row.ppp_calculado !== null ? Number(row.ppp_calculado) : null;
      const cantComprada = Number(row.cantidad_comprada) || 0;
      
      const dif = ppp !== null ? ppp - precioOrig : 0;

      const dataRow = worksheet.addRow([
        row.codigo || '',
        row.descripcion || '',
        row.unidad || '',
        precioOrig,
        ppp !== null ? ppp : '-',
        cantComprada,
        ppp !== null ? dif : '-'
      ]);

      if (index % 2 === 1) {
        dataRow.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF8FAFC' } };
      }

      dataRow.getCell(4).numFmt = '#,##0.00';
      
      if (ppp !== null) {
        dataRow.getCell(5).numFmt = '#,##0.00';
        dataRow.getCell(5).font = { color: { argb: 'FF854D0E' }, bold: true }; // Amarillo oscuro/dorado
        dataRow.getCell(5).fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF08A' } };
        
        dataRow.getCell(6).numFmt = '#,##0.0000';
        
        dataRow.getCell(7).numFmt = '#,##0.00';
        if (dif > 0) {
          dataRow.getCell(7).font = { color: { argb: 'FFDC2626' }, bold: true }; // Rojo (Pérdida/Sobrecosto)
        } else if (dif < 0) {
          dataRow.getCell(7).font = { color: { argb: 'FF166534' }, bold: true }; // Verde (Ahorro)
        }
      }

      dataRow.alignment = { vertical: 'middle' as const };
    });

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `catalogo-maestro-ppp-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export PPP Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
