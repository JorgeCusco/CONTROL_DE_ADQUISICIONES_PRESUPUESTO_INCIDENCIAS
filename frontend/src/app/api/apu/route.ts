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

    // Fetch APU distribution with price reference
    const query = `
      SELECT MIN(a.id) as id, COALESCE(p.item, a.item_partida) as codigo_partida, '' as item_1, a.codigo_insumo, 
             COALESCE(MAX(p.descripcion), '[PARTIDA FALTANTE EN PRESUPUESTO]') as partida_desc, MAX(a.unidad) as unidad,
             SUM(a.cantidad_p) as cantidad_1, COALESCE(MAX(p.cantidad_p), 0) as metrado_fijo, 
             (SUM(a.cantidad_p) * COALESCE(MAX(p.cantidad_p), 0)) as parcial_1,
             SUM(COALESCE(a.cantidad_c, a.cantidad_p)) as cantidad_2, (SUM(COALESCE(a.cantidad_c, a.cantidad_p)) * COALESCE(MAX(p.cantidad_p), 0)) as cantidad_modificada, 
             0 as cantidad_adquirida,
             COALESCE(MAX(a.precio_p), 0) as precio_unit_original
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      WHERE a.codigo_insumo = $1
      GROUP BY a.item_partida, p.item, a.codigo_insumo
      ORDER BY a.item_partida
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
        if (update.precio_c !== undefined && update.precio_c !== null) {
          await client.query(
            `UPDATE acus 
             SET cantidad_c = $1,
                 precio_c = $3,
                 parcial_c = ROUND(($1 * $3)::numeric, 2)
             WHERE id = $2`,
            [update.cantidad_2, update.id, update.precio_c]
          );
        } else {
          await client.query(
            `UPDATE acus 
             SET cantidad_c = $1
             WHERE id = $2`,
            [update.cantidad_2, update.id]
          );
        }
      }

      if (globalNameUpdate && globalNameUpdate.oldName && globalNameUpdate.newName && globalNameUpdate.oldName !== globalNameUpdate.newName) {
        // Update insumos description using codigo_insumo as oldName
        await client.query(
          `UPDATE acus SET descripcion_insumo = $1 WHERE codigo_insumo = $2`,
          [globalNameUpdate.newName, globalNameUpdate.oldName] // oldName is now passed as codigo_insumo from frontend
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
