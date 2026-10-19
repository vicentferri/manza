import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

/*
 * Lista editable de un catálogo SOL_ACC_*: alta (solo nombre; el código se genera),
 * edición, orden con flechas, visible/oculto y borrado (solo si nada depende del registro).
 * catalogo: clave del backend (controllers/sm/accionamientos_nuevo.js → CATALOGOS)
 * padreCampo / padreId: si el catálogo cuelga de otro (tipos_cadena → accionamiento_id)
 */
@Component({
    selector: 'app-acc-tabla',
    templateUrl: './acc-tabla.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccTablaComponent implements OnChanges {

    @Input() catalogo = '';
    @Input() titulo = '';
    @Input() singular = 'registro';
    @Input() padreCampo = '';
    @Input() padreId: number = null;
    @Input() conValor = false;
    /* Unidad del valor (solo con conValor): se muestra en la cabecera, en el formulario y junto a cada valor */
    @Input() unidad = '';
    @Input() ayuda = '';
    /* Lo sube el padre cuando cambia algo que afecta a "Uso" (hijos, relaciones) */
    @Input() recarga = 0;
    @Output() seleccion = new EventEmitter<any>();
    /* Se emite al añadir, editar, borrar u ocultar: los registros que cuelgan de este cambian su "Uso" */
    @Output() cambio = new EventEmitter<void>();

    @ViewChild('modalForm', { static: false }) modalForm: ModalDirective;
    @ViewChild('modalBorrar', { static: false }) modalBorrar: ModalDirective;

    datos: any[] = [];
    filaSeleccionada: any = null;
    busqueda = '';
    form: any = {};
    avanzado = false;
    guardando = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.catalogo || changes.padreId) {
            /* Sin emitir: el padre ya limpia su selección al cambiar de catálogo o de padre */
            this.filaSeleccionada = null;
            this.busqueda = '';
            this.cargar();
        } else if (changes.recarga && !changes.recarga.firstChange) {
            this.cargar();
        }
    }

    get datosFiltrados(): any[] {
        const b = this.busqueda.trim().toLowerCase();
        if (!b) { return this.datos; }
        return this.datos.filter(d =>
            [d.codigo, d.nombre, d.valor].some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(b)));
    }

    /* Mismo criterio que el backend (codigoDesde) para enseñar el código que se va a generar */
    get codigoPrevisto(): string {
        const base = this.form.nombre || (this.conValor ? String(this.form.valor || '').replace(',', '.') : '');
        return String(base).normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 40);
    }

    get motivoNoBorrar(): string {
        const f = this.filaSeleccionada;
        if (!f) { return ''; }
        if (f.protegido) { return 'Es fijo: no se puede borrar. Puede ocultarlo'; }
        if (f.dependencias > 0) { return 'Está en uso (' + f.dependencias + '): no se puede borrar. Puede ocultarlo'; }
        return '';
    }

    etiqueta(d: any): string {
        const valor = d.valor + (this.unidad ? ' ' + this.unidad : '');
        return this.conValor ? (d.nombre ? d.nombre + ' (' + valor + ')' : valor) : d.nombre;
    }

    cargar() {
        if (!this.catalogo || (this.padreCampo && !this.padreId)) { this.datos = []; return; }
        const padre = this.padreCampo ? '?padre=' + this.padreId : '';
        this.service.HTTP_Get('/sm/acc/' + this.catalogo + padre).subscribe(
            data => {
                this.datos = data.Table || [];
                if (this.filaSeleccionada) {
                    this.seleccionar(this.datos.find(d => d.id === this.filaSeleccionada.id) || null);
                }
            },
            err => this.error(err, 'Error al cargar los datos')
        );
    }

    seleccionar(fila: any) {
        this.filaSeleccionada = fila;
        this.seleccion.emit(fila);
    }

    abrirAlta() {
        this.form = { id: 0, codigo: '', nombre: '', valor: '' };
        this.avanzado = false;
        this.modalForm.show();
    }

    abrirEdicion() {
        if (!this.filaSeleccionada) { return; }
        const f = this.filaSeleccionada;
        this.form = { id: f.id, codigo: f.codigo, nombre: f.nombre || '', valor: f.valor !== undefined && f.valor !== null ? f.valor : '',
                      protegido: f.protegido };
        this.avanzado = false;
        this.modalForm.show();
    }

    guardar() {
        const body: any = { id: this.form.id, nombre: this.form.nombre, valor: this.form.valor };
        /* El código solo se manda si se ha tocado en Avanzado; si no, el backend lo genera o lo conserva */
        if (this.avanzado && this.form.codigo) { body.codigo = this.form.codigo; }
        if (this.padreCampo) { body[this.padreCampo] = this.padreId; }
        this.guardando = true;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo, JSON.stringify(body)).subscribe(
            data => {
                this.guardando = false;
                this.toaster.success(this.form.id ? 'Cambios guardados' : 'Añadido', this.titulo);
                this.modalForm.hide();
                if (!this.form.id) { this.filaSeleccionada = { id: data.id }; }
                this.cargar();
                this.cambio.emit();
            },
            err => { this.guardando = false; this.error(err, 'Error al guardar'); }
        );
    }

    cambiarVisible(fila: any, evento: Event) {
        evento.stopPropagation();
        const activo = !fila.activo;
        fila.activo = activo;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/visible', JSON.stringify({ id: fila.id, activo })).subscribe(
            () => { },
            err => { fila.activo = !activo; this.error(err, 'No se pudo cambiar la visibilidad'); }
        );
    }

    mover(fila: any, paso: number, evento: Event) {
        evento.stopPropagation();
        const i = this.datos.indexOf(fila);
        const j = i + paso;
        if (i < 0 || j < 0 || j >= this.datos.length) { return; }
        const anterior = this.datos.slice();
        this.datos.splice(i, 1);
        this.datos.splice(j, 0, fila);
        const ids = this.datos.map(d => d.id);
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/orden', JSON.stringify({ ids })).subscribe(
            () => { },
            err => { this.datos = anterior; this.error(err, 'No se pudo cambiar el orden'); }
        );
    }

    pedirBorrado() {
        if (!this.filaSeleccionada || this.motivoNoBorrar) { return; }
        this.modalBorrar.show();
    }

    borrar() {
        const f = this.filaSeleccionada;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/delete', JSON.stringify({ id: f.id })).subscribe(
            () => {
                this.modalBorrar.hide();
                this.toaster.success('Borrado', this.titulo);
                this.seleccionar(null);
                this.cargar();
                this.cambio.emit();
            },
            err => { this.modalBorrar.hide(); this.error(err, 'Error al borrar'); }
        );
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.titulo);
    }
}
