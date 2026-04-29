import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logCambio, getUsuario, getIp } from '@/lib/audit';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode');
  const insumo = searchParams.get('insumo');

  const client = await pool.connect();
  try {
    if (mode === 'insumos') {
      const insumosRes = await client.query(`
        SELECT DISTINCT
          i.descripcion AS nombre,
          MAX(i.unidad) AS unidad,
          SUM(i.cantidad_modificada) AS meta_cantidad,
          COUNT(DISTINCT mv.compra_id) AS linked_count,
          COALESCE(SUM(CASE WHEN mv.compra_id IS NOT NULL THEN COALESCE(c.cantidad_und, c.cant_c, 0) ELSE 0 END), 0) AS adquirido,
          MAX(CASE WHEN i.es_extra = TRUE THEN 1 ELSE 0 END) AS es_extra
        FROM insumos i
        LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
        LEFT JOIN compras c ON c.id = mv.compra_id
        GROUP BY i.descripcion
        ORDER BY i.descripcion
      `);

      const unlinkedRes = await client.query(`
        SELECT COUNT(*) as unlinked_count
        FROM compras c
        WHERE NOT EXISTS (
          SELECT 1 FROM mapeo_vinculacion mv WHERE mv.compra_id = c.id
        )
      `);

      return NextResponse.json({
        insumos: insumosRes.rows,
        total_unlinked_compras: Number(unlinkedRes.rows[0]?.unlinked_count || 0)
      });
    }

    if (insumo) {
      const metaRes = await client.query(`
        SELECT
          COALESCE(SUM(cantidad_modificada), 0) AS meta_cantidad,
          MAX(unidad) AS unidad
        FROM insumos
        WHERE descripcion = $1
      `, [insumo]);
      const meta = metaRes.rows[0] || { meta_cantidad: 0, unidad: '' };

      const result = await client.query(`
        SELECT
          c.id,
          c.orden_doc,
          c.detalle_compra,
          c.tipo_c,
          c.anio_c,
          c.insumo_descripcion,
          c.observacion,
          c.opinion_comentario,
          COALESCE(c.unidad_und, c.unidad_c) AS unidad,
          COALESCE(c.cantidad_und, c.cant_c) AS cantidad,
          COALESCE(c.precio_und, c.pu_c) AS precio,
          c.total_c AS total,
          CASE
            WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion mv WHERE mv.compra_id = c.id AND mv.insumo_nombre = $1)
              THEN 'vinculado'
            WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion mv WHERE mv.compra_id = c.id AND mv.insumo_nombre != $1)
              THEN 'bloqueado'
            ELSE 'disponible'
          END AS estado,
          (SELECT insumo_nombre FROM mapeo_vinculacion WHERE compra_id = c.id AND insumo_nombre != $1 LIMIT 1) AS vinculado_a
        FROM compras c
        ORDER BY
          CASE
            WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion mv WHERE mv.compra_id = c.id AND mv.insumo_nombre = $1) THEN 0
            WHEN EXISTS (SELECT 1 FROM mapeo_vinculacion mv WHERE mv.compra_id = c.id AND mv.insumo_nombre != $1) THEN 2
            ELSE 1
          END,
          c.id
      `, [insumo]);

      const adquirido = result.rows
        .filter(r => r.estado === 'vinculado')
        .reduce((s, r) => s + Number(r.cantidad || 0), 0);

      return NextResponse.json({
        meta_cantidad: Number(meta.meta_cantidad),
        unidad: meta.unidad ?? '',
        adquirido,
        compras: result.rows,
      });
    }

    return NextResponse.json({ error: 'Parámetro requerido' }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { insumo_nombre, compra_ids } = body as { insumo_nombre: string; compra_ids: number[] };
  const usuario = getUsuario(request);
  const ip = getIp(request);

  if (!insumo_nombre || !Array.isArray(compra_ids) || compra_ids.length === 0) {
    return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let inserted = 0;
    for (const compra_id of compra_ids) {
      const { rowCount } = await client.query(`
        INSERT INTO mapeo_vinculacion (insumo_nombre, compra_id, usuario)
        VALUES ($1, $2, $3)
        ON CONFLICT (insumo_nombre, compra_id) DO NOTHING
      `, [insumo_nombre, compra_id, usuario]);
      if ((rowCount ?? 0) > 0) {
        inserted++;
        await logCambio(client, {
          tabla: 'mapeo_vinculacion', registro_id: compra_id,
          registro_desc: `${insumo_nombre} → compra #${compra_id}`,
          campo: 'compra_id', valor_anterior: null, valor_nuevo: String(compra_id),
          usuario, ip_address: ip, modulo: 'vinculador',
        });
      }
    }
    await client.query('COMMIT');
    return NextResponse.json({ success: true, inserted });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const insumo_nombre = searchParams.get('insumo_nombre');
  const compra_id = searchParams.get('compra_id');

  if (!insumo_nombre || !compra_id) {
    return NextResponse.json({ error: 'Parámetros requeridos' }, { status: 400 });
  }

  const usuario = getUsuario(request);
  const ip = getIp(request);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rowCount } = await client.query(`
      DELETE FROM mapeo_vinculacion WHERE insumo_nombre = $1 AND compra_id = $2
    `, [insumo_nombre, compra_id]);
    if ((rowCount ?? 0) === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    await logCambio(client, {
      tabla: 'mapeo_vinculacion', registro_id: Number(compra_id),
      registro_desc: `${insumo_nombre} → compra #${compra_id}`,
      campo: 'compra_id', valor_anterior: compra_id, valor_nuevo: null,
      usuario, ip_address: ip, modulo: 'vinculador',
    });
    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
