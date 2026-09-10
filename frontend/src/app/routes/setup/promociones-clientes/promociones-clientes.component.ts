import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { UploadService } from '../../../services/upload.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-promociones-clientes',
    templateUrl: './promociones-clientes.component.html',
    styleUrls: ['./promociones-clientes.component.css'],
    providers: [HaruService, UploadService]
})
export class PromocionesClientesComponent implements OnInit {

    @ViewChild('modalEdit', { static: false }) modalEdit!: ModalDirective;
    @ViewChild('modalBanner', { static: false }) modalBanner!: ModalDirective;
    @ViewChild('modalProgramar', { static: false }) modalProgramar!: ModalDirective;
    @ViewChild('inputFileBanner', { static: false }) inputFileBanner!: any;

    title = 'Promociones de Clientes';

    datos: any[] = [];
    datosFiltrados: any[] = [];
    seleccionadas = new Set<number>();

    busqueda = '';

    filtros: any = {
        idrow: '',
        descripcion: '',
        desde: '',
        hasta: '',
        promocion_activa: '',
        promocion_coeficiente: '',
        promocion_coeficiente2: '',
        promocion_mensaje: ''
    };

    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';
    pagina = 1;
    porPagina = 50;

    formEdit: any = {
        idrow: null,
        descripcion: '',
        promocion_activa: false,
        promocion_coeficiente: 0,
        promocion_modificapvp: false,
        promocion_coeficiente2: 0,
        promocion_modificapvc: false,
        desde: '',
        hasta: '',
        promocion_mensaje: ''
    };

    // Banner
    previewUrl: string | ArrayBuffer = null;
    fileBanner: File = null;
    bannerActual: string = null;

    // Modal Programar
    clientesapi: any[] = [];
    centrosCliente: any[] = [];
    busquedaCentros = '';
    formProgramar: any = {
        idCliente: '-1',
        Desde: '',
        Hasta: '',
        CoefPVP: 15,
        CoefC1: 7.5,
        Mensaje: '',
        aplicaPVP: false,
        aplicaC1: false
    };

    private updateParams: any = {
        table: 'SOL_ARTICULOS_TARIFAS_CLIENTES',
        column: 'idrow',
        id: 0,
        field: '',
        value: ''
    };

    constructor(
        private service: HaruService,
        private upload: UploadService,
        private toaster: ToastrService
    ) { }

    ngOnInit() {
        this.loadData();
        this.loadClientes();
        const hoy = new Date();
        this.formProgramar.Desde = this.toInputDate(hoy);
        this.formProgramar.Hasta = this.toInputDate(hoy);
    }

    loadData() {
        this.service.HTTP_Get('/sm/clientes_promociones').subscribe(
            data => {
                this.datos = data.Table || [];
                this.seleccionadas.clear();
                this.pagina = 1;
                this.aplicarFiltros();
            },
            () => { this.toaster.error('Error al cargar los datos', this.title); }
        );
    }

    private loadClientes() {
        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientesapi = data.Table || [];
            },
            () => { this.toaster.error('Error al cargar los clientes', this.title); }
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
                (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
                (r.promocion_mensaje && r.promocion_mensaje.toLowerCase().includes(q)) ||
                (r.desde && r.desde.toString().toLowerCase().includes(q)) ||
                (r.hasta && r.hasta.toString().toLowerCase().includes(q))
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

    get centrosFiltrados(): any[] {
        const q = this.busquedaCentros.trim().toLowerCase();
        if (!q) { return this.centrosCliente; }
        return this.centrosCliente.filter(c =>
            c.descripcion && c.descripcion.toLowerCase().includes(q)
        );
    }

    get centrosSeleccionados(): number {
        let count = 0;
        for (const c of this.centrosCliente) { if (c.seleccionado) { count++; } }
        return count;
    }

    // SELECCIÓN MÚLTIPLE

    toggleFila(fila: any) {
        if (this.seleccionadas.has(fila.idrow)) {
            this.seleccionadas.delete(fila.idrow);
        } else {
            this.seleccionadas.add(fila.idrow);
        }
    }

    estaSeleccionada(fila: any): boolean {
        return this.seleccionadas.has(fila.idrow);
    }

    get todasSeleccionadas(): boolean {
        return this.datosPagina.length > 0 &&
            this.datosPagina.every(f => this.seleccionadas.has(f.idrow));
    }

    toggleTodas() {
        if (this.todasSeleccionadas) {
            this.datosPagina.forEach(f => this.seleccionadas.delete(f.idrow));
        } else {
            this.datosPagina.forEach(f => this.seleccionadas.add(f.idrow));
        }
    }

    get filaUnica(): any {
        if (this.seleccionadas.size !== 1) { return null; }
        const id = Array.from(this.seleccionadas)[0];
        return this.datos.find(f => f.idrow === id) || null;
    }

    // CRUD — EDIT

    openEdit() {
        if (!this.filaUnica) {
            this.toaster.warning('Selecciona exactamente una promoción para editar', this.title);
            return;
        }
        const d = this.filaUnica;
        this.formEdit = {
            idrow: d.idrow,
            descripcion: d.descripcion || '',
            promocion_activa: !!d.promocion_activa,
            promocion_coeficiente: d.promocion_coeficiente || 0,
            promocion_modificapvp: !!d.promocion_modificapvp,
            promocion_coeficiente2: d.promocion_coeficiente2 || 0,
            promocion_modificapvc: !!d.promocion_modificapvc,
            desde: this.toInputDate(d.desde),
            hasta: this.toInputDate(d.hasta),
            promocion_mensaje: d.promocion_mensaje || ''
        };
        this.modalEdit.show();
    }

    guardarEdit() {
        if (!this.formEdit.descripcion.trim()) {
            this.toaster.warning('La descripción es obligatoria', this.title);
            return;
        }
        const payload = {
            idrow: this.formEdit.idrow,
            descripcion: this.formEdit.descripcion,
            promocion_activa: this.formEdit.promocion_activa ? 1 : 0,
            promocion_coeficiente: this.formEdit.promocion_coeficiente,
            promocion_modificapvp: this.formEdit.promocion_modificapvp ? 1 : 0,
            promocion_coeficiente2: this.formEdit.promocion_coeficiente2,
            promocion_modificapvc: this.formEdit.promocion_modificapvc ? 1 : 0,
            desde: this.formEdit.desde,
            hasta: this.formEdit.hasta,
            promocion_mensaje: this.formEdit.promocion_mensaje
        };
        this.service.HTTP_Post('/sm/clientes_promociones', JSON.stringify(payload)).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success('Promoción actualizada', this.title);
                    this.modalEdit.hide();
                    this.loadData();
                } else {
                    this.toaster.error('No se pudo actualizar la promoción', this.title);
                }
            },
            () => { this.toaster.error('Error al actualizar la promoción', this.title); }
        );
    }

    // CRUD — DELETE

    eliminar() {
        if (this.seleccionadas.size === 0) {
            this.toaster.warning('Selecciona al menos una promoción para eliminar', this.title);
            return;
        }
        const n = this.seleccionadas.size;
        const msg = n === 1
            ? '¿Eliminar la promoción seleccionada?'
            : '¿Eliminar las ' + n + ' promociones seleccionadas?';
        if (!confirm(msg)) { return; }

        const ids = Array.from(this.seleccionadas).map(id => ({ idrow: id }));
        const payload = JSON.stringify({ ids: ids, operation: 0 });
        this.service.HTTP_Post('/sm/clientes_promociones_del', payload).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success(n + ' promoción(es) eliminada(s)', this.title);
                    this.seleccionadas.clear();
                    this.loadData();
                } else {
                    this.toaster.error('No se pudo eliminar', this.title);
                }
            },
            () => { this.toaster.error('Error al eliminar', this.title); }
        );
    }

    // BANNER

    openBanner() {
        if (this.seleccionadas.size === 0) {
            this.toaster.warning('Selecciona al menos una promoción para gestionar el banner', this.title);
            return;
        }
        this.previewUrl = null;
        this.fileBanner = null;
        this.bannerActual = null;
        if (this.inputFileBanner) { this.inputFileBanner.nativeElement.value = ''; }
        this.bannerActual = this.filaUnica ? (this.filaUnica.imagen_banner || null) : null;
        this.modalBanner.show();
    }

    onBannerSelected(event: any) {
        const file: File = event.target.files[0];
        if (!file) { return; }
        if (!file.type.startsWith('image/')) {
            this.toaster.warning('Selecciona un archivo de imagen válido', this.title);
            return;
        }
        this.fileBanner = file;
        const reader = new FileReader();
        reader.onload = () => { this.previewUrl = reader.result; };
        reader.readAsDataURL(file);
    }

    subirBanner() {
        if (!this.fileBanner) {
            this.toaster.warning('Selecciona una imagen antes de subir', this.title);
            return;
        }
        const ids = Array.from(this.seleccionadas);
        const token = localStorage.getItem('registerToken') || 'KK';
        const urlUpload = this.service.Upload_URL('/promocion_banner/' + ids[0]);

        // Sube el archivo usando el primer idrow; el backend devuelve la ruta guardada
        this.upload.makeFileRequest(urlUpload, [], [this.fileBanner], token, 'image')
            .then((result: any) => {
                if (result.message === 'ok' || result.message === 'OK') {
                    const rutaBanner: string = result.imagen_banner || '';
                    const restantes = ids.slice(1);
                    if (restantes.length === 0) {
                        this.toaster.success('Banner asignado a 1 promoción', this.title);
                        this.modalBanner.hide();
                        this.loadData();
                        return;
                    }
                    // Propaga la misma ruta al resto de seleccionadas
                    this.propagarBanner(rutaBanner, restantes, () => {
                        this.toaster.success('Banner asignado a ' + ids.length + ' promociones', this.title);
                        this.modalBanner.hide();
                        this.loadData();
                    });
                } else {
                    this.toaster.error('No se pudo subir el banner', this.title);
                }
            })
            .catch(() => { this.toaster.error('Error al subir el banner', this.title); });
    }

    private propagarBanner(ruta: string, ids: number[], onDone: () => void) {
        let pendiente = ids.length;
        ids.forEach(id => {
            const payload = JSON.stringify({
                ...this.updateParams,
                id,
                field: 'imagen_banner',
                value: ruta
            });
            this.service.HTTP_Post('/update_table', payload).subscribe(
                () => { if (--pendiente === 0) { onDone(); } },
                () => { if (--pendiente === 0) { onDone(); } }
            );
        });
    }

    eliminarBanner() {
        const n = this.seleccionadas.size;
        const msg = n === 1
            ? '¿Eliminar el banner de esta promoción?'
            : '¿Eliminar el banner de las ' + n + ' promociones seleccionadas?';
        if (!confirm(msg)) { return; }

        const ids = Array.from(this.seleccionadas);
        this.propagarBanner('', ids, () => {
            this.toaster.success('Banner eliminado de ' + n + ' promoción(es)', this.title);
            this.modalBanner.hide();
            this.loadData();
        });
    }

    // PROGRAMAR PROMOCIÓN

    openProgramar() {
        this.formProgramar.idCliente = '-1';
        this.centrosCliente = [];
        this.modalProgramar.show();
    }

    onClienteChange() {
        const id = this.formProgramar.idCliente;
        this.busquedaCentros = '';
        if (id === '-1') { this.centrosCliente = []; return; }
        this.service.HTTP_Get('/sm/clientes_promociones_cliente/' + id).subscribe(
            data => {
                this.centrosCliente = (data.Table || []).map(c => ({ ...c, seleccionado: false }));
                console.log(this.centrosCliente);
            },
            () => { this.toaster.error('Error al cargar los centros del cliente', this.title); }
        );
    }

    seleccionarTodos(valor: boolean) {
        this.centrosCliente.forEach(c => c.seleccionado = valor);
    }

    programar() {
        const seleccionados = this.centrosCliente.filter(c => c.seleccionado);
        if (seleccionados.length === 0) {
            this.toaster.warning('Selecciona al menos un centro', this.title);
            return;
        }
        if (!this.formProgramar.Desde || !this.formProgramar.Hasta) {
            this.toaster.warning('Las fechas Desde y Hasta son obligatorias', this.title);
            return;
        }
        if (!confirm('¿Confirmar la programación de la promoción para los centros seleccionados?')) { return; }

        const ids = seleccionados.map(c => c.idrow);
        const values = {
            Desde: this.formProgramar.Desde,
            Hasta: this.formProgramar.Hasta,
            ids: ids.join(';') + ';',
            model: {
                CoefPVP: this.formProgramar.CoefPVP,
                CoefC1: this.formProgramar.CoefC1,
                Mensaje: this.formProgramar.Mensaje,
                aplicaPVP: this.formProgramar.aplicaPVP,
                aplicaC1: this.formProgramar.aplicaC1
            }
        };
        this.service.HTTP_Post('/sm/clientes_promociones_program', JSON.stringify(values)).subscribe(
            data => {
                if (data.message === 'OK') {
                    this.toaster.success('Promoción programada correctamente', this.title);
                    this.modalProgramar.hide();
                    this.loadData();
                } else {
                    this.toaster.error('No se pudo programar la promoción', this.title);
                }
            },
            () => { this.toaster.error('Error al programar la promoción', this.title); }
        );
    }

    getBannerUrl(path: string): string {
        return this.service.Upload_URL(path);
    }

    // UTILS

    private toInputDate(value: any): string {
        if (!value) { return ''; }
        const d = new Date(value);
        if (isNaN(d.getTime())) { return ''; }
        return d.toISOString().substring(0, 10);
    }

    formatDate(value: any): string {
        if (!value) { return ''; }
        const d = new Date(value);
        if (isNaN(d.getTime())) { return value; }
        return d.toLocaleDateString('es-ES');
    }
}
