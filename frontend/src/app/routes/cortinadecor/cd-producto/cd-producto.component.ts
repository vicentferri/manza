import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';



@Component({
  selector: 'app-cd-producto',
  templateUrl: './cd-producto.component.html',
  styleUrls: ['./cd-producto.component.css'],
  providers: [HaruService]
})
export class CdProductoComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('gridReference2', { static: false }) myGrid2!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalAdd2', { static: false }) modalAdd2!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  params = {
    id: 0,
    table: '',
    column: '',
    field: '',
    value: ''
  }

  model = {
    id: 0,
    idrow: 0,
    color: '',
    op: 1
  }

  tejidomodel = {
    nombre: '',
    producto: -1,
    tejido: -1
  }

  modelNumber = "0";
  modelColorNumber = "0";
  selectedItem: { name?: string;[key: string]: any } | null = null;
  selectedID = -1;

  /*
  */
  productos = [{ id: 1, name: 'Enrollables' },
  { id: 2, name: 'Paneles Japoneses' },
  { id: 3, name: 'Paneles Verticales' },
  { id: 5, name: 'Enrollables Impresión' },
  { id: 7, name: 'Menorca sin Cordón' },
  { id: 0, name: 'No Asignado' }
  ];

  tejidos: any[] = [];
  colores: any[] = [];


  ProductosSource = {
    datatype: "array",
    datafields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' }
    ],
    localdata: this.productos
  }

  TejidosSource: { datatype: string; datafields: { name: string; type: string; }[]; localdata: any[] | null } = {
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  }

  ColoresSource: { type: string; datatype: string; datafields: { name: string; type: string; }[]; localdata: any[] | null } = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  }

  ProductosAdapter = new $.jqx.dataAdapter(this.ProductosSource, { autoBind: true });
  TejidosAdapter = new $.jqx.dataAdapter(this.TejidosSource, { contentType: 'application/json; charset=utf-8', autoBind: true });
  ColoresAdapter = new $.jqx.dataAdapter(this.ColoresSource, { contentType: 'application/json; charset=utf-8', autoBind: true });

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: '_producto', type: 'number' },
      { name: '_tejido', type: 'number' },
      { name: 'seccion', type: 'string' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'id', type: 'number' },
      { name: 'color', type: 'string' },
      { name: '_color', type: 'int' },
      { name: 'idcolor', type: 'int' },
      { name: 'descripcionc', type: 'string' },
      { name: 'articulos', type: 'string' },
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["input", "checkedlist", "number", "range", "bool"];

  settings: any = {
    width: '99%',
    height: '100%',
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['25', '50', '100'],
    pagesize: 25,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: false,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter,
    columns: [
      {
        text: '', datafield: 'id', width: 30, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:30;padding: 8px;cursor:hand"><i class="fa fa-plus mt-2"></i></span>';
        }
      },
      { text: 'Nombre', datafield: 'name', width: 300, filtertype: 'input', editable: true },
      {
        text: 'Producto', datafield: 'seccion', width: 150, filtertype: 'input', editable: true,

        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ProductosAdapter,
            displayMember: 'name', valueMember: 'id'
          })
        }
        ,
        createeverpresentrowwidget: (datafield, htmlElement, popup, addCallback) => {
          var inputTag = (<any>$("<div style='border: none;'></div>")).appendTo(htmlElement);
          inputTag.jqxDropDownList({
            popupZIndex: 999999, placeHolder: "Action:", source: this.ProductosAdapter.records,
            displayMember: 'name', valueMember: 'seccion', width: '100%', height: 30, dropDownWidth: 130
          })
        },
        geteverpresentrowwidgetvalue: (datafield, htmlElement) => {
          var selectedItem = htmlElement.jqxDropDownList('getSelectedItem');
          if (!selectedItem) {
            return '';
          } else {
            return selectedItem.value;
          }
        }
      },
      {
        text: 'Tejido', datafield: 'descripcion', filtertype: 'input', editable: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.TejidosAdapter,
            displayMember: 'descripcion', valueMember: '_tejido'
          })
        },
        createeverpresentrowwidget: (datafield, htmlElement, popup, addCallback) => {
          var inputTag = (<any>$("<div style='border: none;'></div>")).appendTo(htmlElement);
          inputTag.jqxDropDownList({
            popupZIndex: 999999, placeHolder: "Action:", source: this.ProductosAdapter.records,
            displayMember: 'descripcion', valueMember: '_tejido', width: '100%', height: 30, dropDownWidth: 130
          })
        },
        geteverpresentrowwidgetvalue: (datafield, htmlElement) => {
          var selectedItem = htmlElement.jqxDropDownList('getSelectedItem');
          if (!selectedItem) {
            return '';
          } else {
            return selectedItem.value;
          }
        }
      }

    ]

  };

  settings2: any = {
    width: '100%',
    height: '100%',
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
    groupable: false,
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

      { text: 'Color', datafield: 'color', width: 300, filtertype: 'input', editable: true },
      {
        text: 'Color SM', datafield: 'descripcionc', width: 100, filtertype: 'input', editable: true, hidden: true,
        columntype: 'dropdownlist',
        createeditor: (row, value, editor) => {
          editor.jqxDropDownList({
            source: this.ColoresAdapter,
            displayMember: 'descripcion', valueMember: 'idrow'
          })
        },
        createeverpresentrowwidget: (datafield, htmlElement, popup, addCallback) => {
          var inputTag = (<any>$("<div style='border: none;'></div>")).appendTo(htmlElement);
          inputTag.jqxDropDownList({
            popupZIndex: 999999, placeHolder: "Action:", source: this.ProductosAdapter.records,
            displayMember: 'descripcion', valueMember: 'color', width: '100%', height: 30, dropDownWidth: 130
          })
        },
        geteverpresentrowwidgetvalue: (datafield, htmlElement) => {
          var selectedItem = htmlElement.jqxDropDownList('getSelectedItem');
          if (!selectedItem) {
            return '';
          } else {
            return selectedItem.value;
          }
        }
      },
      { text: 'Articulos', datafield: 'articulos', width: 400, filtertype: 'input', editable: false },
      {
        text: '', datafield: 'del', width: 40, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
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
    this.myGrid2.createComponent(this.settings2);
  }

  ngOnInit() {
    this.LoadProducte();
    this.LoadTejidos();
  }

  SaveLine(item) {
    const id = item.id;
    const producto = item._producto;
    const tejido = item._tejido;

    const url = '/sm/cd_model_productos_assign/' + id + '/' + producto + '/' + tejido;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.LoadProducte();
      },
      error => {
        this.toaster.error("Error al guardar el producto", "Error");
      });
  }

  LoadTejidos() {
    this.service.HTTP_Get('/sm/tejidos_cliente/2').subscribe(
      data => {
        this.tejidos = data.Table;
        this.tejidos.push({ idrow: -1, descripcion: "No Tiene Tejido", descCliente: "No Tiene Tejido" });
        this.TejidosSource.localdata = this.tejidos;
        this.TejidosAdapter.dataBind();

      },
      error => {
        this.toaster.error("Error al cargar los tejidos", "Error");
      });
  }

  LoadProducte() {
    this.service.HTTP_Get('/sm/cd_model_productos').subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata("cells");
        this.modelNumber = (this.myGrid.getdatainformation().rowscount).toString();
        //console.log(this.myGrid.getdatainformation());
      },
      error => {

      });
  }

  LoadProductosColores(item) {
    var url = '/sm/cd_model_productos_colores/' + item.id;
    this.service.HTTP_Get(url).subscribe(
      data => {
        console.log(data.Table);
        this.source2.localdata = data.Table;
        this.dataAdapter2.dataBind();
        this.myGrid2.updatebounddata("cells");
        this.modelColorNumber = (this.myGrid2.getdatainformation().rowscount).toString();
      },
      error => {
        this.toaster.error("Error al cargar los colores", "Error");
      }
    );
  }

  LoadColors(item) {
    var tejido = item._tejido
    var url = "/sm/colores_tejidos_atributos_clientes/2/" + tejido;
    this.service.HTTP_Get(url).subscribe(
      data => {
        console.log(data.Table);
        this.colores = data.Table;
        this.colores.push({ idrow: -1, descripcion: 'No Asignado' });
        this.ColoresSource.localdata = this.colores;
        this.ColoresAdapter.dataBind();
      },
      error => {
        this.toaster.error("Error al cargar los colores", "Error");
      }
    );
  }

  getName() {
    if (this.selectedItem != null) {
      return this.selectedItem.name;
    } else {
      return "";
    }
  }

  Row(item) {
    if (item.id == this.selectedItem) {
      return "selectedItem";
    } else {
      return "";
    }
  }

  Select(item) {
    this.selectedItem = item;
    this.LoadProductosColores(item);
    this.LoadColors(item);
  }

  SaveColor(item) {

    const id = item.id;
    const color = item._color;
    const url = '/sm/cd_model_colores_assign/' + id + '/' + color;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.LoadProductosColores(this.selectedItem);
      },
      error => {
        this.toaster.error("Error al guardar el color", "Error");
      });
  }

  Cellclick(event) {
    this.selectedItem = event.args.row.bounddata;
    this.model.idrow = this.selectedItem ? this.selectedItem['id'] : 0;
    this.Select(this.selectedItem);
  }

  cellBeginEditEvent(event) {

  }

  cellEndEditEvent(event) {

    if (event.args.value != event.args.oldvalue) {

      if (event.args.datafield == "name") {
        this.params.table = "SOL_CORTINADECOR_LINES_MODEL";
        this.params.column = "id";
        this.params.id = event.args.row.id;
        this.params.field = "name";
        this.params.value = event.args.value;
      }

      if (event.args.datafield == "seccion") {
        this.params.table = "SOL_CORTINADECOR_LINES_MODEL";
        this.params.column = "id";
        this.params.id = event.args.row.id;
        this.params.field = "_producto";
        this.params.value = this.getTipo(event.args.value).toString();
      }

      if (event.args.datafield == "descripcion") {
        this.params.table = "SOL_CORTINADECOR_LINES_MODEL";
        this.params.column = "id";
        this.params.id = event.args.row.id;
        this.params.field = "_tejido";
        this.params.value = this.getTejidos(event.args.value).toString();
      }

      if (event.args.datafield == "seccion"
        || event.args.datafield == "descripcion"
        || event.args.datafield == "name") {
        var values = JSON.stringify(this.params);
        this.service.HTTP_Post('/update_table', values).subscribe(
          data => {
            if (data.message = 'OK') {
              this.LoadProducte();
            }
          },
          error => {
            this.toaster.error("Error al guardar el producto", "Error");
          });
      }
    }

  }


  Cellclick2(event) {

    this.selectedID = event.args.row.bounddata.id;

    if (event.args.datafield == "del") {
      this.model.id = this.selectedID;
      this.DeleteColor();
    }

  }

  cellBeginEditEvent2(event) {

  }

  cellEndEditEvent2(event) {

    if (event.args.datafield == "color") {
      this.params.table = "SOL_CORTINADECOR_LINES_COLORES_MODEL";
      this.params.column = "id";
      this.params.id = event.args.row.id;
      this.params.field = "color";
      this.params.value = event.args.value;

      var values = JSON.stringify(this.params);
      this.service.HTTP_Post('/update_table', values).subscribe(
        data => {
          if (data.message = 'OK') {
            this.toaster.success("Actualizado color", "Actualizar");
            this.Select(this.selectedItem);
          }
        },
        error => {
          this.toaster.error("Error al guardar el color", "Error");
        });

    }
    else {
      this.UpdateColor(event);
    }
  }

  Open() {
    this.modalAdd.show();
  }

  Open2() {
    this.modalAdd2.show();
  }

  getIdColor(value) {
    var selectedColor = -1
    this.colores.forEach(element => {
      if (element.descripcion == value) {
        selectedColor = element.idrow;
      }
    });
    return selectedColor;
  }

  getTipo(value) {
    var selected = -1
    this.productos.forEach(element => {
      if (element.name == value) {
        selected = element.id;
      }
    });
    return selected;
  }

  getTejidos(value) {
    var selected = -1
    this.tejidos.forEach(element => {
      if (element.descripcion == value) {
        selected = element.idrow;
      }
    });
    return selected;
  }

  UpdateColor(event) {

    var rows = this.search.getRows();
    var value = event.args.value;
    var idValue = this.getIdColor(value);
    var id = event.args.row.id;

    this.params.table = "SOL_CORTINADECOR_LINES_COLORES_MODEL";
    this.params.column = "id";
    this.params.id = id;
    this.params.field = "_color";
    this.params.value = idValue.toString();

    var values = JSON.stringify(this.params);
    this.service.HTTP_Post('/update_table', values).subscribe(
      data => {
        if (data.message = 'OK') {
          this.modalAdd.hide();
          this.search.clearSelection();
          //this.search.clear();
          this.myGrid2.clearselection();
          this.Select(this.selectedItem);
        }
      },
      error => {
        this.toaster.error("Error al guardar el color", "Error");
      });

  }

  Update() {

    var rows = this.search.getRows();
    var articles = rows.join(',');

    this.params.table = "SOL_CORTINADECOR_LINES_COLORES_MODEL";
    this.params.column = "id";
    this.params.id = this.selectedID;
    this.params.field = "articulos";
    this.params.value = articles;

    var values = JSON.stringify(this.params);
    this.service.HTTP_Post('/update_table', values).subscribe(
      data => {
        if (data.message = 'OK') {
          this.modalAdd.hide();
          this.search.clearSelection();
          this.myGrid2.clearselection();
          this.Select(this.selectedItem);
        }
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  Add() {

    let success = 1;

    if (this.model.color == "") {
      success = 0;
      alert("Debe Indicar el nombre del color");
    }

    this.model.id = 0;

    console.log(this.model);

    if (success == 1 && confirm("¿Desea agregar el color al tejido seleccionado?")) {



      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/sm/cd_model_productos_colores", values).subscribe(
        data => {
          this.Select(this.selectedItem);
          if (data.message = 'OK') {
            this.model.color = "";
          }
        },
        error => {
          this.toaster.error(error.message);
        }

      );
    }
  }

  DeleteColor() {
    if (confirm("¿Desea borrar el color seleccionado?")) {

      this.model.op = 0;
      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/sm/cd_model_productos_colores", values).subscribe(
        data => {
          this.Select(this.selectedItem);
          if (data.message = 'OK') {
            this.model.color = "";
          }
        },
        error => {
          this.toaster.error(error.message);
        }

      );
    }
  }

  AddTejido() {

    if (confirm("¿Desea agregar nuevo tejido al modelo?")) {

      let url = "/sm/cd_model_productos_create";
      url += "/" + this.tejidomodel.nombre;
      url += "/" + this.tejidomodel.producto;
      url += "/" + this.tejidomodel.tejido;

      this.service.HTTP_Get(url).subscribe(
        data => {
          this.modalAdd2.hide();
          this.toaster.success("Operacion Realizada");
          this.LoadProducte();

        },
        error => {
          this.toaster.error(error.message);
        }
      );

    }
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

  DeleteTejido() {
    let arrayData = this.getSelectedRows(this.myGrid, "id");
    let len = arrayData.length;
    if (len == 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len >= 1) {
      if (confirm("¿Desea eliminar los tejidos seleccionados?")) {
        let url = "/sm/cd_model_productos_delete";
        let model = {
          ids: arrayData.join(";")
        }
        let values = JSON.stringify(model);

        this.service.HTTP_Post(url, values).subscribe(
          data => {
            this.toaster.success("Operacion Realizada");
            this.LoadProducte();
          },
          error => {
            this.toaster.error(error.message);
          }
        );

      }
    }
  }


}
