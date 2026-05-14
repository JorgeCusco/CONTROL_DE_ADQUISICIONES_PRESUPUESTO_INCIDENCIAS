export function getClientUsuario(): string {
  return (typeof window !== 'undefined' && localStorage.getItem('usuario_rado')) || 'desconocido';
}
