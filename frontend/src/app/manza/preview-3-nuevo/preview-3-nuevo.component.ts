import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

/*
 * Línea de Vertical del configurador nuevo (tipo 3 con nver, sqlVertical) en la cesta y en la ventana de finalizar.
 * Los textos van en item.ver (los pone manza-vertical-nuevo, o config.component al cargar un presupuesto) y los
 * importes en item.precios.T3_*. Las líneas del vertical de siempre siguen con app-preview-3.
 */
@Component({
   selector: 'app-preview-3-nuevo',
   templateUrl: './preview-3-nuevo.component.html',
   styleUrls: ['./preview-3-nuevo.component.css']
})
export class Preview3NuevoComponent {

   @Input() item!: CortinaTipo;
   @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
   @Output() onDelete = new EventEmitter<CortinaTipo>();
   @Output() onEdit = new EventEmitter<CortinaTipo>();
   // Detalle técnico y desglose de precio, plegados por defecto
   verDetalle = false;

   get ver(): any { return (this.item as any).ver || {}; }
   get desglose(): any[] { return (this.item as any).desglose || []; }
   get esInclinada(): boolean { return this.ver.tipoCodigo === 'INCLINADA'; }

   /* "200 × 250 cm", "Espacio 200 · alto 150-200 cm", "Ancho 300 cm" o "Alto 228 cm", según la modalidad */
   get medidas(): string {
      const i: any = this.item;
      if (this.esInclinada) { return 'Espacio ' + i.ancho + ' · alto ' + this.ver.altoMin + '-' + this.ver.altoMax + ' cm'; }
      if (i.ancho > 0 && i.alto > 0) { return i.ancho + ' × ' + i.alto + ' cm'; }
      if (i.ancho > 0) { return 'Ancho ' + i.ancho + ' cm'; }
      return i.alto > 0 ? 'Alto ' + i.alto + ' cm' : '';
   }

   /* "2 uds.", "2 rieles" o "19 lamas" */
   get unidades(): string {
      const n = Number(this.item.cantidad);
      if (this.ver.modalidadCodigo === 'SOLO_TEJIDO') { return n + (n === 1 ? ' lama' : ' lamas'); }
      if (this.ver.modalidadCodigo === 'SOLO_MECANISMO') { return n + (n === 1 ? ' riel' : ' rieles'); }
      return n + (n === 1 ? ' ud.' : ' uds.');
   }

   DeleteLine(item: CortinaTipo) { this.onDelete.emit(item); }
   EditLine(item: CortinaTipo) { this.onEdit.emit(item); }
}
