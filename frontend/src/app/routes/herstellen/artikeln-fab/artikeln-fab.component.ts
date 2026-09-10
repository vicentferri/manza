import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-artikeln-fab',
  templateUrl: './artikeln-fab.component.html',
  styleUrls: ['./artikeln-fab.component.css'],
  providers: [HaruService]
})
export class ArtikelnFabComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  params = {
    id: 0,
    table: '',
    column: '',
    field: '',
    value: ''
  }

  articulos_tipo: any = [];
  details_tipo: any = [];
  campos1_tipo: any = [];
  campos2_tipo: any = [];
  temporal: any = [];

  model = {
    tipo: -1,
    tipo_value: '',
    campo1: '',
    campo2: '',
    campo1_value: '',
    campo2_value: '',
    campo1_value_descripcion: '',
    campo2_value_descripcion: '',
    campo1_show: true,
    campo2_show: true,
    articles: '',
    numero: 1
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descValue1', type: 'string' },
      { name: 'descValue2', type: 'string' },
      { name: 'articulos', type: 'string' },
      { name: 'consumo', type: 'number' },
      { name: 'cantidad', type: 'number' },
      { name: 'articulos2', type: 'string' },
      { name: 'consumo2', type: 'number' },
      { name: 'cantidad2', type: 'number' },
      { name: 'value1', type: 'number' },
      { name: 'value2', type: 'number' },
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }
  settings: any = {
    width: '100%',
    height: 650,
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100'],
    pagesize: 100,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
    selectionmode: 'multiplerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter,
    columns: [
      {
        text: '', datafield: 'idrow', width: 30, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
      },
      { text: 'Campo 1', datafield: 'descValue1', width: 130, filtertype: 'input', editable: false },
      { text: 'Campo 2', datafield: 'descValue2', width: 130, filtertype: 'input', editable: false },
      { text: 'Articulo 1', datafield: 'articulos', width: 400, filtertype: 'input', editable: false },
      {
        text: 'Ca1', datafield: 'cantidad', width: 50, cellsalign: 'center', filtertype: "number", groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
      {
        text: 'Co1', datafield: 'consumo', width: 50, cellsalign: 'center', filtertype: "number", groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
      { text: 'Articulo 2', datafield: 'articulos2', width: 400, filtertype: 'input', editable: false },
      {
        text: 'Ca2', datafield: 'cantidad2', width: 50, cellsalign: 'center', filtertype: "number", groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
      {
        text: 'Co2', datafield: 'consumo2', width: 50, cellsalign: 'center', filtertype: "number", groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
    ]

  };

  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {

    this.model.campo1_show = false;
    this.model.campo2_show = false;
    this.loadMasterData();
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
  }


  loadMasterData() {

    this.service.HTTP_Get('/artikeln_tipo/').subscribe(
      data => {
        this.articulos_tipo = data.Table;
        this.articulos_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
      },
      error => {
        this.toaster.error("Error al cargar los tipos de artículos", "Error");
      });

  }

  loadCampo1(url) {
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.temporal = data.Table;
        this.campos1_tipo = [];
        this.campos1_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
        this.temporal.forEach(element => {

          var id = element.idrow;
          var descripcion = element.descripcion;

          if (this.model.tipo == 1) {
            id = element.idrow;
            descripcion = element.accionamiento + ' ' + element.tipo;
          }

          this.campos1_tipo.push({ idrow: id, descripcion: descripcion });
          this.model.campo1_show = true;
        });
        this.model.campo1_value = '-1';


      },
      error => {

      });
  }

  loadCampo2(url) {
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.temporal = data.Table;
        this.campos2_tipo = [];
        this.campos2_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
        this.temporal.forEach(element => {
          var id = element.idrow;
          var descripcion = element.descripcion;
          this.campos2_tipo.push({ idrow: id, descripcion: descripcion });
          this.model.campo2_show = true;
        });
        this.model.campo2_value = '-1';
      },
      error => {

      });
  }


  loadDetails() {
    this.details_tipo = [];

    var tipo = this.model.tipo;
    var route = "/artikel_fabric/" + tipo;
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata("cells");
      },
      error => {

      });
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string) {

    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];

      if (field == "") {
        arrayData.push(row);
      }
      else {
        arrayData.push(row[field]);
      }
    }
    return arrayData;
  }

  Cellclick(event) {
    var args = event.args;
    if (args.datafield === "idrow") {
      var value = args.value;
      this.DelItem(value);
    }

    var row = args.row.bounddata;
    this.model.campo1_value = row.value1;
    this.model.campo2_value = row.value2;
    this.ChangeValue1(row.value1);
    this.ChangeValue2(row.value2);
    console.log(row);
    //this.ChangeValue1(row.value1);

  }



  DelItem(idrow) {

    if (confirm("¿Desea borrar la línea registrada?")) {


      var nmodel = {
        idrow: idrow
      }

      var values = JSON.stringify(nmodel);
      var route = "/artikel_assign_delete";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadDetails();
          }
        },
        error => {

        });
    }

  }

  Update() {

    var rows = this.search.getRows();
    this.model.articles = rows.join(',');
    this.modalAdd.hide();

    if (this.model.campo2_value === "") this.model.campo2_value = "0";

    var values = JSON.stringify(this.model);
    var route = "/artikel_assign/";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.myGrid.clearselection();
          this.loadDetails();
          //this.search.clear();
        }
      },
      error => {

      });

  }




  ChangeTipo(control) {

    console.log("ChangeTipo");
    //this.model.tipo = value;
    let value = this.model.tipo;
    this.model.campo1_show = false;
    this.model.campo2_show = false;

    /* ACCIONAMIENTOS */
    if (value == 1) {
      this.model.campo1 = "Accionamientos";
      this.model.campo2 = "Colores";
      this.model.tipo_value = "Accionamientos";
      this.loadCampo1('/sm/accionamientostipos_config');
      this.loadCampo2('/sm/colores');
      this.loadDetails()
    }

    /* SOPORTES */
    if (value == 2) {
      this.model.campo1 = "Soportes";
      this.model.campo2 = "Colores";
      this.model.tipo_value = "Soportes";
      this.loadCampo1('/sm/soportes/');
      this.loadCampo2('/sm/colores/');
      this.loadDetails()
    }

    /* TEJIDOS */
    if (value == 3) {
      this.model.campo1 = "Tejidos";
      this.model.campo2 = "Colores";
      this.model.tipo_value = "Tejidos";
      this.loadCampo1('/sm/tejidos');
      this.loadCampo2('/sm/colores');
      this.loadDetails()
    }

    /* SALIDA TEJIDOS */
    if (value == 4) {
      this.model.campo1 = "Salida Tejidos";
      this.model.campo2 = "";
      this.model.tipo_value = "Salida Tejido";
      this.loadCampo1('/sm/tejidos_salida');
      //this.loadCampo2('/colores/');
      this.loadDetails()
    }

    /* CONTRAPESOS */
    if (value == 5) {
      this.model.campo1 = "Contrapesos";
      this.model.campo2 = "Colores";
      this.model.tipo_value = "Contrapesos";
      this.loadCampo1('/sm/contrapesos');
      this.loadCampo2('/sm/colores');
      this.loadDetails()
    }

    /* POSICION MANDO */
    if (value == 6) {
      this.model.campo1 = "Posición del Mando";
      this.model.campo2 = "";
      this.model.tipo_value = "Posición Mando";
      this.loadCampo1('/sm/posicionmando');
      //this.loadCampo2('/colores/');
      this.loadDetails()
    }

    /* Tapas */
    if (value == 7) {
      this.model.campo1 = "Tapas";
      this.model.campo2 = "Colores";
      this.model.tipo_value = "Tapas";
      this.loadCampo1('/sm/tapas');
      this.loadCampo2('/sm/colores');
      this.loadDetails()
    }

    /* Embalaje */
    if (value == 8) {
      this.model.campo1 = "Embalajes";
      this.model.campo2 = "";
      this.model.tipo_value = "Embalajes";
      this.loadCampo1('/sm/embalajes');
      //this.loadCampo2('/colores');
      this.loadDetails()
    }

    /* Empaquetado */
    if (value == 9) {
      this.model.campo1 = "Empaquetado";
      this.model.campo2 = "";
      this.model.tipo_value = "Empaquetados";
      this.loadCampo1('/sm/empaquetados');
      //this.loadCampo2('/colores');
      this.loadDetails()
    }
    /* Instalacion */
    if (value == 10) {
      this.model.campo1 = "Instalación";
      this.model.campo2 = "";
      this.model.tipo_value = "Instalación";
      this.loadCampo1('/sm/instalaciones');
      //this.loadCampo2('/colores');
      this.loadDetails()
    }

    /* Tubos */
    if (value == 11) {
      this.model.campo1 = "Tubos";
      this.model.campo2 = "";
      this.model.tipo_value = "Tubos";
      this.loadCampo1('/sm/tubos');
      //this.loadCampo2('/colores');
      this.loadDetails()
    }

    /* Tipos de Cadena */
    if (value == 997) {
      this.model.campo1 = "Color";
      this.model.campo2 = "";
      this.model.campo2_value = '-1';
      this.model.tipo_value = "Cadena Continua";
      this.loadCampo1('/sm/colores');
      this.loadDetails()
    }

    /* Cadenas Contínuas */
    if (value == 998) {
      this.model.campo1 = "Altura";
      this.model.campo2 = "Color";
      this.model.tipo_value = "Cadena ";
      this.loadCampo1('/sm/alturacadena');
      this.loadCampo2('/sm/colores');
      this.loadDetails()
    }

    if (value == 999) {
      this.model.campo1 = "Altura";
      this.model.campo2 = "";
      this.model.campo2_value = '-1';
      this.model.tipo_value = "Cadena Metálica";
      this.loadCampo1('/sm/alturacadena');
      //this.loadCampo2('/colores');
      this.loadDetails()
    }

  }

  Open(value) {
    this.model.numero = 1;
    this.modalAdd.show();
  }

  ChangeValue1(value) {

    this.campos1_tipo.forEach(element => {
      if (value == element.idrow) {
        this.model.campo1_value_descripcion = element.descripcion;
      }
    });


  }

  ChangeValue2(value) {

    this.campos2_tipo.forEach(element => {
      if (value == element.idrow) {
        this.model.campo2_value_descripcion = element.descripcion;
      }
    });

  }

  cellBeginEditEvent(event) {
    //console.log(event);
  }

  cellEndEditEvent(event) {

    if (event.args.value != event.args.oldvalue) {

      if (event.args.datafield == "cantidad" ||
        event.args.datafield == "cantidad2" ||
        event.args.datafield == "consumo2" ||
        event.args.datafield == "consumo") {

        this.params.table = "SOL_ARTICULOS_FABRICACION_RELACION";
        this.params.column = "idrow";
        this.params.id = event.args.row.idrow,
          this.params.field = event.args.datafield;
        this.params.value = event.args.value;


        var values = JSON.stringify(this.params);
        this.service.HTTP_Post('/update_table', values).subscribe(
          data => {

            if (data.message === "OK") {
              this.toaster.success('Actualizado la Cantidad', 'Articulos Fabricacion');
            }
            this.myGrid.clearselection();
          },
          error => {
            console.log(error);
          }
        )
      }
    }
  }


}
