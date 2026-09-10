import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-artikeln-fac-cd-v3',
  templateUrl: './artikeln-fac-cd-v3.component.html',
  styleUrls: ['./artikeln-fac-cd-v3.component.css'],
  providers: [HaruService]
})
export class ArtikelnFacCdV3Component implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('gridReference2', { static: false }) myGrid2!: jqxGridComponent;
  @ViewChild('gridReference3', { static: false }) myGrid3!: jqxGridComponent;
  @ViewChild('gridReference4', { static: false }) myGrid4!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalList', { static: false }) modalList!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  public getScreenWidth: any;
  public getScreenHeight: any;

  config = {
    modelosm: '1'
  }

  params = {
    id: 0,
    table: '',
    column: '',
    field: '',
    value: '',
  }


  details_tipo: any = [];
  campos1_tipo: any = [];
  campos2_tipo: any = [];
  temporal: any = [];
  formulas: any = [];

  UnidadesSource = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'formula', type: 'string' }
    ],
    localdata: null
  }

  ActionAdapter = new $.jqx.dataAdapter(this.UnidadesSource,
    { contentType: 'application/json; charset=utf-8', autoBind: true });

  modelAdd = {
    nombre: '',
    tipo: 'varchar(25)',
    atributo: '',
    posicion: 1
  }

  model2 = {
    idrow: -1
  }

  model = {
    idrow: -1,
    orden: 0,
    sistema: '',
    atributo: '',
    valor: '',
    articulos: '',
    nombre_parametro1: '',
    nombre_parametro2: '',
    nombre_parametro3: '',
    nombre_parametro4: '',
    operacion: '-',
    operacion2: '-',
    operacion3: '-',
    tipo: 0,
    desde: 0,
    hasta: 0
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'orden', type: 'number' },
      { name: 'sistema', type: 'string' },
      { name: 'atributo', type: 'string' },
      { name: 'valor', type: 'string' },
      { name: 'detalle', type: 'string' },
      { name: 'articulos', type: 'string' },
      { name: 'nombre_parametro1', type: 'string' },
      { name: 'nombre_parametro2', type: 'string' },
      { name: 'nombre_parametro3', type: 'string' },
      { name: 'nombre_parametro4', type: 'string' },
      { name: 'operacion', type: 'string' },
      { name: 'operacion2', type: 'string' },
      { name: 'operacion3', type: 'string' },
      { name: 'consumo', type: 'string' },
    ],
    localdata: null
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'type', type: 'string' },
      { name: 'atributo', type: 'string' },
      { name: 'pos', type: 'number' },
    ],
    localdata: null
  };

  sourceDet = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "id", type: "int" },
      { name: "idpedido", type: "int" },
      { name: "orden", type: "int" },
      { name: "articulo", type: "int" },
      { name: "descripcion", type: "string" },
      { name: "cantidad", type: "int" },
      { name: "unidad", type: "int" },
      { name: "descunidad", type: "string" },
      { name: "ubicacion", type: "string" },
      { name: "consumo", type: "number" },
      { name: "cod_sol", type: "string" },
      { name: "fam_sol", type: "string" },
      { name: "fabricacion", type: "int" },
    ],
    localdata: null,
  };

  source4 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idpedido', type: 'string' },
      { name: 'parametro', type: 'string' },
      { name: 'valor', type: 'string' },
    ],
    localdata: null
  };

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["input", "checkedlist", "number", "range", "bool"];

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapterDet = new $.jqx.dataAdapter(this.sourceDet, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapter4 = new $.jqx.dataAdapter(this.source4, { contentType: 'application/json; charset=utf-8' });

  settings: any = {
    width: '100%',
    height: 600,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100'],
    pagesize: 100,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
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
      {
        text: '', datafield: 'idrow', width: 40, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
      },
      { text: 'Orden', datafield: 'orden', width: 50, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Tipo', datafield: 'sistema', width: 100, filtertype: 'textbox', editable: true },
      { text: 'Elemento', datafield: 'atributo', width: 125, filtertype: 'textbox', editable: true },
      { text: 'Atributo', datafield: 'valor', width: 125, filtertype: 'textbox', editable: false, hidden: true },
      { text: 'Parámetro 1', datafield: 'nombre_parametro1', width: 225, filtertype: 'textbox', editable: true, cellsalign: 'left' },
      { text: 'Op', datafield: 'operacion', width: 30, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Parámetro 2', datafield: 'nombre_parametro2', width: 225, filtertype: 'textbox', editable: true, cellsalign: 'left' },
      { text: 'Op', datafield: 'operacion2', width: 30, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Parámetro 3', datafield: 'nombre_parametro3', width: 225, filtertype: 'textbox', editable: true, cellsalign: 'left' },
      { text: 'Op', datafield: 'operacion3', width: 30, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Parámetro 4', datafield: 'nombre_parametro4', width: 225, filtertype: 'textbox', editable: true, cellsalign: 'left' },
      { text: 'Consumo', datafield: 'consumo', width: 200, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Ids', datafield: 'articulos', width: 100, filtertype: 'textbox', editable: true },
      { text: 'Articulos', datafield: 'detalle', filtertype: 'textbox', editable: false },
    ]

  };

  settings2: any = {
    width: '100%',
    height: 600,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100'],
    pagesize: 100,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter2,
    columns: [
      {
        text: '', datafield: 'idrow', width: 40, editable: false, hidden: true, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
      },
      { text: 'Nombre', datafield: 'name', width: 400, filtertype: 'input', editable: true, cellsalign: 'left' },
      { text: 'Tipo', datafield: 'type', width: 200, filtertype: 'input', editable: true, hidden: true },
      { text: 'Atributo', datafield: 'atributo', width: 200, filtertype: 'input', editable: true, hidden: true },
      { text: 'Posicion', datafield: 'pos', width: 75, filtertype: 'input', editable: true, hidden: true },
    ]

  };

  settingsDet: any = {
    width: "100%",
    height: 650,
    pageable: true,
    autoheight: false,
    theme: "glacier",
    pagesizeoptions: ["50", "100", "500"],
    pagesize: 500,
    scrollmode: "logical",
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: "singlerow",
    /* wir haben hier verschiedene Optionen,
     * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/ showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterDet,
    columns: [
      {
        text: "id",
        datafield: "id",
        width: 30,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Orden",
        datafield: "orden",
        width: 40,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Pos",
        datafield: "idpedido",
        width: 40,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "art",
        datafield: "articulo",
        width: 45,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Descripcion",
        datafield: "descripcion",
        width: 400,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Cantidad",
        datafield: "cantidad",
        width: 60,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Unidad",
        datafield: "descunidad",
        width: 75,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Ubicación",
        datafield: "ubicacion",
        width: 85,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Consumo",
        datafield: "consumo",
        width: 70,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
        cellsformat: "d2",
      },
      {
        text: "Cod_Sol",
        datafield: "cod_sol",
        width: 75,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Fam_Sol",
        datafield: "fam_sol",
        width: 75,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
    ],
  };

  settings4: any = {
    width: '100%',
    height: 675,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100'],
    pagesize: 100,
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
    showstatusbar: true,
    source: this.dataAdapter4,
    columns: [
      { text: 'Pos', datafield: 'idpedido', width: 40, filtertype: 'textbox' },
      { text: 'Nombre', datafield: 'parametro', width: 130, filtertype: 'textbox' },
      { text: 'Valor', datafield: 'valor', filtertype: 'textbox' },
    ]

  };


  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.myGrid2.createComponent(this.settings2);
    this.myGrid3.createComponent(this.settingsDet);
    this.myGrid4.createComponent(this.settings4);
    this.performResize();
    this.loadConfig();
    this.loadParameters();
    this.loadDetails();
  }

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.loadFormula();
  }

  performResize() {
    if (this.myGrid != null) {
      let height = 0.8 * this.getScreenHeight;
      this.myGrid.height(height);
      this.myGrid2.height(height);
    }
  }

  loadFormula() {
    this.service.HTTP_Get('/artikel_formulas').subscribe(
      data => {
        this.UnidadesSource.localdata = data.Table;
        this.formulas = data.Table;
      },
      error => {
        console.log(error.message);
      }
    );
  }

  loadParameters() {
    var route = "/artikel_fabric_parameters_sm";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.source2.localdata = data.Table;
        this.dataAdapter2.dataBind();
        this.myGrid2.updatebounddata();
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  loadDetails() {
    var route = "/artikel_fabric_setup_sm";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata("cells");
      },
      error => {
        this.toaster.error(error.message);
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
    if (args.datafield == "idrow") {
      var value = args.value;
      this.DelItem(value);
    }
  }

  Cellclick2(event) {
    var args = event.args;
    if (args.datafield == "idrow") {
      var value = args.value;
      this.DelParameter(value);
    }
  }

  DelParameter(idrow) {
    if (confirm("¿Desea borrar el parámetro seleccionado?")) {

      var nmodel = {
        name: idrow
      }

      var values = JSON.stringify(nmodel);
      var route = "/artikel_fabric_parameters_del";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadParameters();
          }
        },
        error => {

        });
    }

  }

  DelItem(idrow) {

    if (confirm("¿Desea borrar la línea registrada?")) {

      var nmodel = {
        idrow: idrow
      }

      var values = JSON.stringify(nmodel);
      var route = "/artikel_fabric_delete";
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

  UpdateArticles() {
    var rows = this.search.getRows();
    this.model.articulos = rows.join(',');
  }

  Update() {

    var values = JSON.stringify(this.model);
    var route = "/artikel_fabric_setup_sm";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.loadDetails();
          this.toaster.success('Agregados los Artículos', 'Articulos Fijos');
        }
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  AddParameters() {
    if (confirm("¿Desea agregar los parámetros?")) {
      var values = JSON.stringify(this.modelAdd);
      var route = "/artikel_fabric_parameters_add";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadParameters()
            this.toaster.success('Agregados', 'Parámetros');
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;

    this.performResize();
  }


  Open() {
    this.modalAdd.show();
  }



  cellBeginEditEvent(event) {
    //console.log(event);
  }

  cellBeginEditEvent2(event) {
    //console.log(event);
  }

  getId(value) {

    var id = 0;
    this.formulas.forEach(element => {
      if (element.formula == value) {
        id = element.idrow;
      }
    });

    return id;
  }

  cellEndEditEvent(event) {



    if (event.args.datafield == "orden" ||
      event.args.datafield == "sistema" ||
      event.args.datafield == "valor" ||
      event.args.datafield == "nombre_parametro1" ||
      event.args.datafield == "nombre_parametro2" ||
      event.args.datafield == "nombre_parametro3" ||
      event.args.datafield == "nombre_parametro4" ||
      event.args.datafield == "consumo" ||
      event.args.datafield == "articulos" ||
      event.args.datafield == "operacion" ||
      event.args.datafield == "operacion2" ||
      event.args.datafield == "operacion3") {

      this.params.table = "sol_articulos_fabricacion_relacion_v2";
      this.params.column = "idrow";
      this.params.id = event.args.row.idrow,
        this.params.field = event.args.datafield;
      this.params.value = event.args.value;

      if (event.args.datafield == "operacion" ||
        event.args.datafield == "operacion2" ||
        event.args.datafield == "operacion3") {
        let values = new String(event.args.value).toUpperCase();
        if (values.includes("Y") ||
          values.includes("O") ||
          values.includes("-")) {
          this.params.value = values;
        }
        else {
          this.params.value = "-";
        }
      }
      if (event.args.datafield == "formula") {
        this.params.field = "formula";

        var value = this.getId(event.args.value);

        this.params.value = value.toString();
      }

      var values = JSON.stringify(this.params);
      this.service.HTTP_Post('/update_table', values).subscribe(
        data => {
          //console.log(data);
          if (data.message == "OK") {
            this.toaster.success('Actualizacion Realizada', 'Parámetros');
            this.loadDetails();
          }
        },
        error => {
          console.log(error.message);
        }
      );
    }


  }

  cellEndEditEvent2(event) {

  }

  Parametros() {
    this.modalList.show();
  }


  VerHojaFabricacion() {
    let url = "/detail_sim/" + this.model2.idrow + "/1/0";
    console.log(url);
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.sourceDet.localdata = data.Table;
          this.dataAdapterDet.dataBind();
          this.myGrid3.updatebounddata();
        }
      },
      (error) => {
        this.toaster.error(error.message);
      });
  }

  VerHojaParametros() {
    let url = "/parameters/" + this.model2.idrow + "/1/0";
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.source4.localdata = data.Table;
          this.dataAdapter4.dataBind();
          this.myGrid4.updatebounddata();
        }
      },
      (error) => {
        this.toaster.error(error.message);
      });
  }


  HojaFabricacion() {
    let url = "/export_csv/" + this.model2.idrow + "/1";
    url = this.service.HTTP_Url_Get(url);
    window.open(url);
  }


  /*
  */
  Simulate() {

    let proceed = 1;

    if (this.model2.idrow === -1) {
      alert("Debe Asignar el ID del Pedido");
      proceed = 0;
    }

    if (proceed == 1) {

      let values = JSON.stringify(this.model2);

      this.service.HTTP_Post('/artikel_fabric_sm_simulate', values).subscribe(
        data => {
          this.VerHojaFabricacion();
          this.VerHojaParametros();
        },
        error => {
          console.log(error.message);
        });

    }
  }

  loadConfig() {
    let url = "/sm/configuracion";
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.config.modelosm = data[0].ModeloFabricacionSM;
        }
      },
      (error) => {
        this.toaster.error(error.message);
      });
  }

  Apply() {
    if (confirm("¿Quiere cambiar el modelo?")) {

      let values = JSON.stringify(this.config);

      this.service.HTTP_Post('/configuracion_sm', values).subscribe(
        data => {
          this.loadConfig();
        },
        error => {
          this.toaster.error(error.message);
        });

    }
  }
}

