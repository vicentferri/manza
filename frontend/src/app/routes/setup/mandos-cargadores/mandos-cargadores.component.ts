import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-mandos-cargadores',
    templateUrl: './mandos-cargadores.component.html',
    styleUrls: ['./mandos-cargadores.component.css'],
    providers: [HaruService]
})
export class MandosCargadoresComponent implements OnInit {

    @ViewChild('modalAdd', { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;

    title = 'Mandos - Cargadores';

    datos: any[] = [];
    datosFiltrados: any[] = [];
    marcasform: any[] = [];
    filaSeleccionada: any = null;

    busqueda = '';

    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 50;

    formAdd: any = {
        id_marca: '-1',
        descripcion: '',
        pvp: 0,
        c1: '',
        codigo_48: ''
    };

    formEdit: any = {
        idrow: null,
        id_marca: '-1',
        descripcion: '',
        pvp: 0,
        c1: '',
        codigo_48: ''
    };

    private params: any = {
        table: 'sol_articulos_mandos_cargadores',
        column: 'idrow',
        id: 0,
        field: '',
        value: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
        this.loadMarcas();
    }

    loadData() {
        this.service.HTTP_Get('/sm/mandos_cargadores').subscribe(
            data => {
                this.datos = data.Table || [];
                this.filaSeleccionada = null;
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    loadMarcas() {
        this.service.HTTP_Get('/sm/colores_form/2').subscribe(
            data => { this.marcasform = data.Table || []; },
            () => { this.toaster.error('Error al cargar las marcas', this.title); }
        );
    }

    // FILTROS Y BÚSQUEDA

    onBusqueda() {
        this.pagina = 1;
        this.aplicarFiltros();
    }

    private aplicarFiltros() {
        let result = this.datos;

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
                (r.marca_descripcion && r.marca_descripcion.toLowerCase().includes(q)) ||
                (r.codigo_48 && r.codigo_48.toLowerCase().includes(q)) ||
                (r.c1 && r.c1.toLowerCase().includes(q))
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
        this.formAdd = { id_marca: '-1', descripcion: '', pvp: 0, c1: '', codigo_48: '' };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        if (this.formAdd.id_marca === '-1') {
            this.toaster.warning('Selecciona una marca', this.title);
            return;
        }
        this.service.HTTP_Post('/sm/mandos_cargador', JSON.stringify(this.formAdd)).subscribe(
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
            id_marca: d.id_marca != null ? String(d.id_marca) : '-1',
            descripcion: d.descripcion || '',
            pvp: d.pvp || 0,
            c1: d.c1 || '',
            codigo_48: d.codigo_48 || ''
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        const fields = ['id_marca', 'descripcion', 'pvp', 'c1', 'codigo_48'];
        let completed = 0;
        let hasError = false;

        fields.forEach(field => {
            const payload = JSON.stringify({ ...this.params, id: this.formEdit.idrow, field, value: this.formEdit[field] });
            this.service.HTTP_Post('/sm/update_table', payload).subscribe(
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
        if (!confirm('¿Eliminar el cargador "' + d.descripcion + '"?')) { return; }

        this.service.HTTP_Delete('/sm/mandos_cargador/' + d.idrow).subscribe(
            () => {
                this.toaster.success('Registro eliminado', this.title);
                this.filaSeleccionada = null;
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar el registro', this.title); }
        );
    }
}
