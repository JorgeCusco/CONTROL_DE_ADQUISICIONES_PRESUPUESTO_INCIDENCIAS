import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partida = searchParams.get('partida');

  if (!partida) return NextResponse.json({ error: 'Missing partida item' }, { status: 400 });

  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT a.*, i.descripcion as insumo_nombre, i.unidad as insumo_unidad
      FROM acus a
      LEFT JOIN insumos_p i ON a.codigo_insumo = i.codigo
      WHERE a.item_partida = $1
      ORDER BY a.id ASC
    `, [partida]);
    client.release();

    return NextResponse.json({ acus: result.rows });
  } catch (error) {
    console.error('Error fetching acus:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partida, acus } = body;

    if (!partida || !Array.isArray(acus)) {
       return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing acus for this partida
      await client.query('DELETE FROM acus WHERE item_partida = $1', [partida]);

      // Insert new acus
      for (const apu of acus) {
        await client.query(`
          INSERT INTO acus (
            item_partida, codigo_insumo, descripcion_insumo, unidad, 
            cantidad_p, precio_p, parcial_p
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          partida,
          apu.codigo_insumo,
          apu.descripcion_insumo || '',
          apu.unidad || '',
          apu.cantidad_p || 0,
          apu.precio_p || 0,
          (apu.cantidad_p || 0) * (apu.precio_p || 0)
        ]);
      }

      // Automatically calculate and update the Unit Price and Total in partidas_p
      await client.query(`
        UPDATE partidas_p
        SET 
          precio_unitario_p = (SELECT COALESCE(SUM(parcial_p), 0) FROM acus WHERE item_partida = $1),
          total_p = cantidad_p * (SELECT COALESCE(SUM(parcial_p), 0) FROM acus WHERE item_partida = $1)
        WHERE item = $1
      `, [partida]);

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving acus:', error);
    return NextResponse.json({ error: 'Failed to save acus' }, { status: 500 });
  }
}
