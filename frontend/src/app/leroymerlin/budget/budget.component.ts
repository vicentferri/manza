import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { LMSMAPIService } from '../config/lmsmapi.service';
import { DomSanitizer } from "@angular/platform-browser";

import * as _ from 'underscore';

import { PagerService } from '../../shared/pager-service.service';
import { SearchModel } from '../../models/SearchModel';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css'],
  providers: [PagerService, LMSMAPIService]
})
export class BudgetComponent implements OnInit {

  @ViewChild("staticFilter", { static: false }) filters!: ModalDirective;
  @Input() cliente: string = "";
  @Input() codeCentro: string = "";

  @Output() onLoaded = new EventEmitter();

  public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl("about:blank");
  public numeroPedidos = 0;
  public fechaConsulta = new Date();
  /* VFF 20.04.2018 */
  // array of all items to be paged
  public allItems: any[] = [];

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
    this.BudgetNachschlagen();
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
  BudgetNachschlagen() {
    var cliente = this.cliente;
    var centro = this.codeCentro;

    this.model.Cliente = this.cliente;
    this.model.Centro = this.codeCentro;

    this.model.Hasta.setDate(this.model.Hasta.getDate() + 1);

    let values = JSON.stringify(this.model);

    this.service.postBudgetnachschlagen(values).subscribe(
      data => {
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
    this.BudgetNachschlagen();
  }


  Delete(item) {
    if (confirm("¿Desea Realizar el borrado del presupuesto?")) {
      var route = "/api/budget_delete/" + item.idrow;
      this.service.HTTP_Get(route).subscribe(
        data => {
          //console.log(data);
          this.BudgetNachschlagen();
        },
        error => {

        }
      );
    }
  }

  Send(item) {
    alert("En proceso de Desarrollo");
  }

  Filter() {
    this.filters.show();
  }

  GoFilter() {
    this.filters.hide();
    this.BudgetNachschlagen();
  }

  Print(item) {
    var url = "https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0&proc=PP_PREVIEW_PRE&ids=" + item.idrow;
    this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  Load(item) {
    this.onLoaded.emit(item);
  }

}
