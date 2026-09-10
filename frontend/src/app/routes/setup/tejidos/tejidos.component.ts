import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-tejidos',
    templateUrl: './tejidos.component.html',
    styleUrls: ['./tejidos.component.css'],
    providers: [HaruService]
})
export class TejidosComponent implements OnInit {

    @ViewChild('modalAdd', { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;
    @ViewChild('modalFicha', { static: false }) modalFicha!: ModalDirective;

    title = 'Gestión de Tejidos';

    datos: any[] = [];
    datosFiltrados: any[] = [];
    seleccionados = new Set<number>();

    busqueda = '';
    filtros: any = {
        idrow: '', descripcion: '', coste: '', criterio: '', coste3: '', criterio3: '',
        coste4: '', criterio4: '', densidad: '', opacidad: '', tarifa: ''
    };
    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 50;

    clientesOpts: any[] = [];
    clienteDestino: any = null;

    param1Opciones: any[] = [
        { idrow: 1, descripcion: 'Actualizar Todas las Tarifas' },
        { idrow: 2, descripcion: 'Actualizar Solo las Desbloqueadas' }
    ];
    param1 = 1;

    productosCliente: any[] = [
        { id: 1, name: 'Enrollable', imp: false, sel: true, dias: 5 },
        { id: 2, name: 'Panel Japones', imp: false, sel: false, dias: 5 },
        { id: 3, name: 'Panel Vertical', imp: false, sel: false, dias: 5 },
        { id: 4, name: 'Panel Compac', imp: false, sel: false, dias: 5 },
        { id: 6, name: 'Cajón ZIP', imp: false, sel: false, dias: 5 }
    ];

    formAdd: any = { descripcion: '' };
    formEdit: any = { idrow: null, descripcion: '' };

    editSheetValue: number = null;
    fichaTecnica: any = { opacidad: '', uso_recomendado: '', info_tecnica: '' };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
        this.loadClientes();
    }

    // ── Data loading ──────────────────────────────────────────────────

    loadData() {
        this.service.HTTP_Get('/sm/tejidos').subscribe(
            data => {
                this.datos = (data.Table || []).map((r: any) => ({ ...r, _original: { ...r } }));
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    loadClientes() {
        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => { this.clientesOpts = data.Table || []; },
            () => { }
        );
    }

    // ── Filtros, orden y paginación ─────────────────────────────────────

    onBusqueda() {
        this.pagina = 1;
        this.aplicarFiltros();
    }

    onFiltroColumna() {
        this.pagina = 1;
        this.aplicarFiltros();
    }

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
            result = result.filter(r => r.descripcion && r.descripcion.toLowerCase().includes(q));
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
        const total = this.totalPaginas;
        const current = this.pagina;
        const pages: number[] = [];
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);
        for (let i = start; i <= end; i++) { pages.push(i); }
        return pages;
    }

    irPagina(p: number) {
        if (p >= 1 && p <= this.totalPaginas) { this.pagina = p; }
    }

    // ── Selección ─────────────────────────────────────────────────────

    toggleSeleccion(id: number) {
        if (this.seleccionados.has(id)) {
            this.seleccionados.delete(id);
        } else {
            this.seleccionados.add(id);
        }
    }

    estaSeleccionado(id: number): boolean {
        return this.seleccionados.has(id);
    }

    seleccionarTodos() {
        this.datosFiltrados.forEach(f => this.seleccionados.add(f.idrow));
    }

    seleccionarNinguno() {
        this.seleccionados.clear();
    }

    // ── Edición inline de tarifas ────────────────────────────────────

    actualizarCampo(fila: any, field: string) {
        const valorNuevo = fila[field];
        const valorAnterior = fila._original[field];

        if (valorNuevo == valorAnterior) { return; }

        if (!confirm('¿Desea Actualizar?')) {
            fila[field] = valorAnterior;
            return;
        }

        const payload = JSON.stringify({
            id: fila.idrow,
            table: 'sol_articulos_tejidos',
            column: 'idrow',
            field,
            value: valorNuevo,
            type: 200,
            param1: this.param1,
            param2: '',
            param3: ''
        });

        this.service.HTTP_Post('/bulk', payload).subscribe(
            () => {
                fila._original[field] = valorNuevo;
                this.toaster.success('Actualizado el precio', 'Gestión de Tejidos');
            },
            () => {
                fila[field] = valorAnterior;
                this.toaster.error('Error al actualizar el registro', this.title);
            }
        );
    }

    // ── CRUD — Agregar ──────────────────────────────────────────────────

    openAdd() {
        this.formAdd = { descripcion: '' };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/tejido', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Operación Realizada', 'Actualización');
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Operación NO Realizada', 'Actualización'); }
        );
    }

    // ── CRUD — Editar ────────────────────────────────────────────────────

    openEdit() {
        const ids = Array.from(this.seleccionados);
        if (ids.length !== 1) {
            this.toaster.warning('Selecciona un único tejido para editar', this.title);
            return;
        }
        const fila = this.datos.find(f => f.idrow === ids[0]);
        this.formEdit = { idrow: fila.idrow, descripcion: fila.descripcion };
        this.modalEdit.show();
    }

    guardarEdit() {
        if (!this.formEdit.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/tejido', JSON.stringify(this.formEdit)).subscribe(
            () => {
                this.toaster.success('Operación Realizada', 'Actualización');
                this.modalEdit.hide();
                this.loadData();
            },
            () => { this.toaster.error('Operación NO Realizada', 'Actualización'); }
        );
    }

    // ── CRUD — Borrar ────────────────────────────────────────────────────

    eliminarSeleccion() {
        const ids = Array.from(this.seleccionados);
        if (ids.length === 0) {
            this.toaster.warning('Selecciona al menos un tejido para eliminar', this.title);
            return;
        }
        if (!confirm('¿Desea Borrar la Selección Realizada?')) { return; }

        const payload = JSON.stringify({ ids, operation: 0 });
        this.service.HTTP_Post('/sm/tejidos_del', payload).subscribe(
            () => {
                this.toaster.success('Borrado Realizado', 'Borrado de Selección');
                this.seleccionados.clear();
                this.loadData();
            },
            () => { this.toaster.error('Borrado NO Realizado', 'Borrado de Selección'); }
        );
    }

    // ── Ficha técnica ─────────────────────────────────────────────────

    abrirFichaTecnica() {
        const ids = Array.from(this.seleccionados);
        if (ids.length !== 1) {
            this.toaster.warning('Selecciona un único tejido', this.title);
            return;
        }
        this.editSheetValue = ids[0];
        this.service.HTTP_Get('/sm/tejido_ext/' + this.editSheetValue).subscribe(
            data => {
                const row = (data.Table && data.Table[0]) || {};
                this.fichaTecnica = {
                    opacidad: row.opacidad || '',
                    uso_recomendado: row.uso_recomendado || '',
                    info_tecnica: row.info_tecnica || ''
                };
                this.modalFicha.show();
            },
            () => { this.toaster.error('Error al cargar los parámetros del tejido', this.title); }
        );
    }

    guardarFichaTecnica() {
        const payload = JSON.stringify({
            id: this.editSheetValue,
            type: 1,
            value: this.fichaTecnica.uso_recomendado,
            value2: this.fichaTecnica.info_tecnica,
            value3: this.fichaTecnica.opacidad
        });

        this.service.HTTP_Post('/sm/tejidos_ext_set', payload).subscribe(
            () => {
                this.toaster.success('Parámetros actualizados', this.title);
                this.modalFicha.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al actualizar los parámetros', this.title); }
        );
    }

    // ── Asignación de tejidos a productos de clientes ────────────────────

    toggleProductoSel(item: any) { item.sel = !item.sel; }
    toggleProductoImp(item: any) { item.imp = !item.imp; }

    agregarTejidosACliente() {
        if (this.clienteDestino == null || this.clienteDestino === -1) {
            this.toaster.warning('Debe seleccionar el cliente destino', this.title);
            return;
        }
        const ids = Array.from(this.seleccionados);
        if (ids.length === 0) {
            this.toaster.warning('Selecciona al menos un tejido', this.title);
            return;
        }
        if (!confirm('¿Desea copiar la selección al cliente seleccionado?')) { return; }

        const payload = JSON.stringify({
            value: this.clienteDestino,
            ids,
            productos: this.productosCliente
        });

        this.service.HTTP_Post('/sm/tejidos_cliente', payload).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success('Proceso Realizado', 'Asignación de Tejido');
                    this.seleccionados.clear();
                    this.loadData();
                } else {
                    this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Tejido');
                }
            },
            () => { this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Tejido'); }
        );
    }

    minVal(a: number, b: number): number { return Math.min(a, b); }
}
