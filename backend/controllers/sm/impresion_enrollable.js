'use strict'

/* Impresión de pedidos y presupuestos de enrollable (tipo 1) en PDF con Puppeteer.
   Solo las líneas de enrollable y solo de los clientes de CLIENTES (Leroy, Leroy Web y Solarmanes):
   el resto se sigue imprimiendo con Crystal (haru_server/preview.aspx).
   Dos plantillas, según el accionamiento de cada línea: cadena y motor. Si el documento tiene
   las dos cosas, el PDF lleva primero las hojas de cadena y después las de motor.

   GET /api/sm/enrollable/impresion/info/:doc/:id  -> { tieneEnrollable, tieneOtros }
   GET /api/sm/enrollable/impresion/pdf/:doc/:id   -> application/pdf
   doc = 'pedido' | 'presupuesto', id = IDROW del pedido o presupuesto. */

const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const pdf = require('../../services/pdf');

const PLANTILLA = path.join(__dirname, '../../templates/enrollable/documento.hbs');

// Clientes que imprimen el enrollable con este PDF
const CLIENTES = [1, 4, 5];

const FILAS_POR_HOJA = 10;

// Cortinas iguales a partir de las que se imprime una sola fila con la cantidad
const MINIMO_AGRUPAR = 5;

// acc_tipo_id: 1 Cadena, 3 Motor, 16 Sin cadena. Todo lo que no es motor va con la plantilla de cadena
const TIPO_MOTOR = 3;

const DOCUMENTOS = {
  pedido: {
    cabecera: 'dbo.SOL_PEDIDOS_COLA',
    lineas: 'dbo.SOL_PEDIDOS_COLA_LINEAS',
    lineasEnrollable: 'dbo.SOL_PEDIDOS_COLA_TIPO_1',
    textoDocumento: 'Pedido',
    textoFecha: 'Fecha pedido'
  },
  presupuesto: {
    cabecera: 'dbo.SOL_PRESUPUESTOS_COLA',
    lineas: 'dbo.SOL_PRESUPUESTOS_COLA_LINEAS',
    lineasEnrollable: 'dbo.SOL_PRESUPUESTOS_COLA_TIPO_1',
    textoDocumento: 'Presupuesto',
    textoFecha: 'Fecha presupuesto'
  }
};

/* Columnas de cada plantilla. 'impresion' y 'cantidad' solo salen si alguna fila las lleva.
   Estancia se imprime pero no cuenta para decidir si dos cortinas son iguales. */
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
    { campo: 'cantidad', titulo: 'Cantidad' }
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
    { campo: 'cantidad', titulo: 'Cantidad' }
  ]
};

const COLUMNAS_OPCIONALES = ['impresion', 'cantidad'];
const NO_AGRUPAN = ['estancia', 'cantidad'];

function dosDigitos(n) {
  return String(n).padStart(2, '0');
}

// Las fechas datetime llegan de mssql como UTC: se leen en UTC para que no cambie el día
function formatFecha(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) return '';
  return dosDigitos(fecha.getUTCDate()) + '-' + dosDigitos(fecha.getUTCMonth() + 1) + '-' + fecha.getUTCFullYear();
}

// Fecha prevista: un día más que la fecha del pedido o presupuesto
function fechaPrevista(fecha) {
  if (!(fecha instanceof Date) || isNaN(fecha)) return '';
  return formatFecha(new Date(fecha.getTime() + 24 * 60 * 60 * 1000));
}

// Medidas sin ceros de sobra: 264.50 -> 264.5, 100.00 -> 100
function formatMedida(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  return String(Number(valor));
}

// Los textos sin elegir se guardan vacíos, como NULL o como -1
function texto(valor) {
  const t = valor === null || valor === undefined ? '' : String(valor).trim();
  return t === '-1' || t.toUpperCase() === 'NULL' ? '' : t;
}

function unir() {
  return Array.prototype.slice.call(arguments).map(texto).filter(Boolean).join(' ');
}

function validarParametros(req, res) {
  const doc = DOCUMENTOS[req.params.doc];
  const id = parseInt(req.params.id, 10);
  if (!doc || isNaN(id) || String(id) !== String(req.params.id)) {
    res.status(400).json({ error: 'Parámetros: doc = pedido | presupuesto, id = número' });
    return null;
  }
  return { doc: doc, id: id };
}

async function impresion_enrollable_info(req, res) {
  const p = validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const r = await pool.request()
      .input('id', sql.Int, p.id)
      .query(
        'select (select max(CLIENTE) from ' + p.doc.cabecera + ' where IDROW = @id) as cliente, ' +
        '  (select count(*) from ' + p.doc.cabecera + ' where IDROW = @id) as existe, ' +
        '  sum(case when TIPO = 1 then 1 else 0 end) as enrollable, ' +
        '  sum(case when TIPO not in (1, 7) then 1 else 0 end) as otros ' +
        'from ' + p.doc.lineas + ' where IDROW = @id'
      );
    const fila = r.recordset[0];
    if (!fila.existe) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    const aplica = CLIENTES.indexOf(fila.cliente) >= 0;
    // tieneOtros: lo que tiene que seguir imprimiendo Crystal (sin contar la HoneyComb)
    res.json({
      tieneEnrollable: aplica && fila.enrollable > 0,
      tieneOtros: (fila.otros || 0) > 0 || (!aplica && fila.enrollable > 0)
    });
  } catch (err) {
    console.error('impresion_enrollable_info:', err);
    res.status(500).json({ error: 'Error consultando el ' + req.params.doc });
  }
}

async function leerDatos(pool, doc, id) {
  const cab = await pool.request()
    .input('id', sql.Int, id)
    .query('select IDROW, FECHA, REFCLIENTE, CLIENTE from ' + doc.cabecera + ' where IDROW = @id');
  if (!cab.recordset.length) return null;

  const lin = await pool.request()
    .input('id', sql.Int, id)
    .input('cliente', sql.Int, cab.recordset[0].CLIENTE)
    .query(
      'select t.ancho, t.alto, t.cantidad, t.acc_tipo_id, t.acc_marca_text, t.acc_modelo_text, t.acc_posicion_text, ' +
      '  t.sop_tipo_text, t.sop_color_text, t.tej_tipo_text, t.tej_color_text, t.tej_salida_text, ' +
      '  t.con_tipo_text, t.con_color_text, t.cad_color_text, t.cad_Altura, t.impresion, t.impresion_imagen, ' +
      '  t.mando_text, t.Estancia, c.descripcion as cargador_text, ' +
      '  dbo.AT_Tejido_color_codigoprov_Cliente(t.tej_tipo_id, @cliente, t.tej_color_id) as codigo48 ' +
      'from ' + doc.lineas + ' l ' +
      'inner join ' + doc.lineasEnrollable + ' t on t.idrow = l.ID ' +
      'left join dbo.SOL_ARTICULOS_MANDOS_CARGADORES c on c.idrow = t.cargador ' +
      'where l.IDROW = @id and l.TIPO = 1 ' +
      'order by l.ID, t.id'
    );

  return { cabecera: cab.recordset[0], lineas: lin.recordset };
}

function filaDeLinea(l) {
  const motor = l.acc_tipo_id === TIPO_MOTOR;
  const fila = {
    producto: 'Enrollable',
    impresion: Number(l.impresion) === 1 ? texto(l.impresion_imagen) : '',
    // En motor, acc_marca_text es el tipo de motor (BATERIA 25, VIA RADIO 35...): el sistema sale del soporte
    sistema: motor ? texto(l.sop_tipo_text) : texto(l.acc_marca_text),
    ancho: formatMedida(l.ancho),
    alto: formatMedida(l.alto),
    tejido: unir(l.tej_tipo_text, l.tej_color_text),
    codigo48: texto(l.codigo48),
    posicion: texto(l.acc_posicion_text),
    caida: texto(l.tej_salida_text),
    colorSoportes: texto(l.sop_color_text),
    terminacion: unir(l.con_tipo_text, texto(l.con_color_text).toUpperCase() === 'NINGUNO' ? '' : l.con_color_text),
    estancia: texto(l.Estancia)
  };
  if (motor) {
    fila.motor = texto(l.acc_modelo_text);
    fila.bateria = texto(l.acc_marca_text);
    fila.mando = texto(l.mando_text);
    fila.cargador = texto(l.cargador_text);
  } else {
    fila.colorCadena = texto(l.cad_color_text);
    fila.alturaCadena = Number(l.cad_Altura) > 0 ? formatMedida(l.cad_Altura) : '';
  }
  return { plantilla: motor ? 'motor' : 'cadena', fila: fila, unidades: Math.max(parseInt(l.cantidad, 10) || 1, 1) };
}

/* Cortinas iguales (todas las columnas menos la estancia):
   - MINIMO_AGRUPAR o más: una fila con la cantidad; las estancias distintas se juntan.
   - Menos: una fila por cortina, cada una con su estancia.
   Los grupos salen en el orden en que aparece su primera línea. */
function agrupar(lineas, columnas) {
  const campos = columnas.map(function (c) { return c.campo; })
    .filter(function (c) { return NO_AGRUPAN.indexOf(c) < 0; });
  const grupos = [];
  const porClave = {};
  lineas.forEach(function (l) {
    const clave = JSON.stringify(campos.map(function (c) { return l.fila[c] || ''; }));
    let g = porClave[clave];
    if (!g) {
      g = porClave[clave] = { fila: l.fila, unidades: [] };
      grupos.push(g);
    }
    for (let i = 0; i < l.unidades; i++) g.unidades.push(l.fila.estancia);
  });

  const filas = [];
  grupos.forEach(function (g) {
    if (g.unidades.length >= MINIMO_AGRUPAR) {
      const estancias = g.unidades.filter(function (e, i, a) { return e && a.indexOf(e) === i; });
      filas.push(Object.assign({}, g.fila, { estancia: estancias.join(', '), cantidad: g.unidades.length }));
    } else {
      g.unidades.forEach(function (estancia) {
        filas.push(Object.assign({}, g.fila, { estancia: estancia, cantidad: '' }));
      });
    }
  });
  return filas;
}

function montarSeccion(nombre, lineas) {
  const filas = agrupar(lineas, COLUMNAS[nombre]);
  const columnas = COLUMNAS[nombre].filter(function (c) {
    return COLUMNAS_OPCIONALES.indexOf(c.campo) < 0 || filas.some(function (f) { return f[c.campo]; });
  });
  const hojas = [];
  for (let i = 0; i < filas.length; i += FILAS_POR_HOJA) {
    hojas.push({
      columnas: columnas,
      filas: filas.slice(i, i + FILAS_POR_HOJA).map(function (f) {
        return columnas.map(function (c) { return { valor: f[c.campo], clase: c.clase || '' }; });
      })
    });
  }
  return hojas;
}

function montarModelo(doc, datos, nombreFichero) {
  const c = datos.cabecera;
  const porPlantilla = { cadena: [], motor: [] };
  datos.lineas.forEach(function (l) {
    const linea = filaDeLinea(l);
    porPlantilla[linea.plantilla].push(linea);
  });

  const hojas = montarSeccion('cadena', porPlantilla.cadena).concat(montarSeccion('motor', porPlantilla.motor));
  hojas[hojas.length - 1].ultima = true;

  const hoy = new Date();
  return {
    nombreFichero: nombreFichero,
    fechaImpresion: dosDigitos(hoy.getDate()) + '/' + dosDigitos(hoy.getMonth() + 1) + '/' + hoy.getFullYear(),
    textoDocumento: doc.textoDocumento,
    referencia: texto(c.REFCLIENTE) || String(c.IDROW),
    textoFecha: doc.textoFecha,
    fecha: formatFecha(c.FECHA),
    fechaPrevista: fechaPrevista(c.FECHA),
    hojas: hojas
  };
}

// La plantilla se lee en cada impresión: es pequeña y así un cambio no obliga a reiniciar
function generarHtml(modelo) {
  const plantilla = Handlebars.compile(fs.readFileSync(PLANTILLA, 'utf8'));
  return plantilla(modelo);
}

async function impresion_enrollable_pdf(req, res) {
  const p = validarParametros(req, res);
  if (!p) return;
  try {
    const pool = await sql.connect();
    const datos = await leerDatos(pool, p.doc, p.id);
    if (!datos) {
      return res.status(404).json({ error: 'No existe el ' + req.params.doc + ' ' + p.id });
    }
    if (CLIENTES.indexOf(datos.cabecera.CLIENTE) < 0) {
      return res.status(404).json({ error: 'El ' + req.params.doc + ' ' + p.id + ' es de un cliente que imprime con Crystal' });
    }
    if (!datos.lineas.length) {
      return res.status(404).json({ error: 'El ' + req.params.doc + ' ' + p.id + ' no tiene líneas de enrollable' });
    }

    // El título del documento es el nombre con el que el visor del navegador propone guardarlo
    const nombreFichero = 'Enrollable_' + req.params.doc + '_' + p.id;
    const buffer = await pdf.generarPdf(generarHtml(montarModelo(p.doc, datos, nombreFichero)), { landscape: true, titulo: nombreFichero });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': buffer.length,
      'Content-Disposition': 'inline; filename="' + nombreFichero + '.pdf"',
      'Cache-Control': 'no-store'
    });
    res.end(buffer);
  } catch (err) {
    console.error('impresion_enrollable_pdf:', err);
    res.status(500).json({ error: 'Error generando el PDF del ' + req.params.doc });
  }
}

module.exports = {
  impresion_enrollable_info,
  impresion_enrollable_pdf
};
