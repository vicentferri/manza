import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

/*
 * Detalle de los suplementos de precio de un elemento (SOL_ACC_SUPLEMENTO, script 16): una línea
 * por importe, con cliente y sistema opcionales y, si va por tramos, la medida y el "hasta" en cm.
 * Se abre con abrir(catalogo, id) desde cualquier lista o desde el resumen. Se guarda entero
 * (el backend valida el conjunto: en cada cliente + sistema, un importe fijo o tramos de una medida).
 */
@Component({
    selector: 'app-acc-suplementos',
    templateUrl: './acc-suplementos.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccSuplementosComponent {

    /* Se emite al guardar: la lista que lo abrió vuelve a cargar su columna Suplemento */
    @Output() cambio = new EventEmitter<void>();

    @ViewChild('modal', { static: false }) modal: ModalDirective;

    catalogo = '';
    id: number = null;
    elemento = '';
    /* La medida LONGITUD solo se ofrece en los elementos de la cadena */
    conLongitud = false;
    lineas: any[] = [];
    clientes: any[] = [];
    sistemas: any[] = [];
    guardando = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    abrir(catalogo: string, id: number) {
        this.catalogo = catalogo;
        this.id = id;
        this.elemento = '';
        this.lineas = [];
        this.cargarListas();
        this.service.HTTP_Get('/sm/acc/sup/' + catalogo + '/' + id).subscribe(
            data => {
                this.elemento = data.elemento;
                this.conLongitud = !!data.longitud;
                this.lineas = (data.lineas || []).map(l => ({
                    cliente: l.cliente === null ? '' : String(l.cliente),
                    sistema_id: l.sistema_id === null ? '' : String(l.sistema_id),
                    medida: l.medida || '',
                    hasta: l.hasta === null ? '' : this.numero(l.hasta),
                    importe: this.numero(l.importe),
                    activo: !!l.activo
                }));
                this.modal.show();
            },
            err => this.error(err, 'Error al cargar los suplementos')
        );
    }

    /* Una línea nueva copia el cliente, el sistema y la medida de la última: añadir tramos es teclear "hasta" e importe */
    anadir() {
        const ultima = this.lineas[this.lineas.length - 1];
        this.lineas.push({
            cliente: ultima ? ultima.cliente : '', sistema_id: ultima ? ultima.sistema_id : '',
            medida: ultima ? ultima.medida : '', hasta: '', importe: '', activo: true
        });
    }

    quitar(linea: any) {
        this.lineas.splice(this.lineas.indexOf(linea), 1);
    }

    cambiarMedida(linea: any) {
        if (!linea.medida) { linea.hasta = ''; }
    }

    guardar() {
        const lineas = this.lineas.map(l => ({
            cliente: l.cliente || null, sistema_id: l.sistema_id || null, medida: l.medida || null,
            hasta: l.medida ? l.hasta : null, importe: l.importe, activo: l.activo
        }));
        this.guardando = true;
        this.service.HTTP_Post('/sm/acc/sup/' + this.catalogo + '/' + this.id, JSON.stringify({ lineas })).subscribe(
            () => {
                this.guardando = false;
                this.toaster.success('Suplementos guardados', this.elemento);
                this.modal.hide();
                this.cambio.emit();
            },
            err => { this.guardando = false; this.error(err, 'No se pudieron guardar los suplementos'); }
        );
    }

    private cargarListas() {
        if (!this.clientes.length) {
            this.service.HTTP_Get('/sm/acc/clientes').subscribe(data => this.clientes = data.Table || [], () => { });
        }
        this.service.HTTP_Get('/sm/acc/sistemas').subscribe(data => this.sistemas = data.Table || [], () => { });
    }

    private numero(valor: number): string {
        return String(Number(valor)).replace('.', ',');
    }

    private error(err: any, defecto: string) {
        const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : defecto;
        this.toaster.error(msg, 'Suplementos');
    }
}
