'use strict'

// Lector mínimo de .xlsx (sin dependencias): devuelve las celdas de la primera hoja como { A1: valor, ... }.
// Basta para el Excel de medidas: textos compartidos y números, sin fórmulas ni fechas.

var fs = require('fs');
var zlib = require('zlib');

function leerZip(buf) {
  // Fin del directorio central: firma 0x06054b50, buscada desde el final.
  var eocd = -1;
  for (var i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('No es un fichero zip/xlsx válido');
  var total = buf.readUInt16LE(eocd + 10);
  var off = buf.readUInt32LE(eocd + 16);
  var ficheros = {};
  for (var n = 0; n < total; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) throw new Error('Directorio central corrupto');
    var metodo = buf.readUInt16LE(off + 10);
    var tamComp = buf.readUInt32LE(off + 20);
    var lenNombre = buf.readUInt16LE(off + 28);
    var lenExtra = buf.readUInt16LE(off + 30);
    var lenComent = buf.readUInt16LE(off + 32);
    var offLocal = buf.readUInt32LE(off + 42);
    var nombre = buf.toString('utf8', off + 46, off + 46 + lenNombre);
    var inicio = offLocal + 30 + buf.readUInt16LE(offLocal + 26) + buf.readUInt16LE(offLocal + 28);
    var datos = buf.slice(inicio, inicio + tamComp);
    ficheros[nombre] = metodo === 8 ? zlib.inflateRawSync(datos) : datos;
    off += 46 + lenNombre + lenExtra + lenComent;
  }
  return ficheros;
}

function decodificar(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); })
    .replace(/&amp;/g, '&');
}

function leerHoja(ruta) {
  var zip = leerZip(fs.readFileSync(ruta));
  var compartidos = [];
  if (zip['xl/sharedStrings.xml']) {
    var xml = zip['xl/sharedStrings.xml'].toString('utf8');
    var reSi = /<si>([\s\S]*?)<\/si>/g, m;
    while ((m = reSi.exec(xml))) {
      var texto = '', reT = /<t[^>]*>([\s\S]*?)<\/t>/g, t;
      while ((t = reT.exec(m[1]))) texto += t[1];
      compartidos.push(decodificar(texto));
    }
  }
  var hoja = zip['xl/worksheets/sheet1.xml'];
  if (!hoja) throw new Error('El Excel no tiene sheet1');
  var celdas = {};
  var reC = /<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, c;
  var sxml = hoja.toString('utf8');
  while ((c = reC.exec(sxml))) {
    var v = /<v>([\s\S]*?)<\/v>/.exec(c[3] || '');
    if (!v) continue;
    var esTexto = /t="s"/.test(c[2]);
    celdas[c[1]] = esTexto ? compartidos[+v[1]] : (isNaN(+v[1]) ? decodificar(v[1]) : +v[1]);
  }
  return celdas;
}

module.exports = { leerHoja };
