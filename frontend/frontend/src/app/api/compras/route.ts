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
    
    // Fetch compras for the selected insumo via mapeo_vinculacion
    const comprasQuery = `
        SELECT c.id, c.num_compra as "orden", c.detalle as "detalle",
               c.unidad as "unidad_orig", c.cantidad_c as "cant_orig",
               COALESCE(c.unidad_und, c.unidad) as "unidad",
               COALESCE(c.cantidad_und, c.cantidad_c) as "cantidad_und",
               c.precio_unit_c as "precio_orig",
               COALESCE(c.precio_und, c.precio_unit_c) as "precio_unit",
               c.total_c as "total",
               '' as observacion
        FROM compras_c c
        JOIN mapeo_vinculacion m ON c.id = m.compra_id
        WHERE m.codigo_insumo = $1
        ORDER BY c.id
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
          'UPDATE compras_c SET unidad_und = $1, cantidad_und = $2, precio_und = $3 WHERE id = $4',
          [update.unidad, update.cantidad_und, update.precio_unit, update.id]
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
