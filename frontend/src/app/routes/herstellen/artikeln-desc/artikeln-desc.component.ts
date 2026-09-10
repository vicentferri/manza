import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-artikeln-desc',
  templateUrl: './artikeln-desc.component.html',
  styleUrls: ['./artikeln-desc.component.css'],
  providers: [HaruService]
})
export class ArtikelnDescComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;

  accionamientos: any = [];
  accionamientos_tipo: any = [];
  accionamientos_tipo2: any = [];
  soportes_tipo: any = [];
  tapas_tipo: any = [];
  tubos_tipo: any = [];

  model = {
    accionamiento: -1,
    id: 0,
    value1: '-1',
    value2: '-1',
    value3: '-1',
    value4: '-1',
    value5: '-1',
    ancho: '0',
    alto: '0',
    tubo: '0',
    oculto: '0',
    visto: '0',
    macarron: '0'
  }

  params = {
    id: 0,
    table: '',
    column: '',
    field: '',
    value: ''
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'Accionamiento', type: 'string' },
      { name: 'descValue1', type: 'string' },
      { name: 'descValue2', type: 'string' },
      { name: 'descValue3', type: 'string' },
      { name: 'descValue4', type: 'string' },
      { name: 'descValue5', type: 'string' },
      { name: 'Ancho', type: 'number' },
      { name: 'Alto', type: 'number' },
      { name: 'Tubo', type: 'number' },
      { name: 'Oculto', type: 'number' },
      { name: 'Visto', type: 'number' },
      { name: 'Macarron', type: 'number' }
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  integerValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["input", "checkedlist", "number", "range", "bool"];

  button = function (a, b, c, d, html, rowInfo) {
    var button = "<div style='text-align: center; margin-top: 6px;'><input id='" + rowInfo.idrow + "' class='editButton' type='image' src='../images/icon-pencil.gif' width='15' height='15' onclick='getId($(this),1);return false;'/></div>";
    return button;
  }


  settings: any = {
    width: this.getWidth(),
    height: 650,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '5000'],
    pagesize: 5000,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen, 
                                * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    showaggregates: true,
    source: this.dataAdapter,
    columns: [
      {
        text: '', datafield: 'id', width: 40, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
      },
      { text: 'Accionamiento', datafield: 'Accionamiento', width: 125, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Marca', datafield: 'descValue1', width: 175, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Modelo', datafield: 'descValue5', width: 175, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Soportes', datafield: 'descValue2', width: 175, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Tapas', datafield: 'descValue3', width: 175, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Tubo', datafield: 'descValue4', width: 175, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Ancho', datafield: 'Ancho', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },
      { text: 'Alto', datafield: 'Alto', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },
      { text: 'Tubo', datafield: 'Tubo', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },
      { text: 'Oculto', datafield: 'Oculto', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },
      { text: 'Visto', datafield: 'Visto', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },
      { text: 'Macarron', datafield: 'Macarron', width: 80, cellsalign: 'center', filtertype: this.filter[2], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2' },

    ]
  };


  constructor(private service: HaruService, private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }

    return '99%';
  }

  ngOnInit() {
    this.loadCampo1(0, '/sm/accionamientos');
    //this.loadCampo1(1,'/accionamientostipos_config');
    this.loadCampo1(2, '/sm/soportes/');
    this.loadCampo1(3, '/sm/tapas');
    this.loadCampo1(4, '/sm/tubos');
    this.Load();
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
  }

  ChangeAccionamiento() {
    this.loadCampo1(1, '/sm/accionamientostipos_config?id=' + this.model.accionamiento);
  }

  ChangeAccionamientoMarca() {
    this.loadCampo1(5, '/sm/accionamientos_modelos/' + this.model.value1);
  }

  loadCampo1(pos, url) {
    this.service.HTTP_Get(url).subscribe(
      data => {

        if (pos == 0) {
          this.accionamientos = data.Table;
        }

        if (pos == 1) {
          this.accionamientos_tipo = data.Table;
        }

        if (pos == 2) {
          this.soportes_tipo = data.Table;
        }

        if (pos == 3) {
          this.tapas_tipo = data.Table;
        }

        if (pos == 4) {
          this.tubos_tipo = data.Table;
        }

        if (pos == 5) {
          this.accionamientos_tipo2 = data.Table;
          if (data.Table.length == 0) {
            this.accionamientos_tipo2.push({ idrow: -1, tipo: 'No existe modelo' });
          }

        }




      },
      error => {

      });
  }



  Open() {
    this.Update();
  }

  Load() {
    var route = "/artikel_fabric_desc";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata();
      },
      error => {

      });
  }

  gridReady() {

  }

  Update() {

    var values = JSON.stringify(this.model);
    var route = "/artikel_fabric_desc";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.Load();
          this.toaster.success('Agregado el descuento', 'Dtos.Articulos Fabricacion');
        }
      },
      error => {

      });

  }

  cellBeginEditEvent(event) {
    //console.log(event);
  }

  Refresh() {
    this.Load();
  }

  Cellclick(event) {
    var args = event.args;
    if (args.datafield == "id") {
      var value = args.value;
      this.DelItem(value);
    }
  }

  DelItem(idrow) {

    if (confirm("¿Desea borrar la línea registrada?")) {


      var nmodel = {
        idrow: idrow
      }

      var values = JSON.stringify(nmodel);
      var route = "/artikel_fabric_desc_delete";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.Load();
            this.toaster.success('Borrado el elemento', 'Dtos.Articulos Fabricacion');
          }
        },
        error => {

        });
    }

  }

  cellEndEditEvent(event) {

    this.params.table = "sol_articulos_fabricacion_descuento";
    this.params.column = "id";
    this.params.id = event.args.row.id;
    this.params.field = event.args.datafield;
    this.params.value = event.args.value;
    /*
    this.params.table = "ARTICULOS";
    this.params.column = "idrow";
    this.params.id = event.args.row.idrow,
    this.params.field = event.args.datafield;
    this.params.value = event.args.value;
    */
    var values = JSON.stringify(this.params);
    this.service.HTTP_Post('/update_table', values).subscribe(
      data => {
        if (data.message = 'OK') {
          //this.searchDocuments();
        }
      },
      error => {
        console.log(error);
      }
    );
  }

}
