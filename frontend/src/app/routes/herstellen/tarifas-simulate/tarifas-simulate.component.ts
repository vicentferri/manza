import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Utils } from '../../../shared/Utils';
import { ExcelService } from '../../../services/excel.service';


@Component({
  selector: 'app-tarifas-simulate',
  templateUrl: './tarifas-simulate.component.html',
  styleUrls: ['./tarifas-simulate.component.css'],
  providers: [HaruService, ExcelService]
})
export class TarifasSimulateComponent implements OnInit {

  @ViewChild('gridDetail', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('gridReference', { static: false }) myTarifa!: jqxGridComponent;
  @ViewChild('gridTiempos', { static: false }) myTiempo!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalDetalle', { static: false }) modalDetalle!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;
  @ViewChild('staticModal', { static: false }) public modalKunden!: ModalDirective;
  @ViewChild('staticModalClone', { static: false }) public modalClone!: ModalDirective;
  @ViewChild('staticModalBloqueo', { static: false }) public modalBloqueo!: ModalDirective;

  detailRows: any[] = [];
  articleRows: any[] = [];
  selectedDetail: any = null;

  lblPrecio: String = "Precio m2";
  cx = '';
  cy = '';
  tempX = 0;
  tempY = 0;


  private sub!: Subscription;

  numeros = {
    idrow: 0,
    x: 0,
    y: 0
  }

  model = {
    idrow: -1,
    nombreescandallo: '',
    margentej: 0,
    margenmec: 0,
    margenacc: 0,
    margencli: 0,
    tipo: -1,
    marca: -1,
    tejido: -1,
    criterio: "180",
    preciom2: 1,
    preciomon: 0.21,
    bloqueo: 0,
    Editar: false,
    bloque: 10,
    password: '',
    tipotejido: '',
    desmultiplicador: '0',
    desmultiplicador_trigger: 1.90,
    desmultiplicador_value: 1.12,
    tiposegmento: 0,
    tipoproducto: 1,
    grupotejido: '0',
    grupo: -1,
    densidad: 0.33,
    sp_sistema: '-1',
    sp_modelo: '-1',
    sp_accionamiento: '-1',
    sp_tejido: '-1'
  }

  model2 = {
    operation: '1',
    password: '',
    idrow: -1
  }

  newmodel = {
    NuevoNombre: '',
    idrow: -1
  }

  lista_productos: any = [{ id: "1", name: "ENROLLABLES" },
  { id: "2", name: "PANEL JAPONES" },
  { id: "3", name: "VERTICALES" },
  { id: "4", name: "LINEA BLANCA" },
  { id: "5", name: "NOCHE Y DIA" }]
  lista_accionamientos: any = null;
  lista_marcas: any = null;
  lista_tejidos: any = null;
  lista_tipotejidos: any = null;
  lista_grupos: any = null;

  lista_criterios: any = null;
  lista_criterios_enrollables: any =
    [{ id: "140", name: "140" }, { id: "180", name: "180" }, { id: "200", name: "200" },
    { id: "240", name: "240" }, { id: "250", name: "250" }, { id: "300", name: "300" }, { id: "320", name: "320" }, { id: "350", name: "350" }];

  lista_criterios_verticales: any =
    [{ id: "0", name: "0" }, { id: "89", name: "89" }, { id: "127", name: "127" }];

  lista_criterios_nocheydia: any =
    [{ id: "0", name: "0" }, { id: "250", name: "250" }, { id: "280", name: "280" }, { id: "300", name: "300" }];

  sp_sistemas: any = [];
  sp_modelos: any = [];
  sp_accionamientos: any = [];
  sp_tejidos: any = [];

  esgrupo = 0;

  constructor(private service: HaruService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    vRef: ViewContainerRef,
    private excel: ExcelService
  ) {

    // this.toaster.setRootViewContainerRef(vRef);

  }

  source = {
    type: 'GET',
    datatype: 'json',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'idpedido', type: 'int' },
      { name: 'orden', type: 'int' },
      { name: 'articulo', type: 'int' },
      { name: 'syntaxis', type: 'string' },
      { name: 'descripcion', type: 'string' },
      { name: 'cantidad', type: 'number' },
      { name: 'precio', type: 'number' },
      { name: 'mmeca', type: 'number' },
      { name: 'precio2', type: 'number' },
      { name: 'unidad', type: 'int' },
      { name: 'descUnidad', type: 'string' },
      { name: 'ubicacion', type: 'string' },
      { name: 'consumo', type: 'number' },
      { name: 'cod_sol', type: 'string' },
      { name: 'fam_sol', type: 'string' },
      { name: 'desde', type: 'int' },
      { name: 'hasta', type: 'int' },
      { name: 'desctipocalculo', type: 'string' },
      { name: 'k', type: 'number' },
      { name: 'dto', type: 'number' },
      { name: 'cambio', type: 'number' }
    ],
    localdata: null
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'c00', type: 'number' },
      { name: 'c01', type: 'number' },
      { name: 'c02', type: 'number' },
      { name: 'c03', type: 'number' },
      { name: 'c04', type: 'number' },
      { name: 'c05', type: 'number' },
      { name: 'c06', type: 'number' },
      { name: 'c07', type: 'number' },
      { name: 'c08', type: 'number' },
      { name: 'c09', type: 'number' },
      { name: 'c10', type: 'number' },
      { name: 'c11', type: 'number' },
      { name: 'c12', type: 'number' },
      { name: 'c13', type: 'number' },
      { name: 'c14', type: 'number' },
      { name: 'c15', type: 'number' },
      { name: 'c16', type: 'number' },
      { name: 'c17', type: 'number' },
      { name: 'c18', type: 'number' },
      { name: 'c19', type: 'number' },
      { name: 'c20', type: 'number' },
      { name: 'c21', type: 'number' },
      { name: 'c22', type: 'number' },
      { name: 'c23', type: 'number' },
      { name: 'c24', type: 'number' },
      { name: 'c25', type: 'number' },
      { name: 'c26', type: 'number' },
      { name: 'c27', type: 'number' },
      { name: 'c28', type: 'number' },
      { name: 'c29', type: 'number' },
      { name: 'c30', type: 'number' },
      { name: 'c31', type: 'number' },
      { name: 'c32', type: 'number' },
      { name: 'c33', type: 'number' },
      { name: 'c34', type: 'number' },
      { name: 'c35', type: 'number' },
      { name: 'c36', type: 'number' },
      { name: 'c37', type: 'number' },
      { name: 'c38', type: 'number' },
      { name: 'c39', type: 'number' },
      { name: 'c40', type: 'number' },
      { name: 'c41', type: 'number' },
      { name: 'c42', type: 'number' },
      { name: 'c43', type: 'number' },
      { name: 'c44', type: 'number' },
      { name: 'c45', type: 'number' },
      { name: 'c46', type: 'number' },
      { name: 'c47', type: 'number' },
      { name: 'c48', type: 'number' },
      { name: 'c49', type: 'number' },
      { name: 'c50', type: 'number' },
      { name: 'c51', type: 'number' },
      { name: 'c52', type: 'number' },
      { name: 'c53', type: 'number' },
      { name: 'c54', type: 'number' },
      { name: 'c55', type: 'number' },
      { name: 'c56', type: 'number' },
      { name: 'c57', type: 'number' },
      { name: 'c58', type: 'number' },
      { name: 'c59', type: 'number' },
      { name: 'c60', type: 'number' }
    ],
    localdata: null
  };

  source3 = {
    type: 'GET',
    datatype: 'json',
    datafields: [
      { name: 'id', type: 'int' },
      { name: 'desde', type: 'int' },
      { name: 'hasta', type: 'int' },
      { name: 'tiempo', type: 'number' }
    ],
    localdata: null
  };


  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapter3 = new $.jqx.dataAdapter(this.source3, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 4, digits: 4, min: 0, spinButtons: false });
  }

  intValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 3, min: 0, spinButtons: false });
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }

    return '100%';
  }

  settings: any = {
    width: '100%',
    height: 800,
    pageable: true,
    autoheight: true,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 50,
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
    source: this.dataAdapter,
    columns: [
      { text: 'art', datafield: 'articulo', width: 45, filtertype: 'textbox', editable: false },
      { text: 'Descripcion', datafield: 'descripcion', filtertype: 'textbox', editable: false },
      {
        text: 'Tipo Cálculo', datafield: 'desctipocalculo', width: 150, filtertype: 'textbox', editable: false,
      },
      {
        text: 'Parám.Cálculo', datafield: 'syntaxis', width: 150, filtertype: 'textbox', editable: true, cellsalign: 'center'
      },
      {
        text: 'Consumo', datafield: 'cantidad', width: 80, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      {
        text: 'Precio', datafield: 'precio', width: 80, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad,
        cellclassname: function (row, columnfield, value, data) {

          let cambio = data.cambio;
          if (cambio > 0) {
            return 'jqx-input-glacier-yellow';
          }
        }
      },
      {
        text: 'MMeca', datafield: 'mmeca', width: 80, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd2',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      {
        text: 'PrecioM', datafield: 'precio2', width: 80, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      { text: 'Unidad', datafield: 'descUnidad', width: 75, filtertype: 'list', editable: false, cellsalign: 'center' },
      { text: 'Cod_Sol', datafield: 'cod_sol', width: 75, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Dto(anc)', datafield: 'dto', width: 60, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'De(cm)', datafield: 'desde', width: 60, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'A(cm)', datafield: 'hasta', width: 60, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'K(cant)', datafield: 'k', width: 60, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'cambio', datafield: 'cambio', width: 45, filtertype: 'textbox', editable: false },
    ]
  };

  cellclass = (row, columnfield, value) => {
    return 'green';
  }

  settings2: any = {
    width: this.getWidth(),
    height: 850,
    pageable: false,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '1000'],
    pagesize: 1000,
    scrollmode: 'logical',
    sortable: false,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'multiplecelladvanced', /* wir haben hier verschiedene Optionen, 
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: false,
    filterable: false,
    columnsresize: true,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter2,
    columns: [
      { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '', datafield: 'c01', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '0.40', datafield: 'c02', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '0.60', datafield: 'c03', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '0.80', datafield: 'c04', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '1.00', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '1.20', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '1.40', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '1.60', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '1.80', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '2.00', datafield: 'c10', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '2.20', datafield: 'c11', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '2.40', datafield: 'c12', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '2.60', datafield: 'c13', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '2.80', datafield: 'c14', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '3.00', datafield: 'c15', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '3.20', datafield: 'c16', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '3.40', datafield: 'c17', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '3.60', datafield: 'c18', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '3.80', datafield: 'c19', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '4.00', datafield: 'c20', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '4.20', datafield: 'c21', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '4.40', datafield: 'c22', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '4.60', datafield: 'c23', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '4.80', datafield: 'c24', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '5.00', datafield: 'c25', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '5.20', datafield: 'c26', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '5.40', datafield: 'c27', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '5.60', datafield: 'c28', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '5.80', datafield: 'c29', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '6.00', datafield: 'c30', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },

      { text: '6.20', datafield: 'c31', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '6.40', datafield: 'c32', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '6.60', datafield: 'c33', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '6.80', datafield: 'c34', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '7.00', datafield: 'c35', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '7.20', datafield: 'c36', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '7.40', datafield: 'c37', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '7.60', datafield: 'c38', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '7.80', datafield: 'c39', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '8.00', datafield: 'c40', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '8.20', datafield: 'c41', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '8.40', datafield: 'c42', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '8.60', datafield: 'c43', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '8.80', datafield: 'c44', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '9.00', datafield: 'c45', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '9.20', datafield: 'c46', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '9.40', datafield: 'c47', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '9.60', datafield: 'c48', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '9.80', datafield: 'c49', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '10.00', datafield: 'c50', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '10.20', datafield: 'c51', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '10.40', datafield: 'c52', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '10.60', datafield: 'c53', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '10.80', datafield: 'c54', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '11.00', datafield: 'c55', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '11.20', datafield: 'c56', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '11.40', datafield: 'c57', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '11.60', datafield: 'c58', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '11.80', datafield: 'c59', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
      { text: '12.00', datafield: 'c60', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center', cellsformat: 'd2' },
    ]

  };

  settings3: any = {
    width: '100%',
    height: 400,
    pageable: false,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: false,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen,
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter3,
    columns: [
      { text: 'Desde (cm)', datafield: 'desde', width: 100, filtertype: 'textbox', editable: false, cellsalign: 'right' },
      { text: 'Hasta (cm)', datafield: 'hasta', width: 100, filtertype: 'textbox', editable: false, cellsalign: 'right' },
      {
        text: 'Tiempo (min)', datafield: 'tiempo', width: 100, filtertype: 'textbox', editable: true, cellsalign: 'right', cellsformat: 'd2',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      }
    ]
  };


  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.myTarifa.createComponent(this.settings2);
    this.myTiempo.createComponent(this.settings3);
    this.loadMaster();
    this.Editar();
  }

  Editar() {
    //const selectionModel = this.model.Editar ? "multiplecelladvanced" : "multiplerow";
    //this.myGrid.selectionmode(selectionModel);
  }

  ngOnInit() {

    this.sub = this.route.queryParams.subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.model.idrow = +params['id'] || -1;
    });
    /*
            this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
    */
    if (this.model.idrow > 0) {
      this.loadHeader(this.model.idrow);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  Open() {
    this.modalAdd.show();
  }

  New() {
    this.model.tipoproducto = 1;
    this.AssignCriterios();
    this.model.idrow = -1;
    this.model.nombreescandallo = "";
    this.model.margentej = 0;
    this.model.margenmec = 0;
    this.model.margenacc = 0;
    this.model.margencli = 0;
    this.model.tipo = -1;
    this.model.marca = -1;
    this.model.tejido = -1;
    this.model.criterio = "180";
    this.model.preciom2 = 1;
    this.model.preciomon = 0.21;
    this.model.bloqueo = 0;
    this.model.desmultiplicador = '1';
    this.model.desmultiplicador_trigger = 1.9;
    this.model.desmultiplicador_value = 1.12;
    this.source.localdata = null;
    this.dataAdapter.dataBind();
    this.myGrid.updatebounddata();
    this.router.navigate(['/routes/herstellen/tarifasimul'], { queryParams: { id: -1 } });
  }

  Save() {
    this.SaveValues();
  }

  onDetailRowClick(row: any) {
    this.selectedDetail = row;
    this.LoadDetailsArticles(this.tempX, this.tempY, row.articulo);
  }
  totalDetalle(): number {
    return this.detailRows.reduce((acc, r) => acc + (r.total || 0), 0);
  }

  totalArticulos(): number {
    return this.articleRows.reduce((acc, r) => acc + (r.total || 0), 0);
  }

  /***
   * 
   */
  SaveValues() {
    var values = JSON.stringify(this.model);
    this.service.HTTP_Post('/sm/tarifa_simulate', values).subscribe(
      data => {
        console.log(data);
        if (data.message === "OK") {
          this.model.idrow = data.idrow;
          this.toaster.success("Actualización Realizada", "ACTUALIZACION");
          if (this.model.idrow > 0) {
            this.loadHeader(this.model.idrow);
          }


        }


      },
      error => {
        this.toaster.error("Error en la grabación:" + error.mensaje, "ACTUALIZACION");
      }
    );
  }

  /***
   * 
   */
  Export(grid) {
    var pathExportScript = this.service.Export();
    if (grid == 1) {
      //this.myGrid.exportdata("xls", "escandallo", true, null, false, pathExportScript);
      this.excel.exportAsExcelFile(this.source.localdata || [], "tarifa");
    }
    else {
      //this.myTarifa.exportdata("xls", "tarifa", true, null, false, pathExportScript);
      this.excel.exportAsExcelFile(this.source2.localdata || [], "tarifa");
    }

  }

  /***
   * 
   */
  Delete() {

    if (confirm("Desea Borrar la Tarifa Actual")) {
      var values = JSON.stringify(this.model);
      this.service.HTTP_Post('/sm/tarifa_simulate_del', values).subscribe(
        data => {
          if (data.message == "OK") {
            this.toaster.success("Borrado Realizado", "ACTUALIZACION");
            this.Search();
          }
        },
        error => {
          this.toaster.error("Error en la grabación:" + error.mensaje, "ACTUALIZACION");
        }
      );
    }

  }

  Search() {
    this.router.navigate(['/routes/herstellen/tarifasimul-search'], { queryParams: { id: -1 } });
  }

  /***
   * 
   */
  Update() {

    var rows = this.search.getRows();
    var articles = rows.join(',');

    var mymodel = {
      idrow: this.model.idrow,
      articles: articles,
      operation: 1
    }

    const values = JSON.stringify(mymodel);

    this.service.HTTP_Post('/sm/tarifa_simulate_articles', values).subscribe(
      data => {
        if (data.message == "OK") {
          this.toaster.success("Proceso Realizado", "Lineas Agregadas");
        }
        this.LoadLines();
        this.LoadTimes();
      },
      error => {
        this.toaster.error("Error en la grabación:" + error.mensaje, "ACTUALIZACION");
      }
    );
  }

  /***
   * 
   */
  AssignCriterios() {
    if (this.model.tipoproducto == 1) {
      this.lista_criterios = this.lista_criterios_enrollables;
    }

    if (this.model.tipoproducto == 3) {
      this.lista_criterios = this.lista_criterios_verticales;
    }

    if (this.model.tipoproducto == 5) {
      this.lista_criterios = this.lista_criterios_nocheydia;
    }

    if (this.model.tipoproducto == 1) this.lblPrecio = "Precio m2";
    if (this.model.tipoproducto == 3) this.lblPrecio = "Precio mL";
    if (this.model.tipoproducto == 4) this.lblPrecio = "Precio mL";
    if (this.model.tipoproducto == 5) this.lblPrecio = "Precio m2";
  }

  loadHeader(idrow: number) {
    var route = "/sm/tarifa_simulate/" + idrow;
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.model.tipoproducto = data.Table[0].tipoproducto;

        this.AssignCriterios();


        this.model.idrow = data.Table[0].idrow;
        this.model.nombreescandallo = data.Table[0].nombre;
        this.model.margentej = data.Table[0].margen1;
        this.model.margencli = data.Table[0].margen2;
        this.model.margenmec = data.Table[0].margen3;
        this.model.margenacc = data.Table[0].margen4;
        this.model.marca = parseInt(data.Table[0].marca);
        this.model.tipo = parseInt(data.Table[0].tipo);
        this.model.tejido = parseInt(data.Table[0].tejido);
        this.model.criterio = data.Table[0].criterio;
        this.model.preciom2 = data.Table[0].preciom2;
        this.model.preciomon = data.Table[0].preciomontaje;
        this.model.bloqueo = data.Table[0].bloqueo;
        this.model.desmultiplicador = data.Table[0].desmultiplicador;
        this.model.desmultiplicador_trigger = data.Table[0].desmultiplicador_trigger;
        this.model.desmultiplicador_value = data.Table[0].desmultiplicador_value;
        this.model.sp_accionamiento = data.Table[0].sp_accionamiento;
        this.model.sp_modelo = data.Table[0].sp_modelo;
        this.model.sp_sistema = data.Table[0].sp_sistema;
        this.model.sp_tejido = data.Table[0].sp_tejido;

        //console.log(data.Table[0]);
        this.model.grupo = data.Table[0].grupo;
        this.model.grupotejido = data.Table[0].grupotejido ? '1' : '0';
        this.esgrupo = this.model.grupotejido == '0' ? 0 : 1;

        this.model.densidad = data.Table[0].densidad;

        this.LoadMarcas(this.model.marca);



        this.LoadLines();
        this.LoadTimes();

        if (this.model.bloqueo === 1) {
          this.myGrid.disabled(true);
          this.myTiempo.disabled(true);
        } else {
          this.myGrid.disabled(false);
          this.myTiempo.disabled(false);
        }


      },
      error => {
        this.toaster.error(error.message);
      }

    );
  }

  loadMaster() {

    this.service.HTTP_Get('/sm/accionamientos_filter').subscribe(
      data => {
        this.lista_accionamientos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );



    this.LoadTejidos(-1);
    this.LoadGrupos(-1);

    this.service.HTTP_Get('/sm/import_tables/SISTEMA').subscribe(
      data => {
        this.sp_sistemas = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/sm/import_tables/MODELO').subscribe(
      data => {
        this.sp_modelos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/sm/import_tables/ACCIONAMIENTO').subscribe(
      data => {
        this.sp_accionamientos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/sm/import_tables/TEJIDOS').subscribe(
      data => {
        this.sp_tejidos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

  }

  ChangeTipo(event) {
    this.LoadMarcas(-1);
  }

  ChangeProducto(event) {

    this.AssignCriterios();
  }

  ChangeTipoTejido(event) {

  }


  LoadMarcas(tipo) {

    let value = this.model.tipo;
    var route = "/sm/accionamientos_tipos_filter/" + value;

    this.service.HTTP_Get(route).subscribe(
      data => {
        this.lista_marcas = data.Table;
        this.model.marca = tipo;
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  ChangeGrupoTejido(event) {

    this.esgrupo = (event.target.value == '1') ? 1 : 0;

  }


  ChangeTejido(event) {
    this.getCoste(event.target.value);
  }

  ChangeGrupo(event) {
    this.getCosteGrupo(event.target.value);
  }

  getCoste(value) {

    this.lista_tejidos.forEach(element => {

      //console.log(element);
      if (element.idrow == value) {
        if (this.model.tipoproducto == 1) {
          this.model.preciom2 = element.coste;
          this.model.criterio = element.criterio;
        }

        if (this.model.tipoproducto == 3) {
          this.model.preciom2 = element.coste3;
          this.model.criterio = element.criterio3;
        }

        if (this.model.tipoproducto == 4) {
          this.model.preciom2 = element.coste4;
          this.model.criterio = element.criterio4;
        }
      }
    });
  }

  getCosteGrupo(value) {

    this.lista_grupos.forEach(element => {
      if (element.idrow == value) {
        this.model.preciom2 = element.coste;
        this.model.criterio = element.criterio;
      }
    });
  }

  /***
   * 
   */
  LoadTejidos(tejido) {
    var route = "/sm/tejidos";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.lista_tejidos = data.Table;
        if (tejido != -1) {
          this.model.tejido = tejido;
        }
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  /***
   * 
   */
  LoadGrupos(grupo) {
    var route = "/sm/grupos";
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.lista_grupos = data.Table;
        if (grupo != -1) {
          this.model.grupo = grupo;
        }
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  DeleteLines() {

    if (!this.model.Editar) {
      var arrayData = Utils.getSelectedRows(this.myGrid, "articulo");
      if (arrayData.length > 0) {

        var mymodel = {
          idrow: this.model.idrow,
          articles: arrayData.join(','),
          operation: 0
        }


        const values = JSON.stringify(mymodel);
        this.service.HTTP_Post('/sm/tarifa_simulate_articles', values).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success("Proceso Realizado", "Borrado de Líneas");
              this.LoadLines();
              this.LoadTimes();
              this.myGrid.clearselection();
            }
          },
          error => {
            this.toaster.error(error.message);
          }
        );

      } else {
        alert("No Ha seleccionado ninguna línea");
      }
    }
  }

  ShowHide() {
    if (this.model.tipoproducto == 4) {
      this.myGrid.hidecolumn("c31");
      this.myGrid.hidecolumn("c32");
      this.myGrid.hidecolumn("c33");
      this.myGrid.hidecolumn("c34");
      this.myGrid.hidecolumn("c35");
      this.myGrid.hidecolumn("c36");
      this.myGrid.hidecolumn("c37");
      this.myGrid.hidecolumn("c38");
      this.myGrid.hidecolumn("c39");
      this.myGrid.hidecolumn("c40");
      this.myGrid.hidecolumn("c41");
      this.myGrid.hidecolumn("c42");
      this.myGrid.hidecolumn("c43");
      this.myGrid.hidecolumn("c44");
      this.myGrid.hidecolumn("c45");
      this.myGrid.hidecolumn("c46");
      this.myGrid.hidecolumn("c47");
      this.myGrid.hidecolumn("c48");
      this.myGrid.hidecolumn("c49");
      this.myGrid.hidecolumn("c50");
      this.myGrid.hidecolumn("c51");
      this.myGrid.hidecolumn("c52");
      this.myGrid.hidecolumn("c53");
      this.myGrid.hidecolumn("c54");
      this.myGrid.hidecolumn("c55");
      this.myGrid.hidecolumn("c56");
      this.myGrid.hidecolumn("c57");
      this.myGrid.hidecolumn("c58");
      this.myGrid.hidecolumn("c59");
      this.myGrid.hidecolumn("c60");
    }
    else {
      this.myGrid.showcolumn("c31");
      this.myGrid.showcolumn("c32");
      this.myGrid.showcolumn("c33");
      this.myGrid.showcolumn("c34");
      this.myGrid.showcolumn("c35");
      this.myGrid.showcolumn("c36");
      this.myGrid.showcolumn("c37");
      this.myGrid.showcolumn("c38");
      this.myGrid.showcolumn("c39");
      this.myGrid.showcolumn("c40");
      this.myGrid.showcolumn("c41");
      this.myGrid.showcolumn("c42");
      this.myGrid.showcolumn("c43");
      this.myGrid.showcolumn("c44");
      this.myGrid.showcolumn("c45");
      this.myGrid.showcolumn("c46");
      this.myGrid.showcolumn("c47");
      this.myGrid.showcolumn("c48");
      this.myGrid.showcolumn("c49");
      this.myGrid.showcolumn("c50");
      this.myGrid.showcolumn("c51");
      this.myGrid.showcolumn("c52");
      this.myGrid.showcolumn("c53");
      this.myGrid.showcolumn("c54");
      this.myGrid.showcolumn("c55");
      this.myGrid.showcolumn("c56");
      this.myGrid.showcolumn("c57");
      this.myGrid.showcolumn("c58");
      this.myGrid.showcolumn("c59");
      this.myGrid.showcolumn("c60");
    }
  }

  LoadLines() {
    if (this.model.idrow > -1) {
      const url = '/sm/tarifa_simulate_lines/' + this.model.idrow;
      this.service.HTTP_Get(url).subscribe(
        data => {
          if (data.Table.length > 0) {
            this.source.localdata = data.Table;
            //console.log(data.Table);
            this.dataAdapter.dataBind();
            this.myGrid.updatebounddata();
            this.ShowHide();



          }
        },
        error => {
          this.toaster.error(error.message);
        }
      );
    }
  }

  ReplaceLine(id) {
    const url = '/sm/tarifa_simulate_line/' + id;
    this.service.HTTP_Get(url).subscribe(
      data => {

        this.myGrid.updaterow(id, data.Table[0]);
        this.myGrid.updatebounddata();

      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  LoadTimes() {
    if (this.model.idrow > -1) {
      const url = '/sm/tarifa_simulate_times/' + this.model.idrow;
      this.service.HTTP_Get(url).subscribe(
        data => {
          if (data.Table.length > 0) {
            this.source3.localdata = data.Table;
            this.dataAdapter3.dataBind();
            this.myTiempo.updatebounddata();
          }
        },
        error => {
          this.toaster.error(error.message);
        }
      );
    }
  }

  cellBeginEditEvent(event: any): void {
    let args = event.args;
    //this.beginEdit.nativeElement.innerHTML = 'Event Type: cellbeginedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;
  }

  cellEndEditEvent(event: any): void {
    let args = event.args;
    //this.endEdit.nativeElement.innerHTML = 'Event Type: cellendedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;

    var model = {
      table: 'SOL_TARIFAS_SIMULATE_LINES',
      column: 'id',
      id: args.row.id,
      field: args.datafield,
      value: args.value,
      type: 0,
      param1: -1,
      param2: -1,
      param3: -1
    }


    let values = JSON.stringify(model);
    var route = "/bulk";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == "OK") {
          this.myGrid.clearselection();
          //this.ReplaceLine(args.row.id);
          this.LoadLines();
        }
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  cellBeginEditEvent_Tiempos(event: any): void {
    let args = event.args;
    //this.beginEdit.nativeElement.innerHTML = 'Event Type: cellbeginedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;
  }

  cellEndEditEvent_Tiempos(event: any): void {
    let args = event.args;
    //this.endEdit.nativeElement.innerHTML = 'Event Type: cellendedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;

    var model = {
      table: 'SOL_TARIFAS_SIMULATE_TIMES',
      column: 'id',
      id: args.row.id,
      field: args.datafield,
      value: args.value,
      type: 0,
      param1: -1,
      param2: -1,
      param3: -1
    }


    let values = JSON.stringify(model);
    var route = "/bulk";
    this.service.HTTP_Post(route, values).subscribe(
      data => {

        if (data.message === "OK") {
          this.myGrid.clearselection();
          this.LoadTimes();
          this.toaster.success("Actualizado los tiempos", "TIEMPOS");
        }
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  GeneraTarifa() {

    this.Build();
  }




  Build() {
    var idrow = this.model.idrow;
    var bloque = this.model.bloque;

    this.myTarifa.clearselection();

    this.myTarifa.showloadelement();
    var url = "/sm/tarifa_simulate_table/" + idrow + "/" + bloque;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.source2.localdata = data.Table[0];
        this.dataAdapter2.dataBind();
        this.myTarifa.updatebounddata();
        this.myTarifa.hideloadelement();
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  changeTipoSegmento(value) {
    this.model.tiposegmento = value;
  }

  AddKunden() {
    this.modalKunden.show();
  }

  KundeAdded($event) {
    this.modalKunden.hide();
    alert($event);
  }

  ClonateOpen() {
    this.modalClone.show();
  }

  BloqueoOpen() {
    this.modalBloqueo.show();
    this.model2.operation = (this.model.bloqueo === 1) ? '0' : '1';
  }


  Clone() {

    let bProceed = 1;

    if (this.newmodel.NuevoNombre == "") {
      alert("El nombre de la nueva Tarifa no debe estar vacio");
      bProceed = 0;
    }


    if (bProceed) {
      if (confirm("¿Desea clonar la tarifa actual?")) {

        this.newmodel.idrow = this.model.idrow;

        const values = JSON.stringify(this.newmodel);

        this.service.HTTP_Post('/sm/tarifa_clonate', values).subscribe(
          data => {

            if (data.message == "OK") {
              this.modalClone.hide();
              this.newmodel.NuevoNombre = "";

              var id = data.value;
              //this.router.navigate(['/routes/herstellen/tarifasimul'], { queryParams: { id: id } });
              this.redirectTo('/routes/herstellen/tarifasimul', { queryParams: { id: id } });

            }
          },
          error => {
            this.toaster.error("No se ha Clonado la Tarifa", "CLONAR TARIFA");
          }
        );


      }
    }
  }

  Operation() {
    let bProceed = 1;

    if (this.model2.operation === "0" && this.model2.password === "") {
      alert("El password no puede estar vacio");
      bProceed = 0;
    }

    if (bProceed) {
      if (confirm("¿Desea realizar la operación sobre la tarifa seleccionada?")) {
        this.modalBloqueo.hide();

        this.model2.idrow = this.model.idrow;

        const values = JSON.stringify(this.model2);

        this.service.HTTP_Post('/sm/tarifa_operation', values).subscribe(
          data => {

            if (data.message === "OK") {



              if (data.value === -100) {
                this.toaster.warning("Password ERRONEO", "OPERACION TARIFA");
                this.model2.password = "";
              }
              else {
                this.toaster.success("Operación Realizada", "OPERACION TARIFA");
                this.model2.password = "";
                this.loadHeader(this.model.idrow);
              }
            }
          },
          error => {
            this.toaster.error("Operación NO realizada", "OPERACION TARIFA");
          }
        );


      }
    }
  }

  redirectTo(uri: string, params?: NavigationExtras) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri], params));
  }

  LoadDetails(x, y) {
    this.detailRows = [];
    this.articleRows = [];
    this.selectedDetail = null;

    let url = "/sm/tarifa_simulate_table_details/" + this.model.idrow + "/" + y + "/" + x;
    this.service.HTTP_Get(url).subscribe(
      data => { this.detailRows = data.Table || []; },
      error => { this.toaster.error(error.message); }
    );


  }

  LoadDetailsArticles(x, y, type) {
    this.articleRows = [];

    const url = '/sm/tarifa_simulate_table_details_articles/' + this.model.idrow + '/' + y + '/' + x + '/' + type;
    this.service.HTTP_Get(url).subscribe(
      data => { this.articleRows = data.Table || []; },
      error => { this.toaster.error(error.message); }
    );
  }


  Cellclick(event) {
    const args = event.args;
    const x = args.columnindex;
    const y = args.rowindex;

    this.tempX = x;
    this.tempY = y;

    if (this.model.tipoproducto == 3) {
      this.cx = (0.40 + 0.20 * (x - 2)).toFixed(2);
      this.cy = (1 + 0.10 * y).toFixed(2);
    }
    else if (this.model.tipoproducto == 2) {
      this.cx = (0.40 + 0.20 * (x - 2)).toFixed(2);
      this.cy = (0.655 + 0.20 * y).toFixed(3);
    }
    else {
      this.cx = (0.40 + 0.20 * (x - 2)).toFixed(2);
      this.cy = (0.60 + 0.20 * y).toFixed(2);
    }

    console.log("X: " + x + " Y: " + y);
    console.log("CX: " + this.cx + " CY: " + this.cy);

    this.selectedDetail = null;
    this.articleRows = [];

    this.LoadDetails(x, y);
    this.modalDetalle.show();
  }

  Rowselect(event: any): void {
    let type = event.args.row.articulo;
    this.LoadDetailsArticles(this.tempX, this.tempY, type);
  }



}
