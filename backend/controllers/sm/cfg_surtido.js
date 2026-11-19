'use strict'

const sql = require('mssql');

/*
 * Surtido de un perfil (Fase 2, PLAN_FASE2_SURTIDO.md; BD sqlPerfiles 10-14): qué opciones y tejidos ve, con qué
 * nombre, con qué mínimos y máximos por tejido y, por cliente, con qué código. ÚNICA implementación de la regla:
 *
 *   lo ve  = (activo en el maestro e incluido en el producto: eso ya lo hacen las consultas de acc_configurador)
 *            Y coalesce(fila del perfil.visible, política del perfil = 'MOSTRAR')
 *   nombre = texto del perfil en su idioma > base en su idioma > texto del perfil en ES > nombre del maestro
 *
 * Lo usan las opciones de los cinco configuradores nuevos (filtran y renombran) y el precio y el alta (rechazan lo
 * que el perfil no ve y las medidas fuera de los límites del tejido). En el pedido se graba el nombre del MAESTRO
 * (decisión 1, 2026-11-16): los SPs de alta no se tocan.
 */

/* Campos de cada línea → catálogo (clave de CATALOGOS) o tejido del maestro */
const LINEAS = {
  ENR: {
    campo: 'nacc',
    opciones: {
      accionamiento: 'accionamientos', sistema: 'sistemas', tipo_cadena: 'tipos_cadena', altura: 'alturas',
      color_cadena: 'colores_cadena', tipo_motor: 'tipos_motor', modelo_motor: 'modelos_motor', mando: 'mandos',
      cargador: 'cargadores', bateria: 'baterias', soporte: 'soportes', soporte_color: 'colores_soporte',
      tapa: 'tapas', tapa_color: 'colores_tapa', contrapeso: 'contrapesos', contrapeso_color: 'colores_contrapeso'
    },
    tejidos: ['tejido']
  },
  MINI: {
    campo: 'nmini',
    opciones: {
      junquillo: 'mini_junquillos', color_perfil: 'mini_colores_perfil', color_ral: 'mini_colores_ral',
      color_cadena: 'mini_colores_cadena', color_tapa: 'mini_colores_tapa'
    },
    tejidos: ['tejido']
  },
  ZIP: {
    campo: 'nzip',
    opciones: {
      modelo_cajon: 'zip_modelos_cajon', soporte: 'zip_soportes', posicion_salida: 'zip_posiciones_salida',
      color_cajon: 'zip_colores', tipo_motor: 'zip_tipos_motor', modelo_motor: 'zip_modelos_motor', mando: 'zip_mandos',
      guia: 'zip_guias', color_guia: 'zip_colores', contrapeso: 'zip_contrapesos', color_contrapeso: 'zip_colores',
      lacado: 'zip_lacados'
    },
    tejidos: ['tejido']
  },
  VER: {
    campo: 'nver',
    opciones: {
      tipo: 'ver_tipos', modalidad: 'ver_modalidades', ancho_lama: 'ver_anchos_lama',
      posicion_mecanismo: 'ver_posiciones_mecanismo', color_riel: 'ver_colores_riel', accionamiento: 'ver_accionamientos',
      soporte: 'ver_soportes', recogida: 'ver_recogidas'
    },
    tejidos: ['tejido', 'tejido2']
  },
  PJ: {
    campo: 'npj',
    opciones: {
      modalidad: 'pj_modalidades', vias: 'pj_vias', color_mecanismo: 'pj_colores_mecanismo',
      posicion_mando: 'pj_posiciones_mando', recogida: 'pj_recogidas', contrapeso: 'pj_contrapesos', soporte: 'pj_soportes'
    },
    tejidos: ['tejido'],
    /* colores de las lamas: lista de filas del maestro */
    listasTejido: ['colores']
  },
  /* HoneyComb (sql/sqlHoney/21): las listas son las tablas de siempre (vistas vw_cfg_hc_*); el tejido es el del maestro
     enlazado al color de tejido (nhc.tejido lo rellena el servidor a partir de nhc.color_tejido) */
  HC: {
    campo: 'nhc',
    opciones: { tipo_tejido: 'hc_tipos_tejido', color_perfil: 'hc_colores_perfil', accionamiento: 'hc_accionamientos' },
    tejidos: ['tejido']
  }
};

const PRODUCTOS = Object.keys(LINEAS);
const POLITICA_POR_DEFECTO = 'OCULTAR';
const PERFIL_POR_DEFECTO = 'ESTANDAR';

function entero(value) {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

function numero(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return isNaN(n) ? null : n;
}

function idsLista(valor) {
  const lista = Array.isArray(valor) ? valor : (valor === null || valor === undefined ? [] : String(valor).split(','));
  return lista.map(entero).filter(n => n !== null && n > 0);
}

function fmt(n) {
  return String(Number(n)).replace('.', ',');
}

/* Perfil efectivo del cliente (como cfg_perfil.js: vw_cfg_cliente_perfil, si no ESTANDAR) */
async function perfilIdDeCliente(pool, cliente) {
  const r = await pool.request()
    .input('cliente', sql.Int, cliente)
    .input('defecto', sql.VarChar(30), PERFIL_POR_DEFECTO)
    .query(`select coalesce(
              (select perfil_id from dbo.vw_cfg_cliente_perfil where cliente = @cliente),
              (select id from dbo.CFG_PERFIL where codigo = @defecto and activo = 1)) as perfil_id`);
  return r.recordset[0] ? r.recordset[0].perfil_id : null;
}

/*
 * Carga todo el surtido de un perfil en 4 consultas y devuelve las funciones para aplicarlo.
 * cliente: para sus códigos (null = sin códigos). idioma: 'ES' o 'PT' (por defecto, el del perfil).
 */
async function cargarSurtido(pool, perfilId, cliente, idioma) {
  const req = () => pool.request().input('perfil', sql.Int, perfilId).input('cliente', sql.Int, cliente || 0);
  const [perfiles, opciones, tejidos, textos, codigos] = await Promise.all([
    req().query('select id, codigo, idioma, politica_novedades from dbo.CFG_PERFIL where id = @perfil'),
    req().query('select catalogo, opcion_id, visible from dbo.CFG_PERFIL_OPCION where perfil_id = @perfil'),
    req().query(`select producto, tejido, visible, ancho_min, ancho_max, alto_min, alto_max
                 from dbo.CFG_PERFIL_TEJIDO where perfil_id = @perfil`),
    req().query(`select perfil_id, ambito, catalogo, clave, idioma, texto from dbo.CFG_TEXTO
                 where ambito in ('OPCION', 'TEJIDO') and (perfil_id = @perfil or perfil_id is null)`),
    req().query('select ambito, catalogo, clave, codigo from dbo.CFG_CLIENTE_CODIGO where cliente = @cliente')
  ]);
  const perfil = perfiles.recordset[0] || { id: null, idioma: 'ES', politica_novedades: POLITICA_POR_DEFECTO };
  const lang = idioma === 'ES' || idioma === 'PT' ? idioma : (perfil.idioma || 'ES');
  const porDefecto = perfil.politica_novedades === 'MOSTRAR';

  const visOpcion = new Map(opciones.recordset.map(o => [o.catalogo + '|' + o.opcion_id, o.visible === true]));
  const filaTejido = new Map(tejidos.recordset.map(t => [t.producto + '|' + t.tejido, t]));
  const txt = new Map(textos.recordset.map(t =>
    [[t.perfil_id === null ? 'B' : 'P', t.ambito, t.catalogo, t.clave, t.idioma].join('|'), t.texto]));
  const cod = new Map(codigos.recordset.map(c => [[c.ambito, c.catalogo, c.clave].join('|'), c.codigo]));

  const texto = (ambito, catalogo, clave, maestro) => {
    const k = (p, i) => [p, ambito, catalogo, String(clave), i].join('|');
    return txt.get(k('P', lang)) || txt.get(k('B', lang)) || txt.get(k('P', 'ES')) || maestro;
  };

  const veOpcion = (catalogo, id) => {
    const v = visOpcion.get(catalogo + '|' + id);
    return v === undefined ? porDefecto : v;
  };
  const veTejido = (producto, tejido) => {
    const f = filaTejido.get(producto + '|' + tejido);
    return f ? f.visible === true : porDefecto;
  };
  const limitesTejido = (producto, tejido) => {
    const f = filaTejido.get(producto + '|' + tejido);
    if (!f) return null;
    const l = { ancho_min: f.ancho_min, ancho_max: f.ancho_max, alto_min: f.alto_min, alto_max: f.alto_max };
    return Object.values(l).some(v => v !== null) ? l : null;
  };

  return {
    perfil,
    idioma: lang,
    veOpcion,
    veTejido,
    limitesTejido,

    /* Filas de una lista ({ id, nombre, ... }): solo las que ve el perfil, con su nombre */
    filtrarOpciones(catalogo, filas) {
      return (filas || []).filter(f => veOpcion(catalogo, f.id))
        .map(f => Object.assign(f, { nombre: texto('OPCION', catalogo, f.id, f.nombre) }));
    },

    /* Filas de tejidos del maestro ({ id, nombre, color, ... }): solo las que ve el perfil en ese producto, con su
       nombre y color, sus límites (limites: { ancho_min, ... } o null) y el código del cliente (ref) */
    filtrarTejidos(producto, filas) {
      return (filas || []).filter(t => veTejido(producto, t.id)).map(t => Object.assign(t, {
        nombre: texto('TEJIDO', 'NOMBRE', t.id, t.nombre),
        color: texto('TEJIDO', 'COLOR', t.id, t.color),
        limites: limitesTejido(producto, t.id),
        ref: cod.get(['TEJIDO', producto, String(t.id)].join('|')) || null
      }));
    },

    /* Mensaje si la línea lleva algo que el perfil no ve o medidas fuera de los límites del tejido ('' si vale) */
    validarLinea(producto, l) {
      const def = LINEAS[producto];
      if (!def || !l) return '';
      const n = l[def.campo] || {};
      for (const campo of Object.keys(def.opciones)) {
        const id = entero(n[campo]);
        if (id !== null && id > 0 && !veOpcion(def.opciones[campo], id)) {
          return `La opción elegida (${campo.replace(/_/g, ' ')}) no está disponible para este cliente`;
        }
      }
      const tejidos = def.tejidos.map(c => entero(n[c])).filter(id => id !== null && id > 0);
      (def.listasTejido || []).forEach(c => idsLista(n[c]).forEach(id => tejidos.push(id)));
      for (const id of tejidos) {
        if (!veTejido(producto, id)) return 'El tejido elegido no está disponible para este cliente';
      }
      /* Medidas: la de la línea (en el vertical inclinado, el alto máximo) contra los límites de cada tejido */
      const ancho = numero(l.ancho);
      const alto = numero(l.alto) !== null ? numero(l.alto) : numero(n.alto_max);
      for (const id of tejidos) {
        const lim = limitesTejido(producto, id);
        if (!lim) continue;
        if (ancho !== null && lim.ancho_min !== null && ancho < lim.ancho_min) return `Con este tejido el ancho mínimo es ${fmt(lim.ancho_min)} cm`;
        if (ancho !== null && lim.ancho_max !== null && ancho > lim.ancho_max) return `Con este tejido el ancho máximo es ${fmt(lim.ancho_max)} cm`;
        if (alto !== null && lim.alto_min !== null && alto < lim.alto_min) return `Con este tejido el alto mínimo es ${fmt(lim.alto_min)} cm`;
        if (alto !== null && lim.alto_max !== null && alto > lim.alto_max) return `Con este tejido el alto máximo es ${fmt(lim.alto_max)} cm`;
      }
      return '';
    }
  };
}

/* Surtido del perfil efectivo de un cliente */
async function surtidoDeCliente(pool, cliente, idioma) {
  return cargarSurtido(pool, await perfilIdDeCliente(pool, cliente), cliente, idioma);
}

function idiomaDe(req) {
  const i = String((req.query && req.query.idioma) || '').toUpperCase();
  return i === 'ES' || i === 'PT' ? i : null;
}

module.exports = {
  LINEAS,
  PRODUCTOS,
  cargarSurtido,
  surtidoDeCliente,
  perfilIdDeCliente,
  idiomaDe
};
