import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { HaruService } from "../../../services/haru.service";
import { ExcelService } from "../../../services/excel.service";
import { GenType2 } from "../../../models/GenType2";
import { DomSanitizer } from "@angular/platform-browser";
import { ToastrService } from "ngx-toastr";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import {
  PedidosGridComponent,
  PedidosGridColumn,
} from "../../../shared/pedidos-grid/pedidos-grid.component";

/**
 * herstellen_v2 — Recepción de Pedidos.
 * Reescritura de pre-bestellung-v2 sin jqxGrid (tablas HTML vía <app-pedidos-grid>).
 * Cambios funcionales:
 *  - Se elimina la pestaña "Otros" (cliente 99).
 *  - La pestaña "Cortinadecor" pasa a llamarse "Canal B2B" y añade un
 *    desplegable de clientes del canal, filtrando por la columna
 *    SQL_CORTINADECOR_HEADER.cliente_solarmanes.
 */
@Component({
  selector: "app-pre-bestellung-v3",
  templateUrl: "./pre-bestellung-v3.component.html",
  styleUrls: ["./pre-bestellung-v3.component.css"],
  providers: [HaruService, ExcelService],
})
export class PreBestellungV3Component implements OnInit, OnDestroy {
  @ViewChild("gridLM", { static: false }) gridLM!: PedidosGridComponent;
  @ViewChild("gridB2B", { static: false }) gridB2B!: PedidosGridComponent;
  @ViewChild("grid4", { static: false }) grid4!: PedidosGridComponent;
  @ViewChild("grid5", { static: false }) grid5!: PedidosGridComponent;

  @ViewChild("staticModal3", { static: false }) modalVisor!: ModalDirective;
  @ViewChild("staticModalI", { static: false }) modalInforme!: ModalDirective;
  @ViewChild("staticModal10", { static: false }) modalFabricacion!: ModalDirective;
  @ViewChild("staticModal11", { static: false }) modalClientes!: ModalDirective;
  @ViewChild("staticModal12", { static: false }) modalRefClientes!: ModalDirective;

  firmaID = "";
  timerValue = 0;
  timerMaxValue = 1440;
  private timeoutId: any = null;

  zustanden: Array<GenType2> = [];
  public SelectedDate: Date = new Date();
  public SelectedDate2: Date = new Date();
  public EstadoOrden = "0";
  public Target_EstadoOrden = "0";

  SelectedCliente = 1;
  SelectedClienteP = 1;
  loading = false;

  /** Fila seleccionada en la pestaña activa */
  selectedRow: any = null;

  rowsLM: any[] = [];
  rowsB2B: any[] = [];
  /** rowsB2B tras aplicar el filtro del cliente de canal (lo que ve la grid) */
  rowsB2BView: any[] = [];
  rows4: any[] = [];
  rows5: any[] = [];
  detailRows: any[] = [];

  /* ---- Canal B2B ---- */
  canalCliente = "cortinadecor";
  canalClientes: Array<{ id: string; text: string }> = [
    { id: "cortinadecor", text: "Cortinadecor" },
  ];

  public linkDocument: any = this.domSanitizer.bypassSecurityTrustResourceUrl(
    "about:blank"
  );

  descTiendas: Array<any> = [];
  Target_NuevoCliente = "-1";
  Target_NuevaReferencia = " ";

  /* ================= definición de columnas ================= */

  colsStd: PedidosGridColumn[] = [
    { field: "idrow", header: "idrow", width: 55, group: "Pedido" },
    { field: "dias", header: "Días", width: 55, group: "Pedido", type: "dias", align: "center" },
    { field: "descestado", header: "Estado", width: 125, group: "Pedido" },
    { field: "fabricacion", header: "FAB", width: 50, group: "Pedido", type: "flag", align: "center" },
    { field: "detalles", header: "Detalles", width: 75, group: "Pedido" },
    { field: "prod_ok", header: "Prod", width: 45, group: "Pedido" },
    { field: "prod_reason", header: "Prod. Razón", width: 150, group: "Pedido" },
    { field: "refcliente", header: "Ref. Cliente", width: 200, group: "Pedido" },
    { field: "referencia", header: "Referencia", width: 200, group: "Pedido" },
    { field: "fecha", header: "Fecha", width: 145, group: "Pedido", type: "datetime" },
    { field: "ID", header: "ID", width: 50, group: "Pedido", type: "flag", align: "center" },
    { field: "nombre", header: "Nombre", width: 150, group: "Dirección Entrega" },
    { field: "domicilio", header: "Dirección", width: 200, group: "Dirección Entrega" },
    { field: "cp", header: "CP", width: 55, group: "Dirección Entrega" },
    { field: "poblacion", header: "Población", width: 120, group: "Dirección Entrega" },
    { field: "provincia", header: "Provincia", width: 120, group: "Dirección Entrega" },
    { field: "nomfiscal", header: "Nombre", width: 150, group: "Dirección Fiscal" },
    { field: "dirfiscal", header: "Dirección", width: 200, group: "Dirección Fiscal" },
    { field: "cpfiscal", header: "CP", width: 55, group: "Dirección Fiscal" },
    { field: "pobfiscal", header: "Población", width: 120, group: "Dirección Fiscal" },
    { field: "provfiscal", header: "Provincia", width: 120, group: "Dirección Fiscal" },
  ];

  colsB2B: PedidosGridColumn[] = [
    { field: "idrow", header: "idrow", width: 55 },
    { field: "dias", header: "Días", width: 55, type: "dias", align: "center" },
    { field: "descestado", header: "Estado", width: 150 },
    { field: "fabricacion", header: "FAB", width: 50, type: "flag", align: "center" },
    { field: "detalles", header: "Detalles", width: 75 },
    { field: "referencia", header: "Contenido", width: 240 },
    { field: "prod_ok", header: "Prod", width: 45 },
    { field: "prod_reason", header: "Prod. Razón", width: 150 },
    { field: "refcliente", header: "Ref. Cliente", width: 175 },
    { field: "cliente_solarmanes", header: "Cliente SM", width: 130 },
    { field: "IMD", header: "ID", width: 50, type: "flag", align: "center" },
    { field: "id", header: "Código", width: 125 },
    { field: "filename", header: "Fichero", width: 250 },
    { field: "date", header: "Fecha", width: 100, type: "date" },
    { field: "name", header: "Nombre", width: 150 },
    { field: "lastname", header: "Apellidos", width: 150 },
    { field: "business", header: "Empresa", width: 160 },
    { field: "nif", header: "NIF", width: 100 },
    { field: "address", header: "Dirección", width: 200 },
    { field: "postcode", header: "CP", width: 55 },
    { field: "city", header: "Población", width: 120 },
    { field: "province", header: "Provincia", width: 120 },
    { field: "country", header: "País", width: 60 },
    { field: "phone", header: "Teléfono", width: 110 },
  ];

  colsLMO: PedidosGridColumn[] = [
    { field: "idrow", header: "idrow", width: 55, group: "Pedido" },
    { field: "dias", header: "Días", width: 55, group: "Pedido", type: "dias", align: "center" },
    { field: "descestado", header: "Estado", width: 125, group: "Pedido" },
    { field: "fabricacion", header: "FAB", width: 50, group: "Pedido", type: "flag", align: "center" },
    { field: "referencia", header: "Referencia", width: 200, group: "Pedido" },
    { field: "fecha", header: "Fecha", width: 145, group: "Pedido", type: "datetime" },
    { field: "ID", header: "ID", width: 50, group: "Pedido", type: "flag", align: "center" },
    { field: "nombre", header: "Nombre", width: 150, group: "Dirección Entrega" },
    { field: "domicilio", header: "Dirección", width: 200, group: "Dirección Entrega" },
    { field: "cp", header: "CP", width: 55, group: "Dirección Entrega" },
    { field: "poblacion", header: "Población", width: 120, group: "Dirección Entrega" },
    { field: "provincia", header: "Provincia", width: 120, group: "Dirección Entrega" },
    { field: "nomfiscal", header: "Nombre", width: 150, group: "Dirección Fiscal" },
    { field: "dirfiscal", header: "Dirección", width: 200, group: "Dirección Fiscal" },
    { field: "cpfiscal", header: "CP", width: 55, group: "Dirección Fiscal" },
    { field: "pobfiscal", header: "Población", width: 120, group: "Dirección Fiscal" },
    { field: "provfiscal", header: "Provincia", width: 120, group: "Dirección Fiscal" },
  ];

  colsDetalle: PedidosGridColumn[] = [
    { field: "id", header: "id", width: 55 },
    { field: "orden", header: "Orden", width: 60, align: "center" },
    { field: "idpedido", header: "Pos", width: 55 },
    { field: "articulo", header: "Art", width: 55 },
    { field: "descripcion", header: "Descripción", width: 400 },
    { field: "cantidad", header: "Cantidad", width: 70, align: "center" },
    { field: "descunidad", header: "Unidad", width: 80, align: "center" },
    { field: "ubicacion", header: "Ubicación", width: 90, align: "center" },
    { field: "consumo", header: "Consumo", width: 80, align: "center" },
    { field: "cod_sol", header: "Cod. Sol", width: 80, align: "center" },
    { field: "fam_sol", header: "Fam. Sol", width: 80, align: "center" },
  ];

  constructor(
    private service: HaruService,
    private domSanitizer: DomSanitizer,
    private toaster: ToastrService,
    private router: Router,
    private excel: ExcelService
  ) {
    this.firmaID = this.service.getfirmaID();
  }

  ngOnInit() {
    if (localStorage.ambito == '"E"') {
      this.router.navigate([JSON.parse(localStorage.user)]);
      return;
    }
    this.Init();
    this.Zustanden_Laden();
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  /* ================= inicialización ================= */

  Init() {
    this.EstadoOrden = "0";
    const month = new Date().getMonth();
    const ano = new Date().getFullYear();
    const today = new Date(ano, month, 1);
    this.SelectedDate = new Date(today.setMonth(today.getMonth() - 2));
    this.SelectedDate2 = new Date();
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

  Zustanden_Laden() {
    const url = "/api/bestellung_zustanden";
    this.service.API_Bestellungen_URL_Header(url).subscribe(
      (data) => {
        if (data.Table && data.Table.length > 0) {
          this.zustanden = data.Table;
          this.zustanden.push({ p1: -1, p2: "Todos los estados" });
          this.getScope();
        }
      },
      (error) => {
        this.toaster.error(error.message);
      }
    );
  }

  /* ================= carga de datos ================= */

  onDateChange(e: any) {
    if (e.target.id === "_SelectedDate") {
      this.SelectedDate = new Date(e.target.value);
    }
    if (e.target.id === "_SelectedDate2") {
      this.SelectedDate2 = new Date(e.target.value);
    }
  }

  setTipo(cliente: number) {
    this.SelectedCliente = cliente;
    this.clearAllSelections();
    this.getScope();
  }

  onCanalChange() {
    this.selectedRow = null;
    if (this.gridB2B) this.gridB2B.clearSelection();
    this.applyCanalFilter();
  }

  getScope() {
    const estado = this.EstadoOrden;
    const desde = this.SelectedDate.toLocaleDateString("en-EN");
    const hasta = this.SelectedDate2.toLocaleDateString("en-EN");
    const cliente = this.SelectedCliente;

    this.SelectedClienteP = cliente;
    this.selectedRow = null;
    this.loading = true;

    const url = this.service.API_Bestellungen_URL3(
      estado,
      cliente,
      desde,
      hasta
    );

    console.log(url);

    this.service.get(url).subscribe(
      (data) => {
        const rows = Array.isArray(data)
          ? data
          : data && data.Table
            ? data.Table
            : [];

        if (cliente === 1) this.rowsLM = rows;
        else if (cliente === 2) {
          this.rowsB2B = rows;
          this.rebuildCanalClientes();
          this.applyCanalFilter();
        } else if (cliente === 4) this.rows4 = rows;
        else if (cliente === 5) this.rows5 = rows;

        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.toaster.error(error.message);
      }
    );
  }

  /** Reconstruye el desplegable de clientes de canal a partir de los datos. */
  private rebuildCanalClientes() {
    const map = new Map<string, string>();
    map.set("cortinadecor", "Cortinadecor");
    for (const r of this.rowsB2B) {
      const id = (r.cliente_solarmanes || "").toString().trim().toLowerCase();
      if (id) map.set(id, this.titleCase(id));
    }
    // conserva el cliente seleccionado aunque ya no tenga pedidos en el rango
    if (
      this.canalCliente &&
      this.canalCliente !== "*" &&
      !map.has(this.canalCliente)
    ) {
      map.set(this.canalCliente, this.titleCase(this.canalCliente));
    }
    this.canalClientes = Array.from(map.entries()).map(([id, text]) => ({
      id,
      text,
    }));
  }

  private titleCase(s: string): string {
    return s
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  /** Aplica el filtro del cliente de canal sobre rowsB2B → rowsB2BView. */
  private applyCanalFilter() {
    if (this.canalCliente === "*") {
      this.rowsB2BView = this.rowsB2B.slice();
      return;
    }
    const target = this.canalCliente.toLowerCase();
    const isDefault = target === "cortinadecor";
    this.rowsB2BView = this.rowsB2B.filter((r) => {
      const v = (r.cliente_solarmanes || "").toString().trim().toLowerCase();
      // filas sin cliente asignado se muestran bajo el cliente por defecto
      if (!v) return isDefault;
      return v === target;
    });
  }

  /* ================= selección ================= */

  onSelect(row: any | null) {
    this.selectedRow = row;
  }

  private clearAllSelections() {
    this.selectedRow = null;
    [this.gridLM, this.gridB2B, this.grid4, this.grid5].forEach((g) => {
      if (g) g.clearSelection();
    });
  }

  private activeGrid(): PedidosGridComponent | null {
    switch (this.SelectedCliente) {
      case 1:
        return this.gridLM;
      case 2:
        return this.gridB2B;
      case 4:
        return this.grid4;
      case 5:
        return this.grid5;
    }
    return null;
  }

  /** Devuelve [idrow] (o [] ) de la fila seleccionada. */
  private selIds(): any[] {
    return this.selectedRow ? [this.selectedRow.idrow] : [];
  }

  private requireSingle(): boolean {
    if (!this.selectedRow) {
      alert("No ha seleccionado ninguna linea");
      return false;
    }
    return true;
  }

  /* ================= acciones ================= */

  exportData() {
    const grid = this.activeGrid();
    if (grid) {
      this.excel.exportAsExcelFile(grid.processedRows, "pedidos");
    }
  }

  Impresion2() {
    if (!this.requireSingle()) return;
    this.Print(this.selIds());
  }

  Print(item: any) {
    const url =
      "https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0&cust=" +
      this.SelectedClienteP +
      "&proc=PP_PREVIEW&ids=" +
      item;
    this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  CambiarEstado() {
    if (!this.requireSingle()) return;
    const jvalues = {
      cliente: this.SelectedClienteP,
      estado: this.Target_EstadoOrden,
      ids: this.selIds(),
    };
    this.service
      .HTTP_Post("/bestellungen_zustanden", JSON.stringify(jvalues))
      .subscribe(
        () => this.getScope(),
        (error) => this.toaster.error(error.message)
      );
  }

  Reprocesar() {
    if (this.SelectedCliente !== 5) return;
    if (!this.requireSingle()) return;

    const id = this.selectedRow.idrow;
    const ref = this.selectedRow.referencia;
    const url =
      "https://www.manzasm.com/lm/linkapi/bestellungen_reprocess/" +
      id +
      "/" +
      ref;

    this.service.ReprocessFile(url).subscribe(
      () => {
        this.getScope();
        this.toaster.success("Fichero Reprocesado", "Proceso");
      },
      (error) => this.toaster.error(error.message)
    );
  }

  HojaFabricacion() {
    if (!this.requireSingle()) return;
    let url = "/sm/export_csv/" + this.selectedRow.idrow + "/" + this.SelectedCliente;
    url = this.service.HTTP_Url_Get(url);
    window.open(url);
  }

  Setzustand(idrow: any, value: number, cliente: number) {
    const tag = { idrow: idrow, estado: value, cliente: cliente };
    this.service.HTTP_Post("/bestellung_zustand", JSON.stringify(tag)).subscribe(
      () => this.getScope(),
      (error) => this.toaster.error(error.message)
    );
  }

  IniciarFabricacion() {
    if (!this.requireSingle()) return;
    if (confirm("¿Desea Iniciar la Fabricación de la orden seleccionada?")) {
      this.Setzustand(this.selIds(), 500, this.SelectedCliente);
    }
  }

  DetenerFabricacion() {
    if (!this.requireSingle()) return;
    if (confirm("¿Desea Detener la Fabricación de la orden seleccionada?")) {
      this.Setzustand(this.selIds(), 0, this.SelectedCliente);
    }
  }

  VerHojaFabricacion(force: number) {
    if (!this.requireSingle()) return;
    const url =
      "/sm/detail/" + this.selectedRow.idrow + "/" + this.SelectedCliente + "/" + force;
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        if (data.Table && data.Table.length > 0) {
          this.detailRows = data.Table;
        } else {
          this.detailRows = [];
        }
      },
      (error) => this.toaster.error(error.message)
    );
  }

  exportHojaFabricacion() {
    this.excel.exportAsExcelFile(this.detailRows, "fabricacion");
  }

  Herstellung() {
    if (!this.requireSingle()) return;
    const url =
      "#/routes/herstellen/herstellung?id=" +
      this.selectedRow.idrow +
      "&cli=" +
      this.SelectedCliente;
    window.open(url);
  }

  VerImagen() {
    if (!this.selectedRow) {
      alert("No ha seleccionado ninguna linea");
      return;
    }

    if (this.SelectedCliente === 2) {
      const url = this.service.Master_NH_Upload_File_URL(
        this.selectedRow.filename
      );
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      const id = this.selectedRow.idrow;
      const ref = this.selectedRow.referencia;
      const url =
        "https://www.manzasm.com/lm/api/bestellung_file/uploads/b2b/" +
        id +
        "/" +
        ref;
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  LoadTiendas() {
    const url = "/sm/tiendas_cliente/" + this.SelectedClienteP;
    this.service.HTTP_Get(url).subscribe(
      (data) => {
        this.descTiendas = data;
      },
      (error) => this.toaster.error(error.message)
    );
  }

  ModificarCliente() {
    this.LoadTiendas();
    this.modalClientes.show();
  }

  ActualizarCliente() {
    if (!this.requireSingle()) return;
    if (confirm("¿Desea Actualizar el cliente del pedido seleccionado?")) {
      const post = {
        id: this.selectedRow.idrow,
        entrega: this.Target_NuevoCliente,
      };
      this.service.HTTP_Post("/pedido_tienda", JSON.stringify(post)).subscribe(
        () => {
          this.getScope();
          this.modalClientes.hide();
        },
        (error) => this.toaster.error(error.message)
      );
    }
  }

  ModificarRefCliente() {
    this.Target_NuevaReferencia = "";
    this.modalRefClientes.show();
  }

  ActualizarReferenciaCliente() {
    if (!this.requireSingle()) return;
    if (confirm("¿Desea Actualizar la referencia del pedido seleccionado?")) {
      const post = {
        id: this.selectedRow.idrow,
        referencia: this.Target_NuevaReferencia,
      };
      this.service
        .HTTP_Post("/pedido_referencia", JSON.stringify(post))
        .subscribe(
          () => {
            this.getScope();
            this.modalRefClientes.hide();
          },
          (error) => this.toaster.error(error.message)
        );
    }
  }

  BorrarPedido() {
    if (!this.selectedRow) {
      alert("No ha seleccionado ninguna linea");
      return;
    }
    if (!confirm("¿Desea Borrar el Pedido Seleccionado?")) return;

    const idrow = this.selectedRow.idrow;
    const payload = { ids: String(idrow), cliente: this.SelectedCliente };

    this.service
      .HTTP_Post("/bestellung_delete", JSON.stringify(payload))
      .subscribe(
        (data) => {
          console.log("bestellung_delete respuesta:", data);
          this.toaster.success("Pedido " + idrow + " eliminado");
          this.selectedRow = null;
          this.getScope();
        },
        (error) => this.toaster.error(error.message)
      );
  }
}
