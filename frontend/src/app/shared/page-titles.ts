/**
 * Título de la pantalla actual que se muestra en la cabecera (layout interno).
 * Se mantiene a mano con las mismas etiquetas del menú lateral (layouts/sidebar)
 * y de las tarjetas de la página de Configuración (routes/setup/master).
 */
export interface PageTitle {
  section: string;
  label: string;
}

const T = (section: string, label: string): PageTitle => ({ section, label });

const PAGE_TITLES: { [url: string]: PageTitle } = {
  // ── Menú lateral ──────────────────────────────────────────────
  '/routes/master/usuarios': T('Configuración', 'Usuarios'),
  '/routes/master/setupcli': T('Configuración', 'Clientes'),
  '/routes/master/clientes-gestion': T('Configuración', 'Gestión de Clientes'),
  '/routes/master/promociones-clientes': T('Configuración', 'Promociones'),
  '/routes/master/setup': T('Configuración', 'Gestión de Campos'),
  '/routes/herstellen/artikeln': T('Configuración', 'Artículos'),
  '/routes/herstellen/prebestell2': T('Configuración', 'Pedidos'),
  '/routes/herstellen/budgetliste': T('Configuración', 'Presupuestos'),

  '/routes/herstellen/tarifasimul-search': T('Tarifas', 'Generador de Tarifas'),
  '/routes/herstellen/tarifasimul-cli-search': T('Tarifas', 'Tarifas de Clientes'),
  '/routes/herstellen/tarifs': T('Tarifas', 'Tarifas Leroy Merlín'),
  '/routes/herstellen/backup': T('Tarifas', 'Backup'),

  '/routes/herstellen/artikeln_fab_cd_v3': T('Fabricación', 'Configuración'),

  '/routes/cdeco/main': T('Cortinadecor', 'Tejidos'),
  '/routes/herstellen/artikeln_fab_cd': T('Cortinadecor', 'Configuración Atributos'),
  '/routes/herstellen/artikeln_fab_cd_v2': T('Cortinadecor', 'Configuración'),

  // ── Tarjetas de la página de Configuración ────────────────────
  '/routes/master/promociones-monitor': T('Promociones', 'Monitor'),

  '/routes/master/colores-marcas': T('Colores y Marcas', 'Colores y Marcas'),
  '/routes/master/mandos-cargadores': T('Colores y Marcas', 'Cargadores'),

  '/routes/master/detail/201': T('Accionamientos', 'Tipos'),
  '/routes/master/detail/218': T('Accionamientos', 'Modelos'),
  '/routes/master/detail/217': T('Accionamientos', 'Diccionario'),
  '/routes/master/detail/216': T('Accionamientos', 'Permisos'),
  '/routes/master/accionamientos-mapa': T('Accionamientos', 'Mapa Completo'),
  '/routes/master/detail/902': T('Accionamientos', 'Tarifas Clientes'),
  '/routes/master/accionamientos-radio-tipo': T('Accionamientos', 'Radio Tipo'),
  '/routes/master/accionamientos-radio-tipo-cliente': T('Accionamientos', 'Radio Tipo Clientes'),
  '/routes/master/detail/912': T('Accionamientos', 'Grupo Modelo'),

  '/routes/master/tejidos': T('Tejidos', 'Tipos de Tejido'),
  '/routes/master/detail/229': T('Tejidos', 'Tejidos Cliente'),
  '/routes/master/detail/212': T('Tejidos', 'Diccionario'),
  '/routes/master/tejidos-colores': T('Tejidos', 'Colores Tejidos'),
  '/routes/master/detail/215': T('Tejidos', 'Traducción Colores'),
  '/routes/herstellen/stoffesgruppe': T('Tejidos', 'Grupos de Tejidos'),
  '/routes/master/impresion-digital': T('Tejidos', 'Impresión Digital'),
  '/routes/master/detail/906': T('Tejidos', 'Tarifa Vertical'),
  '/routes/master/detail/913': T('Tejidos', 'Atributos'),

  '/routes/master/detail/203': T('Contrapesos', 'Contrapesos'),
  '/routes/master/detail/221': T('Contrapesos', 'Empresa'),
  '/routes/master/detail/222': T('Contrapesos', 'Color Contrapesos'),
  '/routes/master/detail/905': T('Contrapesos', 'Tarifas Clientes'),

  '/routes/master/detail/204': T('Soportes', 'Soportes'),
  '/routes/master/detail/219': T('Soportes', 'Soportes Empresa'),
  '/routes/master/detail/223': T('Soportes', 'Colores Soportes'),

  '/routes/master/detail/205': T('Tapas', 'Tapas'),
  '/routes/master/detail/220': T('Tapas', 'Tapas Empresa'),
  '/routes/master/detail/224': T('Tapas', 'Colores de Tapas'),

  '/routes/master/detail/206': T('Tubos', 'Tipos de Tubos'),
  '/routes/master/dnd': T('Tubos', 'Permisos Clientes'),

  '/routes/master/detail/207': T('Otros Maestros', 'Embalajes'),
  '/routes/master/detail/208': T('Otros Maestros', 'Empaquetados'),
  '/routes/master/detail/209': T('Otros Maestros', 'Instalación'),
  '/routes/master/detail/210': T('Otros Maestros', 'Posición Mando'),
  '/routes/master/detail/213': T('Otros Maestros', 'Estancias'),

  '/routes/master/detail/907': T('Otras Tarifas', 'Tarifas Accesorios'),
  '/routes/master/detail/908': T('Otras Tarifas', 'Mecanismo Japonés'),
  '/routes/master/detail/909': T('Otras Tarifas', 'Mecanismo Vertical'),
  '/routes/master/incrementos-genericos': T('Otras Tarifas', 'Incrementos Motores'),

  '/routes/master/detail/300': T('Cajones ZIP', 'Cajones'),
  '/routes/master/detail/914': T('Cajones ZIP', 'Cajones Clientes'),
  '/routes/master/detail/301': T('Cajones ZIP', 'Guias'),
  '/routes/master/detail/911': T('Cajones ZIP', 'Incr. Lacados'),
  '/routes/master/detail/910': T('Cajones ZIP', 'Incr. Guias'),
  '/routes/master/detail/915': T('Cajones ZIP', 'Incr. Cajones'),
};

/**
 * Busca el título de una URL. Si no hay coincidencia exacta (p. ej. pantallas con parámetros
 * como /routes/herstellen/artikeln/123), usa la ruta registrada más larga que sea prefijo de la URL.
 */
export function getPageTitle(url: string): PageTitle | null {
  const path = (url || '').split(/[?#;]/)[0].replace(/\/+$/, '');
  if (PAGE_TITLES[path]) {
    return PAGE_TITLES[path];
  }
  let best: string | null = null;
  for (const key of Object.keys(PAGE_TITLES)) {
    if (path.startsWith(key + '/') && (!best || key.length > best.length)) {
      best = key;
    }
  }
  return best ? PAGE_TITLES[best] : null;
}
