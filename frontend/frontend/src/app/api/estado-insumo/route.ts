import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { codigo_insumo, estado, comentario } = await request.json();

    if (!codigo_insumo) {
      return NextResponse.json({ error: 'codigo_insumo is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Upsert into estado_cuadre_insumos
      await client.query(`
        INSERT INTO estado_cuadre_insumos (codigo_insumo, estado, comentario, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (codigo_insumo) 
        DO UPDATE SET estado = EXCLUDED.estado, comentario = EXCLUDED.comentario, updated_at = NOW()
      `, [codigo_insumo, estado || 'Pendiente', comentario || '']);
      
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('State Update Error:', error);
    return NextResponse.json({ error: 'Failed to update state' }, { status: 500 });
  }
}
