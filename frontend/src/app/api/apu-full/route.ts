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
    
    // Fetch rendition and metrado_fijo from partidas_p
    const rendRes = await client.query(
      'SELECT rendimiento_p as "Partida_Rendimiento", cantidad_p as "metrado_fijo" FROM partidas_p WHERE item = $1 LIMIT 1',
      [partida]
    );
    const rendimiento = rendRes.rows[0]?.Partida_Rendimiento || 'No especificado';
    const metrado_fijo = rendRes.rows[0]?.metrado_fijo || 0;

    // Fetch all insumos for the APU from the acus table
    const query = `
      SELECT MIN(id) as id, descripcion_insumo as descripcion, MAX(unidad) as unidad,
             SUM(cantidad_p) as incidencia_original, SUM(parcial_p) as parcial_original,
             MAX(precio_p) as precio_original,
             SUM(COALESCE(cantidad_c, cantidad_p)) as cantidad_2
      FROM acus
      WHERE item_partida = $1
      GROUP BY codigo_insumo, descripcion_insumo
      ORDER BY MIN(id)
    `;
    const result = await client.query(query, [partida]);
    client.release();
    
    return NextResponse.json({
      rendimiento,
      metrado_fijo,
      insumos: result.rows
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch apu full' }, { status: 500 });
  }
}
