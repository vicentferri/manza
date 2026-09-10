import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-incrementos-genericos',
    templateUrl: './incrementos-genericos.component.html',
    styleUrls: ['./incrementos-genericos.component.css'],
    providers: [HaruService]
})
export class IncrementosGenericosComponent implements OnInit {

    @ViewChild('modalAdd',  { static: false }) modalAdd!:  ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;

    title = 'Gestión de Incrementos Genéricos';

    datos: any[]          = [];
    datosFiltrados: any[] = [];
    filaSeleccionada: any = null;

    busqueda = '';
    filtros: any = {
        id: '', NomCli: '', DesMar: '', DesMod: '', DesPro: '',
        descripcion: '', pvp: '', c1: '', cod_solupyme: '', dgrupo: ''
    };
    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';
    pagina    = 1;
    porPagina = 50;

    // ── Dropdown options ──────────────────────────────────────────────
    clientesOpts: any[] = [];
    marcasOpts:   any[] = [];
    modelosOpts:  any[] = [];
    productosOpts: any[] = [
        { value: 1, label: 'Enrollable' },
        { value: 2, label: 'Panel Japones' },
        { value: 3, label: 'Panel Vertical' },
        { value: 4, label: 'Panel Compac' },
        { value: 6, label: 'Cajón ZIP' }
    ];

    // ── Forms ─────────────────────────────────────────────────────────
    formAdd: any = {
        id: 0, cliente: '', marca: '', modelo: '', producto: 1,
        descripcion: '', pvp: 0, c1: '', cod_solupyme: ''
    };

    formEdit: any = {
        id: null, cliente: '', marca: '', modelo: '', producto: 1,
        descripcion: '', pvp: 0, c1: '', cod_solupyme: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) {}

    ngOnInit() {
        this.loadData();
        this.loadClientes();
        this.loadMarcas();
        this.loadModelos();
    }

    // ── Data loading ──────────────────────────────────────────────────

    loadData() {
        this.service.HTTP_Get('/sm/incrementosG').subscribe(
            data => {
                this.datos = data.Table || [];
                this.filaSeleccionada = null;
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    loadClientes() {
        this.service.HTTP_Get('/formclientes').subscribe(
            data => { this.clientesOpts = data.Table || []; },
            () => {}
        );
    }

    loadMarcas() {
        this.service.HTTP_Get('/sm/accionamientos_marcas_form').subscribe(
            data => { this.marcasOpts = data.Table || []; },
            () => {}
        );
    }

    loadModelos() {
        this.service.HTTP_Get('/sm/accionamientos_modelos_form').subscribe(
            data => { this.modelosOpts = data.Table || []; },
            () => {}
        );
    }

    // ── Filters & search ─────────────────────────────────────────────

    onBusqueda()     { this.pagina = 1; this.aplicarFiltros(); }
    onFiltroColumna(){ this.pagina = 1; this.aplicarFiltros(); }

    limpiarFiltros() {
        this.busqueda = '';
        Object.keys(this.filtros).forEach(k => this.filtros[k] = '');
        this.pagina = 1;
        this.aplicarFiltros();
    }

    private aplicarFiltros() {
        let result = this.datos;

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                (r.NomCli       && r.NomCli.toLowerCase().includes(q))       ||
                (r.DesMar       && r.DesMar.toLowerCase().includes(q))       ||
                (r.DesMod       && r.DesMod.toLowerCase().includes(q))       ||
                (r.DesPro       && r.DesPro.toLowerCase().includes(q))       ||
                (r.descripcion  && r.descripcion.toLowerCase().includes(q))  ||
                (r.cod_solupyme && r.cod_solupyme.toLowerCase().includes(q)) ||
                (r.dgrupo       && r.dgrupo.toLowerCase().includes(q))
            );
        }

        Object.keys(this.filtros).forEach(key => {
            const val = (this.filtros[key] || '').trim().toLowerCase();
            if (val) {
                result = result.filter(r =>
                    r[key] != null && r[key].toString().toLowerCase().includes(val)
                );
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
    }

    // ── Sort & pagination ─────────────────────────────────────────────

    ordenar(col: string) {
        this.sortDir = this.sortCol === col && this.sortDir === 'asc' ? 'desc' : 'asc';
        this.sortCol = col;
        this.aplicarFiltros();
    }

    sortIcon(col: string): string {
        if (this.sortCol !== col) { return 'fa-sort'; }
        return this.sortDir === 'asc' ? 'fa-sort-asc' : 'fa-sort-desc';
    }

    get totalPaginas(): number {
        return Math.ceil(this.datosFiltrados.length / this.porPagina);
    }

    get datosPagina(): any[] {
        const inicio = (this.pagina - 1) * this.porPagina;
        return this.datosFiltrados.slice(inicio, inicio + this.porPagina);
    }

    get paginas(): number[] {
        const total   = this.totalPaginas;
        const current = this.pagina;
        const pages: number[] = [];
        const start = Math.max(1, current - 2);
        const end   = Math.min(total, current + 2);
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) { this.pagina = p; }
    }

    // ── Selection ─────────────────────────────────────────────────────

    seleccionar(fila: any) {
        this.filaSeleccionada =
            this.filaSeleccionada && this.filaSeleccionada.id === fila.id ? null : fila;
    }

    esSeleccionada(fila: any): boolean {
        return this.filaSeleccionada && this.filaSeleccionada.id === fila.id;
    }

    // ── Add ───────────────────────────────────────────────────────────

    openAdd() {
        this.formAdd = {
            id:           0,
            cliente:      this.clientesOpts.length ? this.clientesOpts[0].value : '',
            marca:        this.marcasOpts.length   ? this.marcasOpts[0].value   : '',
            modelo:       this.modelosOpts.length  ? this.modelosOpts[0].value  : '',
            producto:     1,
            descripcion:  '',
            pvp:          0,
            c1:           '',
            cod_solupyme: ''
        };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.cliente) {
            this.toaster.warning('El cliente es obligatorio', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/incremetosgenericos', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Registro agregado correctamente', this.title);
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al agregar el registro', this.title); }
        );
    }

    // ── Edit ──────────────────────────────────────────────────────────

    openEdit() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para editar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        this.formEdit = {
            id:           d.id,
            cliente:      d.cliente,
            marca:        d.marca,
            modelo:       d.modelo,
            producto:     d.producto,
            descripcion:  d.descripcion   || '',
            pvp:          d.pvp           || 0,
            c1:           d.c1            || 0,
            cod_solupyme: d.cod_solupyme  || ''
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        if (!this.formEdit.cliente) {
            this.toaster.warning('El cliente es obligatorio', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/incremetosgenericos', JSON.stringify(this.formEdit)).subscribe(
            () => {
                this.toaster.success('Registro actualizado', this.title);
                this.modalEdit.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al actualizar el registro', this.title); }
        );
    }

    // ── Delete ────────────────────────────────────────────────────────

    eliminar() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para eliminar', this.title);
            return;
        }
        if (!confirm('¿Eliminar el registro seleccionado?')) { return; }

        const payload = JSON.stringify({ ids: [this.filaSeleccionada.id], operation: 0 });
        this.service.HTTP_Post('/sm/incremetosG_del', payload).subscribe(
            () => {
                this.toaster.success('Registro eliminado', this.title);
                this.filaSeleccionada = null;
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar el registro', this.title); }
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────

    minVal(a: number, b: number): number { return Math.min(a, b); }

    getLabel(opts: any[], value: any): string {
        const opt = opts.find(o => o.value == value);
        return opt ? opt.label : (value != null ? value.toString() : '');
    }
}
