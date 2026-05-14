import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partida = searchParams.get('partida');

  try {
    const client = await pool.connect();
    
    if (!partida) {
      // Return all partidas
      const result = await client.query('SELECT item as codigo, descripcion FROM partidas_p ORDER BY item');
      client.release();
      return NextResponse.json(result.rows);
    } else {
      // Return insumos for a specific partida
      const query = `
        SELECT a.id, a.descripcion_insumo as descripcion, a.unidad, a.cantidad_c as incidencia, 
               0 as cantidad_adquirida, (a.cantidad_c * p.cantidad_p) as cantidad_modificada 
        FROM acus a
        JOIN partidas_p p ON a.item_partida = p.item
        WHERE a.item_partida = $1 
        ORDER BY a.id
      `;
      const result = await client.query(query, [partida]);
      client.release();
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, incidencia, cantidad_adquirida, cantidad_modificada }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const update of updates) {
        await client.query(
          `UPDATE acus 
           SET cantidad_c = $1
           WHERE id = $2`,
          [update.incidencia, update.id]
        );
      }
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update insumos' }, { status: 500 });
  }
}
