'use strict'

/* Hojas del enrollable (tipo 1) para la impresión en PDF del pedido o presupuesto (documento.js).
   Solo para los clientes de CLIENTES (Leroy, Leroy Web y Solarmanes); el resto imprime el enrollable con Crystal.
   Dos plantillas, según el accionamiento de cada línea: primero el bloque de cadena y después el de motor. */

const sql = require('mssql');
const c = require('./comun');

const CLIENTES = [1, 4, 5];

// Cortinas iguales a partir de las que se imprime una sola fila con la cantidad
const MINIMO_AGRUPAR = 5;

// acc_tipo_id: 1 Cadena, 3 Motor, 16 Sin cadena. Todo lo que no es motor va con la plantilla de cadena
const TIPO_MOTOR = 3;

/* Columnas de cada plantilla. 'impresion', 'estancia' y 'cantidad' solo salen si alguna fila las lleva.
   C1 y PVP van siempre al final (la fila de total cuenta con ello). */
const COLUMNAS = {
  cadena: [
    { campo: 'producto', titulo: 'Producto', clase: 'producto' },
    { campo: 'impresion', titulo: 'Id' },
    { campo: 'sistema', titulo: 'Sistema' },
    { campo: 'ancho', titulo: 'Ancho' },
    { campo: 'alto', titulo: 'Alto' },
    { campo: 'tejido', titulo: 'Tejido' },
    { campo: 'codigo48', titulo: '48' },
    { campo: 'posicion', titulo: 'Posición accionamiento' },
    { campo: 'caida', titulo: 'Caída' },
    { campo: 'colorSoportes', titulo: 'Colores soportes' },
    { campo: 'colorCadena', titulo: 'Color cadena' },
    { campo: 'alturaCadena', titulo: 'Altura cadena' },
    { campo: 'terminacion', titulo: 'Terminación' },
    { campo: 'estancia', titulo: 'Estancia' },
    { campo: 'cantidad', titulo: 'Cantidad' },
    { campo: 'c1', titulo: 'C1', clase: 'c1' },
    { campo: 'precio', titulo: 'PVP', clase: 'importe' }
  ],
  motor: [
    { campo: 'producto', titulo: 'Producto', clase: 'producto' },
    { campo: 'impresion', titulo: 'Id' },
    { campo: 'sistema', titulo: 'Sistema' },
    { campo: 'ancho', titulo: 'Ancho' },
    { campo: 'alto', titulo: 'Alto' },
    { campo: 'tejido', titulo: 'Tejido' },
    { campo: 'codigo48', titulo: '48' },
    { campo: 'posicion', titulo: 'Posición accionamiento' },
    { campo: 'caida', titulo: 'Caída' },
    { campo: 'colorSoportes', titulo: 'Colores soportes' },
    { campo: 'motor', titulo: 'Motor' },
    { campo: 'bateria', titulo: 'Batería' },
    { campo: 'mando', titulo: 'Mando' },
    { campo: 'cargador', titulo: 'Cargador' },
    { campo: 'terminacion', titulo: 'Terminación' },
    { campo: 'estancia', titulo: 'Estancia' },
    { campo: 'cantidad', titulo: 'Cantidad' },
    { campo: 'c1', titulo: 'C1', clase: 'c1' },
    { campo: 'precio', titulo: 'PVP', clase: 'importe' }
  ]
};

const COLUMNAS_OPCIONALES = ['impresion', 'estancia', 'cantidad'];
// No cuentan para decidir si dos cortinas son iguales
const NO_AGRUPAN = ['estancia', 'cantidad', 'c1', 'precio'];

function unir() {
  return Array.prototype.slice.call(arguments).map(c.texto).filter(Boolean).join(' ');
}

function aplica(cliente) {
  return CLIENTES.indexOf(cliente) >= 0;
}

async function leerLineas(pool, doc, id, cliente) {
  const r = await pool.request()
    .input('id', sql.Int, id)
    .input('cliente', sql.Int, cliente)
    .query(
      'select t.ancho, t.alto, t.cantidad, t.acc_tipo_id, t.acc_marca_text, t.acc_modelo_text, t.acc_posicion_text, ' +
      '  t.sop_tipo_text, t.sop_color_text, t.tej_tipo_text, t.tej_color_text, t.tej_salida_text, ' +
      '  t.con_tipo_text, t.con_color_text, t.cad_color_text, t.cad_Tipo, t.cad_Altura, t.impresion, t.impresion_imagen, ' +
      '  t.mando_text, t.Estancia, t.T1_PVP, t.T1_PVP_C1, ca.descripcion as cargador_text, ' +
      '  dbo.AT_Tejido_color_codigoprov_Cliente(t.tej_tipo_id, @cliente, t.tej_color_id) as codigo48 ' +
      'from ' + doc.lineas + ' l ' +
      'inner join ' + doc.tablaTipo + '1 t on t.idrow = l.ID ' +
      'left join dbo.SOL_ARTICULOS_MANDOS_CARGADORES ca on ca.idrow = t.cargador ' +
      'where l.IDROW = @id and l.TIPO = 1 ' +
      'order by l.ID, t.id'
    );
  return r.recordset;
}

/* El configurador guarda la altura como texto: "150" en la cadena normal y "125 cms" en la continua y la metálica
   cuando la eligen de la lista; en la metálica, lo que escriben a mano en "Indicar Altura" se guarda solo con el número.
   Cadena (cad_Tipo 0): "A medida 150". Continua (1): "Aro 125". Metálica (2): "Aro 125" si es de la lista
   (lleva "cms") y "A medida 137" si la escribieron. */
function alturaCadena(l) {
  const texto = c.texto(l.cad_Altura);
  const m = texto.match(/^\d+(?:[.,]\d+)?/);
  if (!m || !(parseFloat(m[0].replace(',', '.')) > 0)) return '';
  const altura = c.formatMedida(m[0].replace(',', '.'));
  switch (c.texto(l.cad_Tipo)) {
    case '0': return 'A medida ' + altura;
    case '1': return 'Aro ' + altura;
    case '2': return (/cms/i.test(texto) ? 'Aro ' : 'A medida ') + altura;
    default: return altura;
  }
}

/* Una línea del pedido -> su plantilla, la fila y una entrada por cortina con su parte del precio y del C1 */
function filaDeLinea(l) {
  const motor = l.acc_tipo_id === TIPO_MOTOR;
  const fila = {
    producto: 'Enrollable',
    impresion: Number(l.impresion) === 1 ? c.texto(l.impresion_imagen) : '',
    // En motor, acc_marca_text es el tipo de motor (BATERIA 25, VIA RADIO 35...): el sistema sale del soporte
    sistema: motor ? c.texto(l.sop_tipo_text) : c.texto(l.acc_marca_text),
    ancho: c.formatMedida(l.ancho),
    alto: c.formatMedida(l.alto),
    tejido: unir(l.tej_tipo_text, l.tej_color_text),
    codigo48: c.texto(l.codigo48),
    posicion: c.texto(l.acc_posicion_text),
    caida: c.texto(l.tej_salida_text),
    colorSoportes: c.texto(l.sop_color_text),
    terminacion: unir(l.con_tipo_text, c.texto(l.con_color_text).toUpperCase() === 'NINGUNO' ? '' : l.con_color_text)
  };
  if (motor) {
    fila.motor = c.texto(l.acc_modelo_text);
    fila.bateria = c.texto(l.acc_marca_text) || 'SIN BATERÍA';
    fila.mando = c.texto(l.mando_text) || 'SIN MANDO';
    fila.cargador = c.texto(l.cargador_text);
  } else {
    fila.colorCadena = c.texto(l.cad_color_text);
    fila.alturaCadena = alturaCadena(l);
  }

  // T1_PVP y T1_PVP_C1 son de la línea entera (todas sus cortinas)
  const n = Math.max(parseInt(l.cantidad, 10) || 1, 1);
  const c1Linea = c.centimosC1(l.T1_PVP_C1);
  const precios = c.repartir(c.centimos(l.T1_PVP), n);
  const c1s = c1Linea === null ? null : c.repartir(c1Linea, n);
  const unidades = precios.map(function (precio, i) {
    return { estancia: c.texto(l.Estancia), precio: precio, c1: c1s ? c1s[i] : null };
  });
  return { plantilla: motor ? 'motor' : 'cadena', fila: fila, unidades: unidades };
}

function sumar(unidades, campo) {
  let total = 0;
  for (let i = 0; i < unidades.length; i++) {
    if (unidades[i][campo] === null) return null;
    total += unidades[i][campo];
  }
  return total;
}

/* Cortinas iguales (todas las columnas menos estancia, cantidad y precios):
   - MINIMO_AGRUPAR o más: una fila con la cantidad y la suma de los precios; las estancias distintas se juntan.
   - Menos: una fila por cortina, cada una con su estancia y su precio.
   Los grupos salen en el orden en que aparece su primera línea. */
function agrupar(lineas, columnas) {
  const campos = columnas.map(function (col) { return col.campo; })
    .filter(function (campo) { return NO_AGRUPAN.indexOf(campo) < 0; });
  const grupos = [];
  const porClave = {};
  lineas.forEach(function (l) {
    const clave = JSON.stringify(campos.map(function (campo) { return l.fila[campo] || ''; }));
    let g = porClave[clave];
    if (!g) {
      g = porClave[clave] = { fila: l.fila, unidades: [] };
      grupos.push(g);
    }
    g.unidades = g.unidades.concat(l.unidades);
  });

  const filas = [];
  grupos.forEach(function (g) {
    const partes = g.unidades.length >= MINIMO_AGRUPAR ? [g.unidades] : g.unidades.map(function (u) { return [u]; });
    partes.forEach(function (unidades) {
      const estancias = unidades.map(function (u) { return u.estancia; })
        .filter(function (e, i, a) { return e && a.indexOf(e) === i; });
      const c1 = sumar(unidades, 'c1');
      filas.push(Object.assign({}, g.fila, {
        estancia: estancias.join(', '),
        cantidad: unidades.length > 1 ? unidades.length : '',
        c1: c1 === null ? '' : c.formatC1(c1),
        precio: c.formatImporte(sumar(unidades, 'precio'))
      }));
    });
  });
  return filas;
}

const TITULOS = { cadena: 'Enrollable - Cadena', motor: 'Enrollable - Motor' };

function seccionDePlantilla(nombre, lineas) {
  if (!lineas.length) return null;
  const filas = agrupar(lineas, COLUMNAS[nombre]);
  const columnas = COLUMNAS[nombre].filter(function (col) {
    return COLUMNAS_OPCIONALES.indexOf(col.campo) < 0 || filas.some(function (f) { return f[col.campo]; });
  });
  return c.seccion(
    TITULOS[nombre],
    columnas.map(function (col) { return { titulo: col.titulo }; }),
    filas.map(function (f) {
      return columnas.map(function (col) { return { valor: f[col.campo], clase: col.clase || '' }; });
    })
  );
}

/* Hojas y totales del enrollable del documento, o null si no tiene enrollable o el cliente no imprime así.
   Devuelve { secciones, precio, c1 } con los totales en céntimos (c1 = null si alguna línea no lo tiene). */
async function leer(pool, doc, id, cliente) {
  if (!aplica(cliente)) return null;
  const lineas = await leerLineas(pool, doc, id, cliente);
  if (!lineas.length) return null;

  const porPlantilla = { cadena: [], motor: [] };
  let unidades = [];
  lineas.forEach(function (l) {
    const linea = filaDeLinea(l);
    porPlantilla[linea.plantilla].push(linea);
    unidades = unidades.concat(linea.unidades);
  });

  const precio = sumar(unidades, 'precio');
  const c1 = sumar(unidades, 'c1');
  const secciones = [seccionDePlantilla('cadena', porPlantilla.cadena), seccionDePlantilla('motor', porPlantilla.motor)]
    .filter(Boolean);
  const ultima = secciones[secciones.length - 1];
  ultima.total = {
    colspan: ultima.columnas.length - 2,
    etiqueta: 'Total Enrollable',
    c1: c1 === null ? '' : c.formatC1(c1),
    precio: c.formatImporte(precio)
  };
  return { secciones: secciones, precio: precio, c1: c1 };
}

module.exports = {
  aplica,
  leer
};
