import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

// Color palette
const colors = {
  headerBg: 'FFE6B3',      // Naranja claro
  vinculadoOk: 'D4EDDA',   // Verde claro
  sinVincular: 'F8D7DA',   // Rojo claro
  alternado1: 'F8F9FA',    // Gris muy claro
  alternado2: 'FFFFFF',    // Blanco
  border: '000000'
};

function addHeaderRow(ws: any, headers: string[], startCol = 1) {
  const headerRow = ws.getRow(ws._rows.length + 1);
  headers.forEach((header, idx) => {
    const cell = headerRow.getCell(startCol + idx);
    cell.value = header;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: colors.border } },
      bottom: { style: 'thin', color: { argb: colors.border } },
      left: { style: 'thin', color: { argb: colors.border } },
      right: { style: 'thin', color: { argb: colors.border } }
    };
  });
}

function addBorder(cell: any) {
  cell.border = {
    top: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };
}

export async function GET() {
  try {
    const client = await pool.connect();

    // QUERY 1: Todas las compras con sus vinculaciones
    const comprasResult = await client.query(`
      SELECT
        c.id, c.anio, c.tipo_compra, c.num_compra,
        c.detalle as detalle_compra, c.unidad as unidad_orig, c.cantidad_c as cantidad_orig, c.precio_unit_c as precio_unit_orig,
        COALESCE(c.unidad_und, c.unidad) as unidad_norm,
        COALESCE(c.cantidad_und, c.cantidad_c) as cantidad_norm,
        COALESCE(c.precio_und, c.precio_unit_c) as precio_norm,
        (COALESCE(c.cantidad_und, c.cantidad_c) * COALESCE(c.precio_und, c.precio_unit_c)) as total,
        CASE WHEN m.id IS NOT NULL THEN 'VINCULADO' ELSE 'SIN VINCULAR' END as estado,
        m.usuario, m.created_at as fecha,
        ir.codigo_insumo, ir.descripcion_insumo,
        ir.unidad as unidad_insumo
      FROM compras_c c
      LEFT JOIN mapeo_vinculacion m ON c.id = m.compra_id
      LEFT JOIN insumos_resumen ir ON m.codigo_insumo = ir.codigo_insumo
      ORDER BY c.anio DESC, c.num_compra, c.id
    `);

    // QUERY 2: Todos los insumos con sus vinculaciones
    const insumosResult = await client.query(`
      SELECT
        i.codigo_insumo, i.descripcion_insumo, i.unidad as unidad_insumo,
        i.estado, i.comentario,
        c.id as compra_id, c.anio, c.tipo_compra, c.num_compra,
        c.detalle as detalle_compra,
        COALESCE(c.unidad_und, c.unidad) as unidad_norm,
        COALESCE(c.cantidad_und, c.cantidad_c) as cantidad_norm,
        COALESCE(c.precio_und, c.precio_unit_c) as precio_norm
      FROM insumos_resumen i
      LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
      LEFT JOIN compras_c c ON m.compra_id = c.id
      ORDER BY i.descripcion_insumo, c.anio DESC, c.num_compra
    `);

    // QUERY 3: Estadísticas
    const statsResult = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM compras_c) as total_compras,
        (SELECT COUNT(DISTINCT compra_id) FROM mapeo_vinculacion) as compras_vinculadas,
        (SELECT COUNT(*) FROM insumos_resumen) as total_insumos,
        (SELECT COUNT(DISTINCT codigo_insumo) FROM mapeo_vinculacion) as insumos_con_compras
    `);

    client.release();

    // Crear Excel
    const workbook = new ExcelJS.Workbook();

    // ═══════════════════════════════════════════════════════════════
    // HOJA 1: LISTA COMPLETA DE VINCULACIONES
    // ═══════════════════════════════════════════════════════════════
    const ws1 = workbook.addWorksheet('1. Vinculaciones Completas');
    ws1.columns = [
      { header: 'ID Compra', key: 'compra_id', width: 10 },
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Tipo', key: 'tipo_compra', width: 12 },
      { header: 'N° Documento', key: 'num_compra', width: 15 },
      { header: 'Detalle Compra', key: 'detalle_compra', width: 35 },
      { header: 'Unid Original', key: 'unidad_orig', width: 12 },
      { header: 'Cant Original', key: 'cantidad_orig', width: 12 },
      { header: 'Precio Original', key: 'precio_unit_orig', width: 14 },
      { header: 'Unid Normalizada', key: 'unidad_norm', width: 14 },
      { header: 'Cant Normalizada', key: 'cantidad_norm', width: 14 },
      { header: 'Precio Normalizado', key: 'precio_norm', width: 14 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Estado', key: 'estado', width: 14 },
      { header: 'Código Insumo', key: 'codigo_insumo', width: 15 },
      { header: 'Descripción Insumo', key: 'descripcion_insumo', width: 35 },
      { header: 'Vinculado Por', key: 'usuario', width: 15 },
      { header: 'Fecha Vinculación', key: 'fecha', width: 16 }
    ];

    // Headers
    const headerRow1 = ws1.getRow(1);
    headerRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    headerRow1.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow1.height = 25;

    let rowNum = 2;
    comprasResult.rows.forEach((row: any, idx: number) => {
      const wsRow = ws1.getRow(rowNum);
      wsRow.values = {
        compra_id: row.id,
        anio: row.anio,
        tipo_compra: row.tipo_compra,
        num_compra: row.num_compra,
        detalle_compra: row.detalle_compra,
        unidad_orig: row.unidad_orig,
        cantidad_orig: row.cantidad_orig,
        precio_unit_orig: row.precio_unit_orig,
        unidad_norm: row.unidad_norm,
        cantidad_norm: row.cantidad_norm,
        precio_norm: row.precio_norm,
        total: row.total,
        estado: row.estado,
        codigo_insumo: row.codigo_insumo,
        descripcion_insumo: row.descripcion_insumo,
        usuario: row.usuario,
        fecha: row.fecha ? new Date(row.fecha).toLocaleDateString() : ''
      };

      // Colorear por estado
      const bgColor = row.estado === 'VINCULADO' ? colors.vinculadoOk : colors.sinVincular;
      Array.from({ length: 17 }).forEach((_, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        addBorder(cell);
      });

      rowNum++;
    });

    // ═══════════════════════════════════════════════════════════════
    // HOJA 2: INSUMOS ↔ COMPRAS LADO A LADO
    // ═══════════════════════════════════════════════════════════════
    const ws2 = workbook.addWorksheet('2. Insumos vs Compras');
    ws2.columns = [
      { header: 'Código Insumo', key: 'codigo_insumo', width: 15 },
      { header: 'Descripción Insumo', key: 'descripcion_insumo', width: 35 },
      { header: 'Unidad Insumo', key: 'unidad_insumo', width: 12 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Comentario', key: 'comentario', width: 25 },
      { header: '', key: 'separator1', width: 2 },
      { header: 'ID Compra', key: 'compra_id', width: 10 },
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Tipo', key: 'tipo_compra', width: 10 },
      { header: 'N° Doc', key: 'num_compra', width: 12 },
      { header: 'Detalle Compra', key: 'detalle_compra', width: 30 },
      { header: 'Unidad', key: 'unidad_norm', width: 10 },
      { header: 'Cantidad', key: 'cantidad_norm', width: 12 },
      { header: 'Precio', key: 'precio_norm', width: 12 }
    ];

    const headerRow2 = ws2.getRow(1);
    headerRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
    headerRow2.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow2.height = 25;

    let currentInsumo = '';
    let rowNum2 = 2;
    let useAlternado = false;

    insumosResult.rows.forEach((row: any) => {
      if (row.codigo_insumo !== currentInsumo) {
        currentInsumo = row.codigo_insumo;
        useAlternado = !useAlternado;
      }

      const wsRow = ws2.getRow(rowNum2);
      wsRow.values = {
        codigo_insumo: row.codigo_insumo,
        descripcion_insumo: row.descripcion,
        unidad_insumo: row.unidad_insumo,
        estado: row.estado || 'ACTIVO',
        comentario: row.comentario || '',
        separator1: '',
        compra_id: row.compra_id || '',
        anio: row.anio || '',
        tipo_compra: row.tipo_compra || '',
        num_compra: row.num_compra || '',
        detalle_compra: row.detalle_compra || '',
        unidad_norm: row.unidad_norm || '',
        cantidad_norm: row.cantidad_norm || '',
        precio_norm: row.precio_norm || ''
      };

      const bgColor = useAlternado ? colors.alternado1 : colors.alternado2;
      Array.from({ length: 14 }).forEach((_, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        addBorder(cell);
      });

      rowNum2++;
    });

    // ═══════════════════════════════════════════════════════════════
    // HOJA 3: ANÁLISIS Y ESTADÍSTICAS
    // ═══════════════════════════════════════════════════════════════
    const ws3 = workbook.addWorksheet('3. Análisis y Estadísticas');
    const stats = statsResult.rows[0];

    ws3.columns = [
      { header: 'Métrica', key: 'metrica', width: 35 },
      { header: 'Cantidad', key: 'cantidad', width: 20 },
      { header: 'Porcentaje', key: 'porcentaje', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 }
    ];

    const headerRow3 = ws3.getRow(1);
    headerRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC65911' } };
    headerRow3.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow3.height = 25;

    const stats_data = [
      {
        metrica: 'Total de Compras',
        cantidad: stats.total_compras,
        porcentaje: '100%',
        estado: 'BASE'
      },
      {
        metrica: 'Compras Vinculadas',
        cantidad: stats.compras_vinculadas,
        porcentaje: `${((stats.compras_vinculadas / stats.total_compras) * 100).toFixed(1)}%`,
        estado: stats.compras_vinculadas === stats.total_compras ? '✅ COMPLETO' : '⚠️ INCOMPLETO'
      },
      {
        metrica: 'Compras SIN Vincular',
        cantidad: stats.total_compras - stats.compras_vinculadas,
        porcentaje: `${(((stats.total_compras - stats.compras_vinculadas) / stats.total_compras) * 100).toFixed(1)}%`,
        estado: stats.total_compras === stats.compras_vinculadas ? '✅ CERO' : '🔴 PENDIENTE'
      },
      {
        metrica: '',
        cantidad: '',
        porcentaje: '',
        estado: ''
      },
      {
        metrica: 'Total de Insumos de Presupuesto',
        cantidad: stats.total_insumos,
        porcentaje: '100%',
        estado: 'BASE'
      },
      {
        metrica: 'Insumos CON Vinculaciones',
        cantidad: stats.insumos_con_compras,
        porcentaje: `${((stats.insumos_con_compras / stats.total_insumos) * 100).toFixed(1)}%`,
        estado: stats.insumos_con_compras === stats.total_insumos ? '✅ TOTAL' : '⚠️ PARCIAL'
      },
      {
        metrica: 'Insumos SIN Vinculaciones',
        cantidad: stats.total_insumos - stats.insumos_con_compras,
        porcentaje: `${(((stats.total_insumos - stats.insumos_con_compras) / stats.total_insumos) * 100).toFixed(1)}%`,
        estado: stats.total_insumos === stats.insumos_con_compras ? '✅ CERO' : '🔴 SIN COMPRAS'
      }
    ];

    let rowNum3 = 2;
    stats_data.forEach((stat: any) => {
      const wsRow = ws3.getRow(rowNum3);
      wsRow.values = stat;

      if (stat.metrica === '') {
        rowNum3++;
        return;
      }

      Array.from({ length: 4 }).forEach((_, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
        addBorder(cell);

        if (stat.metrica.includes('Total') || stat.metrica === '') {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };
          cell.font = { bold: true };
        }
      });

      rowNum3++;
    });

    // ═══════════════════════════════════════════════════════════════
    // HOJA 4: INSUMOS COMPLETO (Insumos de Presupuesto + Compras Vinculadas)
    // ═══════════════════════════════════════════════════════════════
    const insumosCompletoQuery = await client.query(`
      SELECT
        i.codigo_insumo, i.descripcion_insumo, i.unidad,
        i.cantidad_requerida_p as cantidad_insumo, i.precio_p as precio_insumo,
        c.id as compra_id, c.anio, c.tipo_compra, c.num_compra,
        c.detalle as detalle_compra,
        COALESCE(c.unidad_und, c.unidad) as unidad_compra,
        COALESCE(c.cantidad_und, c.cantidad_c) as cantidad_compra,
        COALESCE(c.precio_und, c.precio_unit_c) as precio_compra
      FROM insumos_resumen i
      LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
      LEFT JOIN compras_c c ON m.compra_id = c.id
      ORDER BY i.codigo_insumo, i.descripcion_insumo, c.anio DESC, c.num_compra
    `);

    const ws4 = workbook.addWorksheet('4. Insumos Completo');
    ws4.columns = [
      { header: 'Código Insumo', key: 'codigo_insumo', width: 15 },
      { header: 'Descripción Insumo', key: 'descripcion_insumo', width: 35 },
      { header: 'Unidad', key: 'unidad', width: 10 },
      { header: 'Cantidad', key: 'cantidad_insumo', width: 12 },
      { header: 'Precio', key: 'precio_insumo', width: 14 },
      { header: '', key: 'separator', width: 2 },
      { header: 'ID Compra', key: 'compra_id', width: 10 },
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Tipo', key: 'tipo_compra', width: 12 },
      { header: 'N° Documento', key: 'num_compra', width: 14 },
      { header: 'Detalle Compra', key: 'detalle_compra', width: 30 },
      { header: 'Unidad', key: 'unidad_compra', width: 10 },
      { header: 'Cantidad', key: 'cantidad_compra', width: 12 },
      { header: 'Precio', key: 'precio_compra', width: 12 }
    ];

    const headerRow4 = ws4.getRow(1);
    headerRow4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF366092' } };
    headerRow4.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow4.height = 25;
    headerRow4.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    let currentInsumo4 = '';
    let rowNum4 = 2;
    let useAlternado4 = false;

    insumosCompletoQuery.rows.forEach((row: any) => {
      if (row.codigo_insumo !== currentInsumo4) {
        currentInsumo4 = row.codigo_insumo;
        useAlternado4 = !useAlternado4;
      }

      const wsRow = ws4.getRow(rowNum4);
      wsRow.values = {
        codigo_insumo: row.codigo_insumo,
        descripcion_insumo: row.descripcion_insumo,
        unidad: row.unidad || '',
        cantidad_insumo: row.cantidad_insumo || '',
        precio_insumo: row.precio_insumo || '',
        separator: '',
        compra_id: row.compra_id || '',
        anio: row.anio || '',
        tipo_compra: row.tipo_compra || '',
        num_compra: row.num_compra || '',
        detalle_compra: row.detalle_compra || '',
        unidad_compra: row.unidad_compra || '',
        cantidad_compra: row.cantidad_compra || '',
        precio_compra: row.precio_compra || ''
      };

      const bgColor = useAlternado4 ? 'FFF0F4F8' : 'FFFFFFFF';
      Array.from({ length: 14 }).forEach((_, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        addBorder(cell);

        // Formato para números
        if ([4, 5, 8, 13, 14].includes(colIdx + 1)) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          if ([5, 14].includes(colIdx + 1)) {
            cell.numFmt = '#,##0.00';
          } else if ([4, 8, 13].includes(colIdx + 1)) {
            cell.numFmt = '#,##0.0000';
          }
        }
      });

      rowNum4++;
    });

    // ═══════════════════════════════════════════════════════════════
    // HOJA 5: RESUMEN CON TOTALES Y P.U. PONDERADO
    // ═══════════════════════════════════════════════════════════════
    const resumenQuery = await client.query(`
      SELECT
        i.codigo_insumo, i.descripcion_insumo, i.unidad,
        i.cantidad_requerida_p as cantidad_insumo, i.precio_p as precio_insumo,
        c.id as compra_id, c.anio, c.tipo_compra, c.num_compra,
        c.detalle as detalle_compra,
        COALESCE(c.unidad_und, c.unidad) as unidad_compra,
        COALESCE(c.cantidad_und, c.cantidad_c) as cantidad_compra,
        COALESCE(c.precio_und, c.precio_unit_c) as precio_compra,
        SUM(COALESCE(c.cantidad_und, c.cantidad_c)) OVER (PARTITION BY i.codigo_insumo) as total_adquirido,
        SUM(COALESCE(c.cantidad_und, c.cantidad_c) * COALESCE(c.precio_und, c.precio_unit_c)) OVER (PARTITION BY i.codigo_insumo) as total_valor_adquirido,
        COUNT(c.id) OVER (PARTITION BY i.codigo_insumo) as num_compras,
        (i.cantidad_requerida_p * COUNT(c.id) OVER (PARTITION BY i.codigo_insumo)) as total_presupuestado
      FROM insumos_resumen i
      LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
      LEFT JOIN compras_c c ON m.compra_id = c.id
      ORDER BY i.codigo_insumo, i.descripcion_insumo, c.anio DESC, c.num_compra
    `);

    const ws5 = workbook.addWorksheet('5. Resumen Completo');
    ws5.columns = [
      { header: 'Código Insumo', key: 'codigo_insumo', width: 14 },
      { header: 'Descripción Insumo', key: 'descripcion_insumo', width: 30 },
      { header: 'Unidad', key: 'unidad', width: 10 },
      { header: 'Cant d', key: 'cantidad_insumo', width: 10 },
      { header: 'Precio', key: 'precio_insumo', width: 12 },
      { header: 'ID Compra', key: 'compra_id', width: 10 },
      { header: 'Año', key: 'anio', width: 8 },
      { header: 'Tipo', key: 'tipo_compra', width: 10 },
      { header: 'N° Documento', key: 'num_compra', width: 14 },
      { header: 'Detalle Compra', key: 'detalle_compra', width: 28 },
      { header: 'Unidad', key: 'unidad_compra', width: 10 },
      { header: 'Cant ad', key: 'cantidad_compra', width: 10 },
      { header: 'Precio', key: 'precio_compra', width: 12 },
      { header: 'Total Presupuestado', key: 'total_presupuestado', width: 16 },
      { header: 'Total Adquirido', key: 'total_adquirido', width: 14 },
      { header: 'P.U. Ponderado', key: 'pu_ponderado', width: 14 },
      { header: 'Precio Total Adquirido', key: 'precio_total_adquirido', width: 18 }
    ];

    const headerRow5 = ws5.getRow(1);
    headerRow5.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    headerRow5.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    headerRow5.height = 25;
    headerRow5.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

    let currentInsumo5 = '';
    let rowNum5 = 2;
    let useAlternado5 = false;
    let startRowInsumo5 = 2;

    resumenQuery.rows.forEach((row: any, idx: number) => {
      // Si cambia el insumo, fusionar las celdas del insumo anterior
      if (row.codigo_insumo !== currentInsumo5 && idx > 0) {
        if (startRowInsumo5 < rowNum5) {
          ws5.mergeCells(`N${startRowInsumo5}:N${rowNum5 - 1}`);
          ws5.mergeCells(`O${startRowInsumo5}:O${rowNum5 - 1}`);
          ws5.mergeCells(`P${startRowInsumo5}:P${rowNum5 - 1}`);
          ws5.mergeCells(`Q${startRowInsumo5}:Q${rowNum5 - 1}`);
        }
        startRowInsumo5 = rowNum5;
        currentInsumo5 = row.codigo_insumo;
        useAlternado5 = !useAlternado5;
      } else if (currentInsumo5 === '') {
        currentInsumo5 = row.codigo_insumo;
      }

      const wsRow = ws5.getRow(rowNum5);

      // Cálculos
      const totalAdquirido = row.total_adquirido || 0;
      const totalValorAdquirido = row.total_valor_adquirido || 0;
      const puPonderado = totalAdquirido > 0 ? totalValorAdquirido / totalAdquirido : 0;
      const precioTotalPorCompra = (row.cantidad_compra || 0) * (row.precio_compra || 0);

      wsRow.values = {
        codigo_insumo: row.codigo_insumo,
        descripcion_insumo: row.descripcion_insumo,
        unidad: row.unidad || '',
        cantidad_insumo: row.cantidad_insumo || '',
        precio_insumo: row.precio_insumo || '',
        compra_id: row.compra_id || '',
        anio: row.anio || '',
        tipo_compra: row.tipo_compra || '',
        num_compra: row.num_compra || '',
        detalle_compra: row.detalle_compra || '',
        unidad_compra: row.unidad_compra || '',
        cantidad_compra: row.cantidad_compra || '',
        precio_compra: row.precio_compra || '',
        total_presupuestado: row.cantidad_insumo || '',
        total_adquirido: totalAdquirido,
        pu_ponderado: puPonderado,
        precio_total_adquirido: totalValorAdquirido
      };

      const bgColor = useAlternado5 ? 'FFF0F4F8' : 'FFFFFFFF';
      Array.from({ length: 17 }).forEach((_, colIdx) => {
        const cell = wsRow.getCell(colIdx + 1);
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        addBorder(cell);

        // Formato para números
        if ([4, 5, 12, 13, 14, 15, 16, 17].includes(colIdx + 1)) {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
          cell.numFmt = '#,##0.0000';
        }

        // Alineación centrada para las celdas fusionadas
        if ([14, 15, 16, 17].includes(colIdx + 1)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
      });

      rowNum5++;
    });

    // Fusionar las celdas del último insumo
    if (startRowInsumo5 < rowNum5) {
      ws5.mergeCells(`N${startRowInsumo5}:N${rowNum5 - 1}`);
      ws5.mergeCells(`O${startRowInsumo5}:O${rowNum5 - 1}`);
      ws5.mergeCells(`P${startRowInsumo5}:P${rowNum5 - 1}`);
      ws5.mergeCells(`Q${startRowInsumo5}:Q${rowNum5 - 1}`);
    }

    // Enviar Excel
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Vinculos-Completo.xlsx"'
      }
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
