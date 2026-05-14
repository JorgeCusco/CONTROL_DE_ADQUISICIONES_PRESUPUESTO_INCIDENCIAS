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
          -- Meta Adquirido (Compras)
          COALESCE((
              SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c))
              FROM mapeo_vinculacion m
              JOIN compras_c c ON m.compra_id = c.id
              WHERE m.codigo_insumo = i.codigo_insumo
          ), 0) as total_adquirido,
          -- Suma APU Modificada (Expediente)
          COALESCE((
              SELECT SUM(COALESCE(a.cantidad_c, a.cantidad_p) * COALESCE(p.cantidad_p, 0))
              FROM acus a
              LEFT JOIN partidas_p p ON a.item_partida = p.item
              WHERE a.codigo_insumo = i.codigo_insumo
          ), 0) as suma_apu,
          COALESCE(e.estado, 'Pendiente') as estado,
          e.comentario
      FROM insumos_p i
      LEFT JOIN estado_cuadre_insumos e ON i.codigo_insumo = e.codigo_insumo
      ORDER BY i.descripcion_insumo
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
