import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import {
  Condicion, Consumo, ErroresRegla, OPERADORES_CONDICION, OPERADORES_CONSUMO,
  buildCondicion, buildConsumo, condicionVacia, consumoVacio, operandoValido, parseCondicion, parseConsumo,
  validarCondicion, validarConsumo, validarRegla
} from './fabricacion-reglas.util';
import * as XLSX from 'xlsx';

/*
 * Configuración de la fabricación por reglas (motor v3). Hoy solo el sistema HONEYCOMB.
 * Sistemas:   SOL_FABRICACION_SISTEMAS
 * Reglas:     SOL_ARTICULOS_FABRICACION_RELACION_V2 (sistema + cliente; sin cliente = todos)
 * Parámetros: SOL_FABRICACION_PARAMETROS (por sistema): COLUMNA, FORMULA, BUSQUEDA, TABLA
 * Tablas:     SOL_FABRICACION_TABLAS / _VALORES (por sistema; p. ej. alto -> pliegues)
 */

interface ArticuloRegla {
  idrow: any;           /* id del artículo, o @PARAMETRO si el artículo sale del pedido */
  dinamico?: boolean;
  cod_sol: string;
  descripcion: string;
  unidad: number;
  descUnidad: string;
  consumo: Consumo;
}

const TIPOS_PARAMETRO = {
  COLUMNA: 'Dato del pedido',
  FORMULA: 'Fórmula',
  BUSQUEDA: 'Búsqueda',
  TABLA: 'Tabla de valores'
};

interface ColumnaOcultable {
  nombre: string;
  campos: string[];   /* columnas del grid que se ocultan juntas (cada condición con su Op) */
}

const CLAVE_COLUMNAS_OCULTAS = 'fab_v3_columnas_ocultas';

interface ColumnaAjustable {
  campo: string;
  codigo?: boolean;   /* se pinta con letra monoespaciada */
  extra?: number;     /* ancho añadido por etiquetas o iconos */
  texto?: (fila: any) => string;
}

const FUENTE_CODIGO = "12px Consolas, 'Courier New', monospace";
const RELLENO_CELDA = 16 + 10;   /* padding de .fab-cell + margen */
const RELLENO_CABECERA = 34;     /* iconos de orden y filtro */
const ANCHO_MAXIMO = 420;

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
  @ViewChild('modalRegla', { static: false }) modalRegla!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  public getScreenWidth: any;
  public getScreenHeight: any;

  operadoresCondicion = OPERADORES_CONDICION;
  operadoresConsumo = OPERADORES_CONSUMO;

  sistemas: any = [];
  sistema = '';
  clientes: any = [];
  columnas: any = [];
  parametros: any = [];
  nombresParametros: string[] = [];

  /* Columnas de la tabla de reglas que se pueden ocultar (solo visualmente) */
  columnasOcultables: ColumnaOcultable[] = [
    { nombre: 'Orden', campos: ['orden'] },
    { nombre: 'Sistema', campos: ['sistema'] },
    { nombre: 'Cliente', campos: ['cliente_nombre'] },
    { nombre: 'Elemento', campos: ['atributo'] },
    { nombre: 'Condición 1', campos: ['nombre_parametro1'] },
    { nombre: 'Condición 2', campos: ['operacion', 'nombre_parametro2'] },
    { nombre: 'Condición 3', campos: ['operacion2', 'nombre_parametro3'] },
    { nombre: 'Condición 4', campos: ['operacion3', 'nombre_parametro4'] },
    { nombre: 'Consumo', campos: ['consumo'] },
    { nombre: 'Artículos', campos: ['detalle'] },
  ];
  columnasOcultas: string[] = this.leerColumnasOcultas();
  menuColumnas = false;

  /* Valores posibles de los parámetros con catálogo: { '@COLOR_PERFIL_ID': [{valor, texto}] } */
  valoresParametro: { [nombre: string]: { valor: string, texto: string }[] } = {};

  /* Errores de validación por regla (idrow) */
  erroresReglas: { [idrow: number]: ErroresRegla } = {};
  reglasConErrores = 0;

  modelParam = {
    name: '',
    tipo: 'COLUMNA',
    origen: '',
    orden: 0,
    busqueda: '',
    tabla: ''
  }
  erroresParametro: string[] = [];
  tiposParametro = TIPOS_PARAMETRO;

  /* Búsquedas (dadas de alta por script) y tablas de valores del sistema */
  busquedas: any = [];
  tablas: any = [];

  /* ---------------- PESTAÑA TABLAS ---------------- */
  tablaSel = '';
  tablaEdit = this.tablaVacia();
  guardandoTabla = false;

  /* ---------------- VENTANA DE REGLA ---------------- */
  regla = this.reglaVacia();
  tituloRegla = '';
  consumoComun = true;
  consumoTodos: Consumo = consumoVacio();
  guardandoRegla = false;

  /* ---------------- SIMULACION ---------------- */
  model2 = {
    idrow: -1
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'sistema', type: 'string' },
      { name: 'cliente', type: 'number' },
      { name: 'cliente_nombre', type: 'string' },
      { name: 'orden', type: 'number' },
      { name: 'atributo', type: 'string' },
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
      { name: 'idrow', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'tipo', type: 'string' },
      { name: 'origen', type: 'string' },
      { name: 'orden', type: 'number' },
      { name: 'busqueda', type: 'string' },
      { name: 'tabla', type: 'string' },
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
      { name: "descUnidad", type: "string" },
      { name: "consumo", type: "number" },
      { name: "cod_sol", type: "string" },
      { name: "fam_sol", type: "string" },
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

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapterDet = new $.jqx.dataAdapter(this.sourceDet, { contentType: "application/json; charset=utf-8" });
  dataAdapter4 = new $.jqx.dataAdapter(this.source4, { contentType: 'application/json; charset=utf-8' });

  eraser = function () {
    return '<span style="width:40;padding: 8px;cursor:hand"><i class="fa fa-eraser mt-2"></i></span>';
  };

  /* ---------------- ESTILO DE CELDAS ---------------- */

  escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  celda(contenido: string, clase: string = '', titulo: string = '') {
    return '<div class="fab-cell ' + clase + '" title="' + this.escapeHtml(titulo) + '">' + contenido + '</div>';
  }

  /* jqxGrid pasa la fila como sexto argumento de cellsrenderer */
  erroresCampo(fila: any, campo: string): string[] {
    let errores = fila ? this.erroresReglas[fila.idrow] : null;
    return errores && errores.campos[campo] ? errores.campos[campo] : [];
  }

  renderTexto = (row, field, value) => this.celda(this.escapeHtml(value), '', value);

  renderCentro = (row, field, value) => this.celda(this.escapeHtml(value), 'fab-center', value);

  renderCodigo = (row, field, value, html?, props?, fila?) => {
    let errores = this.erroresCampo(fila, field);
    if (errores.length > 0) {
      return this.celda('<i class="fa fa-exclamation-circle"></i>&nbsp;' + this.escapeHtml(value || '(vacío)'), 'fab-code fab-error', errores.join('\n'));
    }
    return this.celda(this.escapeHtml(value), 'fab-code', value);
  };

  renderArticulos = (row, field, value, html?, props?, fila?) => {
    let errores = this.erroresCampo(fila, 'articulos');
    if (errores.length > 0) {
      return this.celda('<i class="fa fa-exclamation-circle"></i>&nbsp;' + this.escapeHtml(value || '(sin artículos)'), 'fab-error', errores.join('\n'));
    }
    return this.celda(this.escapeHtml(value), '', value);
  };

  renderOperador = (row, field, value) => {
    let op = String(value || '').toUpperCase();
    if (op == 'Y') return this.celda('<span class="fab-badge fab-op-y">Y</span>', 'fab-center', 'Y: se tienen que cumplir las dos');
    if (op == 'O') return this.celda('<span class="fab-badge fab-op-o">O</span>', 'fab-center', 'O: basta con una');
    return this.celda('<span class="fab-op-none">–</span>', 'fab-center', '- : igual que Y');
  };

  renderCliente = (row, field, value) => {
    if (!value || value == 'Todos') return this.celda('Todos', 'fab-todos', 'Regla general');
    return this.celda('<span class="fab-badge fab-cliente">' + this.escapeHtml(value) + '</span>', '', value);
  };

  renderAcciones = (row, field, value) => {
    return this.celda(
      '<i class="fa fa-pencil fab-accion" data-accion="editar" title="Editar"></i>' +
      '<i class="fa fa-copy fab-accion" data-accion="duplicar" title="Duplicar"></i>' +
      '<i class="fa fa-trash fab-accion fab-accion-borrar" data-accion="borrar" title="Borrar"></i>', 'fab-center');
  };

  renderEstado = (row, field, value) => {
    let errores = this.erroresReglas[value];
    if (!errores || errores.total == 0) {
      return this.celda('<i class="fa fa-check-circle fab-ok"></i>', 'fab-center', 'Regla correcta');
    }
    let lista = [];
    Object.keys(errores.campos).forEach(c => errores.campos[c].forEach(e => lista.push(e)));
    return this.celda('<i class="fa fa-exclamation-triangle fab-ko"></i>', 'fab-center', lista.join('\n'));
  };

  /* Origen de un parámetro: columna, fórmula, o "entrada → búsqueda / tabla" */
  textoOrigenParametro(p: any): string {
    if (!p) return '';
    if (p.tipo == 'BUSQUEDA') {
      let b = this.busquedas.find(x => x.busqueda == p.busqueda);
      return p.origen + ' → ' + (b ? b.descripcion : p.busqueda);
    }
    if (p.tipo == 'TABLA') {
      return p.origen + ' → tabla ' + p.tabla;
    }
    return p.origen;
  }

  renderOrigenParametro(fila: any) {
    let texto = this.textoOrigenParametro(fila);
    return this.celda(this.escapeHtml(texto), fila && fila.tipo == 'FORMULA' ? 'fab-code' : '', texto);
  }

  /* Simulación: en rojo las líneas sin artículo (SIN ARTÍCULO) o con consumo -1 (no se pudo calcular) */
  claseSimulacion = (row, field, value, fila) => {
    return fila && (fila.articulo === null || fila.articulo === '' || Number(fila.consumo) === -1) ? 'fab-sim-error' : '';
  };

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
    enabletooltips: false,
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
    rowsheight: 34,
    columnsheight: 38,
    source: this.dataAdapter,
    columns: [
      { text: '', datafield: 'acciones', width: 86, sortable: false, filterable: false, menu: false, cellsrenderer: this.renderAcciones },
      { text: '', datafield: 'idrow', width: 40, filterable: false, menu: false, cellsrenderer: this.renderEstado },
      { text: 'Orden', datafield: 'orden', width: 60, minwidth: 60, filtertype: 'textbox', cellsrenderer: this.renderCentro },
      { text: 'Sistema', datafield: 'sistema', width: 100, minwidth: 70, filtertype: 'textbox', cellsrenderer: this.renderTexto },
      /* Filtro de texto: con 'checkedlist' jqxGrid deja la fila de filtros a medias y falla al cambiar anchos */
      { text: 'Cliente', datafield: 'cliente_nombre', width: 120, minwidth: 120, filtertype: 'textbox', cellsrenderer: this.renderCliente },
      { text: 'Elemento', datafield: 'atributo', width: 120, minwidth: 80, filtertype: 'textbox', cellsrenderer: this.renderTexto },
      { text: 'Condición 1', datafield: 'nombre_parametro1', width: 180, minwidth: 100, filtertype: 'textbox', cellsrenderer: this.renderCodigo },
      { text: 'Op', datafield: 'operacion', width: 45, minwidth: 45, filtertype: 'textbox', cellsrenderer: this.renderOperador },
      { text: 'Condición 2', datafield: 'nombre_parametro2', width: 180, minwidth: 100, filtertype: 'textbox', cellsrenderer: this.renderCodigo },
      { text: 'Op', datafield: 'operacion2', width: 45, minwidth: 45, filtertype: 'textbox', cellsrenderer: this.renderOperador },
      { text: 'Condición 3', datafield: 'nombre_parametro3', width: 180, minwidth: 100, filtertype: 'textbox', cellsrenderer: this.renderCodigo },
      { text: 'Op', datafield: 'operacion3', width: 45, minwidth: 45, filtertype: 'textbox', cellsrenderer: this.renderOperador },
      { text: 'Condición 4', datafield: 'nombre_parametro4', width: 180, minwidth: 100, filtertype: 'textbox', cellsrenderer: this.renderCodigo },
      { text: 'Consumo', datafield: 'consumo', width: 150, minwidth: 90, filtertype: 'textbox', cellsrenderer: this.renderCodigo },
      { text: 'Artículos', datafield: 'detalle', minwidth: 250, filtertype: 'textbox', cellsrenderer: this.renderArticulos },
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
    editable: false,
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter2,
    columns: [
      { text: '', datafield: 'idrow', width: 40, cellsrenderer: this.eraser },
      { text: 'Nombre', datafield: 'name', width: 200, filtertype: 'textbox' },
      { text: 'Tipo', datafield: 'tipo', width: 130, filtertype: 'textbox', cellsrenderer: (row, field, value) => this.renderTexto(row, field, TIPOS_PARAMETRO[value] || value) },
      { text: 'Origen (columna, fórmula o parámetro de entrada)', datafield: 'origen', filtertype: 'textbox', cellsrenderer: (row, field, value, html?, props?, fila?) => this.renderOrigenParametro(fila) },
      { text: 'Orden', datafield: 'orden', width: 75, filtertype: 'textbox', cellsalign: 'center' },
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
    selectionmode: "singlerow",
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterDet,
    columns: [
      { text: "Pos", datafield: "idpedido", width: 50, filtertype: "textbox", cellclassname: this.claseSimulacion },
      { text: "Orden", datafield: "orden", width: 60, filtertype: "textbox", cellsalign: "center", cellclassname: this.claseSimulacion },
      { text: "Art", datafield: "articulo", width: 70, filtertype: "textbox", cellclassname: this.claseSimulacion },
      { text: "Descripción", datafield: "descripcion", width: 350, filtertype: "textbox", cellclassname: this.claseSimulacion },
      { text: "Cantidad", datafield: "cantidad", width: 70, filtertype: "textbox", cellsalign: "center", cellclassname: this.claseSimulacion },
      { text: "Unidad", datafield: "descUnidad", width: 70, filtertype: "textbox", cellsalign: "center", cellclassname: this.claseSimulacion },
      { text: "Consumo", datafield: "consumo", width: 80, filtertype: "textbox", cellsalign: "center", cellsformat: "d3", cellclassname: this.claseSimulacion },
      { text: "Cod_Sol", datafield: "cod_sol", width: 80, filtertype: "textbox", cellsalign: "center", cellclassname: this.claseSimulacion },
      { text: "Fam_Sol", datafield: "fam_sol", filtertype: "textbox", cellsalign: "center", cellclassname: this.claseSimulacion },
    ],
  };

  settings4: any = {
    width: '100%',
    height: 650,
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
    selectionmode: 'singlerow',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter4,
    columns: [
      { text: 'Pos', datafield: 'idpedido', width: 50, filtertype: 'textbox' },
      { text: 'Nombre', datafield: 'parametro', width: 150, filtertype: 'textbox' },
      { text: 'Valor', datafield: 'valor', filtertype: 'textbox' },
    ]
  };

  constructor(private service: HaruService,
    private toaster: ToastrService) {
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.myGrid2.createComponent(this.settings2);
    this.myGrid3.createComponent(this.settingsDet);
    this.myGrid4.createComponent(this.settings4);
    this.performResize();
    this.loadSistemas();
  }

  ngOnInit() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.loadClientes();
  }

  performResize() {
    if (this.myGrid != null) {
      let height = 0.7 * this.getScreenHeight;
      this.myGrid.height(height);
      this.myGrid2.height(height);
    }
  }

  /* ---------------- OCULTAR COLUMNAS ---------------- */

  leerColumnasOcultas(): string[] {
    try {
      let guardado = JSON.parse(localStorage.getItem(CLAVE_COLUMNAS_OCULTAS) || '[]');
      return Array.isArray(guardado) ? guardado : [];
    }
    catch (e) {
      return [];
    }
  }

  guardarColumnasOcultas() {
    try {
      localStorage.setItem(CLAVE_COLUMNAS_OCULTAS, JSON.stringify(this.columnasOcultas));
    }
    catch (e) { }
  }

  estaOculta(columna: ColumnaOcultable): boolean {
    return this.columnasOcultas.indexOf(columna.nombre) >= 0;
  }

  /* Se aplica al cargar datos o al mostrar la pestaña (ajustarColumnas). Antes de que jqxGrid haya
     pintado la tabla, hidecolumn falla: no debe cortar el arranque de la pantalla */
  aplicarColumnasOcultas() {
    try {
      this.columnasOcultables.forEach(c => {
        let oculta = this.estaOculta(c);
        c.campos.forEach(campo => oculta ? this.myGrid.hidecolumn(campo) : this.myGrid.showcolumn(campo));
      });
    }
    catch (e) { }
  }

  /* Solo cambia la vista: los valores de las reglas no se tocan */
  CambiarColumna(columna: ColumnaOcultable, visible: boolean) {
    this.columnasOcultas = this.columnasOcultas.filter(n => n != columna.nombre);
    if (!visible) {
      this.columnasOcultas.push(columna.nombre);
    }
    this.guardarColumnasOcultas();
    this.aplicarColumnasOcultas();
    this.ajustarColumnas();
  }

  MostrarTodas() {
    this.columnasOcultas = [];
    this.aplicarColumnasOcultas();
    this.guardarColumnasOcultas();
    this.ajustarColumnas();
  }

  /* El panel de columnas se cierra al pulsar fuera de él */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event) {
    if (this.menuColumnas && !(event.target && event.target.closest && event.target.closest('.fab-columnas'))) {
      this.menuColumnas = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.getScreenWidth = window.innerWidth;
    this.getScreenHeight = window.innerHeight;
    this.performResize();
  }

  errorMessage(error) {
    return (error.error && error.error.message) ? error.error.message : error.message;
  }

  /* ---------------- SISTEMA / CLIENTES ---------------- */

  loadSistemas() {
    this.service.HTTP_Get('/sm/fabricacion/sistemas').subscribe(
      data => {
        this.sistemas = data.Table;
        if (this.sistemas.length > 0) {
          this.sistema = this.sistemas[0].sistema;
          this.ChangeSistema();
        }
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  ChangeSistema() {
    this.loadColumnas();
    this.loadBusquedas();
    this.loadTablas();
    this.loadParameters();
    this.loadValoresParametros();
  }

  loadBusquedas() {
    this.service.HTTP_Get('/sm/fabricacion/busquedas' + this.querySistema()).subscribe(
      data => {
        this.busquedas = data.Table;
        this.myGrid2.refresh();
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  loadTablas(seleccionar: string = null) {
    this.service.HTTP_Get('/sm/fabricacion/tablas' + this.querySistema()).subscribe(
      data => {
        this.tablas = data.Table;
        let tabla = seleccionar || (this.tablas.some(t => t.tabla == this.tablaSel) ? this.tablaSel : (this.tablas.length > 0 ? this.tablas[0].tabla : ''));
        this.SeleccionarTabla(tabla);
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  loadValoresParametros() {
    this.service.HTTP_Get('/sm/fabricacion/parametros/valores' + this.querySistema()).subscribe(
      data => {
        let valores = {};
        data.Table.forEach(v => {
          let nombre = String(v.name).toUpperCase();
          (valores[nombre] = valores[nombre] || []).push({ valor: String(v.valor), texto: String(v.texto) });
        });
        this.valoresParametro = valores;
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  /* El valor de una condición se elige de una lista si el parámetro tiene catálogo y el operador es "igual a" */
  tieneValores(c: Condicion): boolean {
    return c.operador == '==' && !!this.valoresParametro[String(c.parametro).toUpperCase()];
  }

  /* Opciones de la lista; si la regla tiene un valor que ya no está en el catálogo, se añade para no perderlo */
  opcionesValor(c: Condicion): { valor: string, texto: string }[] {
    let lista = this.valoresParametro[String(c.parametro).toUpperCase()] || [];
    let actual = String(c.valor || '').trim();
    if (actual != '' && !lista.some(v => v.valor.toUpperCase() == actual.toUpperCase())) {
      return [{ valor: actual, texto: actual + ' (no está en el catálogo)' }].concat(lista);
    }
    return lista;
  }

  /* En los parámetros de id se muestra el número y su nombre: "1 · BLANCO RAL 9016" */
  etiquetaValor(v: { valor: string, texto: string }): string {
    return v.valor.toUpperCase() == v.texto.toUpperCase() ? v.texto : v.valor + ' · ' + v.texto;
  }

  trackValor(indice: number, v: { valor: string }) {
    return v.valor;
  }

  /* Al elegir otro parámetro, se ajusta el valor a como está escrito en el catálogo (o se vacía si no está) */
  CambiarParametroCondicion(c: Condicion) {
    if (this.tieneValores(c)) {
      let encontrado = this.valoresParametro[String(c.parametro).toUpperCase()]
        .find(v => v.valor.toUpperCase() == String(c.valor || '').trim().toUpperCase());
      c.valor = encontrado ? encontrado.valor : '';
    }
  }

  textoValor(parametro: string, valor: string): string {
    let lista = this.valoresParametro[String(parametro).toUpperCase()] || [];
    let encontrado = lista.find(v => v.valor.toUpperCase() == String(valor || '').trim().toUpperCase());
    return encontrado && encontrado.valor.toUpperCase() != encontrado.texto.toUpperCase() ? ' (' + encontrado.texto + ')' : '';
  }

  loadClientes() {
    this.service.HTTP_Get('/sm/fabricacion/clientes').subscribe(
      data => {
        this.clientes = data.Table;
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  querySistema() {
    return '?sistema=' + encodeURIComponent(this.sistema);
  }

  /* ---------------- PARAMETROS ---------------- */

  loadColumnas() {
    this.service.HTTP_Get('/sm/fabricacion/columnas' + this.querySistema()).subscribe(
      data => {
        this.columnas = data.Table;
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  /* Al cargar los parámetros se recargan las reglas: la validación depende de ellos */
  loadParameters() {
    this.service.HTTP_Get('/sm/fabricacion/parametros' + this.querySistema()).subscribe(
      data => {
        this.parametros = data.Table;
        this.nombresParametros = data.Table.map(p => p.name);
        this.source2.localdata = data.Table;
        this.dataAdapter2.dataBind();
        this.myGrid2.updatebounddata();
        this.loadDetails();
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  /* Parámetros calculados antes que el que se está editando (menor orden): los únicos que puede usar */
  parametrosAnteriores(): string[] {
    return this.parametros
      .filter(p => p.orden < this.modelParam.orden && p.name != String(this.modelParam.name).toUpperCase())
      .map(p => p.name);
  }

  validarParametro() {
    this.erroresParametro = [];
    let anteriores = this.parametrosAnteriores();
    if (this.modelParam.tipo == 'FORMULA') {
      this.erroresParametro = validarConsumo(this.modelParam.origen, anteriores);
      if (String(this.modelParam.origen || '').trim() == '') {
        this.erroresParametro.push('La fórmula no puede estar vacía');
      }
    }
    if (this.modelParam.tipo == 'BUSQUEDA' || this.modelParam.tipo == 'TABLA') {
      if (!this.modelParam.origen) {
        this.erroresParametro.push('Elija el parámetro de entrada');
      }
      else if (anteriores.indexOf(this.modelParam.origen) < 0) {
        this.erroresParametro.push('El parámetro de entrada tiene que tener un orden menor que ' + this.modelParam.orden);
      }
      if (this.modelParam.tipo == 'BUSQUEDA' && !this.modelParam.busqueda) {
        this.erroresParametro.push('Elija la búsqueda');
      }
      if (this.modelParam.tipo == 'TABLA' && !this.modelParam.tabla) {
        this.erroresParametro.push('Elija la tabla de valores');
      }
    }
    return this.erroresParametro.length == 0;
  }

  /* Al cambiar de tipo, el origen anterior (columna, fórmula o entrada) ya no sirve */
  CambiarTipoParametro() {
    this.erroresParametro = [];
    this.modelParam.origen = '';
  }

  SaveParameter() {
    if (!this.validarParametro()) {
      return;
    }
    let values = JSON.stringify(Object.assign({ sistema: this.sistema }, this.modelParam));
    this.service.HTTP_Post('/sm/fabricacion/parametros', values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.toaster.success('Guardado', 'Parámetros');
          this.loadParameters();
        }
      },
      error => {
        this.toaster.error(this.errorMessage(error), 'Parámetros');
      });
  }

  Cellclick2(event) {
    let args = event.args;
    let row = args.row.bounddata;
    if (args.datafield == 'idrow') {
      this.DelParameter(row.name);
    }
    else {
      this.modelParam = {
        name: row.name, tipo: row.tipo, origen: row.origen, orden: row.orden,
        busqueda: row.busqueda || '', tabla: row.tabla || ''
      };
      this.erroresParametro = [];
    }
  }

  DelParameter(name) {
    if (confirm("¿Desea borrar el parámetro " + name + "? Las reglas que lo usen dejarán de cumplirse.")) {
      let values = JSON.stringify({ sistema: this.sistema, name: name });
      this.service.HTTP_Post('/sm/fabricacion/parametros/delete', values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadParameters();
          }
        },
        error => {
          this.toaster.error(this.errorMessage(error));
        });
    }
  }

  /* ---------------- REGLAS: TABLA ---------------- */

  loadDetails() {
    this.service.HTTP_Get('/sm/fabricacion/reglas' + this.querySistema()).subscribe(
      data => {
        this.erroresReglas = {};
        this.reglasConErrores = 0;
        data.Table.forEach(r => {
          let errores = validarRegla(r, this.nombresParametros);
          this.erroresReglas[r.idrow] = errores;
          if (errores.total > 0) {
            this.reglasConErrores++;
          }
        });

        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata("cells");
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  Cellclick(event) {
    let args = event.args;
    if (args.datafield != 'acciones') {
      return;
    }
    let target = args.originalEvent ? args.originalEvent.target : null;
    let accion = target && target.getAttribute ? target.getAttribute('data-accion') : null;
    let fila = args.row.bounddata;

    if (accion == 'editar') this.EditarRegla(fila);
    if (accion == 'duplicar') this.DuplicarRegla(fila);
    if (accion == 'borrar') this.DelItem(fila.idrow);
  }

  Rowdoubleclick(event) {
    this.EditarRegla(event.args.row.bounddata);
  }

  DelItem(idrow) {
    if (confirm("¿Desea borrar la regla seleccionada?")) {
      let values = JSON.stringify({ idrow: idrow });
      this.service.HTTP_Post('/sm/fabricacion/reglas/delete', values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadDetails();
          }
        },
        error => {
          this.toaster.error(this.errorMessage(error));
        });
    }
  }

  /* ---------------- AJUSTE DE COLUMNAS AL CONTENIDO ----------------
     jqxGrid mide con su fuente por defecto y sin el relleno de las celdas propias
     (condiciones en monoespaciada, etiquetas), así que se queda corto. Aquí se mide
     con la fuente real de cada columna. */

  private lienzo: HTMLCanvasElement;

  medirTexto(texto: string, fuente: string): number {
    if (!this.lienzo) {
      this.lienzo = document.createElement('canvas');
    }
    let contexto = this.lienzo.getContext('2d');
    contexto.font = fuente;
    return contexto.measureText(String(texto || '')).width;
  }

  fuenteTabla(grid: jqxGridComponent, negrita: boolean): string {
    /* Celda de datos: la primera .jqx-grid-cell es de la cabecera o de la fila de filtros (12px, no 13px) */
    let celda = grid && grid.elementRef ? grid.elementRef.nativeElement.querySelector('[role=gridcell]') : null;
    let estilo = celda ? window.getComputedStyle(celda) : null;
    let tamano = estilo && estilo.fontSize ? estilo.fontSize : '13px';
    let familia = estilo && estilo.fontFamily ? estilo.fontFamily : 'sans-serif';
    return (negrita ? '600 ' : '') + tamano + ' ' + familia;
  }

  /* La columna indicada ocupa el espacio que queda libre (sin bajar de su mínimo) */
  rellenarColumna(grid: jqxGridComponent, campo: string, anchoContenido: number = 0): boolean {
    /* Columnas vivas del grid (grid.columns() del envoltorio devuelve la configuración, sin anchos reales) */
    let columnas: any[] = (grid as any).host.jqxGrid('columns').records || [];
    let anchoTabla = grid.elementRef.nativeElement.firstChild.clientWidth;
    let ocupado = 0;
    columnas.forEach(c => {
      if (c.datafield != campo && !c.hidden) {
        ocupado += Number(c.width) || 0;
      }
    });
    /* Durante la carga (columnas sin crear o tabla oculta) la medida no es fiable: se repite al mostrarla */
    if (columnas.length < 2 || ocupado == 0 || anchoTabla == 0) {
      return false;
    }
    let propiedades: any = grid.getcolumn(campo);
    let libre = anchoTabla - ocupado - 20;
    /* Si el contenido no cabe en el espacio libre, la columna mide lo que su contenido y la tabla se desplaza */
    grid.setcolumnproperty(campo, 'width', Math.ceil(Math.max(libre, anchoContenido, propiedades.minwidth || 100)));
    return true;
  }

  ajustarGrid(grid: jqxGridComponent, filas: any[], columnas: ColumnaAjustable[]) {
    if (!grid || !filas) {
      return;
    }
    let fuente = this.fuenteTabla(grid, false);
    let fuenteCabecera = this.fuenteTabla(grid, true);

    grid.beginupdate();
    columnas.forEach(col => {
      let propiedades: any = grid.getcolumn(col.campo);
      if (!propiedades) {
        return;
      }
      let ancho = this.medirTexto(propiedades.text, fuenteCabecera) + RELLENO_CABECERA;
      filas.forEach(fila => {
        let texto = col.texto ? col.texto(fila) : fila[col.campo];
        let medida = this.medirTexto(texto, col.codigo ? FUENTE_CODIGO : fuente) + RELLENO_CELDA + (col.extra || 0);
        ancho = Math.max(ancho, medida);
      });
      ancho = Math.min(Math.max(Math.ceil(ancho), propiedades.minwidth || 40), ANCHO_MAXIMO);
      grid.setcolumnproperty(col.campo, 'width', ancho);
    });
    grid.endupdate();
  }

  ajustarColumnas(): boolean {
    try {
      return this.ajustarColumnasReglas();
    }
    catch (e) {
      return false;
    }
  }

  ajustarColumnasReglas(): boolean {
    /* Al recargar los datos jqxGrid vuelve a mostrar todas las columnas: se reaplica lo elegido */
    this.aplicarColumnasOcultas();
    let filas: any[] = this.source.localdata || [];
    let error = (fila, campo) => {
      let e = this.erroresReglas[fila.idrow];
      return e && e.campos[campo] ? 22 : 0;
    };
    this.ajustarGrid(this.myGrid, filas, [
      { campo: 'sistema' },
      { campo: 'cliente_nombre', extra: 16, texto: f => f.cliente_nombre || 'Todos' },
      { campo: 'orden' },
      { campo: 'atributo' },
      { campo: 'nombre_parametro1', codigo: true, texto: f => f.nombre_parametro1 + (error(f, 'nombre_parametro1') ? '    ' : '') },
      { campo: 'nombre_parametro2', codigo: true, texto: f => f.nombre_parametro2 + (error(f, 'nombre_parametro2') ? '    ' : '') },
      { campo: 'nombre_parametro3', codigo: true, texto: f => f.nombre_parametro3 + (error(f, 'nombre_parametro3') ? '    ' : '') },
      { campo: 'nombre_parametro4', codigo: true, texto: f => f.nombre_parametro4 + (error(f, 'nombre_parametro4') ? '    ' : '') },
      { campo: 'consumo', codigo: true, texto: f => f.consumo + (error(f, 'consumo') ? '    ' : '') },
    ]);
    let fuente = this.fuenteTabla(this.myGrid, false);
    let anchoArticulos = 0;
    filas.forEach(f => {
      let icono = error(f, 'articulos') ? 22 : 0;
      anchoArticulos = Math.max(anchoArticulos, this.medirTexto(f.detalle, fuente) + RELLENO_CELDA + icono);
    });
    return this.rellenarColumna(this.myGrid, 'detalle', anchoArticulos);
  }

  ajustarColumnasSimulacion(): boolean {
    try {
      return this.ajustarColumnasSimulacionGrids();
    }
    catch (e) {
      return false;
    }
  }

  ajustarColumnasSimulacionGrids(): boolean {
    this.ajustarGrid(this.myGrid3, this.sourceDet.localdata || [], [
      { campo: 'idpedido' }, { campo: 'orden' }, { campo: 'articulo' }, { campo: 'descripcion' },
      { campo: 'cantidad' }, { campo: 'descUnidad' }, { campo: 'consumo' }, { campo: 'cod_sol' },
    ]);
    let ok = this.rellenarColumna(this.myGrid3, 'fam_sol');
    this.ajustarGrid(this.myGrid4, this.source4.localdata || [], [
      { campo: 'idpedido' }, { campo: 'parametro' },
    ]);
    return this.rellenarColumna(this.myGrid4, 'valor') && ok;
  }

  /* Al mostrar la pestaña se vuelve a medir (la fuente se lee de las celdas pintadas) */
  alMostrarReglas() {
    this.reintentar(() => this.ajustarColumnas());
  }

  alMostrarSimulacion() {
    this.reintentar(() => this.ajustarColumnasSimulacion());
  }

  /* jqxGrid termina de pintar una tabla que estaba oculta un poco después de mostrarse */
  reintentar(accion: () => boolean, intentos: number = 10) {
    setTimeout(() => {
      if (!accion() && intentos > 1) {
        this.reintentar(accion, intentos - 1);
      }
    }, 150);
  }

  /* ---------------- REGLAS: VENTANA DE EDICION ---------------- */

  reglaVacia() {
    return {
      idrow: 0,
      cliente: '' as any,
      orden: 0,
      atributo: '',
      condiciones: [condicionVacia(), condicionVacia(), condicionVacia(), condicionVacia()] as Condicion[],
      operaciones: ['Y', 'Y', 'Y'] as string[],
      articulos: [] as ArticuloRegla[],
    };
  }

  /* Orden propuesto para una regla nueva: el más alto de las reglas del sistema + 10 (10 si no hay ninguna) */
  siguienteOrden(): number {
    let ordenes = (this.source.localdata || []).map(r => Number(r.orden) || 0);
    return (ordenes.length > 0 ? Math.max(...ordenes) : 0) + 10;
  }

  NuevaRegla() {
    this.regla = this.reglaVacia();
    this.regla.orden = this.siguienteOrden();
    this.consumoComun = true;
    this.consumoTodos = consumoVacio();
    this.tituloRegla = 'Nueva regla';
    this.modalRegla.show();
  }

  EditarRegla(fila) {
    this.cargarRegla(fila);
    this.tituloRegla = 'Editar regla';
    this.modalRegla.show();
  }

  /* Duplicar abre la ventana con una copia; se guarda como regla nueva */
  DuplicarRegla(fila) {
    this.cargarRegla(fila);
    this.regla.idrow = 0;
    this.tituloRegla = 'Duplicar regla';
    this.modalRegla.show();
  }

  cargarRegla(fila) {
    let regla = this.reglaVacia();
    regla.idrow = fila.idrow;
    regla.cliente = fila.cliente == null ? '' : String(fila.cliente);
    regla.orden = fila.orden;
    regla.atributo = fila.atributo || '';
    regla.condiciones = [fila.nombre_parametro1, fila.nombre_parametro2, fila.nombre_parametro3, fila.nombre_parametro4]
      .map(c => parseCondicion(c));
    regla.operaciones = [fila.operacion, fila.operacion2, fila.operacion3]
      .map(o => String(o || '').toUpperCase() == 'O' ? 'O' : 'Y');

    let ids = String(fila.articulos || '').replace(/;/g, ',').split(',').map(a => a.trim()).filter(a => a !== '');
    let consumos = String(fila.consumo || '').trim() == '' ? [] : String(fila.consumo).split(';');

    this.consumoComun = consumos.length <= 1;
    this.consumoTodos = consumos.length == 1 ? parseConsumo(consumos[0]) : consumoVacio();

    regla.articulos = ids.map((id, i) => {
      let consumo = consumos.length > 1 && consumos[i] !== undefined ? parseConsumo(consumos[i]) : consumoVacio();
      return id.charAt(0) == '@' ? this.articuloDinamico(id, consumo) : {
        idrow: parseInt(id, 10),
        cod_sol: '',
        descripcion: '',
        unidad: null,
        descUnidad: '',
        consumo: consumo,
      };
    });
    this.regla = regla;
    this.completarArticulos();
  }

  /* Artículo que sale del pedido: el valor de un parámetro (normalmente una búsqueda, p. ej. @TEJIDO_ARTICULO) */
  articuloDinamico(parametro: string, consumo: Consumo = consumoVacio()): ArticuloRegla {
    return {
      idrow: parametro.toUpperCase(),
      dinamico: true,
      cod_sol: '',
      descripcion: 'Según el pedido: el artículo que dé ' + parametro.toUpperCase(),
      unidad: null,
      descUnidad: '',
      consumo: consumo,
    };
  }

  /* Parámetros que pueden dar un artículo: las búsquedas */
  parametrosArticulo(): string[] {
    return this.parametros.filter(p => p.tipo == 'BUSQUEDA').map(p => p.name);
  }

  AnadirArticuloDinamico(parametro: string) {
    if (parametro && !this.regla.articulos.some(a => a.idrow == parametro)) {
      this.regla.articulos.push(this.articuloDinamico(parametro));
    }
  }

  /* Carga código, descripción y unidad de los artículos de la regla */
  completarArticulos() {
    let ids = this.regla.articulos.filter(a => !a.dinamico && !isNaN(a.idrow)).map(a => a.idrow);
    if (ids.length == 0) {
      return;
    }
    this.service.HTTP_Get('/sm/fabricacion/articulos?ids=' + ids.join(',')).subscribe(
      data => {
        this.regla.articulos.filter(a => !a.dinamico).forEach(a => {
          let encontrado = data.Table.find(d => d.idrow == a.idrow);
          if (encontrado) {
            a.cod_sol = encontrado.cod_sol;
            a.descripcion = encontrado.descripcion;
            a.unidad = encontrado.unidad;
            a.descUnidad = encontrado.descUnidad;
          }
          else {
            a.descripcion = '(artículo no encontrado)';
          }
        });
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  /* El buscador de artículos se abre en lugar de la ventana de la regla */
  /* Cada ventana se abre cuando la otra ha terminado de cerrarse: si se solapan, el cierre de
     la primera quita a la página la clase que permite desplazar la ventana abierta */
  AbrirBuscador() {
    this.modalRegla.onHidden.pipe(take(1)).subscribe(() => this.modalAdd.show());
    this.modalRegla.hide();
  }

  CerrarBuscador() {
    this.modalAdd.onHidden.pipe(take(1)).subscribe(() => this.modalRegla.show());
    this.modalAdd.hide();
  }

  UpdateArticles() {
    let seleccion: any[] = this.search.getRows();
    seleccion.forEach(id => {
      let idrow = parseInt(id, 10);
      if (!isNaN(idrow) && !this.regla.articulos.some(a => a.idrow == idrow)) {
        this.regla.articulos.push({ idrow: idrow, cod_sol: '', descripcion: '', unidad: null, descUnidad: '', consumo: consumoVacio() });
      }
    });
    this.completarArticulos();
    this.CerrarBuscador();
  }

  QuitarArticulo(i: number) {
    this.regla.articulos.splice(i, 1);
  }

  /* Añade otra operación a la cadena del consumo (se calculan de izquierda a derecha) */
  AnadirOperacion(consumo: Consumo) {
    consumo.extra = consumo.extra || [];
    consumo.extra.push({ operador: '**', numero: '' });
  }

  QuitarOperacion(consumo: Consumo, indice: number) {
    consumo.extra.splice(indice, 1);
  }

  unidadConsumo(articulo: ArticuloRegla) {
    if (articulo && articulo.dinamico) {
      return 'en la unidad del artículo (si es en metros, en cm)';
    }
    return articulo && articulo.unidad == 3 ? 'cm (se guarda en m)' : (articulo && articulo.descUnidad ? articulo.descUnidad : '');
  }

  CambiarModoCondicion(c: Condicion) {
    if (c.modo == 'guiado') {
      c.texto = buildCondicion(c);
      c.modo = 'texto';
    }
    else {
      let guiada = parseCondicion(c.texto);
      if (guiada.modo == 'texto') {
        this.toaster.warning('Esta condición no se puede pasar al modo guiado: revise su escritura', 'Condición');
        return;
      }
      Object.assign(c, guiada);
    }
  }

  textoCondiciones(): string[] {
    return this.regla.condiciones.map(c => buildCondicion(c));
  }

  textoConsumo(): string {
    if (this.regla.articulos.length == 0) {
      return '';
    }
    if (this.consumoComun) {
      return buildConsumo(this.consumoTodos);
    }
    return this.regla.articulos.map(a => buildConsumo(a.consumo)).join(';');
  }

  erroresCondicion(i: number): string[] {
    let c = this.regla.condiciones[i];
    if (c.modo == 'guiado' && c.parametro) {
      if (c.operador == 'entre' && (String(c.desde).trim() == '' || String(c.hasta).trim() == '')) {
        return ['Indique los dos límites del intervalo'];
      }
      if (c.operador != 'entre' && String(c.valor).trim() == '') {
        return ['Falta el valor'];
      }
    }
    return validarCondicion(buildCondicion(c), this.nombresParametros);
  }

  erroresConsumo(consumo: Consumo): string[] {
    if (consumo.tipo == 'numero' && String(consumo.numero).trim() == '') {
      return ['Indique el número'];
    }
    if ((consumo.tipo == 'parametro' || consumo.tipo == 'operacion') && !consumo.parametro) {
      return ['Elija el parámetro'];
    }
    if (consumo.tipo == 'operacion' && !operandoValido(consumo.numero)) {
      return ['Indique un número o un @PARAMETRO'];
    }
    if (consumo.tipo == 'operacion' && (consumo.extra || []).some(e => !operandoValido(e.numero))) {
      return ['Indique un número o un @PARAMETRO en todas las operaciones'];
    }
    return validarConsumo(buildConsumo(consumo), this.nombresParametros);
  }

  erroresVentana(): string[] {
    let errores = [];
    this.regla.condiciones.forEach((c, i) => this.erroresCondicion(i).forEach(e => errores.push('Condición ' + (i + 1) + ': ' + e)));
    if (this.regla.articulos.length == 0) {
      errores.push('Añada al menos un artículo');
    }
    if (this.consumoComun) {
      this.erroresConsumo(this.consumoTodos).forEach(e => errores.push('Consumo: ' + e));
    }
    else {
      this.regla.articulos.forEach(a => this.erroresConsumo(a.consumo).forEach(e => errores.push('Consumo de ' + (a.cod_sol || a.idrow) + ': ' + e)));
    }
    return errores;
  }

  /* Resumen en lenguaje natural de cuándo se aplica la regla */
  resumenRegla(): string {
    let partes = [];
    this.regla.condiciones.forEach((c, i) => {
      let texto = buildCondicion(c);
      if (texto == '') {
        return;
      }
      let frase = texto;
      if (c.modo == 'guiado') {
        let op = OPERADORES_CONDICION.find(o => o.valor == c.operador);
        frase = c.operador == 'entre'
          ? c.parametro + ' entre ' + c.desde + ' y ' + c.hasta
          : c.parametro + ' ' + (op ? op.texto : c.operador) + ' ' + c.valor + (c.operador == '==' ? this.textoValor(c.parametro, c.valor) : '');
      }
      partes.push((partes.length > 0 ? (this.regla.operaciones[i - 1] == 'O' ? ' O ' : ' Y ') : '') + frase);
    });
    return partes.length == 0 ? 'Se aplica siempre (sin condiciones)' : 'Se aplica si ' + partes.join('');
  }

  GuardarRegla() {
    let errores = this.erroresVentana();
    if (errores.length > 0) {
      this.toaster.error(errores[0], 'Regla');
      return;
    }

    /* Las condiciones vacías se compactan al principio para que los Op queden con su condición */
    let condiciones = this.textoCondiciones();
    let operaciones = this.regla.operaciones;
    let compactas: string[] = [];
    let ops: string[] = [];
    condiciones.forEach((c, i) => {
      if (c !== '') {
        if (compactas.length > 0) {
          ops.push(operaciones[i - 1] || 'Y');
        }
        compactas.push(c);
      }
    });
    while (compactas.length < 4) compactas.push('');
    while (ops.length < 3) ops.push('-');

    let body = {
      idrow: this.regla.idrow,
      sistema: this.sistema,
      cliente: this.regla.cliente,
      orden: this.regla.orden,
      atributo: this.regla.atributo,
      articulos: this.regla.articulos.map(a => a.idrow).join(','),
      nombre_parametro1: compactas[0],
      operacion: ops[0],
      nombre_parametro2: compactas[1],
      operacion2: ops[1],
      nombre_parametro3: compactas[2],
      operacion3: ops[2],
      nombre_parametro4: compactas[3],
      consumo: this.textoConsumo(),
    };

    this.guardandoRegla = true;
    this.service.HTTP_Post('/sm/fabricacion/reglas/save', JSON.stringify(body)).subscribe(
      data => {
        this.guardandoRegla = false;
        if (data.message == 'OK') {
          this.toaster.success(this.regla.idrow > 0 ? 'Regla guardada' : 'Regla creada', 'Reglas');
          this.modalRegla.hide();
          this.loadDetails();
        }
      },
      error => {
        this.guardandoRegla = false;
        this.toaster.error(this.errorMessage(error), 'Reglas');
      });
  }

  /* ---------------- TABLAS DE VALORES ----------------
     Cada fila: clave -> valor. El motor usa la fila con la menor clave >= valor de entrada
     (alto 150,5 usa la fila 151). Se guardan enteras (todas las filas a la vez). */

  tablaVacia() {
    return {
      nueva: true,
      tabla: '',
      descripcion: '',
      clave_texto: '',
      valor_texto: '',
      valores: [] as { clave: any, valor: any }[],
    };
  }

  SeleccionarTabla(tabla: string) {
    this.tablaSel = tabla;
    let cabecera = this.tablas.find(t => t.tabla == tabla);
    if (!cabecera) {
      this.tablaEdit = this.tablaVacia();
      return;
    }
    this.tablaEdit = {
      nueva: false,
      tabla: cabecera.tabla,
      descripcion: cabecera.descripcion || '',
      clave_texto: cabecera.clave_texto || '',
      valor_texto: cabecera.valor_texto || '',
      valores: [],
    };
    let url = '/sm/fabricacion/tablas/valores' + this.querySistema() + '&tabla=' + encodeURIComponent(tabla);
    this.service.HTTP_Get(url).subscribe(
      data => {
        if (this.tablaSel == tabla) {
          this.tablaEdit.valores = data.Table.map(v => ({ clave: v.clave, valor: v.valor }));
        }
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  NuevaTabla() {
    this.tablaSel = '';
    this.tablaEdit = this.tablaVacia();
  }

  AnadirFilaTabla() {
    this.tablaEdit.valores.push({ clave: '', valor: '' });
  }

  QuitarFilaTabla(i: number) {
    this.tablaEdit.valores.splice(i, 1);
  }

  /* Importa las dos primeras columnas de la primera hoja: fila 1 = cabeceras, resto = clave y valor */
  ImportarTabla(event) {
    let fichero: File = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!fichero) {
      return;
    }
    let lector = new FileReader();
    lector.onload = (e: any) => {
      try {
        let libro = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        let filas: any[][] = XLSX.utils.sheet_to_json(libro.Sheets[libro.SheetNames[0]], { header: 1, blankrows: false });
        if (filas.length < 2) {
          this.toaster.error('El Excel no tiene filas de datos', 'Tablas');
          return;
        }
        let malas = 0;
        let valores = [];
        filas.slice(1).forEach(f => {
          let clave = parseFloat(String(f[0]).replace(',', '.'));
          let valor = parseFloat(String(f[1]).replace(',', '.'));
          if (isFinite(clave) && isFinite(valor)) {
            valores.push({ clave: clave, valor: valor });
          }
          else {
            malas++;
          }
        });
        this.tablaEdit.valores = valores;
        this.tablaEdit.clave_texto = this.tablaEdit.clave_texto || String(filas[0][0] || '');
        this.tablaEdit.valor_texto = this.tablaEdit.valor_texto || String(filas[0][1] || '');
        this.toaster.info(valores.length + ' filas importadas' + (malas > 0 ? ', ' + malas + ' ignoradas (no numéricas)' : '')
          + '. Revise y pulse Guardar.', 'Tablas');
      }
      catch (err) {
        this.toaster.error('No se pudo leer el Excel', 'Tablas');
      }
    };
    lector.readAsArrayBuffer(fichero);
  }

  erroresTabla(): string[] {
    let errores = [];
    if (!/^[A-Za-z0-9_]+$/.test(String(this.tablaEdit.tabla || ''))) {
      errores.push('Nombre no válido: use letras, números o _');
    }
    if (this.tablaEdit.valores.length == 0) {
      errores.push('La tabla no tiene filas');
    }
    let claves = {};
    this.tablaEdit.valores.forEach((v, i) => {
      let clave = parseFloat(String(v.clave).replace(',', '.'));
      let valor = parseFloat(String(v.valor).replace(',', '.'));
      if (!isFinite(clave) || !isFinite(valor)) {
        errores.push('Fila ' + (i + 1) + ': la clave y el valor tienen que ser números');
      }
      else if (claves[clave]) {
        errores.push('Fila ' + (i + 1) + ': la clave ' + clave + ' está repetida');
      }
      claves[clave] = true;
    });
    return errores;
  }

  GuardarTabla() {
    let errores = this.erroresTabla();
    if (errores.length > 0) {
      this.toaster.error(errores[0], 'Tablas');
      return;
    }
    let body = {
      sistema: this.sistema,
      tabla: String(this.tablaEdit.tabla).toUpperCase(),
      descripcion: this.tablaEdit.descripcion,
      clave_texto: this.tablaEdit.clave_texto,
      valor_texto: this.tablaEdit.valor_texto,
      valores: this.tablaEdit.valores,
    };
    this.guardandoTabla = true;
    this.service.HTTP_Post('/sm/fabricacion/tablas', JSON.stringify(body)).subscribe(
      data => {
        this.guardandoTabla = false;
        if (data.message == 'OK') {
          this.toaster.success('Tabla guardada', 'Tablas');
          this.loadTablas(body.tabla);
        }
      },
      error => {
        this.guardandoTabla = false;
        this.toaster.error(this.errorMessage(error), 'Tablas');
      });
  }

  BorrarTabla() {
    if (this.tablaEdit.nueva || !confirm('¿Desea borrar la tabla ' + this.tablaEdit.tabla + '?')) {
      return;
    }
    let values = JSON.stringify({ sistema: this.sistema, tabla: this.tablaEdit.tabla });
    this.service.HTTP_Post('/sm/fabricacion/tablas/delete', values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.toaster.success('Tabla borrada', 'Tablas');
          this.tablaSel = '';
          this.loadTablas();
        }
      },
      error => {
        this.toaster.error(this.errorMessage(error), 'Tablas');
      });
  }

  /* ---------------- SIMULACION ---------------- */

  mostrarResultado(fabricacion: any[], parametros: any[]) {
    this.sourceDet.localdata = fabricacion;
    this.dataAdapterDet.dataBind();
    this.myGrid3.updatebounddata();

    this.source4.localdata = parametros;
    this.dataAdapter4.dataBind();
    this.myGrid4.updatebounddata();
  }

  Simulate() {
    if (this.model2.idrow === -1 || !this.model2.idrow) {
      alert("Debe Asignar el ID del Pedido");
      return;
    }

    let values = JSON.stringify({ idPedido: this.model2.idrow, sistema: this.sistema });
    this.service.HTTP_Post('/sm/fabricacion/simular', values).subscribe(
      data => {
        if (data.Parametros.length == 0) {
          this.toaster.warning('El pedido no tiene líneas de ' + this.sistema, 'Simulación');
        }
        else {
          let pedido = data.Pedido || {};
          let nombre = pedido.cliente_nombre || pedido.cliente;
          this.toaster.info(pedido.reglas_cliente == 1
            ? 'Cliente ' + nombre + ': se aplican sus reglas propias'
            : 'Cliente ' + nombre + ': se aplican las reglas generales (Todos)', 'Simulación');

          if (data.Fabricacion.length == 0) {
            this.toaster.info('Ninguna regla se cumple para este pedido. Revise los valores de los parámetros.', 'Simulación');
          }
          let sinArticulo = data.Fabricacion.filter(f => f.articulo === null).length;
          if (sinArticulo > 0) {
            this.toaster.warning(sinArticulo + (sinArticulo == 1 ? ' componente sale' : ' componentes salen')
              + ' SIN ARTÍCULO (en rojo): revise la Referencia del color en los datos del producto. No se envían al XML.', 'Simulación', { timeOut: 10000 });
          }
          let sinConsumo = data.Fabricacion.filter(f => Number(f.consumo) === -1).length;
          if (sinConsumo > 0) {
            this.toaster.warning(sinConsumo + (sinConsumo == 1 ? ' componente tiene' : ' componentes tienen')
              + ' consumo -1 (en rojo): no se pudo calcular. Revise los parámetros (p. ej. un alto fuera de la tabla de valores).', 'Simulación', { timeOut: 10000 });
          }
        }
        this.mostrarResultado(data.Fabricacion, data.Parametros);
      },
      error => {
        this.toaster.error(this.errorMessage(error));
      });
  }

  HojaFabricacion() {
    let url = "/sm/export_csv/" + this.model2.idrow + "/1";
    url = this.service.HTTP_Url_Get(url);
    window.open(url);
  }
}
