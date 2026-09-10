import { Component, OnInit, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { SearchArticleType } from '../../models/SearchArticleType';
import { jqxGridComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../services/haru.service';
//import { Select2OptionData } from 'ng2-select2';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
//import * as $ from 'jquery';


@Component({
  selector: 'search-artikel',
  templateUrl: './search-artikel.component.html',
  styleUrls: ['./search-artikel.component.css'],
  providers: [HaruService]
})
export class SearchArtikelComponent implements OnInit {

  @ViewChild('gridSReference', { static: false }) mySGrid!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;

  @Input('editable') editable: number;

  /*
  public exampleData1: Observable<Array<Select2OptionData>>;
  public startValue1: Observable<string>;
  public selected1: string;

  public exampleData2: Observable<Array<Select2OptionData>>;
  public startValue2: Observable<string>;
  public selected2: string;
*/
  unidades: any = [];
  tipoprod: any = [{ unidad: 'F', descripcion: 'Fijo' }, { unidad: 'V', descripcion: 'Variable' }];

  hideParams = true;

  tipocalculo_params = {
    article: 0,
    cantidad: 0,
    espacio: 0,
  }

  params = {
    id: 0,
    table: '',
    column: '',
    field: '',
    value: ''
  }

  options = {
    multiple: false,
    theme: 'classic',
    closeOnSelect: true
  }

  newrow = {
    id: 0,
    cantidad: 0,
    ancho: 0,
    minimo: 0
  }

  searchmodel = new SearchArticleType();

  TipoProdSource = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'unidad', type: 'number' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: this.tipoprod
  }

  ElementsSource = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'nombre', type: 'string' }
    ],
    localdata: null
  }

  TipoCalculoSource = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'nombre', type: 'string' }
    ],
    localdata: null
  }

  UnidadesSource = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'unidad', type: 'number' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  }

  ActionAdapter = new $.jqx.dataAdapter(this.UnidadesSource,
    { contentType: 'application/json; charset=utf-8', autoBind: true });

  ActionAdapter2 = new $.jqx.dataAdapter(this.TipoProdSource,
    { contentType: 'application/json; charset=utf-8', autoBind: true });

  ElementsAdapter = new $.jqx.dataAdapter(this.ElementsSource, { contentType: 'application/json; charset=utf-8' });
  TipoCalculoAdapter = new $.jqx.dataAdapter(this.TipoCalculoSource, { contentType: 'application/json; charset=utf-8' });

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'descripcion', type: 'string' },
      { name: 'cod_solupyme', type: 'string' },
      { name: 'fam_solupyme', type: 'string' },
      { name: 'precio_coste1', type: 'number' },
      { name: 'precio_coste', type: 'number' },
      { name: 'precio_venta', type: 'number' },
      { name: 'plazo_entrega', type: 'number' },
      { name: 'tiempo_fabricacion', type: 'number' },
      { name: 'clasificacion', type: 'string' },
      { name: 'synchro_date', type: 'date' },
      { name: 'tipoprod', type: 'string' },
      { name: 'elemento', type: 'int' },
      { name: 'descelemento', type: 'string' },
      { name: 'descunidad', type: 'string' },
      { name: 'consumo', type: 'number' },
      { name: 'margen', type: 'number' },
      { name: 'vertical', type: 'number' },
      { name: 'tipocalculo', type: 'int' },
      { name: 'desctipocalculo', type: 'string' },
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 4, digits: 8, min: 0, spinButtons: false });
  }

  decimal2ValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  integerValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["textbox", "checkedlist", "number", "range", "bool", "list"];

  button = function (a, b, c, d, html, rowInfo) {
    var button = "<div style='text-align: center; margin-top: 6px;'><input id='" + rowInfo.idrow + "' class='editButton' type='image' src='../images/icon-pencil.gif' width='15' height='15' onclick='getId($(this),1);return false;'/></div>";
    return button;
  }

  imagerenderer = function (a, b, c, d, html, rowInfo) {

    /*
    var Imagenes = EsVisible();
    if (Imagenes == 1 && rowInfo.id > 0) {
        var url = appPath + "/_006/imager.ashx?id=" + rowInfo.id;
        return "<img style='margin-left: 5px;' height='100' width='100' src='" + url + "'/>";
    }
    else {
        return "<img height='0' width='0' src=''/>";
    }
    */
    return "<img height='0' width='0' src=''/>";
  }


  settings: any = {
    width: this.getWidth(),
    height: 500,
    pageable: true,
    autoheight: true,
    theme: 'bootstrap',
    pagesizeoptions: ['20', '100', '500', '5000'],
    pagesize: 20,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
    selectionmode: 'checkbox', /* wir haben hier verschiedene Optionen, 
                                    * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: true,
    showstatusbar: false,
    showaggregates: true,
    source: this.dataAdapter,
    columns: [
      { text: 'id', datafield: 'idrow', width: 40, filtertype: this.filter[0], groupable: false, pinned: false },
      { text: 'Descripción', datafield: 'descripcion', width: 200, filtertype: this.filter[0], groupable: true, pinned: false, editable: false },
      { text: 'Cod.Sol', datafield: 'cod_solupyme', width: 80, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: false },
      { text: 'Fam.Sol', datafield: 'fam_solupyme', width: 70, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: false },
      {
        text: 'Ult.P.Compra', datafield: 'precio_coste1', width: 70, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: false, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd4',
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },
      { text: 'P.Compra', datafield: 'precio_coste', width: 70, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd4' },
      { text: 'P.Venta', datafield: 'precio_venta', width: 70, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd4' },

      {
        text: 'Unidad', datafield: 'descunidad', width: 80, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ActionAdapter,
            displayMember: 'descripcion', valueMember: 'idrow'
          })
        },
      },
      { text: 'Margen', datafield: 'margen', width: 70, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimal2ValueCantidad, cellsformat: 'd2' },
      {
        text: 'Elemento', datafield: 'descelemento', width: 100, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ElementsAdapter,
            displayMember: 'nombre', valueMember: 'elemento'
          })
        },
      },
      {
        text: 'Tipo', datafield: 'tipoprod', width: 80, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ActionAdapter2,
            displayMember: 'descripcion', valueMember: 'unidad'
          })
        },
      },
      { text: 'Consumo', datafield: 'consumo', width: 70, cellsalign: 'center', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.decimal2ValueCantidad, cellsformat: 'd2' },
      { text: 'Plazo Entrega', datafield: 'plazo_entrega', width: 90, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.integerValueCantidad, cellsformat: 'n2' },
      { text: 'Tiempo Fabric', datafield: 'tiempo_fabricacion', width: 90, cellsalign: 'right', filtertype: this.filter[0], groupable: false, pinned: false, editable: true, columntype: 'numberinput', createeditor: this.integerValueCantidad, cellsformat: 'n2' },
      { text: 'Vert', datafield: 'vertical', width: 50, cellsalign: 'center', filtertype: this.filter[0], groupable: false, pinned: false, editable: true },
      {
        text: 'Calculo Valoración', datafield: 'desctipocalculo', width: 150, filtertype: this.filter[0], groupable: true, pinned: false, cellsalign: "center", editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.TipoCalculoAdapter,
            displayMember: 'nombre', valueMember: 'tipocalculo'
          })
        },
      },
      { text: 'Sincronizado', datafield: 'synchro_date', width: 200, cellsalign: 'center', filtertype: this.filter[3], cellsformat: 'dd/MM/yyyy hh:mm:ss', groupable: false, pinned: false, editable: false },

    ]
  };

  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);
    this.editable = 1;

  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }

    return '99%';
  }

  ngOnInit() {
    this.loadMaster();
  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settings);
    if (this.mySGrid != null) {
      this.createButtons();
    }
  }


  public changed1(e: any): void {
    /*
    this.selected1 = e.value;
    if (parseInt(this.selected1) > 0) {
      //this.search(this.selected);
    }
      */
  }

  public changed2(e: any): void {
    /*
    this.selected2 = e.value;
    if (parseInt(this.selected2) > 0) {
      //this.search(this.selected);
    }
      */
  }

  loadMaster() {

    this.service.HTTP_Get('/unidades').subscribe(
      (data: any) => {
        this.UnidadesSource.localdata = data.Table;
        this.unidades = data.Table;
      },
      (error: any) => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/artikeln_elements').subscribe(
      (data: any) => {
        this.ElementsSource.localdata = data.Table;
      },
      (error: any) => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/artikeln_tipocalculo').subscribe(
      (data: any) => {
        this.TipoCalculoSource.localdata = data.Table;
      },
      (error: any) => {
        this.toaster.error(error.message);
      }
    );


  }


  searchDocuments() {
    var usuario = 1;
    var criterio = this.searchmodel.Descripcion;
    var alias = this.searchmodel.Alias;
    var barras = this.searchmodel.Barras;

    if (criterio == null) {
      criterio = "";
    }

    if (alias == null) {
      alias = "";
    }

    if (barras == null) {
      barras = "";
    }


    this.mySGrid.clearselection();
    this.mySGrid.showloadelement();
    this.source.localdata = null;


    if (this.editable == 1) {
      this.mySGrid.editable(true);
    }
    else {
      this.mySGrid.editable(false);
    }

    let model = {
      usuario: usuario,
      criterio: criterio,
      alias: alias,
      barras: barras
    }

    let values = JSON.stringify(model);

    this.service.HTTP_Post("/sm/articulos", values).subscribe(
      (data: any) => {
        if (data.Table.length > 0) {
          this.source.localdata = data.Table;
          this.dataAdapter.dataBind();
          this.mySGrid.updatebounddata("cells");
          this.mySGrid.hideloadelement();
        }
        else {
          this.source.localdata = null;
          this.dataAdapter.dataBind();
          this.mySGrid.updatebounddata("cells");
          this.mySGrid.hideloadelement();
        }
      },
      (error: any) => {
        this.toaster.error(error.message);
      }
    );
  }

  New() {

  }

  rowSelect(event) {

  }

  gridReady() {

  }

  Delete() {
    if (confirm("¿Desea Borrar los Artículos Seleccionados?")) {

      var rows = this.getSelectedRows(this.mySGrid, 'idrow');
      var value = {
        ids: rows
      }
      var values = JSON.stringify(value);
      this.service.HTTP_Post('/artikeln_del', values).subscribe(
        (data: any) => {
          if (data.message = 'OK') {
            this.mySGrid.clearselection();
            this.searchDocuments();
          }
        },
        (error: any) => {
          this.toaster.error(error.message);
        });
    }
  }

  Add() {

    if (confirm("¿Desea Agregar el Artículo?")) {

      var values = JSON.stringify(this.newrow);

      this.service.HTTP_Post('/artikeln_add', values).subscribe(
        (data: any) => {
          if (data.message = 'OK') {
            this.searchDocuments();
          }
        },
        (error: any) => {
          console.log(error);
          this.toaster.error(JSON.stringify(error));
        }
      );
    }

  }

  getRows() {
    return this.getSelectedRows(this.mySGrid, 'idrow');
  }

  getAllDataRows() {
    return this.getSelectedRows(this.mySGrid, '');
  }

  clearSelection() {

    this.mySGrid.clearselection();
  }

  clear() {
    this.mySGrid.clear();
    this.searchmodel.Descripcion = "";
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

  cellBeginEditEvent(event: any) {
    //console.log(event);
  }

  getId(value: any) {

    var id = 0;
    this.unidades.forEach((element: any) => {
      if (element.descripcion == value) {
        id = element.unidad;
      }
    });

    return id;
  }

  getId2(value) {

    var id = 0;
    this.tipoprod.forEach(element => {
      if (element.descripcion == value) {
        id = element.unidad;
      }
    });

    return id;
  }

  getElementId(array, value) {

    var id = -1;
    array.forEach(element => {
      if (element.nombre == value) {
        id = element.idrow;
      }
    });

    return id;
  }

  Edit() {
    this.modalAdd.show();
  }

  GridOnRowSelect(event: any): void {
    console.log(event.args);

    let tipoCalculo = event.args.row.tipocalculo;
    //console.log(tipoCalculo);
    if (tipoCalculo > 6) {
      this.newrow.id = event.args.row.idrow;
      this.LoadParameters();
      this.hideParams = false;
    } else {
      this.hideParams = true;
    }
  };

  LoadParameters() {
    let url = '/artikel_parameters/' + this.newrow.id;
    this.service.HTTP_Get(url).subscribe(
      (data: any) => {
        var values = data.Table[0];
        if (values != null) {
          this.newrow.ancho = values.ancho;
          this.newrow.cantidad = values.cantidad;
          this.newrow.minimo = values.minimo;
        }
      },
      (error: any) => {
        this.toaster.error(error.message);
      }
    );
  }

  Parameters_Update() {

    let value = JSON.stringify(this.newrow);
    this.service.HTTP_Post('/artikel_parameters', value).subscribe(
      (data: any) => {
        if (data.message == "OK") {
          this.toaster.success("Actualizado elemento", "Actualización");
          console.log(data);
        }
      },
      (error: any) => {
        this.toaster.error(JSON.stringify(error));
      }
    );

    console.log(this.newrow);
  }

  GridOnRowUnselect(event: any): void {
    //console.log(event.args.rowindex);
  };

  cellEndEditEvent(event) {

    if (event.args.value != event.args.oldvalue) {


      this.params.table = "ARTICULOS";
      this.params.column = "idrow";
      this.params.id = event.args.row.idrow,
        this.params.field = event.args.datafield;
      this.params.value = event.args.value;

      if (event.args.datafield == "descunidad") {
        this.params.field = "unidad1";
        var value = this.getId(event.args.value);
        this.params.value = value.toString();
      }

      if (event.args.datafield == "tipoprod") {
        this.params.field = "tipoprod";
        var value = this.getId2(event.args.value);
        this.params.value = value.toString();
      }

      if (event.args.datafield == "descelemento") {
        this.params.field = "elemento";
        var value = this.getElementId(this.ElementsSource.localdata, event.args.value);
        this.params.value = value.toString();
      }

      if (event.args.datafield == "desctipocalculo") {
        this.params.field = "tipocalculo";
        var value = this.getElementId(this.TipoCalculoSource.localdata, event.args.value);
        this.params.value = value.toString();
      }


      var values = JSON.stringify(this.params);
      this.service.HTTP_Post('/update_table', values).subscribe(
        (data: any) => {
          if (data.message = 'OK') {

            this.toaster.success("Actualizado elemento", "Actualización");
            this.mySGrid.clearselection();
            //this.searchDocuments();
          }
        },
        (error: any) => {
          console.log(error);
          this.toaster.error(error.message, "Actualización");
        });
    }
  }


  createButtonsContainers(statusbar: any): void {
    let buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'overflow: hidden; position: relative; margin: 5px;';

    let addExportContainer = document.createElement('div');
    addExportContainer.id = 'exportButton';
    addExportContainer.style.cssText = 'float: left; margin-left: 5px;';
    buttonsContainer.appendChild(addExportContainer);

    let addDeleteContainer = document.createElement('div');
    addDeleteContainer.id = 'deleteButton';
    addDeleteContainer.style.cssText = 'float: left; margin-left: 5px;';
    buttonsContainer.appendChild(addDeleteContainer);

    statusbar[0].appendChild(buttonsContainer);

    /*
    let deleteButtonContainer = document.createElement('div');
    let reloadButtonContainer = document.createElement('div');
    let searchButtonContainer = document.createElement('div');
    addButtonContainer.id = 'addButton';
    deleteButtonContainer.id = 'deleteButton';
    reloadButtonContainer.id = 'reloadButton';
    searchButtonContainer.id = 'searchButton';
    addButtonContainer.style.cssText = 'float: left; margin-left: 5px;';
    deleteButtonContainer.style.cssText = 'float: left; margin-left: 5px;';
    reloadButtonContainer.style.cssText = 'float: left; margin-left: 5px;';
    searchButtonContainer.style.cssText = 'float: left; margin-left: 5px;';
    buttonsContainer.appendChild(addButtonContainer);
    buttonsContainer.appendChild(deleteButtonContainer);
    buttonsContainer.appendChild(reloadButtonContainer);
    buttonsContainer.appendChild(searchButtonContainer);
    statusbar[0].appendChild(buttonsContainer);
    */
  }
  Export() {
    var pathExportScript = this.service.Export();
    console.log(pathExportScript);
    this.mySGrid.exportdata("xls", "tarifas", true, undefined, false, pathExportScript);
  }

  createButtons(): void {

    let exportBtnOptions = {
      width: 100, height: 25, value: 'Export', textPosition: 'center'
    }

    let exportButton = jqwidgets.createInstance('#exportButton', 'jqxButton', exportBtnOptions);
    if (exportButton != null) {
      exportButton.addEventHandler('click', (event: any): void => {
        this.Export();
      });
    }

    let delBtnOptions = {
      width: 100, height: 25, value: 'Borrar', textPosition: 'center'
    }

    let delButton = jqwidgets.createInstance('#deleteButton', 'jqxButton', delBtnOptions);
    delButton.addEventHandler('click', (event: any): void => {
      this.Delete();
      //let datarow = generatedata(1);
      //this.mySGrid.addrow(null, datarow[0]);
    });

    /*
      let addButtonOptions = {
          width: 80, height: 25, value: 'Add',
          imgSrc: './../../../images/add.png',
          imgPosition: 'center', textPosition: 'center',
          textImageRelation: 'imageBeforeText'
      }
      let addButton = jqwidgets.createInstance('#addButton', 'jqxButton', addButtonOptions);
      let deleteButtonOptions = {
          width: 80, height: 25, value: 'Delete',
          imgSrc: './../../../images/close.png',
          imgPosition: 'center', textPosition: 'center',
          textImageRelation: 'imageBeforeText'
      }
      let deleteButton = jqwidgets.createInstance('#deleteButton', 'jqxButton', deleteButtonOptions);
      let reloadButtonOptions = {
          width: 80, height: 25, value: 'Reload',
          imgSrc: './../../../images/refresh.png',
          imgPosition: 'center', textPosition: 'center',
          textImageRelation: 'imageBeforeText'
      }
      let reloadButton = jqwidgets.createInstance('#reloadButton', 'jqxButton', reloadButtonOptions);
      let searchButtonOptions = {
          width: 80, height: 25, value: 'Find',
          imgSrc: './../../../images/search.png',
          imgPosition: 'center', textPosition: 'center',
          textImageRelation: 'imageBeforeText'
      }
      let searchButton = jqwidgets.createInstance('#searchButton', 'jqxButton', searchButtonOptions);
      // add new row.
      addButton.addEventHandler('click', (event: any): void => {
          let datarow = generatedata(1);
          this.mySGrid.addrow(null, datarow[0]);
      });
      // delete selected row.
      deleteButton.addEventHandler('click', (event: any): void => {
          let selectedrowindex = this.mySGrid.getselectedrowindex();
          let rowscount = this.mySGrid.getdatainformation().rowscount;
          let id = this.mySGrid.getrowid(selectedrowindex);
          this.mySGrid.deleterow(id);
      });
      // reload grid data.
      reloadButton.addEventHandler('click', (event: any): void => {
          //this.mySGrid.source(this.getAdapter());
      });
      // search for a record.
      searchButton.addEventHandler('click', (event: any): void => {
          //this.myWindow.open();
          //this.myWindow.move(60, 60);
      });
      */
  }

}
