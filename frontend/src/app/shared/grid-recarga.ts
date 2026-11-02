/*
 * Recarga de una jqxGrid sin perder el sitio donde estaba el usuario.
 *
 * Cuando cambia el número de filas (crear, borrar, duplicar), jqxGrid devuelve su barra de
 * desplazamiento a 0, y el usuario tiene que volver a bajar hasta donde estaba. Aquí se guarda la
 * posición antes de recargar y se restaura después; si se indica una fila (p. ej. la que se acaba de
 * crear), la rejilla se coloca en ella y la deja seleccionada.
 *
 * Uso:  recargarGrid(this.myGrid, this.source, this.dataAdapter, datos, { conservar: true, seleccionar: idNuevo });
 */

export interface OpcionesRecargaGrid {
  /* Vuelve a la posición de desplazamiento que tenía la rejilla (vertical y horizontal) */
  conservar?: boolean;
  /* Valor de `campoId` de la fila que se selecciona y se deja visible (tiene prioridad sobre `conservar`) */
  seleccionar?: any;
  /* Campo que identifica la fila (por defecto idrow) */
  campoId?: string;
}

export function recargarGrid(grid: any, source: any, adaptador: any, datos: any[], opciones: OpcionesRecargaGrid = {}): void {
  const posicion = opciones.conservar && grid.scrollposition ? grid.scrollposition() : null;

  source.localdata = datos;
  adaptador.dataBind();
  grid.updatebounddata('cells');

  /* El enlace de datos de una fuente local es síncrono: la rejilla ya tiene las filas nuevas */
  if (opciones.seleccionar !== undefined && opciones.seleccionar !== null) {
    const campo = opciones.campoId || 'idrow';
    const id = String(opciones.seleccionar);
    const indice = (grid.getboundrows() || []).findIndex(fila => fila && String(fila[campo]) === id);
    /* Si la fila está oculta por un filtro de la rejilla no se puede mostrar: se queda donde estaba */
    const visible = indice >= 0 && (grid.getdisplayrows() || []).some(fila => fila && String(fila[campo]) === id);
    if (visible) {
      grid.selectrow(indice);
      grid.ensurerowvisible(indice);
      return;
    }
  }

  /* Sin fila a la que saltar, la selección anterior apuntaría a otra fila distinta: se quita.
     clearselection falla si la rejilla nunca ha tenido selección, de ahí la comprobación */
  if (grid.getselectedrowindex() >= 0) {
    grid.clearselection();
  }

  if (posicion) {
    grid.scrolloffset(posicion.top, posicion.left);
  }
}
