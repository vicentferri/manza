'use strict'

var express = require('express');
var Auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/tarifas' });
var md_upload_images = multipart({ uploadDir: './uploads/honeycomb' });

const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

// Directorio donde se guardan los banners
// Ajusta la ruta al directorio real de uploads del servidor
const BANNER_DIR = path.join(__dirname, '../uploads_banners/banners');
const UPLOADS_DIR = path.join(__dirname, '../uploads_banners');

// Crea el directorio si no existe
if (!fs.existsSync(BANNER_DIR)) {
    fs.mkdirSync(BANNER_DIR, { recursive: true });
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, BANNER_DIR);
    },
    filename: (req, file, cb) => {
      // Nombre: banner_<idrow>.<extension>
      // Sobreescribe si ya existe uno anterior para el mismo idrow
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, 'banner_' + req.params.idrow + ext);
    }
  });
  
  const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no permitido'), false);
    }
  };
  
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }  // 5 MB máximo
  });

  // Directorio donde se guardan las imágenes de Impresión Digital
  const { v4: uuidv4 } = require('uuid');
  const IMPRESION_DIGITAL_DIR = path.join(__dirname, '../uploads_impresion_digital');
  const IMPRESION_DIGITAL_ORIGINALES_DIR = path.join(IMPRESION_DIGITAL_DIR, 'originales');

  if (!fs.existsSync(IMPRESION_DIGITAL_ORIGINALES_DIR)) {
    fs.mkdirSync(IMPRESION_DIGITAL_ORIGINALES_DIR, { recursive: true });
  }

  const impresionDigitalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, IMPRESION_DIGITAL_ORIGINALES_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, uuidv4() + ext);
    }
  });

  const uploadImpresionDigital = multer({
    storage: impresionDigitalStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }  // 50 MB máximo, las imágenes de origen pueden ser grandes
  });



var smapi = express.Router();

smapi.use('/uploads_banners', express.static(UPLOADS_DIR));
smapi.use('/uploads_impresion_digital', express.static(IMPRESION_DIGITAL_DIR));

/* BULK und DBRawController */
var DBRawController = require('../controllers/haru/dbraw');
smapi.post('/update_table',DBRawController.UpdateTable);

var AccionamientosController = require('../controllers/sm/accionamientos');
smapi.get('/accionamientos', AccionamientosController.accionamientos);
smapi.get('/form_accionamientos', AccionamientosController.form_accionamientos);
smapi.get('/accionamientos_filter', AccionamientosController.accionamientos_filter);
smapi.get('/accionamientos_tipos/:idrow', AccionamientosController.accionamientos_tipos);
smapi.get('/accionamientos_tipos_form/:tipo', AccionamientosController.accionamientos_tipos_form);
smapi.get('/accionamientos_marcas_form', AccionamientosController.accionamientos_marcas_form);
smapi.get('/accionamientos_modelos_form', AccionamientosController.accionamientos_modelos_form);
smapi.get('/accionamientos_tipos_filter/:idrow', AccionamientosController.accionamientos_tipos_filter);
smapi.get('/accionamientos_tipos_colores/:id', AccionamientosController.accionamientos_tipos_colores);
smapi.post('/accionamiento', AccionamientosController.put_accionamiento);
smapi.get('/accionamientos_clientes', AccionamientosController.accionamientos_clientes);
smapi.post('/accionamientos_clientes', AccionamientosController.put_accionamientos_clientes);
smapi.get('/accionamientosmarcas_clientes', AccionamientosController.accionamientosmarcas_clientes);
smapi.post('/accionamientosmarcas_clientes_del', AccionamientosController.accionamientosmarcas_clientes_del); /* VFF 16.05.2022 */
smapi.get('/accionamientos_marcas', AccionamientosController.accionamientos_marcas);
smapi.get('/accionamientos_modelos/:tipo', AccionamientosController.accionamientos_modelos);
smapi.get('/accionamientos_mapa', AccionamientosController.accionamientos_mapa);
smapi.post('/accionamientos_mapa_del', AccionamientosController.accionamientos_mapa_delete);
smapi.post('/accionamientos_mapa', Auth.ensureAuth, AccionamientosController.accionamientos_mapa_add);
smapi.post('/accionamientos_clientes_traduccion', AccionamientosController.put_accionamientos_clientes_traduccion);
smapi.post('/accionamientos_clientes_traduccion_update', AccionamientosController.put_accionamientos_clientes_traduccion_update);
smapi.get('/accionamientostipos_config', AccionamientosController.accionamientostipo_config);
smapi.post('/accionamientostipos_config', AccionamientosController.put_accionamientostipo_config);
smapi.post('/accionamientos_clientes_tarifas', AccionamientosController.accionamientosclientestarifas);
smapi.post('/accionamientos_clientes_tarifas_del', AccionamientosController.accionamientosclientestarifas_del);
smapi.post('/accionamientos_radio_tipo', AccionamientosController.accionamientosradiotipo);
smapi.post('/accionamientos_radio_tipo_del', AccionamientosController.accionamientosradiotipo_del);
smapi.post('/accionamientos_radio_tipo_cliente', AccionamientosController.accionamientosradiotipocliente_v2);
smapi.post('/accionamientos_radio_tipo_cliente_del', AccionamientosController.accionamientosradiotipocliente_del);
smapi.get('/articulos_accionamientos_clientes_tarifas', AccionamientosController.articulos_accionamientosclientestarifas);
smapi.get('/articulos_accionamientos_radio_tipo', AccionamientosController.articulos_accionamientosradiotipo);
smapi.get('/articulos_accionamientos_radio_tipo_cliente', AccionamientosController.articulos_accionamientosradiotipocliente);
smapi.get('/accionamientos_radiotipo_form', AccionamientosController.accionamientos_radiotipo_form);
smapi.get('/guias_form', AccionamientosController.guia_form);
smapi.get('/cajones_form', AccionamientosController.cajon_form);

smapi.get('/grupomodelos', AccionamientosController.grupo_modelo);
smapi.post('/grupomodelo', AccionamientosController.put_grupo_modelo);

var ColoresController = require('../controllers/sm/colores');
smapi.get('/colores', ColoresController.colores_marcas);
smapi.get('/colores_form/:tipo', ColoresController.colores_marcas_form);
smapi.post('/color', ColoresController.put_color);

var ContrapesosController = require('../controllers/sm/contrapeso');
smapi.get('/contrapesos', ContrapesosController.contrapesos);
smapi.post('/contrapeso', ContrapesosController.put_contrapeso);
smapi.get('/contrapesosclientes', ContrapesosController.contrapesosclientes);
smapi.post('/contrapesosclientes', ContrapesosController.contrapesosclientes_put);
smapi.post('/contrapesosclientes_delete', ContrapesosController.contrapesoclientes_del);
smapi.get('/contrapesos_form', ContrapesosController.form_contrapesos);

smapi.get('/contrapesoscolores_clientes', ContrapesosController.contrapesoscoloresclientes);
smapi.post('/contrapesoscolor', ContrapesosController.contrapesoscolor_put);
smapi.post('/contrapesoscolor_delete', ContrapesosController.contrapesocolor_del);

smapi.post('/contrapeso_clientes_tarifas', ContrapesosController.contrapesoclientestarifas);
smapi.post('/contrapeso_clientes_tarifas_del', ContrapesosController.contrapesoclientestarifas_del);
smapi.get('/articulos_contrapeso_clientes_tarifas', ContrapesosController.articulos_contrapesoclientestarifas);
smapi.get('/contrapeso_form', ContrapesosController.contrapeso_form);

var SoportesController = require('../controllers/sm/soportes');
smapi.get('/soportes', SoportesController.soportes);
smapi.post('/soporte', SoportesController.put_soporte);
smapi.get('/soportesclientes', SoportesController.soportesclientes);
smapi.post('/soportesclientes', SoportesController.soportesclientes_put);
smapi.get('/soportes_form', SoportesController.form_soportes);
smapi.get('/soportescolores_clientes', SoportesController.soportescoloresclientes);
smapi.post('/soportesclientes_delete', SoportesController.soportesclientes_delete);
smapi.get('/soporte_form', SoportesController.soportesform);

smapi.post('/soportescolores', SoportesController.soportescolores_put);
smapi.post('/soportescolores_delete', SoportesController.soportesolores_delete);

var TapasController = require('../controllers/sm/tapas');
smapi.get('/tapas', TapasController.tapas);
smapi.post('/tapa', TapasController.put_tapa);
smapi.get('/tapasclientes', TapasController.tapasclientes);
smapi.post('/tapasclientes', TapasController.tapasclientes_put);
smapi.post('/tapasclientes_delete', TapasController.tapasclientes_delete);
smapi.get('/tapas_form', TapasController.tapasform);
smapi.get('/tapascolores_clientes', TapasController.tapasclientescolores);

smapi.post('/tapascolores', TapasController.tapascolores_put);
smapi.post('/tapascolores_delete', TapasController.tapascolores_delete);
smapi.get('/tapas_form', TapasController.form_tapas);

var TubosController = require('../controllers/sm/tubos');
smapi.get('/tubos', TubosController.tubos);
smapi.get('/tubos_filter', TubosController.tubos_filter);
smapi.post('/tubo', TubosController.put_tubo);

var AlturaCadenaController = require('../controllers/sm/alturacadena');
smapi.get('/alturacadena', AlturaCadenaController.alturacadena);

var EstanciasController = require('../controllers/sm/estancias');
smapi.get('/estancias', EstanciasController.estancias);
smapi.post('/estancia', EstanciasController.put_estancia);

var EmbalajesController = require('../controllers/sm/embalajes');
smapi.get('/embalajes', EmbalajesController.embalajes);
smapi.post('/embalaje', EmbalajesController.put_embalaje);

var EmpaquetadosController = require('../controllers/sm/empaquetado');
smapi.post('/empaquetado', EmpaquetadosController.put_empaquetado);
smapi.get('/empaquetados', EmpaquetadosController.empaquetados);

var InstalacionesController = require('../controllers/sm/instalacion');
smapi.get('/instalaciones', InstalacionesController.instalaciones);
smapi.post('/instalacion', InstalacionesController.put_instalacion);

var PosicionmandoController = require('../controllers/sm/posicionmando');
smapi.get('/posicionmando', PosicionmandoController.posicionmando);
smapi.post('/posicionmando', PosicionmandoController.put_posicionmando);

var AncholamaController = require('../controllers/sm/ancholama');
smapi.get('/anchoslama', AncholamaController.anchoslama);

var TejidosController = require('../controllers/sm/tejidos');
smapi.get('/tejidos', TejidosController.tejidos);
smapi.get('/tejidos_salida', TejidosController.tejidos_salida);
smapi.get('/tejidos_cliente/:cliente', TejidosController.tejidos_clientes);
smapi.get('/tejidos_cliente_filter/:cliente', TejidosController.tejidos_clientes_filter);
smapi.post('/tejido', TejidosController.put_tejido);
smapi.post('/tejidos_cliente', TejidosController.put_tejidos_clientes);
smapi.get('/tejido_ext/:id', TejidosController.tejidos_ext);
smapi.post('/tejidos_ext_set', TejidosController.tejidos_ext_set);
smapi.post('/tejidos_colores', TejidosController.put_tejidos_colores);
smapi.post('/tejidos_colores_traduccion', TejidosController.put_tejidos_colores_traduccion);
smapi.post('/tejidos_colores_traduccion_del', TejidosController.del_tejidos_colores_traduccion);
smapi.get('/tejidos_colores', TejidosController.tejidos_colores);
smapi.get('/tejidos_colores_filtered/:tejido/:ops', TejidosController.tejidos_colores_filtered);
smapi.post('/tejidos_colores_assign', TejidosController.tejidos_colores_assign);
smapi.post('/tejidos_colores_delete', TejidosController.tejidos_colores_delete);
smapi.get('/tejidos_tarifas', TejidosController.tejidos_tarifas);
smapi.get('/tejidos_clientes_descripcion', TejidosController.tejidos_clientes_descripcion);
smapi.post('/tejidos_descripcion', TejidosController.put_tejidos_descripcion);
smapi.post('/tejidos_del', TejidosController.del_tejido);
smapi.post('/tejidos_cliente_del', TejidosController.del_tejido_cliente);
smapi.get('/tejidos_cliente_producto', TejidosController.tejidos_cliente_producto);
smapi.post('/tejidos_cliente_producto_operate', TejidosController.tejidos_cliente_producto_operate);

smapi.get('/tejidos_atributos', TejidosController.tejidos_atributos);
smapi.post('/tejidos_atributos_put', TejidosController.put_tejidos_atributos);
smapi.post('/tejidos_atributod_del', TejidosController.del_tejido_atributos);

var ImpresionDigitalController = require('../controllers/sm/impresion-digital');
smapi.get('/impresion_digital_colecciones', ImpresionDigitalController.colecciones);
smapi.post('/impresion_digital_coleccion', ImpresionDigitalController.coleccion_put);
smapi.post('/impresion_digital_coleccion_del', ImpresionDigitalController.coleccion_del);
smapi.get('/impresion_digital_imagenes', ImpresionDigitalController.imagenes);
smapi.post('/impresion_digital_imagen', uploadImpresionDigital.single('image'), ImpresionDigitalController.imagen_upload);
smapi.post('/impresion_digital_imagen_update', ImpresionDigitalController.imagen_update);
smapi.post('/impresion_digital_imagen_del', ImpresionDigitalController.imagen_del);
smapi.post('/impresion_digital_imagen_preview', ImpresionDigitalController.imagen_preview);

var ColoresController = require('../controllers/sm/colores');
smapi.get('/colores_tejidos_atributos', ColoresController.colores_tejidos_atributos);
smapi.get('/colores_tejidos_atributos_clientes/:cli/:tej', ColoresController.colores_tejidos_atributos_clientes);

var ClientesController = require('../controllers/sm/clientes');
smapi.get('/clientesapi', ClientesController.clientes);
smapi.get('/clientesapi_filter', ClientesController.clientes_filter);
smapi.post('/clienteapi', ClientesController.put_cliente);
smapi.post('/clienteapi_del', ClientesController.del_cliente);
smapi.get('/clientesapi_tiendas/:cliente', ClientesController.clientes_tiendas);
smapi.get('/paises_filter', ClientesController.paises_filter);

smapi.get('/clientes_import', ClientesController.clientes_import);
smapi.get('/clientes_promociones', ClientesController.clientes_promociones);
smapi.get('/clientes_promociones_cliente/:cliente', ClientesController.clientes_promociones_cliente);
smapi.post('/clientes_promociones', ClientesController.clientes_promociones_set);
smapi.post('/clientes_promociones_del', ClientesController.clientes_promociones_del);


smapi.post('/clientes_promociones_program', ClientesController.clientes_promociones_program);
smapi.post('/promocion_banner/:idrow',upload.single('image'),ClientesController.clientes_promociones_banner);

smapi.get('/promociones_activas', ClientesController.clientes_promociones_activas);
smapi.get('/pedidos_promocion', ClientesController.clientes_pedidos_promocion);


smapi.post('/domicilios', ClientesController.domicilios);
smapi.post('/domicilios_del', ClientesController.domicilios_del);



var TarifasController = require('../controllers/sm/tarifas');
smapi.post('/tarifas', TarifasController.put_tarifa);
smapi.get('/tarifas', TarifasController.tarifas_search);
smapi.get('/tarifa/:idrow', TarifasController.tarifa);
smapi.get('/tarifa_lineas/:idrow', TarifasController.tarifa_lineas);
smapi.post('/tarifa_map', TarifasController.put_tarifa_map);
smapi.post('/tarifa_file/:idrow/:type', md_upload, TarifasController.tarifa_file);
smapi.post('/tarifa_paste/:idrow/:type', TarifasController.tarifa_paste);
smapi.get('/tarifa_file_process/:name/:idrow/:type', TarifasController.process);
smapi.get('/tarifa_deletelines/:idrow', TarifasController.delete_lines);
smapi.post('/tarifa_delete_all', TarifasController.delete_all);
smapi.post('/tarifa_regenerate', TarifasController.regenerate);
smapi.post('/tarifa_regenerate2', TarifasController.regenerate2);
smapi.get('/tarifa_calculate/:cliente/:tubo/:tejido/:marca/:ancho/:alto/:ancholama/:producto', TarifasController.calculate);
smapi.get('/tarifa_export/:tarifas', TarifasController.tarifas_export);
smapi.post('/tarifa_simulate', TarifasController.Simulation);
smapi.post('/tarifa_simulate_cliente', TarifasController.Simulation_Cliente);
smapi.post('/tarifa_simulate_del', TarifasController.Simulation_Del);
smapi.post('/tarifa_simulate_del_multiple', TarifasController.Simulation_Del_Multiple);

smapi.post('/tarifa_simulate_cliente_del', TarifasController.Simulation_cliente_Del);
smapi.get('/tarifa_simulate/:idrow', TarifasController.tarifa_simulate);
smapi.get('/tarifa_simulate_cli/:idrow', TarifasController.tarifa_simulate_cli);
smapi.get('/tarifa_simulate_search/:estado', TarifasController.tarifas_simulate_search);
smapi.get('/tarifa_simulate_cli_search', TarifasController.tarifas_simulate_cli_search);
smapi.get('/tarifas_simulate_export/:tipo/:tarifas', TarifasController.tarifas_simulate_export);
smapi.post('/tarifas_simulate_export_v2', TarifasController.tarifas_simulate_export_v2);
smapi.post('/tarifas_simulate_cliente_export_v2', TarifasController.tarifas_simulate_cliente_export_v2);
smapi.post('/tarifas_genera_cliente', TarifasController.tarifas_genera_cliente);
smapi.get('/tarifa_simulate_export_types', TarifasController.tarifa_simulate_export_types);
smapi.post('/tarifa_simulate_articles', TarifasController.tarifa_simulate_articles);
smapi.get('/tarifa_simulate_lines/:idrow', TarifasController.tarifa_simulate_lines);
smapi.get('/tarifa_simulate_line/:id', TarifasController.tarifa_simulate_line);
smapi.get('/tarifa_simulate_times/:idrow', TarifasController.tarifa_simulate_times);
smapi.get('/tarifa_simulate_table/:idrow/:bloque', TarifasController.tarifa_simulate_table);
smapi.get('/tarifa_simulate_cliente_table/:idrow/:bloque', TarifasController.tarifa_simulate_cliente_table);
smapi.get('/tarifa_simulate_table_details/:tarifa/:row/:col', TarifasController.tarifa_simulate_table_details);
smapi.get('/tarifa_simulate_table_details_articles/:tarifa/:row/:col/:type', TarifasController.tarifa_simulate_table_details_articles);
smapi.get('/tarifa_simulate_table_sync/:idrow', TarifasController.tarifa_simulate_table_sync);
smapi.get('/tarifa_simulate_table_sync_lm/:idrow', TarifasController.tarifa_simulate_table_sync_lm);
smapi.get('/tarifa_simulate_table_sync_cue', TarifasController.tarifa_simulate_table_sync_cue);
smapi.get('/tarifa_simulate_table_sync_cue_lm', TarifasController.tarifa_simulate_table_sync_cue_lm);

smapi.post('/tarifa_simulate_table_sync_operate', TarifasController.tarifa_simulate_table_sync_operate);
smapi.post('/tarifa_simulate_table_sync_operate_lm', TarifasController.tarifa_simulate_table_sync_operate_lm);
smapi.post('/tarifa_cliente_simulate_table_sync_operate', TarifasController.tarifa_cliente_simulate_table_sync_operate);
smapi.get('/tarifa_cliente_simulate_table_sync_cue', TarifasController.tarifa_cliente_simulate_table_sync_cue);
smapi.get('/tarifa_cliente_simulate_table_sync/:idrow', TarifasController.tarifa_cliente_simulate_table_sync);

smapi.post('/tarifa_clonate', TarifasController.clonate);
smapi.post('/tarifa_bulk', TarifasController.bulk);
smapi.post('/tarifa_operation', TarifasController.operation);
smapi.post('/tarifa_genera_multiple', TarifasController.tarifas_genera_multiple);
smapi.post('/tarifas_articulos_comunes', TarifasController.tarifas_articulos_comunes);
smapi.post('/tarifas_articulos_borrar_multiple', TarifasController.tarifas_articulos_borrar_multiple);
smapi.post('/tarifas_articulos_agregar_multiple', TarifasController.tarifas_articulos_agregar_multiple);
smapi.post('/tarifas_articulos_actualizar_multiple', TarifasController.tarifas_articulos_actualizar_multiple);
smapi.post('/tarifas_parametros_export', TarifasController.tarifas_parametros_export);
smapi.post('/tarifas_parametros_export_cliente', TarifasController.tarifas_parametros_export_cliente);
smapi.post('/tarifas_parametros_export_lm', TarifasController.tarifas_parametros_export_lm);

smapi.post('/tarifas_update_coste', Auth.ensureAuth, TarifasController.tarifas_update_coste);
smapi.post('/tarifas_update_manoobra', Auth.ensureAuth, TarifasController.tarifas_update_manoobra);
smapi.get('/tarifas_update_manoobra_apply', TarifasController.tarifas_update_manoobra_apply);

smapi.post('/accesorios_tarifas', TarifasController.accesoriostarifas);
smapi.post('/accesorios_tarifas_del', TarifasController.accesoriostarifas_del);
smapi.post('/tarifa_mecanismo_vertical', TarifasController.tarifamecanismovertical);
smapi.post('/tarifa_mecanismo_vertical_del', TarifasController.tarifamecanismovertical_del);
smapi.post('/tarifa_tejido_vertical', TarifasController.tarifatejidovertical);
smapi.post('/tarifa_tejido_vertical_del', TarifasController.tarifatejidovertical_del);
smapi.get('/articulos_accesorios_tarifas', TarifasController.articulos_accesoriostarifas);
smapi.get('/articulos_tarifa_mecanismo_vertical', TarifasController.articulos_tarifamecanismovertical);
smapi.get('/articulos_tarifa_tejido_vertical', TarifasController.articulos_tarifatejidovertical);

var GruposTejidosController = require('../controllers/sm/grupos');
smapi.get('/grupos', GruposTejidosController.grupostejidos);
smapi.post('/grupos', GruposTejidosController.grupostejidos_add);
smapi.post('/grupos_del', GruposTejidosController.grupostejidos_del);

smapi.post('/tejidosgrupos', GruposTejidosController.grupostejidos_tejidos);
smapi.post('/tejidosgrupos_del', GruposTejidosController.grupostejidos_tejidos_del);
smapi.get('/tejidosgrupos/:idrow', GruposTejidosController.tejidosgrupo);



var SimulateController = require('../controllers/sm/simulate');
smapi.get('/simulate_origin_info', SimulateController.simulate_origin_info);
smapi.get('/simulate_processed_info', SimulateController.simulate_processed_info);
smapi.get('/simulate_sim_info', SimulateController.simulate_sim_info);

var CortinaDecorController = require('../controllers/sm/cortinadecor');
smapi.get('/cd_model_productos', CortinaDecorController.get_model_lines);
smapi.get('/cd_model_productos_colores/:idrow', CortinaDecorController.get_model_lines_colores);
smapi.post('/cd_model_productos_colores', CortinaDecorController.set_model_lines_colores);
smapi.get('/cd_model_productos_assign/:id/:producto/:tejido', CortinaDecorController.set_model_assign);
smapi.get('/cd_model_productos_create/:name/:producto/:tejido', CortinaDecorController.set_model_create);
smapi.post('/cd_model_productos_delete', CortinaDecorController.set_model_delete);

smapi.get('/cd_model_colores_assign/:id/:color', CortinaDecorController.set_model_colores);
smapi.get('/cd_bestellung_detail/:id', CortinaDecorController.cd_bestellung_detail);

smapi.get('/cd_bestellung_signal/:id', CortinaDecorController.Signal);
smapi.get('/cd_articulos/:attr', CortinaDecorController.Atributos_Articulos);
smapi.get('/cd_articulos_ddl', CortinaDecorController.Atributos_Articulos_ddl);
smapi.post('/cd_articulo_assign', CortinaDecorController.Atributos_Articulos_Assign);
smapi.post('/cd_articulo_delete', CortinaDecorController.Atributos_Articulos_Delete);
smapi.post('/cd_articulo_update', CortinaDecorController.Atributos_Articulos_Update);

smapi.post('/cd_model_atributes_add', CortinaDecorController.Atributos_Articulos_Add);
smapi.post('/cd_model_atributes_new', CortinaDecorController.Atributos_Articulos_New);

var ConfigController = require('../controllers/sm/config');
smapi.get('/configuracion', ConfigController.configuracion_get);
smapi.post('/configuracion', ConfigController.configuracion_post);
smapi.post('/configuracion_sm', ConfigController.configuracion_sm_post);


var ExportController = require('../controllers/sm/export');
smapi.get('/export_file/', ExportController.exportFile);
smapi.get('/export_csv/:id/:cli', ExportController.exportCSV);
smapi.get('/detail/:id/:cli/:force', ExportController.getDetail);
smapi.get('/detail_sim/:id/:cli/:force', ExportController.getDetailSIM);

smapi.get('/parameters/:id/:cli/:force', ExportController.getDetailParameters);
smapi.get('/detail_id/:idrow/:cli/:id', ExportController.getDetail_ID);
smapi.post('/ordenfabricacion_articulos', ExportController.ordenfabricacion_articulos);
smapi.post('/ordenfabricacion_articulos_edit', ExportController.ordenfabricacion_articulos_edit);

var TablaTejidos = require('../controllers/sm/precio_tejidos');
smapi.get('/tabla_precio_tejidos/:criterio/:margen/:preciom2', TablaTejidos.tabla_tejidos);

var TiendasControllers = require('../controllers/sm/tiendas');
smapi.get('/tiendas_cliente/:cliente', TiendasControllers.Tiendas);
smapi.post('/pedido_tienda', TiendasControllers.Tienda);
smapi.post('/pedido_referencia', TiendasControllers.Referencia);


/* GESTIO D'USUARIS */
var UsersController = require('../controllers/common/users');
smapi.get('/users', UsersController.users);
smapi.post('/register', UsersController.register);
smapi.post('/user_del', UsersController.user_del);
smapi.post('/authenticate', UsersController.Authenticate);

/* Permisos de usuarios internos (solo admin) */
smapi.get('/users/:id/permisos', UsersController.getPermisos);
smapi.post('/users/:id/permisos', UsersController.savePermisos);

/* CLIENTES_USERS: Gestión de clientes externos */
smapi.get('/clientes_users', ClientesController.getClientesUsers);
smapi.post('/client_register', ClientesController.client_register);
smapi.post('/clientes_users_del', ClientesController.clientes_users_del);


var BulkController = require('../controllers/haru/bulk');
smapi.post('/bulk', BulkController.bulk);

var BackupController = require('../controllers/sm/backup');
smapi.get('/backup_list', BackupController.search);
smapi.post('/backup_create', BackupController.backup_create);
smapi.post('/backup_delete', BackupController.backup_delete);
smapi.post('/backup_recover', BackupController.backup_restore);


var ImportController = require('../controllers/sm/import');
smapi.post('/import_tables', ImportController.import_tables);
smapi.get('/import_tables/:table', ImportController.gettables);


var PanelJaponesController = require('../controllers/sm/paneljapones');
smapi.get('/japones_tarifa_cliente/:cliente', PanelJaponesController.tarifa_cliente);
smapi.post('/japones_tarifa_cliente', PanelJaponesController.tarifa_cliente_update);

smapi.post('/mecanismo_japones_tarifas', PanelJaponesController.mecanismojaponestarifas);
smapi.post('/mecanismo_japones_tarifas_del', PanelJaponesController.mecanismojaponestarifas_del);
smapi.get('/articulos_mecanismo_japones_tarifas', PanelJaponesController.articulos_mecanismojaponestarifas);

var IncrementosController = require('../controllers/sm/incrementos');
smapi.get('/tipo_incrementos', IncrementosController.tipo_incrementos);
smapi.get('/incrementosG', IncrementosController.articulos_incrementos_genericos);
smapi.get('/producto_incrementos/:tabla', IncrementosController.producto_incrementos);
smapi.post('/incrementos', IncrementosController.producto_tabla_incrementos);
smapi.post('/producto_incremento_update', IncrementosController.producto_incremento_update);
smapi.post('/incremetosgenericos', IncrementosController.incremetosgenericos);
smapi.post('/incremetosG_del', IncrementosController.incrementosG_del);
smapi.post('/articulosincrementos', IncrementosController.incremetos);
smapi.post('/incremetos_del', IncrementosController.incrementos_del);
smapi.get('/articulos_incrementos', IncrementosController.articulos_incrementos);
smapi.post('/articulosincrementoscajones', IncrementosController.incremetos_cajones);
smapi.post('/incremetoscajones_del', IncrementosController.incrementos_cajones_del);
smapi.get('/articulos_incrementos_cajones', IncrementosController.articulos_incrementos_cajones);
smapi.get('/articulos_incrementos_lacados', IncrementosController.articulos_incrementos_lacados);
smapi.post('/articulosincrementoslacados', IncrementosController.incremetos_lacados);
smapi.post('/incremetos_lacados_del', IncrementosController.incrementoslacados_del);

var LM = require('../controllers/sm/lm/leroymerlin');
smapi.get('/cajones:cli/:tipo', LM.cajones);
smapi.get('/guias/:cli/:tipo', LM.guias);

smapi.post('/cajones_del', LM.cajones_del);
smapi.post('/guias_del', LM.guias_del);

smapi.get('/guia', LM.guia);
smapi.get('/cajon', LM.cajon);
smapi.get('/cajoncliente', LM.cajon_cliente);

smapi.post('/put_guia', LM.put_guia);
smapi.post('/put_cajon', LM.put_cajon);
smapi.post('/put_cajoncliente', LM.put_cajon_cliente);
smapi.post('/cajoncliente_del', LM.cajon_cliente_del);


/* SECCION DE ARTICULOS SM */
var SM_Articulos = require('../controllers/sm/articulos');
smapi.post('/articulos', SM_Articulos.search_articulos);

/* MANDOS */
var CargadorController = require('../controllers/sm/mandos');
smapi.delete('/mandos_cargador/:id',Auth.ensureAuth, CargadorController.mandos_cargador_del); 
smapi.post('/mandos_cargador',Auth.ensureAuth, CargadorController.mandos_cargador_set); 
smapi.get('/mandos_cargadores',Auth.ensureAuth, CargadorController.mandos_cargadores_get); 



/* VFF 12.02.2026 HONEYCOMB */
var HoneyCombController = require('../controllers/sm/honeycomb');

smapi.delete('/honeycomb_delete_image/:tipo/:id', HoneyCombController.honeycomb_delete_image);

smapi.get('/honeycomb_obtener_tarifa', HoneyCombController.honeycomb_obtener_tarifa);
smapi.get('/honeycomb/obtener_precio_lote', Auth.ensureAuth, HoneyCombController.honeycomb_obtener_precio_lote);
smapi.get('/honeycomb/obtener_tarifa_tipotejido', Auth.ensureAuth, HoneyCombController.honeycomb_obtener_tarifa_tipotejido);
smapi.post('/honeycomb/actualizar_tarifa_tipotejido', Auth.ensureAuth, HoneyCombController.honeycomb_actualizar_tarifa_tipotejido);
smapi.get('/honeycomb/snapshot', Auth.ensureAuth, HoneyCombController.honeycomb_snapshot);
smapi.get('/honeycomb/historial', Auth.ensureAuth, HoneyCombController.honeycomb_historial);
smapi.get('/honeycomb/historial_restaurar', Auth.ensureAuth, HoneyCombController.honeycomb_historial_restaurar);

smapi.get('/honeycomb_tipostejido', HoneyCombController.honeycomb_tipostejido);
smapi.get('/honeycomb_colorestejido/:tipotejido', HoneyCombController.honeycomb_colorestejido);
smapi.get('/honeycomb_coloresperfil', HoneyCombController.honeycomb_coloresperfil);
smapi.get('/honeycomb_tiposaccionamiento', HoneyCombController.honeycomb_tiposaccionamiento);


// Gestión de imágenes
smapi.get('/honeycomb_obtener_imagen/:tipo/:id', HoneyCombController.honeycomb_obtener_imagen);
smapi.post('/honeycomb_upload_image/:tipo/:id', md_upload_images, HoneyCombController.honeycomb_upload_image);
smapi.post('/honeycomb_upload_image_base64/:tipo/:id', Auth.ensureAuth, HoneyCombController.honeycomb_upload_image_base64);
smapi.get('/honeycomb_list_images', HoneyCombController.honeycomb_list_images);

// Rutas CRUD - Tipos de Tejido
smapi.post('/honeycomb_tipotejido_insert', Auth.ensureAuth, HoneyCombController.honeycomb_tipotejido_insert);
smapi.post('/honeycomb_tipotejido_update', Auth.ensureAuth, HoneyCombController.honeycomb_tipotejido_update);
smapi.delete('/honeycomb_tipotejido_delete/:id', Auth.ensureAuth, HoneyCombController.honeycomb_tipotejido_delete);

// Rutas CRUD - Colores de Tejido
smapi.get('/honeycomb_colortejido_getall', HoneyCombController.honeycomb_colortejido_getall);
smapi.post('/honeycomb_colortejido_insert', Auth.ensureAuth, HoneyCombController.honeycomb_colortejido_insert);
smapi.post('/honeycomb_colortejido_update', Auth.ensureAuth, HoneyCombController.honeycomb_colortejido_update);
smapi.delete('/honeycomb_colortejido_delete/:id', Auth.ensureAuth, HoneyCombController.honeycomb_colortejido_delete);

// Rutas CRUD - Colores de Perfil
smapi.post('/honeycomb_colorperfil_insert', Auth.ensureAuth, HoneyCombController.honeycomb_colorperfil_insert);
smapi.post('/honeycomb_colorperfil_update', Auth.ensureAuth, HoneyCombController.honeycomb_colorperfil_update);
smapi.delete('/honeycomb_colorperfil_delete/:id', Auth.ensureAuth, HoneyCombController.honeycomb_colorperfil_delete);

// Rutas CRUD - Tipos de Accionamiento
smapi.post('/honeycomb_tipoaccionamiento_insert', Auth.ensureAuth, HoneyCombController.honeycomb_tipoaccionamiento_insert);
smapi.post('/honeycomb_tipoaccionamiento_update', Auth.ensureAuth, HoneyCombController.honeycomb_tipoaccionamiento_update);
smapi.delete('/honeycomb_tipoaccionamiento_delete/:id', Auth.ensureAuth, HoneyCombController.honeycomb_tipoaccionamiento_delete);


// Rutas Import/Export
smapi.post('/honeycomb_import_excel', Auth.ensureAuth, HoneyCombController.honeycomb_import_excel);
smapi.get('/honeycomb_export_excel', HoneyCombController.honeycomb_export_excel);

// Rutas Tarifas
smapi.get('/honeycomb_tarifas_get', HoneyCombController.honeycomb_tarifas_get);
smapi.post('/honeycomb_tarifa_update', Auth.ensureAuth, HoneyCombController.honeycomb_tarifa_update);
smapi.post('/honeycomb_tarifas_update', Auth.ensureAuth, HoneyCombController.honeycomb_tarifas_update);

  // Tipos artículo
  smapi.get('/honeycomb_tipo_articulo',           HoneyCombController.getTiposArticulo);
  smapi.post('/honeycomb_tipo_articulo',           Auth.ensureAuth, HoneyCombController.saveTipoArticulo);
  smapi.put('/honeycomb_tipo_articulo/:id',        Auth.ensureAuth, HoneyCombController.updateTipoArticulo);
  smapi.delete('/honeycomb_tipo_articulo/:id',     Auth.ensureAuth, HoneyCombController.deleteTipoArticulo);

  // Atributos
  smapi.get('/honeycomb_tipo_atributo/:idTipo',    HoneyCombController.getAtributosByTipo);
  smapi.post('/honeycomb_tipo_atributo',           Auth.ensureAuth, HoneyCombController.saveTipoAtributo);
  smapi.put('/honeycomb_tipo_atributo/:id',        Auth.ensureAuth, HoneyCombController.updateTipoAtributo);
  smapi.delete('/honeycomb_tipo_atributo/:id',     Auth.ensureAuth, HoneyCombController.deleteTipoAtributo);

  // Artículos
  smapi.get('/honeycomb_articulos',                HoneyCombController.getArticulos);
  smapi.post('/honeycomb_articulos/asignar_tipo',  Auth.ensureAuth, HoneyCombController.asignarTipoArticulo);
  smapi.post('/honeycomb_articulos/asignar_tipo_masivo', Auth.ensureAuth, HoneyCombController.asignarTipoMasivo);

  // Valores
  smapi.get('/honeycomb_articulos/:idArticuloERP/valores',  HoneyCombController.getValoresArticulo);
  smapi.post('/honeycomb_articulos/:idArticuloERP/valores', Auth.ensureAuth, HoneyCombController.saveValoresArticulo);

  // FK dinámico
  smapi.get('/honeycomb_fk_options',               HoneyCombController.getFKOptions);
  smapi.get('/honeycomb_tablas_fk',          HoneyCombController.getTablasFK);
  smapi.post('/honeycomb_tablas_fk',         Auth.ensureAuth, HoneyCombController.saveTablaFK);
  smapi.put('/honeycomb_tablas_fk/:id',      Auth.ensureAuth, HoneyCombController.updateTablaFK);
  smapi.delete('/honeycomb_tablas_fk/:id',   Auth.ensureAuth, HoneyCombController.deleteTablaFK);


module.exports = smapi;