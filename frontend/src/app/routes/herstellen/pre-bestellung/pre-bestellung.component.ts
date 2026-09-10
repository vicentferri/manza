import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { GenType2 } from '../../../models/GenType2';
import { DomSanitizer } from "@angular/platform-browser";
import { DatePipe } from '@angular/common';

// Add this interface at the top of your file or in a suitable place

interface HeaderItem {
  // Add all properties you use in the template
  codigo?: string;
  fecha?: string;
  nomfiscal?: string;
  dirfiscal?: string;
  cpfiscal?: string;
  pobfiscal?: string;
  provfiscal?: string;
  emailcliente?: string;
  telcliente?: string;
  nombre?: string;
  domicilio?: string;
  cp?: string;
  poblacion?: string;
  provincia?: string;
  email_1?: string;
  telefono_1?: string;
  observaciones?: string;
}

interface DocumentLine {
  LISTA: number | string;
  ARTICULO: string;
  DESCRIPCION: string;
  CANTIDAD: number;
  PRECIO: number;
  TOTAL: number;
  // add other properties as needed
}

@Component({
  selector: 'pre-bestellung',
  templateUrl: './pre-bestellung.component.html',
  styleUrls: ['./pre-bestellung.component.css'],
  providers: [HaruService]
})
export class PreBestellungComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  public staticModal;

  firmaID = "";
  Top = 1;
  timerValue: number = -1;
  timerMaxValue: number = -1;
  timeoutId: any = null;
  public Tab = 2;
  responsables: Array<GenType2> = [];
  responsables2: Array<GenType2> = [];
  zustanden: Array<GenType2> = [];
  public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl("about:blank");
  public SelectedDate: Date = new Date();
  public SelectedDate2: Date = new Date();
  public responsable = "-1";
  public responsable2 = "-1";
  public EstadoOrden = "0";
  public FacturaEnlace = "";

  document = {
    header: [] as HeaderItem[],
    lines: [] as DocumentLine[],
    lines1: [],
    lines2: [],
    lines3: [],
    lines4: []
  }



  constructor(private service: HaruService, private domSanitizer: DomSanitizer) {
    this.firmaID = this.service.getfirmaID();
  }

  ngOnInit() {

    this.Zustanden_Laden();

  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.Init();
    this.startTimer();
  }

  startTimer() {
    this.timerValue = 1;
    this.timerMaxValue = 360;
    this.timeoutId = setInterval(
      () => {

        this.timerValue++;
        if (this.timerValue > this.timerMaxValue) {
          this.timerValue = 1;
          this.getScope();
        }

      }, 1000);
  };

  stopTimer() {
    this.timerValue = 1;
    clearInterval(this.timeoutId);
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string) {


    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];
      arrayData.push(row[field]);
    }
    return arrayData;
  }

  Planning_Multiply() {
    if (this.responsable2 == "-1") {
      alert("Seleccione la persona a asignar")
    }
    else {
      var arrayData: any[] = [];
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
      if (arrayData.length > 0) {
        var mac = this.responsable2;
        var ids = arrayData.join(",");
        this.service.Aprov_Up_1(mac, ids).subscribe(
          data => {
            if (data.id == "1") {
              this.getScope();
            }
          },
          error => {
            console.log(error);
          });

      } else {
        alert("No ha seleccionado ninguna linea")
      }

    }
  }

  Planning_Multiply2() {

    if (confirm("Se va a proceder a finalizar las ordenes seleccionadas ¿Desea continuar?")) {

      var arrayData: any[] = [];
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
      if (arrayData.length > 0) {

        var mac = this.responsable2;
        var ids = arrayData.join(",");
        this.service.Aprov_Up_2(mac, ids).subscribe(
          data => {
            if (data.id == "1") {
              this.getScope();
            }
          },
          error => {
            console.log(error);
          });

      } else {
        alert("No ha seleccionado ninguna linea")
      }
    }

  }

  Planificacion() {
    this.Tab = 2;
    this.myGrid.clearselection();
  }

  Impresion() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "idrow");
    if (arrayData.length > 0) {

      var ids = arrayData.join("|");
      this.Tab = 1;

      this.loadHeader(ids);


    } else {
      alert("No ha seleccionado ninguna linea")
    }
  }

  onDateChange(e, e1) {

  }

  Init() {
    this.EstadoOrden = "0";
    this.SelectedDate2 = new Date();
    this.SelectedDate = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
  }

  exportData() {
    var pathExportScript = this.service.Export();
    this.myGrid.exportdata("xls", "export", true, undefined, false, pathExportScript);
  }


  getScope() {

    var estado = this.EstadoOrden;
    var desde = this.SelectedDate.toLocaleDateString("es-ES");
    var hasta = this.SelectedDate2.toLocaleDateString("es-ES");

    this.source.url = this.service.API_Bestellungen_URL(estado);
    this.myGrid.updatebounddata("cells");
    this.myGrid.clearselection();
  }


  Zustanden_Laden() {
    var url = "/api/bestellung_zustanden";
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      data => {
        this.zustanden = data.Table;
        this.zustanden.push({ p1: -1, p2: 'Todos los estados' });
      },
      error => {

      }
    );
  }


  SetDocumentEXP() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "idrow");

    var len = arrayData.length

    if (len == 1) {
      var ids = arrayData.join("|");
      var url = "/bestellung_traspaso/" + ids;
      this.service.HTTP_Get('/sm' + url).subscribe(
        data => {
          this.getScope();
        },
        error => {
          console.log(error);
        }
      );
    }

    if (len == 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente puede seleccionarse una linea");
    }
  }

  EnlazarFactura() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "idrow");
    if (arrayData.length > 0) {
      var ids = arrayData.join("|");
      var url = "/bestellung_link/" + ids + "/" + this.FacturaEnlace;
      this.service.HTTP_Get('/sm' + url).subscribe(
        data => {
          console.log(data);
        },
        error => {
          console.log(error);
        }
      );
    } else {
      alert("No ha seleccionado ninguna linea")
    }
  }

  VerImagen() {

    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "factura_codigo");
    var len = arrayData.length;
    if (len == 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len = 1) {
      var url = this.service.Master_NH_Upload_Invoice_URL(arrayData[0]);
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }


  loadHeader(idrow: string) {

    var url = "/api/bestellungen2/" + idrow;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      data => {
        this.document.header = data.Table;

        if (this.firmaID == "004") {
          this.loadlinesTipo(idrow, 1);
          this.loadlinesTipo(idrow, 2);
          this.loadlinesTipo(idrow, 3);
          this.loadlinesTipo(idrow, 4);
        }
        else {
          this.loadlines(idrow);
        }

      },
      error => {

      }
    );
  }


  loadlines(idrow: string) {
    var url = "/api/bestellungen2_lin/" + idrow;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      data => {
        this.document.lines = data.Table;
      },
      error => {

      }
    );
  }

  loadlinesTipo(idrow: string, tipo: number) {
    var url = "/api/bestellungen2_lin_tip/" + idrow + "/" + tipo;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      data => {
        if (tipo == 1) {
          this.document.lines1 = data.Table;
        }
        if (tipo == 2) {
          this.document.lines2 = data.Table;
        }
        if (tipo == 3) {
          this.document.lines3 = data.Table;
        }
        if (tipo == 4) {
          this.document.lines4 = data.Table;
        }

      },
      error => {

      }
    );
  }


  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'estado', type: 'string' },
      { name: 'descestado', type: 'string' },
      { name: 'dias', type: 'int' },
      { name: 'fecha', type: 'date' },
      { name: 'codigo', type: 'string' },
      { name: 'nomfiscal', type: 'string' },
      { name: 'dirfiscal', type: 'string' },
      { name: 'pobfiscal', type: 'string' },
      { name: 'provfiscal', type: 'string' },
      { name: 'cpfiscal', type: 'string' },
      { name: 'nombre', type: 'string' },
      { name: 'domicilio', type: 'string' },
      { name: 'cp', type: 'string' },
      { name: 'poblacion', type: 'string' },
      { name: 'provincia', type: 'string' },
      { name: 'referencia', type: 'string' },
      { name: 'factura_codigo', type: 'string' }
    ],
    url: ""
  };



  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  diasRenderer = (row, columnfield, value, defaulthtml, columnproperties, rowdata) => {
    if (value < 3) {
      return '<span style="width:50;margin: 4px; float: ' + columnproperties.cellsalign + '; color:black;background-color: yellowgreen;cursor:hand">&nbsp;&nbsp;' + value + '&nbsp;&nbsp;</span>';
    }

    if (value > 2 && value < 5) {
      return '<span style="width:50;margin: 4px; float: ' + columnproperties.cellsalign + '; color:black;background-color: yellow;cursor:hand">&nbsp;&nbsp;' + value + '&nbsp;&nbsp;</span>';
    }

    return '<span style="width:50;margin: 4px; float: ' + columnproperties.cellsalign + '; color:white;background-color: red;cursor:hand">&nbsp;&nbsp;' + value + '&nbsp;&nbsp;</span>';

  };

  dateRenderer = (row, columnfield, value, defaulthtml, columnproperties, rowdata) => {

    if (value == "1900-01-01T00:00:00") {
      return '<span style="width:50;margin: 4px; float: ' + columnproperties.cellsalign + '"></span>';
    } else {

      var nvalue = new Date(value).toLocaleDateString("es-ES");

      return '<span style="width:50;margin: 4px; float: ' + columnproperties.cellsalign + '; color:black;background-color: yellow;cursor:hand">&nbsp;' + nvalue + '&nbsp;</span>';
    }
  };

  diasclassname = (row, columfield, value) => {
    /*
   for (var i = 0; i < editedCells.length; i++) {
     if (editedCells[i].row == row && editedCells[i].column === datafield) {
       return "editedRow";
     }
   }
   */
    //console.log(value);
    return "greenRow";
  };


  settings: any = {
    width: '100%',
    height: 600,
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
    selectionmode: 'multiplerow', /* wir haben hier verschiedene Optionen,
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
      { text: 'idrow', datafield: 'idrow', width: 45, filtertype: 'textbox', editable: false, columngroup: 'Pedido' },
      { text: 'Dias', datafield: 'dias', width: 45, filtertype: 'input', editable: false, cellsrenderer: this.diasRenderer, columngroup: 'Pedido' },
      { text: 'Estado', datafield: 'descestado', width: 125, filtertype: 'input', editable: false, columngroup: 'Pedido' },
      { text: 'Fra.', datafield: 'factura_codigo', width: 100, filtertype: 'input', editable: false, columngroup: 'Pedido' },

      { text: 'Referencia', datafield: 'referencia', width: 200, filtertype: 'input', editable: false, columngroup: 'Pedido' },
      { text: 'fecha', datafield: 'fecha', width: 140, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy HH:mm:ss', columngroup: 'Pedido' },

      { text: 'Nombre', datafield: 'nombre', width: 150, filtertype: 'input', editable: false, columngroup: 'Entrega' },
      { text: 'Dirección', datafield: 'domicilio', width: 200, filtertype: 'input', editable: false, columngroup: 'Entrega' },
      { text: 'CP', datafield: 'cp', width: 50, filtertype: 'input', editable: false, columngroup: 'Entrega' },
      { text: 'Población', datafield: 'poblacion', width: 100, filtertype: 'input', editable: false, columngroup: 'Entrega' },
      { text: 'Provincia', datafield: 'provincia', width: 100, filtertype: 'input', editable: false, columngroup: 'Entrega' },


      { text: 'Nombre', datafield: 'nomfiscal', width: 150, filtertype: 'input', editable: false, columngroup: 'Fiscal' },
      { text: 'Dirección', datafield: 'dirfiscal', width: 200, filtertype: 'input', editable: false, columngroup: 'Fiscal' },
      { text: 'CP', datafield: 'cpfiscal', width: 50, filtertype: 'input', editable: false, columngroup: 'Fiscal' },
      { text: 'Población', datafield: 'pobfiscal', width: 100, filtertype: 'input', editable: false, columngroup: 'Fiscal' },
      { text: 'Provincia', datafield: 'provfiscal', width: 100, filtertype: 'input', editable: false, columngroup: 'Fiscal' },


    ],

    columngroups:
      [
        { text: 'Pedido', align: 'center', name: 'Pedido' },
        { text: 'Dirección Fiscal', align: 'center', name: 'Fiscal' },
        { text: 'Dirección Entrega', align: 'center', name: 'Entrega' }
      ]


  };


  Impresion2() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, 'idrow');
    if (arrayData.length > 0) {
      this.Print(arrayData);
    } else {
      alert('No ha seleccionado ninguna linea');
    }
  }

  Print(item) {
    const url = 'https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0&proc=PP_PREVIEW&ids=' + item;
    this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
