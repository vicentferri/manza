import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/*
 * Llamadas del configurador nuevo de accionamientos (backend: controllers/sm/acc_configurador.js).
 * Va aparte de SMAPIService para no tocar nada del configurador de siempre (Leroy).
 * Usa HttpClient: el AuthInterceptor añade el token de sesión.
 */
@Injectable({ providedIn: 'root' })
export class AccConfiguradorService {

    private url = environment.host_ip + '/api/sm/acc_cfg';

    constructor(private http: HttpClient) { }

    /* ¿El cliente usa el configurador nuevo? Ante cualquier error, false: se queda el de siempre */
    activo(cliente: string | number): Observable<boolean> {
        return this.http.get<any>(this.url + '/activo/' + cliente).pipe(
            map(r => !!(r && r.activo === true)),
            catchError(() => of(false))
        );
    }

    /* Árbol de opciones activas con sus relaciones */
    opciones(cliente: string | number): Observable<any> {
        return this.http.get<any>(this.url + '/opciones/' + cliente);
    }

    /* Precio de una línea (tarifa T1 o T2 del generador + impresión + suplementos), sin grabar nada.
       Si no hay precio responde 400 con { message, codigo, aviso } */
    precio(cliente: string | number, linea: any): Observable<any> {
        return this.http.post<any>(this.url + '/precio/' + cliente, linea);
    }

    /* ¿El cliente configura el Solar Mini con las listas de Productos? (sqlSolarMini) Ante cualquier error, false */
    miniActivo(cliente: string | number): Observable<boolean> {
        return this.http.get<any>(this.url + '/mini/activo/' + cliente).pipe(
            map(r => !!(r && r.activo === true)),
            catchError(() => of(false))
        );
    }

    /* Listas activas del Solar Mini y sus tejidos del maestro */
    miniOpciones(cliente: string | number): Observable<any> {
        return this.http.get<any>(this.url + '/mini/opciones/' + cliente);
    }

    /* Precio de una línea de Solar Mini (tarifa T1/T2 del producto Solar Mini + suplementos), sin grabar nada */
    miniPrecio(cliente: string | number, linea: any): Observable<any> {
        return this.http.post<any>(this.url + '/mini/precio/' + cliente, linea);
    }

    /* ¿El cliente configura el Cajón ZIP con las listas de Productos? (sqlCajonZip) Ante cualquier error, false */
    zipActivo(cliente: string | number): Observable<boolean> {
        return this.http.get<any>(this.url + '/zip/activo/' + cliente).pipe(
            map(r => !!(r && r.activo === true)),
            catchError(() => of(false))
        );
    }

    /* Listas activas del Cajón ZIP con sus relaciones (modelo de cajón → ...), tejidos, posiciones y vistas */
    zipOpciones(cliente: string | number): Observable<any> {
        return this.http.get<any>(this.url + '/zip/opciones/' + cliente);
    }

    /* Precio de una línea de Cajón ZIP (tarifa T1/T2 del modelo de cajón + suplementos), sin grabar nada */
    zipPrecio(cliente: string | number, linea: any): Observable<any> {
        return this.http.post<any>(this.url + '/zip/precio/' + cliente, linea);
    }

    /* Alta del pedido: líneas del flujo nuevo (enrollables con nacc, Solar Mini con nmini y Cajón ZIP con nzip) */
    altaPedido(lineas: any[], referencia: string, cliente: string | number): Observable<any> {
        const ref = encodeURIComponent(referencia || '-');
        return this.http.post<any>(this.url + '/pedido/' + cliente + '/' + ref, lineas);
    }

    /* Alta del presupuesto: igual que el pedido */
    altaPresupuesto(lineas: any[], referencia: string, cliente: string | number): Observable<any> {
        const ref = encodeURIComponent(referencia || '-');
        return this.http.post<any>(this.url + '/presupuesto/' + cliente + '/' + ref, lineas);
    }
}
