import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ViewChild } from '@angular/core';
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

declare var $: any;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  providers: [SMAPIService],
  encapsulation: ViewEncapsulation.None
})
export class ConfigComponent implements OnInit {

  @ViewChild('staticModalAdd', { static: false }) public modal!: ModalDirective;
  @ViewChild("desgloseZIP", { static: false }) public desgloseZIP!: DesgloseComponent;
  @ViewChild(EnrollableComponent, { static: false }) public enrollableRef!: EnrollableComponent;
  @ViewChild(JaponesComponent, { static: false }) public japonesRef!: JaponesComponent;
  @ViewChild(VerticalComponent, { static: false }) public verticalRef!: VerticalComponent;
  @ViewChild(CompacComponent, { static: false }) public compacRef!: CompacComponent;
  @ViewChild(HoneycombComponent, { static: false }) public honeycombRef!: HoneycombComponent;

  editingItem: CortinaTipo | null = null;

  hayBorrador: boolean = false;
  private vRef: ViewContainerRef;

  PJ_SoporteTotal = 0;

  public buildItems: Array<any> = [];

  Idioma = "ES";

  Cliente = "-1";
  SubCliente = "2";
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
  bEjecucion = 0;
  NumeroCortinas = 0;
  esCadena = 0;
  esCadenaExt = -1;
  AlturaCadena = 0;
  TipoCortina = 1;
  SubTipoCortina = 1;
  btnPresupuesto = 0;
  btnPedido = 0;
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
    private translation: TranslationService
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
        this.Promocion_Desde = data[0].desde;
        this.Promocion_Hasta = data[0].hasta;
        this.Promocion_Coef1 = data[0].promocion_coeficiente;
        this.Promocion_Coef2 = data[0].promocion_coeficiente2;
        this.Promocion_Mensaje = data[0].promocion_mensaje;
        this.Promocion_Banner = data[0].imagen_banner
          ? this.service.urlService + '/api/sm' + data[0].imagen_banner
          : '';
      },
      error => { console.log(error); }
    );
  }

  loadInfoUser() {

    this.service.getUserInfo(this.UserName).subscribe(
      data => {
        this.productos.prod_1 = data[0].prod_1;
        this.productos.prod_2 = data[0].prod_2;
        this.productos.prod_3 = data[0].prod_3;
        this.productos.prod_4 = data[0].prod_4;
        this.productos.prod_7 = data[0].prod_7;
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
          if (data[0].existe == 0) {
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

  ProcesarPedido() {
    if (confirm("¿Desea Transmitir el Pedido?")) {
      this.btnPedido = 1;
      this.btnPresupuesto = 1;

      let lineas = JSON.stringify(this.Cesta);
      this.service.altaPedido(lineas, this.ReferenciaTienda, parseInt(this.Cliente)).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
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

  ShowBtns() {
    this.btnPedido = 0;
    this.btnPresupuesto = 0;
    this.TransmitOK = 0;
  }

  ProcesarPresupuesto() {
    if (confirm("¿Desea Guardar el documento como Presupuesto?")) {
      this.btnPedido = 1;
      this.btnPresupuesto = 1;

      let lineas = JSON.stringify(this.Cesta);
      this.service.altaPresupuesto(lineas, this.ReferenciaTienda, parseInt(this.Cliente)).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
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

  VerPedido() {
    this.bConfigurador = 1;
    this.editingItem = null;
    this.CalculaTotalCesta();
  }

  VerConfigurador() {
    this.bConfigurador = 0;
  }

  VerPedidos() {
    this.bConfigurador = 3;
  }

  VerPresupuestos() {
    this.bConfigurador = 2;
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
      if (item.TipoCortina == 2) { if (item.PJ_Cantidad_1) { Suma += Number(item.PJ_Cantidad_1); } }
      if (item.TipoCortina == 3) {
        if (item.PV_Cantidad_1) { Suma += Number(item.PV_Cantidad_1); }
        if (item.PV_Cantidad_2) { Suma += Number(item.PV_Cantidad_2); }
      }
      if (item.TipoCortina == 4) { Suma += item.cantidad; }
      if (item.TipoCortina == 7) { Suma += item.cantidad; }
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
        if (len > 0) {
          for (let pos = 0; pos < len; pos++) {
            const item = data[pos];
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
          }
          const message = this.translation.get('AGREGADO PANEL JAPONÉS A CESTA');
          this.toaster.success(message, 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

    /* T3 - VERTICAL */
    this.service.Budget_herunterladen_T3(event.idrow).subscribe(
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
                item.PV_Impresion_2, item.PV_ID_Imagen_2, precios);
            }

            this.Cesta.push(tipo);
          }
          const message = this.translation.get('AGREGADO VERTICAL A CESTA');
          this.toaster.success(message, 'Cesta');
          this.NumeroCortinas = this.TotalSum();
          this.VerPedido();
        }
      },
      error => { this.toaster.error(JSON.stringify(error)); }
    );

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
  }

  EditLine(item: any): void {
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
        if (this.enrollableRef) {
          this.enrollableRef.SubTipo(item.SubTipoCortina || 1);
          this.enrollableRef.cargarEdicion(item);
        }
        break;
      case 2:
        if (this.japonesRef) { this.japonesRef.cargarEdicion(item); }
        break;
      case 3:
        if (this.verticalRef) { this.verticalRef.cargarEdicion(item); }
        break;
      case 4:
        if (this.compacRef) { this.compacRef.cargarEdicion(item); }
        break;
      case 7:
        if (this.honeycombRef) { this.honeycombRef.cargarEdicion(item); }
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
    this.Idioma = localStorage.getItem('currentLanguage');
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