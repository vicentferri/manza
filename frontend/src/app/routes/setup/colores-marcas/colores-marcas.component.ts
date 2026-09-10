import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-colores-marcas',
    templateUrl: './colores-marcas.component.html',
    styleUrls: ['./colores-marcas.component.css'],
    providers: [HaruService]
})
export class ColoresMarcasComponent implements OnInit {

    @ViewChild('modalAdd', { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;

    title = 'Gestión de Colores y Marcas';

    TipoColor: any[] = [
        { value: 1, label: 'COLOR' },
        { value: 2, label: 'MARCA' },
        { value: 3, label: 'OTROS' },
    ];

    ImpresionDigital: any[] = [
        { value: 0, label: 'NO DISPONIBLE' },
        { value: 1, label: 'PERMITIDA' },
    ];

    datos: any[] = [];
    datosFiltrados: any[] = [];
    filaSeleccionada: any = null;

    filtroTipo = 0;
    busqueda = '';

    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 50;

    formAdd: any = {
        tipo: 1,
        descripcion: '',
        codigo_48: '',
        impresiondigital: 0,
        Bloqueo: false,
    };

    formEdit: any = {
        idrow: null,
        tipo: 1,
        descripcion: '',
        codigo_48: '',
        impresiondigital: 0,
        Bloqueo: false,
    };

    private params: any = {
        table: 'sol_articulos_colores_marcas',
        column: 'idrow',
        id: 0,
        field: '',
        value: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.service.HTTP_Get('/sm/colores').subscribe(
            data => {
                this.datos = data.Table || [];
                this.filaSeleccionada = null;
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    // FILTROS Y BÚSQUEDA

    filtrar(tipo: number) {
        this.filtroTipo = tipo;
        this.pagina = 1;
        this.aplicarFiltros();
    }

    onBusqueda() {
        this.pagina = 1;
        this.aplicarFiltros();
    }

    private aplicarFiltros() {
        let result = this.datos;

        if (this.filtroTipo !== 0) {
            const tipoItem = this.TipoColor.find(t => t.value === this.filtroTipo);
            const label = tipoItem ? tipoItem.label : '';
            result = result.filter(r => r.tipo === label);
        }

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
                (r.codigo_48 && r.codigo_48.toLowerCase().includes(q)) ||
                (r.tipo && r.tipo.toLowerCase().includes(q))
            );
        }

        if (this.sortCol) {
            const dir = this.sortDir === 'asc' ? 1 : -1;
            result = result.slice().sort((a, b) => {
                const va = a[this.sortCol] || '';
                const vb = b[this.sortCol] || '';
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

    // PAGINACIÓN

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

    // SELECCIÓN DE FILA

    seleccionar(fila: any) {
        this.filaSeleccionada = this.filaSeleccionada && this.filaSeleccionada.idrow === fila.idrow ? null : fila;
    }

    esSeleccionada(fila: any): boolean {
        return this.filaSeleccionada && this.filaSeleccionada.idrow === fila.idrow;
    }

    // CRUD — ADD

    openAdd() {
        this.formAdd = { tipo: 1, descripcion: '', codigo_48: '', impresiondigital: 0, Bloqueo: false };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        this.service.HTTP_Post('/color', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Registro agregado correctamente', this.title);
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al agregar el registro', this.title); }
        );
    }

    // CRUD — EDIT

    openEdit() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para editar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        this.formEdit = {
            idrow: d.idrow,
            tipo: (this.TipoColor.find(t => t.label === d.tipo) || { value: 1 }).value,
            descripcion: d.descripcion || '',
            codigo_48: d.codigo_48 || '',
            impresiondigital: (this.ImpresionDigital.find(i => i.label === d.impresiondigital) || { value: 0 }).value,
            Bloqueo: d.Bloqueo || false,
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        const fields = ['tipo', 'descripcion', 'codigo_48', 'impresiondigital', 'Bloqueo'];
        let completed = 0;
        let hasError = false;

        fields.forEach(field => {
            const payload = JSON.stringify({ ...this.params, id: this.formEdit.idrow, field, value: this.formEdit[field] });
            this.service.HTTP_Post('/update_table', payload).subscribe(
                () => {
                    completed++;
                    if (completed === fields.length && !hasError) {
                        this.toaster.success('Registro actualizado', this.title);
                        this.modalEdit.hide();
                        this.loadData();
                    }
                },
                () => {
                    if (!hasError) {
                        hasError = true;
                        this.toaster.error('Error al actualizar el registro', this.title);
                    }
                }
            );
        });
    }

    // CRUD — DELETE

    eliminar() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para eliminar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        if (!confirm('¿Eliminar "' + d.descripcion + '" (' + d.tipo + ')?')) { return; }

        this.service.HTTP_Delete('/sm/color/' + d.idrow).subscribe(
            () => {
                this.toaster.success('Registro eliminado', this.title);
                this.filaSeleccionada = null;
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar el registro', this.title); }
        );
    }
}
