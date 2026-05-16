import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    const client = await pool.connect();
    
    let queryText = 'SELECT codigo, descripcion, unidad, costo_p FROM insumos_p';
    let queryParams: any[] = [];

    if (q) {
      queryText += ' WHERE codigo ILIKE $1 OR descripcion ILIKE $1';
      queryParams.push(`%${q}%`);
    }

    queryText += ` ORDER BY descripcion ASC LIMIT 100`;

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
      await client.query(`
        UPDATE insumos_p 
        SET descripcion = $1, unidad = $2, costo_p = $3
        WHERE codigo = $4
      `, [descripcion, unidad, costo_p || 0, codigo]);
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
