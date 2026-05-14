import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import ExcelJS from 'exceljs';

// ── Helpers de estilo ──────────────────────────────────────────────────────────

const DARK_BLUE   = 'FF1F3864';
const MID_BLUE    = 'FF2F5496';
const ORANGE      = 'FFED7D31';
const GREEN_HDR   = 'FF70AD47';
const GREEN_CELL  = 'FFE2EFDA';
const ORANGE_CELL = 'FFFCE4D6';
const YELLOW_CELL = 'FFFFD966';
const LIGHT_BLUE  = 'FFE8F0FE';
const WHITE       = 'FFFFFFFF';
const GRAY_LIGHT  = 'FFF2F2F2';
const PURPLE_HDR  = 'FF5B2D8E';
const NOTE_CELL   = 'FFF3E8FF';

function fill(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top:    { style: 'thin', color: { argb: 'FFCCCCCC' } },
  left:   { style: 'thin', color: { argb: 'FFCCCCCC' } },
  bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
  right:  { style: 'thin', color: { argb: 'FFCCCCCC' } },
};

function styleHeader(row: ExcelJS.Row, argb: string) {
  row.height = 32;
  row.eachCell(cell => {
    cell.fill      = fill(argb);
    cell.font      = { bold: true, color: { argb: WHITE }, size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = thinBorder;
  });
}

function styleDataRow(row: ExcelJS.Row, bgArgb = WHITE) {
  row.eachCell({ includeEmpty: true }, cell => {
    cell.border = thinBorder;
    cell.font   = { size: 10 };
    if (bgArgb !== WHITE) cell.fill = fill(bgArgb);
  });
}

const NUM2 = '#,##0.00';
const NUM0 = '#,##0';

// ── Handler ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const client = await pool.connect();

    const [apuRes, comprasRes, resumenRes, histRes, apuPartidaRes] = await Promise.all([
      client.query(`
        SELECT
          p.item            AS partida_codigo,
          p.descripcion     AS partida_desc,
          p.unidad          AS partida_unidad,
          p.cantidad_p      AS metrado_fijo,
          a.descripcion_insumo AS insumo_desc,
          a.unidad          AS insumo_unidad,
          a.cantidad_p      AS incidencia_original,
          a.parcial_p       AS parcial_original,
          a.cantidad_c      AS incidencia_mod,
          (a.cantidad_c * p.cantidad_p) AS cantidad_modificada,
          COALESCE((SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c)) FROM compras_c c JOIN mapeo_vinculacion m ON c.id = m.compra_id WHERE m.codigo_insumo = a.codigo_insumo), 0) AS cantidad_adquirida,
          COALESCE((SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c)) FROM compras_c c JOIN mapeo_vinculacion m ON c.id = m.compra_id WHERE m.codigo_insumo = a.codigo_insumo), 0) - (a.cantidad_c * p.cantidad_p) AS diferencia,
          ''                AS comentario
        FROM acus a
        JOIN partidas_p p ON a.item_partida = p.item
        ORDER BY p.item, a.id
      `),
      client.query(`
        SELECT
          c.detalle AS insumo_descripcion,
          c.num_compra AS orden_doc, c.detalle AS detalle_compra,
          c.unidad AS unidad_c, c.cantidad_c AS cant_c, c.precio_unit_c AS pu_c, c.total_c AS total_c,
          COALESCE(c.unidad_und, c.unidad) AS unidad_und,
          COALESCE(c.cantidad_und, c.cantidad_c) AS cantidad_und,
          COALESCE(c.precio_und, c.precio_unit_c) AS precio_und,
          '' AS observacion
        FROM compras_c c
        ORDER BY c.detalle, c.id
      `),
      client.query(`
        SELECT
          a.descripcion_insumo                                   AS insumo,
          a.unidad,
          SUM(a.parcial_p)                                       AS total_parcial_orig,
          SUM(a.cantidad_c * p.cantidad_p)                       AS total_modificado,
          COALESCE((SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c)) FROM compras_c c JOIN mapeo_vinculacion m ON c.id = m.compra_id WHERE m.codigo_insumo = a.codigo_insumo), 0) AS total_adquirido,
          COALESCE((SELECT SUM(COALESCE(c.cantidad_und, c.cantidad_c)) FROM compras_c c JOIN mapeo_vinculacion m ON c.id = m.compra_id WHERE m.codigo_insumo = a.codigo_insumo), 0) - SUM(a.cantidad_c * p.cantidad_p) AS diferencia,
          COUNT(DISTINCT a.item_partida)                         AS num_partidas
        FROM acus a
        JOIN partidas_p p ON a.item_partida = p.item
        GROUP BY a.codigo_insumo, a.descripcion_insumo, a.unidad
        ORDER BY a.descripcion_insumo
      `),
      client.query(`
        SELECT
          '2026-05-05 00:00:00' AS fecha,
          '' as usuario, '' as modulo, '' as tabla,
          '' as registro_id, '' as registro_desc, '' as campo,
          '' as valor_anterior, '' as valor_nuevo
        LIMIT 0
      `),
      client.query(`
        SELECT
          p.item            AS partida_codigo,
          p.descripcion     AS partida_desc,
          p.unidad          AS partida_unidad,
          p.cantidad_p      AS metrado_fijo,
          a.descripcion_insumo AS insumo_desc,
          a.unidad          AS insumo_unidad,
          a.cantidad_p      AS incidencia_original,
          a.parcial_p       AS parcial_original,
          (a.cantidad_c * p.cantidad_p) AS cantidad_modificada,
          false             AS es_extra
        FROM acus a
        JOIN partidas_p p ON a.item_partida = p.item
        ORDER BY p.item, a.id
      `),
    ]);
    client.release();

    // ── Workbook ──────────────────────────────────────────────────────────────
    const wb = new ExcelJS.Workbook();
    wb.creator  = 'Sistema 7_Insumos_rado';
    wb.created  = new Date();
    wb.modified = new Date();

    // ══════════════════════════════════════════════════════════════════════════
    // HOJA 1 — APU Comparativo
    // ══════════════════════════════════════════════════════════════════════════
    const wsApu = wb.addWorksheet('APU Comparativo', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    wsApu.columns = [
      { key: 'A', width: 14 },  // Código Partida
      { key: 'B', width: 40 },  // Descripción Partida
      { key: 'C', width: 8  },  // Unidad
      { key: 'D', width: 14 },  // Metrado Fijo
      { key: 'E', width: 42 },  // Insumo
      { key: 'F', width: 8  },  // Unidad Insumo
      { key: 'G', width: 16 },  // Incidencia Orig
      { key: 'H', width: 16 },  // Parcial Orig
      { key: 'I', width: 16 },  // Incidencia Mod
      { key: 'J', width: 16 },  // Parcial Mod
      { key: 'K', width: 16 },  // Adquirido
      { key: 'L', width: 14 },  // Diferencia
      { key: 'M', width: 48 },  // Comentario
    ];

    // Fila 1 — grupos de columnas
    wsApu.mergeCells('A1:D1');
    wsApu.mergeCells('E1:F1');
    wsApu.mergeCells('G1:H1');
    wsApu.mergeCells('I1:J1');
    wsApu.mergeCells('K1:L1');

    const g1 = wsApu.getRow(1);
    g1.height = 28;
    const grpStyles: [string, string][] = [
      ['A1', DARK_BLUE],
      ['E1', MID_BLUE],
      ['G1', 'FF4472C4'],
      ['I1', ORANGE],
      ['K1', GREEN_HDR],
      ['M1', PURPLE_HDR],
    ];
    const grpLabels: Record<string, string> = {
      A1: 'PARTIDA',
      E1: 'INSUMO',
      G1: 'APU ORIGINAL (Expediente Técnico)',
      I1: 'APU MODIFICADO (Cuadre Real)',
      K1: 'ADQUIRIDO / DIF.',
      M1: 'NOTAS',
    };
    for (const [addr, argb] of grpStyles) {
      const cell = wsApu.getCell(addr);
      cell.value     = grpLabels[addr];
      cell.fill      = fill(argb);
      cell.font      = { bold: true, color: { argb: WHITE }, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = thinBorder;
    }

    // Fila 2 — sub-encabezados
    wsApu.mergeCells('A2:D2');
    wsApu.mergeCells('E2:F2');
    const subHeaders: [string, string, string][] = [
      ['G2', 'Incidencia Orig.', 'FF4472C4'],
      ['H2', 'Parcial Orig.',    'FF4472C4'],
      ['I2', 'Incidencia Mod.',  ORANGE],
      ['J2', 'Parcial Mod.',     ORANGE],
      ['K2', 'Cant. Adquirida',  GREEN_HDR],
      ['L2', 'Diferencia',       GREEN_HDR],
      ['M2', 'Comentario',       PURPLE_HDR],
    ];
    wsApu.getRow(2).height = 22;
    for (const [addr, label, argb] of subHeaders) {
      const cell = wsApu.getCell(addr);
      cell.value     = label;
      cell.fill      = fill(argb);
      cell.font      = { bold: true, color: { argb: WHITE }, size: 9 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = thinBorder;
    }

    // Fila 3 — columnas detalle
    const r3 = wsApu.addRow(['Código','Desc. Partida','Und.','Metrado','Descripción Insumo','Und.','APU1','APU1','APU2','APU2','Adq.','Adq.−Mod.','Comentario']);
    styleHeader(r3, DARK_BLUE);
    // Columna comentario usa su propio color de cabecera
    const r3comentario = r3.getCell(13);
    r3comentario.fill = fill(PURPLE_HDR);
    r3comentario.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    let lastPartida = '';
    for (const row of apuRes.rows) {
      const isNew = row.partida_codigo !== lastPartida;
      lastPartida  = row.partida_codigo;
      const bg     = isNew ? 'FFF0F5FF' : WHITE;

      const comentario = row.comentario ?? '';
      const er = wsApu.addRow([
        row.partida_codigo,
        row.partida_desc,
        row.partida_unidad,
        parseFloat(row.metrado_fijo),
        row.insumo_desc,
        row.insumo_unidad,
        parseFloat(row.incidencia_original),
        parseFloat(row.parcial_original),
        parseFloat(row.incidencia_mod),
        parseFloat(row.cantidad_modificada),
        parseFloat(row.cantidad_adquirida),
        parseFloat(row.diferencia),
        comentario,
      ]);
      styleDataRow(er, bg);

      // Formato numérico columnas 4–12
      for (let c = 4; c <= 12; c++) {
        const cell = er.getCell(c);
        cell.numFmt    = NUM2;
        cell.alignment = { horizontal: 'right' };
      }

      // Color diferencia
      const dif = parseFloat(row.diferencia);
      const difCell = er.getCell(12);
      difCell.fill = fill(
        Math.abs(dif) < 0.0001 ? GREEN_CELL :
        dif < 0               ? ORANGE_CELL :
                                YELLOW_CELL
      );

      // Comentario: fondo lila si tiene contenido, texto con wrap
      const notaCell = er.getCell(13);
      notaCell.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
      if (comentario) {
        notaCell.fill = fill(NOTE_CELL);
        notaCell.font = { size: 10, italic: true, color: { argb: 'FF4B0082' } };
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HOJA 2 — Compras
    // ══════════════════════════════════════════════════════════════════════════
    const wsCompras = wb.addWorksheet('Compras', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    wsCompras.columns = [
      { key: 'a', width: 42 }, // Insumo
      { key: 'b', width: 20 }, // Orden/Doc
      { key: 'c', width: 36 }, // Detalle
      { key: 'd', width: 10 }, // Und Orig
      { key: 'e', width: 14 }, // Cant Orig
      { key: 'f', width: 14 }, // PU (S/)
      { key: 'g', width: 16 }, // Total Orig
      { key: 'h', width: 12 }, // Und Norm.
      { key: 'i', width: 14 }, // Cant Norm.
      { key: 'j', width: 14 }, // PU Norm.
      { key: 'k', width: 16 }, // Total Norm.
      { key: 'l', width: 32 }, // Observación
    ];

    const rC1 = wsCompras.addRow([
      'INSUMO','ORDEN/DOC','DETALLE',
      'UND ORIG','CANT ORIG','PU ORIG (S/)','TOTAL ORIG (S/)',
      'UND NORM.','CANT NORM.','PU NORM. (S/)','TOTAL NORM. (S/)',
      'OBSERVACIÓN',
    ]);
    styleHeader(rC1, DARK_BLUE);

    let lastInsumo = '';
    for (const row of comprasRes.rows) {
      const isNew = row.insumo_descripcion !== lastInsumo;
      lastInsumo   = row.insumo_descripcion;

      const cantNorm  = parseFloat(row.cantidad_und);
      const puNorm    = parseFloat(row.precio_und);
      const totalNorm = cantNorm * puNorm;

      const er = wsCompras.addRow([
        row.insumo_descripcion,
        row.orden_doc,
        row.detalle_compra,
        row.unidad_c,
        parseFloat(row.cant_c),
        parseFloat(row.pu_c),
        parseFloat(row.total_c),
        row.unidad_und,
        cantNorm,
        puNorm,
        totalNorm,
        row.observacion ?? '',
      ]);
      styleDataRow(er);

      if (isNew) {
        er.getCell(1).fill = fill(LIGHT_BLUE);
        er.getCell(1).font = { bold: true, size: 10 };
      }

      // Orden/Doc (col 2) sin decimales; resto de numéricos con 2 decimales
      er.getCell(2).numFmt    = NUM0;
      er.getCell(2).alignment = { horizontal: 'center' };
      for (const c of [5,6,7,9,10,11]) {
        er.getCell(c).numFmt    = NUM2;
        er.getCell(c).alignment = { horizontal: 'right' };
      }

      // Resaltar si la unidad normalizada difiere de la original
      if (row.unidad_c !== row.unidad_und) {
        er.getCell(8).fill  = fill(ORANGE_CELL);
        er.getCell(9).fill  = fill(ORANGE_CELL);
        er.getCell(10).fill = fill(ORANGE_CELL);
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HOJA 3 — Resumen por Insumo
    // ══════════════════════════════════════════════════════════════════════════
    const wsResumen = wb.addWorksheet('Resumen por Insumo', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    wsResumen.columns = [
      { key: 'a', width: 52 },
      { key: 'b', width: 10 },
      { key: 'c', width: 20 },
      { key: 'd', width: 20 },
      { key: 'e', width: 20 },
      { key: 'f', width: 18 },
      { key: 'g', width: 14 },
    ];

    const rR1 = wsResumen.addRow([
      'INSUMO','UND',
      'TOTAL PARCIAL ORIG.','TOTAL MODIFICADO','TOTAL ADQUIRIDO',
      'DIFERENCIA','N° PARTIDAS',
    ]);
    styleHeader(rR1, DARK_BLUE);

    for (const row of resumenRes.rows) {
      const orig = parseFloat(row.total_parcial_orig);
      const mod  = parseFloat(row.total_modificado);
      const adq  = parseFloat(row.total_adquirido);
      const dif  = parseFloat(row.diferencia);

      const er = wsResumen.addRow([
        row.insumo, row.unidad,
        orig, mod, adq, dif,
        parseInt(row.num_partidas),
      ]);
      styleDataRow(er);

      for (let c = 3; c <= 6; c++) {
        er.getCell(c).numFmt    = NUM2;
        er.getCell(c).alignment = { horizontal: 'right' };
      }
      er.getCell(7).alignment = { horizontal: 'center' };

      er.getCell(6).fill = fill(
        Math.abs(dif) < 0.0001 ? GREEN_CELL :
        dif < 0               ? ORANGE_CELL :
                                YELLOW_CELL
      );
    }

    // Fila de totales
    const totalRow = wsResumen.addRow([
      'TOTAL GENERAL', '',
      { formula: `SUM(C2:C${wsResumen.rowCount})` },
      { formula: `SUM(D2:D${wsResumen.rowCount})` },
      { formula: `SUM(E2:E${wsResumen.rowCount})` },
      { formula: `SUM(F2:F${wsResumen.rowCount})` },
      { formula: `SUM(G2:G${wsResumen.rowCount})` },
    ]);
    totalRow.eachCell(cell => {
      cell.fill   = fill(YELLOW_CELL);
      cell.font   = { bold: true, size: 10 };
      cell.border = thinBorder;
    });
    for (let c = 3; c <= 6; c++) {
      totalRow.getCell(c).numFmt = NUM2;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HOJA 4 — Historial de Cambios
    // ══════════════════════════════════════════════════════════════════════════
    const wsHist = wb.addWorksheet('Historial de Cambios', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
    });

    wsHist.columns = [
      { key: 'a', width: 22 }, // Fecha
      { key: 'b', width: 18 }, // Usuario
      { key: 'c', width: 18 }, // Módulo
      { key: 'd', width: 14 }, // Tabla
      { key: 'e', width: 12 }, // ID
      { key: 'f', width: 42 }, // Descripción registro
      { key: 'g', width: 20 }, // Campo
      { key: 'h', width: 22 }, // Valor anterior
      { key: 'i', width: 22 }, // Valor nuevo
    ];

    const rH1 = wsHist.addRow([
      'FECHA / HORA','USUARIO','MÓDULO','TABLA',
      'ID REGISTRO','DESCRIPCIÓN REGISTRO',
      'CAMPO','VALOR ANTERIOR','VALOR NUEVO',
    ]);
    styleHeader(rH1, DARK_BLUE);

    let altH = false;
    for (const row of histRes.rows) {
      const er = wsHist.addRow([
        row.fecha, row.usuario, row.modulo, row.tabla,
        row.registro_id, row.registro_desc,
        row.campo, row.valor_anterior, row.valor_nuevo,
      ]);
      styleDataRow(er, altH ? GRAY_LIGHT : WHITE);
      altH = !altH;

      // Resaltar celda "valor nuevo" en verde claro
      er.getCell(9).fill = fill(GREEN_CELL);
    }

    if (histRes.rows.length === 0) {
      const er = wsHist.addRow(['Sin cambios registrados aún.']);
      er.getCell(1).font = { italic: true, color: { argb: 'FF999999' } };
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HOJA 5 — Resumen APU por Partida
    // ══════════════════════════════════════════════════════════════════════════
    const wsPartidaApu = wb.addWorksheet('Resumen APU por Partida', {
      views: [{ state: 'frozen', xSplit: 0, ySplit: 3 }],
      pageSetup: { orientation: 'landscape', fitToPage: true },
    });

    wsPartidaApu.columns = [
      { key: 'A', width: 14 },  // Código Partida
      { key: 'B', width: 40 },  // Descripción Partida
      { key: 'C', width: 10 },  // Unidad Partida
      { key: 'D', width: 14 },  // Metrado Fijo
      { key: 'E', width: 42 },  // Insumo
      { key: 'F', width: 10 },  // Unidad Insumo
      { key: 'G', width: 16 },  // APU Antiguo
      { key: 'H', width: 16 },  // APU Nuevo
      { key: 'I', width: 16 },  // Diferencia
      { key: 'J', width: 12 },  // Tipo (Extra)
    ];

    // Fila 1 — grupos de columnas
    wsPartidaApu.mergeCells('A1:D1');
    wsPartidaApu.mergeCells('E1:F1');
    wsPartidaApu.mergeCells('G1:I1');

    const r1p = wsPartidaApu.getRow(1);
    r1p.height = 28;
    const grpStylesP: [string, string][] = [
      ['A1', DARK_BLUE],
      ['E1', MID_BLUE],
      ['G1', 'FF4472C4'],
      ['J1', PURPLE_HDR],
    ];
    const grpLabelsP: Record<string, string> = {
      A1: 'PARTIDA',
      E1: 'INSUMO',
      G1: 'APU COMPARATIVO',
      J1: 'ESTADO',
    };
    for (const [addr, argb] of grpStylesP) {
      const cell = wsPartidaApu.getCell(addr);
      cell.value     = grpLabelsP[addr];
      cell.fill      = fill(argb);
      cell.font      = { bold: true, color: { argb: WHITE }, size: 10 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = thinBorder;
    }

    // Fila 2 — sub-encabezados
    wsPartidaApu.mergeCells('A2:D2');
    wsPartidaApu.mergeCells('E2:F2');
    const subHeadersP: [string, string, string][] = [
      ['G2', 'APU Antiguo', 'FF4472C4'],
      ['H2', 'APU Nuevo', 'FF4472C4'],
      ['I2', 'Diferencia', 'FF4472C4'],
      ['J2', 'Tipo', PURPLE_HDR],
    ];
    wsPartidaApu.getRow(2).height = 22;
    for (const [addr, label, argb] of subHeadersP) {
      const cell = wsPartidaApu.getCell(addr);
      cell.value     = label;
      cell.fill      = fill(argb);
      cell.font      = { bold: true, color: { argb: WHITE }, size: 9 };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border    = thinBorder;
    }

    // Fila 3 — columnas detalle
    const r3p = wsPartidaApu.addRow(['Código','Desc. Partida','Und.','Metrado','Descripción Insumo','Und.','APU1','APU2','APU2−APU1','Tipo']);
    styleHeader(r3p, DARK_BLUE);
    const r3p_tipo = r3p.getCell(10);
    r3p_tipo.fill = fill(PURPLE_HDR);

    let lastPartidaP = '';
    let partidaRowNum = 4;
    for (const row of apuPartidaRes.rows) {
      const isNewPartida = row.partida_codigo !== lastPartidaP;
      lastPartidaP = row.partida_codigo;
      const bg = isNewPartida ? 'FFF0F5FF' : WHITE;

      const apuAntiguo = parseFloat(row.parcial_original);
      const apuNuevo = parseFloat(row.cantidad_modificada);
      const diferencia = apuNuevo - apuAntiguo;

      const erP = wsPartidaApu.addRow([
        row.partida_codigo,
        row.partida_desc,
        row.partida_unidad,
        parseFloat(row.metrado_fijo),
        row.insumo_desc,
        row.insumo_unidad,
        apuAntiguo,
        apuNuevo,
        diferencia,
        row.es_extra ? 'Extra' : 'Original',
      ]);
      styleDataRow(erP, bg);

      // Formato numérico columnas 4, 7–9
      for (const c of [4, 7, 8, 9]) {
        const cell = erP.getCell(c);
        cell.numFmt    = NUM2;
        cell.alignment = { horizontal: 'right' };
      }

      // Tipo: centrado
      erP.getCell(10).alignment = { horizontal: 'center' };

      // Resaltar si es extra
      if (row.es_extra) {
        erP.getCell(10).fill = fill(YELLOW_CELL);
        erP.getCell(10).font = { bold: true, size: 9 };
      }

      // Color diferencia: verde si ~0, naranja si negativa, amarilla si positiva
      const difCell = erP.getCell(9);
      difCell.fill = fill(
        Math.abs(diferencia) < 0.0001 ? GREEN_CELL :
        diferencia < 0                ? ORANGE_CELL :
                                        YELLOW_CELL
      );

      partidaRowNum++;
    }

    // ── Generar buffer y devolver respuesta ───────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();
    const today  = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="7_insumos_rado_${today}.xlsx"`,
        'Cache-Control':       'no-store',
      },
    });
  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
