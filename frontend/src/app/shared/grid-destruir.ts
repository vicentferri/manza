/*
 * Destrucción segura de una jqxGrid al salir de una pantalla.
 *
 * jqxGrid saca al <body> el desplegable del paginador ("Show rows") y el menú de columna, y engancha
 * listeners en document. Si la rejilla no se destruye al salir, todo eso se acumula con cada cambio de
 * pantalla (cientos de nodos y listeners) y la página se va ralentizando.
 *
 * Además, destroy() falla a medias en las rejillas que nunca se han llegado a mostrar (p. ej. las que
 * están en una pestaña que el usuario no ha abierto): lanza una excepción y deja los elementos del <body>.
 * Por eso, tras destruir, se borran los elementos del <body> que lleven el id de la rejilla.
 *
 * Uso:  ngOnDestroy() { destruirGrids(this.myGrid, this.myGrid2); }
 */

export function destruirGrid(grid: any): void {
  if (!grid || !grid.host || !grid.host[0]) {
    return;
  }
  const id = grid.host[0].id;
  try {
    grid.destroy();
  } catch (e) {
    /* rejilla sin terminar de construir: jqx falla a mitad de la limpieza, se completa abajo */
  }
  if (id) {
    /* Los elementos que jqx cuelga del <body> llevan el id de la rejilla al final
       (listBoxgridpagerlist<id>, menuWrappergridmenu<id>...) */
    Array.from(document.body.children)
      .filter(e => e.id && e.id.length > id.length && e.id.endsWith(id))
      .forEach(e => e.parentNode && e.parentNode.removeChild(e));
    soltarManejadoresDeDocument(id);
  }
}

/*
 * Las barras de scroll y los botones internos de la rejilla enganchan manejadores (mouseup, mousemove...)
 * en document con un espacio de nombres que lleva el id de la rejilla (p. ej. mouseup.jqxScrollBtnUp...<id>).
 * jqx no los suelta al destruir la rejilla, y cada clic del usuario ejecuta los de todas las rejillas que
 * ya no existen. Aquí se sueltan los de esa rejilla.
 */
function soltarManejadoresDeDocument(id: string): void {
  const jq = (window as any).jQuery;
  if (!jq || !jq._data) {
    return;
  }
  const eventos = jq._data(document, 'events') || {};
  const sueltos: string[] = [];
  Object.keys(eventos).forEach(tipo => {
    (eventos[tipo] || []).forEach(h => {
      const espacio = String(h.namespace || '');
      if (espacio.indexOf(id) >= 0) {
        sueltos.push(tipo + '.' + espacio);
      }
    });
  });
  sueltos.forEach(nombre => jq(document).off(nombre));
}

export function destruirGrids(...grids: any[]): void {
  grids.forEach(destruirGrid);
}
