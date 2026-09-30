'use strict'

var express = require('express');


var multipart = require('connect-multiparty');
var LM = require('../controllers/sm/lm/leroymerlin');
var Best = require('../controllers/sm/lm/bestellungen');
var Budget = require('../controllers/sm/lm/budget');
var TarifasController = require('../controllers/sm/lm/tarifas');
var FabricacionController = require('../controllers/sm/lm/fabricacion');

var md_upload = multipart({ uploadDir: './uploads/articles'});


var lmapi = express.Router();

lmapi.get('/accion/:cli/:pro',LM.accion);
lmapi.get('/accionT/:cli/:idrow/:tipo',LM.accionT);
lmapi.get('/accionC/:cli/:acc/:tipo/:produc',LM.accionC);
lmapi.get('/cargadores/:id',LM.Cargadores);
lmapi.get('/lacados/:cli',LM.lacados);

lmapi.get('/accion_gen/:cli',LM.accion_gen);
lmapi.get('/accionT_gen/:cli/:idrow/:tipo',LM.accionT_gen);
lmapi.get('/accionC_gen/:cli/:acc/:tipo',LM.accionC_gen);
lmapi.get('/soportes/:cli',LM.soportes);
lmapi.get('/soportesC/:cli/:id',LM.soportesC);
lmapi.get('/soportes_gen/:cli/:tipo',LM.soportes_gen);
lmapi.get('/contrapeso_gen/:cli/:tipo',LM.contrapeso_GEN);

lmapi.get('/contrapeso/:cli',LM.contrapeso);
lmapi.get('/contrapesoC/:cli/:id/',LM.contrapesoC);

lmapi.get('/tejidos/:cli',LM.tejidos);
lmapi.get('/tejidosC/:cli/:id',LM.tejidosC);
lmapi.get('/tejidosCID/:cli/:id',LM.tejidosCID);


/* VFF 10.10.2025 - Poder recollir els codigos de BCM */
lmapi.get('/tejidosC/:cli/:id/:subcli',LM.tejidosC);
lmapi.get('/tejidosCID/:cli/:id/:subcli',LM.tejidosCID);

/* VFF 10.10.2025 - Poder recollir els codigos de BCM */
lmapi.get('/tejidos_producto/:cli/:pro/:subcli',LM.tejidos_producto);
lmapi.get('/tejidos_producto_id/:cli/:pro/:subcli',LM.tejidos_producto_id);

lmapi.get('/tejidos_producto/:cli/:pro',LM.tejidos_producto);
lmapi.get('/tejidos_producto_id/:cli/:pro',LM.tejidos_producto_id);

lmapi.get('/tapas/:cli',LM.tapas);
lmapi.get('/tapas_gen/:cli/:tipo',LM.tapas_gen);
lmapi.get('/tapasC/:cli/:id',LM.tapasC);


lmapi.get('/posMando/:cli',LM.posMando);
lmapi.get('/salTejido/:cli',LM.salTejido);

lmapi.get('/radiomandos/:cli',LM.radiomandos);
lmapi.get('/radiomandos_gen/:model/:cli/:tipo',LM.radiomandos_gen);
lmapi.get('/tubos/:cli',LM.tubos);

lmapi.get('/altCadena/:cli',LM.altCadena);
lmapi.get('/altCadenaM/:cli',LM.altCadenaM);

lmapi.get('/estancias/:cli',LM.estancias);

lmapi.get('/cajones/:cli/:tipo',LM.cajones);
lmapi.get('/guias/:cli/:tipo',LM.guias);

lmapi.get('/tarifa_calculate/:cliente/:tubo/:tejido/:marca/:ancho/:alto/:impresion/:ancholama/:producto',TarifasController.calculate);
lmapi.get('/tarifa_calculate2/:cliente/:tubo/:tejido/:marca/:ancho/:alto/:impresion/:ancholama/:producto/:centro/:cantidad',TarifasController.calculate2);
lmapi.get('/tarifa_calculate3/:cliente/:tubo/:tejido/:marca/:ancho/:alto/:impresion/:ancholama/:producto/:centro/:cantidad/:subproducto',TarifasController.calculate3);

lmapi.get('/tarifa_calculate_auto/:cliente/:tubo/:tejido/:marca/:ancho/:alto/:impresion/:ancholama/:producto/:centro/:cantidad/:subproducto',
TarifasController.calculate_auto);
lmapi.get('/contrapeso_tarifa/:contrapeso/:ancho',TarifasController.contrapeso);
lmapi.get('/alturacadena_tarifa/:cadena/:cliente/:altura',TarifasController.alturacadena);

lmapi.get('/paneljapones_tarifa/:vias/:cliente/:altura/:cantidad',TarifasController.paneljapones);

lmapi.get('/mecanismo_vertical/:alama/:ancho/:cantidad',TarifasController.mecanismo_vertical);
lmapi.get('/vertical_st_tarifa/:ancholama/:tejido/:alto/:lamas',TarifasController.Vertical_ST_Tarifa);
lmapi.get('/accesorio_tarifa/:idrow/:ancho/:cantidad',TarifasController.tarifa_accesorio);

lmapi.get('/fecha_fab/:cliente/:tejido/:producto/:entrega',FabricacionController.fechafabricacion);

lmapi.get('/existePromocion/:cli/:cent',LM.existePromocion);
lmapi.get('/datosPromocion/:cli/:cent',LM.datosPromocion);
lmapi.get('/userinfo/:cli', LM.userInfo);

lmapi.get('/test',TarifasController.Test);
lmapi.get('/c1_sum/:c1/:c2/:c3/:c4/:c5/:c6/:c7/:c8',TarifasController.C1_Sum);
lmapi.get('/c1_mult/:c1/:mult',TarifasController.C1_Multiply);
lmapi.post('/c1_sumatory',TarifasController.C1_Sumatory);
   

/* BESTELLUNGEN */
lmapi.post('/bestellungen_hinzu/:cli', Best.bestellungen_hinzu);
lmapi.post('/bestellungen_hinzu2/:cli/:ref', Best.bestellungen_hinzu2);
lmapi.post('/bestellungen_hinzu3/:cli/:ref', Best.bestellungen_hinzu3);
lmapi.get('/bestellungen', Best.bestellungen);

lmapi.get('/bestellungen_entrega/:cliente/:entrega',Best.bestellungen_entrega);
lmapi.post('/bestellungen_entrega',Best.bestellungen_entrega_post);


/* BUDGET */
lmapi.get('/budget', Budget.budget);
lmapi.post('/budget_hinzu/:cli', Budget.budget_hinzu);
lmapi.post('/budget_hinzu2/:cli/:ref', Budget.budget_hinzu2);

lmapi.get('/budget_entrega/:cliente/:entrega',Budget.budget_entrega);
lmapi.post('/budget_entrega',Budget.budget_entrega_post);
lmapi.post('/budget_delete/:idrow',Budget.budget_delete);

lmapi.get('/budget_herunterladen_T1/:idrow',Budget.budget_herunterladen_T1);
lmapi.get('/budget_herunterladen_T2/:idrow',Budget.budget_herunterladen_T2);
lmapi.get('/budget_herunterladen_T3/:idrow',Budget.budget_herunterladen_T3);
lmapi.get('/budget_herunterladen_T4/:idrow',Budget.budget_herunterladen_T4);


lmapi.get('/pdf_image/:idrow',Best.bestellung_image);
lmapi.get('/pdf_image2/:idrow',Best.bestellung_image2);

/* TARIFAS REPROCESADO */
var BestellungenTarifas = require('../controllers/sm/lm/bestellungen_tarifas');
lmapi.post('/calculate_prices',BestellungenTarifas.calculate_prices);
lmapi.post('/calculate_prices_cajon_guia/:idrow',BestellungenTarifas.calculate_pvp_cajon_guia);
lmapi.get('/prices_values/:idrow/:tipo',BestellungenTarifas.getvalues);
module.exports = lmapi;