import { Component, Input, Output, EventEmitter } from '@angular/core';

/** Texto de la opción elegida en una lista { id, text } de un desplegable; '—' si no hay nada elegido */
export function textoOpcion(lista: any[], id: any): string {
   const fila = (lista || []).find(x => x && String(x.id) === String(id));
   return fila && String(id) !== '-1' ? fila.text : '—';
}

/** Valor de un campo para el resumen: '—' si está vacío */
export function medida(valor: any): string {
   return valor === null || valor === undefined || valor === '' ? '—' : String(valor);
}

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
   @Input() calculando: boolean = false;
   /** Cortinas que ya hay en la cesta del presupuesto */
   @Input() numCortinas: number = 0;
   @Input() totalCesta: number = 0;

   @Output() calcular = new EventEmitter<void>();
   @Output() agregar = new EventEmitter<void>();
   @Output() finalizar = new EventEmitter<void>();
   /** Abre el panel lateral de la cesta */
   @Output() verCesta = new EventEmitter<void>();

   get puedeAgregar(): boolean {
      return this.total > 0;
   }

   porIndice(i: number) {
      return i;
   }
}
