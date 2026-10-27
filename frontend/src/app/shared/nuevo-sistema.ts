/**
 * Sección "Nuevo sistema" del menú: solo la ven y entran estos usuarios.
 * En USERS el username es igual que el email (el login admite los dos).
 * El backend repite la misma lista en middlewares/authenticated.js (ensureNuevoSistema).
 */
export const USUARIOS_NUEVO_SISTEMA: string[] = ['jrumi@solarmanes.es', 'jmartinez@solarmanes.es'];

export function esUsuarioNuevoSistema(user: any): boolean {
  const username = String((user && user.username) || '').trim().toLowerCase();
  return USUARIOS_NUEVO_SISTEMA.indexOf(username) !== -1;
}
