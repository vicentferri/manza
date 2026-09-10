import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-clientes-gestion',
    templateUrl: './clientes-gestion.component.html',
    styleUrls: ['./clientes-gestion.component.css'],
    providers: [HaruService]
})
export class ClientesGestionComponent implements OnInit {

    @ViewChild('modalBulk', { static: false }) modalBulk!: ModalDirective;
    @ViewChild('modalAdd',  { static: false }) modalAdd!: ModalDirective;

    title = 'Gestión de Clientes y Productos Visibles';

    datos: any[]          = [];
    datosFiltrados: any[] = [];

    seleccionadas = new Set<number>();
    busqueda  = '';
    filtros: any = {
        name: '',
        surname: '',
        email: '',
        descempresa: '',
        descsubempresa: ''
    };

    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';
    pagina    = 1;
    porPagina = 50;

    readonly productos = [
        { campo: 'prod_1', label: 'Enrollable' },
        { campo: 'prod_2', label: 'Panel Japonés' },
        { campo: 'prod_3', label: 'Vertical' },
        { campo: 'prod_4', label: 'Noche y Día' },
        { campo: 'prod_7', label: 'Veneciana Madera' },
    ];

    formBulk: any = {
        prod_1: '', prod_2: '', prod_3: '', prod_4: '', prod_7: ''
    };

    formAdd: any = {
        name: '', surname: '', email: '', password: '',
        role: 'Cliente', empresa: null, subempresa: null
    };

    private updateParams: any = {
        table: 'CLIENTES_USERS',
        column: 'IDROW',
        id: 0,
        field: '',
        value: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.service.HTTP_Get('/sm/clientes_users').subscribe(
            data => {
                this.datos = data.Table || [];
                this.seleccionadas.clear();
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar clientes', this.title); }
        );
    }

    // ── FILTROS Y BÚSQUEDA ──────────────────────────────────────────────────

    onBusqueda() { this.pagina = 1; this.aplicarFiltros(); }
    onFiltroColumna() { this.pagina = 1; this.aplicarFiltros(); }

    limpiarFiltros() {
        this.busqueda = '';
        this.filtros  = { name: '', surname: '', email: '', descempresa: '', descsubempresa: '' };
        this.pagina   = 1;
        this.aplicarFiltros();
    }

    aplicarFiltros() {
        const q = this.busqueda.toLowerCase().trim();
        this.datosFiltrados = this.datos.filter(f => {
            if (q) {
                const matchGeneral =
                    (f.NAME           && f.NAME.toLowerCase().includes(q))           ||
                    (f.SURNAME        && f.SURNAME.toLowerCase().includes(q))        ||
                    (f.EMAIL          && f.EMAIL.toLowerCase().includes(q))          ||
                    (f.USERNAME       && f.USERNAME.toLowerCase().includes(q))       ||
                    (f.descempresa    && f.descempresa.toLowerCase().includes(q))    ||
                    (f.descsubempresa && f.descsubempresa.toLowerCase().includes(q));
                if (!matchGeneral) { return false; }
            }
            if (this.filtros.name           && !(f.NAME           && f.NAME.toLowerCase().includes(this.filtros.name.toLowerCase())))           { return false; }
            if (this.filtros.surname        && !(f.SURNAME        && f.SURNAME.toLowerCase().includes(this.filtros.surname.toLowerCase())))        { return false; }
            if (this.filtros.email          && !((f.EMAIL && f.EMAIL.toLowerCase().includes(this.filtros.email.toLowerCase())) || (f.USERNAME && f.USERNAME.toLowerCase().includes(this.filtros.email.toLowerCase())))) { return false; }
            if (this.filtros.descempresa    && !(f.descempresa    && f.descempresa.toLowerCase().includes(this.filtros.descempresa.toLowerCase())))    { return false; }
            if (this.filtros.descsubempresa && !(f.descsubempresa && f.descsubempresa.toLowerCase().includes(this.filtros.descsubempresa.toLowerCase()))) { return false; }
            return true;
        });

        if (this.sortCol) {
            this.datosFiltrados.sort((a, b) => {
                const va = a[this.sortCol] != null ? a[this.sortCol] : '';
                const vb = b[this.sortCol] != null ? b[this.sortCol] : '';
                const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
                return this.sortDir === 'asc' ? cmp : -cmp;
            });
        }
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

    // ── PAGINACIÓN ──────────────────────────────────────────────────────────

    get totalPaginas(): number {
        return Math.max(1, Math.ceil(this.datosFiltrados.length / this.porPagina));
    }

    get datosPagina(): any[] {
        const start = (this.pagina - 1) * this.porPagina;
        return this.datosFiltrados.slice(start, start + this.porPagina);
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) { this.pagina = p; }
    }

    // ── SELECCIÓN ───────────────────────────────────────────────────────────

    estaSeleccionada(fila: any): boolean {
        return this.seleccionadas.has(fila.IDROW);
    }

    toggleFila(fila: any) {
        if (this.seleccionadas.has(fila.IDROW)) {
            this.seleccionadas.delete(fila.IDROW);
        } else {
            this.seleccionadas.add(fila.IDROW);
        }
    }

    get todasSeleccionadas(): boolean {
        return this.datosPagina.length > 0 && this.datosPagina.every(f => this.seleccionadas.has(f.IDROW));
    }

    toggleTodas() {
        if (this.todasSeleccionadas) {
            this.datosPagina.forEach(f => this.seleccionadas.delete(f.IDROW));
        } else {
            this.datosPagina.forEach(f => this.seleccionadas.add(f.IDROW));
        }
    }

    // ── ACTUALIZACIÓN DE PRODUCTOS INLINE ───────────────────────────────────

    toggleProducto(fila: any, campo: string) {
        const newValue = fila[campo] ? 0 : 1;
        const payload = JSON.stringify({
            ...this.updateParams,
            id: fila.IDROW,
            field: campo,
            value: newValue
        });
        this.service.HTTP_Post('/sm/update_table', payload).subscribe(
            () => { fila[campo] = newValue; },
            () => { this.toaster.error('Error al actualizar el producto del cliente', this.title); }
        );
    }

    toggleActivo(fila: any) {
        const newValue = fila.ACTIVO ? 0 : 1;
        const payload = JSON.stringify({
            ...this.updateParams,
            id: fila.IDROW,
            field: 'ACTIVO',
            value: newValue
        });
        this.service.HTTP_Post('/sm/update_table', payload).subscribe(
            () => { fila.ACTIVO = newValue; },
            () => { this.toaster.error('Error al actualizar estado activo', this.title); }
        );
    }

    // ── PRODUCTOS EN BLOQUE ─────────────────────────────────────────────────

    openBulk() {
        if (this.seleccionadas.size === 0) {
            this.toaster.warning('Selecciona al menos un cliente', this.title);
            return;
        }
        this.formBulk = { prod_1: '', prod_2: '', prod_3: '', prod_4: '', prod_7: '' };
        this.modalBulk.show();
    }

    aplicarBulk() {
        const ids = Array.from(this.seleccionadas);
        const camposActivos = this.productos.filter(p => this.formBulk[p.campo] !== '');

        if (camposActivos.length === 0) {
            this.toaster.warning('Selecciona al menos una acción para aplicar', this.title);
            return;
        }

        const total = ids.length * camposActivos.length;
        let completadas = 0;
        let hayError    = false;

        ids.forEach(id => {
            camposActivos.forEach(p => {
                const payload = JSON.stringify({
                    ...this.updateParams,
                    id,
                    field: p.campo,
                    value: parseInt(this.formBulk[p.campo], 10)
                });
                this.service.HTTP_Post('/sm/update_table', payload).subscribe(
                    () => {
                        completadas++;
                        if (completadas === total && !hayError) {
                            this.toaster.success('Productos actualizados para ' + ids.length + ' cliente(s)', this.title);
                            this.modalBulk.hide();
                            this.loadData();
                        }
                    },
                    () => {
                        if (!hayError) {
                            hayError = true;
                            this.toaster.error('Error al aplicar los cambios en bloque', this.title);
                        }
                    }
                );
            });
        });
    }

    // ── ALTA DE CLIENTE ─────────────────────────────────────────────────────

    openAdd() {
        this.formAdd = {
            name: '', surname: '', email: '', password: '',
            role: 'Cliente', empresa: null, subempresa: null
        };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.name.trim()) {
            this.toaster.warning('El nombre es obligatorio', this.title);
            return;
        }
        if (!this.formAdd.email.trim()) {
            this.toaster.warning('El email/usuario es obligatorio', this.title);
            return;
        }
        if (!this.formAdd.password) {
            this.toaster.warning('La contraseña es obligatoria', this.title);
            return;
        }
        if (!this.formAdd.empresa || !this.formAdd.subempresa) {
            this.toaster.warning('Empresa y Subempresa (tienda) son obligatorias', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/client_register', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Cliente agregado correctamente', this.title);
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al agregar el cliente', this.title); }
        );
    }

    // ── ELIMINAR CLIENTES ───────────────────────────────────────────────────

    eliminar() {
        if (this.seleccionadas.size === 0) {
            this.toaster.warning('Selecciona al menos un cliente para eliminar', this.title);
            return;
        }
        const n = this.seleccionadas.size;
        if (!confirm('¿Eliminar ' + (n === 1 ? 'el cliente seleccionado' : 'los ' + n + ' clientes seleccionados') + '?')) { return; }

        const ids = Array.from(this.seleccionadas).join(',');
        this.service.HTTP_Post('/sm/clientes_users_del', JSON.stringify({ ids })).subscribe(
            () => {
                this.toaster.success(n + ' cliente(s) eliminado(s)', this.title);
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar clientes', this.title); }
        );
    }
}
