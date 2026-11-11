import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

/*
 * Línea de Cajón ZIP del configurador nuevo (tipo 6, sqlCajonZip) en la cesta y en la ventana de finalizar.
 * Los textos van en item.zip (los pone manza-zip-nuevo, o config.component al cargar un presupuesto) y los
 * importes en item.precios.T6_*.
 */
@Component({
   selector: 'app-preview-6',
   templateUrl: './preview-6.component.html',
   styleUrls: ['./preview-6.component.css']
})
export class Preview6Component {

   @Input() item!: CortinaTipo;
   @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
   @Output() onDelete = new EventEmitter<CortinaTipo>();
   @Output() onEdit = new EventEmitter<CortinaTipo>();
   // Detalle técnico y desglose de precio, plegados por defecto
   verDetalle = false;

   get zip(): any { return (this.item as any).zip || {}; }
   get desglose(): any[] { return (this.item as any).desglose || []; }

   /* "Blanco (RAL 9010)" */
   color(c: any): string {
      return c && c.nombre ? c.nombre + (c.ral ? ' (' + c.ral + ')' : '') : '';
   }

   DeleteLine(item: CortinaTipo) { this.onDelete.emit(item); }
   EditLine(item: CortinaTipo) { this.onEdit.emit(item); }
}
