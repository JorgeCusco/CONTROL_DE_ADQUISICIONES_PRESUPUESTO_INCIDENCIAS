import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logCambio, getUsuario, getIp } from '@/lib/audit';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS mapeo_vinculacion (
    id            SERIAL PRIMARY KEY,
    insumo_nombre TEXT NOT NULL,
    compra_id     INT  NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    usuario       VARCHAR(100),
    fecha         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(insumo_nombre, compra_id)
  )
`;

// Idempotent — runs on first call per process lifecycle
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  const client = await pool.connect();
  try {
    await client.query(CREATE_TABLE);
    tableReady = true;
  } finally {
    client.release();
  }
}

// GET /api/vinculador
//   → (no params) list all unique insumos with linked compra count
//   → ?insumo=NOMBRE   all compras flagged vinculado/no
export async function GET(request: Request) {
  await ensureTable();
  const { searchParams } = new URL(request.url);
  const insumo = searchParams.get('insumo');

  const client = await pool.connect();
  try {
    if (!insumo) {
      const result = await client.query(`
        SELECT
          i.descripcion            AS insumo_nombre,
          COUNT(mv.id)::int        AS linked_count
        FROM (
          SELECT DISTINCT descripcion
          FROM insumos
          WHERE NOT COALESCE(es_extra, FALSE)
        ) i
        LEFT JOIN mapeo_vinculacion mv ON mv.insumo_nombre = i.descripcion
        GROUP BY i.descripcion
        ORDER BY linked_count ASC, i.descripcion ASC
      `);
      return NextResponse.json(result.rows);
    } else {
      const result = await client.query(`
        SELECT
          c.id,
          c.orden_doc,
          c.detalle_compra,
          c.insumo_descripcion,
          c.unidad_c,
          c.cant_c,
          c.pu_c,
          c.total_c,
          c.observacion,
          mv.id                    AS mapeo_id,
          (mv.id IS NOT NULL)      AS vinculado
        FROM compras c
        LEFT JOIN mapeo_vinculacion mv
          ON mv.compra_id = c.id AND mv.insumo_nombre = $1
        ORDER BY vinculado DESC, c.id ASC
      `, [insumo]);
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error('Vinculador GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  } finally {
    client.release();
  }
}

// POST /api/vinculador  { insumo_nombre, compra_id }
export async function POST(request: Request) {
  await ensureTable();
  const body = await request.json();
  const { insumo_nombre, compra_id } = body;
  const usuario = getUsuario(request);
  const ip = getIp(request);

  if (!insumo_nombre || !compra_id) {
    return NextResponse.json({ error: 'insumo_nombre and compra_id required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO mapeo_vinculacion (insumo_nombre, compra_id, usuario)
       VALUES ($1, $2, $3)
       ON CONFLICT (insumo_nombre, compra_id) DO NOTHING
       RETURNING id`,
      [insumo_nombre, compra_id, usuario]
    );
    const newId = rows[0]?.id;
    if (newId) {
      await logCambio(client, {
        tabla: 'mapeo_vinculacion',
        registro_id: newId,
        registro_desc: `${insumo_nombre} ↔ compra #${compra_id}`,
        campo: 'vinculacion',
        valor_anterior: null,
        valor_nuevo: 'vinculado',
        usuario,
        ip_address: ip,
        modulo: 'vinculador',
      });
    }
    await client.query('COMMIT');
    return NextResponse.json({ success: true, id: newId ?? null });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Vinculador POST error:', e);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  } finally {
    client.release();
  }
}

// DELETE /api/vinculador?id=<mapeo_id>
export async function DELETE(request: Request) {
  await ensureTable();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const usuario = getUsuario(request);
  const ip = getIp(request);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `DELETE FROM mapeo_vinculacion WHERE id = $1 RETURNING insumo_nombre, compra_id`,
      [id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    await logCambio(client, {
      tabla: 'mapeo_vinculacion',
      registro_id: Number(id),
      registro_desc: `${rows[0].insumo_nombre} ↔ compra #${rows[0].compra_id}`,
      campo: 'vinculacion',
      valor_anterior: 'vinculado',
      valor_nuevo: null,
      usuario,
      ip_address: ip,
      modulo: 'vinculador',
    });
    await client.query('COMMIT');
    return NextResponse.json({ success: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Vinculador DELETE error:', e);
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  } finally {
    client.release();
  }
}
