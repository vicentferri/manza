import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/*
 * "Ver como" de la pantalla Productos (Fase 2, PLAN_FASE2_SURTIDO.md). null = catálogo maestro (como siempre);
 * con un perfil, las listas (app-acc-tabla), las relaciones (app-acc-relacion) y los tejidos (app-acc-tejidos)
 * pasan a modo perfil: qué ve ese perfil y con qué nombre. El maestro no se edita en ese modo.
 * Lo pone el selector de la cabecera de Productos y lo vuelve a null al salir de la pantalla.
 */
export interface PerfilVista {
    id: number;
    codigo: string;
    nombre: string;
    politica_novedades: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilVistaService {
    readonly perfil$ = new BehaviorSubject<PerfilVista | null>(null);

    get perfil(): PerfilVista | null {
        return this.perfil$.value;
    }

    elegir(p: PerfilVista | null) {
        this.perfil$.next(p);
    }
}
