import { Component, Input, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Resumen de todos los suplementos de precio (SOL_ACC_SUPLEMENTO, script 16), para revisar de un
 * vistazo qué cobra cada cosa. Filtros por lista, cliente y texto; al pulsar una línea se abre el
 * detalle del elemento (app-acc-suplementos) y, al guardar, el resumen se recarga.
 */
@Component({
    selector: 'app-acc-suplementos-resumen',
    templateUrl: './acc-suplementos-resumen.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccSuplementosResumenComponent implements OnInit {

    /* Nombre de cada lista (clave del backend → texto), lo pasa la pantalla */
    @Input() nombresListas: { [clave: string]: string } = {};

    lineas: any[] = [];
    filtradas: any[] = [];
    clientes: any[] = [];
    filtroLista = '';
    filtroCliente = '';
    buscar = '';
    cargado = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.cargar();
    }

    cargar() {
        this.service.HTTP_Get('/sm/acc/suplementos').subscribe(
            data => {
                this.lineas = data.Table || [];
                this.cargado = true;
                this.opcionesFiltro();
                this.filtrar();
            },
            () => this.toaster.error('Error al cargar los suplementos', 'Suplementos')
        );
    }

    /* Listas y clientes que tienen algún suplemento, para los desplegables de filtro (campos y no
       getters: un getter crearía listas nuevas en cada ciclo y *ngFor recrearía las opciones) */
    listasConSuplemento: string[] = [];
    clientesConSuplemento: any[] = [];

    private opcionesFiltro() {
        this.listasConSuplemento = Array.from(new Set(this.lineas.map(l => l.clave)));
        const vistos = {};
        this.clientesConSuplemento = this.lineas.filter(l => l.cliente !== null && !vistos[l.cliente] && (vistos[l.cliente] = true))
            .map(l => ({ id: l.cliente, nombre: l.cliente_nombre }));
    }

    /* Se guarda en un campo (no getter) para que *ngFor no recree las filas en cada ciclo */
    filtrar() {
        const texto = this.normalizar(this.buscar);
        this.filtradas = this.lineas.filter(l =>
            (!this.filtroLista || l.clave === this.filtroLista) &&
            (!this.filtroCliente || (this.filtroCliente === 'general' ? l.cliente === null : String(l.cliente) === this.filtroCliente)) &&
            (!texto || this.normalizar(l.elemento_nombre).indexOf(texto) >= 0));
    }

    nombreLista(clave: string): string {
        return this.nombresListas[clave] || clave;
    }

    tramo(l: any): string {
        if (!l.medida) { return 'Fijo'; }
        const medida = l.medida === 'ANCHO' ? 'ancho' : l.medida === 'ALTO' ? 'alto' : 'longitud de cadena';
        return 'Por ' + medida + ' hasta ' + Number(l.hasta) + ' cm';
    }

    importe(valor: number): string {
        return Number(valor).toFixed(2).replace('.', ',') + ' €';
    }

    private normalizar(valor: string): string {
        return String(valor || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    }
}
