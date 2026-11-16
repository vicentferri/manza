import { Component, OnDestroy, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { PerfilVistaService, PerfilVista } from './perfil-vista.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx';

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
export class AccTablaComponent implements OnDestroy, OnChanges {

    @Input() catalogo = '';
    @Input() titulo = '';
    @Input() singular = 'registro';
    @Input() padreCampo = '';
    @Input() padreId: number = null;
    @Input() conValor = false;
    /* Unidad del valor (solo con conValor): se muestra en la cabecera, en el formulario y junto a cada valor */
    @Input() unidad = '';
    @Input() ayuda = '';
    /* Campos propios del catálogo, opcionales (el color del ZIP: [{ campo: 'ral', ... }, { campo: 'hex', color: true }]).
       Se editan en el formulario y se enseñan bajo el nombre; con color: true, además una muestra del color */
    @Input() extras: { campo: string, label: string, max: number, placeholder?: string, color?: boolean }[] = [];
    /* Lista fija (tipos y modalidades del Vertical): no se añaden ni se borran registros */
    @Input() fijo = false;
    /* Padres de los que se pueden copiar los registros a este (los otros tipos de vertical): [{ id, nombre }].
       Vacío = sin botón Copiar. Solo con padreCampo / padreId */
    @Input() copiarDe: { id: number, nombre: string }[] = [];
    /* Colores RAL (sqlColoresRal): botón "Cargar Excel" que da de alta o actualiza el hex y el tipo de cada RAL.
       El Excel: columnas HEX, Tipo y Equivalencia Sopena (el código RAL), con la cabecera en cualquier fila */
    @Input() importarRal = false;
    /* Lo sube el padre cuando cambia algo que afecta a "Uso" (hijos, relaciones) */
    @Input() recarga = 0;
    @Output() seleccion = new EventEmitter<any>();
    /* Se emite al añadir, editar, borrar u ocultar: los registros que cuelgan de este cambian su "Uso" */
    @Output() cambio = new EventEmitter<void>();

    @ViewChild('modalForm', { static: false }) modalForm: ModalDirective;
    @ViewChild('modalBorrar', { static: false }) modalBorrar: ModalDirective;
    @ViewChild('modalRal', { static: false }) modalRal: ModalDirective;

    datos: any[] = [];
    origenCopia: number = null;
    copiando = false;
    filaSeleccionada: any = null;
    busqueda = '';
    form: any = {};
    avanzado = false;
    guardando = false;


    /* Productos -> "Ver como" (Fase 2): con un perfil elegido, la lista se pinta en modo perfil (app-acc-perfil-lista) */
    perfilVista: PerfilVista | null = null;
    private subPerfil: Subscription;

    constructor(private service: HaruService, private toaster: ToastrService, private perfilVistaService: PerfilVistaService) {
        this.subPerfil = this.perfilVistaService.perfil$.subscribe(p => this.perfilVista = p);
    }

    ngOnDestroy() {
        if (this.subPerfil) { this.subPerfil.unsubscribe(); }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.catalogo || changes.padreId) {
            /* Sin emitir: el padre ya limpia su selección al cambiar de catálogo o de padre */
            this.filaSeleccionada = null;
            this.busqueda = '';
            this.origenCopia = null;
            this.cargar();
        } else if (changes.recarga && !changes.recarga.firstChange) {
            this.cargar();
        }
    }

    get datosFiltrados(): any[] {
        const b = this.busqueda.trim().toLowerCase();
        if (!b) { return this.datos; }
        return this.datos.filter(d =>
            [d.codigo, d.nombre, d.valor].concat(this.extras.map(e => d[e.campo])).some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(b)));
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
        if (f.protegido || this.fijo) { return 'Es fijo: no se puede borrar. Puede ocultarlo'; }
        if (f.uso_externo) { return 'Está en uso: ' + f.uso_externo + '. No se puede borrar. Puede ocultarlo'; }
        if (f.dependencias > 0) { return 'Está en uso (' + f.dependencias + '): no se puede borrar. Puede ocultarlo'; }
        if (f.suplementos > 0) { return 'Tiene suplementos de precio: quítelos antes de borrarlo, o ocúltelo'; }
        return '';
    }

    /* Suplemento: sin precios o solo el importe general fijo → se edita en la celda; si no, en el detalle */
    esFijo(d: any): boolean {
        return !d.suplementos || (d.suplementos === 1 && d.suplemento_fijo !== null);
    }

    importeTexto(d: any): string {
        return d.suplemento_fijo === null || d.suplemento_fijo === undefined ? '' : Number(d.suplemento_fijo).toFixed(2).replace('.', ',');
    }

    guardarFijo(d: any, input: HTMLInputElement) {
        const nuevo = String(input.value || '').trim();
        if (nuevo === this.importeTexto(d)) { return; }
        this.service.HTTP_Post('/sm/acc/sup/' + this.catalogo + '/' + d.id + '/fijo', JSON.stringify({ importe: nuevo })).subscribe(
            () => {
                this.toaster.success(nuevo ? 'Suplemento guardado' : 'Suplemento quitado', this.etiqueta(d));
                this.cargar();
            },
            /* Si no se guarda, la celda vuelve al importe que había */
            err => { input.value = this.importeTexto(d); this.error(err, 'No se pudo guardar el suplemento'); }
        );
    }

    /* Las filas se conservan al recargar: si no, al guardar un suplemento se perdería el foco de la siguiente celda */
    porId(i: number, d: any): number {
        return d.id;
    }

    /* Con valor (alturas): el nombre si lo tiene ("100 CM"); si no, el valor con su unidad ("100 cm") */
    etiqueta(d: any): string {
        return this.conValor ? (d.nombre || d.valor + (this.unidad ? ' ' + this.unidad : '')) : d.nombre;
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
        this.extras.forEach(e => this.form[e.campo] = '');
        this.avanzado = false;
        this.modalForm.show();
    }

    abrirEdicion() {
        if (!this.filaSeleccionada) { return; }
        const f = this.filaSeleccionada;
        this.form = { id: f.id, codigo: f.codigo, nombre: f.nombre || '', valor: f.valor !== undefined && f.valor !== null ? f.valor : '',
                      protegido: f.protegido };
        this.extras.forEach(e => this.form[e.campo] = f[e.campo] || '');
        this.avanzado = false;
        this.modalForm.show();
    }

    /* Texto de los campos propios bajo el nombre (el RAL; el hex ya se ve en la muestra) */
    extrasTexto(d: any): string {
        return this.extras.filter(e => !e.color && d[e.campo]).map(e => d[e.campo]).join(' · ');
    }

    /* Color válido para la muestra: #RRGGBB */
    esColor(valor: any): boolean {
        return /^#[0-9A-Fa-f]{6}$/.test(String(valor || ''));
    }

    guardar() {
        const body: any = { id: this.form.id, nombre: this.form.nombre, valor: this.form.valor };
        this.extras.forEach(e => body[e.campo] = this.form[e.campo]);
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

    /* Añade a este padre los registros del origen que aún no tenga (mismo código, nombre o valor), con sus
       suplementos; lo que ya tiene no se toca */
    copiar() {
        const origen = this.copiarDe.find(o => o.id === Number(this.origenCopia));
        if (!origen || !this.padreId) { return; }
        this.copiando = true;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/copiar', JSON.stringify({ origen: origen.id, destino: this.padreId })).subscribe(
            data => {
                this.copiando = false;
                this.origenCopia = null;
                const ya = data.yaEstaban ? ' (' + data.yaEstaban + ' ya estaban)' : '';
                if (data.copiados) {
                    this.toaster.success(data.copiados + ' copiado(s) de ' + origen.nombre + ya, this.titulo);
                } else {
                    this.toaster.info('No había nada nuevo que copiar de ' + origen.nombre + ya, this.titulo);
                }
                this.cargar();
                this.cambio.emit();
            },
            err => { this.copiando = false; this.error(err, 'No se pudo copiar'); }
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

    /* ---------- Colores RAL desde Excel ---------- */

    ralFilas: { ral: string, hex: string, tipo: string }[] = [];
    ralArchivo = '';
    ralPrevia: any = null;
    ralCargando = false;
    ralDesactivar = true;

    leerExcelRal(input: HTMLInputElement) {
        const archivo = input.files && input.files[0];
        input.value = '';
        if (!archivo) { return; }
        const lector = new FileReader();
        lector.onload = (e: any) => {
            try {
                const libro = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const filas = this.filasRal(libro);
                if (filas.length === 0) {
                    this.toaster.error('No se encuentran las columnas HEX y Equivalencia Sopena (o RAL)', this.titulo);
                    return;
                }
                this.ralFilas = filas;
                this.ralArchivo = archivo.name;
                this.previaRal();
            } catch (err) {
                this.toaster.error('No se pudo leer el Excel', this.titulo);
            }
        };
        lector.readAsArrayBuffer(archivo);
    }

    /* Busca la cabecera (HEX + Equivalencia/RAL) en las 20 primeras filas de cada hoja y lee las filas de debajo */
    private filasRal(libro: XLSX.WorkBook): { ral: string, hex: string, tipo: string }[] {
        const limpio = (v: any) => String(v === null || v === undefined ? '' : v).trim();
        const cabecera = (v: any) => limpio(v).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
        for (const nombre of libro.SheetNames) {
            const filas: any[][] = XLSX.utils.sheet_to_json(libro.Sheets[nombre], { header: 1, defval: '', raw: false });
            for (let i = 0; i < Math.min(filas.length, 20); i++) {
                const cab = (filas[i] || []).map(cabecera);
                const cHex = cab.findIndex(c => c === 'HEX' || c === 'COLOR HEX');
                let cRal = cab.findIndex(c => c.startsWith('EQUIVALENCIA'));
                if (cRal < 0) { cRal = cab.findIndex(c => c === 'RAL' || c === 'CODIGO RAL'); }
                const cTipo = cab.findIndex(c => c === 'TIPO');
                if (cHex < 0 || cRal < 0) { continue; }
                return filas.slice(i + 1)
                    .map(f => ({ ral: limpio(f[cRal]), hex: limpio(f[cHex]), tipo: cTipo >= 0 ? limpio(f[cTipo]) : '' }))
                    .filter(f => f.ral);
            }
        }
        return [];
    }

    previaRal() {
        this.ralCargando = true;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/importar-ral', JSON.stringify({ filas: this.ralFilas, aplicar: false, desactivar: this.ralDesactivar })).subscribe(
            data => { this.ralCargando = false; this.ralPrevia = data; this.modalRal.show(); },
            err => { this.ralCargando = false; this.error(err, 'No se pudo revisar el Excel'); }
        );
    }

    aplicarRal() {
        this.ralCargando = true;
        this.service.HTTP_Post('/sm/acc/' + this.catalogo + '/importar-ral', JSON.stringify({ filas: this.ralFilas, aplicar: true, desactivar: this.ralDesactivar })).subscribe(
            data => {
                this.ralCargando = false;
                this.modalRal.hide();
                this.toaster.success(data.nuevos.length + ' nuevo(s), ' + data.actualizados.length + ' actualizado(s), '
                    + data.desactivados.length + ' desactivado(s)', this.titulo);
                this.ralFilas = [];
                this.ralPrevia = null;
                this.cargar();
                this.cambio.emit();
            },
            err => { this.ralCargando = false; this.error(err, 'No se pudo cargar el Excel'); }
        );
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.titulo);
    }
}
