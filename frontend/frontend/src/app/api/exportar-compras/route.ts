import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        c.id,
        c.tipo_compra,
        c.num_compra,
        c.anio,
        c.detalle,
        c.unidad_und as unidad,
        c.cantidad_und as cantidad,
        c.precio_und as precio_unitario,
        (c.cantidad_und * c.precio_und) as total,
        CASE
          WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion m WHERE m.compra_id = c.id) THEN 'VINCULADO'
          ELSE 'DISPONIBLE'
        END as estado,
        (SELECT ir.descripcion_insumo FROM mapeo_vinculacion m2 JOIN insumos_resumen ir ON m2.codigo_insumo = ir.codigo_insumo WHERE m2.compra_id = c.id LIMIT 1) as vinculado_a
      FROM compras_c c
      ORDER BY c.anio DESC, c.num_compra
    `);

    client.release();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Compras');

    // Header styling
    const headerBg = 'FF1d4ed8';
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    const headerFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: headerBg } };
    const headerAlignment = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

    // Headers
    const headers = ['ID', 'Tipo Compra', 'Número Documento', 'Año', 'Detalle', 'Unidad', 'Cantidad', 'Precio Unitario', 'Total', 'Estado', 'Vinculado A'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;
    headerRow.alignment = headerAlignment;
    headerRow.height = 25;

    // Column widths
    worksheet.columns = [
      { width: 10 },  // ID
      { width: 15 },  // Tipo Compra
      { width: 18 },  // Número Documento
      { width: 10 },  // Año
      { width: 50 },  // Detalle
      { width: 12 },  // Unidad
      { width: 15 },  // Cantidad
      { width: 18 },  // Precio Unitario
      { width: 18 },  // Total
      { width: 15 },  // Estado
      { width: 40 },  // Vinculado A
    ];

    // Data rows
    result.rows.forEach((row, index) => {
      const dataRow = worksheet.addRow([
        row.id || '',
        row.tipo_compra || '',
        row.num_compra || '',
        row.anio || '',
        row.detalle || '',
        row.unidad || '',
        row.cantidad || 0,
        row.precio_unitario || 0,
        row.total || 0,
        row.estado || 'DISPONIBLE',
        row.vinculado_a || '',
      ]);

      // Alternate row coloring
      if (index % 2 === 1) {
        dataRow.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF8FAFC' } };
      }

      // Number formatting
      dataRow.getCell(7).numFmt = '0.000';
      dataRow.getCell(8).numFmt = '0.00';
      dataRow.getCell(9).numFmt = '0.00';

      // Status coloring
      const estadoCell = dataRow.getCell(10);
      if (row.estado === 'VINCULADO') {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFDCFCE7' } };
        estadoCell.font = { color: { argb: 'FF166534' }, bold: true };
      } else {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF1F5F9' } };
        estadoCell.font = { color: { argb: 'FF475569' }, bold: true };
      }

      dataRow.alignment = { vertical: 'middle' as const };
    });

    // Freeze header
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `compras-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Compras Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
