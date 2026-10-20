import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Motores disponibles por sistema (SOL_ACC_MODELO_MOTOR_SISTEMA, script 14), en una sola tabla:
 * modelos de motor agrupados por tipo en filas y sistemas en columnas.
 * Un clic marca o quita un modelo en un sistema; la fila del tipo y la cabecera del sistema marcan
 * de una vez todos los modelos que se ven (con el buscador, solo los filtrados).
 * Cada cambio se guarda al momento; si falla, las casillas vuelven a como estaban.
 */
@Component({
    selector: 'app-acc-motores-sistema',
    templateUrl: './acc-motores-sistema.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccMotoresSistemaComponent implements OnInit {

    /* Se emite al guardar un cambio */
    @Output() cambio = new EventEmitter<void>();

    sistemas: any[] = [];
    tipos: any[] = [];
    buscar = '';
    cargado = false;
    estado: '' | 'guardando' | 'guardado' = '';
    private temporizador: any = null;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.service.HTTP_Get('/sm/acc/matriz/motores').subscribe(
            data => {
                this.sistemas = data.sistemas || [];
                this.tipos = data.tipos || [];
                this.cargado = true;
            },
            () => this.toaster.error('Error al cargar los motores', 'Motores por sistema')
        );
    }

    /* Tipos con sus modelos filtrados por el buscador (por nombre del modelo o del tipo) */
    get tiposVisibles(): any[] {
        const texto = this.normalizar(this.buscar);
        return this.tipos
            .map(t => ({ tipo: t, modelos: !texto || this.normalizar(t.nombre).indexOf(texto) >= 0
                ? t.modelos : t.modelos.filter(m => this.normalizar(m.nombre).indexOf(texto) >= 0) }))
            .filter(g => !texto || g.modelos.length > 0);
    }

    get modelosVisibles(): any[] {
        return [].concat(...this.tiposVisibles.map(g => g.modelos));
    }

    get sinSistema(): number {
        return [].concat(...this.tipos.map(t => t.modelos)).filter(m => m.sistemas.length === 0).length;
    }

    marcado(modelo: any, sistema: any): boolean {
        return modelo.sistemas.indexOf(sistema.id) >= 0;
    }

    /* Estado de un grupo de modelos en un sistema: todos, ninguno o algunos */
    todos(modelos: any[], sistema: any): boolean {
        return modelos.length > 0 && modelos.every(m => this.marcado(m, sistema));
    }
    algunos(modelos: any[], sistema: any): boolean {
        return modelos.some(m => this.marcado(m, sistema)) && !this.todos(modelos, sistema);
    }

    cambiarUno(modelo: any, sistema: any) {
        this.guardar([modelo], sistema, !this.marcado(modelo, sistema));
    }

    /* Fila de tipo o cabecera de sistema: si están todos marcados los quita, si no los marca todos */
    cambiarGrupo(modelos: any[], sistema: any) {
        if (modelos.length === 0) { return; }
        this.guardar(modelos, sistema, !this.todos(modelos, sistema));
    }

    private guardar(modelos: any[], sistema: any, marcado: boolean) {
        const anterior = modelos.map(m => m.sistemas.slice());
        modelos.forEach(m => {
            const resto = m.sistemas.filter(id => id !== sistema.id);
            m.sistemas = marcado ? resto.concat(sistema.id) : resto;
        });
        this.estado = 'guardando';
        clearTimeout(this.temporizador);
        const body = { sistema_id: sistema.id, modelo_ids: modelos.map(m => m.id), marcado };
        this.service.HTTP_Post('/sm/acc/matriz/motores', JSON.stringify(body)).subscribe(
            () => {
                this.estado = 'guardado';
                this.temporizador = setTimeout(() => this.estado = '', 2000);
                this.cambio.emit();
            },
            err => {
                modelos.forEach((m, i) => m.sistemas = anterior[i]);
                this.estado = '';
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo guardar';
                this.toaster.error(msg, 'Motores por sistema');
            }
        );
    }

    private normalizar(valor: string): string {
        return String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}
