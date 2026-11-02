import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SMAPIService } from '../config/smapi.service';

import * as _ from 'underscore';

import { PagerService } from '../../shared/pager-service.service';
import { SearchModel } from '../../models/SearchModel';
import { ImpresionDocumentoComponent } from '../../shared/impresion-documento/impresion-documento.component';

@Component({
  selector: 'app-bestellungen',
  templateUrl: './bestellungen.component.html',
  styleUrls: ['./bestellungen.component.css'],
  providers: [PagerService]
})
export class BestellungenComponent implements OnInit {

  @ViewChild("impresion", { static: false }) impresion!: ImpresionDocumentoComponent;
  @Input() cliente!: string;
  @Input() codeCentro!: string;

  //pdf: Uint8Array;
  pdf: any = null;
  public numeroPedidos = 0;
  public fechaConsulta = new Date();
  /* VFF 20.04.2018 */
  // array of all items to be paged
  private allItems: any[] = [];

  // pager object
  pager: any = {};

  // paged items
  pagedItems: any[] = [];

  model = new SearchModel();

  constructor(private service: SMAPIService,
    private pagerService: PagerService) {

  }
  ngOnInit() {


  }

  ngAfterViewInit() {
    this.BestellungenNachschlagen();
  }

  setPage(page: number) {

    //console.log(this.pager.totalPages);

    if (this.pager.totalPages > 1) {
      if (page < 1 || page > this.pager.totalPages) {
        return;
      }
    }

    // get pager object from service
    this.pager = this.pagerService.getPager(this.allItems.length, page);
    //console.log(this.pager);
    // get current page of items
    this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  /*
    Bestellungen nachschlagen
*/
  BestellungenNachschlagen() {
    var cliente = this.cliente;
    var centro = this.codeCentro;

    this.model.Cliente = this.cliente;
    this.model.Centro = this.codeCentro;

    // El servidor busca hasta el día siguiente a "Hasta"; el día extra va solo en la consulta, no en el filtro que se ve
    const hasta = new Date(this.model.Hasta);
    hasta.setDate(hasta.getDate() + 1);

    let values = JSON.stringify({ ...this.model, Hasta: hasta });


    this.service.postBestellungennachschlagen(values).subscribe(
      data => {
        //console.log(data);
        this.allItems = data;
        this.setPage(1);
        this.numeroPedidos = this.allItems.length;
        this.fechaConsulta = new Date();
      },
      error => {

      }
    );
  }

  onDateChange(e, e1) {

    if (e.target.id == "Desde") {
      this.model.Desde = new Date(e.target.value);
    }

    if (e.target.id == "Hasta") {
      this.model.Hasta = new Date(e.target.value);
    }

  }

  Reload() {
    this.BestellungenNachschlagen();
  }


  Delete(item) {
    alert("En proceso de Desarrollo");
  }

  Send(item) {
    alert("En proceso de Desarrollo");
  }

  GoFilter() {
    this.BestellungenNachschlagen();
  }

  Print(item) {
    this.impresion.cargar('pedido', item.idrow);
  }

}
