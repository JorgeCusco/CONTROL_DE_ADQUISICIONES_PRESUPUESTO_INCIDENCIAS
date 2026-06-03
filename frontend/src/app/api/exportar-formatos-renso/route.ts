import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import pool from '@/lib/db';

const generateDenominacionSheet = (workbook: ExcelJS.Workbook, sheetName: string, rows: any[]) => {
  const wsDenominacion = workbook.addWorksheet(sheetName);
  
  // Ancho de columnas para asimilarse a la imagen
  wsDenominacion.columns = [
    { width: 3 },    // A: Margen
    { width: 15 },   // B: ITEMs / INSUMO
    { width: 50 },   // C: PARTIDAS / Nombre Original
    { width: 20 },   // D: CAMBIO A: / Recuadro
    { width: 45 }    // E: SUSTENTO / Nuevo Nombre / Recuadro
  ];

  // Título Principal
  const titleRow = wsDenominacion.getRow(2);
  titleRow.values = ['', 'ESTANDARIZACION DE DENOMINACION DE INSUMOS', '', '', ''];
  wsDenominacion.mergeCells('B2:E2');
  titleRow.getCell(2).font = { bold: true, size: 10 };
  titleRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92FA92' } }; // Verde Claro
  
  // Bordes para el título
  for (let c = 2; c <= 5; c++) {
    titleRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  }
  titleRow.height = 25;

  // Cabecera Secundaria (Fila 3)
  const headerRow = wsDenominacion.getRow(3);
  headerRow.values = ['', 'ITEMs', 'PARTIDAS', 'SUSTENTO', ''];
  wsDenominacion.mergeCells('D3:E3');
  headerRow.font = { bold: true, size: 9 };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 5; c++) {
    headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; // Gris claro
    headerRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  }
  headerRow.height = 20;

  // Agrupar datos por insumo
  const insumosMap = new Map();
  rows.forEach(row => {
    if (!insumosMap.has(row.codigo_insumo)) {
      insumosMap.set(row.codigo_insumo, {
        nombre_original: row.nombre_original,
        nombre_oficial: row.nombre_oficial,
        partidas: []
      });
    }
    insumosMap.get(row.codigo_insumo).partidas.push({
      item: row.partida_item,
      desc: row.partida_desc
    });
  });

  let currentRow = 4;

  Array.from(insumosMap.values()).forEach((ins: any) => {
    // Fila Padre del Insumo
    const insumoRow = wsDenominacion.getRow(currentRow);
    insumoRow.values = ['', 'INSUMO', ins.nombre_original, 'CAMBIO A:', ins.nombre_oficial];
    
    // Estilos Fila Insumo
    insumoRow.font = { size: 9 };
    insumoRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    insumoRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    insumoRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
    insumoRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    
    // Colores según imagen
    const lightOrange = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFDE0C6' } };
    const yellowFluor = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD4FF00' } };
    
    insumoRow.getCell(2).fill = lightOrange;
    insumoRow.getCell(3).fill = lightOrange; 
    insumoRow.getCell(4).fill = yellowFluor;
    insumoRow.getCell(5).fill = lightOrange;

    for (let c = 2; c <= 5; c++) {
      insumoRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
    
    currentRow++;

    // Variables para combinar Sustento (celda vacía inferior a nombre oficial)
    const startSustentoRow = currentRow;

    // Filas Hijas (Partidas)
    ins.partidas.forEach((p: any) => {
      const partidaRow = wsDenominacion.getRow(currentRow);
      partidaRow.values = ['', p.item, p.desc, '', ''];
      
      partidaRow.font = { size: 9 };
      partidaRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      
      // Bordes a la izquierda
      partidaRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      partidaRow.getCell(3).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      
      currentRow++;
    });

    // Combinar áreas de debajo de "CAMBIO A:" y "Nuevo Nombre"
    if (currentRow > startSustentoRow) {
      // Columna D (Debajo de CAMBIO A:)
      wsDenominacion.mergeCells(`D${startSustentoRow}:D${currentRow - 1}`);
      const sustentoD = wsDenominacion.getCell(`D${startSustentoRow}`);
      sustentoD.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      
      // Columna E (Debajo de Nuevo Nombre)
      wsDenominacion.mergeCells(`E${startSustentoRow}:E${currentRow - 1}`);
      const sustentoE = wsDenominacion.getCell(`E${startSustentoRow}`);
      sustentoE.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      sustentoE.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
    }
  });
};

const generatePreciosSheet = (workbook: ExcelJS.Workbook, sheetName: string, rows: any[], comprasRows: any[]) => {
  const wsPrecios = workbook.addWorksheet(sheetName);
  
  wsPrecios.columns = [
    { width: 3 },    // A: Margen
    { width: 15 },   // B: ITEMs / INSUMO
    { width: 50 },   // C: PARTIDAS / Nombre
    { width: 15 },   // D: Precios Viejos
    { width: 15 },   // E: CAMBIO A:
    { width: 15 },   // F: Precio Nuevo
    { width: 45 }    // G: PONDERADO DE O/C / SUSTENTO
  ];

  // Título Principal
  const titleRow = wsPrecios.getRow(2);
  titleRow.values = ['', 'ESTANDARIZACION DE PRECIOS DE INSUMOS', '', '', '', '', ''];
  wsPrecios.mergeCells('B2:G2');
  titleRow.getCell(2).font = { bold: true, size: 10 };
  titleRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92FA92' } }; 
  
  for (let c = 2; c <= 7; c++) {
    titleRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  }
  titleRow.height = 25;

  // Cabecera Secundaria (Fila 3)
  const headerRow = wsPrecios.getRow(3);
  headerRow.values = ['', 'ITEMs', 'PARTIDAS', 'SUSTENTO', '', '', ''];
  wsPrecios.mergeCells('D3:G3');
  headerRow.font = { bold: true, size: 9 };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 7; c++) {
    headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    headerRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  }
  headerRow.height = 20;

  // Mapa de compras
  const comprasMap = new Map();
  comprasRows.forEach(c => {
    if (!comprasMap.has(c.codigo_insumo)) comprasMap.set(c.codigo_insumo, new Set());
    if (c.precio_und !== null && c.precio_und !== undefined) {
       comprasMap.get(c.codigo_insumo).add(Number(c.precio_und));
    }
  });

  // Agrupar datos por insumo
  const insumosMap = new Map();
  rows.forEach(row => {
    if (!insumosMap.has(row.codigo_insumo)) {
      insumosMap.set(row.codigo_insumo, {
        codigo_insumo: row.codigo_insumo,
        nombre_oficial: row.nombre_oficial,
        unidad: row.unidad,
        precios_antiguos: new Set(),
        total_parcial_mod: 0,
        total_cant_mod: 0,
        partidas: []
      });
    }
    const ins = insumosMap.get(row.codigo_insumo);
    if (row.precio_antiguo !== null && row.precio_antiguo !== undefined) {
      ins.precios_antiguos.add(Number(row.precio_antiguo));
    }
    ins.total_parcial_mod += Number(row.parcial_mod) || 0;
    ins.total_cant_mod += Number(row.cant_mod) || 0;
    
    ins.partidas.push({
      item: row.partida_item,
      desc: row.partida_desc
    });
  });

  let currentRow = 4;

  Array.from(insumosMap.values()).forEach((ins: any) => {
    let precioNuevo = ins.total_cant_mod > 0 ? ins.total_parcial_mod / ins.total_cant_mod : 0;
    if (ins.unidad && ins.unidad.includes('%')) {
        precioNuevo = ins.total_cant_mod > 0 ? (ins.total_parcial_mod * 100) / ins.total_cant_mod : 0;
    }

    // Definir los precios vinculados a usar
    let preciosList = Array.from(comprasMap.get(ins.codigo_insumo) || new Set());
    if (preciosList.length === 0) {
       preciosList = Array.from(ins.precios_antiguos);
    }
    if (preciosList.length === 0) preciosList = [0];

    const startInsumoRow = currentRow;

    preciosList.forEach((precio, idx) => {
      const isFirst = idx === 0;
      const insumoRow = wsPrecios.getRow(currentRow);
      insumoRow.values = [
        '', 
        isFirst ? 'INSUMO' : '', 
        isFirst ? ins.nombre_oficial : '', 
        `S/ ${Number(precio).toFixed(2)}`, 
        isFirst ? 'CAMBIO A:' : '', 
        isFirst ? `S/ ${precioNuevo.toFixed(2)}` : '', 
        isFirst ? 'PONDERADO DE O/C' : ''
      ];
      
      insumoRow.font = { size: 9 };
      const lightOrange = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFDE0C6' } };
      const yellowFluor = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD4FF00' } };
      
      for (let c = 2; c <= 7; c++) {
        insumoRow.getCell(c).fill = (c === 5) ? yellowFluor : lightOrange;
        insumoRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        insumoRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
      
      currentRow++;
    });

    if (preciosList.length > 1) {
       wsPrecios.mergeCells(`B${startInsumoRow}:B${currentRow - 1}`);
       wsPrecios.mergeCells(`C${startInsumoRow}:C${currentRow - 1}`);
       wsPrecios.mergeCells(`E${startInsumoRow}:E${currentRow - 1}`);
       wsPrecios.mergeCells(`F${startInsumoRow}:F${currentRow - 1}`);
       wsPrecios.mergeCells(`G${startInsumoRow}:G${currentRow - 1}`);
    }

    const startSustentoRow = currentRow;

    ins.partidas.forEach((p: any) => {
      const partidaRow = wsPrecios.getRow(currentRow);
      partidaRow.values = ['', p.item, p.desc, '', '', '', ''];
      
      partidaRow.font = { size: 9 };
      partidaRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      
      partidaRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      partidaRow.getCell(3).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      
      currentRow++;
    });

    if (currentRow > startSustentoRow) {
      wsPrecios.mergeCells(`D${startSustentoRow}:G${currentRow - 1}`);
      const sustentoCell = wsPrecios.getCell(`D${startSustentoRow}`);
      sustentoCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      sustentoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
  });
};

const generateUnidadesSheet = (workbook: ExcelJS.Workbook, sheetName: string, rows: any[]) => {
  const ws = workbook.addWorksheet(sheetName);
  
  ws.columns = [
    { width: 3 },    // A: Margen
    { width: 15 },   // B: ITEMs / MATERIAL
    { width: 50 },   // C: PARTIDAS / Nombre
    { width: 15 },   // D: Unidad Antigua
    { width: 15 },   // E: CAMBIO A:
    { width: 15 },   // F: Unidad Nueva
    { width: 45 }    // G: SUSTENTO
  ];

  const titleRow = ws.getRow(2);
  titleRow.values = ['', 'ESTANDARIZACION DE UNIDADES DE INSUMOS', '', '', '', '', ''];
  ws.mergeCells('B2:G2');
  titleRow.getCell(2).font = { bold: true, size: 10 };
  titleRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92FA92' } }; 
  for (let c = 2; c <= 7; c++) titleRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  titleRow.height = 25;

  const headerRow = ws.getRow(3);
  headerRow.values = ['', 'ITEMs', 'PARTIDAS', '', '', '', 'SUSTENTO'];
  headerRow.font = { bold: true, size: 9 };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  for (let c = 2; c <= 7; c++) {
    headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
    headerRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  }
  headerRow.height = 20;

  const insumosMap = new Map();
  rows.forEach(row => {
    if (!insumosMap.has(row.codigo_insumo)) {
      insumosMap.set(row.codigo_insumo, {
        codigo_insumo: row.codigo_insumo,
        nombre_oficial: row.nombre_oficial,
        unidad_antigua: row.unidad_antigua,
        unidad_nueva: row.unidad_nueva,
        partidas: []
      });
    }
    insumosMap.get(row.codigo_insumo).partidas.push({
      item: row.partida_item,
      desc: row.partida_desc
    });
  });

  let currentRow = 4;
  Array.from(insumosMap.values()).forEach((ins: any) => {
    const isEquipo = String(ins.codigo_insumo).startsWith('03');
    const tipoLabel = isEquipo ? 'EQUIPO:' : 'MATERIAL:';
    
    const insumoRow = ws.getRow(currentRow);
    insumoRow.values = ['', tipoLabel, ins.nombre_oficial, ins.unidad_antigua, 'CAMBIO A:', ins.unidad_nueva, ''];
    insumoRow.font = { size: 9 };
    
    const lightOrange = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFDE0C6' } };
    const yellowFluor = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFD4FF00' } };
    
    insumoRow.getCell(2).fill = lightOrange;
    insumoRow.getCell(3).fill = lightOrange;
    insumoRow.getCell(4).fill = lightOrange;
    insumoRow.getCell(5).fill = yellowFluor;
    insumoRow.getCell(6).fill = lightOrange;

    for (let c = 2; c <= 6; c++) {
      insumoRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      insumoRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
    
    const startSustentoRow = currentRow;
    currentRow++;

    ins.partidas.forEach((p: any) => {
      const partidaRow = ws.getRow(currentRow);
      partidaRow.values = ['', p.item, p.desc, '', '', '', ''];
      partidaRow.font = { size: 9 };
      partidaRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      partidaRow.getCell(3).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      currentRow++;
    });

    if (currentRow > startSustentoRow) {
      ws.mergeCells(`G${startSustentoRow}:G${currentRow - 1}`);
      const sustentoCell = ws.getCell(`G${startSustentoRow}`);
      sustentoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1F2D1' } };
      sustentoCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
  });
};

const generateIncidenciasSheet = (workbook: ExcelJS.Workbook, sheetName: string, rows: any[]) => {
  const ws = workbook.addWorksheet(sheetName);
  
  ws.columns = [
    { width: 3 },    // A
    { width: 15 },   // B: ITEMs
    { width: 50 },   // C: PARTIDAS
    { width: 15 },   // D: INCIDENCIA ANT
    { width: 15 },   // E: INCIDENCIA ACT
    { width: 45 }    // F: SUSTENTO
  ];

  const titleRow = ws.getRow(2);
  titleRow.values = ['', 'ACTUALIZACION DE INCIDENCIAS EN ACUs', '', '', '', ''];
  ws.mergeCells('B2:F2');
  titleRow.getCell(2).font = { bold: true, size: 10 };
  titleRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92FA92' } }; 
  for (let c = 2; c <= 6; c++) titleRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
  titleRow.height = 25;

  const insumosMap = new Map();
  rows.forEach(row => {
    if (!insumosMap.has(row.codigo_insumo)) {
      insumosMap.set(row.codigo_insumo, {
        codigo_insumo: row.codigo_insumo,
        nombre_oficial: row.nombre_oficial,
        unidad: row.unidad,
        partidas: []
      });
    }
    insumosMap.get(row.codigo_insumo).partidas.push({
      item: row.partida_item,
      desc: row.partida_desc,
      incidencia_ant: row.incidencia_anterior,
      incidencia_act: row.incidencia_actualizada
    });
  });

  let currentRow = 4;
  Array.from(insumosMap.values()).forEach((ins: any) => {
    const insumoRow = ws.getRow(currentRow);
    insumoRow.values = ['', ins.nombre_oficial, '', '', '', `UND: ${ins.unidad}`];
    insumoRow.font = { bold: true, size: 9 };
    ws.mergeCells(`B${currentRow}:E${currentRow}`);
    const lightOrange = { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFDE0C6' } };
    
    insumoRow.getCell(2).fill = lightOrange;
    insumoRow.getCell(6).fill = lightOrange;
    insumoRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    insumoRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle' };
    
    for (let c = 2; c <= 6; c++) insumoRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    currentRow++;

    const headerRow = ws.getRow(currentRow);
    headerRow.values = ['', 'ITEMs', 'PARTIDAS', 'INCIDENCIA\nANTERIOR', 'INCIDENCIA\nACTUALIZADA', 'SUSTENTO'];
    headerRow.font = { bold: true, size: 9 };
    headerRow.height = 30;
    
    for (let c = 2; c <= 6; c++) {
      headerRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE0C6' } };
      headerRow.getCell(c).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
    }
    currentRow++;

    const startSustentoRow = currentRow;

    ins.partidas.forEach((p: any) => {
      const partidaRow = ws.getRow(currentRow);
      partidaRow.values = ['', p.item, p.desc, Number(p.incidencia_ant).toFixed(4), Number(p.incidencia_act).toFixed(4), ''];
      partidaRow.font = { size: 9 };
      partidaRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
      partidaRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
      partidaRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
      for (let c = 2; c <= 5; c++) partidaRow.getCell(c).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      currentRow++;
    });

    if (currentRow > startSustentoRow) {
      ws.mergeCells(`F${startSustentoRow}:F${currentRow - 1}`);
      const sustentoCell = ws.getCell(`F${startSustentoRow}`);
      sustentoCell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      sustentoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    }
    currentRow++; 
  });
};

export async function GET() {
  try {
    const client = await pool.connect();

    // 1. Insumos QUE CAMBIARON
    const resultCambiaron = await client.query(`
      SELECT 
             i.codigo as codigo_insumo,
             MAX(i.descripcion) as nombre_original,
             MAX(a.descripcion_insumo) as nombre_oficial,
             p.item as partida_item,
             p.descripcion as partida_desc
      FROM acus a
      JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE i.descripcion != a.descripcion_insumo
      GROUP BY i.codigo, p.item, p.descripcion
      ORDER BY i.codigo, p.item
    `);

    // 2. Insumos QUE NO CAMBIARON
    const resultNoCambiaron = await client.query(`
      SELECT 
             i.codigo as codigo_insumo,
             MAX(i.descripcion) as nombre_original,
             MAX(a.descripcion_insumo) as nombre_oficial,
             p.item as partida_item,
             p.descripcion as partida_desc
      FROM acus a
      JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE i.descripcion = a.descripcion_insumo
      AND EXISTS (SELECT 1 FROM acus a2 WHERE a2.codigo_insumo = i.codigo AND a2.item_partida LIKE 'OE.6%')
      GROUP BY i.codigo, p.item, p.descripcion
      ORDER BY i.codigo, p.item
    `);

    // 3. Precios de TODOS los insumos
    const resultPrecios = await client.query(`
      SELECT 
             i.codigo as codigo_insumo,
             MAX(a.descripcion_insumo) as nombre_oficial,
             p.item as partida_item,
             p.descripcion as partida_desc,
             a.precio_p as precio_antiguo,
             SUM(a.parcial_p) as parcial_orig,
             SUM(a.cantidad_p) as cant_orig,
             SUM(COALESCE(a.cantidad_c, a.cantidad_p)) as cant_mod,
             SUM(COALESCE(a.parcial_c, a.parcial_p)) as parcial_mod,
             MAX(a.unidad) as unidad
      FROM acus a
      JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE EXISTS (SELECT 1 FROM acus a2 WHERE a2.codigo_insumo = i.codigo AND a2.item_partida LIKE 'OE.6%')
      GROUP BY i.codigo, p.item, p.descripcion, a.precio_p
      ORDER BY i.codigo, p.item
    `);

    // 4. Precios de compras vinculadas
    const resultCompras = await client.query(`
      SELECT m.codigo_insumo, c.precio_und
      FROM mapeo_vinculacion m
      JOIN compras_c c ON m.compra_id = c.id
      WHERE EXISTS (SELECT 1 FROM acus a2 WHERE a2.codigo_insumo = m.codigo_insumo AND a2.item_partida LIKE 'OE.6%')
    `);

    // 5. Unidades cambiadas
    const resultUnidades = await client.query(`
      SELECT 
             i.codigo as codigo_insumo,
             MAX(a.descripcion_insumo) as nombre_oficial,
             p.item as partida_item,
             p.descripcion as partida_desc,
             i.unidad as unidad_antigua,
             MAX(a.unidad) as unidad_nueva
      FROM acus a
      JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE LOWER(TRIM(i.unidad)) != LOWER(TRIM(a.unidad))
      AND EXISTS (SELECT 1 FROM acus a2 WHERE a2.codigo_insumo = i.codigo AND a2.item_partida LIKE 'OE.6%')
      GROUP BY i.codigo, p.item, p.descripcion, i.unidad
      ORDER BY i.codigo, p.item
    `);

    // 6. Incidencias cambiadas
    const resultIncidencias = await client.query(`
      SELECT 
             i.codigo as codigo_insumo,
             MAX(a.descripcion_insumo) as nombre_oficial,
             MAX(a.unidad) as unidad,
             p.item as partida_item,
             p.descripcion as partida_desc,
             a.cantidad_p as incidencia_anterior,
             a.cantidad_c as incidencia_actualizada
      FROM acus a
      JOIN insumos_p i ON a.codigo_insumo = i.codigo
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE COALESCE(a.cantidad_p,0) != COALESCE(a.cantidad_c,0) AND a.cantidad_c IS NOT NULL
      AND EXISTS (SELECT 1 FROM acus a2 WHERE a2.codigo_insumo = i.codigo AND a2.item_partida LIKE 'OE.6%')
      GROUP BY i.codigo, p.item, p.descripcion, a.cantidad_p, a.cantidad_c
      ORDER BY i.codigo, p.item
    `);

    client.release();

    const workbook = new ExcelJS.Workbook();
    
    // generateDenominacionSheet(workbook, 'E. DENOMINACION', resultCambiaron.rows);
    generateDenominacionSheet(workbook, 'E. DENOMINACION', resultNoCambiaron.rows);
    generatePreciosSheet(workbook, 'E. PRECIOS', resultPrecios.rows, resultCompras.rows);
    generateUnidadesSheet(workbook, 'E. UNIDADES', resultUnidades.rows);
    generateIncidenciasSheet(workbook, 'ACT. DE INCIDENCIAS', resultIncidencias.rows);

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `formatos-actualizacion-renso-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export Formatos Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
