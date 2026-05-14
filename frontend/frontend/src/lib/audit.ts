import { PoolClient } from 'pg';

interface AuditEntry {
  tabla: string;
  registro_id: number;
  registro_desc?: string | null;
  campo: string;
  valor_anterior: string | null;
  valor_nuevo: string | null;
  usuario: string;
  ip_address?: string | null;
  modulo?: string | null;
}

export async function logCambio(client: PoolClient, entry: AuditEntry): Promise<void> {
  await client.query(
    `INSERT INTO historial_cambios
       (tabla, registro_id, registro_desc, campo, valor_anterior, valor_nuevo, usuario, ip_address, modulo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      entry.tabla,
      entry.registro_id,
      entry.registro_desc ?? null,
      entry.campo,
      entry.valor_anterior,
      entry.valor_nuevo,
      entry.usuario,
      entry.ip_address ?? null,
      entry.modulo ?? null,
    ]
  );
}

export function getUsuario(request: Request): string {
  return request.headers.get('X-Usuario') || 'desconocido';
}

export function getIp(request: Request): string | null {
  return (
    request.headers.get('X-Forwarded-For') ||
    request.headers.get('X-Real-IP') ||
    null
  );
}
