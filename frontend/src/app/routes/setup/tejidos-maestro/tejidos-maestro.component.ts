import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

/*
 * Maestro de tejidos (SOL_TEJIDOS_MAESTRO / SOL_TEJIDOS_TIPOS, ver tejidos.md).
 * Una fila por tejido + color. Coste ml y grupo son calculados: aquí solo se muestran.
 * Grupo = letra del (coste m² + 10 %, redondeado arriba) + criterio; lo calcula el backend al guardar.
 * Coste ml: solo en los tejidos y lamas (89 / 127 mm) que marque el usuario; depende del coste m²
 * y del precio minuto de mano de obra, que se cambia en "Parámetros ml".
 * No se borra: se da de baja.
 */
@Component({
    selector: 'app-tejidos-maestro',
    templateUrl: './tejidos-maestro.component.html',
    styleUrls: ['./tejidos-maestro.component.css'],
    providers: [HaruService]
})
export class TejidosMaestroComponent implements OnInit {

    @ViewChild('modalTejido', { static: false }) modalTejido!: ModalDirective;
    @ViewChild('modalTipos', { static: false }) modalTipos!: ModalDirective;
    @ViewChild('modalMl', { static: false }) modalMl!: ModalDirective;
    @ViewChild('modalParamsMl', { static: false }) modalParamsMl!: ModalDirective;

    title = 'Maestro de Tejidos';

    datos: any[] = [];
    datosFiltrados: any[] = [];
    seleccionados = new Set<number>();

    tipos: any[] = [];
    tiposActivos: any[] = [];

    busqueda = '';
    filtros: any = { cod_solupyme: '', desc_tipo: '', nombre: '', color: '', criterio: '', coste_m2: '', grupo: '' };
    filtroTipo: any = '';
    filtroImpresion = '';
    filtroEstado = 'activos';
    filtroIncompletos = false;
    filtroMl = '';
    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 50;

    // La ventana de edición está siempre en la página: lamas y ml tienen que existir desde el principio
    form: any = { lamas: {}, ml: {} };
    guardando = false;

    formTipo: any = { idrow: null, descripcion: '' };

    // Coste ml: lamas disponibles, precio minuto y marcado en bloque
    lamas: any[] = [];
    precioMinuto: number = null;
    precioMinutoEdit: any = null;
    mlLamas: any = {};

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadTipos();
        this.loadConfigMl();
        this.loadData();
    }

    // ── Carga ─────────────────────────────────────────────────────────

    loadData() {
        this.service.HTTP_Get('/sm/tejidos_maestro').subscribe(
            data => {
                // ml_89, ml_127...: el coste ml de cada lama como columna, para filtrar y ordenar
                this.datos = (data.Table || []).map(r => {
                    Object.keys(r.ml || {}).forEach(a => r['ml_' + a] = r.ml[a]);
                    return r;
                });
                const ids = new Set(this.datos.map(d => d.idrow));
                this.seleccionados.forEach(id => { if (!ids.has(id)) { this.seleccionados.delete(id); } });
                this.aplicarFiltros();
            },
            err => { this.error(err, 'Error al cargar los tejidos'); }
        );
    }

    loadTipos() {
        this.service.HTTP_Get('/sm/tejidos_maestro/tipos').subscribe(
            data => {
                this.tipos = data.Table || [];
                this.tiposActivos = this.tipos.filter(t => t.activo);
            },
            err => { this.error(err, 'Error al cargar los tipos de tejido'); }
        );
    }

    loadConfigMl() {
        this.service.HTTP_Get('/sm/tejidos_maestro/ml_config').subscribe(
            data => {
                this.lamas = data.lamas || [];
                this.precioMinuto = data.precio_minuto;
                this.lamas.forEach(l => {
                    if (!('ml_' + l.ancho_mm in this.filtros)) { this.filtros['ml_' + l.ancho_mm] = ''; }
                });
            },
            err => { this.error(err, 'Error al cargar los parámetros del coste ml'); }
        );
    }

    tieneMl(fila: any, ancho: number): boolean {
        return fila.ml && fila.ml.hasOwnProperty(ancho);
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, this.title);
    }

    // ── Filtros, orden y paginación ─────────────────────────────────

    onFiltro() {
        this.pagina = 1;
        this.aplicarFiltros();
    }

    limpiarFiltros() {
        this.busqueda = '';
        Object.keys(this.filtros).forEach(k => this.filtros[k] = '');
        this.filtroTipo = '';
        this.filtroImpresion = '';
        this.filtroEstado = 'activos';
        this.filtroIncompletos = false;
        this.filtroMl = '';
        this.onFiltro();
    }

    private aplicarFiltros() {
        let result = this.datos;

        if (this.filtroEstado === 'activos') { result = result.filter(r => r.activo); }
        if (this.filtroEstado === 'bajas') { result = result.filter(r => !r.activo); }
        if (this.filtroTipo === 'sin') {
            result = result.filter(r => r.tipo_tejido == null);
        } else if (this.filtroTipo !== '') {
            result = result.filter(r => r.tipo_tejido === +this.filtroTipo);
        }
        if (this.filtroImpresion !== '') { result = result.filter(r => !!r.impresion_digital === (this.filtroImpresion === '1')); }
        if (this.filtroIncompletos) { result = result.filter(r => r.tipo_tejido == null || r.criterio == null); }
        if (this.filtroMl === 'con') { result = result.filter(r => Object.keys(r.ml || {}).length > 0); }
        if (this.filtroMl === 'sin') { result = result.filter(r => Object.keys(r.ml || {}).length === 0); }

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                [r.cod_solupyme, r.nombre, r.color, r.desc_tipo].some(v => v != null && v.toString().toLowerCase().includes(q)));
        }

        Object.keys(this.filtros).forEach(key => {
            const val = (this.filtros[key] || '').toString().trim().toLowerCase();
            if (val) {
                result = result.filter(r => r[key] != null && r[key].toString().toLowerCase().includes(val));
            }
        });

        if (this.sortCol) {
            const dir = this.sortDir === 'asc' ? 1 : -1;
            result = result.slice().sort((a, b) => {
                const va = a[this.sortCol] != null ? a[this.sortCol] : '';
                const vb = b[this.sortCol] != null ? b[this.sortCol] : '';
                return va < vb ? -dir : va > vb ? dir : 0;
            });
        }

        this.datosFiltrados = result;
        if (this.pagina > this.totalPaginas) { this.pagina = Math.max(1, this.totalPaginas); }
    }

    ordenar(col: string) {
        if (this.sortCol === col) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortCol = col;
            this.sortDir = 'asc';
        }
        this.aplicarFiltros();
    }

    get totalPaginas(): number {
        return Math.ceil(this.datosFiltrados.length / this.porPagina);
    }

    get datosPagina(): any[] {
        const inicio = (this.pagina - 1) * this.porPagina;
        return this.datosFiltrados.slice(inicio, inicio + this.porPagina);
    }

    get paginas(): number[] {
        const pages: number[] = [];
        const start = Math.max(1, this.pagina - 2);
        const end = Math.min(this.totalPaginas, this.pagina + 2);
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) { this.pagina = p; }
    }

    minVal(a: number, b: number): number { return Math.min(a, b); }

    // ── Selección ───────────────────────────────────────────────────

    toggleSeleccion(id: number) {
        if (this.seleccionados.has(id)) {
            this.seleccionados.delete(id);
        } else {
            this.seleccionados.add(id);
        }
    }

    seleccionarTodos() { this.datosFiltrados.forEach(f => this.seleccionados.add(f.idrow)); }

    seleccionarNinguno() { this.seleccionados.clear(); }

    get hayBajasSeleccionadas(): boolean {
        return this.datos.some(d => this.seleccionados.has(d.idrow) && !d.activo);
    }

    get hayActivosSeleccionados(): boolean {
        return this.datos.some(d => this.seleccionados.has(d.idrow) && d.activo);
    }

    // ── Alta / edición ──────────────────────────────────────────────

    openAdd() {
        this.form = {
            idrow: null, cod_solupyme: '', tipo_tejido: null, nombre: '', color: '', criterio: null,
            impresion_digital: false, coste_m2: null, lamas: {}, ml: {}
        };
        this.modalTejido.show();
    }

    openEdit(fila?: any) {
        if (!fila) {
            const ids = Array.from(this.seleccionados);
            if (ids.length !== 1) {
                this.toaster.warning('Selecciona un único tejido para editar', this.title);
                return;
            }
            fila = this.datos.find(f => f.idrow === ids[0]);
        }
        this.form = {
            idrow: fila.idrow, cod_solupyme: fila.cod_solupyme, tipo_tejido: fila.tipo_tejido, nombre: fila.nombre,
            color: fila.color, criterio: fila.criterio, impresion_digital: !!fila.impresion_digital, coste_m2: fila.coste_m2,
            grupo: fila.grupo, ml: fila.ml || {}, lamas: {}
        };
        Object.keys(fila.ml || {}).forEach(a => this.form.lamas[a] = true);
        this.modalTejido.show();
    }

    guardar() {
        if (!this.form.cod_solupyme || !this.form.nombre || !this.form.color || this.form.coste_m2 == null || this.form.coste_m2 === '') {
            this.toaster.warning('Código Solupyme, nombre, color y coste m² son obligatorios', this.title);
            return;
        }
        this.guardando = true;
        const payload = Object.assign({}, this.form, {
            lamas: this.lamas.filter(l => this.form.lamas[l.ancho_mm]).map(l => l.ancho_mm)
        });
        this.service.HTTP_Post('/sm/tejidos_maestro', JSON.stringify(payload)).subscribe(
            () => {
                this.guardando = false;
                this.toaster.success('Tejido guardado', this.title);
                this.modalTejido.hide();
                this.loadData();
                this.loadTipos();
                this.loadConfigMl();
            },
            err => {
                this.guardando = false;
                this.error(err, 'No se ha podido guardar el tejido');
            }
        );
    }

    recalcular() {
        if (!confirm('¿Recalcular el grupo y el coste ml de todos los tejidos?')) { return; }
        this.service.HTTP_Post('/sm/tejidos_maestro/calcular', '{}').subscribe(
            data => {
                const sinGrupo = data.sin_grupo ? ' (' + data.sin_grupo + ' sin grupo)' : '';
                this.toaster.success(data.calculados + ' tejidos recalculados' + sinGrupo + ', ' + data.costes_ml + ' costes ml', this.title);
                this.loadData();
            },
            err => { this.error(err, 'No se han podido recalcular'); }
        );
    }

    // ── Coste ml ────────────────────────────────────────────────────

    /* Marcar o quitar el cálculo de coste ml en los tejidos seleccionados */
    openMl() {
        if (this.seleccionados.size === 0) {
            this.toaster.warning('Selecciona al menos un tejido', this.title);
            return;
        }
        this.mlLamas = {};
        this.lamas.forEach(l => this.mlLamas[l.ancho_mm] = true);
        this.modalMl.show();
    }

    get mlLamasElegidas(): number[] {
        return this.lamas.filter(l => this.mlLamas[l.ancho_mm]).map(l => l.ancho_mm);
    }

    aplicarMl(marcar: boolean) {
        const lamas = this.mlLamasElegidas;
        if (lamas.length === 0) {
            this.toaster.warning('Elige al menos una lama', this.title);
            return;
        }
        const ids = Array.from(this.seleccionados);
        this.service.HTTP_Post('/sm/tejidos_maestro/ml', JSON.stringify({ ids, lamas, marcar })).subscribe(
            () => {
                const texto = marcar ? 'Coste ml calculado' : 'Coste ml quitado';
                this.toaster.success(texto + ' en ' + ids.length + ' tejido(s) (' + lamas.join(' y ') + ' mm)', this.title);
                this.modalMl.hide();
                this.loadData();
                this.loadConfigMl();
            },
            err => { this.error(err, 'No se ha podido cambiar el coste ml'); }
        );
    }

    openParamsMl() {
        this.precioMinutoEdit = this.precioMinuto;
        this.modalParamsMl.show();
    }

    guardarPrecioMinuto() {
        const valor = this.precioMinutoEdit;
        if (valor == null || valor === '' || isNaN(+valor) || +valor < 0) {
            this.toaster.warning('El precio minuto tiene que ser un número mayor o igual que 0', this.title);
            return;
        }
        if (!confirm('¿Cambiar el precio minuto a ' + valor + ' € y recalcular el coste ml de todos los tejidos?')) { return; }
        this.service.HTTP_Post('/sm/tejidos_maestro/precio_minuto', JSON.stringify({ valor })).subscribe(
            data => {
                this.toaster.success('Precio minuto guardado; ' + data.costes_ml + ' costes ml recalculados', this.title);
                this.modalParamsMl.hide();
                this.loadConfigMl();
                this.loadData();
            },
            err => { this.error(err, 'No se ha podido guardar el precio minuto'); }
        );
    }

    // ── Baja / reactivación ─────────────────────────────────────────

    cambiarActivo(activo: boolean) {
        const ids = this.datos.filter(d => this.seleccionados.has(d.idrow) && !!d.activo !== activo).map(d => d.idrow);
        if (ids.length === 0) { return; }
        const texto = activo ? '¿Reactivar ' + ids.length + ' tejido(s)?' : '¿Dar de baja ' + ids.length + ' tejido(s)?';
        if (!confirm(texto)) { return; }
        this.service.HTTP_Post('/sm/tejidos_maestro/activo', JSON.stringify({ ids, activo })).subscribe(
            () => {
                this.toaster.success(activo ? 'Tejidos reactivados' : 'Tejidos dados de baja', this.title);
                this.seleccionados.clear();
                this.loadData();
            },
            err => { this.error(err, 'No se ha podido cambiar el estado'); }
        );
    }

    // ── Tipos de tejido ─────────────────────────────────────────────

    openTipos() {
        this.formTipo = { idrow: null, descripcion: '' };
        this.modalTipos.show();
    }

    editarTipo(tipo: any) {
        this.formTipo = { idrow: tipo.idrow, descripcion: tipo.descripcion, activo: !!tipo.activo };
    }

    cancelarTipo() {
        this.formTipo = { idrow: null, descripcion: '' };
    }

    guardarTipo(tipo?: any) {
        const payload = tipo ? { idrow: tipo.idrow, descripcion: tipo.descripcion, activo: !tipo.activo } : this.formTipo;
        if (!payload.descripcion || !payload.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/tejidos_maestro/tipos', JSON.stringify(payload)).subscribe(
            () => {
                this.toaster.success('Tipo de tejido guardado', this.title);
                this.cancelarTipo();
                this.loadTipos();
                this.loadData();
            },
            err => { this.error(err, 'No se ha podido guardar el tipo'); }
        );
    }
}
