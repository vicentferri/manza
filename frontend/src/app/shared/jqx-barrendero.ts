/*
 * Barrendero de restos de jqWidgets tras cada cambio de pantalla.
 *
 * Problema: los widgets de jqx (rejillas, barras de scroll, botones, desplegables...) cuelgan elementos del
 * <body> y registran manejadores en document y window (mouseup, mousemove...). Al salir de una pantalla
 * Angular borra los elementos del widget, pero esos restos se quedan: cada clic ejecuta los manejadores de
 * todos los widgets que ya no existen y la página se va ralentizando con el uso.
 *
 * Solución: jqx pone en el espacio de nombres de cada manejador, y en el id de los elementos que cuelga
 * del <body>, el id de su widget (jqxWidget + hexadecimal). Si ese widget ya no está en la página, el resto
 * es huérfano y se quita. Lo que pertenece a widgets vivos no se toca.
 *
 * Se ejecuta poco después de terminar cada navegación (AppComponent). Interruptor de emergencia, sin
 * recompilar: localStorage.setItem('barrenderoJqx', 'no') y recargar la página.
 */

const ID_WIDGET = /jqxWidget[0-9a-f]+/g;

export interface ResultadoBarrido {
  manejadores: number;
  elementos: number;
}

export function barrenderoActivo(): boolean {
  try {
    return localStorage.getItem('barrenderoJqx') !== 'no';
  } catch (e) {
    return true;
  }
}

/* Un resto es huérfano si ninguno de los widgets que nombra sigue en la página */
function huerfano(texto: string, propio?: string): boolean {
  const ids = (String(texto || '').match(ID_WIDGET) || []).filter(id => id !== propio);
  return ids.length > 0 && ids.every(id => !document.getElementById(id));
}

function barrerManejadores(jq: any, objetivo: any): number {
  const eventos = jq._data(objetivo, 'events') || {};
  const quitar: string[] = [];
  Object.keys(eventos).forEach(tipo => {
    (eventos[tipo] || []).forEach(h => {
      const espacio = String(h.namespace || '');
      /* jQuery guarda mouseenter/mouseleave bajo mouseover/mouseout: off() necesita el tipo original */
      const nombre = (h.origType || tipo) + '.' + espacio;
      if (espacio && huerfano(espacio) && quitar.indexOf(nombre) === -1) {
        quitar.push(nombre);
      }
    });
  });
  let quitados = 0;
  quitar.forEach(nombre => {
    const antes = contar(jq, objetivo);
    jq(objetivo).off(nombre);
    quitados += antes - contar(jq, objetivo);
  });
  return quitados;
}

function contar(jq: any, objetivo: any): number {
  const eventos = jq._data(objetivo, 'events') || {};
  return Object.keys(eventos).reduce((total, tipo) => total + (eventos[tipo] || []).length, 0);
}

/* Elementos colgados del <body> fuera de la aplicación (listBoxgridpagerlist<id>, menuWrappergridmenu<id>...) */
function barrerElementos(): number {
  const raiz = document.querySelector('app-root');
  let quitados = 0;
  Array.from(document.body.children).forEach(e => {
    if (e === raiz || !e.id || e.tagName === 'SCRIPT') {
      return;
    }
    /* Los ids propios del elemento no cuentan: solo el del widget que lo creó */
    if (huerfano(e.id, e.id)) {
      e.parentNode.removeChild(e);
      quitados++;
    }
  });
  return quitados;
}

export function barrerRestosJqx(): ResultadoBarrido {
  const resultado: ResultadoBarrido = { manejadores: 0, elementos: 0 };
  const jq = (window as any).jQuery;
  if (!barrenderoActivo() || !jq || !jq._data) {
    return resultado;
  }
  try {
    resultado.elementos = barrerElementos();
    resultado.manejadores = barrerManejadores(jq, document) + barrerManejadores(jq, window);
  } catch (e) {
    /* El barrido nunca debe romper la aplicación */
    console.warn('Barrendero jqx: ' + (e && e.message));
  }
  return resultado;
}
