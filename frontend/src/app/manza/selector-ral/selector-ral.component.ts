import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

/*
 * Desplegable de colores RAL con la muestra de cada color (un <select> no puede pintar colores).
 * Lo usan el configurador nuestro (Solar Mini: perfilería RAL; Cajón ZIP: lacado) y el de Leroy
 * (enrollable y Compac antiguos: lacados de SOL_ARTICULOS_INCREMENTOS_LACADOS).
 * El color sale de la columna hex (sqlColoresRal/01), que se carga desde Productos → Cargar Excel.
 * Sin hex, la opción sale igual, sin muestra.
 *
 * Uso: <app-selector-ral [opciones]="lista" campoTexto="nombre" [(valor)]="colorRal" (cambio)="..."></app-selector-ral>
 * El valor es el id como texto, igual que con un <select> ([value]="c.id").
 */
@Component({
    selector: 'app-selector-ral',
    templateUrl: './selector-ral.component.html',
    styleUrls: ['./selector-ral.component.css']
})
export class SelectorRalComponent {

    @Input() opciones: any[] = [];
    @Input() campoId = 'id';
    @Input() campoTexto = 'nombre';
    @Input() campoHex = 'hex';
    /* Texto de la opción vacía; null = sin opción vacía */
    @Input() vacio: string = null;
    /* Pasa el texto por el pipe frase (configurador antiguo) */
    @Input() conFrase = false;
    @Input() disabled = false;
    @Input() valor: any = '';
    @Output() valorChange = new EventEmitter<string>();
    /* Después de cambiar el valor (para los (change) del configurador antiguo) */
    @Output() cambio = new EventEmitter<string>();

    abierto = false;
    busqueda = '';

    constructor(private elemento: ElementRef) { }

    get seleccionado(): any {
        const v = this.valor === null || this.valor === undefined ? '' : String(this.valor);
        return (this.opciones || []).find(o => String(o[this.campoId]) === v) || null;
    }

    get filtradas(): any[] {
        const b = this.busqueda.trim().toUpperCase().replace(/\s+/g, '');
        if (!b) { return this.opciones || []; }
        return (this.opciones || []).filter(o => String(o[this.campoTexto] || '').toUpperCase().replace(/\s+/g, '').includes(b));
    }

    esColor(hex: any): boolean {
        return /^#[0-9A-Fa-f]{6}$/.test(String(hex || ''));
    }

    alternar() {
        if (this.disabled) { return; }
        this.abierto = !this.abierto;
        this.busqueda = '';
    }

    elegir(o: any) {
        const v = o ? String(o[this.campoId]) : '';
        this.abierto = false;
        if (v === String(this.valor === null || this.valor === undefined ? '' : this.valor)) { return; }
        this.valor = v;
        this.valorChange.emit(v);
        this.cambio.emit(v);
    }

    @HostListener('document:click', ['$event'])
    fuera(evento: Event) {
        if (this.abierto && !this.elemento.nativeElement.contains(evento.target)) { this.abierto = false; }
    }

    @HostListener('keydown.escape')
    escape() {
        this.abierto = false;
    }
}
