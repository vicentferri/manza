import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

/*
 * Línea de panel japonés del configurador nuevo (tipo 2 con npj, sqlPanelJapones) en la cesta y en la ventana de
 * finalizar. Los textos van en item.pj (los pone manza-japones-nuevo, o config.component al cargar un presupuesto) y
 * los importes en item.precios.T2_*. Las líneas del panel de siempre siguen con app-preview-2.
 */
@Component({
   selector: 'app-preview-2-nuevo',
   templateUrl: './preview-2-nuevo.component.html',
   styleUrls: ['../preview-3-nuevo/preview-3-nuevo.component.css']
})
export class Preview2NuevoComponent {

   @Input() item!: CortinaTipo;
   @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
   @Output() onDelete = new EventEmitter<CortinaTipo>();
   @Output() onEdit = new EventEmitter<CortinaTipo>();
   // Detalle técnico y desglose de precio, plegados por defecto
   verDetalle = false;

   get pj(): any { return (this.item as any).pj || {}; }
   get desglose(): any[] { return (this.item as any).desglose || []; }
   get esSoloTejido(): boolean { return this.pj.modalidadCodigo === 'SOLO_TEJIDO'; }
   get esSoloRiel(): boolean { return this.pj.modalidadCodigo === 'SOLO_RIEL'; }

   /* "200 × 250 cm", "Ancho 300 cm" (solo riel) o "4 lamas de 55 × 197,5 cm" (solo tejido) */
   get medidas(): string {
      const i: any = this.item;
      if (this.esSoloTejido) { return this.pj.numLamas + ' lamas de ' + this.pj.anchoPortatela + ' × ' + this.pj.altoLama + ' cm'; }
      if (i.ancho > 0 && i.alto > 0) { return i.ancho + ' × ' + i.alto + ' cm'; }
      return i.ancho > 0 ? 'Ancho ' + i.ancho + ' cm' : '';
   }

   /* "2 uds." o "2 rieles" */
   get unidades(): string {
      const n = Number(this.item.cantidad);
      if (this.esSoloRiel) { return n + (n === 1 ? ' riel' : ' rieles'); }
      return n + (n === 1 ? ' ud.' : ' uds.');
   }

   /* Colores de la combinación, por lama */
   get colores(): string { return (this.pj.colores || []).join(' / '); }

   DeleteLine(item: CortinaTipo) { this.onDelete.emit(item); }
   EditLine(item: CortinaTipo) { this.onEdit.emit(item); }
}
