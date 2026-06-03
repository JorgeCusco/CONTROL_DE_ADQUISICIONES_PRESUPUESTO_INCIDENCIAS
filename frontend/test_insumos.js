const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.lwuhsendnfwxenoryuzs:SxucXihjIVEMUCAD@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
});

async function run() {
  await client.connect();
  try {
    let queryText = `
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
        c.costo_p,
        (
          SELECT SUM(comp.precio_und * COALESCE(comp.cantidad_und, comp.cantidad_c)) / NULLIF(SUM(COALESCE(comp.cantidad_und, comp.cantidad_c)), 0)
          FROM mapeo_vinculacion m
          JOIN compras_c comp ON m.compra_id = comp.id
          WHERE m.codigo_insumo = c.codigo
        ) as ppp_calculado
      FROM consolidado c
    `;
    const result = await client.query(queryText);
    console.log(result.rowCount);
  } catch(e) {
    console.error(e);
  }

  await client.end();
}
run();
