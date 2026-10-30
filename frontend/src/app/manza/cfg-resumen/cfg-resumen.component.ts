import { Component, Input, Output, EventEmitter } from '@angular/core';

/*
 * Resumen lateral del configurador: datos de la línea que se está configurando, fechas, total y
 * botones (calcular, agregar al presupuesto y finalizar). Lo pinta cada producto a la derecha de su
 * formulario; los estilos (cfg-resumen-*) están en config/configurador.scss.
 */
@Component({
   selector: 'cfg-resumen',
   templateUrl: './cfg-resumen.component.html'
})
export class CfgResumenComponent {

   /** Filas del resumen ({ etiqueta, valor }), en el orden en que se ven */
   @Input() filas: { etiqueta: string, valor: string }[] = [];
   @Input() total: number = 0;
   @Input() totalC1: string = '';
   @Input() fechaFab: string = '';
   @Input() transporte: string = '';
   @Input() calculando: boolean = false;
   /** Cortinas que ya hay en la cesta del presupuesto */
   @Input() numCortinas: number = 0;
   @Input() totalCesta: number = 0;

   @Output() calcular = new EventEmitter<void>();
   @Output() agregar = new EventEmitter<void>();
   @Output() finalizar = new EventEmitter<void>();

   get puedeAgregar(): boolean {
      return this.total > 0;
   }

   porIndice(i: number) {
      return i;
   }
}
