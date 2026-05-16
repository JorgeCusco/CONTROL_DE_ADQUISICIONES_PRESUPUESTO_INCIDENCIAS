import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    const client = await pool.connect();
    
    let queryText = 'SELECT * FROM partidas_p';
    let queryParams: any[] = [];

    if (q) {
      queryText += ' WHERE item ILIKE $1 OR descripcion ILIKE $1';
      queryParams.push(`%${q}%`);
    }

    queryText += ` ORDER BY item ASC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit);

    const result = await client.query(queryText, queryParams);
    client.release();

    return NextResponse.json({ partidas: result.rows });
  } catch (error) {
    console.error('Error fetching partidas:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p, rendimiento_p } = body;

    const client = await pool.connect();
    // Check if it exists
    const check = await client.query('SELECT item FROM partidas_p WHERE item = $1', [item]);
    
    if (check.rows.length > 0) {
      // Update
      await client.query(`
        UPDATE partidas_p 
        SET descripcion = $1, unidad = $2, cantidad_p = $3, precio_unitario_p = $4, total_p = $5, rendimiento_p = $6
        WHERE item = $7
      `, [descripcion, unidad, cantidad_p, precio_unitario_p, total_p, rendimiento_p, item]);
    } else {
      // Insert
      await client.query(`
        INSERT INTO partidas_p (item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p, rendimiento_p)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [item, descripcion, unidad, cantidad_p, precio_unitario_p, total_p, rendimiento_p]);
    }
    client.release();
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error saving partida:', error);
    return NextResponse.json({ error: 'Failed to save partida' }, { status: 500 });
  }
}
