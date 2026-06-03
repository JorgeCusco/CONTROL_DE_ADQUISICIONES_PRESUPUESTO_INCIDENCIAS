const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: './frontend/.env'});

const pool = new Pool({
  user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT, ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        m.id as vinculo_id,
        m.codigo_insumo,
        c.id as compra_id,
        c.tipo_compra,
        c.num_compra,
        c.anio,
        c.detalle as compra_detalle,
        c.unidad_und as unidad,
        c.cantidad_und as cantidad,
        c.precio_und as precio_unit,
        (c.cantidad_und * c.precio_und) as total
      FROM mapeo_vinculacion m
      LEFT JOIN insumos_p i ON m.codigo_insumo = i.codigo
      LEFT JOIN compras_c c ON m.compra_id = c.id
      WHERE i.codigo IS NULL
      ORDER BY m.codigo_insumo, c.id DESC
    `);
    
    console.log(`Successfully fetched ${res.rows.length} orphaned linkages.`);
    
    // Create CSV content
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel
    csvContent += 'ID Vínculo,Código Insumo Mapeado,ID Compra,Tipo Compra,Número Documento,Año,Detalle Compra,Unidad,Cantidad,Precio Unitario,Total\n';
    
    res.rows.forEach(row => {
      csvContent += [
        row.vinculo_id,
        `"${row.codigo_insumo}"`,
        row.compra_id || '',
        `"${row.tipo_compra || ''}"`,
        `"${row.num_compra || ''}"`,
        row.anio || '',
        `"${(row.compra_detalle || '').replace(/"/g, '""')}"`,
        `"${row.unidad || ''}"`,
        row.cantidad || 0,
        row.precio_unit || 0,
        row.total || 0
      ].join(',') + '\n';
    });

    const artifactsDir = 'C:\\Users\\Legion\\.gemini\\antigravity\\brain\\8e4668ac-4bc2-4295-a479-deaa6112c307\\artifacts';
    
    if (!fs.existsSync(artifactsDir)){
      fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const csvPath = path.join(artifactsDir, 'compras_huerfanas_vinculadas.csv');
    fs.writeFileSync(csvPath, csvContent, 'utf8');
    console.log("CSV generated at:", csvPath);

    // Create Markdown Table content
    let mdContent = `# Reporte de Vinculaciones Huérfanas (Catálogo Recuperado)\n\n`;
    mdContent += `Este reporte contiene el listado de las **${res.rows.length} vinculaciones** registradas en la base de datos que apuntan a códigos de insumos manuales/especiales que ya no figuran en el catálogo del presupuesto actual.\n\n`;
    mdContent += `> [!NOTE]\n`;
    mdContent += `> El archivo Excel plano correspondiente ha sido exportado directamente a tu carpeta de artefactos de esta conversación: [compras_huerfanas_vinculadas.csv](file:///C:/Users/Legion/.gemini/antigravity/brain/8e4668ac-4bc2-4295-a479-deaa6112c307/artifacts/compras_huerfanas_vinculadas.csv).\n\n`;
    
    mdContent += `### Resumen por Código de Insumo Huérfano\n\n`;
    mdContent += `| Código Insumo | Cantidad de Compras Vinculadas | Tipo de Material / Servicio Asociado |\n`;
    mdContent += `| :--- | :---: | :--- |\n`;
    mdContent += `| **999999983** | 12 compras | Equipos de oficina, escritorios y mobiliario. |\n`;
    mdContent += `| **999999984** | 54 compras | Pernos, tornillos autorroscantes, arandelas y ferretería general. |\n`;
    mdContent += `| **999999985** | 53 compras | Herramientas manuales auxiliares y consumibles de taller. |\n`;
    mdContent += `| **999999986** | 56 compras | Elementos de seguridad personal (EPPs, señalizaciones de obra). |\n`;
    mdContent += `| **999999996** | 17 compras | Servicios de terceros, cuaderno de obra legalizado, trámites administrativos. |\n`;
    mdContent += `| **999999997** | 6 compras | Implementos sanitarios y cajas de mascarillas médicas. |\n`;
    mdContent += `| **999999998** | 126 compras | Archivadores, materiales de escritorio, útiles de oficina y papelería. |\n\n`;
    
    mdContent += `### Detalle de las Compras Huérfanas (Muestra de las primeras 100 de ${res.rows.length} registros)\n\n`;
    mdContent += `| ID Compra | Código Insumo | Documento | Detalle de la Compra | Cantidad | P.U. | Total |\n`;
    mdContent += `| :---: | :---: | :--- | :--- | :---: | :---: | :---: |\n`;
    
    res.rows.slice(0, 100).forEach(row => {
      mdContent += `| ${row.compra_id || 'N/A'} | \`${row.codigo_insumo}\` | ${row.tipo_compra || ''} ${row.num_compra || ''} | ${row.compra_detalle || 'N/A'} | ${Number(row.cantidad).toFixed(2)} | S/ ${Number(row.precio_unit).toFixed(2)} | S/ ${Number(row.total).toFixed(2)} |\n`;
    });
    
    if (res.rows.length > 100) {
      mdContent += `\n*... y ${res.rows.length - 100} filas más en el archivo CSV.*`;
    }

    const mdPath = path.join(artifactsDir, 'reporte_vinculaciones_huerfanas.md');
    fs.writeFileSync(mdPath, mdContent, 'utf8');
    console.log("Markdown Report generated at:", mdPath);

  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
