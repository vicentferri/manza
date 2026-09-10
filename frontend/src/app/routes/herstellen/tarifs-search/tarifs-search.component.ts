import { Component, OnInit, ViewChild, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { SearchType } from '../../../models/searchType'
import { Router } from '@angular/router';
import { Utils } from '../../../shared/Utils';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-tarifs-search',
  templateUrl: './tarifs-search.component.html',
  styleUrls: ['./tarifs-search.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [HaruService]
})
export class TarifsSearchComponent implements OnInit {

  @ViewChild('gridSReference', { static: false }) mySGrid: jqxGridComponent;
  @ViewChild('gridS2Reference', { static: false }) myS2Grid: jqxGridComponent;
  @ViewChild('staticModalUpdate', { static: false }) modalUpdate: ModalDirective;

  searchmodel = new SearchType();

  sp_sistemas: any = [];
  sp_modelos: any = [];
  sp_accionamientos: any = [];
  sp_tejidos: any = [];
  sp_grupos: any = [];
  sp_clientes: any = [];


  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'codigo', type: 'string' },
      { name: 'fecha', type: 'date' },
      { name: 'descripcion', type: 'string' },
      { name: 'clientes', type: 'number' },
      { name: 'coeficiente', type: 'string' },
      { name: 'promocion_coeficiente', type: 'number' },
      { name: 'promocion_activa', type: 'string' },
      { name: 'promocion_modificapvp', type: 'string' },
      { name: 'promocion_modificapvc', type: 'string' },
      { name: 'fn_sistema', type: 'string' },
      { name: 'fn_modelo', type: 'string' },
      { name: 'fn_accionamiento', type: 'string' },
      { name: 'fn_grupo', type: 'string' },
      { name: 'sp_tejido', type: 'string' },
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
      { name: 'c24', type: 'string' }

    ],
    localdata: null
  };

  columns_Enrollable = [
    { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
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
  ]

  columns_Compac = [
    { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
    { text: '0.40', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '0.60', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '0.80', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.00', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.20', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
  ]

  columns_Japones = [
    { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
    { text: '0.60', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '0.80', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.00', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.20', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.40', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.60', datafield: 'c10', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.80', datafield: 'c11', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.00', datafield: 'c12', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
  ]

  columns_Vertical = [
    { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
    { text: '1.00', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.10', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.20', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.30', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.40', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.50', datafield: 'c10', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.60', datafield: 'c11', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.70', datafield: 'c12', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.80', datafield: 'c13', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '1.90', datafield: 'c14', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.00', datafield: 'c15', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.10', datafield: 'c16', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.20', datafield: 'c17', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.30', datafield: 'c18', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.40', datafield: 'c19', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.50', datafield: 'c20', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.60', datafield: 'c21', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.70', datafield: 'c22', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.80', datafield: 'c23', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    { text: '2.90', datafield: 'c24', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' }

  ]


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
    height: '99%',
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
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
    showstatusbar: false,
    source: this.dataAdapter2,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 40, editable: false },
      { text: 'Número', columngroup: 'ProductDetails', datafield: 'codigo', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Fecha', columngroup: 'ProductDetails', datafield: 'fecha', width: 80, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy' },
      { text: 'Descripción', datafield: 'descripcion', width: 400, filtertype: 'input', editable: false },
      { text: 'Cliente', datafield: 'clientes', width: 50, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Coef.', datafield: 'coeficiente', width: 50, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Activa', datafield: 'promocion_activa', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'C.Prom', datafield: 'promocion_coeficiente', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Ap.PVP', datafield: 'promocion_modificapvp', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Ap.C1', datafield: 'promocion_modificapvc', width: 60, filtertype: 'input', editable: false, cellsalign: 'center' },
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
    ]

  };

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




  constructor(private service: HaruService, private router: Router,
    private toaster: ToastrService, vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);


  }

  ngOnInit() {


    this.loadMaster();
  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settingsS);
    this.myS2Grid.createComponent(this.settings3);
  }

  searchDocuments() {
    this.source2.url = this.service.HTTP_Url_Get("/sm/tarifas");
    this.mySGrid.updatebounddata("cells");
  }

  onDateChange(e, e1) {

  }

  New() {
    this.router.navigate(['/routes/herstellen/tarif'], { queryParams: { id: -1 } });
  }

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

  rowSelect(event: any): void {
    let args = event.args;
    var id = args.row.idrow;
  }

  rowdoubleclick(event: any): void {
    let args = event.args;
    var id = args.row.bounddata.idrow;
    //this.router.navigate(['/routes/herstellen/tarif'], { queryParams: { id: id } });
    let url = "#/routes/herstellen/tarif?id=" + id;
    window.open(url, "_blank");
  }

  Export() {
    var pathExportScript = this.service.Export();
    this.myS2Grid.exportdata("xls", "tarifas", true, null, false, pathExportScript);
  }

  ExportarMapas() {
    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData.length > 0) {

      const url = '/tarifa_export/' + arrayData.join(",");
      this.service.HTTP_Get(url).subscribe(
        data => {
          console.log(data);
          if (data.message === "OK") {
            if (data.Table.length > 0) {

              if (data.Tipo == 1) /* ENROLLABLE */ {
                this.myS2Grid.columns(this.columns_Enrollable);
              }

              if (data.Tipo == 3) /* COMPAC */ {
                console.log("COMPAC");
                this.myS2Grid.columns(this.columns_Compac);
              }

              if (data.Tipo == 4) /* JAPONES */ {
                console.log("JAPONES");
                this.myS2Grid.columns(this.columns_Japones);
              }

              if (data.Tipo == 5) /* VERTICAL */ {
                console.log("VERTICAL");
                this.myS2Grid.columns(this.columns_Vertical);
              }

              this.source3.localdata = data.Table;

              this.dataAdapter3.dataBind();
              this.myS2Grid.updatebounddata();

              this.Export();
              this.toaster.success("Exportados los mapas", "EXPORTAR TARIFA");
            }
          }
        },
        error => {
          //this.toaster.error("No se ha Clonado la Tarifa", "CLONAR TARIFA");
        }
      );

    }

  }



  ExportTarifas(operation) {

    var arrayData = Utils.getSelectedRows(this.mySGrid, "idrow");

    if (arrayData.length > 0) {
      const url = '/tarifa_simulate_table_sync_operate_lm';

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

  ParametrosExportacion() {
    this.modalUpdate.show();
  }

  AssignTarifa() {


    let arrayData1 = Utils.getSelectedRows(this.mySGrid, "idrow");
    if (arrayData1.length == 1) {
      this.parametros.idrow = arrayData1.join("");
      let values = JSON.stringify(this.parametros);
      var route = "/tarifas_parametros_export_lm";
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

}
