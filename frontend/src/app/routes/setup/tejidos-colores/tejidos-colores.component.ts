import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-tejidos-colores',
    templateUrl: './tejidos-colores.component.html',
    styleUrls: ['./tejidos-colores.component.css'],
    providers: [HaruService]
})
export class TejidosColoresComponent implements OnInit {

    @ViewChild('modalAsignar', { static: false }) modalAsignar!: ModalDirective;

    title = 'Catálogo de Colores de Tejidos';

    datos: any[] = [];
    datosFiltrados: any[] = [];

    busqueda = '';
    sortCol = '';
    sortDir: 'asc' | 'desc' = 'asc';

    pagina = 1;
    porPagina = 50;

    private params: any = {
        table: 'sol_articulos_tejidos_colores',
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
        this.service.HTTP_Get('/sm/tejidos_colores').subscribe(
            data => {
                this.datos = data.Table || [];
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

    private aplicarFiltros() {
        let result = this.datos;

        if (this.busqueda.trim()) {
            const q = this.busqueda.trim().toLowerCase();
            result = result.filter(r =>
                (r.desctejido && r.desctejido.toLowerCase().includes(q)) ||
                (r.desccolor && r.desccolor.toLowerCase().includes(q))
            );
        }

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

    toggleImpresionDigital(fila: any) {
        const nuevoValor = fila.impresion_digital ? 0 : 1;
        const payload = JSON.stringify({ ...this.params, id: fila.idrow, field: 'impresion_digital', value: nuevoValor });

        this.service.HTTP_Post('/update_table', payload).subscribe(
            () => {
                fila.impresion_digital = nuevoValor;
                this.toaster.success('Actualizado el color', 'Gestión de Colores de Tejidos');
            },
            () => { this.toaster.error('Error al actualizar el registro', this.title); }
        );
    }

    abrirAsignar() {
        this.modalAsignar.show();
    }

    cerrarAsignar() {
        this.modalAsignar.hide();
        this.loadData();
    }

    minVal(a: number, b: number): number { return Math.min(a, b); }
}
