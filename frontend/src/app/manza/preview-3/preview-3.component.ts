import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

@Component({
  selector: 'app-preview-3',
  templateUrl: './preview-3.component.html',
  styleUrls: ['./preview-3.component.css']
})
export class Preview3Component implements OnInit {

  @Input() item!: CortinaTipo;
  @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
  @Output() onDelete = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  // Detalle técnico y desglose de precio, plegados por defecto
  verDetalle = false;
  isCopied1 = false;


  constructor() { }

  ngOnInit() {
  }

  DeleteLine(item) {
    this.onDelete.emit(item);
  }

  EditLine(item) {
    this.onEdit.emit(item);
  }

}
