import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT
        i.codigo_insumo as codigo,
        i.descripcion_insumo as nombre,
        i.unidad,
        i.cantidad_requerida_p as meta_cantidad,
        COALESCE((
          SELECT SUM(c.cantidad_und)
          FROM mapeo_vinculacion m2
          JOIN compras_c c ON m2.compra_id = c.id
          WHERE m2.codigo_insumo = i.codigo_insumo
        ), 0) as adquirido,
        COUNT(m.id) as cantidad_vinculos,
        CASE
          WHEN COUNT(m.id) > 0 THEN 'VINCULADO'
          ELSE 'DISPONIBLE'
        END as estado
      FROM insumos_resumen i
      LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
      GROUP BY i.codigo_insumo, i.descripcion_insumo, i.unidad, i.cantidad_requerida_p
      ORDER BY i.descripcion_insumo
    `);

    client.release();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Insumos Presupuesto');

    // Header styling
    const headerBg = 'FF1e293b';
    const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    const headerFill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: headerBg } };
    const headerAlignment = { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true };

    // Headers
    const headers = ['Código', 'Nombre del Insumo', 'Unidad', 'Meta (Cantidad Requerida)', 'Adquirido', 'Cantidad de Vínculos', 'Estado'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = headerFont;
    headerRow.fill = headerFill;
    headerRow.alignment = headerAlignment;
    headerRow.height = 25;

    // Column widths
    worksheet.columns = [
      { width: 18 },  // Código
      { width: 50 },  // Nombre
      { width: 15 },  // Unidad
      { width: 20 },  // Meta
      { width: 15 },  // Adquirido
      { width: 18 },  // Vínculos
      { width: 15 },  // Estado
    ];

    // Data rows
    result.rows.forEach((row, index) => {
      const dataRow = worksheet.addRow([
        row.codigo || '',
        row.nombre || '',
        row.unidad || '',
        row.meta_cantidad || 0,
        row.adquirido || 0,
        row.cantidad_vinculos || 0,
        row.estado || 'DISPONIBLE',
      ]);

      // Alternate row coloring
      if (index % 2 === 1) {
        dataRow.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFF8FAFC' } };
      }

      // Number formatting
      dataRow.getCell(4).numFmt = '0.00';
      dataRow.getCell(5).numFmt = '0.00';

      // Status coloring
      const estadoCell = dataRow.getCell(7);
      if (row.estado === 'VINCULADO') {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFDCFCE7' } };
        estadoCell.font = { color: { argb: 'FF166534' }, bold: true };
      } else {
        estadoCell.fill = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFEF3C7' } };
        estadoCell.font = { color: { argb: 'FF92400E' }, bold: true };
      }

      dataRow.alignment = { vertical: 'middle' as const };
    });

    // Freeze header
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `insumos-presupuesto-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Insumos Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
