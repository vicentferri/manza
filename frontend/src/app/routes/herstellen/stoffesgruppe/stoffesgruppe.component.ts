import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxGridComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HaruService } from '../../../services/haru.service';
import { Utils } from '../../../shared/Utils';

@Component({
  selector: 'app-stoffesgruppe',
  templateUrl: './stoffesgruppe.component.html',
  styleUrls: ['./stoffesgruppe.component.css'],
  providers: [HaruService]
})
export class StoffesgruppeComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('gridReference2', { static: false }) myGrid2!: jqxGridComponent;
  @ViewChild('gridReference3', { static: false }) myGrid3!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalAdd2', { static: false }) modalAdd2!: ModalDirective;

  hideButton = false;
  tempidrow = -1;

  model = {
    idrow: 0,
    grupo: '',
    descripcion: '',
    criterio: '180',
    precio: 0
  }

  model2 = {
    idrow: 0,
    ids: ''
  }

  lista_criterios: any = null;
  lista_criterios_enrollables: any =
    [{ id: "89", name: "89" }, { id: "127", name: "127" }, { id: "180", name: "180" }, { id: "140", name: "140" }, { id: "200", name: "200" },
    { id: "240", name: "240" }, { id: "250", name: "250" }, { id: "280", name: "280" }, { id: "300", name: "300" }, { id: "320", name: "320" }, { id: "350", name: "350" }];

  lista_criterios_verticales: any =
    [{ id: "89", name: "89" }, { id: "127", name: "127" }];


  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'grupo', type: 'string' },
      { name: 'descripcion', type: 'string' },
      { name: 'precio', type: 'number' },
      { name: 'criterio', type: 'number' },
      { name: 'nexos', type: 'string' }
    ],
    localdata: null
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' },
    ],
    localdata: null
  };

  source3 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' },
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapter3 = new $.jqx.dataAdapter(this.source3, { contentType: 'application/json; charset=utf-8' });

  settings: any = {
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
    groupable: false,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter,
    columns: [
      { text: 'Grupo', datafield: 'grupo', width: 70, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Descripción', datafield: 'descripcion', filtertype: 'textbox', editable: false },
      { text: 'Precio', datafield: 'precio', width: 90, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Criterio', datafield: 'criterio', width: 100, filtertype: 'textbox', editable: false, cellsalign: 'center' },
    ]
  };

  settings2: any = {
    width: '99%',
    height: '99%',
    pageable: false,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter2,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Descripción', datafield: 'descripcion', filtertype: 'textbox', editable: false },
    ]
  };

  settings3: any = {
    width: '99%',
    height: '99%',
    pageable: false,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter3,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 50, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Descripción', datafield: 'descripcion', filtertype: 'textbox', editable: false },
    ]
  };

  constructor(private service: HaruService) { }

  ngOnInit() {
    this.LoadGrupos();
    this.lista_criterios = this.lista_criterios_enrollables;
  }

  /*
  */
  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.myGrid2.createComponent(this.settings2);
    this.myGrid3.createComponent(this.settings3);
  }

  /*
  */
  LoadGrupos() {
    this.service.HTTP_Get("/sm/grupos").subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata();
      },
      error => {

      }
    );
  }

  LoadTejidos() {
    this.service.HTTP_Get("/sm/tejidos").subscribe(
      data => {
        console.log(data.Table);
        this.source3.localdata = data.Table;
        this.dataAdapter3.dataBind();
        this.myGrid3.updatebounddata();
      },
      error => {

      }
    );
  }

  LoadTejidosGrupo() {
    let url = "/tejidosgrupos/" + this.model.idrow;
    this.service.HTTP_Get(url).subscribe(
      data => {
        console.log(data.Table);
        this.source2.localdata = data.Table;
        this.dataAdapter2.dataBind();
        this.myGrid2.updatebounddata();
      },
      error => {

      }
    );
  }

  AddGrupo() {
    this.model.idrow = 0;
    this.model.criterio = "180";
    this.model.descripcion = "";
    this.model.grupo = "";
    this.model.precio = 0;
    this.modalAdd.show();
  }

  DelGrupo() {

    if (confirm("¿Desea borrar el grupo de tejido seleccionado?")) {

      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/grupos_del", values).subscribe(
        data => {
          if (data.message == "OK") {
            this.LoadGrupos();
            this.model.idrow = 0;
            this.model.criterio = "180";
            this.model.descripcion = "";
            this.model.grupo = "";
            this.model.precio = 0;
            this.modalAdd.hide();
            this.myGrid.clearselection();
          }
        },
        error => {

        });
    }
  }

  DelTejidoGrupo() {

    let arrayData = Utils.getSelectedRows(this.myGrid2, "idrow");
    if (arrayData.length > 0) {
      this.model2.ids = arrayData.join(",");
      if (confirm("¿Desea borrar los tejidos seleccionados del grupo?")) {

        let values = JSON.stringify(this.model2);
        this.service.HTTP_Post("/tejidosgrupos_del", values).subscribe(
          data => {
            if (data.message == "OK") {
              //this.LoadGrupos();
              //this.model2.idrow = 0;
              //this.model2.ids = "";
              this.modalAdd2.hide();
              this.myGrid2.clearselection();
              this.LoadTejidosGrupo();
            }
          },
          error => {

          }
        );
      }
    }
  }

  AddTejido() {
    let arrayData = Utils.getSelectedRows(this.myGrid, "idrow");
    if (arrayData.length == 1) {
      this.modalAdd2.show();
      this.LoadTejidos();
    } else {
      alert("Debe Seleccionar un Grupo de Tejido");
    }
  }

  Update() {
    if (confirm("¿Desea agregar el grupo de tejido?")) {

      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/grupos", values).subscribe(
        data => {
          if (data.message == "OK") {
            this.LoadGrupos();
            this.model.idrow = 0;
            this.model.criterio = "180";
            this.model.descripcion = "";
            this.model.grupo = "";
            this.model.precio = 0;
            this.modalAdd.hide();
            this.myGrid.clearselection();
          }
        },
        error => {

        }
      );
    }
  }

  rowSelect2(event) {
  }

  rowSelect(event) {
    let args = event.args.row;

    this.model.idrow = args.idrow;
    this.model2.idrow = args.idrow;
    this.model.grupo = args.grupo;
    this.model.criterio = args.criterio;
    this.model.descripcion = args.descripcion;
    this.model.precio = args.precio;

    this.LoadTejidosGrupo();
  }

  EditGrupo() {
    this.modalAdd.show();

  }

  Update2() {
    let arrayData = Utils.getSelectedRows(this.myGrid3, "idrow");
    if (arrayData.length > 0) {
      this.model2.ids = arrayData.join(",");
      if (confirm("¿Desea agregar los tejidos al grupo?")) {

        let values = JSON.stringify(this.model2);
        this.service.HTTP_Post("/tejidosgrupos", values).subscribe(
          data => {
            if (data.message == "OK") {
              //this.LoadGrupos();
              //this.model2.idrow = 0;
              //this.model2.ids = "";
              this.modalAdd2.hide();
              this.myGrid3.clearselection();
              this.LoadTejidosGrupo();
            }
          },
          error => {

          }
        );
      }
    }

  }





}
