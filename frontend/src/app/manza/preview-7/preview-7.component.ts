import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

@Component({
   selector: 'app-preview-7',
   templateUrl: './preview-7.component.html',
   styleUrls: ['./preview-7.component.css']
})
export class Preview7Component {

   @Input() item!: CortinaTipo;
   @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
   @Output() onDelete = new EventEmitter<CortinaTipo>();
   @Output() onEdit = new EventEmitter<CortinaTipo>();
   // Detalle técnico y desglose de precio, plegados por defecto
   verDetalle = false;

   DeleteLine(item: CortinaTipo) { this.onDelete.emit(item); }
   EditLine(item: CortinaTipo) { this.onEdit.emit(item); }
}