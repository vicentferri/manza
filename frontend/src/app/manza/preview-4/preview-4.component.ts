import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';
import { PerfilConfiguradorService, productoDe } from '../config/perfil-configurador.service';

@Component({
  selector: 'app-preview-4',
  templateUrl: './preview-4.component.html',
  styleUrls: ['./preview-4.component.css']
})
export class Preview4Component implements OnInit {

  @Input() item!: CortinaTipo;
  @Input() Cliente: string = '-1';
  @Input() soloLectura = false; // en la ventana de finalizar: sin MODIFICAR ni BORRAR
  @Output() onDelete = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  // Detalle técnico y desglose de precio, plegados por defecto
  verDetalle = false;
  isCopied1 = false;


  /* Solar Mini / Compac según el perfil del cliente (sqlPerfiles); es una clave que traduce el pipe translate */
  nombreProducto = 'SOLAR MINI';

  constructor(private perfilConfigurador: PerfilConfiguradorService) { }

  ngOnInit() {
    this.perfilConfigurador.perfil(this.Cliente).subscribe(p => {
      const x = productoDe(p, 4);
      this.nombreProducto = x ? x.nombre : 'SOLAR MINI';
    });
  }

  DeleteLine(item) {
    this.onDelete.emit(item);
  }

  EditLine(item) {
    this.onEdit.emit(item);
  }

}
