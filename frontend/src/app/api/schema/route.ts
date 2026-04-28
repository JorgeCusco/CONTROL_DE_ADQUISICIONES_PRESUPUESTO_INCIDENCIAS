import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const client = await pool.connect();

    // 1. Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);

    // 2. Para cada tabla, obtener estructura completa
    const schemaComplete: Record<string, any> = {};

    for (const tableName of tables) {
      // Columnas
      const columnsResult = await client.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      // Foreign Keys
      const fksResult = await client.query(`
        SELECT
          kcu.column_name,
          ccu.table_name,
          ccu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
      `, [tableName]);

      // Índices
      const indexesResult = await client.query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = $1
      `, [tableName]);

      // Contar registros
      const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const recordCount = countResult.rows[0].count;

      schemaComplete[tableName] = {
        columns: columnsResult.rows.map((col: any) => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          charLength: col.character_maximum_length,
        })),
        foreignKeys: fksResult.rows.map((fk: any) => ({
          column: fk.column_name,
          refTable: fk.table_name,
          refColumn: fk.column_name,
        })),
        indexes: indexesResult.rows.map((idx: any) => ({
          name: idx.indexname,
          definition: idx.indexdef,
        })),
        recordCount: parseInt(recordCount),
      };
    }

    client.release();

    return NextResponse.json({
      success: true,
      database: '7_insumos_rado',
      totalTables: tables.length,
      tables,
      schema: schemaComplete,
    });
  } catch (error) {
    console.error('Schema error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schema', details: String(error) },
      { status: 500 }
    );
  }
}
