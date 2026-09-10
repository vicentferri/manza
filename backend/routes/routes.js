'use strict'

var express = require('express');
var SubFamiliaController = require('../controllers/nh/subfamilia');
var FamiliaController = require('../controllers/nh/familias');
var ColoresController = require('../controllers/nh/colores');
var CalidadesController = require('../controllers/nh/calidades');
var ComposicionesController = require('../controllers/nh/composiciones');
var CategoriasController = require('../controllers/nh/categorias');
var ArticulosController = require('../controllers/nh/articulos');
var ClientesController = require('../controllers/nh/clientes');
var ImpresionController = require('../controllers/sm/impresion');

var UsersController = require('../controllers/common/users');
var AuthController = require('../middlewares/authenticated');
var BestellungController = require('../controllers/nh/bestellungen');
var BudgetController = require('../controllers/nh/budget');
var TransportTicket = require('../controllers/nh/transport');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/articles'});



var api = express.Router();

api.get('/api_subfamilias',SubFamiliaController.api_subfamilias);
api.get('/subfamilias',SubFamiliaController.subfamilias);
api.post('/subfamilia',SubFamiliaController.put_subfamilia);
api.post('/publish_subfamilias',SubFamiliaController.publish_subfamilia);
api.get('/subfamilias_filter/:fam',SubFamiliaController.subfamilias_filter);


api.get('/api_familias',FamiliaController.api_familias);
api.get('/familias',FamiliaController.familias);
api.post('/familia',FamiliaController.put_familia);
api.post('/publish_familias',FamiliaController.publish_familia);
api.get('/familias_filter',FamiliaController.familias_filter);


api.get('/api_colores',ColoresController.api_colores);
api.get('/colores',ColoresController.colores);
api.post('/color',ColoresController.put_colores);
api.post('/publish_colores',ColoresController.publish_color);
api.get('/colores_filter',ColoresController.colores_filter);


api.get('/api_calidades',CalidadesController.api_calidades);
api.get('/calidades',CalidadesController.calidades);
api.post('/calidad',CalidadesController.put_calidad);
api.post('/publish_calidades',CalidadesController.publish_calidad);
api.get('/calidades_filter/:fam',CalidadesController.calidades_filter);


api.get('/api_composiciones',ComposicionesController.api_composiciones);
api.get('/composiciones',ComposicionesController.composiciones);
api.post('/composicion',ComposicionesController.put_composicion);
api.post('/publish_composiciones',ComposicionesController.publish_composicion);
api.get('/composiciones_filter',ComposicionesController.composiciones_filter);


api.get('/api_categorias',CategoriasController.api_categorias);
api.get('/categorias',CategoriasController.categorias);
api.post('/categoria',CategoriasController.put_categoria);
api.post('/publish_categorias',CategoriasController.publish_categoria);
api.get('/form_categorias',CategoriasController.form_categorias);


api.get('/api_articulos',ArticulosController.api_articulos);
api.get('/articulos',ArticulosController.articulos);
api.post('/articulo',ArticulosController.put_articulo);
api.post('/publish_articulos',ArticulosController.publish_articulo);
api.get('/articulos/:criterio/:alias/:barras/:familia/:subfamilia/:color/:composicion/:calidad/:publicados',ArticulosController.articulos_filtered);
api.post('/articulos_genericos',ArticulosController.bulk_genericos);
api.post('/articulos_genericos_en',ArticulosController.bulk_genericos_en);
api.post('/articulos_genericos_fr',ArticulosController.bulk_genericos_fr);
api.get('/api_stock',ArticulosController.api_stock);
api.get('/api_stock/:articulo',ArticulosController.api_stock_article);
api.get('/unidades',ArticulosController.unidades);

api.post('/articulos_stock/:article/:amount/:ud',ArticulosController.stock_add);
api.get('/api_tarifa',ArticulosController.api_tarifa);
api.get('/api_tarifa/:articulo',ArticulosController.api_tarifa);



api.get('/clientes',ClientesController.clientes);
api.get('/formclientes',ClientesController.form_clientes);
api.get('/grupomodeloform',ClientesController.grupo_modelo_form);
api.get('/grupospmodeloform',ClientesController.grupo_spmodelo_form);
api.get('/formcolores',ClientesController.form_colores);
api.get('/formtejidos',ClientesController.form_tejidos);
api.get('/clientes_direcciones/:cli',ClientesController.clientes_direcciones);
//api.post('/customer_new',AuthController.ensureAuth,ClientesController.NeueKunde);
api.post('/customer_new',ClientesController.NeueKunde);

api.get('/bestellungen', BestellungController.bestellungen);
api.post('/bestellung_neue',BestellungController.Neue_Bestellung);

api.get('/bestellungen2', BestellungController.bestellungen2);
api.get('/bestellungen2/:idrow', BestellungController.bestellungen2);
api.get('/bestellungen_zustand/:zustand', BestellungController.bestellungen_zustand);
api.get('/bestellungen_zustand_customer/:zustand/:customer', BestellungController.bestellungen_zustand_customer);
//api.get('/bestellungen_zustand_customer/:zustand/:customer/:desde/:hasta', BestellungController.bestellungen_zustand_customer);

api.get('/bestellung_get/:id/:cli', BestellungController.bestellung_get);
api.get('/bestellung_lines_get/:id/:cli', BestellungController.bestellung_lines_get);

api.get('/bestellungen2_lin/:idrow', BestellungController.bestellungen2_lin);
api.get('/bestellungen2_lin_tip/:idrow/:tipo', BestellungController.bestellungen2_lin_tipo);
api.get('/bestellung_zustanden',BestellungController.bestellungen_zustanden);

api.post('/bestellung_zustand',BestellungController.Bestellung_Zustand);
api.get('/bestellungen_process/:cliente',BestellungController.bestellungen_process);

api.post('/bestellungen_zustanden',BestellungController.bestellungen_zustanden_post);

/* VFF 18.05.2022 */
api.post('/bestellung_delete',BestellungController.bestellung_delete);



api.get('/budget_zustand/:zustand', BudgetController.budget_zustand);
api.get('/budget2', BudgetController.budget2);
api.get('/budget2/:idrow', BudgetController.budget2);
api.get('/budget2_lin/:idrow', BudgetController.budget2_lin);
api.get('/budget2_lin_tip/:idrow/:tipo', BudgetController.budget2_lin_tipo);

api.post('/budget2_to_bestellung',BudgetController.budget_to_bestellung);

api.post('/impresion_image/:id/:name/:tipo',md_upload,ImpresionController.uploadImage);
api.get('/images/:name',ImpresionController.getImage);


api.get('/transport/:albaran',TransportTicket.Send_TransportTicket);

api.get('/users',UsersController.users);
api.post('/register',UsersController.register);


var ArtikelnController = require('../controllers/haru/artikeln');
api.get('/artikeln/:criterio',ArtikelnController.artikeln);
api.get('/artikeln',ArtikelnController.artikeln);


api.post('/search_articles',ArtikelnController.search_articles_assigned);
api.post('/artikel_assign',ArtikelnController.artikel_assign);
api.post('/artikel_assign_delete',ArtikelnController.artikel_assign_delete);

api.post('/artikel_assign_fix',ArtikelnController.artikel_assign_fix);
api.post('/artikel_assign_delete_fix',ArtikelnController.artikel_assign_delete_fix);


api.get('/artikeln_tipo/',ArtikelnController.artikel_tipo);
api.get('/artikeln_elements',ArtikelnController.artikel_elements);
api.get('/artikeln_tipocalculo',ArtikelnController.artikel_tipocalculo);

api.get('/customers_tipo/',ArtikelnController.customers_tipo);
api.get('/artikel_fabric/:tipo',ArtikelnController.artikel_fabric);
api.get('/artikel_fabric_fix/:tipo/:producto',ArtikelnController.artikel_fabric_fix);

/* ARTIKEL FABRIC SETUP */
api.get('/artikel_fabric_setup',ArtikelnController.artikel_fabric_setup);
api.post('/artikel_fabric_setup',ArtikelnController.artikel_fabric_setup_add);
api.post('/artikel_fabric_delete',ArtikelnController.artikel_fabric_delete);

api.get('/artikel_fabric_setup_sm',ArtikelnController.artikel_fabric_setup_sm);
api.post('/artikel_fabric_setup_sm',ArtikelnController.artikel_fabric_setup_add_sm);
/* ARTIKEL FABRIC SETUP */

/* ARTIKEL FABRIC PARAMETERS */
api.get('/artikel_fabric_parameters',ArtikelnController.artikel_fabric_parameters);
api.post('/artikel_fabric_parameters_add',ArtikelnController.artikel_fabric_parameters_add);
api.post('/artikel_fabric_parameters_del',ArtikelnController.artikel_fabric_parameters_del);

api.get('/artikel_fabric_parameters_sm',ArtikelnController.artikel_fabric_parameters_sm);
/* ARTIKEL FABRIC PARAMETERS */

api.post('/artikel_fabric_simulate',ArtikelnController.artikel_fabric_simulate);
api.post('/artikel_fabric_sm_simulate',ArtikelnController.artikel_fabric_sm_simulate);

api.post('/artikel_fabric_desc',ArtikelnController.artikel_fabric_desc);
api.get('/artikel_fabric_desc',ArtikelnController.artikel_fabric_desc_get);
api.post('/artikel_fabric_desc_delete',ArtikelnController.artikel_fabric_desc_delete);
api.get('/artikel_formulas',ArtikelnController.artikel_fabric_formulas);

api.post('/artikeln_add',ArtikelnController.artikel_add);
api.post('/artikeln_del',ArtikelnController.artikel_del);

api.post('/artikel_parameters',ArtikelnController.artikel_parametres);
api.get('/artikel_parameters/:idrow',ArtikelnController.artikel_parametres_get);


/* New Frame 2.0 */
var AtributosController = require('../controllers/sm/atributos');
api.get('/atributes',AtributosController.tipoatributo);
api.post('/atributes_assign',AtributosController.tipoatributo_set);
api.get('/atributes_details_get/:idrow',AtributosController.atributo_details);

var MasterController = require('../controllers/haru/masters');
api.get('/haru_master/:master', MasterController.get);
api.post('/haru_master', MasterController.post);

/* New Frame 2.0 */

/* BULK und DBRawController */
var DBRawController = require('../controllers/haru/dbraw');
api.post('/update_table',DBRawController.UpdateTable);

var BulkController = require('../controllers/haru/bulk');
api.post('/bulk',BulkController.bulk);

/* AUTHENTICATE */
var AuthController = require('../controllers/common/users');
api.post('/authenticate',AuthController.Authenticate);



/* 02.07.2020 HARU CLASIFICACION */
var Clasificacion = require('../controllers/haru/clasificacion');
api.get('/clientes_actividad',Clasificacion.clientes_actividad);
api.get('/clientes_cadena',Clasificacion.clientes_cadena);
api.get('/clientes_gestion',Clasificacion.clientes_gestion);
api.get('/clientes_sector',Clasificacion.clientes_sector);
api.get('/clientes_paises',Clasificacion.clientes_paises);
api.get('/clientes_provincias/:pais',Clasificacion.clientes_provincias);
api.post('/clientes_search',Clasificacion.clientes_search);
api.get('/clientes_lista',Clasificacion.clientes_lista);
api.post('/clientes_import',Clasificacion.importar_clientes);

var FormasPagoController = require('../controllers/nh/formapago');
api.get('/formaspago',FormasPagoController.formaspago);

var PaisesController = require('../controllers/nh/paises');
api.get('/paises',PaisesController.Load);

var ExportGrid = require('../controllers/export/export');
api.post('/export_grid',ExportGrid.export_grid);


module.exports = api;

