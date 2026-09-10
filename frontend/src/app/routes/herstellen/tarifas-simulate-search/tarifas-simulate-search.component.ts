import { Component, OnInit, ViewChild, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { SearchType } from '../../../models/searchType'
import { Router } from '@angular/router';
import { Utils } from '../../../shared/Utils';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { ExcelService } from '../../../services/excel.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-tarifas-simulate-search',
  templateUrl: './tarifas-simulate-search.component.html',
  styleUrls: ['./tarifas-simulate-search.component.css'],
  providers: [HaruService, ExcelService]
})
export class TarifasSimulateSearchComponent implements OnInit {

  modalAddVisible: boolean = false;

  TipoPanel = 1;

  tipoExport: string = "1";
  tipoMapa: string = "1";
  DtoComercial: number = 0;
  MargenCliente: number = 0;
  exportOptions: Array<any> = [];
  exportMapas: Array<any> = [{ idrow: 1, descripcion: 'Precio Base' }, { idrow: 2, descripcion: 'Margen-Dto.Com' }];

  @ViewChild('gridSReference', { static: false }) mySGrid!: jqxGridComponent;
  @ViewChild('gridS2Reference', { static: false }) myS2Grid!: jqxGridComponent;
  @ViewChild('gridD1Reference', { static: false }) myGridD1!: jqxGridComponent;
  @ViewChild('gridD2Reference', { static: false }) myGridD2!: jqxGridComponent;
  @ViewChild('gridD3Reference', { static: false }) myGridD3!: jqxGridComponent;
  @ViewChild('gridD4Reference', { static: false }) myGridD4!: jqxGridComponent;
  @ViewChild('gridTiempos', { static: false }) myTiempo!: jqxGridComponent;

  @ViewChild('staticModal', { static: false }) public modalGeneration!: ModalDirective;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalUpdate', { static: false }) modalUpdate!: ModalDirective;
  @ViewChild('staticModalTiempos', { static: false }) modalTiempos!: ModalDirective;

  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  searchmodel = new SearchType();
  clientesapi: Array<any> = [];

  parametros = {
    idrow: '-1',
    sp_tarifa: '-1',
    sp_cliente: '-1',
    sp_sistema: '-1',
    sp_modelo: '-1',
    sp_accionamiento: '-1',
    sp_tejido: '-1',
    sp_grupo: '-1'
  }

  sp_sistemas: any = [];
  sp_modelos: any = [];
  sp_accionamientos: any = [];
  sp_tejidos: any = [];
  sp_grupos: any = [];
  sp_clientes: any = [];

  model_bulk: { ids: string | null; type: number; param1: number; param2: string } = {
    ids: null,
    type: 0,
    param1: 0,
    param2: ''
  }

  model = {
    NuevoNombre: '',
    idrow: -1
  }

  model2 = {
    operation: '1',
    password: '',
    idrow: '-1'
  }

  modelCliente: { idrow: string; c1: number; c2: number; c3: number; c4: number; ids: string | null } = {
    idrow: "-1",
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    ids: null
  }

  generacion = {
    base: '',
    ids1: '',
    ids2: '',
    model: 2
  }

  source2: any = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'nombre', type: 'string' },
      { name: 'margen1', type: 'number' },
      { name: 'margen2', type: 'number' },
      { name: 'margen3', type: 'number' },
      { name: 'margen4', type: 'number' },
      { name: 'tipo', type: 'number' },
      { name: 'marca', type: 'number' },
      { name: 'tejido', type: 'number' },
      { name: 'preciom2', type: 'number' },
      { name: 'bloqueo', type: 'number' },
      { name: 'criterio', type: 'number' },
      { name: 'desctejido', type: 'string' },
      { name: 'fn_sistema', type: 'string' },
      { name: 'fn_modelo', type: 'string' },
      { name: 'fn_accionamiento', type: 'string' },
      { name: 'fn_grupo', type: 'string' },
      { name: 'sp_tejido', type: 'string' },
      { name: 'op_synchronize', type: 'number' },
      { name: 'op_synchronized', type: 'number' },
      { name: 'op_synchr_date', type: 'date' },
      { name: 'sp_tarifa', type: 'string' },

    ],
    localdata: []
  };

  source3 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'c00', type: 'string' },
      { name: 'c01', type: 'string' },
      { name: 'c02', type: 'string' },
      { name: 'c03', type: 'string' },
      { name: 'c04', type: 'string' },
      { name: 'c05', type: 'string' },
      { name: 'c06', type: 'string' },
      { name: 'c07', type: 'string' },
      { name: 'c08', type: 'string' },
      { name: 'c09', type: 'string' },
      { name: 'c10', type: 'string' },
      { name: 'c11', type: 'string' },
      { name: 'c12', type: 'string' },
      { name: 'c13', type: 'string' },
      { name: 'c14', type: 'string' },
      { name: 'c15', type: 'string' },
      { name: 'c16', type: 'string' },
      { name: 'c17', type: 'string' },
      { name: 'c18', type: 'string' },
      { name: 'c19', type: 'string' },
      { name: 'c20', type: 'string' },
      { name: 'c21', type: 'string' },
      { name: 'c22', type: 'string' },
      { name: 'c23', type: 'string' },
      { name: 'c24', type: 'string' },
      { name: 'c25', type: 'string' },
      { name: 'c26', type: 'string' },
      { name: 'c27', type: 'string' },
      { name: 'c28', type: 'string' },
      { name: 'c29', type: 'string' },
      { name: 'c30', type: 'string' },
      { name: 'c31', type: 'string' },
      { name: 'c32', type: 'string' },
      { name: 'c33', type: 'string' },
      { name: 'c34', type: 'string' },
      { name: 'c35', type: 'string' },
      { name: 'c36', type: 'string' },
      { name: 'c37', type: 'string' },
      { name: 'c38', type: 'string' },
      { name: 'c39', type: 'string' },
      { name: 'c40', type: 'string' },
      { name: 'c41', type: 'string' },
      { name: 'c42', type: 'string' },
      { name: 'c43', type: 'string' },
      { name: 'c44', type: 'string' },
      { name: 'c45', type: 'string' },
      { name: 'c46', type: 'string' },
      { name: 'c47', type: 'string' },
      { name: 'c48', type: 'string' },
      { name: 'c49', type: 'string' },
      { name: 'c50', type: 'string' },
      { name: 'c51', type: 'string' },
      { name: 'c52', type: 'string' },
      { name: 'c53', type: 'string' },
      { name: 'c54', type: 'string' },
      { name: 'c55', type: 'string' },
      { name: 'c56', type: 'string' },
      { name: 'c57', type: 'string' },
      { name: 'c58', type: 'string' },
      { name: 'c59', type: 'string' },
      { name: 'c60', type: 'string' }

    ],
    localdata: null
  };

  sourceD1: any = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'nombre', type: 'string' },
    ],
    localdata: []
  };

  sourceD2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' },
    ],
    localdata: null
  };

  sourceD3: any = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'nombre', type: 'string' },
    ],
    localdata: []
  };

  sourceD4 = {
    type: "GET",
    datatype: "json",
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
      { name: 'k', type: 'number' }
    ],
    localdata: null
  };

  sourceT = {
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

  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapter3 = new $.jqx.dataAdapter(this.source3, { contentType: 'application/json; charset=utf-8' });

  dataAdapterD1 = new $.jqx.dataAdapter(this.sourceD1, { contentType: 'application/json; charset=utf-8' });
  dataAdapterD2 = new $.jqx.dataAdapter(this.sourceD2, { contentType: 'application/json; charset=utf-8' });

  dataAdapterD3 = new $.jqx.dataAdapter(this.sourceD3, { contentType: 'application/json; charset=utf-8' });
  dataAdapterD4 = new $.jqx.dataAdapter(this.sourceD4, { contentType: 'application/json; charset=utf-8' });

  dataAdapterT = new $.jqx.dataAdapter(this.sourceT, { contentType: 'application/json; charset=utf-8' });

  diasRenderer = (
    row,
    columnfield,
    value,
    defaulthtml,
    columnproperties,
    rowdata
  ) => {

    if (value == true) {
      value = "SYNC";
      return (
        '<span style="width:60;margin: 8px; float: ' +
        columnproperties.cellsalign +
        '; color:black;background-color: yellow;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }
    else {
      value = "";
      return (
        '<span style="width:60;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '; color:white;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }
  };

  diasRenderer2 = (
    row,
    columnfield,
    value,
    defaulthtml,
    columnproperties,
    rowdata
  ) => {

    if (value == true) {
      value = "FIN";
      return (
        '<span style="width:60;margin: 8px; float: ' +
        columnproperties.cellsalign +
        '; color:white;background-color: green;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }
    else {
      value = "";
      return (
        '<span style="width:60;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '; color:white;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }
  };

  settingsS: any = {
    width: '99%',
    height: 640,
    pageable: true,
    autoheight: true,
    theme: 'bootstrap',
    pagesizeoptions: ['25', '50', '100', '500'],
    pagesize: 51,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: true,
    showstatusbar: false,
    source: this.dataAdapter2,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 45, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'nombre', width: 400, filtertype: 'input', editable: false },
      { text: 'Bloq', columngroup: 'ProductDetails', datafield: 'bloqueo', width: 40, editable: false, cellsalign: "center" },
      { text: 'Crit', columngroup: 'ProductDetails', datafield: 'criterio', width: 40, editable: false, cellsalign: "center" },
      { text: 'Tejido', columngroup: 'ProductDetails', datafield: 'desctejido', editable: false },
      { text: 'Precio', columngroup: 'ProductDetails', datafield: 'preciom2', width: 50, editable: false, cellsalign: "center" },
      { text: 'MTej', columngroup: 'ProductDetails', datafield: 'margen1', width: 50, editable: false, cellsalign: "center" },
      { text: 'MCli', columngroup: 'ProductDetails', datafield: 'margen2', width: 50, editable: false, cellsalign: "center" },
      { text: 'MMec', columngroup: 'ProductDetails', datafield: 'margen3', width: 50, editable: false, cellsalign: "center" },
      { text: 'MAcc', columngroup: 'ProductDetails', datafield: 'margen4', width: 50, editable: false, cellsalign: "center" },
      { text: 'Tarifa', columngroup: 'ProductDetails', datafield: 'sp_tarifa', width: 60, editable: false, cellsalign: "center" },
      { text: 'Sistema', columngroup: 'ProductDetails', datafield: 'fn_sistema', width: 100, editable: false, cellsalign: "center" },
      { text: 'Modelo', columngroup: 'ProductDetails', datafield: 'fn_modelo', width: 90, editable: false, cellsalign: "center" },
      { text: 'Accion', columngroup: 'ProductDetails', datafield: 'fn_accionamiento', width: 90, editable: false, cellsalign: "center" },
      { text: 'Tejido', columngroup: 'ProductDetails', datafield: 'sp_tejido', width: 90, editable: false, cellsalign: "center" },
      { text: 'Grupo', columngroup: 'ProductDetails', datafield: 'fn_grupo', width: 90, editable: false, cellsalign: "center" },
      { text: 'Sync', columngroup: 'ProductDetails', datafield: 'op_synchronize', width: 60, editable: false, cellsalign: "center", cellsrenderer: this.diasRenderer },
      { text: 'Status', columngroup: 'ProductDetails', datafield: 'op_synchronized', width: 60, editable: false, cellsalign: "center", cellsrenderer: this.diasRenderer2 },
      { text: 'Date', columngroup: 'ProductDetails', datafield: 'op_synchr_date', width: 130, editable: false, cellsalign: "center", cellsformat: "dd/MM/yyyy HH:mm:ss", }

    ]
  };

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  intValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 3, min: 0, spinButtons: false });
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }

    return '99%';
  }
  settings3: any = {
    width: 0,
    height: 0,
    pageable: false,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500', '1000'],
    pagesize: 1000,
    scrollmode: 'logical',
    sortable: false,
    altrows: false,
    enabletooltips: false,
    editable: false,
    groupable: false,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen, 
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: false,
    filterable: false,
    columnsresize: false,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter3,
    columns: [
      { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '0.40', datafield: 'c02', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.60', datafield: 'c03', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.80', datafield: 'c04', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.00', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.20', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.40', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.60', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.80', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.00', datafield: 'c10', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.20', datafield: 'c11', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.40', datafield: 'c12', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.60', datafield: 'c13', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.80', datafield: 'c14', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.00', datafield: 'c15', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.20', datafield: 'c16', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.40', datafield: 'c17', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.60', datafield: 'c18', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.80', datafield: 'c19', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.00', datafield: 'c20', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.20', datafield: 'c21', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.40', datafield: 'c22', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.60', datafield: 'c23', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.80', datafield: 'c24', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.00', datafield: 'c25', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.20', datafield: 'c26', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.40', datafield: 'c27', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.60', datafield: 'c28', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.80', datafield: 'c29', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.00', datafield: 'c30', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.20', datafield: 'c31', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.40', datafield: 'c32', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.60', datafield: 'c33', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.80', datafield: 'c34', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '7.00', datafield: 'c35', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '7.20', datafield: 'c36', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '7.40', datafield: 'c37', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '7.60', datafield: 'c38', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '7.80', datafield: 'c39', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '8.00', datafield: 'c40', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '8.20', datafield: 'c41', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '8.40', datafield: 'c42', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '8.60', datafield: 'c43', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '8.80', datafield: 'c44', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '9.00', datafield: 'c45', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '9.20', datafield: 'c46', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '9.40', datafield: 'c47', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '9.60', datafield: 'c48', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '9.80', datafield: 'c49', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '10.00', datafield: 'c50', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '10.20', datafield: 'c51', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '10.40', datafield: 'c52', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '10.60', datafield: 'c53', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '10.80', datafield: 'c54', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '11.00', datafield: 'c55', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '11.20', datafield: 'c56', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '11.40', datafield: 'c57', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '11.60', datafield: 'c58', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '11.80', datafield: 'c59', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '12.00', datafield: 'c60', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    ]

  };

  settingsD1: any = {
    width: '99%',
    height: 650,
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['20', '50', '100', '500'],
    pagesize: 20,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: false,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterD1,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 50, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'nombre', filtertype: 'input', editable: false }
    ]
  };

  settingsD2: any = {
    width: '99%',
    height: 660,
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['20', '50', '100', '500'],
    pagesize: 20,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: false,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterD2,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 50, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'descripcion', filtertype: 'input', editable: false }
    ]
  };

  settingsD3: any = {
    width: '99%',
    height: 600,
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['20', '50', '100', '500'],
    pagesize: 20,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: false,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterD3,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 50, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'nombre', filtertype: 'input', editable: false }
    ]
  };

  settingsD4: any = {
    width: '99%',
    height: 600,
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['20', '50', '100', '500'],
    pagesize: 20,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: false,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterD4,
    columns: [
      { text: 'art', datafield: 'articulo', width: 45, filtertype: 'textbox', editable: false },
      { text: 'Descripcion', datafield: 'descripcion', width: 300, filtertype: 'textbox', editable: false },
      {
        text: 'Consumo', datafield: 'cantidad', width: 65, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      {
        text: 'Precio', datafield: 'precio', width: 75, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      {
        text: 'MMeca', datafield: 'mmeca', width: 55, filtertype: 'number', editable: true, cellsalign: 'center', cellsformat: 'd2',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      {
        text: 'PrecioM', datafield: 'precio2', width: 65, filtertype: 'number', editable: false, cellsalign: 'center', cellsformat: 'd4',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      },
      { text: 'Unidad', datafield: 'descUnidad', width: 60, filtertype: 'list', editable: false, cellsalign: 'center' },
      { text: 'Cod_Sol', datafield: 'cod_sol', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'De(cm)', datafield: 'desde', width: 50, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'A(cm)', datafield: 'hasta', width: 50, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad },
      { text: 'K(cant)', datafield: 'k', width: 50, filtertype: 'number', editable: true, cellsalign: 'center', columntype: 'numberinput', createeditor: this.decimalValueCantidad }
    ]
  };

  settingsT: any = {
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
    selectionmode: 'singlecell', /* wir haben hier verschiedene Optionen,
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterT,
    columns: [
      { text: 'Desde', datafield: 'desde', width: 100, filtertype: 'textbox', editable: false, cellsalign: 'right' },
      { text: 'Hasta', datafield: 'hasta', width: 100, filtertype: 'textbox', editable: false, cellsalign: 'right' },
      {
        text: 'Tiempo', datafield: 'tiempo', width: 100, filtertype: 'textbox', editable: true, cellsalign: 'right', cellsformat: 'd2',
        columntype: 'numberinput', createeditor: this.decimalValueCantidad
      }
    ]
  };

  constructor(private service: HaruService, private router: Router,
    private toaster: ToastrService, vRef: ViewContainerRef, private excel: ExcelService) {

    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {


    this.GetMapsOptions();
    this.loadClientes();
    this.loadMaster();

  }

  ngAfterViewInit() {

    this.mySGrid.createComponent(this.settingsS);
    this.myS2Grid.createComponent(this.settings3);

    this.myGridD1.createComponent(this.settingsD1);
    this.myGridD2.createComponent(this.settingsD2);

    this.myGridD3.createComponent(this.settingsD3);
    this.myGridD4.createComponent(this.settingsD4);

    this.myTiempo.createComponent(this.settingsT);

    setTimeout(() => this.searchDocuments(), 0);

  }

  loadMaster() {
    this.service.HTTP_Get("/sm/import_tables/SISTEMA").subscribe(
      data => {
        this.sp_sistemas = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get("/sm/import_tables/MODELO").subscribe(
      data => {
        this.sp_modelos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get("/sm/import_tables/ACCIONAMIENTO").subscribe(
      data => {
        this.sp_accionamientos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get("/sm/import_tables/TEJIDOS").subscribe(
      data => {
        this.sp_tejidos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get("/sm/import_tables/GRUPOS").subscribe(
      data => {
        this.sp_grupos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get("/sm/import_tables/TIPO_TARIFA").subscribe(
      data => {
        this.sp_clientes = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

  }

  searchDocuments() {

    this.mySGrid.clearselection();
    this.service.HTTP_Get("/sm/tarifa_simulate_search/-1").subscribe(
      data => {
        this.source2.localdata = data.Table;
        this.mySGrid.updatebounddata();
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  searchDocumentsD1() {
    this.service.HTTP_Get("/sm/tarifa_simulate_search/-1").subscribe(
      data => {
        this.sourceD1.localdata = data.Table;
        this.myGridD1.updatebounddata("cells");
      },
      error => {
        this.toaster.error(error.message);
      }
    );

  }

  searchDocumentsD3() {
    this.service.HTTP_Get("/sm/tarifa_simulate_search/0").subscribe(
      data => {
        this.sourceD3.localdata = data.Table;
        this.myGridD3.updatebounddata("cells");
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  onDateChange(e, e1) {

  }

  New() {
    this.router.navigate(['/routes/herstellen/tarifasimul'], { queryParams: { id: -1 } });
  }

  rowSelect(event: any): void {



  }

  rowdoubleclick(event: any): void {

    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length == 1) {
      var id = arrayData[0];

      //this.router.navigate(['/routes/herstellen/tarifasimul'], { queryParams: { id: id } });


      let url = "#/routes/herstellen/tarifasimul?id=" + id;
      window.open(url, "_blank");
    }

    if (arrayData.length > 1) {
      alert("Solo se puede cargar una simulación");
    }

  }

  Operation() {
    let bProceed = 1;
    var arrayData = [];
    arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");


    if (this.model2.operation === "0" && this.model2.password === "") {
      alert("El password no puede estar vacio");
      bProceed = 0;
    }

    if (bProceed && arrayData.length == 0) {
      alert("Debe Seleccionar una línea para clonar");
      bProceed = 0;
    }

    if (bProceed) {
      if (confirm("¿Desea realizar la operación sobre las tarifas seleccionada?")) {
        this.model2.idrow = arrayData.join(";");
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
                this.mySGrid.clearselection();
                this.searchDocuments();
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

  Export() {
    var pathExportScript = this.service.Export();
    //this.myS2Grid.exportdata("xls", "tarifas", true, null, false, pathExportScript);

    //console.log(this.source3.localdata);
    this.excel.exportAsExcelFile(this.source3.localdata, "tarifas");

  }

  GetMapsOptions() {
    this.service.HTTP_Get('/sm/tarifa_simulate_export_types').subscribe(
      data => {
        this.exportOptions = data.Table;
      }
    );
  }

  ExportarMapasCliente() {
    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length > 0) {

      if (confirm("¿Desea generar los mapas del cliente?")) {
        this.modelCliente.ids = arrayData.join(",");
        var url = '/sm/tarifas_genera_cliente';

        let values = JSON.stringify(this.modelCliente);

        this.service.HTTP_Post(url, values).subscribe(
          data => {
            if (data.message === "OK") {
              this.toaster.success("Generados los mapas", "GENERAR TARIFA");
              this.router.navigate(['/routes/herstellen/tarifasimul-cli-search'], { queryParams: { id: -1 } });
            }
          },
          error => {
            this.toaster.error("No se ha generado la Tarifa", "GENERAR TARIFA");
          }
        );
      }
    }
  }

  ShowHide() {
    if (this.tipoExport != "7") {
      this.myS2Grid.hidecolumn("c31");
      this.myS2Grid.hidecolumn("c32");
      this.myS2Grid.hidecolumn("c33");
      this.myS2Grid.hidecolumn("c34");
      this.myS2Grid.hidecolumn("c35");
      this.myS2Grid.hidecolumn("c36");
      this.myS2Grid.hidecolumn("c37");
      this.myS2Grid.hidecolumn("c38");
      this.myS2Grid.hidecolumn("c39");
      this.myS2Grid.hidecolumn("c40");
      this.myS2Grid.hidecolumn("c41");
      this.myS2Grid.hidecolumn("c42");
      this.myS2Grid.hidecolumn("c43");
      this.myS2Grid.hidecolumn("c44");
      this.myS2Grid.hidecolumn("c45");
      this.myS2Grid.hidecolumn("c46");
      this.myS2Grid.hidecolumn("c47");
      this.myS2Grid.hidecolumn("c48");
      this.myS2Grid.hidecolumn("c49");
      this.myS2Grid.hidecolumn("c50");
      this.myS2Grid.hidecolumn("c51");
      this.myS2Grid.hidecolumn("c52");
      this.myS2Grid.hidecolumn("c53");
      this.myS2Grid.hidecolumn("c54");
      this.myS2Grid.hidecolumn("c55");
      this.myS2Grid.hidecolumn("c56");
      this.myS2Grid.hidecolumn("c57");
      this.myS2Grid.hidecolumn("c58");
      this.myS2Grid.hidecolumn("c59");
      this.myS2Grid.hidecolumn("c60");
    }
    else {
      this.myS2Grid.showcolumn("c31");
      this.myS2Grid.showcolumn("c32");
      this.myS2Grid.showcolumn("c33");
      this.myS2Grid.showcolumn("c34");
      this.myS2Grid.showcolumn("c35");
      this.myS2Grid.showcolumn("c36");
      this.myS2Grid.showcolumn("c37");
      this.myS2Grid.showcolumn("c38");
      this.myS2Grid.showcolumn("c39");
      this.myS2Grid.showcolumn("c40");
      this.myS2Grid.showcolumn("c41");
      this.myS2Grid.showcolumn("c42");
      this.myS2Grid.showcolumn("c43");
      this.myS2Grid.showcolumn("c44");
      this.myS2Grid.showcolumn("c45");
      this.myS2Grid.showcolumn("c46");
      this.myS2Grid.showcolumn("c47");
      this.myS2Grid.showcolumn("c48");
      this.myS2Grid.showcolumn("c49");
      this.myS2Grid.showcolumn("c50");
      this.myS2Grid.showcolumn("c51");
      this.myS2Grid.showcolumn("c52");
      this.myS2Grid.showcolumn("c53");
      this.myS2Grid.showcolumn("c54");
      this.myS2Grid.showcolumn("c55");
      this.myS2Grid.showcolumn("c56");
      this.myS2Grid.showcolumn("c57");
      this.myS2Grid.showcolumn("c58");
      this.myS2Grid.showcolumn("c59");
      this.myS2Grid.showcolumn("c60");
    }
  }

  /*
  */
  ExportTarifas(operation) {

    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");

    if (arrayData.length > 0) {
      const url = '/sm/tarifa_simulate_table_sync_operate';

      var model = {
        status: operation,
        idrow: arrayData.join(",")
      }

      var values = JSON.stringify(model);

      this.service.HTTP_Post(url, values).subscribe(
        data => {
          if (data.message === "OK") {
            this.searchDocuments();
            this.toaster.success("Iniciada la exportación", "EXPORTAR TARIFA");
          }
        },
        error => {
          this.toaster.error("No se ha iniciado la exportación", "EXPORTAR TARIFA");
        }
      );
    }
  }

  ExportarMapas() {
    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length > 0) {
      const url = '/sm/tarifas_simulate_export_v2';

      var model = {
        tipoexport: this.tipoExport,
        tipomapa: this.tipoMapa,
        dtocom: this.DtoComercial,
        margen: this.MargenCliente,
        ids: arrayData.join(",")
      }

      var values = JSON.stringify(model);

      this.service.HTTP_Post(url, values).subscribe(
        data => {
          if (data.message === "OK") {
            if (data.Table.length > 0) {
              this.source3.localdata = data.Table;
              this.dataAdapter3.dataBind();
              this.myS2Grid.updatebounddata();
              this.ShowHide();
              this.Export();
              this.toaster.success("Exportados los mapas", "EXPORTAR TARIFA");
            }
          }
        },
        error => {
          this.toaster.error("No se ha Clonado la Tarifa", "CLONAR TARIFA");
        }
      );
    }

  }

  /*
  */
  BulkApply() {

    let bProceed = 1;
    var arrayData = [];
    arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");

    if (this.model_bulk.param1 == 0) {
      alert("Debe indicar el precio a modificar");
      bProceed = 0;
    }

    if (bProceed) {
      if (confirm("¿Desea actualizar el precio del tejido en la selección?")) {

        this.model_bulk.type = 100;
        this.model_bulk.ids = arrayData.join(",");

        const values = JSON.stringify(this.model_bulk);

        this.service.HTTP_Post('/sm/tarifa_bulk', values).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success("Aplicado el cambio a las Tarifas seleccionadas", "APLICAR SOBRE TARIFAS");
              this.model_bulk.param1 = 0;
              this.mySGrid.clearselection();
              this.searchDocuments();
            }
          },
          error => {
            this.toaster.error("No se ha Clonado la Tarifa", "CLONAR TARIFA");
          }
        );

      }
    }

  }

  Clone() {

    let bProceed = 1;
    var arrayData = [];
    arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");


    if (this.model.NuevoNombre == "") {
      alert("El nombre de la nueva Tarifa no debe estar vacio");
      bProceed = 0;
    }

    if (bProceed && arrayData.length == 0) {
      alert("Debe Seleccionar una línea para clonar");
      bProceed = 0;
    }

    if (bProceed && arrayData.length > 1) {
      alert("Debe Seleccionar SOLO línea para clonar");
      bProceed = 0;
    }

    if (bProceed) {
      if (confirm("¿Desea clonar la tarifa seleccionada?")) {

        this.model.idrow = arrayData[0];

        const values = JSON.stringify(this.model);

        this.service.HTTP_Post('/sm/tarifa_clonate', values).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success("Clonada la Tarifa", "CLONAR TARIFA");
              this.model.NuevoNombre = "";
              this.mySGrid.clearselection();
              this.searchDocuments();
            }
          },
          error => {
            this.toaster.error("No se ha Clonado la Tarifa", "CLONAR TARIFA");
          }
        );


      }
    }
  }


  loadClientes() {
    this.service.HTTP_Get("/sm/clientesapi").subscribe(
      data => {
        this.clientesapi = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  LoadCustomerData() {

    this.clientesapi.forEach((item) => {

      if (String(item.idrow) === this.modelCliente.idrow) {
        this.modelCliente.c1 = item.C1_Comercial;
        this.modelCliente.c2 = item.C2_Rappel;
        this.modelCliente.c3 = item.C3_Publicidad;
        this.modelCliente.c4 = item.C4_ProntoPago;
      }

    });
  }

  Multiple() {
    this.modalAddVisible = true;
    this.searchDocumentsD1();
    this.LoadGrupos();
    setTimeout(() => this.modalGeneration.show(), 200);

  }

  MultipleEdicion() {
    this.TipoPanel = 2;
    this.searchDocumentsD3();
    //this.LoadGrupos();
  }

  CloseMultipleEdicion() {
    this.TipoPanel = 1;
  }

  LoadTejidos() {
    var route = "/tejidos";
    this.settingsD2.filterable = false;
    this.myGridD2.showloadelement();
    this.service.HTTP_Get('/sm' + route).subscribe(
      data => {
        this.sourceD2.localdata = data.Table;
        this.dataAdapterD2.dataBind();
        this.myGridD2.updatebounddata("cells");
        this.settingsD2.filterable = true;
      },
      error => {
        console.log(error);
      });
    this.myGridD2.hideloadelement();

  }

  LoadGrupos() {
    var route = "/grupos";
    this.settingsD2.filterable = false;
    this.myGridD2.showloadelement();
    this.service.HTTP_Get('/sm' + route).subscribe(
      data => {
        this.sourceD2.localdata = data.Table;
        this.dataAdapterD2.dataBind();
        this.myGridD2.updatebounddata("cells");
        this.settingsD2.filterable = true;
      },
      error => {
        console.log(error);
      });
    this.myGridD2.hideloadelement();
  }


  RealizarGeneracion() {

    let bprocess = 1;
    let arrayData1 = Utils.getSelectedRows(this.myGridD1, "idrow");
    let arrayData2 = Utils.getSelectedRows(this.myGridD2, "idrow");

    if (this.generacion.base == "") {
      bprocess = 0;
      alert("Es necesario indicar el texto base");
    }

    if (bprocess == 1 && arrayData1.length == 0) {
      bprocess = 0;
      alert("Debe Seleccionar la tarifa base");
    }

    if (bprocess == 1 && arrayData1.length > 1) {
      bprocess = 0;
      alert("Debe Seleccionar UNA tarifa base");
    }

    if (bprocess == 1 && arrayData2.length == 0) {
      bprocess = 0;
      alert("Debe Seleccionar tejidos o grupos para poder generar");
    }

    if (bprocess == 1 && confirm("¿Desea Iniciar la generación múltiple de Tarifas?")) {

      this.generacion.ids1 = arrayData1.join(",");
      this.generacion.ids2 = arrayData2.join(",");

      let values = JSON.stringify(this.generacion);
      let url = "/sm/tarifa_genera_multiple";
      this.service.HTTP_Post(url, values).subscribe(
        data => {
          this.modalGeneration.hide();
          this.searchDocuments();
        },
        error => {
          alert("Error en la generación " + error);
        }
      );
    }
  }


  ChangeModel(value) {
    if (value == 1) {
      this.generacion.model = 1;
      this.LoadTejidos();
    }

    if (value == 2) {
      this.generacion.model = 2;
      this.LoadGrupos();

    }
  }


  Edicion_rowSelect(event: any): void {




  }

  Edicion_rowdoubleclick(event: any): void {

  }

  CargarArticulos() {

    var arrayData = Utils.getSelectedRows(this.myGridD3, "idrow");
    let model = {
      base: arrayData.join(";")
    }

    let values = JSON.stringify(model);
    this.service.HTTP_Post('/sm/tarifas_articulos_comunes', values).subscribe(
      data => {
        this.sourceD4.localdata = data.Table;
        this.dataAdapterD4.dataBind();
        this.myGridD4.updatebounddata("cells");
      },
      error => {
        console.log(error);
      });
  }

  Open() {
    this.modalAdd.show();
  }
  /*
  */
  Seleccion_BorrarArticulos() {

    var arrayData1 = Utils.getSelectedRows(this.myGridD3, "idrow");
    var arrayData2 = Utils.getSelectedRows(this.myGridD4, "articulo");

    if (arrayData1.length > 0 && arrayData2.length > 0) {
      if (confirm("¿Desea Borrar los Artículos seleccionados?")) {

        let model = {
          ids: arrayData1.join(";"),
          deletes: arrayData2.join(",")
        }

        let values = JSON.stringify(model);
        this.service.HTTP_Post('/sm/tarifas_articulos_borrar_multiple', values).subscribe(
          data => {
            this.myGridD4.clearselection();
            this.CargarArticulos();
          },
          error => {
            console.log(error);
          });

      }
    }

  }

  Update() {

    var arrayData1 = Utils.getSelectedRows(this.myGridD3, "idrow");
    var rows = this.search.getRows();

    if (arrayData1.length > 0 && rows.length > 0) {
      if (confirm("¿Desea Agregar los Artículos seleccionados?")) {

        let model = {
          ids: arrayData1.join(";"),
          articles: rows.join(",")
        }

        let values = JSON.stringify(model);
        this.service.HTTP_Post('/sm/tarifas_articulos_agregar_multiple', values).subscribe(
          data => {
            this.myGridD4.clearselection();
            this.CargarArticulos();
          },
          error => {
            console.log(error);
          });
      }
    }
  }

  cellBeginEditEvent(event: any): void {
    let args = event.args;
    //this.beginEdit.nativeElement.innerHTML = 'Event Type: cellbeginedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;
    console.log(args.datafield);

  }

  cellEndEditEvent(event: any): void {

    var arrayData1 = Utils.getSelectedRows(this.myGridD3, "idrow");
    let args = event.args;
    var oldvalue = args.oldvalue;
    var newvalue = args.value;

    if (arrayData1.length > 0 && oldvalue != newvalue) {

      let row = event.args.row;
      let ids = arrayData1.join(";");
      let articles = row.articulo;
      let cantidad = row.cantidad;
      let precio = row.precio;
      let desde = row.desde;
      let hasta = row.hasta;
      let mmeca = row.mmeca;
      let k = row.k;

      if (args.datafield == "cantidad") {
        cantidad = args.value;
      }
      if (args.datafield == "precio") {
        precio = args.value;
      }
      if (args.datafield == "desde") {
        desde = args.value;
      }
      if (args.datafield == "hasta") {
        hasta = args.value;
      }
      if (args.datafield == "mmeca") {
        mmeca = args.value;
      }
      if (args.datafield == "k") {
        k = args.value;
      }

      var model = {
        ids: ids,
        articles: articles,
        cantidad: cantidad,
        precio: precio,
        desde: desde,
        hasta: hasta,
        mmeca: mmeca,
        k: k
      }

      let values = JSON.stringify(model);
      var route = "/sm/tarifas_articulos_actualizar_multiple";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          this.toaster.success("Actualizadas lineas", "Actualización");
          this.myGridD4.clearselection();
          this.CargarArticulos();
        },
        error => {
          this.toaster.error("No se ha Actualizado las lineas", "Actualización");
        });
    }

  }

  ClearSelection() {
    this.myGridD3.clearselection();
  }


  ParametrosExportacion() {
    this.modalUpdate.show();
  }

  AssignTarifa() {

    let arrayData1 = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData1.length == 1) {
      this.parametros.idrow = arrayData1.join("");
      let values = JSON.stringify(this.parametros);
      var route = "/sm/tarifas_parametros_export";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          this.toaster.success("Actualizados parámetros", "Actualización");
          this.searchDocuments();
        },
        error => {
          this.toaster.error(error.message);
        });
    }

  }

  ActualizarPrecioCoste() {
    if (confirm("¿Desea actualizar el precio de coste de TODAS las TARIFAS DESBLOQUEADAS?")) {

      let model = {
        ids: 0
      }
      var route = "/sm/tarifas_update_coste";
      let values = JSON.stringify(model);
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          this.toaster.success("Actualizado Precio de Coste", "Actualización");
          this.searchDocuments();
        },
        error => {
          console.log(error);
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

    let addProceso1Container = document.createElement('div');
    addProceso1Container.id = 'proceso1Button';
    addProceso1Container.style.cssText = 'float: left; margin-left: 5px;';
    buttonsContainer.appendChild(addProceso1Container);

    let addProceso2Container = document.createElement('div');
    addProceso2Container.id = 'proceso2Button';
    addProceso2Container.style.cssText = 'float: left; margin-left: 5px;';
    buttonsContainer.appendChild(addProceso2Container);

    statusbar[0].appendChild(buttonsContainer);

  }

  ExportarLineas() {
    var pathExportScript = this.service.Export();
    this.mySGrid.exportdata("xls", "tarifas", true, undefined, false, pathExportScript);

    //this.excel.exportAsExcelFile(this.source2.localdata, "tarifas");

  }

  public createButtons(): void {

    let exportBtnOptions = {
      width: 150, height: 25, value: 'Exportar Líneas', textPosition: 'center'
    }

    let modifBtnOptions = {
      width: 150, height: 25, value: 'Act.Precio de Coste', textPosition: 'center'
    }

    let modifBtnOptions2 = {
      width: 150, height: 25, value: 'Act.Mano de Obra', textPosition: 'center'
    }

    let exportButton = jqwidgets.createInstance('#exportButton', 'jqxButton', exportBtnOptions);
    exportButton.addEventHandler('click', (event: any): void => {
      this.ExportarLineas();
      //let datarow = generatedata(1);
      //this.mySGrid.addrow(null, datarow[0]);
    });

    let proceso1Button = jqwidgets.createInstance('#proceso1Button', 'jqxButton', modifBtnOptions);
    proceso1Button.addEventHandler('click', (event: any): void => {
      this.ActualizarPrecioCoste();
      //let datarow = generatedata(1);
      //this.mySGrid.addrow(null, datarow[0]);
    });

    let proceso2Button = jqwidgets.createInstance('#proceso2Button', 'jqxButton', modifBtnOptions2);
    proceso2Button.addEventHandler('click', (event: any): void => {
      this.ActualizarManoObra();
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

  LoadTimes() {
    const url = '/sm/tarifa_simulate_times/-1';
    this.service.HTTP_Get(url).subscribe(
      data => {
        if (data.Table.length > 0) {
          this.sourceT.localdata = data.Table;
          this.dataAdapterT.dataBind();
          this.myTiempo.updatebounddata();
        }
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  OpenTimes() {
    this.modalTiempos.show();
    this.LoadTimes();
  }

  ActualizaTiempos() {
    this.modalTiempos.hide();
    if (confirm("¿Desea Actualizar los precios de la mano de obra?")) {

      let values = this.myTiempo.exportdata("json");
      var route = "/sm/tarifas_update_manoobra";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          this.toaster.success("Actualizada Mano de Obra", "Actualización");
          //this.searchDocuments();
        },
        error => {
          this.toaster.error(error.message);
        });
    }
  }

  ActualizarManoObra() {
    if (confirm("¿Desea Actualizar los precios de la mano de obra de las TARIFAS DESBLOQUEADAS?")) {

      var route = "/sm/tarifas_update_manoobra_apply";
      this.service.HTTP_Get(route).subscribe(
        data => {
          this.toaster.success("Actualizada Mano de Obra en TARIFAS", "Actualización");
          this.searchDocuments();
        },
        error => {
          this.toaster.error(error.message);
        });
    }
  }

  deleteDocuments() {
    let arrayData1 = Utils.getNBSelectedRows(this.mySGrid, "idrow");
    if (arrayData1.length == 0) {
      alert("No ha seleccionado Tarifas Desbloqueadas");
    } else {

      if (confirm("¿Desea proceder al borrado de la selección?")) {

        let model = {
          ids: arrayData1.join(",")
        }
        let values = JSON.stringify(model);
        var route = "/sm/tarifa_simulate_del_multiple";
        this.service.HTTP_Post(route, values).subscribe(
          data => {
            this.toaster.success("Borradas las Tarifas Seleccionadas", "Borrado");
            this.searchDocuments();
          },
          error => {
            this.toaster.error(error.message);
          });
      }
    }
  }

  onModalAddShown() {
    if (this.search) {
      this.search.createButtons();
    }
  }


}

