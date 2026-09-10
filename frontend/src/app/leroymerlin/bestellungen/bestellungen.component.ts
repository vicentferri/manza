import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { LMSMAPIService } from '../config/lmsmapi.service';
import { DomSanitizer } from "@angular/platform-browser";

import * as _ from 'underscore';

import { PagerService } from '../../shared/pager-service.service';
import { SearchModel } from '../../models/SearchModel';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-bestellungen',
  templateUrl: './bestellungen.component.html',
  styleUrls: ['./bestellungen.component.css'],
  providers: [PagerService]
})
export class BestellungenComponent implements OnInit {

  @ViewChild("staticFilter", { static: false }) filters!: ModalDirective;
  @Input() cliente!: string;
  @Input() codeCentro!: string;

  //pdf: Uint8Array;
  pdf: any = null;
  public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl("about:blank");
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

  constructor(private service: LMSMAPIService,
    private pagerService: PagerService,
    private domSanitizer: DomSanitizer) {

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

    this.model.Hasta.setDate(this.model.Hasta.getDate() + 1);

    let values = JSON.stringify(this.model);


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

  Filter() {
    this.filters.show();
  }

  GoFilter() {
    this.filters.hide();
    this.BestellungenNachschlagen();
  }

  Print(item) {

    var url = "https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0&proc=PP_PREVIEW&ids=" + item.idrow;
    this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    /*
      this.service.getImage(item.idrow).subscribe(
        data => { 
          this.pdf = new Uint8Array(data);
          console.log(this.pdf);
          /*
          console.log(data);
          var data2 = new Blob([data], { type: 'application/pdf', });
          var fileUrl = URL.createObjectURL(data2);
          this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(fileUrl);
          
        },
        error => {}
      );
      */

    //var url = this.service.getImage(item.idrow)
    //console.log(url);
    //this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    //window.open(url);


  }

}
