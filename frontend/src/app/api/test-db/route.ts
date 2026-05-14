import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(request: Request) {
  try {
    // Test connection with explicit parameters
    const testPool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME,
    });

    const client = await testPool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    testPool.end();

    return NextResponse.json({
      success: true,
      connection: 'OK',
      version: result.rows[0].version
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Connection failed', 
      details: error.message,
      env: {
        DB_USER: process.env.DB_USER,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        PASSWORD_SET: !!process.env.DB_PASSWORD
      }
    }, { status: 500 });
  }
}
