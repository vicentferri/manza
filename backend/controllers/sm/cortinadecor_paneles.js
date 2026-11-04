'use strict'

/*
 * Revisión de precios de CortinaDecor: PANELES JAPONESES.
 * Lógica aparte del resto de productos; la llama cortinadecor_precios.js (revisarLinea) para las líneas de panel.
 *
 * Hay dos formatos de línea:
 *   COMPLETO      trae "NÚMERO TOTAL PANELES" (y riel, recogida...): precio = mecanismo + tejido
 *   SOLO PANELES  trae "NÚMERO DE PANELES" y el ancho de cada panel:  precio = tejido
 *
 *   Mecanismo : hoja MECANISMO PANEL, tabla "<vías> VIAS BLANCO", celda por el ancho total (escalón superior).
 *               Vías = nº de paneles; con recogida a ambos lados, la mitad (hacia arriba).
 *   Tejido    : hoja TEJIDO PANEL. Ancho de cada panel = ancho total / nº de paneles + 7 cm (COMPLETO) o el ancho
 *               que llega (SOLO PANELES). Celda (ancho del panel x alto), redondeada a céntimos, x nº de paneles.
 *               Tabla: reglas del panel de tarifas -> tejido del diccionario (+ ASIA) -> nombre de la referencia
 *               (nombre CortinaDecor de la tabla; ASIA = tejido oriental; Fiberglass según la abertura).
 *   Incrementos: solo el panel completo (los paneles sueltos no llevan), con las reglas de "todas las cortinas"
 *               (0,31 €) y las de paneles (escuadras de pared por "¿DÓNDE LO VAS A INSTALAR?", ancho / 50, mínimo 2).
 */

const HOJA_TEJIDO = 'TEJIDO PANEL';
const HOJA_MECANISMO = 'MECANISMO PANEL';
const PRODUCTO_PANEL = 2;       // "Aplica a: Paneles" en los incrementos
const SOLAPE_CM = 7;            // se suma al ancho de cada panel (ancho total / nº de paneles)
const EPSILON = 1e-9;
const TOLERANCIA_PANEL = 0.02;  // € por panel: diferencias de redondeo

const redondear = n => Math.round((n + Number.EPSILON) * 100) / 100;

/* El motor se pide al usarlo (cortinadecor_precios también requiere este módulo) */
const motor = () => require('./cortinadecor_precios');

/* Atributo cuyo nombre (normalizado) cumple la expresión */
function atributoRe(atributos, re) {
  const a = atributos.find(x => re.test(x.nombre) && x.valor !== '');
  return a ? a.valor : null;
}

const RE_TOTAL = /^N.?MERO TOTAL (DE )?PANELES$/;
const RE_PANELES = /^N.?MERO DE PANELES$/;

function esPanel(linea) {
  const n = motor().normalizar(linea.name);
  if (/^PANEL(ES)? JAPONES/.test(n)) return true;
  return linea._producto === 2 && (linea.atributos || []).some(a => RE_TOTAL.test(a.nombre) || RE_PANELES.test(a.nombre));
}

/* Celda: escalón superior del ancho (y del alto si se indica); null si se sale de la tabla */
function celda(tarifa, anchoM, altoM) {
  const columna = tarifa.anchos.find(a => a >= anchoM - EPSILON);
  const fila = altoM == null ? tarifa.altos[0] : tarifa.altos.find(a => a >= altoM - EPSILON);
  if (columna === undefined || fila === undefined) return null;
  const precio = tarifa.celdas.get(columna + '|' + fila);
  return precio === undefined ? null : { ancho: columna, alto: fila, precio };
}

const maximo = t => t.anchos[t.anchos.length - 1] + (t.altos.length > 1 || t.altos[0] > 0 ? ' x ' + t.altos[t.altos.length - 1] : '') + ' m';

/*
 * Tabla de tejido por el nombre de la referencia: tablas de TEJIDO PANEL cuyo nombre CortinaDecor (antes del " - " del
 * título) aparece en la referencia. "Opacos" se lee como "Opac". Los nombres que acaban en un dígito (FIBERGLASS 1/3/5)
 * se eligen por la abertura de la línea. Con ASIA se prefieren las tablas de tejido oriental.
 */
function tablaPorNombre(entrada, ref, fecha) {
  const m = motor();
  const referencia = ' ' + m.normalizar(entrada.referencia).replace(/\bOPACOS\b/g, 'OPAC').replace(/-/g, ' ') + ' ';
  const asia = /ASIA/i.test(entrada.color || '');
  const orientales = new Set();
  ref.tejidos.forEach((claves, k) => { if (k.endsWith('|1')) claves.forEach(c => orientales.add(c)); });

  const candidatas = [];
  for (const t of ref.tarifas) {
    if (t.hoja !== HOJA_TEJIDO || !m.vigente(t, fecha)) continue;
    const nombre = m.normalizar(String(t.titulo).split(' - ')[0]);
    if (!nombre) continue;
    if (referencia.includes(' ' + nombre + ' ')) { candidatas.push({ t, nombre }); continue; }
    const d = nombre.match(/^(.*) (\d)$/);
    if (d && referencia.includes(' ' + d[1] + ' ') && entrada.abertura === d[2]) candidatas.push({ t, nombre });
  }
  if (!candidatas.length) return null;
  let lista = candidatas.filter(c => orientales.has(c.t.clave) === asia);
  if (!lista.length) lista = candidatas;
  const largo = Math.max(...lista.map(c => c.nombre.length));
  lista = lista.filter(c => c.nombre.length === largo);
  if (lista.length !== 1) return { ambigua: lista.map(c => c.t.clave) };
  const c = lista[0];
  return {
    tarifa: c.t, hoja: HOJA_TEJIDO, origen: 'NOMBRE',
    regla: 'Referencia «' + entrada.referencia + '» → ' + c.nombre + (asia && orientales.has(c.t.clave) ? ' + color ASIA' : '') +
      (/ \d$/.test(c.nombre) && entrada.abertura ? ' (abertura ' + entrada.abertura + '%)' : '') + ' → ' + c.t.clave
  };
}

/* Tabla de tejido del panel: reglas -> diccionario (+ ASIA) -> nombre de la referencia */
function tablaTejido(entrada, ref, fecha) {
  const sol = motor().resolverTabla(Object.assign({}, entrada, { hoja: HOJA_TEJIDO, valorar: true }), ref, fecha);
  if (sol.tarifa) return sol;
  const porNombre = tablaPorNombre(entrada, ref, fecha);
  if (porNombre && porNombre.tarifa) {
    porNombre.avisos = sol.estado === 'DICCIONARIO INCOMPLETO' ? [] : sol.avisos;
    return porNombre;
  }
  const motivo = porNombre && porNombre.ambigua
    ? 'Varias tablas posibles en ' + HOJA_TEJIDO + ' (' + porNombre.ambigua.join(', ') + '): hay que indicarla con una regla en el panel de tarifas'
    : 'No se encuentra la tabla de tejido en ' + HOJA_TEJIDO + ': hay que indicarla con una regla en el panel de tarifas';
  return { tarifa: null, estado: 'SIN TARIFA', motivo, avisos: sol.avisos };
}

/* Abertura (1, 3, 5...) de la línea: FACTOR DE ABERTURA "ABERTURA 3%" o APERTURA "3%" */
function aberturaDe(atributos) {
  const v = motor().atributo(atributos, ['FACTOR DE ABERTURA', 'APERTURA']);
  const d = v && String(v).match(/(\d+)/);
  return d ? d[1] : null;
}

/* Revisión de una línea de panel. Devuelve el mismo resultado que revisarLinea del motor */
function revisarPanel(linea, ref) {
  const m = motor();
  const cantidad = linea.amount > 0 ? linea.amount : 1;
  const precioCD = linea.cost == null ? null : Number(linea.cost);
  const fecha = linea.fecha;
  const atributos = linea.atributos;
  const detalle = { referencia: linea.name, color: linea.color, producto: 'PANEL' };
  const r = {
    id: linea.id, idrow: linea.idrow, estado: null, idtarifa: null, ancho_tarifa: null, alto_tarifa: null,
    precio_tarifa: null, suplementos: 0, cantidad, esperado: null, precio_cd: precioCD, diferencia: null, detalle
  };
  const fin = (estado, motivo) => { r.estado = estado; if (motivo) detalle.motivo = motivo; return r; };
  const avisos = [];

  /* Formato y número de paneles */
  const total = m.numero(atributoRe(atributos, RE_TOTAL));
  const sueltos = m.numero(atributoRe(atributos, RE_PANELES));
  const completo = total > 0;
  const paneles = completo ? total : sueltos;
  const recogida = m.atributo(atributos, ['TIPO DE RECOGIDA', 'RECOGIDA', 'TIPO DE APERTURA']);
  const colorRiel = m.atributo(atributos, ['COLOR RIEL']);
  const panel = detalle.panel = { formato: completo ? 'COMPLETO' : 'SOLO PANELES', paneles, recogida, color_riel: colorRiel };

  const ancho = m.numero(m.atributo(atributos, ['WIDTH', 'ANCHO CM', 'ANCHO', 'ANCHO DEL RIEL (CM)']));
  const alto = m.numero(m.atributo(atributos, ['HEIGHT', 'ALTO CM', 'ALTO', 'ALTO DEL PANEL (CM)']));
  detalle.ancho = ancho;
  detalle.alto = alto;
  if (!(paneles > 0)) return fin('NO VALORABLE', 'La línea no indica el número de paneles');
  if (!(ancho > 0) || !(alto > 0)) return fin('NO VALORABLE', 'La línea no trae ancho y alto');

  /* Tejido */
  const sol = tablaTejido({
    referencia: linea.name, color: linea.color, _tejido: linea._tejido, tejido: linea.tejido,
    _producto: linea._producto, abertura: aberturaDe(atributos), atributos
  }, ref, fecha);
  (sol.avisos || []).forEach(a => avisos.push(a));
  if (sol.tejido) detalle.tejido = sol.tejido;
  const conAvisos = (estado, motivo) => { if (avisos.length) detalle.avisos = avisos; return fin(estado, motivo); };
  if (!sol.tarifa) return conAvisos(sol.estado, sol.motivo);

  const anchoPanel = completo ? Math.round((ancho / paneles + SOLAPE_CM) * 10) / 10 : ancho;
  const ct = celda(sol.tarifa, anchoPanel / 100, alto / 100);
  if (!ct) return conAvisos('FUERA DE RANGO', 'Tejido: panel de ' + anchoPanel + ' x ' + alto + ' cm; máximo de la tabla ' + maximo(sol.tarifa));
  panel.ancho_panel = anchoPanel;
  panel.tejido = {
    idtarifa: sol.tarifa.id, tabla: sol.tarifa.titulo, clave: sol.tarifa.clave, hoja: sol.hoja, origen: sol.origen, regla: sol.regla,
    /* CortinaDecor redondea a céntimos el precio de cada panel antes de multiplicar */
    ancho: ct.ancho, alto: ct.alto, precio: ct.precio, precio_panel: redondear(ct.precio), paneles,
    total: redondear(redondear(ct.precio) * paneles)
  };
  Object.assign(detalle, { hoja: sol.hoja, tabla: sol.tarifa.titulo, clave: sol.tarifa.clave, origen: sol.origen, regla: sol.regla });
  r.idtarifa = sol.tarifa.id;
  r.ancho_tarifa = ct.ancho;
  r.alto_tarifa = ct.alto;
  let unitario = panel.tejido.total;

  /* Mecanismo (solo panel completo) */
  if (completo) {
    const ambos = /AMBOS/.test(recogida || '');
    const vias = ambos ? Math.ceil(paneles / 2) : paneles;
    panel.vias = vias;
    panel.vias_texto = paneles + ' paneles' + (ambos ? ', recogida a ambos lados → ' + vias + ' vías por lado' : ' → ' + vias + ' vías');
    if (colorRiel && colorRiel !== 'BLANCO') avisos.push('Riel ' + colorRiel + ': solo hay tablas de mecanismo en blanco, se usa la de blanco');
    const clave = vias + ' VIAS BLANCO';
    const tm = ref.mecanismos.find(t => t.hoja === HOJA_MECANISMO && t.clave === clave && m.vigente(t, fecha));
    if (!tm) {
      const hay = ref.mecanismos.filter(t => t.hoja === HOJA_MECANISMO).map(t => t.clave).join(', ');
      return conAvisos('SIN TARIFA', 'No hay tabla de mecanismo de ' + vias + ' vías (hay: ' + hay + ')');
    }
    const cm = celda(tm, ancho / 100, null);
    if (!cm) return conAvisos('FUERA DE RANGO', 'Mecanismo: ancho ' + ancho + ' cm; máximo de la tabla ' + maximo(tm));
    panel.mecanismo = { idtarifa: tm.id, tabla: tm.titulo, clave: tm.clave, hoja: tm.hoja, ancho: cm.ancho, alto: cm.alto, precio: cm.precio };
    unitario += cm.precio;
  }

  r.precio_tarifa = unitario;

  /* Incrementos (solo panel completo; los paneles sueltos no llevan): reglas de "todas las cortinas" y de paneles */
  if (completo) {
    const inc = m.calcularIncrementos(atributos, PRODUCTO_PANEL, ancho, ref, linea.color, linea.name);
    r.suplementos = inc.total;
    if (inc.lista.length) detalle.incrementos = inc.lista;
    inc.avisos.forEach(a => avisos.push(a));
    unitario += inc.total;
  }

  if (avisos.length) detalle.avisos = avisos;
  m.comparar(r, unitario);
  /* El redondeo es por panel: tolerancia de 2 céntimos por panel y unidad */
  if (r.diferencia !== null && Math.abs(r.diferencia) <= TOLERANCIA_PANEL * paneles * cantidad + EPSILON) r.estado = 'OK';
  return r;
}

module.exports = { esPanel, revisarPanel, tablaTejido, HOJA_TEJIDO, HOJA_MECANISMO, SOLAPE_CM };
