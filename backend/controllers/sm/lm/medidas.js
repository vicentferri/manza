'use strict'

// Límites de FABRICACIÓN (no de tarifa): mínimo/máximo que se puede fabricar, por cliente / producto / tejido.
// Un cliente sin filas propias (ni generales) no tiene límites, salvo el ancho del rollo del color.
// Fuente: tabla sol_medidas_fabricacion vía dbo.fn_limites_fabricacion (ver sqlMedidas/002_medidas_fabricacion.sql).
// El mínimo cobrable lo sigue decidiendo la tarifa; aquí solo se valida que la medida sea fabricable.

var sql = require('mssql');

function intOrNull(v) {
  var n = parseInt(v);
  return (isNaN(n) || n < 0) ? null : n;
}

function numOrNull(v) {
  if (v === null || v === undefined) return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

// params: { cliente, tipo, subtipo, acc, modelo, tejido, color } (ids; -1/vacío = no aplica)
function getLimites(params) {
  var cliente = intOrNull(params.cliente);
  var tipo = intOrNull(params.tipo);
  if (cliente === null) return Promise.reject(new Error('Cliente no válido'));
  if (tipo === null) return Promise.reject(new Error('Tipo de cortina no válido'));

  var request = new sql.Request();
  request.input('cliente', sql.Int, cliente);
  request.input('tipo', sql.Int, tipo);
  request.input('subtipo', sql.Int, intOrNull(params.subtipo));
  request.input('acc', sql.Int, intOrNull(params.acc));
  request.input('modelo', sql.Int, intOrNull(params.modelo));
  request.input('tejido', sql.Int, intOrNull(params.tejido));
  request.input('color', sql.Int, intOrNull(params.color));

  return request.query(
    'select min_ancho, max_ancho, min_alto, max_alto, origen_max_ancho, origen_min_ancho, n_filas ' +
    'from dbo.fn_limites_fabricacion(@cliente, @tipo, @subtipo, @acc, @modelo, @tejido, @color)'
  ).then(function (result) {
    var r = result.recordset[0] || {};
    return {
      min_ancho: numOrNull(r.min_ancho),
      max_ancho: numOrNull(r.max_ancho),
      min_alto: numOrNull(r.min_alto),
      max_alto: numOrNull(r.max_alto),
      origen_max_ancho: r.origen_max_ancho || null,
      origen_min_ancho: r.origen_min_ancho || null,
      n_filas: r.n_filas || 0
    };
  });
}

var SIN_LIMITES = { min_ancho: null, max_ancho: null, min_alto: null, max_alto: null, origen_max_ancho: null };

// Las medidas se admiten de 0,5 en 0,5 cm.
function esMedioCm(n) {
  return Math.abs(n * 2 - Math.round(n * 2)) < 1e-9;
}

function txtMedida(n) {
  return String(n).replace('.', ',');
}

// Devuelve null si la medida es fabricable, o el texto del error. Medidas en cm, de 0,5 en 0,5.
// Una medida no informada (<= 0) no se valida: la exigencia de rellenarla es de cada formulario.
// etiquetaAlto: cómo se nombra el alto en el mensaje (p. ej. 'La altura máxima' en la vertical inclinada).
function validarMedidas(lim, ancho, alto, etiquetaAlto) {
  var an = numOrNull(ancho);
  var al = numOrNull(alto);
  var et = etiquetaAlto || 'El alto';

  // Primero todo el ancho y después el alto, en el mismo orden que la pantalla (MedidasFabricacion.ts),
  // para que los dos den siempre el mismo mensaje.
  if (an !== null && an > 0) {
    if (!esMedioCm(an))
      return 'El ancho (' + txtMedida(an) + ' cm) debe ir de 0,5 en 0,5 cm.';
    if (lim.min_ancho !== null && an < lim.min_ancho)
      return 'El ancho (' + txtMedida(an) + ' cm) es inferior al mínimo de fabricación (' + lim.min_ancho + ' cm).';
    if (lim.max_ancho !== null && an > lim.max_ancho)
      return 'El ancho (' + txtMedida(an) + ' cm) supera el máximo de fabricación (' + lim.max_ancho + ' cm' +
        (lim.origen_max_ancho === 'COLOR' ? ', limitado por el ancho del rollo del color' : '') + ').';
  }
  if (al !== null && al > 0) {
    if (!esMedioCm(al))
      return et + ' (' + txtMedida(al) + ' cm) debe ir de 0,5 en 0,5 cm.';
    if (lim.min_alto !== null && al < lim.min_alto)
      return et + ' (' + txtMedida(al) + ' cm) es inferior al mínimo de fabricación (' + lim.min_alto + ' cm).';
    if (lim.max_alto !== null && al > lim.max_alto)
      return et + ' (' + txtMedida(al) + ' cm) supera el máximo de fabricación (' + lim.max_alto + ' cm).';
  }
  return null;
}

// Comprobaciones de fabricación de una línea de CortinaTipo (frontend config/CortinaTipo.ts).
// Devuelve [{ params, ancho, alto }]; vacío si el tipo no tiene límites que validar aquí.
function comprobacionesLinea(l) {
  switch (Number(l.TipoCortina)) {
    case 1: // Enrollable: SubTipoCortina 1 normal / 2 cajón ZIP
      return [{
        params: { tipo: 1, subtipo: l.SubTipoCortina || 1, acc: l.acc_tipo_id, modelo: l.acc_modelo_id, tejido: l.tej_tipo_id, color: l.tej_color_id },
        ancho: l.ancho, alto: l.alto
      }];
    case 2: { // Panel japonés: 1 mecanismo+tejido, 2 solo tejido, 3 solo mecanismo
      // El ancho del rollo (color) solo limita el ancho de lama (comp. 2), no el del mecanismo.
      var comp = Number(l.PJ_TipoJapones);
      if (comp === 2)
        return [{ params: { tipo: 2, subtipo: 2, tejido: l.PJ_tejidos_id, color: l.PJ_tejidosC_id }, ancho: l.PJ_AnchoLama, alto: l.PJ_AltoLamaTerminada }];
      return [{ params: { tipo: 2, subtipo: comp }, ancho: l.PJ_Ancho_2, alto: l.PJ_Alto_1 }];
    }
    case 3: { // Vertical normal. El ancho es el del riel: sin límite de rollo.
      var rv = [];
      if (l.PV_SEL_1)
        rv.push({ params: { tipo: 3, subtipo: l.TipoVertical }, ancho: l.PV_Ancho_1, alto: l.PV_Alto_1 });
      if (l.PV_SEL_2) { // Inclinada (subtipo 4): ancho del riel y alturas mínima y máxima.
        var pi = { tipo: 3, subtipo: 4 };
        var amin = numOrNull(l.PV_AlturaMin_2), amax = numOrNull(l.PV_AlturaMax_2);
        if (amin > 0 && amax > 0 && amin > amax)
          rv.push({ error: 'La altura mínima (' + txtMedida(amin) + ' cm) no puede ser mayor que la máxima (' + txtMedida(amax) + ' cm).' });
        rv.push({ params: pi, ancho: l.PV_Ancho_2, alto: l.PV_AlturaMin_2, etiquetaAlto: 'La altura mínima' });
        rv.push({ params: pi, ancho: null, alto: l.PV_AlturaMax_2, etiquetaAlto: 'La altura máxima' });
      }
      return rv;
    }
    case 4: { // Compac: ancho interior (ancho) y, con junquillo redondeado, ancho exterior (ancho2)
      var pc = { tipo: 4, tejido: l.com_tej_tipo_id, color: l.com_tej_color_id };
      var r = [{ params: pc, ancho: l.ancho, alto: l.alto }];
      if (l.junquillo === 'JR') r.push({ params: pc, ancho: l.ancho2, alto: null });
      return r;
    }
    case 7: // Honeycomb
      return [{ params: { tipo: 7 }, ancho: l.ancho, alto: l.alto }];
    default:
      return [];
  }
}

// Valida todas las líneas del cliente; resuelve null si son fabricables o el primer mensaje de error.
function validarLineas(lineas, cliente) {
  if (intOrNull(cliente) === null) return Promise.resolve('No se ha indicado el cliente.');
  var comprobaciones = [];
  if (!Array.isArray(lineas)) return Promise.resolve('No se han recibido líneas.');
  for (var i = 0; i < lineas.length; i++) {
    if (!lineas[i] || typeof lineas[i] !== 'object') return Promise.resolve('Línea ' + (i + 1) + ' sin datos.');
    comprobaciones = comprobaciones.concat(comprobacionesLinea(lineas[i]));
  }

  return comprobaciones.reduce(function (prev, c) {
    return prev.then(function (error) {
      if (error) return error;
      if (c.error) return c.error;
      if (!c.params) return validarMedidas(SIN_LIMITES, c.ancho, c.alto, c.etiquetaAlto);
      return getLimites(Object.assign({ cliente: cliente }, c.params)).then(function (lim) { return validarMedidas(lim, c.ancho, c.alto, c.etiquetaAlto); });
    });
  }, Promise.resolve(null));
}

// GET /api/lm/limites_fabricacion?cliente=1&tipo=1&subtipo=1&acc=1&modelo=676&tejido=13&color=137
function limites_fabricacion(req, res) {
  getLimites(req.query)
    .then(function (lim) { res.status(200).send(lim); })
    .catch(function (err) { res.status(400).send({ message: err.message }); });
}

module.exports = {
  getLimites,
  validarMedidas,
  validarLineas,
  limites_fabricacion
}
