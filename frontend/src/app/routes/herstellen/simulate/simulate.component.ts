import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';

@Component({
  selector: 'app-simulate',
  templateUrl: './simulate.component.html',
  styleUrls: ['./simulate.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [HaruService]
})
export class SimulateComponent implements OnInit {

  @ViewChild('gridSReference', { static: false }) mySGrid!: jqxGridComponent;
  @ViewChild('gridSReference2', { static: false }) mySGrid2!: jqxGridComponent;

  arrInfo: Array<any> = [];

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'numero', type: 'string' },
      { name: 'fecha', type: 'date' },
      { name: 'cantidad', type: 'string' },
      { name: 'ancho', type: 'string' },
      { name: 'alto', type: 'number' },
      { name: 'tejido', type: 'string' },
      { name: 'color', type: 'string' },
    ],
    url: ""
  };

  source3 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'numero', type: 'string' },
      { name: 'fecha', type: 'date' },
      { name: 'cantidad', type: 'string' },
      { name: 'ancho', type: 'string' },
      { name: 'alto', type: 'number' },
      { name: 'tejido', type: 'string' },
      { name: 'color', type: 'string' },
      { name: 'step', type: 'string' },
    ],
    url: ""
  };



  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapter3 = new $.jqx.dataAdapter(this.source3, { contentType: 'application/json; charset=utf-8' });


  settingsS: any = {
    width: '99%',
    height: '99%',
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter2,
    columns: [
      { text: 'id', datafield: 'idrow', width: 50, editable: false },
      { text: 'Número', datafield: 'numero', width: 80, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Fecha', datafield: 'fecha', width: 90, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy' },
      { text: 'Cantidad', datafield: 'cantidad', width: 80, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Ancho', datafield: 'ancho', width: 90, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Alto', datafield: 'alto', width: 90, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Tejido', datafield: 'tejido', width: 90, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Color', datafield: 'color', width: 90, filtertype: 'input', editable: false, cellsalign: 'center' }
    ]
  };

  settingsS2: any = {
    width: '99%',
    height: '99%',
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter3,
    columns: [
      { text: 'id', datafield: 'idrow', width: 50, editable: false },
      { text: 'Fecha', datafield: 'fecha', width: 90, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy' },
      { text: 'Cant', datafield: 'cantidad', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Ancho', datafield: 'ancho', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Alto', datafield: 'alto', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Tejido', datafield: 'tejido', width: 70, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Color', datafield: 'color', width: 70, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Step', datafield: 'step', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' }
    ]
  };


  constructor(private service: HaruService) {

  }

  ngOnInit() {
    this.search();
  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settingsS);
    this.mySGrid2.createComponent(this.settingsS2);
  }

  search() {
    this.source2.url = this.service.HTTP_Url_Get("/sm/simulate_origin_info");
    //this.mySGrid.updatebounddata("cells");
  }

  rowSelect(item) {

  }

  rowSelect2(item) {

  }

  perform() {
    this.source3.url = this.service.HTTP_Url_Get("/sm/simulate_processed_info");
    this.mySGrid2.updatebounddata("cells");

    this.service.HTTP_Get("/sm/simulate_sim_info").subscribe(

      data => {
        console.log(data.Table);
        this.arrInfo = data.Table;
      },
      error => {

      });
  }

  ViewPanel(panel) {
    if (panel == 2) {
      this.source3.url = "";
      this.mySGrid2.clear();
    }
  }

  Generate() {
    this.perform();
  }

}
