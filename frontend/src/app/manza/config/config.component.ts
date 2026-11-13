import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ViewChild, HostListener } from '@angular/core';
import { SMAPIService } from './smapi.service';
import { CortinaTipo } from './CortinaTipo';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';
import { DesgloseComponent } from '../desglose/desglose.component';
import { HaruService } from '../../services/haru.service';
import { TranslationService } from 'src/app/services/translation.service';
import { EnrollableComponent } from '../enrollable/enrollable.component';
import { JaponesComponent } from '../japones/japones.component';
import { VerticalComponent } from '../vertical/vertical.component';
import { CompacComponent } from '../compac/compac.component';
import { HoneycombComponent } from '../honeycomb/honeycomb.component';
import { EnrollableNuevoComponent } from '../enrollable-nuevo/enrollable-nuevo.component';
import { CompacNuevoComponent } from '../compac-nuevo/compac-nuevo.component';
import { ZipNuevoComponent } from '../zip-nuevo/zip-nuevo.component';
import { VerticalNuevoComponent } from '../vertical-nuevo/vertical-nuevo.component';
import { JaponesNuevoComponent } from '../japones-nuevo/japones-nuevo.component';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { ImpresionDocumentoComponent } from '../../shared/impresion-documento/impresion-documento.component';

declare var $: any;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css', './configurador.scss'],
  providers: [SMAPIService],
  encapsulation: ViewEncapsulation.None
})
export class ConfigComponent implements OnInit {

  @ViewChild('staticModalAdd', { static: false }) public modal!: ModalDirective;
  @ViewChild("desgloseZIP", { static: false }) public desgloseZIP!: DesgloseComponent;
  @ViewChild("impresionFin", { static: false }) public impresionFin!: ImpresionDocumentoComponent;
  @ViewChild(EnrollableComponent, { static: false }) public enrollableRef!: EnrollableComponent;
  @ViewChild(JaponesComponent, { static: false }) public japonesRef!: JaponesComponent;
  @ViewChild(VerticalComponent, { static: false }) public verticalRef!: VerticalComponent;
  @ViewChild(CompacComponent, { static: false }) public compacRef!: CompacComponent;
  @ViewChild(HoneycombComponent, { static: false }) public honeycombRef!: HoneycombComponent;
  @ViewChild(EnrollableNuevoComponent, { static: false }) public enrollableNuevoRef!: EnrollableNuevoComponent;
  @ViewChild(CompacNuevoComponent, { static: false }) public compacNuevoRef!: CompacNuevoComponent;
  @ViewChild(ZipNuevoComponent, { static: false }) public zipNuevoRef!: ZipNuevoComponent;
  @ViewChild(VerticalNuevoComponent, { static: false }) public verticalNuevoRef!: VerticalNuevoComponent;
  @ViewChild(JaponesNuevoComponent, { static: false }) public japonesNuevoRef!: JaponesNuevoComponent;

  /* Configurador nuevo de accionamientos (SOL_ACC_CLIENTE). false = el de siempre; Leroy no tiene fila */
  accNuevo: boolean = false;
  /* Solar Mini con las listas de Productos (sqlSolarMini): interruptor propio, SOL_ACC_MINI_CLIENTE */
  miniNuevo: boolean = false;
  /* Cajón ZIP con las listas de Productos (sqlCajonZip): producto propio (tipo 6), con su interruptor SOL_ACC_ZIP_CLIENTE */
  zipNuevo: boolean = false;
  /* Vertical con las listas de Productos (sqlVertical): tipo 3 con su interruptor SOL_ACC_VER_CLIENTE; Leroy sigue con manza-vertical */
  verNuevo: boolean = false;
  /* Panel japonés con las listas de Productos (sqlPanelJapones; interruptor SOL_ACC_PJ_CLIENTE) */
  pjNuevo: boolean = false;

  editingItem: CortinaTipo | null = null;

  hayBorrador: boolean = false;
  private vRef: ViewContainerRef;

  PJ_SoporteTotal = 0;

  public buildItems: Array<any> = [];

  Idioma = "ES";

  Cliente = "-1";
  SubCliente = "2";

  // Tarifa en PDF de la barra superior: solo para Leroy Merlín (clientes 1 y 5)
  get esLeroy(): boolean {
    return this.Cliente == "1" || this.Cliente == "5";
  }

  UserName = "";
  loading = false;
  height = 700;
  Logged = false;
  success = 1;
  currentUser: any = null;
  nombreCentro = "";
  nombreCentroEmp = "";
  nombreCliente = "";
  codeCentro = "-1";
  isInterno: boolean = false;
  ambito = "";
  model = {
    username: "",
    password: "",
    gettoken: "true",
    ambito: "E"
  };

  Global_Visualizar_C1_Parciales = true;
  Tipo1_Desglose = false;
  Tipo2_Desglose = false;
  Tipo3_Desglose = false;

  ReferenciaTienda = "";
  Accesorios_Enrollables = "48381445";
  Accesorios_Japones = "48381452";
  Accesorios_Verticales = "48381466";

  Promocion = 0;
  Promocion_Mensaje = "";
  Promocion_Desde = new Date();
  Promocion_Hasta = new Date();
  Promocion_Coef1 = 0;
  Promocion_Coef2 = 0;
  Promocion_Banner = "";

  FechaEntregaPedido = new Date();
  TotalCesta = 0;
  TotalCestaC1 = "";
  TransmitOK = 0;
  isCopied1 = false;
  bConfigurador = 0;
  // Panel lateral de la cesta, que se abre sobre el configurador
  cestaAbierta = false;
  bEjecucion = 0;
  NumeroCortinas = 0;
  esCadena = 0;
  esCadenaExt = -1;
  AlturaCadena = 0;
  TipoCortina = 1;
  SubTipoCortina = 1;
  btnPresupuesto = 0;
  btnPedido = 0;
  modoFinalizar = ''; // 'pedido', 'presupuesto' o '' (las dos opciones)
  // Último documento enviado desde la ventana de finalizar, para poder imprimirlo
  docEnviado: 'pedido' | 'presupuesto' | '' = '';
  idDocumento = 0;
  verImpresion = false;
  alertShow = false;
  alertMsg = "";
  idLinea = "";

  public Cesta: Array<CortinaTipo> = [];
  public CestaPrecios: Array<CortinaTipo> = [];

  public NumeroPedido: string = "";
  public Ancho: string = "";
  public Alto: string = "";
  public Cantidad: string = "1";

  public ID_Quiero: boolean = false;
  public ID_Imagen: string = "";

  public Clientes: Array<any> = [];

  Tipo1_AnchoMaximo = -1;
  Tipo1_Opacidad = '';

  public linkDocument: any = this.domSanitizer.bypassSecurityTrustUrl("about:blank");

  CodigoProv = "";
  CodigoProv2 = "";
  CodigoProv31 = "";
  CodigoProv32 = "";
  CodigoProv2_2 = "";
  CodigoProv2_3 = "";
  CodigoProv2_4 = "";
  CodigoProv2_5 = "";

  productos = {
    prod_1: false,
    prod_2: false,
    prod_3: false,
    prod_4: false,
    prod_7: false
  };


  constructor(
    private service: SMAPIService,
    public toaster: ToastrService,
    vRef: ViewContainerRef,
    private domSanitizer: DomSanitizer,
    private serviceHaru: HaruService,
    private router: Router,
    private translation: TranslationService,
    private accConfigurador: AccConfiguradorService
  ) {
    this.vRef = vRef;
  }

  FormatC1(value: string) {
    var mult = 100;
    var rvalue = parseFloat(value).toFixed(2);
    var fvalue = Number(mult) * Number(rvalue);
    var strValue = fvalue.toString();
    var retValue = "C1 " + "0".repeat(7 - strValue.length) + strValue;
    return retValue;
  }

  ngAfterViewInit() {
    this.loadPromotionData();
  }

  ngOnInit(): any {
    this.hayBorrador = !!localStorage.getItem('pedido_borrador');
    this.GetIdioma();
    this.Logged = this.CheckIfLogged();
    this.comprobarAccNuevo();
  }

  /* Solo cambia algo si el cliente tiene el interruptor activo; ante cualquier error sigue el configurador de siempre */
  comprobarAccNuevo(): void {
    this.accNuevo = false;
    this.miniNuevo = false;
    this.zipNuevo = false;
    this.verNuevo = false;
    this.pjNuevo = false;
    if (!(parseInt(this.Cliente, 10) > 0)) { return; }
    this.accConfigurador.activo(this.Cliente).subscribe(activo => this.accNuevo = activo);
    this.accConfigurador.miniActivo(this.Cliente).subscribe(activo => this.miniNuevo = activo);
    this.accConfigurador.zipActivo(this.Cliente).subscribe(activo => this.zipNuevo = activo);
    this.accConfigurador.verActivo(this.Cliente).subscribe(activo => this.verNuevo = activo);
    this.accConfigurador.pjActivo(this.Cliente).subscribe(activo => this.pjNuevo = activo);
  }

  ChangeUser() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('registerDate');
    this.nombreCentro = "";
    this.codeCentro = "-1";
    this.success = 1;
    this.Logged = false;
  }

  CheckIfLogged() {
    let user = localStorage.getItem('currentUser');
    if (user != null) {
      this.currentUser = JSON.parse(user);
      if (this.currentUser != null) {
        if (this.currentUser.integracion > 0) {
          return false;
        }
        if (this.currentUser) {
          this.ambito = this.currentUser.ambito;
        }

        const isInterno = this.currentUser.tipo === 'interno' ||
                          this.currentUser.ambito === 'I' ||
                          this.currentUser.isAdmin === true ||
                          localStorage.getItem('tipoUsuario') === 'interno';

        this.isInterno = isInterno;

        if (isInterno) {
          this.UserName = this.currentUser.user || this.currentUser.username || '';
          this.nombreCentro = 'Solarmanes';
          this.codeCentro = '4';
          this.Cliente = '4';
          this.nombreCentroEmp = this.currentUser.descsubemp || this.currentUser.nombre || this.currentUser.name || 'Solarmanes';

          // Todos los productos habilitados para usuarios internos (admin y empleados)
          this.productos = {
            prod_1: true,
            prod_2: true,
            prod_3: true,
            prod_4: true,
            prod_7: true
          };
          return true;
        }

        if (this.currentUser.code) {

          console.log(this.currentUser);
          this.nombreCentro = this.currentUser.name;
          this.codeCentro = this.currentUser.code;
          this.nombreCentroEmp = this.currentUser.descsubemp;
          this.Cliente = this.currentUser.emp;
          this.UserName = this.currentUser.user;

          if ('emp' in this.currentUser && this.currentUser.emp == -1) {
            this.nombreCentroEmp = this.currentUser.name;
            this.codeCentro = "4";
            this.Cliente = "4";
          } else if ('nombre' in this.currentUser) {
            this.nombreCentroEmp = this.currentUser.nombre;
          }
          this.loadInfoUser();
        }
        return true;
      } else {
        return false;
      }
    } else {
      this.currentUser = null;
      this.nombreCentro = "";
      this.codeCentro = "-1";
      return false;
    }
  }

  loadPromotion() {
    console.log(this.Cliente, this.currentUser.user);
    this.service.getdatosPromocion(this.Cliente, this.currentUser.user).subscribe(
      data => {
        console.log(data);
        if (data && data.length > 0) {
          this.Promocion_Desde = data[0].desde;
          this.Promocion_Hasta = data[0].hasta;
          this.Promocion_Coef1 = data[0].promocion_coeficiente;
          this.Promocion_Coef2 = data[0].promocion_coeficiente2;
          this.Promocion_Mensaje = data[0].promocion_mensaje;
          this.Promocion_Banner = data[0].imagen_banner
            ? this.service.urlService + '/api/sm' + data[0].imagen_banner
            : '';
        }
      },
      error => { console.log(error); }
    );
  }

  loadInfoUser() {
    if (!this.UserName) {
      return;
    }
    this.service.getUserInfo(this.UserName).subscribe(
      data => {
        if (data && data.length > 0) {
          this.productos.prod_1 = !!data[0].prod_1;
          this.productos.prod_2 = !!data[0].prod_2;
          this.productos.prod_3 = !!data[0].prod_3;
          this.productos.prod_4 = !!data[0].prod_4;
          this.productos.prod_7 = !!data[0].prod_7;
        }
      },
      error => {
        console.log(error);
        if (error.status == 500) {
          alert("NO HAY CONEXION CON EL SERVIDOR");
        }
      }
    );

  }

  loadPromotionData() {
    if (this.codeCentro == "") {
      alert("NO HAY CODIGO DE CENTRO");
    } else {
      this.service.getPromocionActiva(this.Cliente, this.currentUser.user).subscribe(
        data => {
          if (!data || data.length === 0 || data[0].existe == 0) {
            this.Promocion = 0;
          } else {
            this.Promocion = 1;
            this.loadPromotion();
          }
        },
        error => {
          console.log(error);
          if (error.status == 500) {
            alert("NO HAY CONEXION CON EL SERVIDOR");
          }
        }
      );
    }
  }

  CheckAnchoMax() {
    if (this.TipoCortina == 1) {
      if (this.Tipo1_AnchoMaximo > 100) {
        if (parseInt(this.Ancho) > this.Tipo1_AnchoMaximo) {
          this.Ancho = this.Tipo1_AnchoMaximo.toString();
          var message: string = this.translation.get("NO PUEDE INTRODUCIR UN ANCHO SUPERIOR AL ANCHO MÁXIMO DE");
          message += ' ' + this.Tipo1_AnchoMaximo.toString();
          this.toaster.warning(message, 'ATENCION');
        }
      }
      if (parseInt(this.Ancho) < 30) {
        var message: string = this.translation.get("NO PUEDE INTRODUCIR UN ANCHO INFERIOR AL ANCHO MÍNIMO DE");
        this.Ancho = "100";
        this.toaster.warning(message, 'ATENCION');
      }
      if (parseInt(this.Alto) < 30) {
        var message: string = this.translation.get("NO PUEDE INTRODUCIR UN ALTO INFERIOR AL ALTO MÍNIMO DE");
        this.Alto = "100";
        this.toaster.warning(message, 'ATENCION');
      }
    }
  }

  GetValues() {
    if (parseInt(this.idLinea) > 0) {
      let url = this.service.urlService + "/api/lm/prices_values/" + this.idLinea + "/" + this.TipoCortina;
      this.service.HTTP_Get(url).subscribe(
        data => { this.buildItems = data; },
        error => { console.log(error.message); }
      );
    }
  }

  View(value) {
    if (value == 1) {
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl("/assets/images/japones_croquis.pdf");
    }
    if (value == 2) {
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl("/assets/images/verticales_iconos.pdf");
    }
    if (value == 3) {
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl("/assets/images/croquis-panel-japones.jpg");
    }
    if (value == 4) {
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl("/assets/images/croquis-cortina-vertical.jpg");
    }
  }

  CalculaTotalCesta() {
    var c1_sum = "";
    var c2_sum = "";
    var c3_sum = "";
    var c4_sum = "";
    var c5_sum = "";
    var c6_sum = "";
    var c7_sum = "";
    var c8_sum = "";

    var c1_step = '';
    this.TotalCesta = 0;
    this.FechaEntregaPedido = new Date();

    for (var pos = 0; pos < this.Cesta.length; pos++) {
      this.TotalCesta += this.Cesta[pos].getTotal();


      var FechaEntrega = this.Cesta[pos].getFechaEntrega();
      if (FechaEntrega != null) {
        var strfecha = FechaEntrega.split('/');
        if (strfecha.length == 3) {
          var d1 = parseInt(strfecha[0]);
          var m1 = parseInt(strfecha[1]) - 1;
          var y1 = parseInt(strfecha[2]);
          var fecha = new Date(y1, m1, d1);
          if (fecha > this.FechaEntregaPedido) {
            this.FechaEntregaPedido = fecha;
          }
        }
      }

      if (this.Cesta[pos].TipoCortina == 1) { c1_step = this.Cesta[pos].precios.T1_PVP_C1; }
      if (this.Cesta[pos].TipoCortina == 2) { c1_step = this.Cesta[pos].precios.T2_PVP_C1; }
      if (this.Cesta[pos].TipoCortina == 3) { c1_step = this.Cesta[pos].precios.T3_PVP_C1; }
      if (this.Cesta[pos].TipoCortina == 4) { c1_step = this.Cesta[pos].precios.T4_PVP_C1; }
      if (this.Cesta[pos].TipoCortina == 7) { c1_step = this.Cesta[pos].precios.T7_PVP_C1; }
      if (this.Cesta[pos].TipoCortina == 6) { c1_step = this.Cesta[pos].precios.T6_PVP_C1; }

      if (pos == 0) { c1_sum = c1_step; }
      if (pos == 1) { c2_sum = c1_step; }
      if (pos == 2) { c3_sum = c1_step; }
      if (pos == 3) { c4_sum = c1_step; }
      if (pos == 4) { c5_sum = c1_step; }
      if (pos == 5) { c6_sum = c1_step; }
      if (pos == 6) { c7_sum = c1_step; }
      if (pos == 7) { c8_sum = c1_step; }
    }

    this.NumeroCortinas = this.TotalSum();
    this.TotalCestaC1 = "";
    this.service.getSum(c1_sum, c2_sum, c3_sum, c4_sum, c5_sum, c6_sum, c7_sum, c8_sum).subscribe(
      data => { this.TotalCestaC1 = data[0].res; },
      error => { this.toaster.error(error.message); }
    );
  }

  /* El documento va por el configurador nuevo si el cliente tiene alguno de sus interruptores */
  get flujoNuevo(): boolean {
    return this.accNuevo || this.miniNuevo || this.zipNuevo || this.verNuevo || this.pjNuevo;
  }

  ProcesarPedido() {
    if (confirm("¿Desea Transmitir el Pedido?")) {
      this.btnPedido = 1;
      this.btnPresupuesto = 1;

      /* Con cualquiera de los interruptores el documento va por el flujo nuevo (enrollables, Solar Mini, Cajón ZIP y Vertical) */
      if (this.flujoNuevo) { this.ProcesarPedidoAcc(); return; }

      let lineas = JSON.stringify(this.Cesta);
      this.service.altaPedido(lineas, this.ReferenciaTienda, parseInt(this.Cliente)).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
            this.DocumentoEnviado('pedido', data);
            this.TransmitOK = 1;
            this.toaster.success('Agregado PEDIDO Satisfactoriamente', 'Agregar Pedido');
          } else {
            this.NumeroPedido = "ERROR";
            this.TransmitOK = -1;
            this.toaster.error('NO Ha sido posible agregar el PEDIDO al Sistema', 'Agregar Pedido');
          }
        },
        error => { this.toaster.error(error.message); }
      );
    }
  }

  /* Alta del pedido con el configurador nuevo (POST /api/sm/acc_cfg/pedido): de momento solo enrollables del flujo nuevo */
  ProcesarPedidoAcc() {
    this.accConfigurador.altaPedido(this.Cesta, this.ReferenciaTienda, this.Cliente).subscribe(
      data => {
        this.NumeroPedido = data.referencia;
        this.DocumentoEnviado('pedido', data);
        this.TransmitOK = 1;
        this.toaster.success('Agregado PEDIDO Satisfactoriamente', 'Agregar Pedido');
      },
      error => {
        this.NumeroPedido = "ERROR";
        this.TransmitOK = -1;
        this.toaster.error((error && error.error && error.error.message) || 'NO Ha sido posible agregar el PEDIDO al Sistema', 'Agregar Pedido');
      }
    );
  }

  /* Alta del presupuesto con el configurador nuevo (POST /api/sm/acc_cfg/presupuesto): solo enrollables del flujo nuevo */
  ProcesarPresupuestoAcc() {
    this.accConfigurador.altaPresupuesto(this.Cesta, this.ReferenciaTienda, this.Cliente).subscribe(
      data => {
        this.NumeroPedido = data.referencia;
        this.DocumentoEnviado('presupuesto', data);
        this.TransmitOK = 1;
        this.toaster.success('Agregado PRESUPUESTO Satisfactoriamente', 'Agregar PRESUPUESTO');
      },
      error => {
        this.NumeroPedido = "ERROR";
        this.TransmitOK = -1;
        this.toaster.error((error && error.error && error.error.message) || 'NO Ha sido posible agregar el PRESUPUESTO al Sistema', 'Agregar PRESUPUESTO');
      }
    );
  }

  /* Prepara la ventana de finalizar. Con modo 'pedido' o 'presupuesto' solo se ve ese botón;
     sin modo (FINALIZAR de la barra superior) se ven los dos */
  ShowBtns(modo?: string) {
    this.modoFinalizar = modo === 'pedido' || modo === 'presupuesto' ? modo : '';
    this.btnPedido = modo === 'presupuesto' ? 1 : 0;
    this.btnPresupuesto = modo === 'pedido' ? 1 : 0;
    this.TransmitOK = 0;
    this.docEnviado = '';
    this.idDocumento = 0;
    this.verImpresion = false;
  }

  /* Guarda qué se ha enviado y su IDROW (idPedido en la respuesta del alta) para el botón IMPRIMIR */
  DocumentoEnviado(doc: 'pedido' | 'presupuesto', data: any) {
    this.docEnviado = doc;
    this.idDocumento = Number(data && data.idPedido) || 0;
    this.verImpresion = false;
  }

  /* Abre el visor de impresión con el documento recién enviado, en el sitio del resumen */
  ImprimirEnviado() {
    if (!this.docEnviado || !(this.idDocumento > 0) || !this.impresionFin) { return; }
    this.verImpresion = true;
    this.impresionFin.cargar(this.docEnviado, this.idDocumento);
  }

  /* Al cerrar la ventana de finalizar se descarta el PDF cargado */
  CerrarImpresion() {
    if (this.impresionFin) { this.impresionFin.limpiar(); }
    this.verImpresion = false;
  }

  ProcesarPresupuesto() {
    if (this.flujoNuevo) {
      if (confirm("¿Desea Guardar el documento como Presupuesto?")) {
        this.btnPedido = 1;
        this.btnPresupuesto = 1;
        this.ProcesarPresupuestoAcc();
      }
      return;
    }
    if (confirm("¿Desea Guardar el documento como Presupuesto?")) {
      this.btnPedido = 1;
      this.btnPresupuesto = 1;

      let lineas = JSON.stringify(this.Cesta);
      this.service.altaPresupuesto(lineas, this.ReferenciaTienda, parseInt(this.Cliente)).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
            this.DocumentoEnviado('presupuesto', data);
            this.TransmitOK = 1;
            this.toaster.success('Agregado PRESUPUESTO Satisfactoriamente', 'Agregar PRESUPUESTO');
          } else {
            this.NumeroPedido = "ERROR";
            this.TransmitOK = -1;
            this.toaster.error('NO Ha sido posible agregar el PRESUPUESTO al Sistema', 'Agregar Pedido');
          }
        },
        error => { console.log(error); }
      );
    }
  }

  Next(e, current) {
    if (current.focus) {
      current.focus();
    }
  }

  // La cesta ya no es una pantalla aparte: se abre el panel lateral sobre el configurador
  VerPedido() {
    this.bConfigurador = 0;
    this.cestaAbierta = true;
    this.editingItem = null;
    this.CalculaTotalCesta();
  }

  CerrarCesta() {
    this.cestaAbierta = false;
  }

  @HostListener('document:keydown.escape')
  CerrarCestaConEscape() {
    this.cestaAbierta = false;
  }

  VerConfigurador() {
    this.bConfigurador = 0;
    this.cestaAbierta = false;
  }

  VerPedidos() {
    this.bConfigurador = 3;
    this.cestaAbierta = false;
  }

  VerPresupuestos() {
    this.bConfigurador = 2;
    this.cestaAbierta = false;
  }

  Exit() {
    if (this.ambito == 'E') {
      this.serviceHaru.logout();
      this.router.navigate(['/pages/login']);
    } else {
      this.router.navigate(['/routes']);
    }
  }

  BorrarPedido() {
    if (confirm("¿Quiere realmente Borrar el Pedido?")) {
      this.TransmitOK = 0;
      this.Cesta = [];
      this.NumeroPedido = "";
    }
    this.CalculaTotalCesta();
  }

  TotalSum() {
    let Suma = 0;
    this.Cesta.forEach(item => {
      if (item.TipoCortina == 1) { Suma += item.cantidad; }
      if (item.TipoCortina == 2) {
        /* panel japonés nuevo (npj): la cantidad son paneles o rieles */
        if ((item as any).npj) { Suma += Number(item.cantidad); } else if (item.PJ_Cantidad_1) { Suma += Number(item.PJ_Cantidad_1); }
      }
      if (item.TipoCortina == 3) {
        const ver = (item as any).ver;
        if ((item as any).nver) {
          /* Vertical nuevo: la cantidad son cortinas o rieles; en solo tejido son lamas sueltas y la línea cuenta como una */
          Suma += ver && ver.modalidadCodigo === 'SOLO_TEJIDO' ? 1 : Number(item.cantidad);
        } else {
          if (item.PV_Cantidad_1) { Suma += Number(item.PV_Cantidad_1); }
          if (item.PV_Cantidad_2) { Suma += Number(item.PV_Cantidad_2); }
        }
      }
      if (item.TipoCortina == 4) { Suma += item.cantidad; }
      if (item.TipoCortina == 7) { Suma += item.cantidad; }
      if (item.TipoCortina == 6) { Suma += Number(item.cantidad); }
    });
    return Suma;
  }

  DeleteLine(item) {
    if (confirm("¿Quiere borrar la línea seleccionada?")) {
      var pos = this.Cesta.indexOf(item);
      if (pos > -1) {
        this.Cesta.splice(pos, 1);
        this.CalculaTotalCesta();
      }
    }
  }

  BudgetLoaded(event: any): void {
    this.Cesta = [];
    this.ReferenciaTienda = event.refcliente;

    /* T1 - ENROLLABLE */
    this.service.Budget_herunterladen_T1(event.idrow).subscribe(
      data => {
        const len = data.length;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
            const alturaCadena = item.cad_Altura;
            const estancia = "-1";
            const estanciaobs = "";

            const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

            const precios = {
              T1_Cantidad: item.T1_Cantidad,
              T1_Tejido: item.T1_Tejido,
              T1_Tejido_C1: item.T1_Tejido_C1,
              T1_Inc_CadenaMetalica: item.T1_Inc_CadenaMetalica,
              T1_Inc_CadenaMetalica_C1: item.T1_Inc_CadenaMetalica_C1,
              T1_Inc_Contrapeso: item.T1_Inc_Contrapeso,
              T1_Inc_Contrapeso_C1: item.T1_Inc_Contrapeso_C1,
              T1_Inc_Mando: item.T1_Inc_Mando,
              T1_Inc_Mando_C1: item.T1_Inc_Mando_C1,
              T1_Inc_Impresion: item.T1_Inc_Impresion,
              T1_Inc_Impresion_C1: item.T1_Inc_Impresion_C1,
              T1_Inc_Cargador: item.T1_Inc_Cargador || 0,
              T1_Inc_Cargador_C1: item.T1_Inc_Cargador_C1 || '',
              T1_PVP: Number(item.T1_PVP),
              T1_PVP_C1: item.T1_PVP_C1,
              T1_Fecha_Entrega: item.T1_Fecha_Entrega,
              T1_Transporte: item.T1_Transporte,

              T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '', T2_NumeroVias: 0,
              T2_NumeroVias_C1: '', T2_NumSoportes: 0, T2_TipoSoporte: 0,
              T2_TipoSoporte_C1: '', T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
              T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: "", T2_Transporte: "", T2_SoporteTotal: 0,

              T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
              T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
              T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: "", T3_Transporte: "",

              T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,

              T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
              T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: "", T4_Transporte: "",
            };

            tipo.Enrollable_Add(item.ancho, item.alto, item.cantidad,
              item.acc_tipo_id, item.acc_tipo_text,
              item.acc_marca_id, item.acc_marca_text,
              item.acc_tubo_id, item.acc_tubo_text,
              item.acc_modelo_id, item.acc_modelo_text,
              item.acc_posicion_id, item.acc_posicion_text,
              item.sop_tipo_id, item.sop_tipo_text,
              item.sop_color_id, item.sop_color_text,
              item.tej_tipo_id, item.tej_tipo_text,
              item.tej_color_id, item.tej_color_text,
              item.tej_salida_id, item.tej_salida_text,
              item.con_tipo_id, item.con_tipo_text,
              item.tap_tipo_id, item.tap_tipo_text,
              item.tap_color_id, item.tap_color_text,
              alturaCadena, item.cad_color_text, item.cad_Tipo,
              item.con_color_id, item.con_color_text,
              item.impresion, item.impresion_imagen,
              item.mando_id, item.mando_text,
              estancia, estanciaobs, precios,
              item.Tipo1_Cajon, item.Tipo1_CajonC, item.Tipo1_CajonRAL,
              item.Tipo1_Guia, item.Tipo1_GuiaC, item.Tipo1_GuiaRAL,
              item.SubTipoCortina, item.Tipo1_Cargador);

            /* Línea del configurador nuevo: se recupera su selección (nacc_*) para poder editarla y volver a guardarla */
            if (item.nacc_accionamiento_id) {
              (tipo as any).nacc = {
                accionamiento: item.nacc_accionamiento_id, sistema: item.nacc_sistema_id,
                tipo_cadena: item.nacc_tipo_cadena_id, altura: item.nacc_altura_id,
                color_cadena: item.nacc_color_cadena_id,
                cadena_longitud: item.nacc_cadena_longitud,
                tipo_motor: item.nacc_tipo_motor_id, modelo_motor: item.nacc_modelo_motor_id,
                mando: item.nacc_mando_id, cargador: item.nacc_cargador_id, bateria: item.nacc_bateria_id,
                soporte: item.nacc_soporte_id, soporte_color: item.nacc_soporte_color_id,
                tapa: item.nacc_tapa_id, tapa_color: item.nacc_tapa_color_id,
                contrapeso: item.nacc_contrapeso_id, contrapeso_color: item.nacc_contrapeso_color_id,
                /* tejido del maestro (script 30) */
                tejido: item.nacc_tejido_id
              };
              /* Tarifa (T1/T2) con la que se calculó el precio: el servidor lo recalcula al pedir */
              (tipo as any).tipo_tarifa = item.nacc_tipo_tarifa;
              tipo.estancia_id = item.Estancia_ID;
              tipo.estancia_obs = item.Estancia;
            }

            this.Cesta.push(tipo);
          }
          const message = this.translation.get('AGREGADA CORTINA ENROLLABLE A CESTA');
          this.toaster.success(message, 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T2 - PANEL JAPONES */
    this.service.Budget_herunterladen_T2(event.idrow).subscribe(
      data => {
        const len = data.length;
        let anadidas = 0;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
            /* las líneas del panel japonés nuevo (npj_*) se cargan aparte, más abajo */
            if (item.npj_modalidad_id) { continue; }
            const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

            const precios = {
              T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: "", T1_Inc_CadenaMetalica: 0,
              T1_Inc_CadenaMetalica_C1: '', T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
              T1_Inc_Mando: 0, T1_Inc_Mando_C1: '', T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
              T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: "", T1_Transporte: "",

              T2_Cantidad: item.T2_Cantidad,
              T2_Tejido: item.T2_Tejido,
              T2_Tejido_C1: item.T2_Tejido_C1,
              T2_NumeroVias: item.T2_NumeroVias,
              T2_NumeroVias_C1: item.T2_NumeroVias_C1,
              T2_NumSoportes: item.T2_NumSoportes,
              T2_TipoSoporte: item.T2_TipoSoporte,
              T2_TipoSoporte_C1: item.T2_TipoSoporte_C1,
              T2_Inc_Impresion: item.T2_Inc_Impresion,
              T2_Inc_Impresion_C1: item.T2_Inc_Impresion_C1,
              T2_PVP: Number(item.T2_PVP),
              T2_PVP_C1: item.T2_PVP_C1,
              T2_Fecha_Entrega: item.T2_FechaEntrega,
              T2_Transporte: item.T2_Transporte,
              T2_SoporteTotal: item.T2_SoporteTotal,

              T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
              T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
              T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: "", T3_Transporte: "",

              T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,

              T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
              T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: "", T4_Transporte: "",
            };

            tipo.Japones_Add_T1(item.PJ_Ancho_1, item.PJ_Alto_1, item.PJ_Cantidad_1,
              item.pj_tejidos_id, item.pj_tejidos_text,
              item.pj_tejidosC_id, item.pj_tejidosC_text,
              item.PJ_Contrapeso_1, item.impresion, item.impresion_imagen,
              item.PJ_Estancia_ID, item.PJ_Estancia, item.PJ_Ancho_2, item.PJ_NumeroVias_2,
              item.PJ_PosicionMando_2, item.PJ_TipoRecogida_2,
              item.PJ_ColorRiel_2, item.PJ_TipoSoporte_2,
              item.PJ_NumeroPortatelas, item.PJ_NumeroLamas, item.PJ_AnchoLama,
              item.PJ_AltoLamaTerminada, item.TipoJapones, item.NumeroPanos,
              item.pj_tejidos_id, item.pj_tejidosC_id,
              item.T2_TejidoColor_2, item.T2_TejidoColor_3, item.T2_TejidoColor_4, item.T2_TejidoColor_5,
              item.PJ_Text2, item.PJ_Text3, item.PJ_Text4, item.PJ_Text5, item.PJ_CombinarColores,
              precios);

            this.Cesta.push(tipo);
            anadidas++;
          }
          /* si todas eran del panel nuevo (se cargan aparte), no se dice nada aquí */
          if (anadidas > 0) {
            const message = this.translation.get('AGREGADO PANEL JAPONÉS A CESTA');
            this.toaster.success(message, 'Cesta');
            this.NumeroCortinas = this.TotalSum();
            this.VerPedido();
          }
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T3 - VERTICAL (el de siempre). Las líneas del Vertical nuevo (nver_*) se cargan aparte, más abajo */
    this.service.Budget_herunterladen_T3(event.idrow).subscribe(
      data => {
        const len = data.length;
        let cargadas = 0;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
            if (item.nver_tipo_id) { continue; }
            cargadas++;
            const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

            const precios = {
              T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: "", T1_Inc_CadenaMetalica: 0,
              T1_Inc_CadenaMetalica_C1: '', T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
              T1_Inc_Mando: 0, T1_Inc_Mando_C1: '', T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
              T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: "", T1_Transporte: "",

              T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '', T2_NumeroVias: 0,
              T2_NumeroVias_C1: '', T2_NumSoportes: 0, T2_TipoSoporte: 0,
              T2_TipoSoporte_C1: '', T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
              T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: "", T2_Transporte: "", T2_SoporteTotal: 0,

              T3_Cantidad: item.T3_Cantidad,
              T3_Tejido: item.T3_Tejido,
              T3_Tejido_C1: item.T3_Tejido_C1,
              T3_TejidosCombinados: item.T3_TejidosCombinados,
              T3_TejidosCombinados_C1: item.T3_TejidosCombinados_C1,
              T3_TipoSoporte: item.T3_TipoSoporte,
              T3_NumSoportes: item.T3_NumSoportes,
              T3_TipoSoporte_C1: item.T3_TipoSoporte_C1,
              T3_PVP: Number(item.T3_PVP),
              T3_PVP_C1: item.T3_PVP_C1,
              T3_Fecha_Entrega: item.T3_Fecha_Entrega,
              T3_Transporte: item.T3_Transporte,

              T32_Cantidad: item.T32_Cantidad,
              T32_Tejido: item.T32_Tejido,
              T32_Tejido_C1: item.T32_Tejido_C1,
              T32_TejidosCombinados: item.T32_TejidosCombinados,

              T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
              T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: "", T4_Transporte: "",
            };

            if (item.PV_SEL_1 == 1) {
              tipo.Vertical_Add_T1(item.PV_Ancho_1, item.PV_Alto_1, item.PV_Cantidad_1,
                item.PV_AnchoLama_1,
                item.PV_PosicionMecanismo_1,
                item.PV_ColorRiel_1,
                item.PV_Accionamiento_1,
                item.PV_TipoSoporte_1,
                item.PV_TipoRecogida_1,
                item.PV_Tejido_id, item.PV_Tejido_text,
                item.PV_Tejido_c1_id, item.PV_Tejido_c1_text,
                item.PV_Tejido_c2_id, item.PV_Tejido_c2_text,
                item.estancia, item.estanciaobs, item.TipoVertical,
                item.PV_Impresion_1, item.PV_ID_Imagen_1, precios);
            }

            if (item.PV_SEL_2 == 1) {
              tipo.Vertical_Add_T2(item.PV_Ancho_2, item.PV_Cantidad_2, item.PV_AlturaMin_2,
                item.PV_AlturaMax_2, item.PV_AnchoLama_2,
                item.PV_PosicionMecanismo_2,
                item.PV_ColorRiel_2,
                item.PV_Accionamiento_2,
                item.PV_TipoSoporte_2,
                item.PV_TipoRecogida_2,
                item.estancia, item.estanciaobs, item.TipoVertical,
                item.PV_Impresion_2, item.PV_ID_Imagen_2, precios,
                item.PV_Tejido_id, item.PV_Tejido_text,
                item.PV_Tejido_c1_id, item.PV_Tejido_c1_text,
                item.PV_Tejido_c2_id, item.PV_Tejido_c2_text);
            }

            this.Cesta.push(tipo);
          }
          if (cargadas > 0) {
            const message = this.translation.get('AGREGADO VERTICAL A CESTA');
            this.toaster.success(message, 'Cesta');
            this.NumeroCortinas = this.TotalSum();
            this.VerPedido();
          }
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T3 - VERTICAL del configurador nuevo (sqlVertical): solo con su interruptor y solo las líneas con su selección (nver_*) */
    if (this.verNuevo) {
      this.service.Budget_herunterladen_T3_ver(event.idrow).subscribe(
        data => {
          const len = data.length;
          if (len > 0) {
            for (let pos = 0; pos < len; pos++) {
              this.Cesta.push(this.lineaVerDesdePresupuesto(data[pos]));
            }
            this.toaster.success('Vertical agregado a la cesta', 'Cesta');
            this.NumeroCortinas = this.TotalSum();
            this.VerPedido();
          }
        },
        error => { this.toaster.error(JSON.stringify(error)); }
      );
    }

    /* T2 - PANEL JAPONÉS del configurador nuevo (sqlPanelJapones): solo con su interruptor y solo las líneas con npj_* */
    if (this.pjNuevo) {
      this.service.Budget_herunterladen_T2_pj(event.idrow).subscribe(
        data => {
          const len = data.length;
          if (len > 0) {
            for (let pos = 0; pos < len; pos++) {
              this.Cesta.push(this.lineaPjDesdePresupuesto(data[pos]));
            }
            this.toaster.success('Panel japonés agregado a la cesta', 'Cesta');
            this.NumeroCortinas = this.TotalSum();
            this.VerPedido();
          }
        },
        error => { this.toaster.error(JSON.stringify(error)); }
      );
    }

    /* T4 - COMPAC */
    this.service.Budget_herunterladen_T4(event.idrow).subscribe(
      data => {
        const len = data.length;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
            const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

            const precios = {
              T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: "", T1_Inc_CadenaMetalica: 0,
              T1_Inc_CadenaMetalica_C1: '', T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
              T1_Inc_Mando: 0, T1_Inc_Mando_C1: '', T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
              T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: "", T1_Transporte: "",

              T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '', T2_NumeroVias: 0,
              T2_NumeroVias_C1: '', T2_NumSoportes: 0, T2_TipoSoporte: 0,
              T2_TipoSoporte_C1: '', T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
              T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: "", T2_Transporte: "", T2_SoporteTotal: 0,

              T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
              T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
              T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: "", T3_Transporte: "",

              T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,

              T4_Cantidad: item.T4_Cantidad,
              T4_Tejido: item.T4_Tejido,
              T4_Tejido_C1: item.T4_Tejido_C1,
              T4_Coeficiente: item.T4_Coeficiente,
              T4_PVP: Number(item.T4_PVP),
              T4_PVP_C1: item.T4_PVP_C1,
              T4_Fecha_Entrega: item.T4_Fecha_Entrega,
              T4_Transporte: item.T4_Transporte
            };

            tipo.Compac_Add(item.junquillo, item.ancho, item.ancho2, item.alto, item.cantidad,
              item.acc_tipo_id, item.acc_tipo_text,
              item.acc_marca_id, item.acc_marca_text,
              item.acc_modelo_id, item.acc_modelo_text,
              item.acc_tubo_id, item.acc_tubo_text,
              item.acc_posicion_id, item.acc_posicion_text,
              item.sop_tipo_id, item.sop_tipo_text,
              item.sop_color_id, item.sop_color_text,
              item.tap_tipo_id, item.tap_tipo_text,
              item.tap_color_id, item.tap_color_text,
              item.tej_tipo_id, item.tej_tipo_text,
              item.tej_color_id, item.tej_color_text,
              item.tej_salida_id, item.tej_salida_text,
              item.cad_altura_id, item.cad_altura_text,
              item.cad_color_id, item.cad_color_text,
              item.cad_Altura, item.cad_Tipo,
              item.estancia, item.estanciaobs,
              item.perfileria, item.ral, item.impresion, item.impresion_imagen,
              precios);

            /* Línea del configurador nuevo del Solar Mini: se recupera su selección (nmini_*) para poder editarla y volver a guardarla */
            if (item.nmini_junquillo_id) {
              (tipo as any).nmini = {
                junquillo: item.nmini_junquillo_id,
                color_perfil: item.nmini_color_perfil_id, color_ral: item.nmini_color_ral_id,
                color_cadena: item.nmini_color_cadena_id, color_tapa: item.nmini_color_tapa_id,
                tejido: item.nmini_tejido_id,
                altura_cadena: parseFloat(item.cad_Altura) > 0 ? parseFloat(item.cad_Altura) : null,
                posicion: item.acc_posicion_id
              };
              /* Tarifa (T1/T2) con la que se calculó el precio: el servidor lo recalcula al pedir */
              (tipo as any).tipo_tarifa = item.nmini_tipo_tarifa;
              tipo.estancia_id = item.Estancia_ID;
              tipo.estancia_obs = item.Estancia;
              tipo.com_estancia_id = item.Estancia_ID;
              tipo.com_estancia_obs = item.Estancia;
            }

            this.Cesta.push(tipo);
          }
          const message = this.translation.get('AGREGADO COMPAC A CESTA');
          this.toaster.success(message, 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T6 - CAJÓN ZIP del configurador nuevo (sqlCajonZip): solo las líneas con su selección (nzip_*) */
    this.service.Budget_herunterladen_T6(event.idrow).subscribe(
      data => {
        const len = data.length;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            this.Cesta.push(this.lineaZipDesdePresupuesto(data[pos]));
          }
          this.toaster.success('Cajón ZIP agregado a la cesta', 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T7 - HONEYCOMB */
    this.service.Budget_herunterladen_T7(event.idrow).subscribe(
      data => {
        const len = data.length;
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
            const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

            const precios = {
              T7_PVP: Number(item.T7_PVP),
              T7_PVP_C1: item.T7_PVP_C1,
              T7_Fecha_Entrega: item.T7_Fecha_Entrega,
              T7_Transporte: item.T7_Transporte
            };

            tipo.HoneyComb_Add(item.ancho, item.alto, item.cantidad,
              item.tej_tipo_id, item.tej_tipo_text,
              item.tej_color_id, item.tej_color_text,
              item.color_perfil_id, item.color_perfil_text,
              item.hc_accionamiento_id, item.hc_accionamiento_text,
              precios);

            this.Cesta.push(tipo);
          }
          const message = this.translation.get('AGREGADO HONEYCOMB A CESTA');
          this.toaster.success(message, 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );
  }

  /* Línea de Cajón ZIP de un presupuesto (fila de SOL_PRESUPUESTOS_COLA_TIPO_6 con los nombres de sus opciones)
     como la deja manza-zip-nuevo en la cesta: selección en nzip, textos en zip e importes en precios.T6_* */
  private lineaZipDesdePresupuesto(item: any): CortinaTipo {
    const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
    const color = (nombre: string, ral: string, hex: string) => (nombre ? { nombre: nombre, ral: ral || '', hex: hex || '' } : null);
    tipo.TipoCortina = 6;
    tipo.ancho = Number(item.ancho);
    tipo.alto = Number(item.alto);
    tipo.cantidad = item.cantidad;
    tipo.tej_tipo_text = item.tej_tipo_text;
    tipo.tej_color_text = item.tej_color_text;
    tipo.estancia_id = item.nzip_estancia_id ? String(item.nzip_estancia_id) : '-1';
    tipo.estancia_obs = item.nzip_estancia || '';
    tipo.precios.T6_Cantidad = item.T6_Cantidad || item.cantidad;
    tipo.precios.T6_Tejido = Number(item.T6_Tejido) || 0;
    tipo.precios.T6_PVP = Number(item.T6_PVP) || 0;
    tipo.precios.T6_PVP_C1 = '';
    (tipo as any).zip = {
      modelo: item.zip_modelo || '', soporte: item.zip_soporte || '', salida: item.zip_salida || '',
      colorCajon: color(item.zip_color_cajon, item.zip_color_cajon_ral, item.zip_color_cajon_hex),
      vista: item.cajon_vista === 'INTERIOR' ? 'Visto desde el interior' : item.cajon_vista === 'EXTERIOR' ? 'Visto desde el exterior' : '',
      tipoMotor: item.zip_tipo_motor || '', motor: item.zip_motor || '', mando: item.zip_mando || '',
      posicion: item.acc_posicion_text || '', guia: item.zip_guia || '',
      colorGuia: color(item.zip_color_guia, item.zip_color_guia_ral, item.zip_color_guia_hex),
      contrapeso: item.zip_contrapeso || '',
      colorContrapeso: color(item.zip_color_contrapeso, item.zip_color_contrapeso_ral, item.zip_color_contrapeso_hex),
      lacado: item.zip_lacado || '', criterio: item.zip_criterio || null
    };
    (tipo as any).nzip = {
      modelo_cajon: item.nzip_modelo_cajon_id, soporte: item.nzip_soporte_id, posicion_salida: item.nzip_posicion_salida_id,
      color_cajon: item.nzip_color_cajon_id, vista: item.cajon_vista, tejido: item.nzip_tejido_id,
      tipo_motor: item.nzip_tipo_motor_id, modelo_motor: item.nzip_modelo_motor_id, mando: item.nzip_mando_id,
      posicion: item.acc_posicion_id, guia: item.nzip_guia_id, color_guia: item.nzip_color_guia_id,
      contrapeso: item.nzip_contrapeso_id, color_contrapeso: item.nzip_color_contrapeso_id, lacado: item.nzip_lacado_id
    };
    /* Tarifa (T1/T2) con la que se calculó el precio: el servidor lo recalcula al pedir */
    (tipo as any).tipo_tarifa = item.nzip_tipo_tarifa;
    return tipo;
  }

  /* Línea de Vertical nuevo de un presupuesto (fila de SOL_PRESUPUESTOS_COLA_TIPO_3 con las medidas de la línea y los
     nombres de sus opciones) como la deja manza-vertical-nuevo en la cesta: selección en nver, textos en ver e importes en precios.T3_* */
  private lineaVerDesdePresupuesto(item: any): CortinaTipo {
    const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
    const inclinada = item.ver_tipo_codigo === 'INCLINADA';
    tipo.TipoCortina = 3;
    tipo.ancho = Number(item.ancho) > 0 ? Number(item.ancho) : null;
    /* en la inclinada el alto de la línea es el máximo y viaja aparte (alto_max) */
    tipo.alto = !inclinada && Number(item.alto) > 0 ? Number(item.alto) : null;
    tipo.cantidad = item.cantidad;
    tipo.tej_tipo_text = item.ver_tejido || '';
    tipo.tej_color_text = item.ver_color || '';
    tipo.estancia_id = item.nver_estancia_id ? String(item.nver_estancia_id) : '-1';
    tipo.estancia_obs = item.nver_estancia || '';
    tipo.precios.T3_Cantidad = item.T3_Cantidad || item.cantidad;
    tipo.precios.T3_Tejido = Number(item.T3_Tejido) || 0;
    tipo.precios.T3_PVP = Number(item.T3_PVP) || 0;
    tipo.precios.T3_PVP_C1 = '';
    (tipo as any).ver = {
      tipo: item.ver_tipo || '', tipoCodigo: item.ver_tipo_codigo || '',
      modalidad: item.ver_modalidad || '', modalidadCodigo: item.ver_modalidad_codigo || '',
      altoMax: inclinada ? Number(item.nver_alto_max) : null, altoMin: inclinada ? Number(item.nver_alto_min) : null,
      lama: item.nver_ancho_lama_id ? item.ver_lama : '', posicion: item.ver_posicion || '', riel: item.ver_riel || '',
      accionamiento: item.ver_accionamiento || '', soporte: item.ver_soporte || '', recogida: item.ver_recogida || '',
      color2: item.ver_color2 || ''
    };
    (tipo as any).nver = {
      tipo: item.nver_tipo_id, modalidad: item.nver_modalidad_id,
      alto_min: inclinada ? item.nver_alto_min : null, alto_max: inclinada ? item.nver_alto_max : null,
      ancho_lama: item.nver_ancho_lama_id, posicion_mecanismo: item.nver_posicion_mecanismo_id, color_riel: item.nver_color_riel_id,
      accionamiento: item.nver_accionamiento_id, soporte: item.nver_soporte_id, recogida: item.nver_recogida_id,
      tejido: item.nver_tejido_id, tejido2: item.nver_tejido2_id
    };
    return tipo;
  }

  /* Línea de panel japonés nuevo de un presupuesto (fila de SOL_PRESUPUESTOS_COLA_TIPO_2 con las medidas de la línea, los
     nombres de sus opciones y los colores de las lamas) como la deja manza-japones-nuevo en la cesta: selección en npj,
     textos en pj e importes en precios.T2_* */
  private lineaPjDesdePresupuesto(item: any): CortinaTipo {
    const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
    const cod = item.pj_modalidad_codigo || '';
    const ids = String(item.pj_colores_ids || '').split(',').filter(x => x !== '').map(Number);
    const nombres = item.pj_colores ? String(item.pj_colores).split('|') : [];
    const num = (v: any) => (v === null || v === undefined ? null : Number(v));
    tipo.TipoCortina = 2;
    /* el solo tejido lleva en la línea el ancho y el alto de la lama: en la cesta van en npj */
    tipo.ancho = cod !== 'SOLO_TEJIDO' && Number(item.ancho) > 0 ? Number(item.ancho) : null;
    tipo.alto = cod === 'COMPLETA' && Number(item.alto) > 0 ? Number(item.alto) : null;
    tipo.cantidad = item.cantidad;
    tipo.tej_tipo_text = item.pj_tejido || '';
    tipo.tej_color_text = item.pj_color || '';
    tipo.estancia_id = item.npj_estancia_id ? String(item.npj_estancia_id) : '-1';
    tipo.estancia_obs = item.npj_estancia || '';
    tipo.impresion = !!item.impresion;
    tipo.impresion_imagen = item.impresion_imagen || '';
    tipo.precios.T2_Cantidad = item.T2_Cantidad || item.cantidad;
    tipo.precios.T2_Tejido = Number(item.T2_Tejido) || 0;
    tipo.precios.T2_PVP = Number(item.T2_PVP) || 0;
    tipo.precios.T2_PVP_C1 = '';
    (tipo as any).tipo_tarifa = item.npj_tipo_tarifa || null;
    (tipo as any).pj = {
      modalidad: item.pj_modalidad || '', modalidadCodigo: cod,
      vias: item.pj_vias || '', colorMecanismo: item.pj_color_mecanismo || '', posicionMando: item.pj_posicion_mando || '',
      recogida: item.pj_recogida || '', contrapeso: item.pj_contrapeso || '', soporte: item.pj_soporte || '',
      portatelas: num(item.npj_portatelas), anchoPortatela: num(item.npj_ancho_portatela), numLamas: num(item.npj_num_lamas),
      altoLama: num(item.npj_alto_lama), alturaMando: num(item.npj_altura_mando),
      combinacion: !!item.npj_combinacion, colores: item.npj_combinacion ? nombres : []
    };
    (tipo as any).npj = {
      modalidad: item.npj_modalidad_id, vias: item.npj_vias_id, portatelas: num(item.npj_portatelas),
      ancho_portatela: num(item.npj_ancho_portatela), num_lamas: num(item.npj_num_lamas), alto_lama: num(item.npj_alto_lama),
      altura_mando: num(item.npj_altura_mando), color_mecanismo: item.npj_color_mecanismo_id, posicion_mando: item.npj_posicion_mando_id,
      recogida: item.npj_recogida_id, contrapeso: item.npj_contrapeso_id, soporte: item.npj_soporte_id,
      tejido: item.npj_tejido_id, combinacion: !!item.npj_combinacion, colores: ids
    };
    return tipo;
  }

  EditLine(item: any): void {
    this.cestaAbierta = false;
    this.editingItem = item;
    this.TipoCortina = item.TipoCortina;
    if (item.TipoCortina === 1) {
      this.SubTipoCortina = item.SubTipoCortina || 1;
    }
    this.bConfigurador = 0;
    setTimeout(() => this.applyEdicion(item), 0);
  }

  applyEdicion(item: any): void {
    switch (item.TipoCortina) {
      case 1:
        if (item.nacc && this.enrollableNuevoRef) {
          this.enrollableNuevoRef.cargarEdicion(item);
        } else if (this.enrollableRef) {
          this.enrollableRef.SubTipo(item.SubTipoCortina || 1);
          this.enrollableRef.cargarEdicion(item);
        }
        break;
      case 2:
        if (item.npj && this.japonesNuevoRef) {
          this.japonesNuevoRef.cargarEdicion(item);
        } else if (this.japonesRef) {
          this.japonesRef.cargarEdicion(item);
        }
        break;
      case 3:
        if (item.nver && this.verticalNuevoRef) {
          this.verticalNuevoRef.cargarEdicion(item);
        } else if (this.verticalRef) {
          this.verticalRef.cargarEdicion(item);
        }
        break;
      case 4:
        if (item.nmini && this.compacNuevoRef) {
          this.compacNuevoRef.cargarEdicion(item);
        } else if (this.compacRef) {
          this.compacRef.cargarEdicion(item);
        }
        break;
      case 7:
        if (this.honeycombRef) { this.honeycombRef.cargarEdicion(item); }
        break;
      case 6:
        if (item.nzip && this.zipNuevoRef) { this.zipNuevoRef.cargarEdicion(item); }
        break;
    }
  }

  NewPage(): void { }

  Tipo(value: number) {
    this.TipoCortina = value;
  }

  classTipo(value: number) {
    const active = this.TipoCortina === value;
    return {
      'btn btn-primary': active,
      'btn btn-secondary': !active,
      'active': active
    };
  }

  classSubTipo(value: number) {
    const active = this.SubTipoCortina === value;
    return {
      'btn btn-primary btn-sm': active,
      'btn btn-secondary btn-sm': !active,
      'active': active
    };
  }

  Cerrar() {
    if (this.TransmitOK == 1) {
      window.location.reload();
    }
  }

  VerEjecucion(param: number) {
    this.bEjecucion = param;
  }

  Nueva() {
    this.bConfigurador = 0;
  }

  ChangeIdioma() {
    this.translation.setLanguage(this.Idioma);
  }

  GetIdioma() {
    this.Idioma = TranslationService.normalizar(localStorage.getItem('currentLanguage'));
  }

  AgregarHoneycomb(event: any) {
    console.log(event);
  }

  AgregarDesdeHijo(item: CortinaTipo): void {
    if (this.editingItem) {
      const pos = this.Cesta.indexOf(this.editingItem);
      if (pos > -1) {
        this.Cesta.splice(pos, 1, item);
      } else {
        this.Cesta.push(item);
      }
      this.VerPedido();
    } else {
      this.Cesta.push(item);
    }
    this.CalculaTotalCesta();
  }

  GuardarBorrador(): void {
    localStorage.setItem('pedido_borrador', JSON.stringify(this.Cesta));
    this.hayBorrador = true;
  }

  RecuperarBorrador(): void {
    const saved = localStorage.getItem('pedido_borrador');
    if (saved) {
      const data = JSON.parse(saved);
      this.Cesta = data.map(item => {
        const cortina = new CortinaTipo(item.codeCentro);
        Object.assign(cortina, item);
        return cortina;
      });
      console.log(this.Cesta);
      this.CalculaTotalCesta();
    }
  }
}