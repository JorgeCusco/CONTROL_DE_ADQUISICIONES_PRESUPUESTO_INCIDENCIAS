import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partida = searchParams.get('partida');

  try {
    const client = await pool.connect();
    
    if (!partida) {
      // Return all partidas
      const result = await client.query('SELECT codigo, descripcion FROM partidas ORDER BY codigo');
      client.release();
      return NextResponse.json(result.rows);
    } else {
      // Return insumos for a specific partida
      const query = `
        SELECT id, descripcion, unidad, incidencia, cantidad_adquirida, cantidad_modificada 
        FROM insumos 
        WHERE codigo_partida = $1 
        ORDER BY id
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
          `UPDATE insumos 
           SET incidencia = $1, cantidad_adquirida = $2, cantidad_modificada = $3 
           WHERE id = $4`,
          [update.incidencia, update.cantidad_adquirida, update.cantidad_modificada, update.id]
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
