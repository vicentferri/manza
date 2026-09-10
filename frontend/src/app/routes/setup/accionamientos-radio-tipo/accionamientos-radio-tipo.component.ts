import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-accionamientos-radio-tipo',
    templateUrl: './accionamientos-radio-tipo.component.html',
    styleUrls: ['./accionamientos-radio-tipo.component.css'],
    providers: [HaruService]
})
export class AccionamientosRadioTipoComponent implements OnInit {

    @ViewChild('modalAdd', { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;

    title = 'Accionamientos Radio Tipo';

    datos: any[] = [];
    datosFiltrados: any[] = [];
    filaSeleccionada: any = null;

    busqueda = '';
    filtros: any = { idrow: '', descripcion: '', modelos: '', articulos: '', pvp: '', c1: '', codigo_48: '' };
    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';
    pagina = 1;
    porPagina = 50;

    formAdd: any = {
        descripcion: '',
        modelos: '',
        articulos: '',
        pvp: 0,
        c1: '',
        codigo_48: ''
    };

    formEdit: any = {
        idrow: null,
        descripcion: '',
        modelos: '',
        articulos: '',
        pvp: 0,
        c1: '',
        codigo_48: ''
    };

    private params: any = {
        table: 'sol_articulos_accionamientos_radio_tipo',
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
        this.service.HTTP_Get('/sm/articulos_accionamientos_radio_tipo').subscribe(
            data => {
                this.datos = data.Table || [];
                this.filaSeleccionada = null;
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

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
            result = result.filter(r =>
                (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
                (r.modelos && r.modelos.toLowerCase().includes(q)) ||
                (r.articulos && r.articulos.toLowerCase().includes(q)) ||
                (r.codigo_48 && r.codigo_48.toLowerCase().includes(q))
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

    seleccionar(fila: any) {
        this.filaSeleccionada = this.filaSeleccionada && this.filaSeleccionada.idrow === fila.idrow ? null : fila;
    }

    esSeleccionada(fila: any): boolean {
        return this.filaSeleccionada && this.filaSeleccionada.idrow === fila.idrow;
    }

    openAdd() {
        this.formAdd = { descripcion: '', modelos: '', articulos: '', pvp: 0, c1: 0, codigo_48: '' };
        this.modalAdd.show();
    }

    guardarAdd() {
        if (!this.formAdd.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        this.service.HTTP_Post('/accionamientos_radio_tipo', JSON.stringify(this.formAdd)).subscribe(
            () => {
                this.toaster.success('Registro agregado correctamente', this.title);
                this.modalAdd.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al agregar el registro', this.title); }
        );
    }

    openEdit() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para editar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        this.formEdit = {
            idrow: d.idrow,
            descripcion: d.descripcion || '',
            modelos: d.modelos || '',
            articulos: d.articulos || '',
            pvp: d.pvp || 0,
            c1: d.c1 || '',
            codigo_48: d.codigo_48 || ''
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        if (!this.formEdit.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        const fields = ['descripcion', 'modelos', 'articulos', 'pvp', 'c1', 'codigo_48'];
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

    eliminar() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para eliminar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        if (!confirm('¿Eliminar "' + d.descripcion + '"?')) { return; }

        this.service.HTTP_Post('/accionamientos_radio_tipo_del', JSON.stringify({ idrow: d.idrow })).subscribe(
            () => {
                this.toaster.success('Registro eliminado', this.title);
                this.filaSeleccionada = null;
                this.loadData();
            },
            () => { this.toaster.error('Error al eliminar el registro', this.title); }
        );
    }
}
