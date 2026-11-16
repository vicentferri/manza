import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/*
 * Perfil de configurador del cliente (backend: controllers/sm/cfg_perfil.js; BD: sqlPerfiles 01-08).
 * El perfil dice qué productos ve el configurador, con qué motor (ANTIGUO / NUEVO), con qué nombre, con qué
 * documentos y con qué parámetros. Así ningún componente del configurador compara números de cliente.
 * Dentro del perfil, cada usuario sigue restringiendo los productos con sus casillas prod_N.
 */

export interface DocumentoPerfil {
    subtipo: number | null;
    etiqueta: string;
    url: string;
    icono: string | null;
}

export interface ProductoPerfil {
    tipo: number;
    visible: boolean;
    motor: 'ANTIGUO' | 'NUEVO';
    orden: number;
    nombre: string;
    documentos: DocumentoPerfil[];
}

export interface PerfilConfigurador {
    perfil: { codigo: string; nombre: string; idioma: string; politica_novedades: string };
    productos: ProductoPerfil[];
    documentos: DocumentoPerfil[];
    parametros: { [clave: string]: string };
}

/* Si el perfil no se puede cargar: configurador estándar (motor antiguo, sin documentos ni extras) */
export const PERFIL_VACIO: PerfilConfigurador = {
    perfil: { codigo: '', nombre: '', idioma: 'ES', politica_novedades: 'OCULTAR' },
    productos: [
        { tipo: 1, visible: true, motor: 'ANTIGUO', orden: 1, nombre: 'ENROLLABLES', documentos: [] },
        { tipo: 2, visible: true, motor: 'ANTIGUO', orden: 2, nombre: 'PANEL JAPONES', documentos: [] },
        { tipo: 3, visible: true, motor: 'ANTIGUO', orden: 3, nombre: 'VERTICAL', documentos: [] },
        { tipo: 4, visible: true, motor: 'ANTIGUO', orden: 4, nombre: 'SOLAR MINI', documentos: [] },
        { tipo: 7, visible: true, motor: 'ANTIGUO', orden: 5, nombre: 'HONEYCOMB', documentos: [] }
    ],
    documentos: [],
    parametros: {}
};

@Injectable({ providedIn: 'root' })
export class PerfilConfiguradorService {

    private url = environment.host_ip + '/api/sm/cfg/perfil/';
    private cache = new Map<string, Observable<PerfilConfigurador>>();

    constructor(private http: HttpClient) { }

    /* Perfil del cliente (una sola petición por cliente). Ante cualquier error, el perfil vacío */
    perfil(cliente: string | number): Observable<PerfilConfigurador> {
        const clave = String(cliente);
        if (!(parseInt(clave, 10) > 0)) { return of(PERFIL_VACIO); }
        if (!this.cache.has(clave)) {
            this.cache.set(clave, this.http.get<PerfilConfigurador>(this.url + clave).pipe(
                map(p => p && Array.isArray(p.productos) ? p : PERFIL_VACIO),
                catchError(err => {
                    console.error('No se ha podido cargar el perfil del configurador', err);
                    this.cache.delete(clave);
                    return of(PERFIL_VACIO);
                }),
                shareReplay(1)
            ));
        }
        return this.cache.get(clave);
    }

    /* Para la pantalla de Perfiles: tras guardar, el configurador vuelve a pedir el perfil */
    olvidar(cliente?: string | number): void {
        if (cliente === undefined) { this.cache.clear(); } else { this.cache.delete(String(cliente)); }
    }
}

/* Utilidades sobre un perfil ya cargado */
export function productoDe(p: PerfilConfigurador, tipo: number): ProductoPerfil | undefined {
    return (p && p.productos || []).find(x => x.tipo === tipo);
}

export function motorNuevo(p: PerfilConfigurador, tipo: number): boolean {
    const x = productoDe(p, tipo);
    return !!x && x.visible && x.motor === 'NUEVO';
}

export function parametroActivo(p: PerfilConfigurador, clave: string): boolean {
    return !!p && !!p.parametros && p.parametros[clave] === '1';
}

/* Documentos de un producto; con subtipo, los de ese subtipo más los que valen para cualquiera */
export function documentosDe(p: PerfilConfigurador, tipo: number, subtipo?: number): DocumentoPerfil[] {
    const x = productoDe(p, tipo);
    return (x ? x.documentos : []).filter(d => d.subtipo === null || subtipo === undefined || d.subtipo === subtipo);
}
