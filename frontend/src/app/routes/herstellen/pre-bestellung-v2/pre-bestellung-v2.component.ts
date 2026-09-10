import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
  ViewContainerRef,
  ChangeDetectorRef,
} from "@angular/core";
import { jqxGridComponent } from "../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid";
import { HaruService } from "../../../services/haru.service";
import { GenType2 } from "../../../models/GenType2";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from "ngx-bootstrap/modal";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-pre-bestellung-v2",
  templateUrl: "./pre-bestellung-v2.component.html",
  styleUrls: ["./pre-bestellung-v2.component.css"],
  providers: [HaruService],
})
export class PreBestellungV2Component implements OnInit {
  @ViewChild("gridReference", { static: false }) myGrid!: jqxGridComponent;
  @ViewChild("gridReference2", { static: false }) myGrid2!: jqxGridComponent;
  @ViewChild("gridReference4", { static: false }) myGrid4!: jqxGridComponent;
  @ViewChild("gridReference5", { static: false }) myGrid5!: jqxGridComponent;
  @ViewChild("gridReference6", { static: false }) myGrid6!: jqxGridComponent;
  //@ViewChild("gridReference6") myGrid6: jqxGridComponent;
  @ViewChild("gridDetail", { static: false }) gridDetail!: jqxGridComponent;

  @ViewChild("staticModal11", { static: false }) public modalClientes!: ModalDirective;
  @ViewChild("staticModal12", { static: false }) public modalRefClientes!: ModalDirective;

  public staticModal;

  OcultarHojaFabricacion = false;
  firmaID = "";
  Top = 1;
  timerValue: number = 0;
  timerMaxValue: number = 1440;
  timeoutId: any = null;
  public Tab = 2;
  responsables: Array<GenType2> = [];
  responsables2: Array<GenType2> = [];
  zustanden: Array<GenType2> = [];
  public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl(
    "about:blank"
  );
  public SelectedDate: Date = new Date();
  public SelectedDate2: Date = new Date();
  public responsable = "-1";
  public responsable2 = "-1";
  public EstadoOrden = "0";
  public Target_EstadoOrden = "0";
  public FacturaEnlace = "";
  SelectedCliente = 1;
  SelectedClienteP = 1;

  cdpedidomodel = {
    header: {},
    lines: [],
  };

  document = {
    header: [],
    lines: [],
    lines1: [],
    lines2: [],
    lines3: [],
    lines4: [],
  };

  descTiendas: Array<any> = [];
  Target_NuevoCliente = "-1";
  Target_NuevaReferencia = " ";

  constructor(
    private service: HaruService,
    private domSanitizer: DomSanitizer,
    private toaster: ToastrService,
    vRef: ViewContainerRef,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // this.toaster.setRootViewContainerRef(vRef);
    this.firmaID = this.service.getfirmaID();
  }

  ngOnInit() {

    if (localStorage.ambito == '"E"') {
      this.router.navigate([JSON.parse(localStorage.user)])
    }

    this.Zustanden_Laden();
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.myGrid2.createComponent(this.settings2);
    this.myGrid4.createComponent(this.settings4);
    this.myGrid5.createComponent(this.settings5);

    this.myGrid6.createComponent(this.settings6);
    this.gridDetail.createComponent(this.settingsDet);
    this.Init();
    this.startTimer();
    this.cdr.detectChanges();
  }

  startTimer() {
    this.timerValue = 1;
    this.timerMaxValue = 1440;
    this.timeoutId = setInterval(() => {
      this.timerValue++;
      if (this.timerValue > this.timerMaxValue) {
        this.timerValue = 1;
        this.getScope();
      }
    }, 1000);
  }

  stopTimer() {
    this.timerValue = 1;
    clearInterval(this.timeoutId);
  }

  SelectNone(value) {
    if (value == 2) this.myGrid2.clearselection();
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string) {
    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];
      if (field == "") arrayData.push(row);
      else arrayData.push(row[field]);
    }
    this.SelectedClienteP = this.SelectedCliente;
    if (this.SelectedCliente == 99) this.SelectedClienteP = row['cliente']
    return arrayData;
  }

  Planning_Multiply() {
    if (this.responsable2 == "-1") {
      alert("Seleccione la persona a asignar");
    } else {
      var arrayData: any[] = [];
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
      if (arrayData.length > 0) {
        var mac = this.responsable2;
        var ids = arrayData.join(",");
        this.service.Aprov_Up_1(mac, ids).subscribe(
          (data) => {
            if (data.id == "1") {
              this.getScope();
            }
          },
          (error) => {
            this.toaster.error(error.message);
          }
        );
      } else {
        this.toaster.error("No ha seleccionado ninguna linea");
      }
    }
  }

  Planning_Multiply2() {
    if (
      confirm(
        "Se va a proceder a finalizar las ordenes seleccionadas ¿Desea continuar?"
      )
    ) {
      var arrayData: any[] = [];
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
      if (arrayData.length > 0) {
        var mac = this.responsable2;
        var ids = arrayData.join(",");
        this.service.Aprov_Up_2(mac, ids).subscribe(
          (data) => {
            if (data.id == "1") {
              this.getScope();
            }
          },
          (error) => {

          }
        );
      } else {
        alert("No ha seleccionado ninguna linea");
      }
    }
  }

  Planificacion() {
    this.Tab = 2;
    this.myGrid.clearselection();
  }

  Impresion() {
    let arrayData: any[] = [];

    if (this.SelectedCliente == 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (this.SelectedCliente == 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (this.SelectedCliente == 99) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (arrayData.length > 0) {
      const ids = arrayData.join("|");
      this.Tab = 1;

      this.loadHeader(ids);
    } else {
      alert("No ha seleccionado ninguna linea");
    }
  }

  onDateChange(e, e1) {
    if (e.target.id == "_SelectedDate") {
      this.SelectedDate = new Date(e.target.value);
      //this.From = new Date(e.target.value);
      //this._Desde = new Date(e.target.value).toLocaleDateString("es-ES");
    }

    if (e.target.id == "_SelectedDate2") {
      this.SelectedDate2 = new Date(e.target.value);
      //this.To = new Date(e.target.value);
      //this._Hasta = new Date(e.target.value).toLocaleDateString("es-ES");
    }
  }

  Init() {
    this.EstadoOrden = "0";

    let month = new Date().getMonth();
    let ano = new Date().getFullYear();
    let Today = new Date(ano, month, 1);
    this.SelectedDate = new Date(Today.setMonth(Today.getMonth() - 2));
    this.SelectedDate2 = new Date();
  }

  exportData() {
    const cliente = this.SelectedCliente;
    if (cliente === 1) {
      const pathExportScript = this.service.Export();
      this.myGrid.exportdata(
        "xls",
        "export",
        true,
        undefined,
        false,
        pathExportScript
      );
    }

    if (cliente === 2) {
      const pathExportScript = this.service.Export();
      this.myGrid2.exportdata(
        "xls",
        "export",
        true,
        undefined,
        false,
        pathExportScript
      );
    }

    if (cliente === 4) {
      const pathExportScript = this.service.Export();
      this.myGrid4.exportdata(
        "xls",
        "export",
        true,
        undefined,
        false,
        pathExportScript
      );
    }

    if (cliente === 5) {
      const pathExportScript = this.service.Export();
      this.myGrid5.exportdata(
        "xls",
        "export",
        true,
        undefined,
        false,
        pathExportScript
      );
    }

    if (cliente === 99) {
      const pathExportScript = this.service.Export();
      this.myGrid6.exportdata(
        "xls",
        "export",
        true,
        undefined,
        false,
        pathExportScript
      );
    }


    /*
    if (cliente === 6) {
      const pathExportScript = this.service.Export();
      this.myGrid6.exportdata(
        "xls",
        "export",
        true,
        null,
        false,
        pathExportScript
      );
    }
    */
  }

  setTipo(cliente) {
    this.SelectedCliente = cliente;
    this.getScope();
  }

  getScope() {
    const estado = this.EstadoOrden;
    const desde = this.SelectedDate.toLocaleDateString("en-EN");
    const hasta = this.SelectedDate2.toLocaleDateString("en-EN");
    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      this.source.url = this.service.API_Bestellungen_URL3(
        estado,
        cliente,
        desde,
        hasta
      );

      this.myGrid.updatebounddata("cells");
      if (this.myGrid.getselectedrowindexes().length > 0) {
        this.myGrid.clearselection();
      }
    }

    if (cliente === 2) {
      this.source2.url = this.service.API_Bestellungen_URL3(
        estado,
        cliente,
        desde,
        hasta
      );

      this.myGrid2.updatebounddata("cells");
      if (this.myGrid2.getselectedrowindexes().length > 0) {
        this.myGrid2.clearselection();
      }
    }

    if (cliente === 4) {
      this.source4.url = this.service.API_Bestellungen_URL3(
        estado,
        cliente,
        desde,
        hasta
      );
      this.myGrid4.updatebounddata("cells");
      if (this.myGrid4.getselectedrowindexes().length > 0) {
        this.myGrid4.clearselection();
      }
    }

    if (cliente === 5) {
      this.source5.url = this.service.API_Bestellungen_URL3(
        estado,
        cliente,
        desde,
        hasta
      );
      this.myGrid5.updatebounddata("cells");
      if (this.myGrid5.getselectedrowindexes().length > 0) {
        this.myGrid5.clearselection();
      }
    }

    if (cliente === 99) {
      this.source6.url = this.service.API_Bestellungen_URL3(
        estado,
        cliente,
        desde,
        hasta
      );
      this.myGrid6.updatebounddata("cells");
      if (this.myGrid6.getselectedrowindexes().length > 0) {
        this.myGrid6.clearselection();
      }
    }

  }

  Zustanden_Laden() {
    var url = "/api/bestellung_zustanden";
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.zustanden = data.Table;
          this.zustanden.push({ p1: -1, p2: "Todos los estados" });
          this.getScope();
        }
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  ExportToERP() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    var len = arrayData.length;

    if (len == 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len == 1) {
      var ids = arrayData.join("|");
      var url = "/cd_bestellung_signal/" + ids;
      this.service.HTTP_Get('/sm' + url).subscribe(
        (data) => {
          this.getScope();
        },
        (error) => { this.toaster.error(error.message); }
      );
    }
  }

  SetDocumentEXP() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "idrow");
    var len = arrayData.length;

    if (len == 1) {
      var ids = arrayData.join("|");
      var url = "/bestellung_traspaso/" + ids;
      this.service.HTTP_Get('/sm' + url).subscribe(
        (data) => {
          this.getScope();
        },
        (error) => { this.toaster.error(error.message); }
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
        (data) => {
          console.log(data);
        },
        (error) => { this.toaster.error(error.message); }
      );
    } else {
      alert("No ha seleccionado ninguna linea");
    }
  }

  VerImagen() {
    let arrayData: any[] = [];

    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "filename");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "");
    }
*/
    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {



      if (cliente != 2) {

        var id = arrayData[0].idrow;
        var ref = arrayData[0].referencia;
        var url =
          "https://www.manzasm.com/lm/api/bestellung_file/uploads/b2b/" +
          id +
          "/" +
          ref;

        console.log(url);

        this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(
          url
        );
      } else {
        const url = this.service.Master_NH_Upload_File_URL(arrayData[0]);

        this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(
          url
        );
      }
    }
  }

  loadHeader(idrow: string) {
    const url = "/api/bestellungen2/" + idrow;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.document.header = data.Table;

          if (this.firmaID === "004") {
            this.loadlinesTipo(idrow, 1);
            this.loadlinesTipo(idrow, 2);
            this.loadlinesTipo(idrow, 3);
            this.loadlinesTipo(idrow, 4);
          } else {
            this.loadlines(idrow);
          }
        }
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  loadlines(idrow: string) {
    const url = "/api/bestellungen2_lin/" + idrow;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          this.document.lines = data.Table;
        }
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  loadlinesTipo(idrow: string, tipo: number) {
    const url = "/api/bestellungen2_lin_tip/" + idrow + "/" + tipo;
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      (data) => {
        if (data.Table.length > 0) {
          if (tipo === 1) {
            this.document.lines1 = data.Table;
          }
          if (tipo === 2) {
            this.document.lines2 = data.Table;
          }
          if (tipo === 3) {
            this.document.lines3 = data.Table;
          }
          if (tipo === 4) {
            this.document.lines4 = data.Table;
          }
        }
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "idrow", type: "int" },
      { name: "estado", type: "string" },
      { name: "descestado", type: "string" },
      { name: "dias", type: "int" },
      { name: "fecha", type: "date" },
      { name: "codigo", type: "string" },
      { name: "nomfiscal", type: "string" },
      { name: "dirfiscal", type: "string" },
      { name: "pobfiscal", type: "string" },
      { name: "provfiscal", type: "string" },
      { name: "cpfiscal", type: "string" },
      { name: "nombre", type: "string" },
      { name: "domicilio", type: "string" },
      { name: "cp", type: "string" },
      { name: "poblacion", type: "string" },
      { name: "provincia", type: "string" },
      { name: "referencia", type: "string" },
      { name: "factura_codigo", type: "string" },
      { name: "detalles", type: "string" },
      { name: "prod_ok", type: "string" },
      { name: "prod_reason", type: "string" },
      { name: "refcliente", type: "string" },
      { name: "fabricacion", type: "int" },
      { name: "ID", type: "int" },
    ],
    url: "",
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "idrow", type: "int" },
      { name: "estado", type: "string" },
      { name: "descestado", type: "string" },
      { name: "dias", type: "int" },
      { name: "date", type: "date" },
      { name: "filename", type: "string" },
      { name: "id", type: "string" },
      { name: "name", type: "string" },
      { name: "lastname", type: "string" },
      { name: "business", type: "string" },
      { name: "address", type: "string" },
      { name: "postcode", type: "string" },
      { name: "province", type: "string" },
      { name: "city", type: "string" },
      { name: "country", type: "string" },
      { name: "phone", type: "string" },
      { name: "factura_codigo", type: "string" },
      { name: "detalles", type: "string" },
      { name: "prod", type: "string" },
      { name: "prod_reason", type: "string" },
      { name: "refcliente", type: "string" },
      { name: "referencia", type: "string" },
      { name: "fabricacion", type: "int" },
      { name: "IMD", type: "int" },
    ],
    url: "",
  };

  source4 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "idrow", type: "int" },
      { name: "estado", type: "string" },
      { name: "descestado", type: "string" },
      { name: "dias", type: "int" },
      { name: "fecha", type: "date" },
      { name: "codigo", type: "string" },
      { name: "nomfiscal", type: "string" },
      { name: "dirfiscal", type: "string" },
      { name: "pobfiscal", type: "string" },
      { name: "provfiscal", type: "string" },
      { name: "cpfiscal", type: "string" },
      { name: "nombre", type: "string" },
      { name: "domicilio", type: "string" },
      { name: "cp", type: "string" },
      { name: "poblacion", type: "string" },
      { name: "provincia", type: "string" },
      { name: "referencia", type: "string" },
      { name: "factura_codigo", type: "string" },
      { name: "detalles", type: "string" },
      { name: "prod_ok", type: "string" },
      { name: "prod_reason", type: "string" },
      { name: "refcliente", type: "string" },
      { name: "fabricacion", type: "int" },
      { name: "ID", type: "int" },
    ],
    url: "",
  };

  source5 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "idrow", type: "int" },
      { name: "estado", type: "string" },
      { name: "descestado", type: "string" },
      { name: "dias", type: "int" },
      { name: "fecha", type: "date" },
      { name: "codigo", type: "string" },
      { name: "nomfiscal", type: "string" },
      { name: "dirfiscal", type: "string" },
      { name: "pobfiscal", type: "string" },
      { name: "provfiscal", type: "string" },
      { name: "cpfiscal", type: "string" },
      { name: "nombre", type: "string" },
      { name: "domicilio", type: "string" },
      { name: "cp", type: "string" },
      { name: "poblacion", type: "string" },
      { name: "provincia", type: "string" },
      { name: "referencia", type: "string" },
      { name: "factura_codigo", type: "string" },
      { name: "detalles", type: "string" },
      { name: "prod_ok", type: "string" },
      { name: "prod_reason", type: "string" },
      { name: "refcliente", type: "string" },
      { name: "fabricacion", type: "int" },
      { name: "ID", type: "int" },
    ],
    url: "",
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

  source6 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "idrow", type: "int" },
      { name: "estado", type: "string" },
      { name: "descestado", type: "string" },
      { name: "dias", type: "int" },
      { name: "fecha", type: "date" },
      { name: "codigo", type: "string" },
      { name: "nomfiscal", type: "string" },
      { name: "dirfiscal", type: "string" },
      { name: "pobfiscal", type: "string" },
      { name: "provfiscal", type: "string" },
      { name: "cpfiscal", type: "string" },
      { name: "nombre", type: "string" },
      { name: "domicilio", type: "string" },
      { name: "cp", type: "string" },
      { name: "poblacion", type: "string" },
      { name: "provincia", type: "string" },
      { name: "referencia", type: "string" },
      { name: "factura_codigo", type: "string" },
      { name: "detalles", type: "string" },
      { name: "prod_ok", type: "string" },
      { name: "prod_reason", type: "string" },
      { name: "refcliente", type: "string" },
      { name: "fabricacion", type: "int" },
      { name: "cliente", type: "int" },
      { name: "ID", type: "int" },
    ],
    url: "",
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapter4 = new $.jqx.dataAdapter(this.source4, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapter5 = new $.jqx.dataAdapter(this.source5, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapter6 = new $.jqx.dataAdapter(this.source6, {
    contentType: "application/json; charset=utf-8",
  });
  dataAdapterDet = new $.jqx.dataAdapter(this.sourceDet, {
    contentType: "application/json; charset=utf-8",
  });

  diasRenderer = (
    row,
    columnfield,
    value,
    defaulthtml,
    columnproperties,
    rowdata
  ) => {
    if (value < 3) {
      return (
        '<span style="width:50;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '; color:black;background-color: yellowgreen;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }

    if (value > 2 && value < 5) {
      return (
        '<span style="width:50;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '; color:black;background-color: yellow;cursor:hand">&nbsp;&nbsp;' +
        value +
        "&nbsp;&nbsp;</span>"
      );
    }

    return (
      '<span style="width:50;margin: 4px; float: ' +
      columnproperties.cellsalign +
      '; color:white;background-color: red;cursor:hand">&nbsp;&nbsp;' +
      value +
      "&nbsp;&nbsp;</span>"
    );
  };

  dateRenderer = (
    row,
    columnfield,
    value,
    defaulthtml,
    columnproperties,
    rowdata
  ) => {
    if (value === "1900-01-01T00:00:00") {
      return (
        '<span style="width:50;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '"></span>'
      );
    } else {
      const nvalue = new Date(value).toLocaleDateString("es-ES");

      return (
        '<span style="width:50;margin: 4px; float: ' +
        columnproperties.cellsalign +
        '; color:black;background-color: yellow;cursor:hand">&nbsp;' +
        nvalue +
        "&nbsp;</span>"
      );
    }
  };

  diasclassname = (row, columfield, value) => {
    return "greenRow";
  };

  settings: any = {
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
    source: this.dataAdapter,
    columns: [
      {
        text: "idrow",
        datafield: "idrow",
        width: 45,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Dias",
        datafield: "dias",
        width: 45,
        filtertype: "input",
        editable: false,
        cellsrenderer: this.diasRenderer,
        columngroup: "Pedido",
      },
      {
        text: "Estado",
        datafield: "descestado",
        width: 125,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "FAB",
        datafield: "fabricacion",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },
      {
        text: "Fra.",
        datafield: "factura_codigo",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Detalles",
        datafield: "detalles",
        width: 75,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod",
        datafield: "prod_ok",
        width: 40,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod_Razon",
        datafield: "prod_reason",
        width: 150,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Ref Cliente",
        datafield: "refcliente",
        width: 200,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },

      {
        text: "Referencia",
        datafield: "referencia",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "fecha",
        datafield: "fecha",
        width: 145,
        filtertype: "input",
        editable: false,
        cellsformat: "dd/MM/yyyy HH:mm:ss",
        columngroup: "Pedido",
      },
      {
        text: "ID",
        datafield: "ID",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },

      {
        text: "Nombre",
        datafield: "nombre",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Dirección",
        datafield: "domicilio",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "CP",
        datafield: "cp",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Población",
        datafield: "poblacion",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Provincia",
        datafield: "provincia",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },

      {
        text: "Nombre",
        datafield: "nomfiscal",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Dirección",
        datafield: "dirfiscal",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "CP",
        datafield: "cpfiscal",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Población",
        datafield: "pobfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Provincia",
        datafield: "provfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
    ],

    columngroups: [
      { text: "Pedido", align: "center", name: "Pedido" },
      { text: "Dirección Fiscal", align: "center", name: "Fiscal" },
      { text: "Dirección Entrega", align: "center", name: "Entrega" },
    ],
  };

  settings2: any = {
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
    source: this.dataAdapter2,
    columns: [
      {
        text: "idrow",
        datafield: "idrow",
        width: 45,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Dias",
        datafield: "dias",
        width: 45,
        filtertype: "input",
        editable: false,
        cellsrenderer: this.diasRenderer,
      },
      {
        text: "Estado",
        datafield: "descestado",
        width: 150,
        filtertype: "input",
        editable: false,
      },
      {
        text: "FAB",
        datafield: "fabricacion",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },
      {
        text: "Fra.",
        datafield: "factura_codigo",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Detalles",
        datafield: "detalles",
        width: 60,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Contenido",
        datafield: "referencia",
        width: 300,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod",
        datafield: "prod_ok",
        width: 40,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod_Razon",
        datafield: "prod_reason",
        width: 150,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Ref Cliente",
        datafield: "refcliente",
        width: 175,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "ID",
        datafield: "IMD",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },

      {
        text: "Codigo",
        datafield: "id",
        width: 125,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Referencia",
        datafield: "filename",
        width: 250,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Fecha",
        datafield: "date",
        width: 90,
        filtertype: "input",
        editable: false,
        cellsformat: "dd/MM/yyyy",
      },
      {
        text: "Nombre",
        datafield: "name",
        width: 150,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Apellidos",
        datafield: "lastname",
        width: 150,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Dirección",
        datafield: "address",
        width: 200,
        filtertype: "input",
        editable: false,
      },
      {
        text: "CP",
        datafield: "postcode",
        width: 50,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Población",
        datafield: "city",
        width: 100,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Provincia",
        datafield: "province",
        width: 100,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Pais",
        datafield: "country",
        width: 50,
        filtertype: "input",
        editable: false,
      },
      {
        text: "Teléfono",
        datafield: "phone",
        width: 100,
        filtertype: "input",
        editable: false,
      },
    ],
  };

  settings4: any = {
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
    source: this.dataAdapter4,
    columns: [
      {
        text: "idrow",
        datafield: "idrow",
        width: 45,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Dias",
        datafield: "dias",
        width: 45,
        filtertype: "input",
        editable: false,
        cellsrenderer: this.diasRenderer,
        columngroup: "Pedido",
      },
      {
        text: "Estado",
        datafield: "descestado",
        width: 125,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "FAB",
        datafield: "fabricacion",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },
      {
        text: "Fra.",
        datafield: "factura_codigo",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Detalles",
        datafield: "detalles",
        width: 75,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod",
        datafield: "prod_ok",
        width: 40,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod_Razon",
        datafield: "prod_reason",
        width: 150,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Ref Cliente",
        datafield: "refcliente",
        width: 200,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },

      {
        text: "Referencia",
        datafield: "referencia",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "fecha",
        datafield: "fecha",
        width: 145,
        filtertype: "input",
        editable: false,
        cellsformat: "dd/MM/yyyy HH:mm:ss",
        columngroup: "Pedido",
      },
      {
        text: "ID",
        datafield: "ID",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';

          return ''
        }
      },

      {
        text: "Nombre",
        datafield: "nombre",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Dirección",
        datafield: "domicilio",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "CP",
        datafield: "cp",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Población",
        datafield: "poblacion",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Provincia",
        datafield: "provincia",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },

      {
        text: "Nombre",
        datafield: "nomfiscal",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Dirección",
        datafield: "dirfiscal",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "CP",
        datafield: "cpfiscal",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Población",
        datafield: "pobfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Provincia",
        datafield: "provfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
    ],

    columngroups: [
      { text: "Pedido", align: "center", name: "Pedido" },
      { text: "Dirección Fiscal", align: "center", name: "Fiscal" },
      { text: "Dirección Entrega", align: "center", name: "Entrega" },
    ],
  };

  settings5: any = {
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
    source: this.dataAdapter5,
    columns: [
      {
        text: "idrow",
        datafield: "idrow",
        width: 45,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Dias",
        datafield: "dias",
        width: 45,
        filtertype: "input",
        editable: false,
        cellsrenderer: this.diasRenderer,
        columngroup: "Pedido",
      },
      {
        text: "Estado",
        datafield: "descestado",
        width: 125,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "FAB",
        datafield: "fabricacion",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return ''
        }
      },
      {
        text: "Fra.",
        datafield: "factura_codigo",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },

      {
        text: "Referencia",
        datafield: "referencia",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "fecha",
        datafield: "fecha",
        width: 145,
        filtertype: "input",
        editable: false,
        cellsformat: "dd/MM/yyyy HH:mm:ss",
        columngroup: "Pedido",
      },
      {
        text: "ID",
        datafield: "ID",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return '';
        }
      },

      {
        text: "Nombre",
        datafield: "nombre",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Dirección",
        datafield: "domicilio",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "CP",
        datafield: "cp",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Población",
        datafield: "poblacion",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Provincia",
        datafield: "provincia",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },

      {
        text: "Nombre",
        datafield: "nomfiscal",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Dirección",
        datafield: "dirfiscal",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "CP",
        datafield: "cpfiscal",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Población",
        datafield: "pobfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Provincia",
        datafield: "provfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
    ],

    columngroups: [
      { text: "Pedido", align: "center", name: "Pedido" },
      { text: "Dirección Fiscal", align: "center", name: "Fiscal" },
      { text: "Dirección Entrega", align: "center", name: "Entrega" },
    ],
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
        width: 45,
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

  settings6: any = {
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
    source: this.dataAdapter6,
    columns: [
      {
        text: "idrow",
        datafield: "idrow",
        width: 45,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Dias",
        datafield: "dias",
        width: 45,
        filtertype: "input",
        editable: false,
        cellsrenderer: this.diasRenderer,
        columngroup: "Pedido",
      },
      {
        text: "Estado",
        datafield: "descestado",
        width: 125,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "FAB",
        datafield: "fabricacion",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Fra.",
        datafield: "factura_codigo",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Detalles",
        datafield: "detalles",
        width: 75,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod",
        datafield: "prod_ok",
        width: 40,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Prod_Razon",
        datafield: "prod_reason",
        width: 150,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "Ref Cliente",
        datafield: "refcliente",
        width: 200,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
      },

      {
        text: "Referencia",
        datafield: "referencia",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "fecha",
        datafield: "fecha",
        width: 145,
        filtertype: "input",
        editable: false,
        cellsformat: "dd/MM/yyyy HH:mm:ss",
        columngroup: "Pedido",
      },
      {
        text: "Cliente",
        datafield: "cliente",
        width: 60,
        filtertype: "input",
        editable: false,
        columngroup: "Pedido",
      },
      {
        text: "ID",
        datafield: "ID",
        width: 50,
        filtertype: "textbox",
        editable: false,
        columngroup: "Pedido",
        cellsalign: "center",
        cellclassname: function (row, columnfield, value) {
          if (value == 0)
            return 'jqx-input-glacier-red-white';
          if (value > 0)
            return 'jqx-input-glacier-green';
          return ''
        }
      },

      {
        text: "Nombre",
        datafield: "nombre",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Dirección",
        datafield: "domicilio",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "CP",
        datafield: "cp",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Población",
        datafield: "poblacion",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },
      {
        text: "Provincia",
        datafield: "provincia",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Entrega",
      },

      {
        text: "Nombre",
        datafield: "nomfiscal",
        width: 150,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Dirección",
        datafield: "dirfiscal",
        width: 200,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "CP",
        datafield: "cpfiscal",
        width: 50,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Población",
        datafield: "pobfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
      {
        text: "Provincia",
        datafield: "provfiscal",
        width: 100,
        filtertype: "input",
        editable: false,
        columngroup: "Fiscal",
      },
    ],

    columngroups: [
      { text: "Pedido", align: "center", name: "Pedido" },
      { text: "Dirección Fiscal", align: "center", name: "Fiscal" },
      { text: "Dirección Entrega", align: "center", name: "Entrega" },
    ],
  };

  Impresion2() {
    let arrayData: any[] = [];

    if (this.SelectedCliente == 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (this.SelectedCliente == 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (this.SelectedCliente == 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (this.SelectedCliente == 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (this.SelectedCliente == 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (this.SelectedCliente == 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }
    */

    if (arrayData.length > 0) {
      this.Print(arrayData);
    } else {
      alert("No ha seleccionado ninguna linea");
    }
  }

  Print(item) {
    const url =
      "https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0&cust=" +
      this.SelectedClienteP +
      "&proc=PP_PREVIEW&ids=" +
      item;
    //const url = 'http://192.168.0.10/haru_server/services/bbss/preview.aspx?emp=0&cust='+this.SelectedCliente+'&proc=PP_PREVIEW&ids=' + item;
    this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  CambiarEstado() {
    let arrayData: any[] = [];

    if (this.SelectedCliente == 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (this.SelectedCliente == 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }
    if (this.SelectedCliente == 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (this.SelectedCliente == 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }
    /*
        if (this.SelectedCliente == 6) {
          arrayData = this.getSelectedRows(this.myGrid6, "idrow");
        }
    */
    if (arrayData.length > 0) {
      var jvalues = {
        cliente: this.SelectedClienteP,
        estado: this.Target_EstadoOrden,
        ids: arrayData,
      };
      var values = JSON.stringify(jvalues);
      this.service.HTTP_Post("/bestellungen_zustanden", values).subscribe(
        (data) => {
          this.getScope();
        },
        (error) => { this.toaster.error(error.message); }
      );
    }
  }

  Reprocesar() {
    let arrayData: any[] = [];

    if (this.SelectedCliente == 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "");
    }

    if (arrayData.length > 0) {
      var id = arrayData[0].idrow;
      var ref = arrayData[0].referencia;
      var url =
        "https://www.manzasm.com/lm/linkapi/bestellungen_reprocess/" +
        id +
        "/" +
        ref;


      this.service.ReprocessFile(url).subscribe(
        (data) => {
          this.myGrid5.clearselection();
          this.getScope();
          this.toaster.success("Fichero Reprocesado", "Proceso");
        },
        (error) => { this.toaster.error(error.message); }
      );
    } else {
      alert("No ha seleccionado ninguna linea");
    }
  }

  VerDetalle() {
    let arrayData: any[] = [];

    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "factura_codigo");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "factura_codigo");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "factura_codigo");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "factura_codigo");
    }
    */

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      const url = "/api/cd_bestellung_detail/" + arrayData;
      this.service.API_Bestellungen_URL_Header(url).subscribe(
        (data) => {
          if (data.Table.length > 0) {
            this.cdpedidomodel = data.Table;
          }
        },
        (error) => { this.toaster.error(error.message); }
      );
    }
  }

  HojaFabricacion() {
    const cliente = this.SelectedCliente;
    let arrayData: any[] = [];

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      let url = "/sm/export_csv/" + arrayData + "/" + cliente;
      url = this.service.HTTP_Url_Get(url);
      window.open(url);
    }
  }

  Setzustand(idrow, value, cliente) {
    var tag = {
      idrow: idrow,
      estado: value,
      cliente: cliente,
    };

    var values = JSON.stringify(tag);
    this.service.HTTP_Post("/bestellung_zustand", values).subscribe(
      (data) => {
        this.getScope();
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  IniciarFabricacion() {
    const cliente = this.SelectedCliente;
    let arrayData: any[] = [];

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }
    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }
    if (len === 1) {
      if (confirm("¿Desea Iniciar la Fabricación de la orden seleccionada?")) {
        this.Setzustand(arrayData, 500, cliente);
      }
    }
  }

  DetenerFabricacion() {
    const cliente = this.SelectedCliente;
    let arrayData: any[] = [];

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }
    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }
    if (len === 1) {
      if (confirm("¿Desea Detener la Fabricación de la orden seleccionada?")) {
        this.Setzustand(arrayData, 0, cliente);
      }
    }
  }

  exportHojaFabricacion() {
    const pathExportScript = this.service.Export();

    this.gridDetail.exportdata(
      "xls",
      "export",
      true,
      undefined,
      false,
      pathExportScript
    );
  }

  VerHojaFabricacion(force) {
    const cliente = this.SelectedCliente;
    let arrayData: any[] = [];

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      let url = "/sm/detail/" + arrayData + "/" + cliente + "/" + force;
      this.service.HTTP_Get(url).subscribe(
        (data) => {
          if (data.Table.length > 0) {
            this.sourceDet.localdata = data.Table;
            this.dataAdapterDet.dataBind();
            this.gridDetail.updatebounddata();

          }
        },
        (error) => { this.toaster.error(error.message); }
      );
    }
  }

  LoadTiendas() {
    var url = "/sm/tiendas_cliente/" + this.SelectedClienteP;
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        this.descTiendas = data;
      },
      (error) => {
        this.toaster.error(error.message);
      }
    );
  }

  ActualizarCliente() {
    let arrayData: any[] = [];
    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      if (confirm("¿Desea Actualizar el cliente del pedido seleccionado?")) {
        var post = {
          id: arrayData.join(),
          entrega: this.Target_NuevoCliente,
        };

        var values = JSON.stringify(post);
        this.service.HTTP_Post("/pedido_tienda", values).subscribe(
          (data) => {
            this.getScope();
            this.modalClientes.hide();
          },
          (error) => { this.toaster.error(error.message); }
        );
      }
    }
  }

  ActualizarReferenciaCliente() {
    let arrayData: any[] = [];
    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      if (confirm("¿Desea Actualizar la referencia del pedido seleccionado?")) {
        var post = {
          id: arrayData.join(),
          referencia: this.Target_NuevaReferencia,
        };

        var values = JSON.stringify(post);
        this.service.HTTP_Post("/pedido_referencia", values).subscribe(
          (data) => {
            this.getScope();
            this.modalRefClientes.hide();
          },
          (error) => { this.toaster.error(error.message); }
        );
      }
    }
  }

  ModificarCliente() {
    this.LoadTiendas();
    this.modalClientes.show();
  }

  ModificarRefCliente() {
    this.Target_NuevaReferencia = "";
    this.modalRefClientes.show();
  }

  Herstellung() {
    const cliente = this.SelectedCliente;
    let arrayData: any[] = [];

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 5) {
      arrayData = this.getSelectedRows(this.myGrid5, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }

    /*
    if (cliente === 6) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }*/

    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }

    if (len > 1) {
      alert("Solamente se puede seleccionar una linea");
    }

    if (len === 1) {
      let url = "#/routes/herstellen/herstellung?id=" + arrayData + "&cli=" + cliente;
      window.open(url);
    }
  }

  BorrarPedido() {
    let arrayData: any[] = [];
    const cliente = this.SelectedCliente;

    if (cliente === 1) {
      arrayData = this.getSelectedRows(this.myGrid, "idrow");
    }

    if (cliente === 4) {
      arrayData = this.getSelectedRows(this.myGrid4, "idrow");
    }

    if (cliente === 2) {
      arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    }

    if (cliente === 99) {
      arrayData = this.getSelectedRows(this.myGrid6, "idrow");
    }


    const len = arrayData.length;
    if (len === 0) {
      alert("No ha seleccionado ninguna linea");
    }
    else {
      if (confirm("¿Desea Borrar el Pedido Seleccionado?")) {

        let ids = {
          ids: arrayData.join(","),
          cliente: cliente
        }

        let values = JSON.stringify(ids);
        this.service.HTTP_Post("/bestellung_delete", values).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success("Pedido Eliminado");
              this.getScope();
            }
          },
          error => {
            this.toaster.error(error.message);
          });


      }

    }
  }
}

