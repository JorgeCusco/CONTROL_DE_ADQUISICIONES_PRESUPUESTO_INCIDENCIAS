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
    
    // Fetch compras for the selected insumo
    const comprasQuery = `
        SELECT id, orden_doc as "orden", detalle_compra as "detalle",
               unidad_c as "unidad_orig", cant_c as "cant_orig",
               COALESCE(unidad_und, unidad_c) as "unidad",
               COALESCE(cantidad_und, cant_c) as "cantidad_und",
               pu_c as "precio_orig",
               pu_c as "precio_unit", total_c as "total",
               observacion
        FROM compras
        WHERE insumo_descripcion = $1
        ORDER BY id
    `;
    const comprasResult = await client.query(comprasQuery, [insumo]);
    client.release();
    
    return NextResponse.json(comprasResult.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch compras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { updates } = body; // Array of { id, unidad, cantidad_und }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const update of updates) {
        await client.query(
          'UPDATE compras SET unidad_und = $1, cantidad_und = $2 WHERE id = $3',
          [update.unidad, update.cantidad_und, update.id]
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
    return NextResponse.json({ error: 'Failed to update compras' }, { status: 500 });
  }
}
