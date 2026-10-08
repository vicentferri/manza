/**
 * Estado (oculto/visible) del menú lateral del equipo interno.
 * Se aplica con la clase 'sidebar-hidden' en <body> (estilos GenesisUI) y se recuerda en localStorage.
 */
const STORAGE_KEY = 'sidebarHidden';

export function isSidebarHidden(): boolean {
  return document.body.classList.contains('sidebar-hidden');
}

export function setSidebarHidden(hidden: boolean): void {
  if (hidden) {
    document.body.classList.add('sidebar-hidden');
  } else {
    document.body.classList.remove('sidebar-hidden');
  }
  try {
    localStorage.setItem(STORAGE_KEY, hidden ? '1' : '0');
  } catch (e) { }
}

export function restoreSidebarState(): void {
  let hidden = false;
  try {
    hidden = localStorage.getItem(STORAGE_KEY) === '1';
  } catch (e) { }
  setSidebarHidden(hidden);
}
