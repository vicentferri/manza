import { Component, OnDestroy, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { PerfilVistaService, PerfilVista } from './perfil-vista.service';
import { Subscription } from 'rxjs';

/*
 * Relación N:M de un registro con las opciones de otro catálogo, como lista de casillas.
 * Cada cambio se guarda al momento; si falla, las casillas vuelven a como estaban.
 * relacion: clave del backend (controllers/sm/accionamientos_nuevo.js → RELACIONES)
 */
@Component({
    selector: 'app-acc-relacion',
    templateUrl: './acc-relacion.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccRelacionComponent implements OnDestroy, OnChanges {

    @Input() relacion = '';
    @Input() id: number = null;
    @Input() titulo = '';
    @Input() ayuda = '';
    @Input() vacio = 'No hay opciones dadas de alta.';
    /* Se emite al guardar un cambio: la lista del registro marcado cambia su "Uso" */
    @Output() cambio = new EventEmitter<void>();

    opciones: any[] = [];
    estado: '' | 'guardando' | 'guardado' = '';
    private temporizador: any = null;


    /* Productos -> "Ver como" (Fase 2): con un perfil elegido, las casillas se ven pero no se cambian (las relaciones son del maestro) */
    perfilVista: PerfilVista | null = null;
    private subPerfil: Subscription;

    constructor(private service: HaruService, private toaster: ToastrService, private perfilVistaService: PerfilVistaService) {
        this.subPerfil = this.perfilVistaService.perfil$.subscribe(p => this.perfilVista = p);
    }

    ngOnDestroy() {
        if (this.subPerfil) { this.subPerfil.unsubscribe(); }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.relacion || changes.id) { this.cargar(); }
    }

    get marcadas(): number {
        return this.opciones.filter(o => o.marcado).length;
    }

    cargar() {
        this.estado = '';
        if (!this.relacion || !this.id) { this.opciones = []; return; }
        this.service.HTTP_Get('/sm/acc/rel/' + this.relacion + '/' + this.id).subscribe(
            data => { this.opciones = (data.Table || []).map(o => Object.assign(o, { marcado: !!o.marcado })); },
            () => this.toaster.error('Error al cargar las opciones', this.titulo)
        );
    }

    cambiar(opcion: any) {
        const anterior = this.opciones.map(o => o.marcado);
        anterior[this.opciones.indexOf(opcion)] = !opcion.marcado;
        this.guardar(anterior);
    }

    marcarTodas(valor: boolean) {
        const anterior = this.opciones.map(o => o.marcado);
        this.opciones.forEach(o => o.marcado = valor);
        this.guardar(anterior);
    }

    private guardar(anterior: boolean[]) {
        const ids = this.opciones.filter(o => o.marcado).map(o => o.id);
        this.estado = 'guardando';
        clearTimeout(this.temporizador);
        this.service.HTTP_Post('/sm/acc/rel/' + this.relacion + '/' + this.id, JSON.stringify({ ids })).subscribe(
            () => {
                this.estado = 'guardado';
                this.temporizador = setTimeout(() => this.estado = '', 2000);
                this.cambio.emit();
            },
            err => {
                this.opciones.forEach((o, i) => o.marcado = anterior[i]);
                this.estado = '';
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo guardar';
                this.toaster.error(msg, this.titulo);
            }
        );
    }
}
