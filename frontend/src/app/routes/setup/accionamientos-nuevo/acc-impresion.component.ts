import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';

/*
 * Impresión digital de un producto (sqlImpresion/01): importe fijo por cortina, uno por producto.
 * La opción sale en el configurador solo si el producto tiene incluido algún tejido apto (impresion_digital en el
 * Maestro de tejidos); aquí se enseñan esos tejidos y dónde están (sistema del enrollable, tipo del vertical).
 * Sin importe, la impresión vale 0 y el configurador lo avisa.
 * producto: 'enrollable', 'mini', 'zip' o 'ver'.
 */
@Component({
    selector: 'app-acc-impresion',
    templateUrl: './acc-impresion.component.html',
    styleUrls: ['./accionamientos-nuevo.component.css']
})
export class AccImpresionComponent implements OnChanges {

    @Input() producto = 'enrollable';

    readonly title = 'Impresión digital';
    datos: any = null;
    importe = '';
    guardando = false;

    constructor(private service: HaruService, private toaster: ToastrService) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.producto) { this.cargar(); }
    }

    /* dónde se incluyen los tejidos en este producto */
    get queDonde(): string {
        return this.producto === 'enrollable' ? 'Sistemas' : this.producto === 'ver' ? 'Tipos' : '';
    }

    get seccionTejidos(): string {
        return this.producto === 'enrollable' ? 'Tejidos' : 'Tejido';
    }

    get cambiado(): boolean {
        if (!this.datos) { return false; }
        const actual = this.datos.importe === null || this.datos.importe === undefined ? '' : String(this.datos.importe).replace('.', ',');
        return actual !== String(this.importe).trim();
    }

    cargar() {
        const producto = this.producto;
        this.datos = null;
        this.service.HTTP_Get('/sm/acc/impresion/' + producto).subscribe(
            data => {
                if (producto !== this.producto) { return; }
                this.datos = data;
                this.importe = data.importe === null || data.importe === undefined ? '' : String(data.importe).replace('.', ',');
            },
            err => {
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'Error al cargar la impresión digital';
                this.toaster.error(msg, this.title);
            }
        );
    }

    guardar() {
        const texto = String(this.importe).trim();
        const valor = texto === '' ? null : Number(texto.replace(/[€\s]/g, '').replace(',', '.'));
        if (valor !== null && (isNaN(valor) || valor < 0)) {
            this.toaster.warning('El importe tiene que ser un número (0 o más), o vacío', this.title);
            return;
        }
        this.guardando = true;
        this.service.HTTP_Post('/sm/acc/impresion/' + this.producto, JSON.stringify({ importe: valor })).subscribe(
            () => {
                this.guardando = false;
                this.toaster.success(valor === null ? 'Sin importe: la impresión digital vale 0' : 'Importe guardado', this.title);
                this.cargar();
            },
            err => {
                this.guardando = false;
                const msg = err && err.error && err.error.message && err.error.message !== 'KO' ? err.error.message : 'No se pudo guardar';
                this.toaster.error(msg, this.title);
            }
        );
    }
}
