import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-accionamientos-mapa',
    templateUrl: './accionamientos-mapa.component.html',
    styleUrls: ['./accionamientos-mapa.component.css'],
    providers: [HaruService]
})
export class AccionamientosMapaComponent implements OnInit {

    @ViewChild('modalAdd', { static: false }) modalAdd!: ModalDirective;
    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;

    title = 'Mapa de Accionamientos';

    productos: any[] = [
        { id: 1, name: 'Enrollable' },
        { id: 2, name: 'Panel Japones' },
        { id: 3, name: 'Panel Vertical' },
        { id: 4, name: 'Panel Compac' },
        { id: 6, name: 'Cajón ZIP' },
    ];

    datos: any[] = [];
    datosFiltrados: any[] = [];
    filaSeleccionada: any = null;

    busqueda = '';

    filtros: any = {
        id: '',
        descproducto: '',
        tipo: '',
        accionamiento: '',
        descripcion: '',
        NomFiscal: '',
        Grupo: '',
        codigo_48: ''
    };

    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 100;

    clientes: any[] = [];
    accionamientos: any[] = [];
    accionamientostipos: any[] = [];
    accionamientoscolores: any[] = [];

    formAdd: any = {
        operation: 1,
        Cliente: '-1',
        Producto: '-1',
        Accionamiento: '-1',
        Modelo: '-1',
        TipoColor: 1,
        Color: '-1'
    };

    formEdit: any = {
        id: null,
        Tag: null,
        descproducto: '',
        tipo: '',
        accionamiento: '',
        descripcion: '',
        NomFiscal: '',
        codigo_48: ''
    };

    private updateParams: any = {
        table: 'SOL_ARTICULOS_COLORES_MARCAS_CLIENTES_PRODUCTOS',
        column: 'id',
        id: 0,
        field: '',
        value: ''
    };

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.loadData();
        this.loadClientes();
        this.loadAccionamientos();
    }

    loadData() {
        this.service.HTTP_Get('/sm/accionamientos_mapa').subscribe(
            data => {
                this.datos = data.Table || [];
                this.filaSeleccionada = null;
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    private loadClientes() {
        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientes = data.Table || [];
                this.clientes.unshift({ idrow: '-1', descripcion: 'Seleccionar Cliente' });
            },
            () => { this.toaster.error('Error al cargar los clientes', this.title); }
        );
    }

    private loadAccionamientos() {
        this.service.HTTP_Get('/sm/form_accionamientos').subscribe(
            data => {
                this.accionamientos = data.Table || [];
                this.accionamientos.unshift({ value: '-1', label: 'Seleccionar Tipo' });
            },
            () => { this.toaster.error('Error al cargar los accionamientos', this.title); }
        );
    }

    onAccionamientoChange() {
        const tipo = this.formAdd.Accionamiento;
        if (tipo === '-1') { this.accionamientostipos = []; return; }
        this.service.HTTP_Get('/sm/accionamientos_tipos_form/' + tipo).subscribe(
            data => {
                this.accionamientostipos = data.Table || [];
                this.accionamientostipos.unshift({ id: '-1', descripcion: 'Seleccionar Modelo' });
                this.formAdd.Modelo = '-1';
            },
            () => { this.toaster.error('Error al cargar los modelos', this.title); }
        );
    }

    onTipoColorChange() {
        this.cargarColores();
    }

    onModeloChange() {
        this.cargarColores();
    }

    private cargarColores() {
        const tipoColor = this.formAdd.TipoColor;
        this.service.HTTP_Get('/sm/colores_form/' + tipoColor).subscribe(
            data => {
                this.accionamientoscolores = data.Table || [];
                this.accionamientoscolores.unshift({ idrow: '-1', descripcion: 'Seleccionar Color' });
                this.formAdd.Color = '-1';
            },
            () => { this.toaster.error('Error al cargar los colores', this.title); }
        );
    }

    // FILTROS Y BÚSQUEDA

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
                (r.descproducto && r.descproducto.toLowerCase().includes(q)) ||
                (r.tipo && r.tipo.toLowerCase().includes(q)) ||
                (r.accionamiento && r.accionamiento.toLowerCase().includes(q)) ||
                (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
                (r.NomFiscal && r.NomFiscal.toLowerCase().includes(q)) ||
                (r.Grupo && r.Grupo.toLowerCase().includes(q)) ||
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
        this.filaSeleccionada = this.filaSeleccionada && this.filaSeleccionada.id === fila.id ? null : fila;
    }

    esSeleccionada(fila: any): boolean {
        return this.filaSeleccionada && this.filaSeleccionada.id === fila.id;
    }

    // CRUD — ADD

    openAdd() {
        this.formAdd = { operation: 1, Cliente: '-1', Producto: '-1', Accionamiento: '-1', Modelo: '-1', TipoColor: 1, Color: '-1' };
        this.accionamientostipos = [];
        this.accionamientoscolores = [];
        this.modalAdd.show();
    }

    guardarAdd() {
        if (this.formAdd.Accionamiento === '-1' || this.formAdd.Producto === '-1') {
            this.toaster.warning('Producto y Accionamiento son obligatorios', this.title);
            return;
        }
        if (!confirm('¿Desea agregar este Accionamiento al Mapa?')) { return; }
        this.service.HTTP_Post('/sm/accionamientos_mapa', JSON.stringify(this.formAdd)).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success('Agregado al Mapa', this.title);
                    this.modalAdd.hide();
                    this.loadData();
                } else {
                    this.toaster.info('No se ha podido agregar al Mapa', this.title);
                }
            },
            () => { this.toaster.error('Error al agregar el registro', this.title); }
        );
    }

    // CRUD — EDIT (solo codigo_48)

    openEdit() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para editar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        this.formEdit = {
            id: d.id,
            Tag: d.Tag,
            descproducto: d.descproducto || '',
            tipo: d.tipo || '',
            accionamiento: d.accionamiento || '',
            descripcion: d.descripcion || '',
            NomFiscal: d.NomFiscal || '',
            codigo_48: d.codigo_48 || ''
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        const payload = JSON.stringify({
            ...this.updateParams,
            id: this.formEdit.id,
            field: 'codigo_48',
            value: this.formEdit.codigo_48
        });
        this.service.HTTP_Post('/update_table', payload).subscribe(
            () => {
                this.toaster.success('Código 48 actualizado', this.title);
                this.modalEdit.hide();
                this.loadData();
            },
            () => { this.toaster.error('Error al actualizar el registro', this.title); }
        );
    }

    // CRUD — DELETE

    eliminar() {
        if (!this.filaSeleccionada) {
            this.toaster.warning('Selecciona un registro para eliminar', this.title);
            return;
        }
        const d = this.filaSeleccionada;
        const desc = [d.descproducto, d.tipo, d.accionamiento, d.NomFiscal].filter(Boolean).join(' / ');
        if (!confirm('¿Eliminar "' + desc + '"?')) { return; }

        const payload = JSON.stringify({ ids: [{ Tag: d.Tag }], operation: 0 });
        this.service.HTTP_Post('/sm/accionamientos_mapa_del', payload).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success('Registro eliminado', this.title);
                    this.filaSeleccionada = null;
                    this.loadData();
                } else {
                    this.toaster.error('No se pudo eliminar el registro', this.title);
                }
            },
            () => { this.toaster.error('Error al eliminar el registro', this.title); }
        );
    }
}
