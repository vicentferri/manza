import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { recargarGrid } from '../../../shared/grid-recarga';
import { destruirGrids } from '../../../shared/grid-destruir';

/* Columnas de la tabla de reglas que se guardan al editarlas (POST /artikel_fabric_cd_celda) */
const CAMPOS_EDITABLES = ['orden', 'sistema', 'atributo', 'valor', 'nombre_parametro1', 'nombre_parametro2',
  'consumo', 'articulos', 'operacion'];

@Component({
  selector: 'artikeln-fab-cd-v2',
  templateUrl: './artikeln-fab-cd-v2.component.html',
  styleUrls: ['./artikeln-fab-cd-v2.component.css'],
  providers: [HaruService]
})
export class ArtikelnFabCdV2Component implements OnInit, OnDestroy {

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
    modelo: '1'
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
    operacion: '-',
    consumo: '',
    tipo: 0,
    desde: 0,
    hasta: 0
  }

  /* Sistemas que ya tienen reglas (desplegable del alta; se puede escribir uno nuevo) */
  sistemas: string[] = [];
  guardando = false;

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
      { name: 'operacion', type: 'string' },
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
    /* Selección por casilla: un clic selecciona, un segundo clic (o escribir, F2, Enter) edita.
       Tab y Enter pasan a la casilla siguiente */
    editmode: 'selectedcell',
    groupable: true,
    selectionmode: 'singlecell',
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
        text: '', datafield: 'idrow', width: 40, editable: false, filterable: false, sortable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span title="Borrar la regla" style="display:block;text-align:center;padding: 6px;cursor:pointer;color:#c0392b"><i class="fa fa-trash"></i></span>';
        }
      },
      { text: 'Orden', datafield: 'orden', width: 50, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Sistema', datafield: 'sistema', width: 125, filtertype: 'textbox', editable: true },
      { text: 'Elemento', datafield: 'atributo', width: 150, filtertype: 'input', editable: true },
      { text: 'Atributo', datafield: 'valor', width: 125, filtertype: 'input', editable: true },
      { text: 'Parámetro 1', datafield: 'nombre_parametro1', width: 225, filtertype: 'input', editable: true, cellsalign: 'left' },
      { text: 'Op', datafield: 'operacion', width: 30, filtertype: 'textbox', editable: true, cellsalign: 'center' },
      { text: 'Parámetro 2', datafield: 'nombre_parametro2', width: 225, filtertype: 'input', editable: true, cellsalign: 'left' },
      { text: 'Consumo', datafield: 'consumo', width: 150, filtertype: 'input', editable: true, cellsalign: 'center' },
      { text: 'Ids', datafield: 'articulos', width: 100, filtertype: 'input', editable: true },
      { text: 'Articulos', datafield: 'detalle', filtertype: 'input', editable: false },
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
        text: '', datafield: 'idrow', width: 40, editable: false, cellsrenderer: function (row: any, columnfield: any, value: any, defaulthtml: any, columnproperties: any, rowdata: any) {
          return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
        }
      },
      { text: 'Nombre', datafield: 'name', width: 200, filtertype: 'input', editable: true, cellsalign: 'center' },
      { text: 'Tipo', datafield: 'type', width: 200, filtertype: 'input', editable: true },
      { text: 'Atributo', datafield: 'atributo', width: 200, filtertype: 'input', editable: true },
      { text: 'Posicion', datafield: 'pos', width: 75, filtertype: 'input', editable: true },
    ]

  };

  settingsDet: any = {
    width: "100%",
    height: 600,
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
        width: 45,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Orden",
        datafield: "orden",
        width: 60,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Pos",
        datafield: "idpedido",
        width: 75,
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
        filtertype: "input",
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
        filtertype: "input",
        editable: false,
        cellsalign: "center",
        cellsformat: "d2",
      },
      {
        text: "Cod_Sol",
        datafield: "cod_sol",
        width: 75,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Fam_Sol",
        datafield: "fam_sol",
        width: 75,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
      },
    ],
  };

  settings4: any = {
    width: '100%',
    height: 600,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '10000'],
    pagesize: 10000,
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
      { text: 'Pos', datafield: 'idpedido', width: 75, filtertype: 'input' },
      { text: 'Nombre', datafield: 'parametro', width: 150, filtertype: 'input' },
      { text: 'Valor', datafield: 'valor', filtertype: 'input' },
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

  /* jqxGrid deja elementos y listeners en el <body> y en document si no se destruye al salir */
  ngOnDestroy() {
    destruirGrids(this.myGrid, this.myGrid2, this.myGrid3, this.myGrid4);
  }

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.loadFormula();
  }

  performResize() {
    if (this.myGrid != null) {
      let height = 0.6 * this.getScreenHeight;
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
    var route = "/artikel_fabric_parameters";
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

  /* Carga las reglas. conservar: la rejilla se queda donde estaba; seleccionar: idrow de la regla que se
     selecciona y se deja a la vista (p. ej. la que se acaba de dar de alta) */
  loadDetails(opciones: { conservar?: boolean, seleccionar?: any } = {}) {
    var route = "/artikel_fabric_setup";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.sistemas = Array.from(new Set<string>((data.Table || [])
          .map(r => String(r.sistema || '').trim()).filter(s => s !== ''))).sort();
        /* La selección es por casilla: tras recargar, la casilla seleccionada apuntaría a otra regla */
        try { this.myGrid.clearselection(); } catch (e) { /* rejilla sin selección */ }
        recargarGrid(this.myGrid, this.source, this.dataAdapter, data.Table, opciones);
        if (opciones.seleccionar !== undefined && opciones.seleccionar !== null) {
          const indice = (this.myGrid.getboundrows() || []).findIndex(f => f && String(f.idrow) === String(opciones.seleccionar));
          if (indice >= 0) {
            this.myGrid.selectcell(indice, 'orden');
          }
        }
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  Recargar() {
    this.loadDetails({ conservar: true });
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
      this.DelItem(this.myGrid.getrowdata(args.rowindex));
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

  /* Borra la regla de la fila (confirmando cuál es) y deja la tabla donde estaba */
  DelItem(regla) {
    if (!regla) {
      return;
    }
    var descripcion = [regla.sistema, regla.orden, regla.atributo, regla.valor]
      .filter(v => v !== null && v !== undefined && String(v).trim() !== '').join(' · ');
    var condiciones = [regla.nombre_parametro1, regla.nombre_parametro2]
      .filter(v => v && String(v).trim() !== '').join('  ' + (regla.operacion || '-') + '  ');

    if (confirm("¿Desea borrar esta regla?\n\n" + descripcion + (condiciones ? "\n" + condiciones : ""))) {

      var values = JSON.stringify({ idrow: regla.idrow });
      var route = "/artikel_fabric_delete";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.toaster.success('Regla borrada', 'Reglas');
            this.loadDetails({ conservar: true });
          }
        },
        error => {
          this.toaster.error(this.errorMessage(error), 'Reglas');
        });
    }
  }

  errorMessage(error) {
    return (error && error.error && error.error.message) ? error.error.message : (error && error.message);
  }

  UpdateArticles() {
    var rows = this.search.getRows();
    this.model.articulos = rows.join(',');
  }

  /* Alta de una regla. Después se queda en la regla nueva y el formulario se vacía, salvo orden, sistema
     y elemento, para dar de alta seguidas las variantes de un mismo componente */
  Update() {
    if (!String(this.model.sistema || '').trim()) {
      this.toaster.warning('Indique el sistema', 'Reglas');
      return;
    }
    if (this.guardando) {
      return;
    }
    this.guardando = true;

    var values = JSON.stringify(this.model);
    this.service.HTTP_Post('/artikel_fabric_cd_regla', values).subscribe(
      data => {
        this.guardando = false;
        if (data.message == 'OK') {
          this.toaster.success('Regla añadida', 'Reglas');
          this.model.valor = '';
          this.model.articulos = '';
          this.model.nombre_parametro1 = '';
          this.model.nombre_parametro2 = '';
          this.model.operacion = '-';
          this.model.consumo = '';
          this.loadDetails({ seleccionar: data.regla.idrow });
        }
      },
      error => {
        this.guardando = false;
        this.toaster.error(this.errorMessage(error), 'Reglas');
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

  /* Guarda la casilla editada. No se recarga la tabla (eso es lo que hacía saltar al usuario de casilla y
     volver al principio): solo se actualiza esta fila con lo que devuelve el servidor. Si falla, la casilla
     vuelve a su valor anterior */
  cellEndEditEvent(event) {
    const args = event.args;
    const campo = args.datafield;
    if (CAMPOS_EDITABLES.indexOf(campo) === -1 || !args.row) {
      return;
    }
    const anterior = args.oldvalue;
    const nuevo = args.value;
    if (String(anterior === null || anterior === undefined ? '' : anterior) === String(nuevo === null || nuevo === undefined ? '' : nuevo)) {
      return;
    }

    const idrow = args.row.idrow;
    const values = JSON.stringify({ idrow: idrow, campo: campo, valor: nuevo });
    this.service.HTTP_Post('/artikel_fabric_cd_celda', values).subscribe(
      data => {
        if (data.message == 'OK' && data.regla) {
          /* El servidor normaliza algunos valores (operación en mayúsculas, artículos sin espacios) y
             devuelve la descripción de los artículos: solo se tocan las casillas que cambian */
          this.actualizarCasilla(idrow, campo, data.regla[campo]);
          if (campo == 'articulos') {
            this.actualizarCasilla(idrow, 'detalle', data.regla.detalle);
          }
          if (campo == 'sistema' && this.sistemas.indexOf(String(data.regla.sistema)) === -1) {
            this.sistemas = this.sistemas.concat([String(data.regla.sistema)]).sort();
          }
          this.toaster.success('Guardado', 'Reglas', { timeOut: 1200 });
        }
      },
      error => {
        this.actualizarCasilla(idrow, campo, anterior);
        this.toaster.error(this.errorMessage(error) || 'No se ha podido guardar', 'Reglas');
      });
  }

  /* Cambia una casilla de la fila de la regla idrow, si su valor es distinto (la fila puede haberse movido
     por un filtro u orden de la rejilla desde que se editó: se busca por idrow) */
  private actualizarCasilla(idrow, campo, valor) {
    const filas = this.myGrid.getboundrows() || [];
    const indice = filas.findIndex(f => f && f.idrow == idrow);
    if (indice < 0) {
      return;
    }
    const actual = filas[indice][campo];
    if (String(actual === null || actual === undefined ? '' : actual) !== String(valor === null || valor === undefined ? '' : valor)) {
      this.myGrid.setcellvalue(indice, campo, valor);
    }
  }

  cellEndEditEvent2(event) {

  }

  Parametros() {
    this.modalList.show();
  }


  VerHojaFabricacion() {
    let url = "/sm/detail/" + this.model2.idrow + "/2/0";
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
    let url = "/sm/parameters/" + this.model2.idrow + "/2/0";
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
    /* /sm/: la ruta está en sm_routes (sin /sm daba 404) */
    let url = "/sm/export_csv/" + this.model2.idrow + "/2";
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

      this.service.HTTP_Post('/artikel_fabric_simulate', values).subscribe(
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
        /* data.Table (antes data[0], que no existe: el selector se quedaba siempre en MODELO ANTIGUO).
           String: las opciones del select son '1' / '2' */
        if (data.Table && data.Table.length > 0) {
          this.config.modelo = String(data.Table[0].ModeloFabricacion);
        }
      },
      (error) => {
        this.toaster.error(error.message);
      });
  }

  Apply() {
    if (confirm("¿Quiere cambiar el modelo?")) {

      let values = JSON.stringify(this.config);

      this.service.HTTP_Post('/configuracion', values).subscribe(
        data => {
          this.loadConfig();
        },
        error => {
          this.toaster.error(error.message);
        });

    }
  }
}


