import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    // Get unique insumos
    const insumosResult = await client.query('SELECT DISTINCT codigo_insumo as codigo, descripcion_insumo as nombre, estado, comentario FROM insumos_resumen ORDER BY descripcion_insumo');
    const insumos = insumosResult.rows;
    
    // Get unique units
    const unitsResult = await client.query('SELECT DISTINCT unidad FROM insumos_resumen UNION SELECT DISTINCT unidad as unidad_c FROM compras_c WHERE unidad IS NOT NULL');
    const unidades = unitsResult.rows.map(r => r.unidad).filter(Boolean);
    
    client.release();
    
    return NextResponse.json({ insumos, unidades });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
