import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { map, tap } from "rxjs/operators";

@Injectable()
export class SMAPIService {

    public urlService = environment.host_ip;
    private urlService2 = this.urlService + '/api/bestellungen_hinzu/1';
    private urlTarifa = this.urlService + '/api/tarifa_calculate3';
    private urlTarifa2 = this.urlService + '/api/tarifa_calculate_auto';
    private urlTarifaContrapeso = this.urlService + '/api/lm/contrapeso_tarifa';
    private urlTarifaAlturaCadena = this.urlService + '/api/lm/alturacadena_tarifa';
    private urlTarifaPanelJapones = this.urlService + '/api/lm/paneljapones_tarifa';
    private urlTarifaMecanismoVertical = this.urlService + '/api/lm/mecanismo_vertical';
    private urlTarifaAccesorio = this.urlService + '/api/lm/accesorio_tarifa';
    private urlFechaFabricacion = this.urlService + '/api/lm/fecha_fab';


    private urlAccionamientos = this.urlService + '/api/lm/accion';
    private urlAccionamientosT = this.urlService + '/api/lm/accionT';
    private urlAccionamientosC = this.urlService + '/api/lm/accionC';
    private urlCargadores = this.urlService + '/api/lm/cargadores';
    private urlAccionamientosL = this.urlService + '/api/lm/lacados';
    private urlSoportes = this.urlService + '/api/lm/soportes';
    private urlSoportesGEN = this.urlService + '/api/lm/soportes_gen';
    private urlSoportesC = this.urlService + '/api/lm/soportesC';
    private urlTejidos = this.urlService + '/api/lm/tejidos';
    private urlTejidosC = this.urlService + '/api/lm/tejidosC';
    private urlTejidosCID = this.urlService + '/api/lm/tejidosCID';
    private urlContrapeso = this.urlService + '/api/lm/contrapeso';
    private urlContrapesoGEN = this.urlService + '/api/lm/contrapeso_gen';
    private urlContrapesoC = this.urlService + '/api/lm/contrapesoC';
    private urlTapas = this.urlService + '/api/lm/tapas';
    private urlTapasGEN = this.urlService + '/api/lm/tapas_gen';
    private urlTapasC = this.urlService + '/api/lm/tapasC';
    private urlPosMando = this.urlService + '/api/lm/posMando';
    private urlSalTejido = this.urlService + '/api/lm/salTejido';
    private urlTubos = this.urlService + '/api/lm/tubos';
    private urlAlturaCadena = this.urlService + '/api/lm/altCadena';
    private urlAlturaCadenaM = this.urlService + '/api/lm/altCadenaM';
    private urlRadioMandos = this.urlService + '/api/lm/radiomandos';
    private urlRadioMandosGEN = this.urlService + '/api/lm/radiomandos_gen';
    private urlEstancias = this.urlService + '/api/lm/estancias';
    private urlexistePromocion = this.urlService + '/api/lm/existePromocion';
    private urluserinfo = this.urlService + '/api/lm/userinfo';
    private urldatosPromocion = this.urlService + '/api/lm/datosPromocion';
    private urlVerticalST = this.urlService + '/api/lm/vertical_st_tarifa';
    private urlC1Multiply = this.urlService + '/api/lm/c1_mult';
    private urlC1Sum = this.urlService + '/api/lm/c1_sum';
    private urlCajones = this.urlService + '/api/lm/cajones';
    private urlGuias = this.urlService + '/api/lm/guias';

    private urlAltaPedido2 = this.urlService + '/api/lm/bestellungen_hinzu2';
    private urlAltaPresupuesto2 = this.urlService + '/api/lm/budget_hinzu2';
    private urlAltaPrecios = this.urlService + '/api/lm/calculate_prices';
    private urlAltaPreciosCajonGuia = this.urlService + '/api/lm/calculate_prices_cajon_guia';

    private urlT1Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T1';
    private urlT2Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T2';
    private urlT3Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T3';
    private urlT4Herunterladen = this.urlService + '/api/lm/budget_herunterladen_T4';

    private urlBestellungnachschlagen = this.urlService + '/api/lm/bestellungen_entrega';
    private urlBudgetnachschlagen = this.urlService + '/api/lm/budget_entrega';

    constructor(private http: HttpClient) { }

    getToken() {
        const userString = localStorage.getItem('user');
        if (!userString) {
            throw new Error("User not found in localStorage");
        }
        var data = JSON.parse(userString);
        const Authorization = data.token;
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', Authorization);
        return { headers: headers }
    }

    getAccionamientos(cliente: number, producto: number) {
        var url: string = this.urlAccionamientos + '/' + cliente + '/' + producto;
        return this.HTTP_Get(url);
    }

    getAccionamientosTipos(idrow: number, tipo: number, cliente: number) {
        var url: string = this.urlAccionamientosT + '/' + cliente + '/' + idrow + '/' + tipo
        return this.HTTP_Get(url);
    }

    getAccionamientosColores(tipo: number, acc: number, cliente: number, produc: number) {
        var url: string = this.urlAccionamientosC + '/' + cliente + '/' + acc + '/' + tipo + '/' + produc;
        return this.HTTP_Get(url);
    }

    getCargadores(id: number) {
        var url: string = this.urlCargadores + '/' + id;
        return this.HTTP_Get(url);
    }

    getAccionamientosLacados(cliente: number) {
        var url: string = this.urlAccionamientosL + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getSoportes(cliente: number) {
        var url: string = this.urlSoportes + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getSoportesGEN(cliente: number, tipo: number) {
        var url: string = this.urlSoportesGEN + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getContrapesosGEN(cliente: number, tipo: number) {
        var url: string = this.urlContrapesoGEN + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getSoportes2(cliente: number, tipo: number) {
        var url: string = this.urlSoportes + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getSoportesColor(id: number, cliente: number) {
        var url: string = this.urlSoportesC + '/' + cliente + '/' + id;
        return this.HTTP_Get(url);
    }

    getTejidos(cliente: number) {
        var url: string = this.urlTejidos + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getRadioMandos(cliente: number) {
        var url: string = this.urlRadioMandos + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getRadioMandos_gen(model: number, cliente: number, tipo: number) {
        var url: string = this.urlRadioMandosGEN + '/' + model + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getTejidosPJ() {
        var url: string = this.urlTejidos;
        return this.HTTP_Get(url);
    }

    getTejidosProducto(cliente: string, producto: string, subcliente: string) {
        const url = this.urlService + '/api/lm/tejidos_producto/' + cliente + '/' + producto + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getTejidosProductoID(cliente: string, producto: string, subcliente: string) {
        var url: string = this.urlService + '/api/lm/tejidos_producto_id/' + cliente + '/' + producto + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getTejidosColor(id: number, cliente: number, subcliente: string) {
        var url: string = this.urlTejidosC + '/' + cliente + '/' + id + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getTejidosColorID(id: number, cliente: number, subcliente: string) {
        var url: string = this.urlTejidosCID + '/' + cliente + '/' + id + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getTejidosColorPJ(id: number, cliente: number, subcliente: string) {
        var url: string = this.urlTejidosC + '/' + cliente + '/' + id + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getTejidosColorPV(id: number, cliente: number, subcliente: string) {
        var url: string = this.urlTejidosC + '/' + cliente + '/' + id + '/' + subcliente;
        return this.HTTP_Get(url);
    }

    getContrapeso(cliente: number) {
        var url: string = this.urlContrapeso + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getContrapesoColor(id: number, cliente: number) {
        var url: string = this.urlContrapesoC + '/' + cliente + '/' + id;
        return this.HTTP_Get(url);
    }

    getTapas(cliente: number) {
        var url: string = this.urlTapas + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getTapasGEN(cliente: number, tipo: number) {
        var url: string = this.urlTapasGEN + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getTapasColores(id: number, cliente: number) {
        var url: string = this.urlTapasC + '/' + cliente + '/' + id;
        return this.HTTP_Get(url);
    }

    getPosicionMando(cliente: number) {
        var url: string = this.urlPosMando + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getSalidaTejido(cliente: number) {
        var url: string = this.urlSalTejido + '/' + cliente;
        return this.HTTP_Get(url);
    }

    altaPedido(body: any, referencia: string, cliente: number) {
        const url: string = this.urlAltaPedido2 + '/' + cliente + '/' + referencia;
        return this.HTTP_Post(url, body);
    }

    altaPrecios(body: any) {
        const url: string = this.urlAltaPrecios;
        return this.HTTP_Post(url, body);
    }

    altaPreciosCajonGuia(body: any, idrow: string) {
        const url: string = this.urlAltaPreciosCajonGuia + '/' + idrow;
        return this.HTTP_Post(url, body);
    }

    altaPresupuesto(body: any, referencia: string, cliente: number) {
        const url: string = this.urlAltaPresupuesto2 + '/' + cliente + '/' + referencia;
        return this.HTTP_Post(url, body);
    }

    getTubos(cliente: number) {
        var url: string = this.urlTubos + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getAlturaCadena(cliente: number) {
        var url: string = this.urlAlturaCadena + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getAlturaCadenaM(cliente: number) {
        var url: string = this.urlAlturaCadenaM + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getEstancias(cliente: number) {
        var url: string = this.urlEstancias + '/' + cliente;
        return this.HTTP_Get(url);
    }

    getCajones(cliente: number, tipo: number) {
        var url: string = this.urlCajones + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getGuias(cliente: number, tipo: number) {
        var url: string = this.urlGuias + '/' + cliente + '/' + tipo;
        return this.HTTP_Get(url);
    }

    getTarifa(cliente: string, tubo: string, tejido: string, marca: string, ancho: string, alto: string, impresion: string, ancholama: string, producto: string, centro: string, cantidad: number, subproducto: string) {
        var url: string = this.urlTarifa;
        url += '/' + cliente + '/' + tubo + '/' + tejido + '/' + marca + '/' + ancho + '/' + alto + '/' + impresion + '/' + ancholama + '/' + producto + '/' + centro + '/' + cantidad + '/' + subproducto;
        return this.HTTP_Get(url);
    }

    getTarifa2(cliente: string, tubo: string, tejido: string, marca: string, ancho: string, alto: string, impresion: string, ancholama: string, producto: string, centro: string, cantidad: number, subproducto: string) {
        var url: string = this.urlTarifa2;
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
        var url: string = this.urlexistePromocion + '/' + cliente + '/' + centro;
        return this.HTTP_Get(url);
    }

    getUserInfo(username: string) {
        var url: string = this.urluserinfo + '/' + username;
        return this.HTTP_Get(url);
    }


    getdatosPromocion(cliente: string, centro: string) {
        var url: string = this.urldatosPromocion + '/' + cliente + '/' + centro;
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
        if (registerToken != null) {
            var headers = new Headers();
            headers.set('authorization', registerToken)
        }

        return this.http.get(url).pipe(map((response: any) => response));

    }

    public HTTP_Post(route: string, values: string) {
        let registerToken = localStorage.getItem('registerToken');

        var url: string = route;
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            ...(registerToken ? { 'authorization': registerToken } : {})
        });
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

        return this.HTTP_Post(this.urlService + '/api/lm/c1_sumatory', values);
    }


    getBestellungennachschlagen(cliente: string, entrega: string) {
        var url: string = this.urlBestellungnachschlagen + '/' + cliente + '/' + entrega;
        return this.HTTP_Get(url);
    }

    postBestellungennachschlagen(values: string) {
        var url: string = this.urlBestellungnachschlagen;
        return this.HTTP_Post(url, values);
    }

    getBudgetnachschlagen(cliente: string, entrega: string) {
        var url: string = this.urlBudgetnachschlagen + '/' + cliente + '/' + entrega;
        return this.HTTP_Get(url);
    }

    postBudgetnachschlagen(values: string) {
        var url: string = this.urlBudgetnachschlagen;
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
