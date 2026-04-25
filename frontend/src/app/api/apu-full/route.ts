import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partida = searchParams.get('partida');

  if (!partida) {
    return NextResponse.json({ error: 'Partida parameter is required' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Fetch rendition from apus_detallado
    const rendRes = await client.query(
      'SELECT DISTINCT "Partida_Rendimiento" FROM apus_detallado WHERE "Partida_Codigo" = $1 LIMIT 1',
      [partida]
    );
    const rendimiento = rendRes.rows[0]?.Partida_Rendimiento || 'No especificado';

    // Fetch all insumos for the APU from the insumos table
    const query = `
      SELECT id, descripcion, unidad, 
             incidencia_original, parcial_original,
             incidencia as cantidad_2
      FROM insumos 
      WHERE codigo_partida = $1
      ORDER BY id
    `;
    const result = await client.query(query, [partida]);
    client.release();
    
    return NextResponse.json({
      rendimiento,
      insumos: result.rows
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch apu full' }, { status: 500 });
  }
}
