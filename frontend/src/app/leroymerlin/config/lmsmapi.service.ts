import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { map, tap } from "rxjs/operators";
import { environment } from '../../../environments/environment';

@Injectable()
export class LMSMAPIService {

    public urlService = environment.host_ip;
    private urlService2 = this.urlService + '/api/lm/bestellungen_hinzu/1';
    private urlTarifa = this.urlService + '/api/lm/tarifa_calculate3';
    private urlTarifaContrapeso = this.urlService + '/api/lm/contrapeso_tarifa';
    private urlTarifaAlturaCadena = this.urlService + '/api/lm/alturacadena_tarifa';
    private urlTarifaPanelJapones = this.urlService + '/api/lm/paneljapones_tarifa';
    private urlTarifaMecanismoVertical = this.urlService + '/api/lm/mecanismo_vertical';
    private urlTarifaAccesorio = this.urlService + '/api/lm/accesorio_tarifa';
    private urlFechaFabricacion = this.urlService + '/api/lm/fecha_fab';
    private cliente = '/1';
    private producto = '/1';

    private urlAccionamientos = this.urlService + '/api/lm/accion' + this.cliente + this.producto;
    private urlAccionamientosT = this.urlService + '/api/lm/accionT' + this.cliente;
    private urlAccionamientosC = this.urlService + '/api/lm/accionC' + this.cliente;
    private urlSoportes = this.urlService + '/api/lm/soportes' + this.cliente;
    private urlSoportesC = this.urlService + '/api/lm/soportesC' + this.cliente;
    private urlTejidos = this.urlService + '/api/lm/tejidos' + this.cliente;
    private urlTejidosC = this.urlService + '/api/lm/tejidosC' + this.cliente;
    private urlTejidosCID = this.urlService + '/api/lm/tejidosCID' + this.cliente;
    private urlContrapeso = this.urlService + '/api/lm/contrapeso' + this.cliente;
    private urlContrapesoC = this.urlService + '/api/lm/contrapesoC' + this.cliente;
    private urlTapas = this.urlService + '/api/lm/tapas' + this.cliente;
    private urlTapasC = this.urlService + '/api/lm/tapasC' + this.cliente;
    private urlPosMando = this.urlService + '/api/lm/posMando' + this.cliente;
    private urlSalTejido = this.urlService + '/api/lm/salTejido' + this.cliente;
    private urlTubos = this.urlService + '/api/lm/tubos' + this.cliente;
    private urlAlturaCadena = this.urlService + '/api/lm/altCadena' + this.cliente;
    private urlAlturaCadenaM = this.urlService + '/api/lm/altCadenaM' + this.cliente;
    private urlRadioMandos = this.urlService + '/api/lm/radiomandos' + this.cliente;
    private urlEstancias = this.urlService + '/api/lm/estancias' + this.cliente;
    private urlexistePromocion = this.urlService + '/api/lm/existePromocion' + this.cliente;
    private urldatosPromocion = this.urlService + '/api/lm/datosPromocion' + this.cliente;
    private urlVerticalST = this.urlService + '/api/lm/vertical_st_tarifa';
    private urlC1Multiply = this.urlService + '/api/lm/c1_mult';
    private urlC1Sum = this.urlService + '/api/lm/c1_sum';

    private urlAltaPedido = this.urlService2;
    private urlAltaPedido2 = this.urlService + '/api/lm/bestellungen_hinzu2/1';
    private urlAltaPresupuesto = this.urlService + '/api/lm/budget_hinzu/1';
    private urlAltaPresupuesto2 = this.urlService + '/api/lm/budget_hinzu2/1';

    private urlT1Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T1';
    private urlT2Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T2';
    private urlT3Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T3';
    private urlT4Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T4';

    private urlBestellungnachschlagen = '/api/lm/bestellungen_entrega';
    private urlBudgetnachschlagen = '/api/lm/budget_entrega';



    constructor(private http: HttpClient) {

    }


    getAccionamientos() {
        var url: string = this.urlAccionamientos;
        return this.HTTP_Get(url);
    }

    getAccionamientosTipos(idrow: number, tipo: number) {
        //var url: string = this.urlAccionamientosT + idrow + '&tipo='+tipo
        var url: string = this.urlAccionamientosT + '/' + idrow + '/' + tipo
        return this.HTTP_Get(url);
    }

    getAccionamientosColores(tipo: number, acc: number) {
        //var url: string = this.urlAccionamientosC + '&acc=' + acc + '&tipo=' + tipo;
        var url: string = this.urlAccionamientosC + '/' + acc + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getSoportes() {
        var url: string = this.urlSoportes;
        return this.HTTP_Get(url);
    }

    getSoportesColor(id: number) {
        var url: string = this.urlSoportesC + '/' + id;
        return this.HTTP_Get(url);
    }

    getTejidos() {
        var url: string = this.urlTejidos;
        return this.HTTP_Get(url);
    }

    getRadioMandos() {
        var url: string = this.urlRadioMandos;
        return this.HTTP_Get(url);
    }

    getTejidosPJ() {
        var url: string = this.urlTejidos;
        return this.HTTP_Get(url);
    }

    getTejidosProducto(cliente: string, producto: string) {
        const url = this.urlService + '/api/lm/tejidos_producto/' + cliente + '/' + producto;

        return this.HTTP_Get(url);
    }

    getTejidosProductoID(cliente: string, producto: string) {

        var url: string = this.urlService + '/api/lm/tejidos_producto_id/' + cliente + '/' + producto;

        return this.HTTP_Get(url);
    }

    getTejidosColor(id: number) {
        var url: string = this.urlTejidosC + '/' + id;
        return this.HTTP_Get(url);
    }

    getTejidosColorID(id: number) {
        var url: string = this.urlTejidosCID + '/' + id;
        return this.HTTP_Get(url);
    }

    getTejidosColorPJ(id: number) {
        var url: string = this.urlTejidosC + '/' + id;
        return this.HTTP_Get(url);
    }

    getTejidosColorPV(id: number) {
        var url: string = this.urlTejidosC + '/' + id;
        return this.HTTP_Get(url);
    }

    getContrapeso() {
        var url: string = this.urlContrapeso;
        return this.HTTP_Get(url);
    }

    getContrapesoColor(id: number) {
        var url: string = this.urlContrapesoC + '/' + id;
        return this.HTTP_Get(url);
    }

    getTapas() {
        var url: string = this.urlTapas;
        return this.HTTP_Get(url);
    }

    getTapasColores(id: number) {
        var url: string = this.urlTapasC + '/' + id;
        return this.HTTP_Get(url);
    }

    getPosicionMando() {
        var url: string = this.urlPosMando;
        return this.HTTP_Get(url);
    }

    getSalidaTejido() {
        var url: string = this.urlSalTejido;
        return this.HTTP_Get(url);
    }

    altaPedido(body: any, referencia: string) {
        var url: string = this.urlAltaPedido2 + '/' + referencia;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post(url, body, { headers: headers }).pipe(map((response: any) => response));
    }

    altaPresupuesto(body: any, referencia: string) {
        var url: string = this.urlAltaPresupuesto2 + '/' + referencia;
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.http.post(url, body, { headers: headers }).pipe(map((response: any) => response));
    }

    getTubos() {
        var url: string = this.urlTubos;
        return this.HTTP_Get(url);
    }

    getAlturaCadena() {
        var url: string = this.urlAlturaCadena;
        return this.HTTP_Get(url);
    }

    getAlturaCadenaM() {
        var url: string = this.urlAlturaCadenaM;
        return this.HTTP_Get(url);
    }

    getEstancias() {
        var url: string = this.urlEstancias;
        return this.HTTP_Get(url);
    }

    getTarifa(cliente: string, tubo: string, tejido: string, marca: string, ancho: string, alto: string, impresion: string, ancholama: string, producto: string, centro: string, cantidad: number, subproducto: string) {
        var url: string = this.urlTarifa;
        url += '/' + cliente + '/' + tubo + '/' + tejido + '/' + marca + '/' + ancho + '/' + alto + '/' + impresion + '/' + ancholama + '/' + producto + '/' + centro + '/' + cantidad + '/' + subproducto;
        return this.HTTP_Get(url);
    }

    getTarifaContrapeso(contrapeso: string, ancho: string) {
        var url: string = this.urlTarifaContrapeso + '/' + contrapeso + '/' + ancho;
        return this.HTTP_Get(url);
    }

    getTarifaAlturaCadena(cadena: string, cliente: string, altura: string) {
        var url: string = this.urlTarifaAlturaCadena + '/' + cadena + '/' + cliente + '/' + altura
        return this.HTTP_Get(url);
    }

    getTarifaPanelJapones(vias: string, cliente: string, altura: string, cantidad: number) {
        var url: string = this.urlTarifaPanelJapones + '/' + vias + '/' + cliente + '/' + altura + '/' + cantidad;
        return this.HTTP_Get(url);
    }

    getTarifaAccesorio(idrow: string, ancho: string, cantidad: number) {
        var url: string = this.urlTarifaAccesorio + '/' + idrow + '/' + ancho + '/' + cantidad;
        return this.HTTP_Get(url);
    }

    getTarifaMecanismoVertical(cantidad: number, alama: string, ancho: number) {
        var url: string = this.urlTarifaMecanismoVertical + '/' + alama + '/' + ancho + '/' + cantidad;
        return this.HTTP_Get(url);
    }

    getFechaFabricacion(cliente: string, tejido: string, producto: string, entrega: string) {
        var url: string = this.urlFechaFabricacion + '/' + cliente + '/' + tejido + '/' + producto + '/' + entrega;
        return this.HTTP_Get(url);
    }

    getPromocionActiva(cliente: string, centro: string) {
        var url: string = this.urlexistePromocion + '/' + centro;
        return this.HTTP_Get(url);
    }

    getdatosPromocion(cliente: string, centro: string) {
        var url: string = this.urldatosPromocion + '/' + centro;
        return this.HTTP_Get(url);
    }

    getTarifaVerticalST(ancholama: string, tejido: string, alto: string, lamas: string) {
        var url: string = this.urlVerticalST + '/' + ancholama + '/' + tejido + '/' + alto + '/' + lamas;
        return this.HTTP_Get(url);
    }

    getMultiply(c1: string, mult: number) {
        var url: string = this.urlC1Multiply + '/' + c1 + '/' + mult;
        return this.HTTP_Get(url);
    }

    Number_To_C1(c1: number) {
        var lc1 = c1.toFixed(0);
        var lc2 = (100 * (c1 - Number(lc1))).toFixed(2);
    }

    C1_To_Number(c1: string) {
        c1 = c1.substr(3, c1.length);
        var lc1 = c1.substr(0, c1.length - 2);
        var lc2 = c1.substr(c1.length - 2, c1.length);
        var nlc1 = Number(lc1);
        var nlc2 = Number(lc2);
        var nlc3 = nlc1 + 0.01 * nlc2;
        return nlc3;
    }

    public HTTP_Get(route: string) {
        var url: string = route;
        let registerToken = localStorage.getItem('registerToken');
        let headers = new HttpHeaders();
        if (registerToken) {
            headers = headers.set('authorization', registerToken);
        }
        return this.http.get(url, { headers: headers }).pipe(map((response: any) => response));
    }

    public HTTP_Post(route: string, values: string) {
        let registerToken = localStorage.getItem('registerToken');

        var url: string = route;
        let headers = new HttpHeaders();
        if (registerToken) {
            headers = headers.set('authorization', registerToken);
        }
        headers = headers.set('Content-Type', 'application/json');
        return this.http.post(url, values, { headers: headers }).pipe(map((response: any) => response));
    }

    getSum(c1: string, c2: string, c3: string, c4: string, c5: string, c6: string, c7: string, c8: string) {

        var url = {
            c1: c1,
            c2: c2,
            c3: c3,
            c4: c4,
            c5: c5,
            c6: c6,
            c7: c7,
            c8: c8
        }

        let values = JSON.stringify(url);

        return this.HTTP_Post('/api/lm/c1_sumatory', values);
    }


    getBestellungennachschlagen(cliente: string, entrega: string) {
        var url: string = this.urlService + this.urlBestellungnachschlagen + '/' + cliente + '/' + entrega;
        return this.HTTP_Get(url);
    }

    postBestellungennachschlagen(values: string) {
        var url: string = this.urlService + this.urlBestellungnachschlagen;
        return this.HTTP_Post(url, values);
    }

    getBudgetnachschlagen(cliente: string, entrega: string) {
        var url: string = this.urlService + this.urlBudgetnachschlagen + '/' + cliente + '/' + entrega;
        return this.HTTP_Get(url);
    }

    postBudgetnachschlagen(values: string) {
        var url: string = this.urlService + this.urlBudgetnachschlagen;
        return this.HTTP_Post(url, values);
    }



    Budget_herunterladen_T1(idrow: string) {
        var url: string = this.urlT1Herunterladen + '/' + idrow;
        return this.HTTP_Get(url);
    }

    Budget_herunterladen_T2(idrow: string) {
        var url: string = this.urlT2Herunterladen + '/' + idrow;
        return this.HTTP_Get(url);
    }

    Budget_herunterladen_T3(idrow: string) {
        var url: string = this.urlT3Herunterladen + '/' + idrow;
        return this.HTTP_Get(url);
    }

    Budget_herunterladen_T4(idrow: string) {
        var url: string = this.urlT4Herunterladen + '/' + idrow;
        return this.HTTP_Get(url);
    }

}
