import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const insumo = searchParams.get('insumo');

  if (!insumo) {
    return NextResponse.json({ error: 'Insumo parameter is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Fetch APU distribution
    const query = `
      SELECT i.id, p.codigo as codigo_partida, i.item_1, i.codigo_insumo, p.descripcion as partida_desc, i.unidad, 
             i.incidencia_original as cantidad_1, p.metrado_fijo, i.parcial_original as parcial_1,
             i.incidencia as cantidad_2, i.cantidad_modificada, i.cantidad_adquirida
      FROM insumos i
      JOIN partidas p ON i.codigo_partida = p.codigo
      WHERE i.descripcion = $1
      ORDER BY i.codigo_partida
    `;
    const result = await client.query(query, [insumo]);
    client.release();
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch apu' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates, globalNameUpdate } = body; 

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const update of updates) {
        await client.query(
          `UPDATE insumos 
           SET cantidad_modificada = $1, incidencia = $2, cantidad_adquirida = $3 
           WHERE id = $4`,
          [update.cantidad_modificada, update.cantidad_2, update.cantidad_adquirida, update.id]
        );
      }

      if (globalNameUpdate && globalNameUpdate.oldName && globalNameUpdate.newName && globalNameUpdate.oldName !== globalNameUpdate.newName) {
        // Update insumos description
        await client.query(
          `UPDATE insumos SET descripcion = $1 WHERE descripcion = $2`,
          [globalNameUpdate.newName, globalNameUpdate.oldName]
        );
        // Update compras relation
        await client.query(
          `UPDATE compras SET insumo_descripcion = $1 WHERE insumo_descripcion = $2`,
          [globalNameUpdate.newName, globalNameUpdate.oldName]
        );
      }
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, newName: globalNameUpdate?.newName });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Failed to update apu' }, { status: 500 });
  }
}
