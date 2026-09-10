import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';
//import { identifierModuleUrl } from '@angular/compiler';

@Component({
  selector: 'app-artikeln-fab-fij',
  templateUrl: './artikeln-fab-fij.component.html',
  styleUrls: ['./artikeln-fab-fij.component.css'],
  providers: [HaruService]
})
export class ArtikelnFabFijComponent implements OnInit {

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

  productos_tipo: any = [
    { idrow: 1, descripcion: 'Enrollable' },
    { idrow: 2, descripcion: 'Panel Japonés' },
    { idrow: 3, descripcion: 'Panel Vertical' },
    { idrow: 4, descripcion: 'Compac' },
  ];

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

  model = {
    producto: 1,
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
    articles: ''
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'cod_solupyme', type: 'string' },
      { name: 'articulos', type: 'string' },
      { name: 'cantidad', type: 'number' },
      { name: 'consumo', type: 'number' },
      { name: 'formula', type: 'string' },
      { name: 'idformula', type: 'int' },
      { name: 'constante', type: 'number' }
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["input", "checkedlist", "number", "range", "bool"];

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
      { text: 'Código', datafield: 'cod_solupyme', width: 125, filtertype: 'input', editable: false },
      { text: 'Articulos', datafield: 'articulos', width: 800, filtertype: 'input', editable: false },
      {
        text: 'Cantidad', datafield: 'cantidad', width: 80, cellsalign: 'right', filtertype: this.filter[2], groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
      {
        text: 'Consumo', datafield: 'consumo', width: 80, cellsalign: 'right', filtertype: this.filter[2], groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },
      {
        text: 'Fórmula', datafield: 'formula', width: 200, filtertype: 'input', editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ActionAdapter,
            displayMember: 'formula', valueMember: 'idrow'
          })
        },
        createeverpresentrowwidget: (datafield, htmlElement, popup, addCallback) => {
          var inputTag = (<any>$("<div style='border: none;'></div>")).appendTo(htmlElement);
          inputTag.jqxDropDownList({
            popupZIndex: 999999, placeHolder: "Action:", source: this.ActionAdapter.records,
            displayMember: 'formula', valueMember: 'idrow', width: '100%', height: 30, dropDownWidth: 130
          })
        },
        geteverpresentrowwidgetvalue: (datafield, htmlElement) => {
          var selectedItem = htmlElement.jqxDropDownList('getSelectedItem');
          console.log(selectedItem);
          if (!selectedItem) {
            return '';
          } else {
            return selectedItem.value;
          }
        }
      },
      {
        text: 'Constante', datafield: 'constante', width: 80, cellsalign: 'right', filtertype: this.filter[2], groupable: false, pinned: false, editable: true,
        columntype: 'numberinput', createeditor: this.decimalValueCantidad, cellsformat: 'd2'
      },

    ]

  };

  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef); 
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
  }

  ngOnInit() {
    this.loadFormula();
    this.model.campo1_show = false;
    this.model.campo2_show = false;
    this.ChangeTipo(1);
  }

  loadFormula() {
    this.service.HTTP_Get('/artikel_formulas').subscribe(
      data => {
        this.UnidadesSource.localdata = data.Table;
        this.formulas = data.Table;
      },
      error => {
      }
    );
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

          this.campos1_tipo.push({ idrow: id, descripcion: descripcion });
          this.model.campo1_show = true;
        });
        this.model.campo1_value = '-1';
      },
      error => {

      });
  }



  loadDetails() {
    this.details_tipo = [];

    var tipo = this.model.tipo;
    var producto = this.model.producto;
    var route = "/artikel_fabric_fix/" + tipo + "/" + producto;
    console.log(route);
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata();

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
    if (args.datafield == "idrow") {
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
      var route = "/artikel_assign_delete_fix";
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

    var values = JSON.stringify(this.model);
    var route = "/artikel_assign_fix/";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.loadDetails();
          this.toaster.success('Agregados los Artículos', 'Articulos Fijos');
        }
      },
      error => {

      });

  }

  ChangeProducto(producto) {

    if (producto == 1) {
      this.loadCampo1('/sm/accionamientos');
    }

    if (producto == 2) {
      this.campos1_tipo = [];
      this.campos1_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
      this.campos1_tipo.push({ idrow: 1000, descripcion: 'Tejido' });
      this.campos1_tipo.push({ idrow: 1001, descripcion: 'Mecanismo' });
    }

    if (producto == 3) {
      this.campos1_tipo = [];
      this.campos1_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
      this.campos1_tipo.push({ idrow: 3000, descripcion: '89mm Solo Tejido' });
      this.campos1_tipo.push({ idrow: 3001, descripcion: '127mm Solo Tejido' });
      this.campos1_tipo.push({ idrow: 3002, descripcion: '89mm Solo Riel' });
      this.campos1_tipo.push({ idrow: 3003, descripcion: '127mm Solo Riel' });
      this.campos1_tipo.push({ idrow: 3004, descripcion: '89mm Riel y Tejido' });
      this.campos1_tipo.push({ idrow: 3005, descripcion: '127mm Riel y Tejido' });
    }

    if (producto == 4) {
      this.loadCampo1('/sm/accionamientos');
    }

  }


  ChangeTipo(value) {

    this.model.tipo = value;
    this.model.campo1_show = false;
    this.model.campo2_show = false;


    this.model.campo1 = "Accionamientos";
    this.model.campo2 = "Colores";
    this.model.tipo_value = "Accionamientos";
    this.loadCampo1('/sm/accionamientos');


  }

  Open() {
    this.modalAdd.show();
  }

  ChangeValue1(value) {

    this.model.tipo = value;

    this.loadDetails();

    this.campos1_tipo.forEach(element => {
      if (value == element.idrow) {
        this.model.campo1_value_descripcion = element.descripcion;
      }
    });


  }


  cellBeginEditEvent(event) {
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



    if (event.args.datafield == "cantidad" ||
      event.args.datafield == "constante" ||
      event.args.datafield == "formula" ||
      event.args.datafield == "consumo") {

      this.params.table = "sol_articulos_fabricacion_fijos";
      this.params.column = "idrow";
      this.params.id = event.args.row.idrow,
        this.params.field = event.args.datafield;
      this.params.value = event.args.value;

      if (event.args.datafield == "formula") {
        this.params.field = "formula";

        var value = this.getId(event.args.value);

        this.params.value = value.toString();
      }



      var values = JSON.stringify(this.params);
      this.service.HTTP_Post('/update_table', values).subscribe(
        data => {
          console.log(data);
          if (data.message === "OK") {
            this.toaster.success('Actualizado la Cantidad', 'Articulos Fijos');
          }
        },
        error => {
          console.log(error);
        }
      );
    }


  }

}

