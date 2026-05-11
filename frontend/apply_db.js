const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS estado_cuadre_insumos (
          codigo_insumo VARCHAR(50) PRIMARY KEY,
          estado TEXT DEFAULT 'Pendiente',
          comentario TEXT,
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE OR REPLACE VIEW insumos_resumen AS
      SELECT 
          a.codigo_insumo,
          a.descripcion_insumo,
          a.unidad,
          SUM(a.cantidad_p * COALESCE(p.cantidad_p, 0)) AS cantidad_requerida_p,
          MAX(a.precio_p) AS precio_p,
          SUM(COALESCE(a.cantidad_c, a.cantidad_p) * COALESCE(p.cantidad_p, 0)) AS cantidad_requerida_c,
          COALESCE(e.estado, 'Pendiente') AS estado,
          e.comentario
      FROM acus a
      LEFT JOIN partidas_p p ON a.item_partida = p.item
      LEFT JOIN estado_cuadre_insumos e ON a.codigo_insumo = e.codigo_insumo
      GROUP BY a.codigo_insumo, a.descripcion_insumo, a.unidad, e.estado, e.comentario;
    `);
    console.log("Success");
  } catch(e) {
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
