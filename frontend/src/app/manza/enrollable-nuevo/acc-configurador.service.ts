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

    /* Alta del pedido: solo líneas de enrollable del flujo nuevo (con nacc) */
    altaPedido(lineas: any[], referencia: string, cliente: string | number): Observable<any> {
        const ref = encodeURIComponent(referencia || '-');
        return this.http.post<any>(this.url + '/pedido/' + cliente + '/' + ref, lineas);
    }
}
