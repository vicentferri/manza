import { Component, OnInit, ViewChild, ViewContainerRef, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HaruService } from '../../../services/haru.service';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { DynamicFormControlModel, DynamicFormService } from '@ng-dynamic-forms/core';
import { gridmodel } from '../../../shared/grids/gridmodel';
import { FormGroup } from '@angular/forms';
import { getLocalization } from '../../../shared/localization';
import { UploadService } from '../../../services/upload.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalDirective } from 'ngx-bootstrap/modal';
//import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { AssignGroupsComponent } from '../../../shared/assign-groups/assign-groups.component';

interface ValueLabelField {
    value: any;
    label: string;
}

import {
    COLOR_MODEL,
    FAMILIEN_MODEL,
    COMPOSITION_MODEL,
    CALIDAD_MODEL,
    SUBFAMILIEN_MODEL,
    CATEGORIAS_MODEL,
    ARTICULOS_MODEL,
    USERS_MODEL,
    SM_TEJIDOS_MODEL,
    SM_ACCIONAMIENTOS_MODEL,
    SM_COLORESMARCAS_MODEL,
    SM_CONTRAPESOS_MODEL,
    SM_SOPORTES_MODEL,
    SM_TAPAS_MODEL,
    SM_TUBOS_MODEL,
    SM_EMBALAJES_MODEL,
    SM_EMPAQUETADOS_MODEL,
    SM_INSTALACIONES_MODEL,
    SM_POSICIONMANDO_MODEL,
    SM_CLIENTESAPI_MODEL,
    SM_TEJIDOS_CLIENTES_MODEL,
    SM_ESTANCIAS_MODEL,
    SM_PROMOCIONES,
    CLIENTES_MODEL,
    TARIFAS2_MODEL,
    LINEAS_MODEL,
    SUBLINEAS_MODEL,
    CATEGORIASM_MODEL,
    NH_STOCK,
    SM_COLORESCLIENTES,
    SM_ACCIONAMIENTOSCLIENTES,
    SM_ACCIONAMIENTOSMARCASCLIENTES,
    LINEAS_SUBLINEAS_MODEL,
    SM_ACCIONAMIENTOSTIPOSCLIENTES,
    SM_SOPORTESCLIENTES,
    SM_TAPASCLIENTES,
    APIINVOICES_MODEL,
    SM_CONTRAPESOSCLIENTES,
    SM_CONTRAPESOSCOLORESCLIENTES,
    SM_SOPORTESCOLORESCLIENTES,
    SM_TAPASCOLORESCLIENTES,
    APIATRIBUTOS_MODEL,
    SM_TEJIDOSCOLORES_MODEL,
    SM_CLIENTES_MODEL,
    SM_TEJIDOSCLIENTESPRODUCTOS_MODEL,
    SM_ACCIONAMIENTOS_MAPA,
    SM_CAJONES_MODEL,
    SM_GUIAS_MODEL,
    SM_CLIENTES_DIRECCIONES_MODEL,
    SM_CLIENTES_INCREMENTOS_GENERICOS,
    SM_ACCIONAMIENTOS_CLIENTES_TARIFAS,
    SM_ACCIONAMIENTOS_RADIO_TIPO,
    SM_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE,
    SM_CONTRAPESO_CLIENTES_TARIFAS,
    SM_TARIFA_TEJIDO_VERTICAL,
    SM_ACCESORIOS_TARIFAS,
    SM_MECANISMO_JAPONES_TARIFAS,
    SM_TARIFA_MECANISMO_VERTICAL,
    SM_INCREMENTOS,
    SM_INCREMENTOS_CAJONES,
    SM_INCREMENTOS_LACADOS,
    SM_GRUPO_MODELO,
    SM_TEJIDOSATRIBUTOS_MODEL,
    SM_CAJONES_CLIENTES_MODEL
} from "../../../shared/forms/form1.model";

@Component({
    selector: 'app-master',
    templateUrl: './master.component.html',
    styleUrls: ['./master.component.css'],
    providers: [HaruService, DynamicFormService, UploadService]
})
export class MasterComponent implements OnInit {

    @ViewChild('AssignGroups', { static: false }) assignGroups!: AssignGroupsComponent;
    @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
    @ViewChild('staticModalDet', { static: false }) modalDet!: ElementRef;
    @ViewChild('staticModal', { static: false }) modal!: ModalDirective;
    @ViewChild('staticModalAdd', { static: false }) modal2!: ModalDirective;
    @ViewChild('staticModalAssign', { static: false }) modalAssign!: ModalDirective;
    @ViewChild('staticModalAssignValues', { static: false }) modalAssignValues!: ModalDirective;
    @ViewChild('staticModalBulk', { static: false }) modalBulk!: ModalDirective;
    @ViewChild('editSheet', { static: false }) modalEdit!: ModalDirective;
    @ViewChild('articlesModal', { static: false }) articlesModal!: ModalDirective;
    @ViewChild('staticModal5', { static: false }) modal5!: ModalDirective;
    @ViewChild('categoriasModal', { static: false }) categoriasModal!: ModalDirective;
    @ViewChild('tejidoscoloresModal', { static: false }) tejidoscoloresModal!: ModalDirective;
    @ViewChild('usersModal', { static: false }) usersModal!: ModalDirective;
    @ViewChild('promocionesModal', { static: false }) promocionesModal!: ModalDirective;
    @ViewChild('tarifasModal', { static: false }) tarifasModal!: ModalDirective;
    @ViewChild('accionamientosModal', { static: false }) accionamientosModal!: ModalDirective;
    @ViewChild('domiciliosModal', { static: false }) domiciliosModal!: ModalDirective;

    //public Editor = ClassicEditor;
    //public Editor2 = ClassicEditor;

    public model = {
        editorData: '<p>Hello, world!</p>',
        editorData2: '<p>Hello, world!</p>',
        editorData3: '',
        info_tecnica: '',
        opacidad: '',
        uso_recomendado: ''
    };

    params = {
        id: 0,
        table: '',
        column: '',
        field: '',
        value: '',
        type: 0,
        param1: '1',
        param2: '',
        param3: ''
    }

    //public Editor = DecoupledEditor;
    public filesToUpload: Array<File> = [];

    url: string = "";
    formModel: any;
    formModel_100: DynamicFormControlModel[] = COLOR_MODEL;
    formModel_101: DynamicFormControlModel[] = FAMILIEN_MODEL;
    formModel_102: DynamicFormControlModel[] = COMPOSITION_MODEL;
    formModel_103: DynamicFormControlModel[] = CALIDAD_MODEL;
    formModel_104: DynamicFormControlModel[] = SUBFAMILIEN_MODEL;
    formModel_105: DynamicFormControlModel[] = CATEGORIAS_MODEL;
    formModel_106: DynamicFormControlModel[] = ARTICULOS_MODEL;
    formModel_107: DynamicFormControlModel[] = USERS_MODEL;
    formModel_108: DynamicFormControlModel[] = CLIENTES_MODEL;
    formModel_109: DynamicFormControlModel[] = TARIFAS2_MODEL;
    formModel_110: DynamicFormControlModel[] = LINEAS_MODEL;
    formModel_111: DynamicFormControlModel[] = SUBLINEAS_MODEL;
    formModel_112: DynamicFormControlModel[] = CATEGORIASM_MODEL;
    formModel_113: DynamicFormControlModel[] = NH_STOCK;
    formModel_115: DynamicFormControlModel[] = LINEAS_SUBLINEAS_MODEL;
    formModel_116: DynamicFormControlModel[] = APIINVOICES_MODEL;
    formModel_117: DynamicFormControlModel[] = APIATRIBUTOS_MODEL;

    formModel_200: DynamicFormControlModel[] = SM_TEJIDOS_MODEL;
    formModel_201: DynamicFormControlModel[] = SM_ACCIONAMIENTOS_MODEL;
    formModel_202: DynamicFormControlModel[] = SM_COLORESMARCAS_MODEL;
    formModel_203: DynamicFormControlModel[] = SM_CONTRAPESOS_MODEL;
    formModel_204: DynamicFormControlModel[] = SM_SOPORTES_MODEL;
    formModel_205: DynamicFormControlModel[] = SM_TAPAS_MODEL;
    formModel_206: DynamicFormControlModel[] = SM_TUBOS_MODEL;
    formModel_207: DynamicFormControlModel[] = SM_EMBALAJES_MODEL;
    formModel_208: DynamicFormControlModel[] = SM_EMPAQUETADOS_MODEL;
    formModel_209: DynamicFormControlModel[] = SM_INSTALACIONES_MODEL;
    formModel_210: DynamicFormControlModel[] = SM_POSICIONMANDO_MODEL;
    formModel_211: DynamicFormControlModel[] = SM_CLIENTESAPI_MODEL;
    formModel_212: DynamicFormControlModel[] = SM_TEJIDOS_CLIENTES_MODEL;
    formModel_213: DynamicFormControlModel[] = SM_ESTANCIAS_MODEL;
    formModel_214: DynamicFormControlModel[] = SM_PROMOCIONES;
    formModel_215: DynamicFormControlModel[] = SM_COLORESCLIENTES;
    formModel_216: DynamicFormControlModel[] = SM_ACCIONAMIENTOSCLIENTES;
    formModel_217: DynamicFormControlModel[] = SM_ACCIONAMIENTOSMARCASCLIENTES;
    formModel_218: DynamicFormControlModel[] = SM_ACCIONAMIENTOSTIPOSCLIENTES;
    formModel_219: DynamicFormControlModel[] = SM_SOPORTESCLIENTES;
    formModel_220: DynamicFormControlModel[] = SM_TAPASCLIENTES;
    formModel_221: DynamicFormControlModel[] = SM_CONTRAPESOSCLIENTES;
    formModel_222: DynamicFormControlModel[] = SM_CONTRAPESOSCOLORESCLIENTES;
    formModel_223: DynamicFormControlModel[] = SM_SOPORTESCOLORESCLIENTES;
    formModel_224: DynamicFormControlModel[] = SM_TAPASCOLORESCLIENTES;
    formModel_225: DynamicFormControlModel[] = SM_TEJIDOSCOLORES_MODEL;

    formModel_226: DynamicFormControlModel[] = SM_ACCIONAMIENTOS_MAPA;

    formModel_229: DynamicFormControlModel[] = SM_TEJIDOSCLIENTESPRODUCTOS_MODEL;
    formModel_230: DynamicFormControlModel[] = SM_CLIENTES_MODEL;

    formModel_300: DynamicFormControlModel[] = SM_CAJONES_MODEL;
    formModel_301: DynamicFormControlModel[] = SM_GUIAS_MODEL;
    formModel_302: DynamicFormControlModel[] = SM_CLIENTES_DIRECCIONES_MODEL;

    formModel_901: DynamicFormControlModel[] = SM_CLIENTES_INCREMENTOS_GENERICOS;
    formModel_902: DynamicFormControlModel[] = SM_ACCIONAMIENTOS_CLIENTES_TARIFAS;
    formModel_903: DynamicFormControlModel[] = SM_ACCIONAMIENTOS_RADIO_TIPO;
    formModel_904: DynamicFormControlModel[] = SM_ACCIONAMIENTOS_RADIO_TIPO_CLIENTE;
    formModel_905: DynamicFormControlModel[] = SM_CONTRAPESO_CLIENTES_TARIFAS;
    formModel_906: DynamicFormControlModel[] = SM_TARIFA_TEJIDO_VERTICAL;
    formModel_907: DynamicFormControlModel[] = SM_ACCESORIOS_TARIFAS;
    formModel_908: DynamicFormControlModel[] = SM_MECANISMO_JAPONES_TARIFAS;
    formModel_909: DynamicFormControlModel[] = SM_TARIFA_MECANISMO_VERTICAL;
    formModel_910: DynamicFormControlModel[] = SM_INCREMENTOS;
    formModel_911: DynamicFormControlModel[] = SM_INCREMENTOS_LACADOS;
    formModel_912: DynamicFormControlModel[] = SM_GRUPO_MODELO;
    formModel_913: DynamicFormControlModel[] = SM_TEJIDOSATRIBUTOS_MODEL;
    formModel_914: DynamicFormControlModel[] = SM_CAJONES_CLIENTES_MODEL;
    formModel_915: DynamicFormControlModel[] = SM_INCREMENTOS_CAJONES;


    master = 1;
    Filter_Articles = 0;
    title = "";
    operation: Number = 0;
    operationModal: Number = 0;
    canAdd: Number = -1;
    canDel: Number = -1;
    canEdit: Number = -1;
    gridModel: any;
    formGroup!: FormGroup;
    BindingComplete = false;
    editSheet = false;
    editSheetValue = 0;

    public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl("about:blank");

    relacion = {
        from: "",
        to1: "",
        to2: "",
        to3: "",
        to4: "",
        to5: "",
        to6: ""
    }

    bulk = {
        id: "1",
        table: "",
        field: "",
        value: ""
    }

    producto = {
        beneficios: "",
        recomendado: "",
        queaportamos: "",
        caracteristicas: "",
        beneficios_en: "",
        recomendado_en: "",
        queaportamos_en: "",
        caracteristicas_en: "",
        beneficios_fr: "",
        recomendado_fr: "",
        queaportamos_fr: "",
        caracteristicas_fr: ""
    }

    producto2 = {
        tamano_l1: "",
        tamano_l2: "",
        tamano_l3: "",
        referencia_l1: "",
        referencia_l2: "",
        referencia_l3: "",
        composicion_l1: "",
        composicion_l2: "",
        composicion_l3: ""
    }

    producto3 = {
        categoria: "-1",
        linea: "",
        sublinea: ""
    }

    dialog = {
        nombre: "",
        albaran: "",
        email: "",
        idrow: 0,
        bultos: 0,
        peso: 0,
        volumen: 0
    }

    searchmodel = {
        Categoria: -1,
        Barras: "",
        Alias: "",
        Descripcion: "",
        familia: "-1",
        subfamilia: "-1",
        calidad: "-1",
        composicion: "-1",
        color: "-1",
        publicados: true
    }

    source = {
        type: "GET",
        datatype: "json",
        datafields: [],
        url: ""
    };

    modalDialog = {
        Sel_Field1: "",
        Sel_Field2: "",
        Sel_Field3: "",
        field1: [] as ValueLabelField[],
        field2: [] as ValueLabelField[],
        field3: [] as ValueLabelField[]
    }

    user = {
        idrow: -1,
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        role: "-1",
        empresa: "-1",
        subempresa: "-1",
        ambito: "E"
    }

    accionamientosMapa = {
        operation: 1,
        Producto: "-1",
        Accionamiento: "-1",
        Modelo: "-1",
        TipoColor: 1,
        Color: "-1",
        Cliente: "-1"
    }

    tiendasClientes = {
        idrow: -1,
        operation: 1,
        Cliente: "1",
        Pais: "1",
        Nombre: "",
        Poblacion: "",
        Provincia: "",
        Telefono: "",
        Email: "",
        DiasTransporte: 3,
        CodSolupyme: "000",
        Centro: 0,
        Usuario: "",
        Password: ""
    }

    Sel_Imagen = '1';
    imagenes: any = [{ id: 1, name: 'Primera Imágen' },
    { id: 2, name: 'Segunda Imágen' },
    { id: 3, name: 'Tercera Imágen' },
    { id: 4, name: 'Cuarta Imagen' },
    { id: 5, name: 'Quinta Imagen' },
    { id: 6, name: 'Sexta Imagen' }
    ];

    productos: any = [
        { id: 1, name: 'Enrollable', imp: false, sel: true, dias: 5 },
        { id: 2, name: 'Panel Japones', imp: false, sel: false, dias: 5 },
        { id: 3, name: 'Panel Vertical', imp: false, sel: false, dias: 5 },
        { id: 4, name: 'Panel Compac', imp: false, sel: false, dias: 5 },
        { id: 6, name: 'Cajón ZIP', imp: false, sel: false, dias: 5 },
    ];

    productosform: any = [
        { value: 1, label: 'Enrollable' },
        { value: 2, label: 'Panel Japones' },
        { value: 3, label: 'Panel Vertical' },
        { value: 4, label: 'Panel Compac' },
        { value: 6, label: 'Cajón ZIP' },
    ];

    masterfields: any = [
        { idrow: 106, id: 1, description: 'articulos.web_descripcion', table: 'nh_articulos', field: 'web_descripcion' },
        { idrow: 106, id: 2, description: 'articulos.caracteristicas', table: 'nh_articulos', field: 'caracteristicas' },
        { idrow: 110, id: 3, description: 'LINEAS Caracteristicas de las líneas', table: 'nh_master_lineas', field: 'caracteristicas' },
        { idrow: 111, id: 4, description: 'SUBLINEAS Caracteristicas (min) de las sublíneas', table: 'nh_master_sublineas', field: 'caracteristicas' },
        { idrow: 111, id: 5, description: 'SUBLINEAS Caracteristicas (2) de las sublíneas', table: 'nh_master_sublineas', field: 'caracteristicas2' },
        { idrow: 106, id: 6, description: 'ARTICULOS.ALIAS2', table: 'nh_articulos', field: 'alias2' },
    ];

    TipoColor: any = [
        { value: 1, label: 'COLOR' },
        { value: 2, label: 'MARCA' },
        { value: 3, label: 'OTROS' },
    ];

    ImpresionDigital: any = [
        { value: 0, label: 'NO DISPONIBLE' },
        { value: 1, label: 'PERMITIDA' }
    ];


    paises: any = [];

    fields: any = [];

    familias: any = [];
    subfamilias: any = [];
    calidades: any = [];
    composiciones: any = [];
    colores: any = [];
    smcolores: any = [];
    coloresTejidos: any = [];
    categorias: any = [];
    categoriasm: any = [];
    lineas: any = [];
    sublineas: any = [];
    lineasfilter: any = [];
    sublineasfilter: any = [];
    opcionesfilter: any = [];
    atributos: any = [];

    empresas: any = [];

    parametros: any = [];
    Tejidos_Parametros: any = [
        { idrow: 1, descripcion: 'Actualizar Todas las Tarifas' },
        { idrow: 2, descripcion: 'Actualizar Solo las Desbloqueadas' },
    ];


    /* VFF 13.12.17 */
    clientes: Array<ValueLabelField> = [];
    clientesform: any = [];
    grupomodeloform: any = [];
    grupospmodeloform: any = [];
    coloresform: any = [];
    tejidosform: any = [];
    marcasform: any = [];
    radiotipoform: any = [];
    contrapesoform: any = [];
    soporteform: any = [];
    tapasform: any = [];
    guiasform: any = [];
    cajonesform: any = [];
    modelosform: any = [];
    accionamientosmarcas: any = [];
    ClienteSeleccionado = -1;
    AccionamientoSeleccionado = -1;

    /* VFF 08.03.2018 */
    Seleccion_Origen: any = [];
    Seleccion_Destino: any = [];
    Seleccion_Origen2: any = [];
    Seleccion_Destino2: any = [];

    /* VFF 03.01.18 */
    tejidos: any = [];
    TejidoSeleccionado = -1;

    /* VFF 14.06.2018 */
    AccionamientoCliente = "";
    accionamientos: any = [];
    SoporteSeleccionado = -1;
    SoporteCliente = "";

    /* VFF 19.06.2018 */
    soportes: any = [];
    tapas: any = [];
    TapaSeleccionado = -1;
    TapaCliente = "";

    /* VFF 26.06.2018 */
    contrapesos: any = [];
    ContrapesoSeleccionado = -1;
    ContrapesoCliente = "";

    tejidostarifas: any = [];

    Sel_Categoria = -1;
    Sel_SubLinea = -1;
    Sel_SubLinea2 = -1;
    Sel_Opcion = -1;
    Sel_Linea = -1;
    Sel_CategoriaM = -1;

    /* 29.01.2020 - DIRECCIONES DE ENTREGAS */
    entregas: any = [];

    /* 27.05.2022 - ACCIONAMIENTOS TIPOS */
    accionamientostipos: any = [];
    /* 01.06.2022 - ACCIONAMIENTOS COLORES */
    accionamientoscolores: any = [];


    dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

    localization: any = getLocalization('es');

    settings: any = {
        width: '99%',
        height: '99%',
        pageable: true,
        autoheight: false,
        theme: 'bootstrap',
        pagesizeoptions: ['50', '100', '500', '1000', '5000', '10000'],
        pagesize: 10000,
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
        showstatusbar: false,
        showaggregates: true,
        source: this.dataAdapter,
        enablebrowserselection: true,
        columns: [],
        columngroups: []
        //localization: this.localization
    };

    //dropdownitems : any = [{idrow:1,nombre:'uno'},{idrow:2,nombre:'dos'}];

    /* DROPDOWN SOURCE */
    DropDownSource = {
        type: "GET",
        datatype: "json",
        datafields: [
            { name: 'idrow', type: 'number' },
            { name: 'nombre', type: 'string' }
        ],
        localdata: null
    }

    DropDownAdapter = new $.jqx.dataAdapter(this.DropDownSource,
        { contentType: 'application/json; charset=utf-8', autoBind: true });

    createeditor = (row, value, editor) => {
        editor.jqxDropDownList({
            source: this.DropDownAdapter,
            displayMember: 'nombre', valueMember: 'tarifa'
        })
    };

    /* DROPDOWN SOURCE */




    constructor(private service: HaruService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private formService: DynamicFormService,
        private upload: UploadService,
        private toaster: ToastrService,
        vRef: ViewContainerRef,
        private domSanitizer: DomSanitizer) {

        // this.toaster.setRootViewContainerRef(vRef);
    }


    ngOnInit() {

        this.canAdd = 0;
        this.canDel = 0;
        this.canEdit = 0;
        this.operationModal = 1;
        this.activatedRoute.params.subscribe((params: Params) => {
            this.operation = params['id'];
            this.CargarDocumento();
        });
    }

    ngAfterViewInit() {

        this.myGrid.createComponent(this.settings);
        this.refresh();
    }

    public onReady(editor) {
        /*
        editor.ui.view.editable.element.parentElement.insertBefore(
            editor.ui.view.toolbar.element,
            editor.ui.view.editable.element
        );
        */
    }


    BuildURL() {

        if (this.operation == 106 || this.operation == 114) {

            var categoria = this.searchmodel.Categoria;
            var criterio = this.searchmodel.Descripcion;
            var alias = this.searchmodel.Alias;
            var barras = this.searchmodel.Barras;
            var familia = this.searchmodel.familia;
            var subfamilia = this.searchmodel.subfamilia;
            var color = this.searchmodel.color;
            var composicion = this.searchmodel.composicion;
            var calidad = this.searchmodel.calidad;
            var publicados = this.searchmodel.publicados;

            if (criterio == null || criterio == "") {
                criterio = "-1";
            }

            if (alias == null || alias == "") {
                alias = "-1";
            }

            if (barras == null || barras == "") {
                barras = "-1";
            }
            this.url = this.service.Master_NH_Articulo_GetURL(criterio, alias, barras, familia, subfamilia, color, composicion, calidad, publicados, categoria);
        }
    }

    ReloadTejidos() {
        var kunde = this.ClienteSeleccionado;
        this.loadTejidosCliente(kunde);
    }

    loadClientes() {

        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientes = data.Table;
                this.clientes.push({ 'value': '-1', 'label': 'Seleccionar Cliente' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadClientesForm() {

        this.service.HTTP_Get('/formclientes').subscribe(
            data => {
                this.clientesform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadGrupoModeloForm() {

        this.service.HTTP_Get('/grupomodeloform').subscribe(
            data => {
                this.grupomodeloform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadGrupoSpModeloForm() {

        this.service.HTTP_Get('/grupospmodeloform').subscribe(
            data => {
                this.grupospmodeloform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadColoresForm() {

        this.service.HTTP_Get('/formcolores').subscribe(
            data => {
                this.coloresform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTejidosForm() {

        this.service.HTTP_Get('/formtejidos').subscribe(
            data => {
                this.tejidosform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadMarcasForm() {

        this.service.HTTP_Get('/sm/accionamientos_marcas_form').subscribe(
            data => {
                this.marcasform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadRadiotipoForm() {

        this.service.HTTP_Get('/sm/accionamientos_radiotipo_form').subscribe(
            data => {
                this.radiotipoform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadContrapesoForm() {

        this.service.HTTP_Get('/sm/contrapeso_form').subscribe(
            data => {
                this.contrapesoform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSoporteForm() {

        this.service.HTTP_Get('/sm/soporte_form').subscribe(
            data => {
                this.soporteform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTapasForm() {

        this.service.HTTP_Get('/sm/tapas_form').subscribe(
            data => {
                this.tapasform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadGuiasForm() {

        this.service.HTTP_Get('/sm/guias_form').subscribe(
            data => {
                this.guiasform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadCajonesForm() {

        this.service.HTTP_Get('/sm/cajones_form').subscribe(
            data => {
                this.cajonesform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadModelosForm() {

        this.service.HTTP_Get('/sm/accionamientos_modelos_form').subscribe(
            data => {
                this.modelosform = data.Table;

            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadClientesAPI() {

        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientes = [];
                var values = data.Table;
                if (values.length > 0) {
                    values.forEach(element => {
                        this.clientes.push({ 'value': element.idrow, 'label': element.descripcion });
                    });
                }
                this.clientes.push({ 'value': '-1', 'label': 'Seleccionar Cliente' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadAccionamientos() {

        this.service.HTTP_Get('/sm/form_accionamientos').subscribe(
            data => {
                this.accionamientos = data.Table;
                this.accionamientos.push({ 'value': '-1', 'label': 'Seleccionar Tipo' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            })
    }

    LoadAccionamientosTipos() {
        let value = this.accionamientosMapa.Accionamiento;
        this.loadAccionamientosTipos(value);
    }

    loadAccionamientosTipos(tipo) {

        this.service.HTTP_Get('/sm/accionamientos_tipos_form/' + tipo).subscribe(
            data => {
                this.accionamientostipos = data.Table;
                this.accionamientostipos.push({ 'idrow': '-1', 'descripcion': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    LoadAccionamientosModelos() {
        this.service.HTTP_Get('/sm/colores_form/' + this.accionamientosMapa.TipoColor).subscribe(
            data => {
                this.accionamientoscolores = data.Table;
                this.accionamientoscolores.push({ 'id': '-1', 'descripcion': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });

    }

    LoadPaises() {
        this.service.HTTP_Get('/sm/paises_filter/').subscribe(
            data => {
                this.paises = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    Agregar_Accionamiento_Mapa() {
        //console.log(this.accionamientosMapa);
        if (confirm("¿Desea Agregar el siguiente Accionamiento?")) {
            let url = '/sm/accionamientos_mapa/';
            let values = JSON.stringify(this.accionamientosMapa);
            this.service.HTTP_Post(url, values).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success("Agregado al Mapa");
                        this.accionamientosModal.hide();
                        this.refresh();

                        this.accionamientosMapa = {
                            operation: 1,
                            Producto: "-1",
                            Accionamiento: "-1",
                            Modelo: "-1",
                            TipoColor: 1,
                            Color: "-1",
                            Cliente: "-1"
                        }
                    }
                    else {
                        this.toaster.info("NO se ha agregado al Mapa");
                    }
                },
                error => {
                    this.toaster.error(error.message);
                });
        }
    }

    loadAccionamientosMarcas() {

        this.service.HTTP_Get('/sm/accionamientos_marcas').subscribe(
            data => {
                this.accionamientosmarcas = data.Table;
                this.accionamientosmarcas.push({ 'idrow': '-1', 'descripcion': 'Seleccionar Cliente' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTejidos() {

        this.service.HTTP_Get('/sm/tejidos').subscribe(
            data => {
                this.tejidos = data.Table;
                this.tejidos.push({ 'idrow': '-1', 'descripcion': 'Seleccionar Tejido' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTejidosCliente(cliente: number) {

        this.service.HTTP_Get('/sm/tejidos_cliente_filter/' + cliente).subscribe(
            data => {
                this.tejidos = data.Table;
                this.tejidos.push({ 'idrow': '-1', 'descripcion': 'Seleccionar Tejido' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadCategorias() {
        this.service.HTTP_Get('/sm/form_categorias').subscribe(
            data => {
                this.categorias = data.Table;
                this.categorias.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadCategoriasM() {
        /*
        this.service.HTTP_Get('/sm/form_categoriasm').subscribe(
            data => {
                this.categoriasm = data.Table;
                this.categoriasm.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                console.log(error);
            });
        */
    }

    loadLineas() {
        this.service.HTTP_Get('/sm/form_lineas').subscribe(
            data => {
                this.lineas = data.Table;
                this.lineas.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSubLineas() {
        this.service.HTTP_Get('/sm/form_lineas_sublineas').subscribe(
            data => {
                this.sublineas = data.Table;
                this.sublineas.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    ChangeCategoria() {
        var categoria = this.Sel_Categoria;
        this.loadLineasFilter(categoria);
    }

    ChangeCategoriaM() {
        //var categoria = this.Sel_Categoria;
        //this.loadLineasFilter(categoria);
    }

    loadLineasFilter(categoria) {
        this.service.HTTP_Get('/sm/form_lineas_cat/' + categoria).subscribe(
            data => {
                this.lineasfilter = data.Table;
                this.lineasfilter.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    ChangeLinea() {
        var linea = this.Sel_Linea;
        this.loadSubLineasFilter(linea);
    }

    ChangeSubLinea() {
        var sublinea = this.Sel_SubLinea;
        this.loadSubLineasOpcionesFilter(sublinea);
    }

    loadSubLineasOpcionesFilter(linea) {
        this.service.HTTP_Get('/sm/form_opciones_sublinea/' + linea).subscribe(
            data => {
                this.opcionesfilter = data.Table;
                this.opcionesfilter.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSubLineasFilter(linea) {
        this.service.HTTP_Get('/sm/form_sublineas_lin/' + linea).subscribe(
            data => {
                this.sublineasfilter = data.Table;
                this.sublineasfilter.push({ 'value': '-1', 'label': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadFamilias() {
        this.service.Master_NH_Familien().subscribe(
            data => {
                this.familias = data.Table;
                this.familias.push({ 'id': '-1', 'name': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSubFamilias(familia) {
        this.service.Master_NH_SubFamilien(familia).subscribe(
            data => {
                this.subfamilias = data.Table;
                this.subfamilias.push({ 'id': '-1', 'name': 'Seleccionar' });
                this.loadCalidades(familia);
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadCalidades(familia) {
        this.service.Master_NH_Calidades(familia).subscribe(
            data => {
                this.calidades = data.Table;
                this.calidades.push({ 'id': '-1', 'name': 'Seleccionar' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadColores() {
        this.service.Master_NH_Farben().subscribe(
            data => {
                this.colores = data.Table;
                this.colores.push({ 'id': '-1', 'name': 'Seleccionar' });
                this.loadComposiciones();
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSMColores() {
        this.service.HTTP_Get('/sm/colores').subscribe(
            data => {
                this.smcolores = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTejidosColores() {
        this.service.Master_NH_Farben_Get().subscribe(
            data => {
                this.coloresTejidos = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadComposiciones() {
        this.service.Master_NH_Composiciones().subscribe(
            data => {
                this.composiciones = data.Table;
                this.composiciones.push({ 'id': '-1', 'name': 'Seleccionar' });
                this.loadFamilias();
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadSoportes() {
        this.service.HTTP_Get('/sm/soportes_form').subscribe(
            data => {
                this.soportes = data.Table;
                this.soportes.push({ 'id': '-1', 'label': 'Seleccionar Soporte' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTapas() {
        this.service.HTTP_Get('/sm/tapas_form').subscribe(
            data => {
                this.tapas = data.Table;
                this.tapas.push({ 'value': '-1', 'label': 'Seleccionar Tapa' });
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadContrapesos() {
        this.service.HTTP_Get('/sm/contrapesos_form').subscribe(
            data => {
                this.contrapesos = data.Table;
                this.contrapesos.push({ 'id': '-1', 'label': 'Seleccionar Contrapeso' });


            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadAtributosSubfamilia(subfamilia) {
        var route = "/atributos_show/" + subfamilia;
        this.service.HTTP_Get('/sm/' + route).subscribe(
            data => {
                this.atributos = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadAtributosArticulos(idrow) {
        var route = "/atributos_show_articles/" + idrow + "/" + this.searchmodel.Categoria;
        this.service.HTTP_Get('/sm/' + route).subscribe(
            data => {
                this.atributos = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadAtributos() {
        this.service.HTTP_Get('/sm/atributos').subscribe(
            data => {
                this.atributos = data.Table;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });
    }

    loadTejidosTarifas() {

        this.service.HTTP_Get('/sm/tejidos_tarifas').subscribe(
            data => {
                this.DropDownSource.localdata = data.Table;
                this.DropDownAdapter.dataBind();
                this.settings.columns[7].createeditor = this.createeditor;
            },
            error => {
                this.toaster.error(error.message, 'Error');
            });

    }


    loadMaster() {

        if (this.operation == 106) {
            this.loadColores();
            this.loadCategorias();
            this.loadLineas();
            this.loadCategoriasM();
        }

        if (this.operation == 107) {
            this.loadClientesAPI();
        }

        if (this.operation == 110) {
            this.loadCategorias();
        }

        if (this.operation == 111) {
            this.loadLineas();
            this.loadAtributos();
        }

        if (this.operation == 115) {
            this.loadSubLineas();
        }

        if (this.operation == 201) {
            this.loadClientes();

        }

        if (this.operation == 203) {
            this.loadGrupoModeloForm();
        }

        if (this.operation == 204) {
            this.loadGrupoModeloForm();
        }

        if (this.operation == 205) {
            this.loadGrupoModeloForm();
        }



        if (this.operation == 212) {
            this.loadTejidosTarifas();
        }

        if (this.operation == 217) {
            this.loadClientes();
            this.loadAccionamientosMarcas();
        }

        if (this.operation == 218) {
            this.loadAccionamientos();
            this.loadGrupoModeloForm();
        }

        if (this.operation == 219) {
            this.loadSoportes();
            this.loadSoporteForm();
            this.loadClientes();
            this.loadClientesForm();
        }

        if (this.operation == 220) {
            this.loadTapas();
            this.loadTapasForm();
            this.loadClientes();
            this.loadClientesForm();
        }

        if (this.operation == 221) {
            this.loadContrapesos();
            this.loadContrapesoForm();
            this.loadClientesForm();
            this.loadClientes();
        }

        if (this.operation == 222) {
            this.loadContrapesoForm();
            this.loadClientesForm();
            this.loadColoresForm();
        }

        if (this.operation == 223) {
            this.loadSoporteForm();
            this.loadClientesForm();
            this.loadColoresForm();
        }

        if (this.operation == 224) {
            this.loadTapasForm();

            this.loadColoresForm();
        }

        if (this.operation == 225) {
            //this.loadTejidos();
            //this.loadSMColores();
        }

        if (this.operation == 226) {
            this.loadClientes();
            this.loadAccionamientos();
        }

        if (this.operation == 230) {

        }

        if (this.operation == 300) {
            this.loadGrupoModeloForm();
        }

        if (this.operation == 301) {
            this.loadGrupoModeloForm();
        }

        if (this.operation == 302) {
            this.loadClientes();
            this.LoadPaises();
        }

        if (this.operation == 901) {
            this.loadClientesForm();
            this.loadMarcasForm();
            this.loadModelosForm();
        }

        if (this.operation == 902) {
            this.loadClientesForm();
        }

        if (this.operation == 904) {
            this.loadClientesForm();

            this.loadModelosForm();
            this.loadRadiotipoForm();
        }

        if (this.operation == 905) {
            this.loadContrapesoForm();
        }

        if (this.operation == 906) {
            this.loadTejidosForm();
        }


        if (this.operation == 907) {
            this.loadClientesForm();
        }

        if (this.operation == 908) {
            this.loadClientesForm();
        }

        if (this.operation == 910) {
            this.loadClientesForm();
            this.loadGuiasForm();
        }
        if (this.operation == 912) {
            this.loadGrupoSpModeloForm();
        }

        if (this.operation == 913) {
            this.loadClientesForm();
            this.loadTejidosForm();
            this.loadColoresForm();
        }

        if (this.operation == 914) {
            this.loadClientesForm();
            this.loadCajonesForm();
        }

        if (this.operation == 915) {
            this.loadClientesForm();
            this.loadCajonesForm();
        }

        this.FilterField(this.operation);
    }

    ChangeFamilia(value) {

        if (value != "-1") {
            this.loadSubFamilias(value);

        }
        //console.log(value);
    }

    Sel_1(item) {
        item.sel = !item.sel;
    }

    Sel_2(item) {
        item.imp = !item.imp;
    }



    CargarDocumento() {

        this.canAdd = 0;
        this.canDel = 0;
        this.canEdit = 0;
        this.operationModal = 1;

        this.loadMaster();


        if (this.operation == 100) {
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Colores";
            this.formModel = this.formModel_100;
            this.url = this.service.Master_NH_Farben_GetURL();
            this.gridModel = gridmodel("colores");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 101) {
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Familias";
            this.formModel = this.formModel_101;
            this.url = this.service.Master_NH_Familien_GetURL();
            this.gridModel = gridmodel("familias");
            this.BuildGrid(this.url, this.formModel, this.gridModel);

        }

        if (this.operation == 102) {
            this.canAdd = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Composiciones";
            this.formModel = this.formModel_102;
            this.url = this.service.Master_NH_Composicion_GetURL();
            this.gridModel = gridmodel("composiciones");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 103) {
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Calidades";
            this.formModel = this.formModel_103;
            this.url = this.service.Master_NH_Calidad_GetURL();
            this.gridModel = gridmodel("calidades");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 104) {
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de SubFamilias";
            this.formModel = this.formModel_104;
            this.url = this.service.Master_NH_SubFamilien_GetURL();
            this.gridModel = gridmodel("subfamilias");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 105) {
            this.canAdd = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Categorías";
            this.formModel = this.formModel_105;
            this.url = this.service.Master_NH_Categoria_GetURL();
            this.gridModel = gridmodel("categorias");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 106) {
            this.canEdit = 1;
            this.Filter_Articles = 1;
            this.title = 'Gestión de Artículos';
            this.formModel = this.formModel_106;
            this.BuildURL();
            this.gridModel = gridmodel("articulos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 107) {
            this.canAdd = 1;
            this.canEdit = 1;
            this.canDel = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Usuarios";
            this.formModel = this.formModel_107;
            this.url = this.service.Master_NH_Usuario_GetURL();
            this.gridModel = gridmodel("usuarios");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 108) {
            this.canAdd = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Clientes";
            this.formModel = this.formModel_108;
            this.url = this.service.HTTP_Url_Get("/sm/Clientes/1");
            this.gridModel = gridmodel("clientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 109) {
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifas de Artículos Publicados";
            this.formModel = this.formModel_109;
            this.url = this.service.HTTP_Url_Get("/sm/tarifa2");
            this.gridModel = gridmodel("tarifasV2");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 110) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Catálogo de Lineas por Categorias";
            this.formModel = this.formModel_110;
            this.url = this.service.HTTP_Url_Get("/sm/lineas");
            this.gridModel = gridmodel("lineas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 111) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Catálogo de SubLineas por Lineas";
            this.formModel = this.formModel_111;
            this.url = this.service.HTTP_Url_Get("/sm/sublineas");
            this.gridModel = gridmodel("sublineas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 112) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Catálogo de Categorias Principales";
            this.formModel = this.formModel_112;
            this.url = this.service.HTTP_Url_Get("/sm/categoriasm");
            this.gridModel = gridmodel("categoriasm");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 113) {  /* STOCK */
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Stock Publicado";
            this.formModel = this.formModel_113;
            this.url = this.service.HTTP_Url_Get("/sm/view_stock");
            this.gridModel = gridmodel("nh_stock");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 114) {  /* ARTICULOS RELACIONADOS */
            this.canEdit = 1;
            this.Filter_Articles = 1;
            this.title = "Gestión de Artículos Relacionados";
            this.formModel = this.formModel_106;
            this.BuildURL();
            this.gridModel = gridmodel("articulos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }


        if (this.operation == 115) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Catálogo de Opciones de SubLineas";
            this.formModel = this.formModel_115;
            this.url = this.service.HTTP_Url_Get("/sm/sublineas_lineas");
            this.gridModel = gridmodel("sublineas_lineas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 116) {
            this.canAdd = 0;
            this.canDel = 0;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.title = "Facturas Exportadas";
            this.formModel = this.formModel_116;
            this.url = this.service.HTTP_Url_Get("/sm/api_invoices");
            this.gridModel = gridmodel("apiinvoices");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 117) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Catálogo de Atributos";
            this.formModel = this.formModel_117;
            this.url = this.service.HTTP_Url_Get("/sm/atributos");
            this.gridModel = gridmodel("api_atributos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }


        if (this.operation == 200) {
            this.loadClientes();
            this.loadTejidos();
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Tejidos";
            this.formModel = this.formModel_200;
            this.url = this.service.HTTP_Url_Get("/sm/tejidos");
            this.gridModel = gridmodel("sm_tejidos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
            this.parametros = this.Tejidos_Parametros;
        }

        if (this.operation == 201) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = 'Tipos de Accionamientos';
            this.formModel = this.formModel_201;
            this.url = this.service.HTTP_Url_Get('/sm/accionamientos');
            this.gridModel = gridmodel('sm_accionamientos');
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 202) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.title = "Gestión de Colores y Marcas";
            this.formModel = this.formModel_202;
            this.url = this.service.HTTP_Url_Get("/sm/colores");
            this.gridModel = gridmodel("sm_coloresmarcas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 203) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Contrapesos";
            this.formModel = this.formModel_203;
            this.url = this.service.HTTP_Url_Get("/sm/contrapesos");
            this.gridModel = gridmodel("sm_contrapesos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 204) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Soportes";
            this.formModel = this.formModel_204;
            this.url = this.service.HTTP_Url_Get("/sm/soportes");
            this.gridModel = gridmodel("sm_soportes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 205) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Tapas";
            this.formModel = this.formModel_205;
            this.url = this.service.HTTP_Url_Get("/sm/tapas");
            this.gridModel = gridmodel("sm_tapas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }


        if (this.operation == 206) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Tubos";
            this.formModel = this.formModel_206;
            this.url = this.service.HTTP_Url_Get("/sm/tubos");
            this.gridModel = gridmodel("sm_tubos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 207) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Embalajes";
            this.formModel = this.formModel_207;
            this.url = this.service.HTTP_Url_Get("/sm/embalajes");
            this.gridModel = gridmodel("sm_embalajes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }


        if (this.operation == 208) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Empaquetados";
            this.formModel = this.formModel_208;
            this.url = this.service.HTTP_Url_Get("/sm/empaquetados");
            this.gridModel = gridmodel("sm_empaquetados");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 209) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Instalaciones de Cortina";
            this.formModel = this.formModel_209;
            this.url = this.service.HTTP_Url_Get("/sm/instalaciones");
            this.gridModel = gridmodel("sm_instalaciones");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 210) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Posición de Mando";
            this.formModel = this.formModel_210;
            this.url = this.service.HTTP_Url_Get("/sm/posicionmando");
            this.gridModel = gridmodel("sm_posicionmando");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }


        if (this.operation == 211) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Clientes";
            this.formModel = this.formModel_211;
            this.url = this.service.HTTP_Url_Get("/sm/clientesapi");
            this.gridModel = gridmodel("sm_clientesapi");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 212) {

            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Tejidos de Clientes";
            this.formModel = this.formModel_212;
            this.url = this.service.HTTP_Url_Get("/sm/tejidos_clientes_descripcion");
            this.gridModel = gridmodel("sm_tejidosclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 213) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Estancias";
            this.formModel = this.formModel_213;
            this.url = this.service.HTTP_Url_Get("/sm/estancias");
            this.gridModel = gridmodel("sm_estancias");
            this.BuildGrid(this.url, this.formModel, this.gridModel);

        }

        if (this.operation == 214) {
            this.canAdd = 0;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Promociones de Clientes";
            this.formModel = this.formModel_214;
            this.url = this.service.HTTP_Url_Get("/sm/clientes_promociones");
            this.gridModel = gridmodel("sm_promociones");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 215) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Traducciones de Colores de Clientes";
            this.formModel = this.formModel_215;
            this.url = this.service.HTTP_Url_Get("/sm/colores_tejidos_atributos");
            this.gridModel = gridmodel("sm_coloresclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 216) {
            this.canAdd = 0;
            this.canDel = 0;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.title = 'Permisos de Accionamientos a Clientes';
            this.formModel = this.formModel_216;
            this.url = this.service.HTTP_Url_Get('/sm/accionamientos_clientes');
            this.gridModel = gridmodel('sm_accionamientosclientes');
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 217) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = 'Diccionario de Accionamientos';
            this.formModel = this.formModel_217;
            this.url = this.service.HTTP_Url_Get('/sm/accionamientosmarcas_clientes');
            this.gridModel = gridmodel('sm_accionamientosmarcasclientes');
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 218) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = 'Modelos de Accionamientos';
            this.formModel = this.formModel_218;
            this.url = this.service.HTTP_Url_Get('/sm/accionamientostipos_config');
            this.gridModel = gridmodel('sm_accionamientostiposclientes');
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 219) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Asignación de Soportes de Clientes";
            this.formModel = this.formModel_219;
            this.url = this.service.HTTP_Url_Get("/sm/soportesclientes");
            this.gridModel = gridmodel("sm_soportesclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 220) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Asignación de Tapas de Clientes";
            this.formModel = this.formModel_220;
            this.url = this.service.HTTP_Url_Get("/sm/tapasclientes");
            this.gridModel = gridmodel("sm_tapasclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 221) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Asignación de Contrapesos de Clientes";
            this.formModel = this.formModel_221;
            this.url = this.service.HTTP_Url_Get("/sm/contrapesosclientes");
            this.gridModel = gridmodel("sm_contrapesosclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 222) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Catálogo de Colores de Contrapesos de Clientes";
            this.formModel = this.formModel_222;
            this.url = this.service.HTTP_Url_Get("/sm/contrapesoscolores_clientes");
            this.gridModel = gridmodel("sm_contrapesoscoloresclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 223) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Catálogo de Colores de Soportes";
            this.formModel = this.formModel_223;
            this.url = this.service.HTTP_Url_Get("/sm/soportescolores_clientes");
            this.gridModel = gridmodel("sm_soportescoloresclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 224) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Catálogo de Colores de Tapas";
            this.formModel = this.formModel_224;
            this.url = this.service.HTTP_Url_Get("/sm/tapascolores_clientes");
            this.gridModel = gridmodel("sm_tapascoloresclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 225) {
            this.canAdd = 0;
            this.canDel = 0;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Catálogo de Colores de Tejidos";
            this.formModel = this.formModel_225;
            this.url = this.service.HTTP_Url_Get("/sm/tejidos_colores");
            this.gridModel = gridmodel("sm_tejidoscolores");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 226) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Mapa de Accionamientos";
            this.formModel = this.formModel_226;
            this.url = this.service.HTTP_Url_Get("/sm/accionamientos_mapa");
            this.gridModel = gridmodel("sm_accionamientosmapa");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 229) {
            this.canAdd = 0;
            this.canDel = 1;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.operationModal = 1;
            this.title = "Catálogo de Tejidos del Cliente por Producto";
            this.formModel = this.formModel_229;
            this.url = this.service.HTTP_Url_Get("/sm/tejidos_cliente_producto");
            this.gridModel = gridmodel("sm_tejidosclienteproducto");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 230) {
            this.canAdd = 0;
            this.canDel = 0;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.title = "Gestión de Clientes Importados";
            this.formModel = this.formModel_230;
            this.url = this.service.HTTP_Url_Get("/sm/clientes_import");
            this.gridModel = gridmodel("sm_clientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 300) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Cajones ZIP";
            this.formModel = this.formModel_300;
            this.url = this.service.HTTP_Url_Get("/sm/cajon");
            this.gridModel = gridmodel("cajones");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 301) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Guias ZIP";
            this.formModel = this.formModel_301;
            this.url = this.service.HTTP_Url_Get("/sm/guia");
            this.gridModel = gridmodel("guias");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 302) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tiendas de los Clientes API";
            this.formModel = this.formModel_302;
            this.url = this.service.HTTP_Url_Get("/sm/clientesapi_tiendas/1");
            this.gridModel = gridmodel("sm_clientesapi_tiendas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 901) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Incrementos Genericos";
            this.formModel = this.formModel_901;
            this.url = this.service.HTTP_Url_Get("/sm/incrementosG");
            this.gridModel = gridmodel("sm_incrementosgenericos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 902) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifas Accionamientos Clientes";
            this.formModel = this.formModel_902;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_accionamientos_clientes_tarifas");
            this.gridModel = gridmodel("sm_accionamientos_clientes_tarifas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 903) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Accionamientos Radio Tipo";
            this.formModel = this.formModel_903;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_accionamientos_radio_tipo");
            this.gridModel = gridmodel("sm_accionamientos_radio_tipo");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 904) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Accionamientos Radio Tipo Cliente";
            this.formModel = this.formModel_904;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_accionamientos_radio_tipo_cliente");
            this.gridModel = gridmodel("sm_accionamientos_radio_tipo_cliente");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 905) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifa Contrapeso Clientes";
            this.formModel = this.formModel_905;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_contrapeso_clientes_tarifas");
            this.gridModel = gridmodel("sm_contrapeso_clientes_tarifas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 906) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifa Tejido Vertical";
            this.formModel = this.formModel_906;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_tarifa_tejido_vertical");
            this.gridModel = gridmodel("sm_tarifa_tejido_vertical");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 907) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifa Accesorios Clientes";
            this.formModel = this.formModel_907;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_accesorios_tarifas");
            this.gridModel = gridmodel("sm_accesorios_tarifas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 908) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifa Mecanismo Japones";
            this.formModel = this.formModel_908;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_mecanismo_japones_tarifas");
            this.gridModel = gridmodel("sm_mecanismo_japones_tarifas");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 909) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Tarifa Mecanismo Vertical";
            this.formModel = this.formModel_909;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_tarifa_mecanismo_vertical");
            this.gridModel = gridmodel("sm_tarifa_mecanismo_vertical");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 910) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión Incremetos Guias";
            this.formModel = this.formModel_910;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_incrementos");
            this.gridModel = gridmodel("sm_incrementos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 911) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión Incremetos Lacados";
            this.formModel = this.formModel_911;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_incrementos_lacados");
            this.gridModel = gridmodel("sm_incrementos_lacados");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 912) {
            this.canAdd = 1;
            this.canDel = 0;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión Grupos Modelos";
            this.formModel = this.formModel_912;
            this.url = this.service.HTTP_Url_Get("/sm/grupomodelos");
            this.gridModel = gridmodel("sm_grupo_modelo");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 913) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión de Atributos de Tejidos";
            this.formModel = this.formModel_913;
            this.url = this.service.HTTP_Url_Get("/sm/tejidos_atributos");
            this.gridModel = gridmodel("sm_tejidos_atributos");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 914) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 0;
            this.Filter_Articles = 0;
            this.title = "Gestión de Cajones Clientes";
            this.formModel = this.formModel_914;
            this.url = this.service.HTTP_Url_Get("/sm/cajoncliente");
            this.gridModel = gridmodel("sm_cajonesclientes");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

        if (this.operation == 915) {
            this.canAdd = 1;
            this.canDel = 1;
            this.canEdit = 1;
            this.Filter_Articles = 0;
            this.title = "Gestión Incremetos Cajones";
            this.formModel = this.formModel_915;
            this.url = this.service.HTTP_Url_Get("/sm/articulos_incrementos_cajones");
            this.gridModel = gridmodel("sm_incrementos_cajones");
            this.BuildGrid(this.url, this.formModel, this.gridModel);
        }

    }



    Update() {


        let json: string = JSON.stringify(this.formModel);
        if (this.operation == 100) {
            this.service.Master_NH_Farben_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 101) {
            this.service.Master_NH_Familien_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 102) {
            this.service.Master_NH_Composicion_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 103) {
            this.service.Master_NH_Calidad_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 104) {
            this.service.Master_NH_SubFamilien_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 105) {
            this.service.Master_NH_Categoria_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 106) {
            this.service.Master_NH_Articulo_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 107) {

            let json: string = JSON.stringify(this.user);
            this.service.Master_NH_Usuario_Set(json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }



        if (this.operation == 109 ||
            this.operation == 110 ||
            this.operation == 111 ||
            this.operation == 112 ||
            this.operation == 115 ||
            this.operation == 117 ||
            this.operation == 200 ||
            this.operation == 201 ||
            this.operation == 202 ||
            this.operation == 203 ||
            this.operation == 204 ||
            this.operation == 205 ||
            this.operation == 206 ||
            this.operation == 207 ||
            this.operation == 208 ||
            this.operation == 209 ||
            this.operation == 210 ||
            this.operation == 211 ||
            this.operation == 212 ||
            this.operation == 213 ||
            this.operation == 214 ||
            this.operation == 215 ||
            this.operation == 217 ||
            this.operation == 218 ||
            this.operation == 219 ||
            this.operation == 220 ||
            this.operation == 221 ||
            this.operation == 222 ||
            this.operation == 223 ||
            this.operation == 224 ||
            this.operation == 300 ||
            this.operation == 301 ||
            this.operation == 901 ||
            this.operation == 902 ||
            this.operation == 903 ||
            this.operation == 904 ||
            this.operation == 905 ||
            this.operation == 906 ||
            this.operation == 907 ||
            this.operation == 908 ||
            this.operation == 909 ||
            this.operation == 910 ||
            this.operation == 911 ||
            this.operation == 912 ||
            this.operation == 913 ||
            this.operation == 914 ||
            this.operation == 915) {

            var route = "/tejido";
            if (this.operation == 109) route = "/tarifa2";
            if (this.operation == 110) route = "/linea";
            if (this.operation == 111) route = "/sublinea";
            if (this.operation == 115) route = "/sublineas_lineas";
            if (this.operation == 112) route = "/categoriam";
            if (this.operation == 117) route = "/atributos";
            if (this.operation == 201) route = "/accionamiento";
            if (this.operation == 202) route = "/color";
            if (this.operation == 203) route = "/contrapeso";
            if (this.operation == 204) route = "/soporte";
            if (this.operation == 205) route = "/tapa";
            if (this.operation == 206) route = "/tubo";
            if (this.operation == 207) route = "/embalaje";
            if (this.operation == 208) route = "/empaquetado";
            if (this.operation == 209) route = "/instalacion";
            if (this.operation == 210) route = "/posicionmando";
            if (this.operation == 211) route = "/clienteapi";
            if (this.operation == 212) route = "/tejidos_descripcion";
            if (this.operation == 213) route = "/estancia";
            if (this.operation == 214) route = "/clientes_promociones";
            if (this.operation == 215) route = "/tejidos_colores_traduccion";
            if (this.operation == 217) route = "/accionamientos_clientes_traduccion_update";
            if (this.operation == 218) route = "/accionamientostipos_config";
            if (this.operation == 219) route = "/soportesclientes";
            if (this.operation == 220) route = "/tapasclientes";
            if (this.operation == 221) route = "/contrapesosclientes";
            if (this.operation == 222) route = "/contrapesoscolor";
            if (this.operation == 223) route = "/soportescolores";
            if (this.operation == 224) route = "/tapascolores";
            if (this.operation == 300) route = "/put_cajon";
            if (this.operation == 301) route = "/put_guia";
            if (this.operation == 302) route = "/domicilios";
            if (this.operation == 901) route = "/incremetosgenericos";
            if (this.operation == 902) route = "/accionamientos_clientes_tarifas";
            if (this.operation == 903) route = "/accionamientos_radio_tipo";
            if (this.operation == 904) route = "/accionamientos_radio_tipo_cliente";
            if (this.operation == 905) route = "/contrapeso_clientes_tarifas";
            if (this.operation == 906) route = "/tarifa_tejido_vertical";
            if (this.operation == 907) route = "/accesorios_tarifas";
            if (this.operation == 908) route = "/mecanismo_japones_tarifas";
            if (this.operation == 909) route = "/tarifa_mecanismo_vertical";
            if (this.operation == 910) route = "/articulosincrementos";
            if (this.operation == 911) route = "/articulosincrementoslacados";
            if (this.operation == 912) route = "/grupomodelo";
            if (this.operation == 913) route = "/tejidos_atributos_put";
            if (this.operation == 914) route = "/put_cajoncliente";
            if (this.operation == 915) route = "/articulosincrementoscajones";


            this.service.HTTP_Post(route, json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                        this.toaster.success("Operación Realizada", "Actualización");
                    }
                    else {
                        this.toaster.error("Operación NO Realizada", "Actualización");
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

    }

    All(value) {

        if (value == 1) {
            this.myGrid.selectallrows();
        }
        else {
            this.myGrid.clearselection();
        }

    }

    DeleteValues(values) {

        var route = "";

        if (this.operation == 107) {
            var route = "/user_del";
        }

        if (this.operation == 110) {
            var route = "/lineas_del";
        }

        if (this.operation == 111) {
            var route = "/sublineas_del";
        }

        if (this.operation == 117) {
            var route = "/atributos_del";
        }

        if (this.operation == 200) {
            var route = '/tejidos_del';
        }

        if (this.operation == 211) {
            var route = '/clienteapi_del';
        }

        if (this.operation == 212) {
            var route = '/tejidos_cliente_del';
        }

        if (this.operation == 215) {
            var route = '/tejidos_colores_traduccion_del';
        }

        if (this.operation == 217) {
            var route = '/accionamientosmarcas_clientes_del';
        }

        if (this.operation == 115) {
            var route = '/sublineas_lineas_del';
        }

        if (this.operation == 219) {
            var route = '/soportesclientes_delete';
        }

        if (this.operation == 220) {
            var route = '/tapasclientes_delete';
        }

        if (this.operation == 221) {
            var route = '/contrapesosclientes_delete';
        }

        if (this.operation == 222) {
            var route = '/contrapesoscolor_delete';
        }

        if (this.operation == 223) {
            var route = '/soportescolores_delete';
        }

        if (this.operation == 224) {
            var route = '/tapascolores_delete';
        }

        if (this.operation == 229) {
            var route = '/tejidos_cliente_producto_operate';
        }

        if (this.operation == 226) {
            var route = '/accionamientos_mapa_del';
        }

        if (this.operation == 300) {
            var route = '/cajones_del';
        }

        if (this.operation == 301) {
            var route = '/guias_del';
        }

        if (this.operation == 302) {
            var route = '/domicilios_del';
        }

        if (this.operation == 901) {
            var route = '/incremetosG_del';
        }

        if (this.operation == 902) {
            var route = '/accionamientos_clientes_tarifas_del';
        }

        if (this.operation == 903) {
            var route = '/accionamientos_radio_tipo_del';
        }

        if (this.operation == 904) {
            var route = '/accionamientos_radio_tipo_cliente_del';
        }

        if (this.operation == 905) {
            var route = '/contrapeso_clientes_tarifas_del';
        }

        if (this.operation == 906) {
            var route = '/tarifa_tejido_vertical_del';
        }

        if (this.operation == 907) {
            var route = '/accesorios_tarifas_del';
        }

        if (this.operation == 908) {
            var route = '/mecanismo_japones_tarifas_del';
        }

        if (this.operation == 909) {
            var route = '/tarifa_mecanismo_vertical_del';
        }

        if (this.operation == 910) {
            var route = '/incremetos_del';
        }

        if (this.operation == 911) {
            var route = '/incremetos_lacados_del';
        }

        if (this.operation == 913) {
            var route = '/tejidos_atributod_del';
        }

        if (this.operation == 914) {
            var route = '/cajoncliente_del';
        }

        if (this.operation == 915) {
            var route = '/incremetoscajones_del';
        }

        this.service.HTTP_Post(route, values).subscribe(
            data => {

                if (data.message == "OK") {
                    this.toaster.success("Borrado Realizado", "Borrado de Selección");
                    this.refresh();
                    this.myGrid.clearselection();
                } else {
                    this.toaster.error("Borrado NO Realizado", "Borrado de Selección");
                }
            },
            error => {
                console.log(error);
            }
        );





    }

    Publish(value) {

        if (this.operation == 100) {
            this.service.Master_NH_Farben_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 101) {
            this.service.Master_NH_Familien_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 102) {
            this.service.Master_NH_Composicion_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 103) {
            this.service.Master_NH_Calidad_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 104) {
            this.service.Master_NH_SubFamilien_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 105) {
            this.service.Master_NH_Categoria_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        if (this.operation == 106) {
            this.service.Master_NH_Articulo_Publish(value).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

        this.myGrid.clearselection();
    }

    BuildGrid(url: string, formModel: any, gridModel: any) {

        this.url = url;
        this.formModel = formModel;
        this.gridModel = gridModel;
        this.formGroup = this.formService.createFormGroup(this.formModel);
        this.source.datafields = this.gridModel.datafields;
        this.settings.columns = this.gridModel.columns;
        this.settings.columngroups = this.gridModel.columngroups;
    }

    getValueByKey(key, data) {
        var i, len = data.length;
        for (i = 0; i < len; i++) {
            if (data[i] && data[i].hasOwnProperty(key)) {
                return data[i][key];
            }
        }
        return -1;
    }

    refresh() {
        this.BuildURL();
        this.source.url = this.url;
        this.myGrid.updatebounddata("cells");

        if (this.operation == 200) {
            this.myGrid.selectionmode('checkbox');
        } else {
            this.myGrid.selectionmode('singlerow');
        }
    }

    NoConfirmar_Agrupacion() {
        this.relacion.from = "";
        this.relacion.to1 = "";
        this.relacion.to2 = "";
        this.relacion.to3 = "";
        this.relacion.to4 = "";
        this.relacion.to5 = "";
        this.relacion.to6 = "";
    }

    Confirmar_Agrupacion() {
        if (confirm("¿Desea guardar la Relación Generada?")) {
            let json: string = JSON.stringify(this.relacion);
            this.service.HTTP_Post("/articulos_relacion_agrupacion", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Relación');
                        this.refresh();
                    }

                    this.NoConfirmar_Agrupacion();
                },
                error => {
                    console.log(error);
                }
            );


        }
    }

    NoConfirmar() {
        this.Seleccion_Origen = [];
        this.Seleccion_Destino = [];
        this.Seleccion_Origen2 = [];
        this.Seleccion_Destino2 = [];
    }

    Confirmar() {
        if (confirm("¿Desea guardar la Relación Generada?")) {


            var values = {
                origen: this.Seleccion_Origen2,
                destino: this.Seleccion_Destino2
            }

            let json: string = JSON.stringify(values);
            this.service.HTTP_Post("/articulos_relacion", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Relación');
                        this.refresh();
                    }

                    this.Seleccion_Origen = [];
                    this.Seleccion_Destino = [];
                    this.Seleccion_Origen2 = [];
                    this.Seleccion_Destino2 = [];
                },
                error => {
                    console.log(error);
                }
            );


        }
    }

    Seleccionar_Origen() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "");
        var arrayData2: any[] = [];
        arrayData2 = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {
            this.Seleccion_Origen.push(arrayData);
            this.Seleccion_Origen2.push(arrayData2);
            //console.log(arrayData);
            this.All(0);
        }
    }

    Seleccionar_Relacion() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "");
        var arrayData2: any[] = [];
        arrayData2 = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {
            //console.log(arrayData);

            this.Seleccion_Destino.push(arrayData);
            this.Seleccion_Destino2.push(arrayData2);
            this.All(0);
        }
        //Seleccion_Destino : any = [];
    }

    delMultiplesValues() {
        var idrow = "idrow";
        if (this.operation == 200) idrow = "idrow";
        if (this.operation == 212) idrow = "idrow";
        if (this.operation == 215) idrow = "idrow";
        if (this.operation == 217) idrow = "iddel";
        if (this.operation == 115) idrow = "idrow";
        if (this.operation == 219) idrow = "idrow";
        if (this.operation == 220) idrow = "idrow";
        if (this.operation == 221) idrow = "idrow";
        if (this.operation == 222) idrow = "idrow";
        if (this.operation == 223) idrow = "idsoporte";
        if (this.operation == 224) idrow = "idtapa";
        if (this.operation == 226) idrow = "Tag";
        if (this.operation == 229) idrow = "idrow";
        if (this.operation == 901) idrow = "id";
        if (this.operation == 902) idrow = "id";
        if (this.operation == 903) idrow = "idrow";
        if (this.operation == 904) idrow = "idrow";
        if (this.operation == 905) idrow = "id";
        if (this.operation == 906) idrow = "ancholama";
        if (this.operation == 907) idrow = "id";
        if (this.operation == 908) idrow = "id";
        if (this.operation == 909) idrow = "ancholama";
        if (this.operation == 910) idrow = "id";
        if (this.operation == 911) idrow = "id";
        if (this.operation == 912) idrow = "idrow";
        if (this.operation == 913) idrow = "idrow";
        if (this.operation == 914) idrow = "idrow";
        if (this.operation == 915) idrow = "id";


        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, idrow);
        var len = arrayData.length;

        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {
            var values = {
                ids: arrayData,
                operation: 0
            };
            this.DeleteValues(values);
        }
    }

    setMultiplesValues(value) {
        var idrow = "";
        if (this.operation == 100) idrow = "colores_nombre";
        if (this.operation == 101) idrow = "nombre";
        if (this.operation == 102) idrow = "idrow";
        if (this.operation == 103) idrow = "idrow";
        if (this.operation == 104) idrow = "idrow";
        if (this.operation == 105) idrow = "idrow";
        if (this.operation == 106) idrow = "idrow";

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, idrow);
        var len = arrayData.length;

        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {
            var values = {
                value: value,
                ids: arrayData
            };
            this.Publish(values);
        }
    }

    setValues() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "");
        var len = arrayData.length;

        if (len = 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len = 1) {

            for (var pos = 0; pos < this.formModel.length; pos++) {

                var id = this.formModel[pos].id;
                var typpe = this.formModel[pos].type;
                var value = this.getValueByKey(id, arrayData);


                if (value != '-1' && typpe === "CHECKBOX") {
                    this.formModel[pos].valueUpdates.next(value);
                }

                if (value != '-1' && typpe === "INPUT") {

                    this.formModel[pos].valueUpdates.next(value);

                    if (this.operation == 214) {
                        if (id == "desde" || id == "hasta") {
                            var strValue = value.toLocaleDateString("es-ES");
                            this.formModel[pos].valueUpdates.next(strValue);
                        }
                    }

                }


                if (value != "-1" && typpe === "SELECT") {


                    if (this.operation == 107) {
                        this.formModel[pos].options = this.clientes;
                        this.formModel[pos].valueUpdates.next(value);
                    }

                    if (this.operation == 107) {
                        this.formModel[pos].options = this.clientes;
                        this.formModel[pos].valueUpdates.next(value);
                    }

                    if (this.operation == 110) {
                        this.formModel[pos].options = this.categorias;
                        this.formModel[pos].valueUpdates.next(value);
                    }

                    if (this.operation == 111) {
                        this.formModel[pos].options = this.lineas;
                        this.formModel[pos].valueUpdates.next(value);
                    }

                    if (this.operation == 112) {
                        this.formModel[pos].options = this.categoriasm;
                        this.formModel[pos].valueUpdates.next(value);
                    }

                    if (this.operation == 115) {
                        this.formModel[pos].options = this.sublineas;
                        this.formModel[pos].valueUpdates.next(value);
                    }



                    if (this.operation == 202) {


                        if (this.formModel[pos].name === "tipo") {
                            this.formModel[pos].options = this.TipoColor;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                        if (this.formModel[pos].name === "impresiondigital") {
                            this.formModel[pos].options = this.ImpresionDigital
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 203) {


                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 204) {


                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 205) {


                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 218) {
                        if (this.formModel[pos].name === "id") {
                            this.formModel[pos].options = this.accionamientos;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 219) {
                        if (this.formModel[pos].name == "soporte") {
                            this.formModel[pos].options = this.soporteform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 220) {
                        if (this.formModel[pos].name == "tapa") {
                            this.formModel[pos].options = this.tapasform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 221) {
                        if (this.formModel[pos].name == "id") {
                            this.formModel[pos].options = this.contrapesoform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 222) {
                        if (this.formModel[pos].name == "contrapeso") {
                            this.formModel[pos].options = this.contrapesoform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "id") {
                            this.formModel[pos].options = this.coloresform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 223) {
                        if (this.formModel[pos].name == "id") {
                            this.formModel[pos].options = this.soporteform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.coloresform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 224) {
                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.tapasform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                        if (this.formModel[pos].name == "id") {
                            this.formModel[pos].options = this.coloresform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 300) {


                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 301) {


                        if (this.formModel[pos].name === "grupo") {
                            this.formModel[pos].options = this.grupomodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }

                    }

                    if (this.operation == 901) {
                        if (this.formModel[pos].name == "marca") {
                            this.formModel[pos].options = this.marcasform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "modelo") {
                            this.formModel[pos].options = this.modelosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "producto") {
                            this.formModel[pos].options = this.productosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }



                    if (this.operation == 902) {

                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 904) {
                        if (this.formModel[pos].name == "id") {
                            this.formModel[pos].options = this.radiotipoform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "modelo") {
                            this.formModel[pos].options = this.modelosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "producto") {
                            this.formModel[pos].options = this.productosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 905) {

                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.contrapesoform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 906) {

                        if (this.formModel[pos].name == "tejido") {
                            this.formModel[pos].options = this.tejidosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 907) {

                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 908) {

                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 910) {

                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }


                        if (this.formModel[pos].name == "value") {
                            this.formModel[pos].options = this.guiasform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 912) {

                        if (this.formModel[pos].name == "modelo") {
                            this.formModel[pos].options = this.grupospmodeloform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 913) {
                        if (this.formModel[pos].name == "tejido") {
                            this.formModel[pos].options = this.tejidosform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "color") {
                            this.formModel[pos].options = this.coloresform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 914) {

                        if (this.formModel[pos].name == "idrow") {
                            this.formModel[pos].options = this.cajonesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }

                    if (this.operation == 915) {

                        if (this.formModel[pos].name == "cliente") {
                            this.formModel[pos].options = this.clientesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }


                        if (this.formModel[pos].name == "value") {
                            this.formModel[pos].options = this.cajonesform;
                            this.formModel[pos].valueUpdates.next(value);
                        }
                    }


                }
            }


        }

        if (len > 1) {
            alert("Esta operación solo permite la selección de 1 linea");
        }
    }

    newValues() {

        for (var pos = 0; pos < this.formModel.length; pos++) {

            var id = this.formModel[pos].id;
            var typpe = this.formModel[pos].type;

            if (typpe == "CHECKBOX") {
                this.formModel[pos].valueUpdates.next(false);
            }

            if (typpe == "INPUT") {
                this.formModel[pos].valueUpdates.next("");
            }

            if (typpe == "SELECT") {

                if (this.operation == 107) {
                    this.formModel[pos].options = this.clientes;
                    this.formModel[pos].valueUpdates.next(1);
                }

                if (this.operation == 111) {
                    this.formModel[pos].options = this.lineas;
                    this.formModel[pos].valueUpdates.next(1);
                }

                if (this.operation == 115) {
                    this.formModel[pos].options = this.sublineas;
                    this.formModel[pos].valueUpdates.next(1);
                }

                if (this.operation == 110) {
                    this.formModel[pos].options = this.categorias;
                    this.formModel[pos].valueUpdates.next(1);
                }

                if (this.operation == 112) {
                    this.formModel[pos].options = this.categoriasm;
                    this.formModel[pos].valueUpdates.next(1);
                }



                if (this.operation == 202) {


                    if (this.formModel[pos].name === "tipo") {
                        this.formModel[pos].options = this.TipoColor;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "impresiondigital") {
                        this.formModel[pos].options = this.ImpresionDigital
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 203) {


                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 204) {


                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 205) {


                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 218) {
                    if (this.formModel[pos].name === "id") {
                        this.formModel[pos].options = this.accionamientos;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 219) {
                    if (this.formModel[pos].name == "soporte") {
                        this.formModel[pos].options = this.soporteform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 220) {
                    if (this.formModel[pos].name == "tapa") {
                        this.formModel[pos].options = this.tapasform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }
                if (this.operation == 221) {
                    if (this.formModel[pos].name == "id") {
                        this.formModel[pos].options = this.contrapesoform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name === "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 222) {
                    if (this.formModel[pos].name == "contrapeso") {
                        this.formModel[pos].options = this.contrapesoform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name === "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name === "id") {
                        this.formModel[pos].options = this.coloresform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 223) {
                    if (this.formModel[pos].name == "id") {
                        this.formModel[pos].options = this.soporteform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name === "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name === "idrow") {
                        this.formModel[pos].options = this.coloresform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 224) {
                    if (this.formModel[pos].name == "idrow") {
                        this.formModel[pos].options = this.tapasform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "id") {
                        this.formModel[pos].options = this.coloresform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 300) {


                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 301) {


                    if (this.formModel[pos].name === "grupo") {
                        this.formModel[pos].options = this.grupomodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 901) {


                    if (this.formModel[pos].name === "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "producto") {
                        this.formModel[pos].options = this.productosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "marca") {
                        this.formModel[pos].options = this.marcasform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                    if (this.formModel[pos].name === "modelo") {
                        this.formModel[pos].options = this.modelosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }

                }

                if (this.operation == 902) {

                    if (this.formModel[pos].name == "idrow") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 904) {
                    if (this.formModel[pos].name == "id") {
                        this.formModel[pos].options = this.radiotipoform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "modelo") {
                        this.formModel[pos].options = this.modelosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "producto") {
                        this.formModel[pos].options = this.productosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 905) {

                    if (this.formModel[pos].name == "idrow") {
                        this.formModel[pos].options = this.contrapesoform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 906) {

                    if (this.formModel[pos].name == "tejido") {
                        this.formModel[pos].options = this.tejidosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 907) {

                    if (this.formModel[pos].name == "idrow") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 908) {

                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 910) {

                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }


                    if (this.formModel[pos].name == "value") {
                        this.formModel[pos].options = this.guiasform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 912) {

                    if (this.formModel[pos].name == "modelo") {
                        this.formModel[pos].options = this.grupospmodeloform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 913) {
                    if (this.formModel[pos].name == "tejido") {
                        this.formModel[pos].options = this.tejidosform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "color") {
                        this.formModel[pos].options = this.coloresform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 914) {

                    if (this.formModel[pos].name == "idrow") {
                        this.formModel[pos].options = this.cajonesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

                if (this.operation == 915) {

                    if (this.formModel[pos].name == "cliente") {
                        this.formModel[pos].options = this.clientesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }


                    if (this.formModel[pos].name == "value") {
                        this.formModel[pos].options = this.cajonesform;
                        this.formModel[pos].valueUpdates.next(1);
                    }
                }

            }

        }
    }

    Publicar(value) {
        if (confirm("¿Desea Aplicar la Operación a la Selección?")) {
            this.setMultiplesValues(value);
        }
    }

    DeleteSel() {
        if (confirm("¿Desea Borrar la Selección Realizada?")) {
            this.delMultiplesValues();
        }
    }

    Bindingcomplete(event) {
        this.BindingComplete = true;
    }

    Filter(event) {
    }

    /*
      Edit the Selected Field
    */
    Edit() {

        if (this.operation == 302) {

            var arrayData: any[] = [];
            arrayData = this.getSelectedRows(this.myGrid, "");
            var len = arrayData.length;

            if (len = 0) {
                alert("No ha seleccionado ninguna linea");
            }

            if (len = 1) {
                console.log(arrayData);
                this.tiendasClientes.idrow = arrayData[0].idrow;
                this.tiendasClientes.operation = 1;
                this.tiendasClientes.Cliente = arrayData[0].cliente;
                this.tiendasClientes.Pais = arrayData[0].pais;
                this.tiendasClientes.Nombre = arrayData[0].nombre;
                this.tiendasClientes.Poblacion = arrayData[0].poblacion;
                this.tiendasClientes.Provincia = arrayData[0].provincia;
                this.tiendasClientes.Telefono = arrayData[0].telefono_1;
                this.tiendasClientes.Email = arrayData[0].email_1;
                this.tiendasClientes.DiasTransporte = arrayData[0].diastransporte;
                this.tiendasClientes.CodSolupyme = arrayData[0].codsolupyme;
                this.tiendasClientes.Centro = arrayData[0].centro;
                this.tiendasClientes.Usuario = arrayData[0].Usuario;
                this.tiendasClientes.Password = arrayData[0].Password;
            }

            this.domiciliosModal.show();
        }
        else
            if (this.operation == 107) {
                var arrayData: any[] = [];
                arrayData = this.getSelectedRows(this.myGrid, "");
                var len = arrayData.length;

                if (len = 0) {
                    alert("No ha seleccionado ninguna linea");
                }

                if (len = 1) {
                    this.usersModal.show();
                    this.user.idrow = arrayData[0].idrow;
                    this.user.nombre = arrayData[0].name;
                    this.user.apellidos = arrayData[0].surname;
                    this.user.email = arrayData[0].email;
                    this.user.empresa = arrayData[0].empresa;
                    this.ChangeEmpresa(arrayData[0].subempresa);
                }

            }
            else {
                if (this.operationModal == 2) {
                    this.modal2.show();
                }
                if (this.operationModal == 1) {
                    this.modal.show();
                }
                this.setValues();
            }
    }

    /*
    */
    Add() {

        if (this.operation == 107) {
            this.usersModal.show();
            return;
        }

        if (this.operation == 226) {
            this.accionamientosModal.show();
            return;
        }

        if (this.operation == 302) {
            this.domiciliosModal.show();
            return;
        }


        if (this.operationModal == 2) {
            this.modal2.show();
        }

        if (this.operationModal == 1) {
            this.modal.show();
        }
        this.newValues();

    }

    Export() {
        var pathExportScript = this.service.Export();
        this.myGrid.exportdata("xls", "export", true, undefined, false, pathExportScript);

        //var data = this.myGrid.exportdata('json');
        //new Angular2Csv(data, 'Export');

    }

    Log() {
        console.log("value");
    }

    Select(event) {
        //console.log(event.args.row.bounddata.id);
        //operation==200

        /*
        if (this.operation == 200) {
            var arrayData = [];
            arrayData = this.getSelectedRows(this.myGrid, "idrow");
            var len = arrayData.length;
            if (len === 1) {
                this.editSheet = true;
            } else {
                this.editSheet = false;
            }
        }
        */
    }

    EditSheetSelect() {

        if (this.operation == 200) {
            var arrayData: any[] = [];
            arrayData = this.getSelectedRows(this.myGrid, "idrow");
            var len = arrayData.length;
            if (len === 1) {
                this.editSheetValue = arrayData[0];
                this.EditSheetGetData();
                this.modalEdit.show();
            } else {
                this.editSheet = false;
            }
        }
    }

    EditSheetClose() {
        this.All(0);
        this.modalEdit.hide();
    }

    EditSheetGetData() {

        const url = '/tejido_ext/' + this.editSheetValue;
        this.service.HTTP_Get('/sm' + url).subscribe(
            data => {
                this.model.info_tecnica = data.Table[0].info_tecnica;
                this.model.opacidad = data.Table[0].opacidad;
                this.model.uso_recomendado = data.Table[0].uso_recomendado;
                this.model.editorData = this.model.uso_recomendado;
                this.model.editorData2 = this.model.info_tecnica;
                this.model.editorData3 = this.model.opacidad;
            },
            error => {
                console.log(error);
            }
        );
    }

    SaveSheetData() {

        const url = '/tejidos_ext_set';
        var modelo = {
            id: this.editSheetValue,
            type: 1,
            value: this.model.editorData,
            value2: this.model.editorData2,
            value3: this.model.editorData3
        }

        var values = JSON.stringify(modelo);

        this.service.HTTP_Post(url, values).subscribe(
            data => {
                this.refresh();
            },
            error => {

            }
        );



    }

    SetDocumentEXP(value) {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "id");
        if (arrayData.length > 0) {
            var ids = arrayData.join("|");
            if (confirm("¿Desea cambiar el estado del cliente?")) {
                var url = "/clientes_estado/" + ids + "/" + value;
                this.service.HTTP_Get('/sm' + url).subscribe(
                    data => {
                        this.All(0);
                        this.refresh();
                    },
                    error => {
                        console.log(error);
                    }
                );
            }
        } else {
            alert("No ha seleccionado ninguna linea")
        }
    }

    getField(rowsSelected: any, field: string) {
        var arrayData: any[] = [];
        for (var i = 0; i < rowsSelected.length; i++) {
            var index = rowsSelected[i];
            arrayData.push(index[field]);
        }
        return arrayData;
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

                if (this.operation == 906) {
                    arrayData.push(row["tejido"]);
                }

                if (this.operation == 909) {
                    arrayData.push(row["ancho"]);
                }

                if (this.operation == 914) {
                    arrayData.push(row["cliente"]);
                }

            }
        }
        return arrayData;
    }

    BorrarImagen() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len >= 1) {
            if (confirm("¿Desea Proceder a Borrar las Imágenes de los artículos seleccionados?")) {
                var values = {
                    ids: arrayData
                }

                let json: string = JSON.stringify(values);

                this.service.HTTP_Post("/delete_images", json).subscribe(
                    data => {
                        if (data.message == "OK") {
                            this.toaster.success('Borrado de Imagenes', 'Borrado de Imagenes');
                            this.refresh();
                            this.All(0);
                        }
                    },
                    error => {
                        console.log(error);
                    }
                );
            }
        }

    }

    VerImagen() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "web_image_1");
        let len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 1) {
            this.All(0);
            alert("Solamente se puede seleccionar una linea");
        }

        if (len = 1) {
            let url = this.service.Master_NH_Upload_GetURL(arrayData[0]);
            this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
        }
    }

    UpdateGenericos() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        let len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            let values = {
                ids: arrayData,
                caracteristicas: this.producto.caracteristicas,
                beneficios: this.producto.beneficios,
                recomendado: this.producto.recomendado,
                aportamos: this.producto.queaportamos,
                caracteristicas_en: this.producto.caracteristicas_en,
                beneficios_en: this.producto.beneficios_en,
                recomendado_en: this.producto.recomendado_en,
                aportamos_en: this.producto.queaportamos_en,
                caracteristicas_fr: this.producto.caracteristicas_fr,
                beneficios_fr: this.producto.beneficios_fr,
                recomendado_fr: this.producto.recomendado_fr,
                aportamos_fr: this.producto.queaportamos_fr
            };
            let json: string = JSON.stringify(values);

            this.service.HTTP_Post("/articulos_genericos", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Genéricos');
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }

    UpdateGenericos2() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            var values = {
                ids: arrayData,
                tamano_l1: this.producto2.tamano_l1,
                tamano_l2: this.producto2.tamano_l2,
                tamano_l3: this.producto2.tamano_l3,
                referencia_l1: this.producto2.referencia_l1,
                referencia_l2: this.producto2.referencia_l2,
                referencia_l3: this.producto2.referencia_l3,
                composicion_l1: this.producto2.composicion_l1,
                composicion_l2: this.producto2.composicion_l2,
                composicion_l3: this.producto2.composicion_l3,
            };
            let json: string = JSON.stringify(values);

            this.service.HTTP_Post("/articulos_genericos2", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Genéricos');
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

    }

    OpenClasificacion() {

        this.Sel_Categoria = this.searchmodel.Categoria;
        this.ChangeCategoria();
        this.modal5.show();
    }

    UpdateClasificacion() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            var values = {
                ids: arrayData,
                categoria: this.Sel_Categoria,
                linea: this.Sel_Linea,
                sublinea: this.Sel_SubLinea,
                sublinea2: this.Sel_SubLinea2,
                opcion: this.Sel_Opcion
            };



            let json: string = JSON.stringify(values);

            this.service.HTTP_Post("/articulos_clasificacion", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Clasificación');
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }

    UpdateCategoria() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            var values = {
                ids: arrayData,
                categoria: this.Sel_Categoria,
            };
            let json: string = JSON.stringify(values);

            this.service.HTTP_Post("/articulos_categoria", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Categoría');
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }

    UpdateCategoriaPrincipal() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            var values = {
                ids: arrayData,
                value: this.Sel_CategoriaM
            };
            let json: string = JSON.stringify(values);

            this.service.HTTP_Post("/publish_categoriasm", json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success('Actualización Realizada', 'Actualizar Categoria Principal');
                        this.refresh();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }


    fileChangeEventSheet(fileInput: any) {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        const len = arrayData.length;

        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            this.filesToUpload = <Array<File>>fileInput.target.files;

            const idrow = arrayData.join(',');
            const name = this.filesToUpload[0].name;
            const url = this.service.Master_NH_Upload_URL(idrow, name, 'sheet');

            this.upload.makeFileRequest(url, [], this.filesToUpload, 'token', 'image')
                .then((result: any) => {

                    if (result.message == "ok") {
                        this.toaster.success('Ficha Técnica Importada', 'Importar Ficha Técnica');
                        this.All(0);
                        this.refresh();
                        this.clearUploadField();
                    } else {
                        this.toaster.error("Imposible subir Ficha Técnica", "Importar Ficha Técnica");
                    }
                })
                .catch((result: any) => {
                    console.log(result);
                })
        }
    }

    fileChangeEvent(fileInput: any) {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        const len = arrayData.length;

        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len > 0) {
            this.filesToUpload = <Array<File>>fileInput.target.files;

            const idrow = arrayData.join(',');
            const name = arrayData[0] + "-" + this.Sel_Imagen;
            const tipo = this.Sel_Imagen;
            const url = this.service.Master_NH_Upload_URL(idrow, name, tipo);

            this.upload.makeFileRequest(url, [], this.filesToUpload, 'token', 'image')
                .then((result: any) => {

                    if (result.message == "ok") {
                        this.toaster.success('Imagen Importada', 'Importar Imagen');
                        this.All(0);
                        this.refresh();
                        this.clearUploadField();
                    } else {
                        this.toaster.error("Imposible subir imagen", "Importar Imagen");
                    }
                })
                .catch((result: any) => {
                    console.log(result);
                })
        }
    }


    fileChangeEventTarifa(fileInput: any) {

        /*
        const idrow = this.Sel_Imagen;
        const name  = this.Sel_Imagen;
        this.filesToUpload = <Array<File>>fileInput.target.files;

            const url = this.service.Master_NH_Upload_URL(idrow, name, tipo);

            this.upload.makeFileRequest(url, [], this.filesToUpload, 'token', 'image')
                .then((result: any) => {

                    if (result.message == "ok") {
                        this.toaster.success('Imagen Importada', 'Importar Imagen');
                        this.All(0);
                        this.refresh();
                        this.clearUploadField();
                    } else {
                        this.toaster.error("Imposible subir imagen", "Importar Imagen");
                    }
                })
                .catch((result: any) => {
                    console.log(result);
                })

                */
    }

    clearUploadField(): void {
        (<HTMLInputElement>window.document.getElementById('Imagen_Upload')).value = "";
    }



    SetField() {

        for (var j = 0; j < this.fields.length; j++) {
            var id = this.fields[j].id;
            var table = this.fields[j].table;
            var field = this.fields[j].field;

            if (this.bulk.id == id) {
                this.bulk.field = field;
                this.bulk.table = table;
            }
        }
    }

    FilterField(target) {
        this.fields = [];
        for (var j = 0; j < this.masterfields.length; j++) {
            var idrow = this.masterfields[j].idrow;
            if (target == idrow) {
                this.fields.push(this.masterfields[j]);
            }
        }
    }

    BulkAssign() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len >= 1) {
            this.modalBulk.show();
        }
    }

    BulkUpdateValues() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len >= 1) {

            this.SetField();

            var values = {
                ids: arrayData,
                bulk: this.bulk
            }

            var route = "/bulk";
            let json: string = JSON.stringify(values);
            this.service.HTTP_Post(route, json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                        this.toaster.success('Proceso Realizado', 'Asignación Masiva');
                        this.bulk.id = '-1';
                        this.bulk.table = "";
                        this.bulk.field = "";
                        this.bulk.value = "";

                    } else {
                        this.toaster.error('NO es Posible', 'Asignación de Tejido');
                    }
                },
                error => {
                    console.log(error);
                });


        }
    }


    AttributesAssign() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len == 1) {
            this.loadAtributosSubfamilia(arrayData);
            this.modalAssign.show();
        }
    }

    AttributesAssignValues() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }

        if (len >= 1) {
            this.loadAtributosArticulos(arrayData);
            this.modalAssignValues.show();
        }
    }



    AttributesView() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 1) {
            this.loadAtributosSubfamilia(arrayData);
            this.modalAssign.show();

        }
        else {
            this.toaster.error('Solo Permite la visualización de una SubLinea', 'Ver Atributos');
        }
    }

    AttributesUpdate() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len > 0) {
            var values = {
                ids: arrayData,
                attrs: this.atributos
            }


            var route = "/atributos_assign";
            let json: string = JSON.stringify(values);


            this.service.HTTP_Post(route, json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                        this.toaster.success('Proceso Realizado', 'Asignación de Atributos');
                        this.loadAtributos();
                    } else {
                        this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Tejido');
                    }
                },
                error => {
                    console.log(error);
                });

        }
    }

    AttributesUpdateValues() {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len > 0) {
            var values = {
                ids: arrayData,
                attrs: this.atributos
            }

            var route = "/atributos_assign_articles";
            let json: string = JSON.stringify(values);
            this.service.HTTP_Post(route, json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.refresh();
                        this.myGrid.clearselection();
                        this.toaster.success('Proceso Realizado', 'Asignación de Atributos');
                        //this.loadAtributos();
                    } else {
                        this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Tejido');
                    }
                },
                error => {
                    console.log(error);
                });

        }
    }

    attr_changed(event, item) {
        if (event.target.checked == true)
            item.selected = 1;
        else
            item.selected = 0;


    }

    KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        if (kunde == null || kunde == -1) {
            alert("Debe Seleccionar el cliente destino");
        }
        else {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {
                var arrayData: any[] = [];
                arrayData = this.getSelectedRows(this.myGrid, "idrow");
                var len = arrayData.length;
                if (len == 0) {
                    alert("No ha seleccionado ninguna linea");
                }
                else {


                    var route = "/tejidos_cliente";
                    var values = {
                        value: kunde,
                        ids: arrayData,
                        productos: this.productos
                    };

                    let json: string = JSON.stringify(values);
                    this.service.HTTP_Post(route, json).subscribe(
                        data => {
                            if (data.message == "OK") {
                                this.refresh();
                                this.myGrid.clearselection();
                                this.toaster.success('Proceso Realizado', 'Asignación de Tejido');
                            } else {
                                this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Tejido');
                            }
                        },
                        error => {
                            console.log(error);
                        });
                }
            }
        }
    }

    Accionamiento_KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        if (kunde == null || kunde == -1) {
            alert("Debe Seleccionar el cliente destino");
        }
        else {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {
                var arrayData: any[] = [];
                arrayData = this.getSelectedRows(this.myGrid, "idrow");
                var len = arrayData.length;
                if (len == 0) {
                    alert("No ha seleccionado ninguna linea");
                }
                else {


                    var route = "/accionamientos_clientes";
                    var values = {
                        value: kunde,
                        ids: arrayData
                    };

                    let json: string = JSON.stringify(values);
                    this.service.HTTP_Post(route, json).subscribe(
                        data => {
                            if (data.message == "OK") {
                                this.refresh();
                                this.myGrid.clearselection();
                                this.toaster.success('Proceso Realizado', 'Asignación de Accionamientos');
                            } else {
                                this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Accionamientos');
                            }
                        },
                        error => {
                            console.log(error);
                        });
                }
            }
        }
    }

    AccionamientoTipo_KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        var Tipo = this.AccionamientoSeleccionado;
        var Traduccion = this.AccionamientoCliente;
        var store = 1;

        if (kunde == null || kunde == -1) {
            store = 0;
            alert("Debe Seleccionar el cliente");

        }

        if (Tipo == null || Tipo == -1) {
            store = 0;
            alert("Debe Seleccionar el Tipo de Accionamiento");
        }

        if (Traduccion == "") {
            store = 0;
            alert("Debe Indicar la Traducción del Accionamiento");
        }

        if (store == 1) {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {

                var route = "/accionamientos_clientes_traduccion";
                var values = {
                    cliente: kunde,
                    tipo: Tipo,
                    traduccion: Traduccion
                };

                let json: string = JSON.stringify(values);
                this.service.HTTP_Post(route, json).subscribe(
                    data => {
                        if (data.message == "OK") {
                            this.refresh();
                            this.myGrid.clearselection();
                            this.AccionamientoCliente = "";
                            this.toaster.success('Proceso Realizado', 'Asignación de Accionamientos');
                        } else {
                            this.toaster.error('NO es Posible Asignar el Tejido', 'Asignación de Accionamientos');
                        }
                    },
                    error => {
                        console.log(error);
                    });
            }
        }
    }

    Soporte_KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        var Tipo = this.SoporteSeleccionado;
        var Traduccion = this.SoporteCliente;
        var store = 1;


        if (kunde == null || kunde == -1) {
            store = 0;
            alert("Debe Seleccionar el cliente");

        }

        if (Tipo == null || Tipo == -1) {
            store = 0;
            alert("Debe Seleccionar el Tipo de Soporte");
        }

        if (Traduccion == "") {
            store = 0;
            alert("Debe Indicar la Traducción del Soporte");
        }

        if (store == 1) {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {

                var route = "/soportesclientes";

                var values: any = [
                    { id: 'id', value: '-1' },
                    { id: 'cliente', value: kunde },
                    { id: 'soporte', value: Tipo },
                    { id: 'traduccion', value: Traduccion }
                ];

                let json: string = JSON.stringify(values);
                this.service.HTTP_Post(route, json).subscribe(
                    data => {
                        if (data.message == "OK") {
                            this.refresh();
                            this.myGrid.clearselection();
                            this.SoporteCliente = "";
                            this.toaster.success('Proceso Realizado', 'Asignación de Soportes');
                        } else {
                            this.toaster.error('NO es Posible Asignar el Soporte', 'Asignación de Soportes');
                        }
                    },
                    error => {
                        console.log(error);
                    });
            }
        }
    }

    Tapa_KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        var Tipo = this.TapaSeleccionado;
        var Traduccion = this.TapaCliente;
        var store = 1;


        if (kunde == null || kunde == -1) {
            store = 0;
            alert("Debe Seleccionar el cliente");

        }

        if (Tipo == null || Tipo == -1) {
            store = 0;
            alert("Debe Seleccionar el Tipo de Tapa");
        }

        if (Traduccion == "") {
            store = 0;
            alert("Debe Indicar la Traducción de la Tapa");
        }

        if (store == 1) {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {

                var route = "/tapasclientes";

                var values: any = [
                    { id: 'id', value: '-1' },
                    { id: 'cliente', value: kunde },
                    { id: 'tapa', value: Tipo },
                    { id: 'traduccion', value: Traduccion }
                ];

                let json: string = JSON.stringify(values);
                this.service.HTTP_Post(route, json).subscribe(
                    data => {
                        if (data.message == "OK") {
                            this.refresh();
                            this.myGrid.clearselection();
                            this.TapaCliente = "";
                            this.toaster.success('Proceso Realizado', 'Asignación de Tapas');
                        } else {
                            this.toaster.error('NO es Posible Asignar la Tapa', 'Asignación de Tapas');
                        }
                    },
                    error => {
                        console.log(error);
                    });
            }
        }
    }

    Contrapeso_KundeSelect() {

        var kunde = this.ClienteSeleccionado;
        var Tipo = this.ContrapesoSeleccionado;
        var Traduccion = this.ContrapesoCliente;
        var store = 1;


        if (kunde == null || kunde == -1) {
            store = 0;
            alert("Debe Seleccionar el cliente");

        }

        if (Tipo == null || Tipo == -1) {
            store = 0;
            alert("Debe Seleccionar el Tipo de Contrapeso");
        }

        if (Traduccion == "") {
            store = 0;
            alert("Debe Indicar la Traducción de la Contrapeso");
        }

        if (store == 1) {
            if (confirm("¿Desea copiar la selección al cliente seleccionado?")) {

                var route = "/contrapesosclientes";

                var values: any = [
                    { id: 'id', value: '-1' },
                    { id: 'cliente', value: kunde },
                    { id: 'tapa', value: Tipo },
                    { id: 'traduccion', value: Traduccion }
                ];

                let json: string = JSON.stringify(values);
                this.service.HTTP_Post(route, json).subscribe(
                    data => {
                        if (data.message == "OK") {
                            this.refresh();
                            this.myGrid.clearselection();
                            this.TapaCliente = "";
                            this.toaster.success('Proceso Realizado', 'Asignación de Contrapesos');
                        } else {
                            this.toaster.error('NO es Posible Asignar el Contrapeso', 'Asignación de Contrapesos');
                        }
                    },
                    error => {
                        console.log(error);
                    });
            }
        }
    }

    TejidoSelect() {

        var Tejido = this.TejidoSeleccionado;
        var Kunde = this.ClienteSeleccionado;
        if (Tejido == null || Tejido == -1 || Kunde == null || Kunde == -1) {

            if (Tejido == null || Tejido == -1) {
                alert("Debe Seleccionar el tejido destino");
            }

            if (Kunde == null || Kunde == -1) {
                alert("Debe Seleccionar el Cliente destino");
            }
        }
        else {
            if (confirm("¿Desea copiar la selección al tejido seleccionado?")) {
                var arrayData: any[] = [];
                arrayData = this.getSelectedRows(this.myGrid, "idrow");
                var len = arrayData.length;
                if (len == 0) {
                    alert("No ha seleccionado ninguna linea");
                }
                else {

                    var route = "/tejidos_colores";
                    var values = {
                        value: Tejido,
                        ids: arrayData,
                        kunde: Kunde
                    };

                    let json: string = JSON.stringify(values);
                    this.service.HTTP_Post(route, json).subscribe(
                        data => {
                            if (data.message == "OK") {
                                this.refresh();
                                this.myGrid.clearselection();
                            } else {
                                this.toaster.error('NO es Posible Agregar el Color al Tejido', 'Asignación de Color');
                            }
                        },
                        error => {
                            console.log(error);
                        });
                }
            }
        }

    }

    Categorias(value) {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {

            if (confirm("¿Desea realizar la asignación de artículos a la categoria indicada?")) {
                var values = {

                    categoria: value,
                    idrows: arrayData
                }
                let ivalues = JSON.stringify(values);
                this.service.HTTP_Post('/articulos_categorias', ivalues).subscribe(
                    data => {

                        if (data.message == 'OK') {
                            this.refresh();
                            this.toaster.success('Asignación Realizada', 'Asignadas las Categorias');
                        }
                    },
                    error => {

                    }
                );
            }


        }

        //this.categoriasModal.show();
    }

    CombiColors() {
        /*
        this.loadTejidosColores();
        this.modal.show();
        */
    }

    ArticlesAssign() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");
        var len = arrayData.length;
        if (len == 0) {
            alert("No ha seleccionado ninguna linea");
        }
        else {
            this.articlesModal.show();
        }
    }

    LineAdded(event: { idrow: any; }[]) {
        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "idrow");

        if (this.operation == 206 ||
            this.operation == 210) {

            var tipo = 'TUBOS';
            if (this.operation == 206) tipo = 'TUBOS';
            if (this.operation == 210) tipo = 'SALIDATEJIDO';

            var model = {
                idrow: arrayData.join(';'),
                articulos: event[0].idrow,
                tipo: tipo
            }

            var values = JSON.stringify(model);
            this.service.HTTP_Post('/artikel_assign', values).subscribe(
                data => {
                    if (data.message == 'OK') {
                        this.refresh();
                        this.articlesModal.hide();
                        this.toaster.success('Proceso Realizado', 'Asignado Artículo');
                    }
                },
                error => {

                }
            );
            this.myGrid.clearselection();

        }

    }

    getStyle() {
        if (this.operation == 225) {
            return "col col-8";
        }
        else {
            return "col col-12";
        }
    }

    getStyle2() {
        if (this.operation == 225) {
            return "col col-4";
        }
        return ''
    }

    AgregarTejidosColores() {
        //this.assignGroups.AssignValues(this.tejidos,'master','idrow','descripcion');
        //this.assignGroups.AssignValues(this.smcolores,'from','idrow','descripcion');
        this.tejidoscoloresModal.show();
    }
    /*
    ReloadURL(value: string)
    {
        var url = "/routes/master/detail/"+value;
        //this.router.navigate([url], { queryParams: { id: -1 } });
        this.router.navigateByUrl(url);
    }
    */

    loadDirecciones(empresa, assign?) {
        const url = '/clientes_direcciones/' + empresa;
        this.service.HTTP_Get(url).subscribe(
            data => {
                this.entregas = data.Table;
                if (assign) {
                    this.user.subempresa = assign;
                }
            },
            empresa => {

            }
        );

    }

    ChangeEmpresa(assign) {
        this.loadDirecciones(this.user.empresa, assign);
    }

    getId(value) {

        var id = "0";
        if (this.DropDownSource.localdata) {
            (this.DropDownSource.localdata as Array<any>).forEach(element => {
                if (element.nombre == value) {
                    id = element.idrow;
                }
            });
        }

        return id;
    }

    OpenPromProgram() {
        this.promocionesModal.show();
    }

    PromocionesUpdate() {
        this.promocionesModal.hide();
    }

    openImportTarifa() {
        this.tarifasModal.show();
    }

    openDomicilios() {
        this.domiciliosModal.show();
    }

    Agregar_Domicilio() {
        console.log(this.tiendasClientes);

        if (this.tiendasClientes.Nombre == "") {
            this.toaster.info("Debe Indicar el nombre de la Tienda");
            return;
        }

        if (this.tiendasClientes.Poblacion == "") {
            this.toaster.info("Debe Indicar la población de la Tienda");
            return;
        }

        if (this.tiendasClientes.Provincia == "") {
            this.toaster.info("Debe Indicar la provincia de la Tienda");
            return;
        }

        if (this.tiendasClientes.CodSolupyme == "") {
            this.toaster.info("Debe Indicar el código de solupyme");
            return;
        }

        if (this.tiendasClientes.Centro == 0) {
            this.toaster.info("Debe Indicar el código del centro");
            return;
        }

        if (this.tiendasClientes.Usuario == "") {
            this.toaster.info("Debe Indicar el nombre del Usuario");
            return;
        }

        if (this.tiendasClientes.Password == "") {
            this.toaster.info("Debe Indicar el password del Usuario");
            return;
        }

        if (confirm("¿Desea Agregar el domicilio?")) {
            let url = '/domicilios/';
            let values = JSON.stringify(this.tiendasClientes);
            this.service.HTTP_Post(url, values).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.toaster.success("Agregada la Tienda");
                        this.domiciliosModal.hide();
                        this.refresh();

                        this.tiendasClientes = {
                            idrow: -1,
                            operation: 1,
                            Cliente: "1",
                            Pais: "1",
                            Nombre: "",
                            Poblacion: "",
                            Provincia: "",
                            Telefono: "",
                            Email: "",
                            DiasTransporte: 3,
                            CodSolupyme: "000",
                            Centro: 0,
                            Usuario: "",
                            Password: ""
                        }
                    }
                    else {
                        this.toaster.info("NO se ha agregado la Tienda");
                    }
                },
                error => {
                    this.toaster.error(error.message);
                });
        }
    }

    cellBeginEditEvent(event) {
        //console.log(event);

    }

    cellEndEditEvent(event) {


        let apply = false;
        let values = "";
        let message = "";
        let section = "";

        if (this.operation == 200) {
            if (event.args.value != event.args.oldvalue) {
                this.params.table = "sol_articulos_tejidos";
                this.params.column = "idrow";
                this.params.id = event.args.row.idrow;
                this.params.field = event.args.datafield;
                this.params.value = event.args.value;
                this.params.type = 200;
                values = JSON.stringify(this.params);
                message = "Actualizado el precio";
                section = "Gestión de Tejidos";

                if (confirm("¿Desea Actualizar?")) {
                    apply = true;
                } else
                    apply = false;
            }
        }

        if (this.operation == 225) {
            if (event.args.value != event.args.oldvalue) {
                this.params.table = "sol_articulos_tejidos_colores";
                this.params.column = "idrow";
                this.params.id = event.args.row.idrow;
                this.params.field = event.args.datafield;
                this.params.value = event.args.value;
                values = JSON.stringify(this.params);
                message = "Actualizado el color";
                section = "Gestión de Colores de Tejidos";
                apply = true;
            }
        }

        if (this.operation == 211) {
            if (event.args.value != event.args.oldvalue) {
                this.params.table = "nh_clientes";
                this.params.column = "idCliente";
                this.params.id = event.args.row.idrow;
                this.params.field = event.args.datafield;
                this.params.value = event.args.value;
                values = JSON.stringify(this.params);
                message = "Actualizado los Clientes";
                section = "Gestión de Clientes";
                apply = true;
            }
        }

        if (this.operation == 212) {
            if (event.args.value != event.args.oldvalue) {
                this.params.table = "sol_articulos_tejidos_clientes";
                this.params.column = "idrow";
                this.params.id = event.args.row.idrow;
                this.params.field = "tarifa";
                this.params.value = this.getId(event.args.value);
                values = JSON.stringify(this.params);
                message = "Actualizado el precio";
                section = "Gestión de Tejidos de Clientes";
                apply = true;
            }
        }

        if (this.operation == 202) {
            if (event.args.value != event.args.oldvalue) {
                this.params.table = "sol_articulos_colores_marcas";
                this.params.column = "idrow";
                this.params.id = event.args.row.idrow;
                this.params.field = event.args.datafield;
                this.params.value = event.args.value;
                values = JSON.stringify(this.params);
                message = "Actualizado " + event.args.datafield;
                section = "Gestión de Colores y Marcas";
                apply = true;
            }
        }

        if (apply) {

            let url = "/update_table";
            if (this.operation == 200) url = "/bulk";

            this.service.HTTP_Post(url, values).subscribe(
                data => {
                    if (data.message = 'OK') {
                        this.toaster.success(message, section);
                        this.myGrid.clearselection();
                    }
                },
                error => {
                    console.log(error);
                    this.toaster.error(error.message, section);
                });
        }
    }

}
