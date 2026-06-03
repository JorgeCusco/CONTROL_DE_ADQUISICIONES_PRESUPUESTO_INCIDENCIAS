import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const insumo = searchParams.get('insumo');

  try {
    const client = await pool.connect();

    if (mode === 'insumos') {
      const result = await client.query(`
        SELECT
          i.codigo_insumo as codigo,
          i.descripcion_insumo as nombre,
          i.unidad,
          i.cantidad_requerida_p as meta_cantidad,
          i.precio_p as precio,
          COUNT(m.id) as linked_count,
          COALESCE((
            SELECT SUM(c.cantidad_und) 
            FROM mapeo_vinculacion m2 
            JOIN compras_c c ON m2.compra_id = c.id 
            WHERE m2.codigo_insumo = i.codigo_insumo
          ), 0) as adquirido,
          0 as es_extra,
          1 as total_registros
        FROM insumos_resumen i
        LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo
        GROUP BY i.codigo_insumo, i.descripcion_insumo, i.unidad, i.cantidad_requerida_p, i.precio_p
        ORDER BY i.descripcion_insumo
      `);

      const unlinkedResult = await client.query(`
        SELECT COUNT(*) as count FROM compras_c
        WHERE id NOT IN (SELECT compra_id FROM mapeo_vinculacion)
      `);

      client.release();
      return NextResponse.json({
        insumos: result.rows,
        total_unlinked_compras: unlinkedResult.rows[0].count || 0
      });
    } else if (mode === 'compras_master') {
      const result = await client.query(`
        SELECT 
          c.id as codigo, 
          c.detalle as nombre, 
          c.unidad_und as unidad, 
          c.cantidad_und as cantidad, 
          (SELECT COUNT(*) FROM mapeo_vinculacion m WHERE m.compra_id = c.id) as linked_count,
          (SELECT ir.descripcion_insumo FROM mapeo_vinculacion m2 JOIN insumos_resumen ir ON m2.codigo_insumo = ir.codigo_insumo WHERE m2.compra_id = c.id LIMIT 1) as vinculado_a,
          c.num_compra,
          c.tipo_compra,
          c.anio
        FROM compras_c c
        ORDER BY c.id DESC
      `);
      client.release();
      return NextResponse.json({ compras: result.rows });
    } else if (searchParams.get('compra_master')) {
      const compraId = searchParams.get('compra_master');
      
      const insumosResult = await client.query(`
        SELECT 
          i.codigo_insumo as codigo,
          i.descripcion_insumo as nombre,
          i.unidad,
          i.cantidad_requerida_p as meta_cantidad,
          COALESCE((
            SELECT SUM(c2.cantidad_und) 
            FROM mapeo_vinculacion m2 
            JOIN compras_c c2 ON m2.compra_id = c2.id 
            WHERE m2.codigo_insumo = i.codigo_insumo
          ), 0) as adquirido,
          CASE 
            WHEN m.id IS NOT NULL THEN 'vinculado'
            ELSE 'disponible'
          END as estado
        FROM (SELECT DISTINCT codigo_insumo, descripcion_insumo, unidad, cantidad_requerida_p FROM insumos_resumen) i
        LEFT JOIN mapeo_vinculacion m ON i.codigo_insumo = m.codigo_insumo AND m.compra_id = $1
        ORDER BY i.descripcion_insumo
      `, [compraId]);
      
      // Check if this compra is linked to anything at all
      const checkLink = await client.query('SELECT codigo_insumo FROM mapeo_vinculacion WHERE compra_id = $1', [compraId]);
      const isLinkedTo = checkLink.rows.length > 0 ? checkLink.rows[0].codigo_insumo : null;

      client.release();
      return NextResponse.json({
        isLinkedTo: isLinkedTo,
        insumos: insumosResult.rows
      });
    } else if (insumo) {
      const metaResult = await client.query(`
        SELECT
          cantidad_requerida_p as meta_cantidad,
          unidad
        FROM insumos_resumen
        WHERE codigo_insumo = $1
      `, [insumo]);

      const adquiridoResult = await client.query(`
        SELECT SUM(c.cantidad_und) as adquirido
        FROM mapeo_vinculacion m
        JOIN compras_c c ON m.compra_id = c.id
        WHERE m.codigo_insumo = $1
      `, [insumo]);

      const comprasResult = await client.query(`
        SELECT
          c.id,
          c.tipo_compra as tipo_c,
          c.anio,
          c.num_compra as orden_doc,
          c.detalle as detalle_compra,
          c.unidad_und as unidad,
          c.cantidad_und as cantidad,
          c.precio_und as precio,
          (c.cantidad_und * c.precio_und) as total,
          c.detalle as insumo_descripcion,
          '' as observacion,
          CASE 
              WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion m2 WHERE m2.compra_id = c.id AND m2.codigo_insumo = $1) THEN 'vinculado'
              WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion m2 WHERE m2.compra_id = c.id) THEN 'bloqueado'
              ELSE 'disponible'
          END as estado,
          (SELECT ir.descripcion_insumo FROM mapeo_vinculacion m2 JOIN insumos_resumen ir ON m2.codigo_insumo = ir.codigo_insumo WHERE m2.compra_id = c.id LIMIT 1) as vinculado_a
        FROM compras_c c
        ORDER BY c.id DESC
      `, [insumo]);

      const meta = metaResult.rows[0] || { meta_cantidad: 0, unidad: '' };
      const adquirido = adquiridoResult.rows[0]?.adquirido || 0;

      client.release();
      return NextResponse.json({
        meta_cantidad: meta.meta_cantidad || 0,
        unidad: meta.unidad || '',
        adquirido: adquirido,
        compras: comprasResult.rows
      });
    }

    client.release();
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  } catch (error) {
    console.error('Vinculacion Error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo_insumo, compra_ids } = body;
    const usuario = request.headers.get('X-Usuario') || 'Sistema';

    if (!codigo_insumo || !Array.isArray(compra_ids)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const compra_id of compra_ids) {
        const check = await client.query('SELECT id FROM mapeo_vinculacion WHERE compra_id = $1', [compra_id]);
        if (check.rows.length === 0) {
          await client.query(
            'INSERT INTO mapeo_vinculacion (codigo_insumo, compra_id, usuario) VALUES ($1, $2, $3)',
            [codigo_insumo, compra_id, usuario]
          );
        }
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
    console.error('Vinculacion POST Error:', error);
    return NextResponse.json({ error: 'Failed to update links' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const compra_id = searchParams.get('compra_id');
    const codigo_insumo = searchParams.get('codigo_insumo');

    if (!compra_id || !codigo_insumo) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query(
        'DELETE FROM mapeo_vinculacion WHERE compra_id = $1 AND codigo_insumo = $2',
        [parseInt(compra_id), codigo_insumo]
      );
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vinculacion DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to unlink' }, { status: 500 });
  }
}
