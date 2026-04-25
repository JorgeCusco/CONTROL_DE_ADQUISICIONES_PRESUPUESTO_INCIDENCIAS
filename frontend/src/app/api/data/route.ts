import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Get unique insumos
    const insumosResult = await client.query('SELECT DISTINCT descripcion FROM insumos ORDER BY descripcion');
    const insumos = insumosResult.rows.map(r => r.descripcion);
    
    // Get unique units
    const unitsResult = await client.query('SELECT DISTINCT unidad FROM insumos UNION SELECT DISTINCT unidad_c FROM compras WHERE unidad_c IS NOT NULL');
    const unidades = unitsResult.rows.map(r => r.unidad).filter(Boolean);
    
    client.release();
    
    return NextResponse.json({ insumos, unidades });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
