import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    const client = await pool.connect();
    
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
    let queryParams: any[] = [];

    if (q) {
      queryText += ' WHERE codigo ILIKE $1 OR descripcion ILIKE $1';
      queryParams.push(`%${q}%`);
    }

    queryText += ` ORDER BY descripcion ASC`;

    const result = await client.query(queryText, queryParams);
    client.release();

    return NextResponse.json({ insumos: result.rows });
  } catch (error) {
    console.error('Error fetching insumos:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo, descripcion, unidad, costo_p } = body;

    if (!codigo || !descripcion) {
       return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const client = await pool.connect();
    const check = await client.query('SELECT codigo FROM insumos_p WHERE codigo = $1', [codigo]);
    
    if (check.rows.length > 0) {
      return NextResponse.json({ error: 'El código de insumo ya existe' }, { status: 409 });
    } else {
      await client.query(`
        INSERT INTO insumos_p (codigo, descripcion, unidad, costo_p)
        VALUES ($1, $2, $3, $4)
      `, [codigo, descripcion, unidad, costo_p || 0]);
    }
    client.release();
    return NextResponse.json({ success: true, codigo });
  } catch (error) {
    console.error('Error saving insumo:', error);
    return NextResponse.json({ error: 'Failed to save insumo' }, { status: 500 });
  }
}
