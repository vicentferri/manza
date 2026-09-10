import { Component, OnInit, ViewChild, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { SearchType } from '../../../models/searchType'
import { Router } from '@angular/router';
import { Utils } from '../../../shared/Utils';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-tarifas-simulate-cliente-search',
  templateUrl: './tarifas-simulate-cliente-search.component.html',
  styleUrls: ['./tarifas-simulate-cliente-search.component.css'],
  providers: [HaruService]
})
export class TarifasSimulateClienteSearchComponent implements OnInit {

  tipoExport: string = "1";
  tipoMapa: string = "1";
  DtoComercial: number = 0;
  MargenCliente: number = 0;
  exportOptions: Array<any> = [];
  exportMapas: Array<any> = [{ idrow: 1, descripcion: 'Precio Base' }, { idrow: 2, descripcion: 'Margen-Dto.Com' }];

  @ViewChild('gridSReference', { static: false }) mySGrid!: jqxGridComponent;
  @ViewChild('gridS2Reference', { static: false }) myS2Grid!: jqxGridComponent;
  @ViewChild('staticModalUpdate', { static: false }) modalUpdate!: ModalDirective;

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


  searchmodel = new SearchType();
  clientesapi: Array<any> = [];

  model = {
    NuevoNombre: '',
    idrow: -1
  }

  model2 = {
    operation: '1',
    password: '',
    idrow: -1
  }

  modelCliente = {
    idrow: "-1",
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    ids: null
  }

  source2 = {
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
      { name: 'clientes', type: 'string' },
      { name: 'criterio', type: 'number' },
      { name: 'desctejido', type: 'string' },
      { name: 'c1', type: 'number' },
      { name: 'c2', type: 'number' },
      { name: 'c3', type: 'number' },
      { name: 'c4', type: 'number' },
      { name: 'fn_cliente', type: 'string' },
      { name: 'fn_sistema', type: 'string' },
      { name: 'fn_modelo', type: 'string' },
      { name: 'fn_accionamiento', type: 'string' },
      { name: 'fn_grupo', type: 'string' },
      { name: 'sp_tejido', type: 'string' },
      { name: 'razon_social', type: 'string' },
      { name: 'op_synchronize', type: 'number' },
      { name: 'op_synchronized', type: 'number' },
      { name: 'op_synchr_date', type: 'date' },
    ],
    url: ""
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
      { name: 'c32', type: 'string' }

    ],
    localdata: null
  };

  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });
  dataAdapter3 = new $.jqx.dataAdapter(this.source3, { contentType: 'application/json; charset=utf-8' });


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
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter2,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 40, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'nombre', width: 325, filtertype: 'input', editable: false },
      { text: 'Cliente', columngroup: 'ProductDetails', datafield: 'clientes', width: 125, editable: false, cellsalign: "center" },
      { text: 'C1', columngroup: 'ProductDetails', datafield: 'c1', width: 30, editable: false, cellsalign: "center" },
      { text: 'C2', columngroup: 'ProductDetails', datafield: 'c2', width: 30, editable: false, cellsalign: "center" },
      { text: 'C3', columngroup: 'ProductDetails', datafield: 'c3', width: 30, editable: false, cellsalign: "center" },
      { text: 'C4', columngroup: 'ProductDetails', datafield: 'c4', width: 30, editable: false, cellsalign: "center" },
      { text: 'Criterio', columngroup: 'ProductDetails', datafield: 'criterio', width: 50, editable: false, cellsalign: "center" },
      { text: 'Tejido', columngroup: 'ProductDetails', datafield: 'desctejido', width: 250, editable: false },
      { text: 'MTej', columngroup: 'ProductDetails', datafield: 'margen1', width: 50, editable: false, cellsalign: "center" },
      { text: 'MCli', columngroup: 'ProductDetails', datafield: 'margen2', width: 50, editable: false, cellsalign: "center" },
      { text: 'MMeca', columngroup: 'ProductDetails', datafield: 'margen3', width: 50, editable: false, cellsalign: "center" },
      { text: 'MAcc', columngroup: 'ProductDetails', datafield: 'margen4', width: 50, editable: false, cellsalign: "center" },
      { text: 'Cliente', columngroup: 'Exportacion', datafield: 'razon_social', width: 125, editable: false, cellsalign: "center" },
      { text: 'Sistema', columngroup: 'Exportacion', datafield: 'fn_sistema', width: 110, editable: false, cellsalign: "center" },
      { text: 'Modelo', columngroup: 'Exportacion', datafield: 'fn_modelo', width: 110, editable: false, cellsalign: "center" },
      { text: 'Accion', columngroup: 'Exportacion', datafield: 'fn_accionamiento', width: 110, editable: false, cellsalign: "center" },
      { text: 'Tejido', columngroup: 'Exportacion', datafield: 'sp_tejido', width: 110, editable: false, cellsalign: "center" },
      { text: 'Grupo', columngroup: 'Exportacion', datafield: 'fn_grupo', width: 110, editable: false, cellsalign: "center" },
      { text: 'Sync', columngroup: 'Exportacion', datafield: 'op_synchronize', width: 60, editable: false, cellsalign: "center", cellsrenderer: this.diasRenderer },
      { text: 'Status', columngroup: 'Exportacion', datafield: 'op_synchronized', width: 60, editable: false, cellsalign: "center", cellsrenderer: this.diasRenderer2 },
      { text: 'Date', columngroup: 'Exportacion', datafield: 'op_synchr_date', width: 130, editable: false, cellsalign: "center", cellsformat: "dd/MM/yyyy HH:mm:ss", }
    ],
    columngroups:
      [
        { text: 'Datos de la Tarifa', align: 'center', name: 'ProductDetails' },
        { text: 'Exportación', align: 'center', name: 'Exportacion' }
      ]
  };

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
    ]

  };

  constructor(private service: HaruService, private router: Router,
    private toaster: ToastrService, vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {
    this.GetMapsOptions();
    this.loadMaster();
  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settingsS);
    this.myS2Grid.createComponent(this.settings3);
    this.searchDocuments();
  }

  /*
  */
  loadMaster() {
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

    this.service.HTTP_Get('/sm/import_tables/GRUPOS').subscribe(
      data => {
        this.sp_grupos = data.Table;
        this.sp_grupos.push({ "tag": "-1", "descripcion": "" });
      },
      error => {
        this.toaster.error(error.message);
      }
    );

    this.service.HTTP_Get('/sm/import_tables/TIPO_TARIFA').subscribe(
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
    this.source2.url = this.service.HTTP_Url_Get("/sm/tarifa_simulate_cli_search");
    this.mySGrid.updatebounddata("cells");
  }

  onDateChange(e, e1) {

  }

  New() {
    this.router.navigate(['/routes/herstellen/tarifasimul-cli'], { queryParams: { id: -1 } });
  }

  rowSelect(event: any): void {



  }

  rowdoubleclick(event: any): void {


    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length == 1) {
      var id = arrayData[0];
      this.router.navigate(['/routes/herstellen/tarifasimul-cli'], { queryParams: { id: id } });
    }

    if (arrayData.length > 1) {
      alert("Solo se puede cargar una simulación");
    }

    /*
    let args = event.args;
    var id = args.row.bounddata.idrow;

    */
  }



  Export() {
    var pathExportScript = this.service.Export();
    this.myS2Grid.exportdata("xls", "tarifas", true, undefined, false, pathExportScript);
  }

  GetMapsOptions() {
    this.service.HTTP_Get('/sm/tarifa_simulate_export_types').subscribe(
      data => {
        this.exportOptions = data.Table;
      }
    );
  }



  ExportarMapas() {

    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length > 0) {
      const url = '/tarifas_simulate_cliente_export_v2';

      var model = {
        tipoexport: this.tipoExport,
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

  ParametrosExportacion() {
    this.modalUpdate.show();
  }


  AssignTarifa() {

    let arrayData1 = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData1.length == 1) {
      this.parametros.idrow = arrayData1.join("");
      let values = JSON.stringify(this.parametros);
      var route = "/tarifas_parametros_export_cliente";
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

  ExportTarifas(operation) {

    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");

    if (arrayData.length > 0) {
      const url = '/tarifa_cliente_simulate_table_sync_operate';

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








}


