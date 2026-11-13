import { Component, OnInit } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Tarifa del solo riel del Panel japonés (sqlPanelJapones/03, SOL_ACC_PJ_TARIFA_RIEL): por número de vías, tramos
 * "hasta X cm de ancho del mecanismo → precio de un riel", generales o de un cliente (si el cliente tiene filas para
 * esas vías, manda su juego entero). La completa y el solo tejido van con la tarifa del generador (producto Panel japonés).
 * El juego elegido (vías + cliente) se guarda entero con su botón. "Pegar" acepta dos columnas copiadas de Excel.
 * Backend: GET/POST /acc/pj/tarifa_riel (controllers/sm/accionamientos_nuevo.js).
 */
@Component({
    selector: 'app-acc-pj-tarifa-riel',
    templateUrl: './acc-pj-tarifa-riel.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccPjTarifaRielComponent implements OnInit {

    readonly title = 'Tarifa del riel';

    vias: any[] = [];
    filas: any[] = [];
    clientes: any[] = [];
    cargado = false;

    /* juego elegido: vías (id) y cliente ('' = general) */
    viasId: number = null;
    cliente: any = '';

    tramos: { hasta: any, precio: any }[] = [];
    cambiado = false;
    guardando = false;
    pegando = false;
    textoPegado = '';

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnInit() {
        this.service.HTTP_Get('/sm/acc/clientes').subscribe(data => this.clientes = data.Table || [], () => { });
        this.cargar();
    }

    private valor(v: any): number {
        return v === '' || v === null || v === undefined ? null : Number(v);
    }

    /* los importes se enseñan con coma decimal, como se escriben */
    private coma(v: any): string {
        return v === null || v === undefined ? '' : String(v).replace('.', ',');
    }

    private delJuego(f: any, vias = this.viasId, cliente = this.cliente): boolean {
        return f.vias_id === vias && f.cliente === this.valor(cliente);
    }

    /* tramos guardados de unas vías con el cliente elegido (para las marcas de los botones) */
    filasDe(vias: number): number {
        return this.filas.filter(f => this.delJuego(f, vias)).length;
    }

    /* clientes con tarifa propia en las vías elegidas */
    get clientesConTarifa(): Set<number> {
        return new Set(this.filas.filter(f => f.vias_id === this.viasId && f.cliente !== null).map(f => f.cliente));
    }

    cargar() {
        this.service.HTTP_Get('/sm/acc/pj/tarifa_riel').subscribe(
            data => {
                this.vias = data.vias || [];
                this.filas = data.filas || [];
                if (!this.vias.some(v => v.id === this.viasId)) { this.viasId = this.vias.length ? this.vias[0].id : null; }
                this.cargado = true;
                this.prepararJuego();
            },
            () => this.toaster.error('Error al cargar la tarifa del riel', this.title)
        );
    }

    /* cambiar de juego: si hay cambios sin guardar, se pregunta */
    elegir(vias: number, cliente: any) {
        if (this.cambiado && !confirm('Hay cambios sin guardar en la tarifa. ¿Descartarlos?')) { return; }
        this.viasId = vias;
        this.cliente = cliente;
        this.prepararJuego();
    }

    private prepararJuego() {
        this.tramos = this.filas.filter(f => this.delJuego(f)).map(f => ({ hasta: this.coma(f.hasta), precio: this.coma(f.precio) }));
        this.cambiado = false;
    }

    anadirTramo() {
        const ultimo = this.tramos.length ? this.numero(this.tramos[this.tramos.length - 1].hasta) || 0 : 0;
        this.tramos.push({ hasta: ultimo ? ultimo + 20 : '', precio: '' });
        this.cambiado = true;
    }

    quitarTramo(i: number) {
        this.tramos.splice(i, 1);
        this.cambiado = true;
    }

    private numero(texto: any): number {
        const limpio = String(texto).replace(/[€\s]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
        return limpio === '' ? NaN : Number(limpio);
    }

    /* "100   54,46" por línea (columnas de Excel: tabulador, punto y coma o espacios) */
    aplicarPegado() {
        const tramos = this.textoPegado.split(/\r?\n/).map(l => l.trim()).filter(l => l)
            .map(l => l.split(/\t|;|\s{2,}|\s(?=[\d-])/).map(c => c.trim()).filter(c => c !== ''))
            .map(c => ({ hasta: this.numero(c[0]), precio: this.numero(c[c.length - 1]) }))
            .filter(t => !isNaN(t.hasta) && !isNaN(t.precio) && t.hasta > 0);
        if (!tramos.length) { this.toaster.warning('No se ha reconocido ninguna fila "ancho  precio"', this.title); return; }
        this.tramos = tramos.map(t => ({ hasta: this.coma(t.hasta), precio: this.coma(t.precio) }));
        this.cambiado = true;
        this.pegando = false;
        this.textoPegado = '';
        this.toaster.info(tramos.length + ' tramos pegados (falta guardar)', this.title);
    }

    guardar() {
        const tramos = this.tramos.filter(t => t.hasta !== '' || t.precio !== '')
            .map(t => ({ hasta: this.numero(t.hasta), precio: this.numero(t.precio) }));
        if (tramos.some(t => isNaN(t.hasta) || t.hasta <= 0 || isNaN(t.precio) || t.precio < 0)) {
            this.toaster.warning('Cada tramo necesita un ancho mayor que 0 y un precio', this.title);
            return;
        }
        tramos.sort((a, b) => a.hasta - b.hasta);
        const body = { vias_id: this.viasId, cliente: this.valor(this.cliente), tramos };
        this.guardando = true;
        this.service.HTTP_Post('/sm/acc/pj/tarifa_riel', JSON.stringify(body)).subscribe(
            () => {
                this.guardando = false;
                this.cambiado = false;
                this.toaster.success(tramos.length ? 'Tarifa guardada' : 'Tarifa borrada', this.title);
                this.cargar();
            },
            err => {
                this.guardando = false;
                this.toaster.error((err && err.error && err.error.message) || 'Error al guardar la tarifa', this.title);
            }
        );
    }
}
