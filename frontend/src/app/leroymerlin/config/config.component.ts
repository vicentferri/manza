import { Component, OnInit, ViewEncapsulation, ViewContainerRef, ViewChild, DoCheck } from '@angular/core';
import { LMSMAPIService } from './lmsmapi.service';
import { Tipo } from './Tipo'
import { TipoExt } from './TipoExt';
import { Tipo2 } from './Tipo2';
import { Tipo3 } from './Tipo3';
import { CortinaTipo } from './CortinaTipo';
import { ToastrService } from 'ngx-toastr';
//import { SelectComponent } from 'ng2-select/ng2-select';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  providers: [LMSMAPIService],
  encapsulation: ViewEncapsulation.None
})
export class ConfigComponent implements OnInit, DoCheck {

  height = 700;

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

  FechaEntregaPedido = new Date();
  TotalCesta = 0;
  TotalCestaC1 = "";
  TransmitOK = 0;
  isCopied1 = false;
  bConfigurador = 0;
  NumeroCortinas = 0;
  esCadena = 0;
  esCadenaExt = -1;
  AlturaCadena = 0;
  TipoCortina = 1;

  btnPresupuesto = 0;
  btnPedido = 0;

  alertShow = false;
  alertMsg = "";

  public NumeroPedido: string = "";
  public Cesta: Array<CortinaTipo> = [];
  public Ancho: string = "";
  public Alto: string = "";
  public Cantidad: string = "1";
  public items1: Array<Tipo> = [];
  public selitems1: Array<Tipo> = [];
  public items2: Array<Tipo> = [];
  public selitems2: Array<Tipo> = [];
  public items3: Array<Tipo> = [];
  public selitems3: Array<Tipo> = [];
  public soportes: Array<Tipo> = [];
  public soportesC: Array<Tipo> = [];
  public selitems4: Array<Tipo> = [];
  public radiomando: Array<Tipo2> = [];
  public radiomando_lista: Array<Tipo2> = [];
  public PosicionMando: Array<Tipo> = [];
  public selPosicionMando: Array<Tipo> = [];
  public tejidosS: Array<Tipo> = [];
  public seltejidosS: Array<Tipo> = [];
  public tejidos: Array<Tipo3> = [];
  public tejidosC: Array<TipoExt> = [];
  public contrapesos: Array<Tipo2> = [];
  public contrapesosC: Array<Tipo> = [];
  public tapas: Array<Tipo> = [];
  public tapasC: Array<Tipo> = [];
  public oritubos: Array<TipoExt> = [];
  public tubos: Array<{ id: number; text: string; ancmax: number }> = [];
  public seltubos: Array<TipoExt> = [];
  public alturaCadena: Array<Tipo> = [];
  public alturaCadenaM: Array<Tipo> = [];
  public colorCadena: Array<Tipo> = [];
  public compac_accionamientos: Array<Tipo> = [];
  public K_tapas: Array<Tipo> = [];
  public K_tapasC: Array<Tipo> = [];
  public K_soportes: Array<Tipo> = [];
  public K_soportesC: Array<Tipo> = [];
  public K_tubos: Array<Tipo> = [];
  public compac_tubos: Array<Tipo> = [];
  public ID_Quiero: boolean = false;
  public ID_Imagen: string = "";


  /* NUEVOS TIPOS 10.12.2017 */
  public Tipo1_Tejido: string = "-1";
  public Tipo1_TejidoSalida: string = "-1";
  public Tipo1_TejidoColor: string = "-1";
  public Tipo1_Soporte: string = "-1";
  public Tipo1_SoporteC: string = "-1";
  public Tipo1_Tapa: string = "-1";
  public Tipo1_TapaC: string = "-1";
  public Tipo1_Contrapeso: string = "-1";
  public Tipo1_ContrapesoC: string = "-1";

  public Tipo1_Tipo: string = "-1";
  public Tipo1_Marca: string = "-1";
  public Tipo1_Color: string = "-1";
  public Tipo1_Mando: string = "-1";
  public Tipo1_Posicion: string = "-1";
  public Tipo1_Tubo: string = "-1";
  public Tipo1_AlturaCadena: string = "-1";
  public Tipo1_ColorCadena: string = "-1";
  public Tipo1_AlturaCadenaM: string = "-1";

  public Tipo2_Tejido: string = "-1";
  public Tipo2_TejidoColor: string = "-1";
  public Tipo2_TejidoColor_2: string = "-1";
  public Tipo2_TejidoColor_3: string = "-1";
  public Tipo2_TejidoColor_4: string = "-1";
  public Tipo2_TejidoColor_5: string = "-1";

  public Tipo3_Tejido: string = "-1";
  public Tipo3_TejidoColor1: string = "-1";
  public Tipo3_TejidoColor2: string = "-1";

  public Tipo3_Tejido_2: string = "-1";
  public Tipo3_TejidoColor1_2: string = "-1";
  public Tipo3_TejidoColor2_2: string = "-1";

  public Tipo4_Tejido: string = "-1";
  public Tipo4_TejidoColor: string = "-1";
  public Tipo4_TejidoSalida: string = "-1";

  /* ESTANCIAS */
  public Tipo1_Estancia: string = "-1";
  public Tipo1_Estancia_Obs: string = "";
  public Tipo1_Estancias: any = [];
  public Tipo2_Estancia: string = "-1";
  public Tipo2_Estancia_Obs: string = "";
  public Tipo21_Estancia: string = "-1";
  public Tipo21_Estancia_Obs: string = "";
  public Tipo3_Estancia: string = "-1";
  public Tipo3_Estancia_Obs: string = "";
  public Tipo31_Estancia: string = "-1";
  public Tipo31_Estancia_Obs: string = "";
  public Tipo4_Estancia: string = "-1";
  public Tipo4_Estancia_Obs: string = "";

  public verMando: boolean = false;

  /* PANEL JAPONES */
  public PJ_Ancho_1: string = "";
  public PJ_Alto_1: string = "150";
  public PJ_Cantidad_1: string = "1";

  public pj_tejidos: Array<Tipo3> = [];
  public pj_tejidosC: Array<Tipo> = [];
  public pj_tejidosC_2: Array<Tipo> = [];
  public pj_tejidosC_3: Array<Tipo> = [];
  public pj_tejidosC_4: Array<Tipo> = [];
  public pj_tejidosC_5: Array<Tipo> = [];

  public PJ_Contrapeso_1: string = "1";

  public PJ_Ancho_2: string = "";
  public PJ_NumeroVias_2: string = "-1";
  public PJ_PosicionMando_2: string = "-1";
  public PJ_TipoRecogida_2: string = "-1";
  public PJ_ColorRiel_2: string = "-1";
  public PJ_TipoSoporte_2: string = "-1";
  public PJ_NumeroPanos: string = "0";

  public PJ_ID_Quiero: boolean = false;
  public PJ_ID_Imagen: string = "";

  /* 12.09.2018 */
  public PJ_CombinarColores: boolean = false;


  /* PANEL JAPONES */

  /* PANEL VERTICAL */
  public PV_SEL_1: boolean = true;
  public PV_SEL_2: boolean = false;
  public PV_Ancho_1: string = "";
  public PV_Alto_1: string = "";
  public PV_Cantidad_1: string = "1";
  public PV_AnchoLama_1: string = "-1";
  public PV_PosicionMecanismo_1: string = "-1";
  public PV_ColorRiel_1: string = "-1";
  public PV_Accionamiento_1: string = "-1";
  public PV_TipoSoporte_1: string = "-1";
  public PV_TipoRecogida_1: string = "-1";
  public pv_tejidos_1: Array<Tipo3> = [];
  public pv_tejidosC_1: Array<Tipo> = [];
  public pv_tejidosC_2: Array<Tipo> = [];

  public PV_Ancho_2: string = "";
  public PV_Cantidad_2: string = "1";
  public PV_AlturaMin_2: string = "";
  public PV_AlturaMax_2: string = "";
  public PV_AnchoLama_2: string = "-1";
  public PV_PosicionMecanismo_2: string = "-1";
  public PV_ColorRiel_2: string = "-1";
  public PV_Accionamiento_2: string = "COR";
  public PV_TipoSoporte_2: string = "-1";
  public PV_TipoRecogida_2: string = "-1";
  public pv_tejidos_2: Array<Tipo3> = [];
  public pv_tejidosC2_1: Array<Tipo> = [];
  public pv_tejidosC2_2: Array<Tipo> = [];
  /* PANEL VERTICAL */

  /* PANEL COMPAC */
  compac = {
    PC_TipoJunquillo: "-1",
    PC_AnchoB: "0",
    Compac_Acc_Tipo: "COM",
    Compac_Acc_Color: "-1",
    Compac_Acc_Marca: "COM",
    Compac_Acc_Posicion: "-1",
    Compac_Acc_Cad_Altura: "-1",
    Compac_Acc_Cad_Color: "-1",
    Compac_Acc_Tubo: "T18",
    Compac_Sop_Color: "-1",
    Compac_Sop_Tipo: "COM",
    Compac_Tap_Color: "-1",
    Compac_Tap_Tipo: "COM",
    PC_ColorPerfileria: "BLA"
  }
  /* PANEL COMPAC */
  public value: any = {};
  public _disabledV: string = '0';
  public disabled: boolean = false;
  public disabledK: boolean = true;

  public tejidos_compac: Array<Tipo3> = [];
  public tejidos_compac_colores: Array<Tipo> = [];
  public tejidos_impresion_tipo1: Array<Tipo> = [];

  Accionamientos: Tipo[] = [];
  TipoAccionamientos: Tipo[] = [];
  TipoColores: Tipo[] = [];
  TipoCadena: Tipo[] = [];

  TipoCadena1: string = "true";
  TipoCadena2: string = "false";
  TipoCadena3: string = "false";


  TiposSoporte: Array<any> = [{ id: '-1', name: 'Elegir', c1: 'C1 0000000' }, { id: 'TEC', name: 'Techo', c1: 'C1 0000000' }, { id: 'P08', name: 'Pared 8 cm', c1: 'C1 0000116' }, { id: 'P12', name: 'Pared 12 cm', c1: 'C1 0000182' }, { id: 'P15', name: 'Pared 15 cm', c1: 'C1 0000232' }]

  Logged = false;
  success = 1;
  currentUser: { integracion?: number; code?: string; nombre?: string } | null = null;
  nombreCentro = "";
  codeCentro = "-1";
  model = {
    username: "",
    password: ""
  }

  Tipo1_Contrapeso_Label = "Tipo:";
  Tipo1_RadioMando_Label = "Mando:";
  Tipo1_RadioMando_Disabled = false;
  Tipo1_Cadena_Label = "Altura:";
  Tipo1_LabelTejidoColor = "Color:";
  Tipo4_Accionamiento_Label = "Accionamiento";
  Tipo4_Accionamiento_Label_2 = "Accionamiento";
  Tipo3_Incremento_Tejidos = "";
  Tipo32_Incremento_Tejidos = "";
  Tipo2_NumeroVias_Label = "Número Vias:";
  Tipo2_TipoSoporte_Label = "Tipo de Soporte";
  Tipo3_TipoSoporte_Label = "Tipo de Soporte";
  Tipo32_TipoSoporte_Label = "Tipo de Soporte";
  Tipo1_AnchoMaximo = -1;
  TipoVertical = 1;
  TipoJapones = 1;
  Tipo3_PrecioMecanismo = 0;

  PJ_AltoLamaTerminada = 0;
  PJ_AnchoLama = 0;
  PJ_NumeroPortatelas = 0;
  PJ_NumeroLamas = 0;



  public linkDocument: any = null;

  /* VFF 12.03.2018*/
  CodigoProv = "";
  CodigoProv2 = "";
  CodigoProv31 = "";
  CodigoProv32 = "";
  CodigoProv4 = "";

  CodigoProv2_2 = "";
  CodigoProv2_3 = "";
  CodigoProv2_4 = "";
  CodigoProv2_5 = "";



  precios = {

    T1_Cantidad: 1,
    T1_Tejido: 0,
    T1_Tejido_C1: "",
    T1_Inc_CadenaMetalica: 0,
    T1_Inc_CadenaMetalica_C1: '',
    T1_Inc_Contrapeso: 0,
    T1_Inc_Contrapeso_C1: '',
    T1_Inc_Mando: 0,
    T1_Inc_Mando_C1: '',
    T1_Inc_Impresion: 0,
    T1_Inc_Impresion_C1: '',
    T1_PVP: 0,
    T1_PVP_C1: '',
    T1_Fecha_Entrega: "",
    T1_Transporte: "",

    T2_Cantidad: 1,
    T2_Tejido: 0,
    T2_Tejido_C1: '',
    T2_NumeroVias: 0,
    T2_NumeroVias_C1: '',
    T2_NumSoportes: 0,
    T2_TipoSoporte: 0,
    T2_TipoSoporte_C1: '',
    T2_Inc_Impresion: 0,
    T2_Inc_Impresion_C1: '',
    T2_PVP: 0,
    T2_PVP_C1: '',
    T2_Fecha_Entrega: "",
    T2_Transporte: "",
    T2_SoporteTotal: 0,

    T3_Cantidad: 1,
    T3_Tejido: 0,
    T3_Tejido_C1: '',
    T3_TejidosCombinados: 0,
    T3_TejidosCombinados_C1: '',

    T3_TipoSoporte: 0,
    T3_NumSoportes: 0,
    T3_TipoSoporte_C1: '',
    T3_PVP: 0,
    T3_PVP_C1: '',
    T3_Fecha_Entrega: "",
    T3_Transporte: "",

    T32_Cantidad: 1,
    T32_Tejido: 0,
    T32_Tejido_C1: '',
    T32_TejidosCombinados: 0,
    T32_TejidosCombinados_C1: '',
    T32_TipoSoporte: 0,
    T32_NumSoportes: 0,
    T32_TipoSoporte_C1: '',

    T4_Cantidad: 1,
    T4_Tejido: 0,
    T4_Tejido_C1: '',
    T4_Coeficiente: 1,
    T4_PVP: 0,
    T4_PVP_C1: '',
    T4_Fecha_Entrega: "",
    T4_Transporte: "",

  }



  ChangeTipoJapones() {
    this.ResetPrices();
  }


  ResetPrices() {

    this.precios.T1_Cantidad = 1;
    this.precios.T1_Tejido = 0;
    this.precios.T1_Tejido_C1 = '';
    this.precios.T1_Inc_CadenaMetalica = 0;
    this.precios.T1_Inc_Contrapeso = 0;
    this.precios.T1_Inc_Mando = 0;
    this.precios.T1_Fecha_Entrega = "";

    this.precios.T2_Cantidad = 1;
    this.precios.T2_Tejido = 0;
    this.precios.T2_Tejido_C1 = '';
    this.precios.T2_NumeroVias = 0;
    this.precios.T2_NumeroVias_C1 = '';
    this.precios.T2_NumSoportes = 0;
    this.precios.T2_TipoSoporte = 0;
    this.precios.T2_TipoSoporte_C1 = '';
    this.precios.T2_Fecha_Entrega = "";
    this.precios.T2_Inc_Impresion = 0;
    this.precios.T2_Inc_Impresion_C1 = '';
    this.precios.T2_PVP = 0;
    this.precios.T2_PVP_C1 = '';



    this.precios.T3_Cantidad = 1;
    this.precios.T3_Tejido = 0;
    this.precios.T3_Tejido_C1 = '';
    this.precios.T3_TejidosCombinados = 0;

    this.precios.T32_Tejido = 0;
    this.precios.T32_Tejido_C1 = '';
    this.precios.T32_TejidosCombinados = 0;

    this.precios.T3_NumSoportes = 0;
    this.precios.T3_TipoSoporte = 0;
    this.precios.T3_TipoSoporte_C1 = '';
    this.precios.T3_Fecha_Entrega = "";

    this.precios.T4_Cantidad = 1;
    this.precios.T4_Tejido = 0;
    this.precios.T4_Tejido = 0;
    this.precios.T4_Tejido = 0;
    this.precios.T4_Coeficiente = 1;
    this.precios.T4_Tejido_C1 = '';
    this.precios.T4_Fecha_Entrega = "";
  }

  CalculateFechaPrevista(cliente, producto, tejido) {
    this.service.getFechaFabricacion(cliente, tejido, producto, this.codeCentro).subscribe(
      data => {
        if (data.message == "OK") {
          var d2 = data.d2.toString();
          var m2 = data.m2.toString();
          var y2 = data.y2.toString();


          if (d2.length == 1) { d2 = "0" + d2; }
          if (m2.length == 1) { m2 = "0" + m2; }


          var fecha = d2 + "/" + m2 + "/" + y2;

          if (producto == 1) {
            this.precios.T1_Fecha_Entrega = fecha;
            this.precios.T1_Transporte = data.dt.toString();
          }

          if (producto == 2) {
            this.precios.T2_Fecha_Entrega = fecha;
            this.precios.T2_Transporte = data.dt.toString();
          }

          if (producto == 3) {
            this.precios.T3_Fecha_Entrega = fecha;
            this.precios.T3_Transporte = data.dt.toString();
          }

          if (producto == 4) {
            this.precios.T4_Fecha_Entrega = fecha;
            this.precios.T4_Transporte = data.dt.toString();
          }

        }
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  CalculateFecha(item) {

    var tejido = "-1";
    var cliente = "1";
    var producto = "-1";
    if (item.TipoCortina == 1) {
      producto = item.TipoCortina;
      tejido = item.tej_tipo_id;
    }

    this.service.getFechaFabricacion(cliente, tejido, producto, this.codeCentro).subscribe(
      data => {
        if (data.message == "OK") {
          var d2 = data.d2;
          var m2 = data.m2;
          var y2 = data.y2;
          var fecha = d2.toString() + "/" + m2.toString() + "/" + y2.toString();
          item.precios.T1_Fecha_Entrega = fecha;
          item.precios.T1_Transporte = data.dt.toString();
        }
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  CalculateC1_Tipo1() {
    this.service.getSum(this.precios.T1_Tejido_C1,
      this.precios.T1_Inc_Contrapeso_C1,
      this.precios.T1_Inc_Mando_C1,
      this.precios.T1_Inc_CadenaMetalica_C1,
      "", "", "", "").subscribe(
        data => {
          this.precios.T1_PVP_C1 = data[0].res;
        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );

  }

  CalculateC1_Tipo2() {

    if (this.precios.T2_NumeroVias_C1 == null) {
      this.precios.T2_NumeroVias_C1 = "";
    }

    this.service.getSum(this.precios.T2_Tejido_C1,
      this.precios.T2_NumeroVias_C1,
      this.precios.T2_TipoSoporte_C1,
      this.precios.T2_Inc_Impresion_C1, "", "", "", "").subscribe(
        data => {
          this.precios.T2_PVP_C1 = data[0].res;
        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );

  }

  CalculateC1_Tipo3() {
    if (this.PV_SEL_1) {
      this.service.getSum(this.precios.T3_Tejido_C1, this.precios.T3_TejidosCombinados_C1,
        this.precios.T3_TipoSoporte_C1, "", "", "", "", "").subscribe(
          data => {
            this.precios.T3_PVP_C1 = data[0].res;
          },
          error => {
            this.toaster.error(JSON.stringify(error));
          }
        );
    }
    if (this.PV_SEL_2) {
      this.service.getSum(this.precios.T32_Tejido_C1, this.precios.T32_TejidosCombinados_C1,
        this.precios.T32_TipoSoporte_C1, "", "", "", "", "").subscribe(
          data => {
            this.precios.T3_PVP_C1 = data[0].res;
          },
          error => {
            this.toaster.error(JSON.stringify(error));
          }
        );
    }
  }

  CalculateC1_Tipo4() {
    /*
    this.service.getSum(this.precios.T4_Tejido_C1, this.precios.T4_TejidosCombinados_C1,
        this.precios.T3_TipoSoporte_C1, "", "", "", "", "").subscribe(
            data => {
                this.precios.T4_PVP_C1 = data[0].res;
            },
            error => {
                
            }
        );
    */
    this.precios.T4_PVP_C1 = this.precios.T4_Tejido_C1;
  }

  ngDoCheck() {

    if (this.TipoCortina == 1) {
      if (this.esCadena == 1 && this.esCadenaExt == 2) {
      }
      else {
        this.precios.T1_Inc_CadenaMetalica = 0;
      }

      var cantidad = this.precios.T1_Cantidad;
      var v1 = this.precios.T1_Tejido;
      var v2 = this.precios.T1_Inc_CadenaMetalica;
      var v3 = this.precios.T1_Inc_Contrapeso;
      var v4 = this.precios.T1_Inc_Mando;
      var total = v1 + v2 + v3 + v4;
      this.precios.T1_PVP = total;
    }

    if (this.TipoCortina == 2) {
      var cantidad = this.precios.T2_Cantidad;
      var v1 = this.precios.T2_Tejido;
      var v2 = this.precios.T2_NumeroVias;
      var v3 = this.precios.T2_TipoSoporte;
      var v4 = this.precios.T2_NumSoportes;
      var v5 = this.precios.T2_Inc_Impresion;

      this.precios.T2_SoporteTotal = cantidad * v3 * v4;
      this.precios.T2_PVP = v1 + v2 + (v3 * v4) + v5;
    }


    if (this.TipoCortina == 3) {
      if (this.PV_SEL_1) {
        var cantidad = this.precios.T3_Cantidad;
        var v1 = this.precios.T3_Tejido;
        var v2 = this.precios.T3_TejidosCombinados;
        var v3 = this.precios.T3_TipoSoporte;
        var v4 = this.precios.T3_NumSoportes;
        var total = cantidad * (v1 + v2) + (v4 * v3);
        this.precios.T3_PVP = total;
      }
      if (this.PV_SEL_2) {
        var cantidad = this.precios.T32_Cantidad;
        var v1 = this.precios.T32_Tejido;
        var v2 = this.precios.T32_TejidosCombinados;
        var v3 = this.precios.T32_TipoSoporte;
        var v4 = this.precios.T32_NumSoportes;
        var total = cantidad * (v1 + v2) + (v4 * v3);
        this.precios.T3_PVP = total;
      }
    }

    if (this.TipoCortina == 4) {
      var cantidad = this.precios.T4_Cantidad;
      var v1 = this.precios.T4_Tejido;
      var v2 = this.precios.T4_Coeficiente;
      var total = cantidad * (v1) * v2;
      this.precios.T4_PVP = total;
    }
  }

  ChangeUser() {

    localStorage.removeItem('currentUser');
    localStorage.removeItem('registerDate');
    this.currentUser = null;
    this.nombreCentro = "";
    this.codeCentro = "-1";
    this.success = 1;
    this.Logged = false;
    this.router.navigate(['/pages/login']);
  }

  /*
  */
  CheckIfLogged() {

    if (localStorage.getItem('currentUser')) {
      var user = localStorage.getItem('currentUser');

      if (user !== null) {
        this.currentUser = JSON.parse(user);
      } else {
        this.currentUser = null;
      }

      if (this.currentUser.integracion !== undefined && this.currentUser.integracion < 0) {
        return false;
      }

      if (this.currentUser.code) {
        if (this.currentUser) {
          this.nombreCentro = this.currentUser.nombre;
          this.codeCentro = this.currentUser.code;
          return true;
        } else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      this.currentUser = null;
      this.nombreCentro = "";
      this.codeCentro = "-1";
      return false;
    }
  }



  constructor(private service: LMSMAPIService,
    private toaster: ToastrService,
    vRef: ViewContainerRef,
    private domSanitizer: DomSanitizer,
    private router: Router) {

    // this.toaster.setRootViewContainerRef(vRef);
    this.Logged = this.CheckIfLogged();
    if (!this.Logged) {
      this.router.navigate(['/pages/login']);
    } else {
      this.loadPromotionData();
    }
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

    this.load_Tubos();

    this.load_Tejidos();
    this.load_PJ_Tejidos();
    this.load_PV_Tejidos();
    this.load_Compac_Tejidos();

    this.load_SalidaTejido();
    this.load_PosicionMando();
    this.load_Accionamientos();
    this.load_Soportes();
    this.load_Contrapesos();
    this.load_Tapas();
    this.load_AlturaCadena();
    this.load_AlturaCadenaM();
    this.load_RadioMando();
    this.load_Estancias();

    this.K_tapas.push({ id: 1, text: "Tapas Compac" });
    this.K_tapasC.push({ id: 1, text: "Blanco" }, { id: 2, text: "Gris" });
    this.K_soportes.push({ id: 1, text: "Soportes Compac" });
    this.K_soportesC.push({ id: 1, text: "Blanco" }, { id: 2, text: "Gris" }, { id: 3, text: "Beige" }, { id: 32, text: "Negro" });
    this.K_tubos.push({ id: 8, text: "Tubo 18" });

    /* Promotion Center Query Server */
    this.loadPromotionData();
    this.height = window.screen.height;


  }

  ngOnInit(): any {



  }

  /*
  */
  loadPromotion() {

    this.service.getdatosPromocion(this.currentUser.code, this.codeCentro).subscribe(
      data => {

        this.Promocion_Desde = data[0].desde;
        this.Promocion_Hasta = data[0].hasta;
        this.Promocion_Coef1 = data[0].promocion_coeficiente;
        this.Promocion_Coef2 = data[0].promocion_coeficiente2;
        this.Promocion_Mensaje = data[0].promocion_mensaje;

      },
      error => {
        this.toaster.error(JSON.stringify(error));

      }
    );
  }

  /*
  */
  loadPromotionData() {

    if (this.codeCentro == "") {
      alert("NO HAY CODIGO DE CENTRO");
    }
    else {

      this.service.getPromocionActiva(this.currentUser.code, this.codeCentro).subscribe(
        data => {

          if (data[0].existe == 0) {
            this.Promocion = 0;
          }
          else {
            this.Promocion = 1;
            this.loadPromotion();
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
          if (error.status == 500) {
            alert("NO HAY CONEXION CON EL SERVIDOR");
          }
        }
      );
    }

  }



  /*
  resetSelComponent(control: SelectComponent) {
    var activeItems = control.active;
    if (activeItems) {
      control.active = []
      control.data.next(control.active)
      control.doEvent('removed', activeItems);
    }
  }
*/

  /*
  */
  NewPage() {

    this.CodigoProv = "";
    this.CodigoProv2 = "";
    this.CodigoProv2_2 = "";
    this.CodigoProv2_3 = "";
    this.CodigoProv2_4 = "";
    this.CodigoProv2_5 = "";
    this.CodigoProv31 = "";
    this.CodigoProv32 = "";
    this.CodigoProv4 = "";
    this.ResetPrices();
    this.Tipo1_AnchoMaximo = -1;
    this.Tipo2_NumeroVias_Label = "Número Vias:";
    this.Tipo3_Incremento_Tejidos = "";
    this.Tipo32_Incremento_Tejidos = "";
    this.esCadenaExt = -1;
    this.Tipo1_Contrapeso_Label = "Tipo:";
    this.Tipo1_RadioMando_Label = "Mando:";
    this.Tipo1_RadioMando_Disabled = false;
    this.bConfigurador = 0;
    this.TransmitOK = 0;

    /* PAGE 1 */

    this.Ancho = "";
    this.Alto = "";
    this.Cantidad = "1";
    this.selitems1 = [];
    this.selitems2 = [];
    this.selitems3 = [];
    this.verMando = false;
    this.esCadena = 0;
    this.ID_Quiero = false;
    this.ID_Imagen = "";

    this.Tipo1_Tejido = "-1";
    this.Tipo1_TejidoSalida = "1";
    this.Tipo1_TejidoColor = "-1";
    this.Tipo1_Soporte = "-1";
    this.Tipo1_SoporteC = "-1";
    this.Tipo1_Tapa = "-1";
    this.Tipo1_TapaC = "-1";
    this.Tipo1_Contrapeso = "-1";
    this.Tipo1_ContrapesoC = "-1";

    this.Tipo1_Tipo = "-1";
    this.Tipo1_Marca = "-1";
    this.Tipo1_Color = "-1";
    this.Tipo1_Mando = "-1";
    this.Tipo1_Posicion = "1";
    this.Tipo1_Tubo = "-1";
    this.Tipo1_AlturaCadena = "-1";
    this.Tipo1_AlturaCadenaM = "-1";
    this.AlturaCadena = 0;
    this.Tipo1_ColorCadena = "-1";

    this.Tipo2_Tejido = "-1";
    this.Tipo2_TejidoColor = "-1";
    this.Tipo3_Tejido = "-1";
    this.Tipo3_TejidoColor1 = "-1";
    this.Tipo3_TejidoColor2 = "-1";
    this.Tipo3_Tejido_2 = "-1";
    this.Tipo3_TejidoColor1_2 = "-1";
    this.Tipo3_TejidoColor2_2 = "-1";

    /* PAGE 2 */

    this.PJ_Ancho_1 = "";
    this.PJ_Alto_1 = "150";
    this.PJ_Cantidad_1 = "1";
    this.PJ_Contrapeso_1 = "1";
    this.PJ_Ancho_2 = "";
    this.PJ_NumeroVias_2 = "-1";
    this.PJ_PosicionMando_2 = "-1";
    this.PJ_TipoRecogida_2 = "-1";
    this.PJ_ColorRiel_2 = "-1";
    this.PJ_TipoSoporte_2 = "-1";
    this.PJ_ID_Quiero = false;
    this.PJ_ID_Imagen = "";
    this.PJ_NumeroPanos = "0";
    this.PJ_AltoLamaTerminada = 0;
    this.PJ_AnchoLama = 0;
    this.PJ_NumeroPortatelas = 0;
    this.PJ_NumeroLamas = 0;

    /* PAGE 3 */

    this.PV_Ancho_1 = "";
    this.PV_Alto_1 = "";
    this.PV_Cantidad_1 = "1";
    this.PV_AnchoLama_1 = "-1";
    this.PV_PosicionMecanismo_1 = "-1";
    this.PV_ColorRiel_1 = "-1";
    this.PV_Accionamiento_1 = "-1";
    this.PV_TipoSoporte_1 = "-1";
    this.PV_TipoRecogida_1 = "-1";

    this.PV_Ancho_2 = "";
    this.PV_Cantidad_2 = "1";
    this.PV_AlturaMin_2 = "";
    this.PV_AlturaMax_2 = "";
    this.PV_AnchoLama_2 = "-1";
    this.PV_PosicionMecanismo_2 = "-1";
    this.PV_ColorRiel_2 = "-1";
    this.PV_Accionamiento_2 = "COR";
    this.PV_TipoSoporte_2 = "-1";
    this.PV_TipoRecogida_2 = "-1";


    /* PAGE 4 */
    this.compac.PC_TipoJunquillo = "-1";
    this.compac.PC_AnchoB = "0";

    this.Tipo1_Estancia = "-1";
    this.Tipo1_Estancia_Obs = "";
    this.Tipo2_Estancia = "-1";
    this.Tipo2_Estancia_Obs = "";
    this.Tipo21_Estancia = "-1";
    this.Tipo21_Estancia_Obs = "";
    this.Tipo3_Estancia = "-1";
    this.Tipo3_Estancia_Obs = "";
    this.Tipo31_Estancia = "-1";
    this.Tipo31_Estancia_Obs = "";
    this.Tipo4_Estancia = "-1";
    this.Tipo4_Estancia_Obs = "";

    this.Tipo4_Tejido = "-1";
    this.Tipo4_TejidoColor = "-1";
    this.Tipo3_TipoSoporte_Label = "Tipo de Soporte";

    this.load_Tejidos();
  }

  reset(item: number) {

  }

  public removed(item: number, value: any): void {
    this.alertShow = false;
    this.alertMsg = "";


  }

  public typed(item: number, value: any): void {
  }

  public refreshValue(item: number, value: any): void {
    this.value = value;
  }

  /*
  */
  load_Tubos() {
    this.service.getTubos().subscribe(
      data => {
        this.oritubos = data;
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_RadioMando() {
    this.service.getRadioMandos().subscribe(
      data => {
        this.radiomando_lista = data;
        this.radiomando_lista.push({ 'id': -1, 'text': 'Seleccionar', 'precio': data.precio, 'c1': data.c1 });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_PosicionMando() {
    this.service.getPosicionMando().subscribe(

      data => {
        this.PosicionMando = data;
        if (this.PosicionMando.length > 0) {
          let test_data: { id: number; text: string; ancmax?: number }[] = [];
          test_data.push({ id: this.PosicionMando[0].id, text: this.PosicionMando[0].text });
          this.selPosicionMando = test_data;
          this.Tipo1_Posicion = this.PosicionMando[0].id.toString();
        }
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_SalidaTejido() {
    this.service.getSalidaTejido().subscribe(

      data => {
        this.tejidosS = data;
        if (this.tejidosS.length > 0) {
          let test_data: { id: number; text: string; ancmax?: number }[] = [];
          test_data.push({ id: this.tejidosS[0].id, text: this.tejidosS[0].text });
          this.seltejidosS = test_data;
          this.Tipo1_TejidoSalida = this.tejidosS[0].id.toString();
          this.Tipo4_TejidoSalida = this.tejidosS[0].id.toString();

        }
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );

  }

  /*
  */
  load_ColorAccionamientos(acc: number, tipo: number) {
    this.service.getAccionamientosColores(tipo, acc).subscribe(

      data => {
        this.TipoColores = data;
        this.colorCadena = data;
        this.items3 = this.TipoColores;
        this.items3.push({ 'id': -1, 'text': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_TipoAccionamientos(item: number) {

    for (let entry of this.Accionamientos) {

      if (entry.id == item) {
        this.service.getAccionamientosTipos(entry.id, this.TipoCortina).subscribe(

          data => {
            this.TipoAccionamientos = data;
            this.TipoAccionamientos.push({ 'id': -1, 'text': 'Seleccionar' });
            this.items2 = this.TipoAccionamientos;

            if (data.length == 2) {
              this.Tipo1_Marca = this.items2[0].id.toString();
              this.ChangeAccionamientoMarca();
            }

          },
          error => {
            this.toaster.error(JSON.stringify(error));
          }
        );
      }
    }

  }

  /*
  */
  load_Accionamientos() {
    this.service.getAccionamientos().subscribe(

      data => {
        this.Accionamientos = data;
        this.items1 = this.Accionamientos;
        this.items1.push({ 'id': -1, 'text': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_Soportes() {
    this.service.getSoportes().subscribe(

      data => {
        this.soportes = data;
        this.soportes.push({ 'id': -1, 'text': 'Seleccionar' });

        if (this.soportes.length == 2) {
          var id = this.soportes[0].id;
          this.Tipo1_Soporte = id.toString();
          this.load_SoportesColores(id);
        }

      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_SoportesColores(item: number) {
    this.service.getSoportesColor(item).subscribe(

      data => {
        this.soportesC = data;
        this.soportesC.push({ 'id': -1, 'text': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_Tejidos() {
    this.CodigoProv = "";
    this.service.getTejidosProducto("1", "1").subscribe(

      data => {
        this.tejidos = data;
        this.tejidos.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
        this.Tipo1_Tejido = "-1";
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }


  /*
  */
  load_Tejidos_ID() {
    this.CodigoProv = "";
    this.service.getTejidosProductoID("1", "1").subscribe(

      data => {
        this.tejidos = data;
        this.tejidos.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
        this.Tipo1_Tejido = "-1";
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  /*
  */
  load_Compac_Tejidos() {
    this.service.getTejidosProducto("1", "4").subscribe(
      data => {
        this.tejidos_compac = data;
        this.tejidos_compac.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );

  }

  load_PJ_Tejidos() {
    this.service.getTejidosProducto("1", "2").subscribe(

      data => {

        this.pj_tejidos = data;
        this.pj_tejidos.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_PJ_Tejidos_ID() {

    this.service.getTejidosProductoID("1", "2").subscribe(

      data => {
        this.pj_tejidos = data;
        this.pj_tejidos.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
        this.Tipo2_Tejido = "-1";
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_PV_Tejidos() {
    this.CodigoProv31 = "";
    this.CodigoProv32 = "";
    this.service.getTejidosProducto("1", "3").subscribe(

      data => {
        this.pv_tejidos_1 = data;
        this.pv_tejidos_2 = data;

        this.pv_tejidos_1.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });

      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TejidosColores(item: number) {
    this.service.getTejidosColor(item).subscribe(

      data => {
        this.tejidosC = data;
        this.tejidosC.push({ 'id': -1, 'text': 'Seleccionar', 'ancmax': 0 });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  Change_ColorPerfileria() {
    var strCoeficiente = this.compac.PC_ColorPerfileria;
    if (strCoeficiente == "NOGOSC" || strCoeficiente == "ROBCLA") {
      this.precios.T4_Coeficiente = 1.5;
    } else {
      this.precios.T4_Coeficiente = 1;
    }


  }

  ChangeTejidoColor() {
    var color = this.Tipo1_TejidoColor;
    if (color != "-1") {
      var pos = this.getPos(this.tejidosC, color);
      if (pos >= 0) {
        var anchomax = this.tejidosC[pos].ancmax;
        if (anchomax > 0) {
          this.Tipo1_LabelTejidoColor = "Color:(ancho max:" + anchomax.toString() + " cms)";
          this.Tipo1_AnchoMaximo = anchomax;
        } else {
          this.Tipo1_LabelTejidoColor = "Color:";
          this.Tipo1_AnchoMaximo = -1;
        }
      }
    }
  }

  load_TejidosColoresID(item: number) {
    this.service.getTejidosColorID(item).subscribe(

      data => {
        this.tejidosC = data;
        this.tejidosC.push({ 'id': -1, 'text': 'Seleccionar', 'ancmax': 0 });
        this.ChangeTejidoColor();
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TejidosColoresPJ(item: number) {
    this.service.getTejidosColorPJ(item).subscribe(

      data => {
        this.pj_tejidosC = data;
        this.pj_tejidosC.push({ 'id': -1, 'text': 'Ninguno' });

        this.pj_tejidosC_2 = data;
        this.pj_tejidosC_3 = data;
        this.pj_tejidosC_4 = data;
        this.pj_tejidosC_5 = data;
        this.CheckPrice();
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TejidosColoresPJID(item: number) {
    this.service.getTejidosColorID(item).subscribe(

      data => {

        this.pj_tejidosC = data;
        this.pj_tejidosC.push({ 'id': -1, 'text': 'Ninguno' });

        this.pj_tejidosC_2 = data;
        this.pj_tejidosC_3 = data;
        this.pj_tejidosC_4 = data;
        this.pj_tejidosC_5 = data;

        this.CheckPrice();
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TejidosColoresPV(item: number) {
    this.service.getTejidosColorPV(item).subscribe(

      data => {
        this.pv_tejidosC_1 = data;
        this.pv_tejidosC_2 = data;
        this.pv_tejidosC2_1 = data;
        this.pv_tejidosC2_2 = data;

        this.Tipo3_TejidoColor1 = this.pv_tejidosC_1[0].id.toString();
        this.Tipo3_TejidoColor2 = this.pv_tejidosC_2[0].id.toString();
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TejidosColoresCompac(item: number) {
    this.CodigoProv4 = "";

    this.service.getTejidosColor(item).subscribe(

      data => {
        this.tejidos_compac_colores = data;
        this.tejidos_compac_colores.push({ 'id': -1, 'text': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_Contrapesos() {
    this.service.getContrapeso().subscribe(

      data => {
        this.contrapesos = data;
        this.contrapesos.push({ 'id': -1, 'text': 'Seleccionar', 'precio': 0, 'c1': '' });
        /* VFF Valor per defecte*/
        this.Tipo1_Contrapeso = "1";
        this.ChangeTipo1Contrapeso();

      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_ContrapesosColores(item: number) {
    this.service.getContrapesoColor(item).subscribe(

      data => {
        this.contrapesosC = data;
        this.contrapesosC.push({ 'id': -1, 'text': 'Seleccionar' });

        //if (this.contrapesosC.length == 2){
        var id = this.contrapesosC[0].id;
        this.Tipo1_ContrapesoC = id.toString();
        //}
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_Tapas() {
    this.service.getTapas().subscribe(

      data => {
        this.tapas = data;
        this.tapas.push({ 'id': -1, 'text': 'Seleccionar' });

        if (this.tapas.length == 2) {
          var id = this.tapas[0].id;
          this.Tipo1_Tapa = id.toString();
          this.load_TapasColores(id);
        }

      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_AlturaCadena() {
    this.service.getAlturaCadena().subscribe(

      data => {
        this.alturaCadena = data;
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_AlturaCadenaM() {
    this.service.getAlturaCadenaM().subscribe(

      data => {
        this.alturaCadenaM = data;
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_TapasColores(id: number) {
    this.service.getTapasColores(id).subscribe(

      data => {
        this.tapasC = data;
        this.tapasC.push({ 'id': -1, 'text': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  load_Estancias() {
    this.service.getEstancias().subscribe(

      data => {
        this.Tipo1_Estancias = data;
        this.Tipo1_Estancias.push({ 'idrow': '-1', 'descripcion': 'Seleccionar' });
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    );
  }

  PanelJapones(control) {

  }

  getPos(array, value) {
    var pos = -1;

    for (var i = 0; i < array.length; i++) {
      if (array[i].id == value) {
        pos = i;
        return pos;
      }
    }

    return pos;
  }

  selImpresionDigital_Tipo1() {

    var tipo1_id = this.ID_Quiero;

    if (tipo1_id == true) {
      this.load_Tejidos_ID();
      this.tejidosC = [];
    }
    else {
      this.load_Tejidos();
      this.tejidosC = [];
    }
  }

  /*
    09.02.2018 - Digital Impression für Japanisches Panelle
  */
  selImpresionDigital_Tipo2() {
    var tipo2_id = this.PJ_ID_Quiero;

    if (tipo2_id == true) {
      this.load_PJ_Tejidos_ID();
      this.pj_tejidosC = [];
      this.pj_tejidosC_2 = [];
      this.pj_tejidosC_3 = [];
      this.pj_tejidosC_4 = [];
      this.pj_tejidosC_5 = [];



      if (this.PJ_NumeroPanos == "") this.PJ_NumeroPanos = "1";
      if (this.PJ_NumeroPanos == "0") this.PJ_NumeroPanos = "1";

      if (parseInt(this.PJ_NumeroPanos) > 0) {
        this.precios.T2_Inc_Impresion = Number(this.PJ_Cantidad_1) * Number(this.PJ_NumeroPanos) * 48.75;
        /*
        if (this.PJ_Cantidad_1 == "1") this.precios.T2_Inc_Impresion_C1 = 'C1 0002500';
        if (this.PJ_Cantidad_1 == "2") this.precios.T2_Inc_Impresion_C1 = 'C1 0005000';
        if (this.PJ_Cantidad_1 == "3") this.precios.T2_Inc_Impresion_C1 = 'C1 0007500';
        if (this.PJ_Cantidad_1 == "4") this.precios.T2_Inc_Impresion_C1 = 'C1 0010000';
        if (this.PJ_Cantidad_1 == "5") this.precios.T2_Inc_Impresion_C1 = 'C1 0012500';
        if (this.PJ_Cantidad_1 == "6") this.precios.T2_Inc_Impresion_C1 = 'C1 0015000';
        if (this.PJ_Cantidad_1 == "7") this.precios.T2_Inc_Impresion_C1 = 'C1 0017500';
        if (this.PJ_Cantidad_1 == "8") this.precios.T2_Inc_Impresion_C1 = 'C1 0020000';
        if (this.PJ_Cantidad_1 == "9") this.precios.T2_Inc_Impresion_C1 = 'C1 0022500';
        if (this.PJ_Cantidad_1 == "10") this.precios.T2_Inc_Impresion_C1 = 'C1 0025000';
        */

        var T2_Inc_Impresion_C1 = Number(this.PJ_Cantidad_1) * Number(this.PJ_NumeroPanos) * 25.00;
        this.precios.T2_Inc_Impresion_C1 = this.FormatC1(T2_Inc_Impresion_C1.toString());

        /*
       if (parseInt(this.PJ_NumeroPanos) == 1) this.precios.T2_Inc_Impresion_C1 = 'C1 0002500';
       if (parseInt(this.PJ_NumeroPanos) == 2) this.precios.T2_Inc_Impresion_C1 = 'C1 0005000';
       if (parseInt(this.PJ_NumeroPanos) == 3) this.precios.T2_Inc_Impresion_C1 = 'C1 0007500';
       if (parseInt(this.PJ_NumeroPanos) == 4) this.precios.T2_Inc_Impresion_C1 = 'C1 0010000';
       if (parseInt(this.PJ_NumeroPanos) == 5) this.precios.T2_Inc_Impresion_C1 = 'C1 0012500';
       if (parseInt(this.PJ_NumeroPanos) == 6) this.precios.T2_Inc_Impresion_C1 = 'C1 0015000';
       if (parseInt(this.PJ_NumeroPanos) == 7) this.precios.T2_Inc_Impresion_C1 = 'C1 0017500';
       if (parseInt(this.PJ_NumeroPanos) == 8) this.precios.T2_Inc_Impresion_C1 = 'C1 0020000';
       if (parseInt(this.PJ_NumeroPanos) == 9) this.precios.T2_Inc_Impresion_C1 = 'C1 0022500';
       if (parseInt(this.PJ_NumeroPanos) == 10) this.precios.T2_Inc_Impresion_C1 = 'C1 0025000';
        */

        this.CalculateC1_Tipo2();
      }
    }
    else {
      this.load_PJ_Tejidos();
      this.pj_tejidosC = [];
      this.pj_tejidosC_2 = [];
      this.pj_tejidosC_3 = [];
      this.pj_tejidosC_4 = [];
      this.pj_tejidosC_5 = [];

      this.PJ_NumeroPanos = "0";
      this.precios.T2_Inc_Impresion = 0;
      this.precios.T2_Inc_Impresion_C1 = '';
    }
  }



  PanelJapones_Recalcula() {

    this.selImpresionDigital_Tipo2();

  }

  Tipo1_Hidden() {

    if (this.Ancho == "" && this.Alto == "") {
      return true;
    }
    else {
      return false;
    }

  }

  CombinarColores() {
    /*
    if (this.PJ_CombinarColores == true)
    this.PJ_CombinarColores = 0;
    else 
    this.PJ_CombinarColores = 1;
  */
  }


  T1Add() {
    var ancho = this.Ancho;
    var alto = this.Alto;
    var cantidad = this.Cantidad;

    var it1 = parseInt(this.Tipo1_Tipo);
    var it2 = parseInt(this.Tipo1_Marca);
    var it3 = parseInt(this.Tipo1_Color);
    var it4 = parseInt(this.Tipo1_Posicion);
    var it5 = parseInt(this.Tipo1_Soporte);
    var it6 = parseInt(this.Tipo1_SoporteC);
    var it7 = parseInt(this.Tipo1_Tejido);
    var it8 = parseInt(this.Tipo1_TejidoColor);
    var it9 = parseInt(this.Tipo1_TejidoSalida);
    var it10 = parseInt(this.Tipo1_Contrapeso);
    var it28 = parseInt(this.Tipo1_ContrapesoC);
    var it11 = parseInt(this.Tipo1_Tapa);
    var it12 = parseInt(this.Tipo1_TapaC);
    var it13 = parseInt(this.Tipo1_Tubo);
    var it31 = parseInt(this.Tipo1_Mando);


    var iProceed: number = 1;
    var strMessage: string = "";

    if (it2 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la Marca del Accionamiento";
    }

    if (it3 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color/Modelo del Accionamiento";
    }

    if (it4 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la Posición del Accionamiento";
    }

    if (it5 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Soporte";
    }

    if (it6 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del Soporte";
    }

    if (it7 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Tejido";
    }

    if (it8 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del Tejido";
    }

    if (it9 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la salida del Tejido";
    }

    if (it10 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Contrapeso";
    }

    if (it28 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del contrapeso";
    }

    if (it11 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Tapas";
    }

    if (it12 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color de las Tapas";
    }

    if (it13 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tubo del Accionamiento";
    }

    if (it31 == -1 && iProceed == 1 && this.verMando) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Mando";
    }

    if (this.ID_Quiero && iProceed == 1 && this.ID_Imagen == "") {
      iProceed = 0;
      strMessage = "Debe Indicar la Imagen para la Impresión Digital";
    }


    if (this.esCadena == 1 && iProceed == 1) {

      if (this.esCadenaExt == -1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Tipo de Cadena";
      }

      if (iProceed && this.esCadenaExt == 0) {

        if (this.AlturaCadena == 0) {
          iProceed = 0;
          strMessage = "Debe Indicar la Altura de la Cadena";
        }

        if (iProceed && this.Tipo1_ColorCadena == "-1") {
          iProceed = 0;
          strMessage = "Debe Indicar el Color de la Cadena";
        }
      }

      if (iProceed && this.esCadenaExt == 1) {
        if (this.Tipo1_AlturaCadena == "-1") {
          iProceed = 0;
          strMessage = "Debe Indicar la Altura de la Cadena";
        }

        if (iProceed && this.Tipo1_ColorCadena == "-1") {
          iProceed = 0;
          strMessage = "Debe Indicar el Color de la Cadena";
        }
      }

      if (iProceed && this.esCadenaExt == 2) {
        if (this.Tipo1_AlturaCadenaM == "-1") {
          iProceed = 0;
          strMessage = "Debe Indicar la Altura de la Cadena";
        }
      }

    }

    if (iProceed == 1) {
      var ipos = this.getPos(this.items1, it1);
      var it1s = this.items1[ipos].text;

      var it2s = this.items2[this.getPos(this.items2, it2)].text;
      var it3s = this.items3[this.getPos(this.items3, it3)].text;
      var it4s = this.PosicionMando[this.getPos(this.PosicionMando, it4)].text;
      var it5s = this.soportes[this.getPos(this.soportes, it5)].text;
      var it6s = this.soportesC[this.getPos(this.soportesC, it6)].text;
      var it7s = this.tejidos[this.getPos(this.tejidos, it7)].text;
      var it8s = this.tejidosC[this.getPos(this.tejidosC, it8)].text;
      var it9s = this.tejidosS[this.getPos(this.tejidosS, it9)].text;
      var it10s = this.contrapesos[this.getPos(this.contrapesos, it10)].text;
      var it28s = this.contrapesosC[this.getPos(this.contrapesosC, it28)].text;
      var it11s = this.tapas[this.getPos(this.tapas, it11)].text;
      var it12s = this.tapasC[this.getPos(this.tapasC, it12)].text;



      ipos = this.getPos(this.tubos, it13);
      var it13s = this.tubos[ipos].text;
      ipos = this.getPos(this.radiomando, it31);
      var it31s = "";
      if (ipos >= 0)
        it31s = this.radiomando[ipos].text;


      var it14 = parseInt(this.Tipo1_AlturaCadena);

      var it40 = parseInt(this.Tipo1_AlturaCadenaM);

      var alturaCadena = "0";
      var colorCadena = ""
      if (this.esCadena == 1) {
        if (this.esCadenaExt == 0) {


          var pos = this.getPos(this.colorCadena, parseInt(this.Tipo1_ColorCadena));
          if (pos >= 0) {
            colorCadena = this.colorCadena[pos].text;
          }
          alturaCadena = this.AlturaCadena.toString();
        }

        if (this.esCadenaExt == 1) {
          var pos = this.getPos(this.colorCadena, parseInt(this.Tipo1_ColorCadena));
          if (pos >= 0) {
            colorCadena = this.colorCadena[pos].text;
          }
          var pos = this.getPos(this.alturaCadena, parseInt(this.Tipo1_AlturaCadena));
          if (pos >= 0) {
            alturaCadena = this.alturaCadena[pos].text;
          }

        }

        if (this.esCadenaExt == 2) {
          var pos = this.getPos(this.alturaCadenaM, parseInt(this.Tipo1_AlturaCadenaM));
          if (pos >= 0) {
            alturaCadena = this.alturaCadenaM[pos].text;
          }
          colorCadena = "-1";

        }
      }





      strMessage = "";

      var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
      tipo.Enrollable_Add(ancho, alto, cantidad, it1, it1s, it2, it2s, it13, it13s, it3, it3s, it4, it4s, it5, it5s, it6, it6s, it7, it7s, it8, it8s, it9, it9s, it10, it10s, it11, it11s, it12, it12s,
        alturaCadena, colorCadena, this.esCadenaExt, it28, it28s, this.ID_Quiero, this.ID_Imagen, it31, it31s, this.Tipo1_Estancia, this.Tipo1_Estancia_Obs, this.precios);

      this.Cesta.push(tipo);
      this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
      this.ApplyLab();
    }
    else {
      this.toaster.error(strMessage, 'ERROR');
    }
  }

  T2Add() {

    var iProceed: number = 1;
    var strMessage: string = "";


    if (this.PJ_Cantidad_1 == "") {
      iProceed = 0;
      strMessage = "Debe Seleccionar la Cantidad";
    }

    if (this.PJ_Ancho_2 == "" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Ancho del Mecanismo";
      var control = $('#pj_ancho_2');
      if (control != null) {

      }
    }

    if (this.PJ_Alto_1 == "" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Alto";
    }

    if (this.PJ_NumeroVias_2 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el número de vias";
    }

    if (this.PJ_NumeroPortatelas.toString() == "" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el número de portatelas";
    }

    if (this.PJ_Ancho_1 == "" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Ancho del Portatela";
    }



    if (this.PJ_ColorRiel_2 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el color del mecanismo";
    }

    if (this.PJ_PosicionMando_2 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la posición del mando";
    }

    if (this.PJ_TipoRecogida_2 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el tipo de recogida";
    }

    if (this.PJ_TipoSoporte_2 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el tipo de soporte";
    }

    if (this.PJ_Contrapeso_1 == "-1" && iProceed == 1 && !(this.TipoJapones == 2)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el contrapeso";
    }

    if (this.PJ_NumeroLamas.toString() == "" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el número de Lamas";
    }

    if (this.PJ_AnchoLama.toString() == "" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el ancho de Lama";
    }

    if (this.PJ_AltoLamaTerminada.toString() == "" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Alto de Lama Terminada";
    }

    if (this.PJ_ID_Quiero && iProceed == 1 && this.PJ_ID_Imagen == "") {
      iProceed = 0;
      strMessage = "Debe Indicar la Imagen para la Impresión Digital";
    }


    if (parseInt(this.Tipo2_Tejido) == -1 && iProceed == 1 && !(this.TipoJapones == 3)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tejido";
    }

    if (parseInt(this.Tipo2_TejidoColor) == -1 && iProceed == 1 && !(this.TipoJapones == 3)) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del Tejido";
    }



    if (iProceed == 1) {
      var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

      if (this.TipoJapones == 1 || this.TipoJapones == 2) {


        var it20 = parseInt(this.Tipo2_Tejido);
        var it20s = this.pj_tejidos[this.getPos(this.pj_tejidos, it20)].text;
        var it21 = parseInt(this.Tipo2_TejidoColor);
        var it21s = this.pj_tejidosC[this.getPos(this.pj_tejidosC, it21)].text;


        var it102s = "";
        var it102sc = "";
        var it103s = "";
        var it103sc = "";
        var it104s = "";
        var it104sc = "";
        var it105s = "";
        var it105sc = "";

        var it102c = parseInt(this.Tipo2_TejidoColor_2);
        var it103c = parseInt(this.Tipo2_TejidoColor_3);
        var it104c = parseInt(this.Tipo2_TejidoColor_4);
        var it105c = parseInt(this.Tipo2_TejidoColor_5);

        if (it102c > -1) {
          var it102sc = this.pj_tejidosC_2[this.getPos(this.pj_tejidosC_2, it102c)].text;
        }

        if (it103c > -1) {
          var it103sc = this.pj_tejidosC_3[this.getPos(this.pj_tejidosC_3, it103c)].text;
        }

        if (it104c > -1) {
          var it104sc = this.pj_tejidosC_4[this.getPos(this.pj_tejidosC_4, it104c)].text;
        }

        if (it105c > -1) {
          var it105sc = this.pj_tejidosC_5[this.getPos(this.pj_tejidosC_5, it105c)].text;
        }

      } else {
        var it20 = -1;
        var it20s = "";
        var it21 = -1;
        var it21s = "";

        var it102s = "-1";
        var it103s = "-1";
        var it104s = "-1";
        var it105s = "-1";

        var it102sc = "-1";
        var it103sc = "-1";
        var it104sc = "-1";
        var it105sc = "-1";
      }



      tipo.Japones_Add_T1(this.PJ_Ancho_1, this.PJ_Alto_1, this.PJ_Cantidad_1, it20, it20s, it21, it21s, this.PJ_Contrapeso_1, this.PJ_ID_Quiero, this.PJ_ID_Imagen, this.Tipo2_Estancia, this.Tipo2_Estancia_Obs,
        this.PJ_Ancho_2, this.PJ_NumeroVias_2, this.PJ_PosicionMando_2, this.PJ_TipoRecogida_2, this.PJ_ColorRiel_2, this.PJ_TipoSoporte_2, this.PJ_NumeroPortatelas, this.PJ_NumeroLamas, this.PJ_AnchoLama,
        this.PJ_AltoLamaTerminada, this.TipoJapones, Number(this.PJ_NumeroPanos),
        this.Tipo2_Tejido, this.Tipo2_TejidoColor, this.Tipo2_TejidoColor_2, this.Tipo2_TejidoColor_3,
        this.Tipo2_TejidoColor_4, this.Tipo2_TejidoColor_5,
        it102s + " " + it102sc, it103s + " " + it103sc, it104s + " " + it104sc, it105s + " " + it105sc,
        this.PJ_CombinarColores,
        this.precios);

      this.Cesta.push(tipo);
      this.toaster.success('Agregado PANEL JAPONES a Cesta', 'Cesta');
      this.ApplyLab();
    }
    else {
      this.toaster.error(strMessage, 'ERROR');
    }

  }

  T3Add() {
    var TipoVertical = this.TipoVertical;
    var sel1 = this.PV_SEL_1;
    var sel2 = this.PV_SEL_2;
    var ancho1 = this.PV_Ancho_1;
    var alto1 = this.PV_Alto_1;
    var cantidad1 = this.PV_Cantidad_1;
    var ancholama1 = this.PV_AnchoLama_1;
    var posMecanismo = this.PV_PosicionMecanismo_1;
    var colorRiel1 = this.PV_ColorRiel_1;
    var accionamiento1 = this.PV_Accionamiento_1;
    var tiposoporte1 = this.PV_TipoSoporte_1;
    var tiporecogida1 = this.PV_TipoRecogida_1;

    var it22 = parseInt(this.Tipo3_Tejido);
    var it23 = parseInt(this.Tipo3_TejidoColor1);
    var it24 = parseInt(this.Tipo3_TejidoColor2);

    var it22_2 = parseInt(this.Tipo3_Tejido_2);
    var it23_2 = parseInt(this.Tipo3_TejidoColor1_2);
    var it24_2 = parseInt(this.Tipo3_TejidoColor2_2);

    var ancho2 = this.PV_Ancho_2;
    var cantidad2 = this.PV_Cantidad_2;
    var alturamin = this.PV_AlturaMin_2;
    var alturamax = this.PV_AlturaMax_2;
    var ancholama2 = this.PV_AnchoLama_2;
    var posMecanismo2 = this.PV_PosicionMecanismo_2;
    var colorRiel2 = this.PV_ColorRiel_2;
    var accionamiento2 = this.PV_Accionamiento_2;
    var tiposoporte2 = this.PV_TipoSoporte_2;
    var tiporecogida2 = this.PV_TipoRecogida_2;

    var iProceed: number = 1;
    var strMessage: string = "";

    if (sel1) {

      if (TipoVertical == 2) {
        ancho1 = "1";
      }

      if (TipoVertical == 3) {
        alto1 = "1";
      }

      if (ancho1 == "") {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Ancho";
      }

      if (alto1 == "" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Alto";
      }

      if (cantidad1 == "" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la cantidad";
      }

      if (ancholama1 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Ancho de Lama";
      }

      if (TipoVertical == 2) {
        posMecanismo = "0";
        colorRiel1 = "0";
        accionamiento1 = "0";
        tiposoporte1 = "0";
        tiporecogida1 = "0";
      }

      if (posMecanismo == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la posición del Mecanismo";
      }

      if (colorRiel1 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el color del riel";
      }

      if (accionamiento1 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Accionamiento";
      }

      if (tiposoporte1 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el tipo de soporte";
      }

      if (tiporecogida1 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el tipo de recogida";
      }

      if (TipoVertical == 3) {
        it22 = 0;
        it23 = 0;
        it24 = 0;
      }

      if (it22 == -1 && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Tipo de Tejido";
      }

      if (it23 == -1 && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Color 1 del Tejido";
      }

      if (it24 == -1 && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Color 2 del Tejido";
      }

    }

    if (sel2) {

      if (ancho2 == "") {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Ancho";
      }

      if (cantidad2 == "" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la Cantidad";
      }

      if (alturamin == "" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la altura mínima";
      }

      if (alturamax == "" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la altura máxima";
      }

      if (ancholama2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Ancho de Lama";
      }

      if (posMecanismo2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar la posición del Mecanismo";
      }

      if (colorRiel2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el color del riel";
      }

      if (accionamiento2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el Accionamiento";
      }

      if (tiposoporte2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el tipo de soporte";
      }

      if (tiporecogida2 == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Seleccionar el tipo de recogida";
      }
    }

    if (iProceed == 1) {
      var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);


      if (sel1) {
        var pos = this.getPos(this.pv_tejidos_1, it22);
        var it22s = "";

        if (pos >= 0)
          it22s = this.pv_tejidos_1[pos].text;

        pos = this.getPos(this.pv_tejidosC_1, it23);
        var it23s = "";
        if (pos >= 0)
          it23s = this.pv_tejidosC_1[pos].text;

        pos = this.getPos(this.pv_tejidosC_2, it24);
        var it24s = "";
        if (pos >= 0)
          it24s = this.pv_tejidosC_2[pos].text;

        tipo.Vertical_Add_T1(ancho1, alto1, cantidad1, ancholama1, posMecanismo, colorRiel1, accionamiento1, tiposoporte1, tiporecogida1, it22, it22s, it23, it23s, it24, it24s, this.Tipo3_Estancia, this.Tipo3_Estancia_Obs, TipoVertical, this.precios);
      }

      if (sel2) {
        tipo.Vertical_Add_T2(ancho2, cantidad2, alturamin, alturamax, ancholama2, posMecanismo2, colorRiel2, accionamiento2, tiposoporte2, tiporecogida2, this.Tipo31_Estancia, this.Tipo31_Estancia_Obs, this.precios);
      }


      this.Cesta.push(tipo);
      this.toaster.success('Agregado PANEL VERTICAL a Cesta', 'Cesta');
      this.ApplyLab();
    }
    else {
      this.toaster.error(strMessage, 'ERROR');
    }
  }

  T4Add() {
    if (this.Ancho == "") {
      this.Ancho = "0";
    }

    if (this.Alto == "") {
      this.Alto = "0";
    }

    var junc = this.compac.PC_TipoJunquillo;
    var ancho1 = this.Ancho;
    var ancho2 = this.compac.PC_AnchoB;
    var alto = this.Alto;
    var cantidad = this.Cantidad;


    var it7 = parseInt(this.Tipo4_Tejido);
    var it8 = parseInt(this.Tipo4_TejidoColor);
    var it9 = parseInt(this.Tipo4_TejidoSalida);

    var iProceed: number = 1;
    var strMessage: string = "";

    if (junc == "-1") {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Junquillo";
    }


    if (ancho1 == "0" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Indicar el Ancho";
    }

    if (alto == "0" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Indicar el Alto";
    }

    if (cantidad == "0" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Indicar la Cantidad";
    }

    if ((junc == "JB" || junc == "JR") && iProceed == 1) {

      if (ancho2 == "0") {
        iProceed = 0;
        strMessage = "Debe Indicar el Ancho Mayor del Bisel";
      }

    }

    if (this.compac.Compac_Acc_Posicion == "-1" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la Posición del Accionamiento";
    }



    if (this.esCadena && iProceed == 1) {

      if (this.esCadenaExt == 0 && this.AlturaCadena == 0) {
        iProceed = 0;
        strMessage = "Debe Indicar la Altura de la Cadena";
      }

      if (this.compac.Compac_Acc_Cad_Color == "-1" && iProceed == 1) {
        iProceed = 0;
        strMessage = "Debe Indicar el color de la Cadena";
      }

      if (this.esCadenaExt == 1) {

        if (this.compac.Compac_Acc_Cad_Altura == "-1" && iProceed == 1) {
          iProceed = 0;
          strMessage = "Debe Indicar la altura de la Cadena";
        }

      }
    }


    if (this.compac.Compac_Sop_Color == "-1" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del Soporte";
    }

    if (this.compac.Compac_Tap_Color == "-1" && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color de las Tapas";
    }

    if (it7 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Tipo de Tejido";
    }

    if (it8 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar el Color del Tejido";
    }

    if (it9 == -1 && iProceed == 1) {
      iProceed = 0;
      strMessage = "Debe Seleccionar la salida del Tejido";
    }

    if (this.CheckValidity(null)) {
      if (iProceed == 1) {
        strMessage = "";
        var pos = 0;

        var it7s = "";
        var pos = this.getPos(this.tejidos_compac, it7);
        if (pos >= 0)
          it7s = this.tejidos_compac[pos].text;

        pos = this.getPos(this.tejidos_compac_colores, it8);
        var it8s = "";
        if (pos >= 0)
          it8s = this.tejidos_compac_colores[pos].text;

        pos = this.getPos(this.tejidosS, it9);
        var it9s = "";
        if (pos >= 0)
          it9s = this.tejidosS[pos].text;

        var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
        tipo.Compac_Add(junc, ancho1, ancho2, alto, cantidad, "COM", "COMPAC", "COM", "COMPAC", this.compac.Compac_Acc_Color, this.compac.Compac_Acc_Color,
          this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Posicion, this.compac.Compac_Acc_Posicion, "COM", "COMPAC",
          this.compac.Compac_Sop_Color, this.compac.Compac_Sop_Color, "COM", "COMPAC",
          this.compac.Compac_Tap_Color, this.compac.Compac_Tap_Color, it7, it7s, it8, it8s, it9, it9s,
          this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Color, this.compac.Compac_Acc_Cad_Color,
          this.AlturaCadena.toString(), this.esCadenaExt.toString(), this.Tipo4_Estancia, this.Tipo4_Estancia_Obs, this.precios
        );

        this.Cesta.push(tipo);
        this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
        this.ApplyLab();
      }
      else {
        this.toaster.error(strMessage, 'ERROR')
      }
    }

  }

  ChangeTipo1Color() {
    var color = this.Tipo1_Color;
    if (this.esCadena == 1) {
      this.Tipo1_TapaC = color;
      this.Tipo1_SoporteC = color;
    }

  }

  ChangeTipo1Tejido(value?: string) {
    this.CodigoProv = "";
    var tejido = this.Tipo1_Tejido;
    var impresion = this.ID_Quiero;

    if (impresion == true) {
      this.load_TejidosColoresID(parseInt(tejido));
    }
    else {
      this.load_TejidosColores(parseInt(tejido));
    }

    this.CalculateFechaPrevista("1", "1", tejido);

    var pos = this.getPos(this.tejidos, tejido);
    if (pos >= 0) {
      this.CodigoProv = this.tejidos[pos].codigoprov;
    }

  }

  ChangeTipo2Tejido() {

    var tejido = this.Tipo2_Tejido;
    var impresion = this.PJ_ID_Quiero;

    if (impresion == true) {
      this.load_TejidosColoresPJID(parseInt(tejido));
    }
    else {
      this.load_TejidosColoresPJ(parseInt(tejido));
    }

    this.CalculateFechaPrevista("1", "2", tejido);

    var pos2 = this.getPos(this.pj_tejidos, tejido);
    if (pos2 >= 0) {
      this.CodigoProv2 = this.pj_tejidos[pos2].codigoprov;
    }
  }

  ChangeTipo2SinTejido() {
    this.CalculateFechaPrevista("1", "2", "-1");
  }

  ChangeTipo3Tejido() {
    this.CodigoProv31 = "";
    var tejido = this.Tipo3_Tejido;
    this.load_TejidosColoresPV(parseInt(tejido));

    this.CalculateFechaPrevista("1", "3", tejido);

    var pos = this.getPos(this.pv_tejidos_1, tejido);
    if (pos >= 0) {
      this.CodigoProv31 = this.pv_tejidos_1[pos].codigoprov;
    }
  }

  ChangeTipo3Tejido_2() {
    this.CodigoProv32 = "";
    var tejido = this.Tipo3_Tejido_2;
    this.load_TejidosColoresPV(parseInt(tejido));

    this.CalculateFechaPrevista("1", "3", tejido);

    var pos = this.getPos(this.pv_tejidos_2, tejido);
    if (pos >= 0) {
      this.CodigoProv32 = this.pv_tejidos_2[pos].codigoprov;
    }
  }

  ChangeTipo4Tejido() {
    this.CodigoProv4 = "";
    var tejido = this.Tipo4_Tejido;
    this.load_TejidosColoresCompac(parseInt(tejido));
    this.CalculateFechaPrevista("1", "4", tejido);

    var pos = this.getPos(this.tejidos_compac, tejido);
    if (pos >= 0) {
      this.CodigoProv4 = this.tejidos_compac[pos].codigoprov;
    }
  }

  ChangeTipo1Soporte() {
    var soporte = this.Tipo1_Soporte;
    this.load_SoportesColores(parseInt(soporte));
  }

  ChangeTipo1SoporteColor() {
    this.Tipo1_TapaC = this.Tipo1_SoporteC;
  }

  ChangeTipo1Tapa() {
    var tapa = this.Tipo1_Tapa;
    this.load_TapasColores(parseInt(tapa));
  }

  Tarifa_Contrapeso() {
    if (this.TipoCortina == 1) {
      var cantidad = Number(this.Cantidad);
      var contrapeso = this.Tipo1_Contrapeso;
      var ancho = this.Ancho;
      if (ancho != "" && contrapeso != "-1") {
        this.service.getTarifaContrapeso(contrapeso, ancho).subscribe(
          data => {
            if (data.message == "OK") {
              var precio = data.v1;
              var c1 = data.v2;

              if (precio > 0) {
                this.Tipo1_Contrapeso_Label = "Tipo:(+" + precio + "€)" + c1;
                this.precios.T1_Inc_Contrapeso = cantidad * precio;
                this.precios.T1_Inc_Contrapeso_C1 = c1;

                if (cantidad > 1) {
                  this.service.getMultiply(c1, cantidad).subscribe(
                    data => {
                      this.precios.T1_Inc_Contrapeso_C1 = data[0].res;
                    },
                    error => {
                      this.precios.T1_Inc_Contrapeso_C1 = '';
                    }
                  );
                }

              } else {
                this.Tipo1_Contrapeso_Label = "Tipo:";
                this.precios.T1_Inc_Contrapeso = 0;
                this.precios.T1_Inc_Contrapeso_C1 = '';
              }
            }
          },
          error => {

          }
        );
      }
    } else {
      this.Tipo1_Contrapeso_Label = "Tipo:";
    }
  }

  Tarifa_AlturaCadena() {
    if (this.esCadena == 1 && this.esCadenaExt == 2) {
      var altura = this.Tipo1_AlturaCadenaM;
      var cantidad = Number(this.Cantidad);

      this.service.getTarifaAlturaCadena('1', '1', altura).subscribe(
        data => {
          if (data.message == "OK") {
            var precio = data.v1;
            var c1 = data.v2;

            if (precio > 0) {
              this.Tipo1_Cadena_Label = "Altura:(+" + precio + "€)" + c1;

              this.precios.T1_Inc_CadenaMetalica = cantidad * precio;
              this.precios.T1_Inc_CadenaMetalica_C1 = c1;
              if (cantidad > 1) {
                this.service.getMultiply(c1, cantidad).subscribe(
                  data => {
                    this.precios.T1_Inc_CadenaMetalica_C1 = data[0].res;
                  },
                  error => {
                    this.precios.T1_Inc_CadenaMetalica_C1 = '';
                  });

              }
            } else {
              this.Tipo1_Cadena_Label = "Altura:";
              this.precios.T1_Inc_CadenaMetalica = 0;
              this.precios.T1_Inc_CadenaMetalica_C1 = "";
            }
          }
        },
        error => {

        });

    }
  }

  tarifaCadena() {
    this.Tarifa_AlturaCadena();
  }


  ChangeTipo1Contrapeso() {
    var contrapeso = this.Tipo1_Contrapeso;


    this.load_ContrapesosColores(parseInt(contrapeso));

    this.Tarifa_Contrapeso();

  }

  Vertical_Angle() {
    var hmax = this.PV_AlturaMax_2;
    var hmin = this.PV_AlturaMin_2;
    var x = this.PV_Ancho_2;
    this.ArcTangent(hmax, hmin, x);
  }

  ArcTangent(hmax, hmin, x) {
    var angleRad = Math.atan((hmax - hmin) / x);
    var angleDeg = angleRad * 180 / Math.PI;

    var sqrt = Math.sqrt((hmax - hmin) * (hmax - hmin) + (x * x))

    if (angleDeg > 30) {
      this.toaster.error('No puede Fabricarse la vertical con las medidas indicadas', 'ERROR');
    }
  }

  Tarifa_Mecanismo_Vertical_SoloTejido(ancholama: string, tejido: string, alto: string, lamas: string) {
    this.service.getTarifaVerticalST(ancholama, tejido, alto, lamas).subscribe(
      data => {
        if (data.message == "OK") {
          this.Tipo3_PrecioMecanismo = 0;
          this.precios.T3_Tejido = data.v1;
          this.precios.T3_Tejido_C1 = data.v2;
          this.CalculateC1_Tipo3();
        }
        else {
          this.Tipo3_PrecioMecanismo = 0;
        }
      },
      error => {

      }
    );
  }

  Tarifa_Mecanismo_Vertical_SoloRiel(cantidad: number, ancho: number, ancholama: string) {

    this.service.getTarifaMecanismoVertical(cantidad, ancholama, ancho).subscribe(
      data => {

        if (data.message == "OK") {

          this.Tipo3_PrecioMecanismo = data.v1;
          this.precios.T3_Tejido = this.Tipo3_PrecioMecanismo;
          this.precios.T3_Tejido_C1 = data.v2;
          this.CalculateC1_Tipo3();
        }
        else {
          this.Tipo3_PrecioMecanismo = 0;
        }
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    )
  }

  Tarifa_Mecanismo_Vertical(pvp: number, ancholama: string) {
    //var lamas = parseInt(this.PV_Cantidad_1);
    var total = parseInt(this.PV_Cantidad_1);
    var lamas = 1;
    var ancho = 0;

    if (ancholama == "089") {
      ancho = lamas * 7.90;
    }
    if (ancholama == "127") {
      ancho = lamas * 117.00;
    }

    this.service.getTarifaMecanismoVertical(1, ancholama, ancho).subscribe(
      data => {
        if (data.message == "OK") {
          this.Tipo3_PrecioMecanismo = data.v1;

          pvp = pvp - this.Tipo3_PrecioMecanismo;
          this.precios.T3_Tejido = total * pvp;
        }
        else {
          this.Tipo3_PrecioMecanismo = 0;
          pvp = 0;
        }
        return pvp;
      },
      error => {
        this.toaster.error(JSON.stringify(error));
      }
    )
    return 0;
  }

  Tarifa_Vertical_Soporte() {
    this.precios.T3_TipoSoporte = 0;
    this.precios.T3_NumSoportes = 0;
    this.Tipo3_TipoSoporte_Label = "Tipo de Soporte";

    if (this.PV_TipoSoporte_1 != "-1") {
      var soporte = this.PV_TipoSoporte_1;
      var cliente = "1";
      var ancho = this.PV_Ancho_1;
      var sancho = "0";

      var soportes = 0;

      if (soporte == "P08") {
        sancho = "80";
      }

      if (soporte == "P12") {
        sancho = "120";
      }

      if (soporte == "P15") {
        sancho = "150";
      }

      soportes = Number(ancho) / 50.0;
      soportes = Math.round(soportes);

      var cantidad = this.precios.T3_Cantidad;
      soportes = cantidad * soportes;

      this.precios.T3_TipoSoporte = 0;
      this.precios.T3_NumSoportes = 0;

      if (soporte == "TEC") {
        this.precios.T3_TipoSoporte_C1 = 'C1 0000000';
      }

      if (sancho != "0") {

        this.service.getTarifaAccesorio("1", sancho, soportes).subscribe(
          data => {


            if (data.message == "OK") {
              this.Tipo3_TipoSoporte_Label = "Tipo de Soporte: (" + soportes.toString() + " x " + data.v1 + "€)";
              this.precios.T3_NumSoportes = soportes;
              this.precios.T3_TipoSoporte = data.v1;
              this.precios.T3_TipoSoporte_C1 = data.v2;
            } else {
              this.Tipo3_TipoSoporte_Label = "Tipo de Soporte";
              this.precios.T3_TipoSoporte = 0;
              this.precios.T3_NumSoportes = 0;
              this.precios.T3_TipoSoporte_C1 = 'C1 0000000';
            }

            this.CalculateC1_Tipo3();
          },
          error => {

          }
        );
      }
      else {
        this.Tipo3_TipoSoporte_Label = "Tipo de Soporte";
        this.precios.T3_TipoSoporte = 0;
        this.precios.T3_NumSoportes = 0;
      }
    }
  }

  Tarifa_VerticalInclinada_Soporte() {
    this.precios.T32_TipoSoporte = 0;
    this.precios.T32_NumSoportes = 0;
    this.Tipo32_TipoSoporte_Label = "Tipo de Soporte";

    if (this.PV_TipoSoporte_2 != "-1") {
      var soporte = this.PV_TipoSoporte_2;
      var cliente = "1";
      var ancho = this.PV_Ancho_2;
      var sancho = "0";

      var soportes = 0;

      if (soporte == "P08") {
        sancho = "80";
      }

      if (soporte == "P12") {
        sancho = "120";
      }

      if (soporte == "P15") {
        sancho = "150";
      }

      soportes = Number(ancho) / 50.0;
      soportes = Math.round(soportes);

      var cantidad = this.precios.T32_Cantidad;
      soportes = cantidad * soportes;

      this.precios.T32_TipoSoporte = 0;
      this.precios.T32_NumSoportes = 0;
      if (sancho != "0") {

        this.service.getTarifaAccesorio("1", sancho, soportes).subscribe(
          data => {
            if (data.message == "OK") {
              this.Tipo32_TipoSoporte_Label = "Tipo de Soporte: (" + soportes.toString() + " x " + data.v1 + "€)";
              this.precios.T32_NumSoportes = soportes;
              this.precios.T32_TipoSoporte = data.v1;
              this.precios.T32_TipoSoporte_C1 = data.v2;
            } else {
              this.Tipo32_TipoSoporte_Label = "Tipo de Soporte";
              this.precios.T32_TipoSoporte = 0;
              this.precios.T32_NumSoportes = 0;
              this.precios.T32_TipoSoporte_C1 = '';
            }
          },
          error => {

          }
        );
      }
      else {
        this.Tipo32_TipoSoporte_Label = "Tipo de Soporte";
        this.precios.T32_TipoSoporte = 0;
        this.precios.T32_NumSoportes = 0;
      }
    }
  }

  Tarifa_Japones_Soporte() {
    this.precios.T2_TipoSoporte = 0;
    this.precios.T2_NumSoportes = 0;
    this.Tipo2_TipoSoporte_Label = "Tipo de Soporte";

    if (this.PJ_TipoSoporte_2 != "-1") {
      var cantidad = this.PJ_Cantidad_1;
      var soporte = this.PJ_TipoSoporte_2;
      var cliente = "1";
      var ancho = this.PJ_Ancho_2;
      var sancho = "0";
      var soportes = 0;

      if (soporte == "P06") {
        sancho = "60";
      }

      if (soporte == "P12") {
        sancho = "120";
      }

      if (soporte == "P15") {
        sancho = "150";
      }

      soportes = Number(ancho) / 50.0;
      soportes = Math.round(soportes);
      //soportes = soportes*Number(cantidad);

      if (sancho != "0") {

        this.service.getTarifaAccesorio("1", sancho, soportes * Number(cantidad)).subscribe(
          data => {

            if (data.message == "OK") {
              this.Tipo2_TipoSoporte_Label = "Tipo de Soporte: (" + soportes.toString() + " x " + data.v1 + "€)";
              this.precios.T2_NumSoportes = soportes;
              this.precios.T2_TipoSoporte = Number(cantidad) * data.v1;
              this.precios.T2_TipoSoporte_C1 = data.v2;
            }
            else {
              this.Tipo2_TipoSoporte_Label = "Tipo de Soporte";
              this.precios.T2_TipoSoporte = 0;
              this.precios.T2_NumSoportes = 0;
              this.precios.T2_TipoSoporte_C1 = '';
            }
          },
          error => {

          }
        );
      }
      else {
        this.Tipo2_TipoSoporte_Label = "Tipo de Soporte";
        this.precios.T2_TipoSoporte = 0;
        this.precios.T2_NumSoportes = 0;
      }
    }
  }

  Tarifa_Japones_Mecanismo() {
    if (this.PJ_NumeroVias_2 != "-1") {
      var vias = this.PJ_NumeroVias_2;
      var cliente = "1";
      var ancho = this.PJ_Ancho_2;

      var oper = (Number(ancho) / Number(vias)) + 5;
      oper = Math.ceil(oper * 20) / 20;

      this.PJ_Ancho_1 = oper.toFixed(2);
      this.PJ_AnchoLama = oper;
      this.PJ_AltoLamaTerminada = Number(this.PJ_Alto_1) - 2.5;
      this.PJ_NumeroPortatelas = Number(vias);
      this.PJ_NumeroLamas = this.PJ_NumeroPortatelas;

      var cantidad = Number(this.PJ_Cantidad_1);

      this.Tipo2_NumeroVias_Label = "Número Vias:";

      if (vias != "-1" && ancho != "") {
        this.service.getTarifaPanelJapones(vias, cliente, ancho, cantidad).subscribe(
          data => {

            if (data.message == "OK") {
              this.Tipo2_NumeroVias_Label = "Número Vias: (+" + data.v1 + "€)";
              this.precios.T2_NumeroVias = Number(this.PJ_Cantidad_1) * data.v1;
              this.precios.T2_NumeroVias_C1 = data.v2;
            } else {
              this.precios.T2_NumeroVias = 0;
              this.precios.T2_NumeroVias_C1 = "";
            }


            this.CheckPrice();
          },
          error => {
            this.toaster.error(JSON.stringify(error));
          }
        );
      }
    }
  }

  Vertical_TejidosCombinados() {

    if (this.PV_SEL_1) {
      var cantidad = this.precios.T3_Cantidad
      var color1 = this.Tipo3_TejidoColor1;
      var color2 = this.Tipo3_TejidoColor2;

      if (color1 != color2) {
        this.Tipo3_Incremento_Tejidos = "+ 20.51€ (C1 0001052)"
        this.precios.T3_TejidosCombinados = 20.51;
        this.precios.T3_TejidosCombinados_C1 = "C1 0001052";

        if (cantidad == 2) this.precios.T3_TejidosCombinados_C1 = "C1 0002104";
        if (cantidad == 3) this.precios.T3_TejidosCombinados_C1 = "C1 0003156";
        if (cantidad == 4) this.precios.T3_TejidosCombinados_C1 = "C1 0004208";
        if (cantidad == 5) this.precios.T3_TejidosCombinados_C1 = "C1 0005260";
        if (cantidad == 6) this.precios.T3_TejidosCombinados_C1 = "C1 0006312";

      }
      else {
        this.Tipo3_Incremento_Tejidos = "";
        this.precios.T3_TejidosCombinados = 0;
        this.precios.T3_TejidosCombinados_C1 = "";
      }

    }
    if (this.PV_SEL_2) {
      var color1 = this.Tipo3_TejidoColor1_2;
      var color2 = this.Tipo3_TejidoColor2_2;

      if (color1 != color2) {
        this.Tipo32_Incremento_Tejidos = "+ 82.09€ (C1 0004210)"
        this.precios.T32_TejidosCombinados = 82.09;
        this.precios.T32_TejidosCombinados_C1 = "C1 0004210";
      }
      else {
        this.Tipo32_Incremento_Tejidos = "";
        this.precios.T32_TejidosCombinados = 0;
        this.precios.T32_TejidosCombinados_C1 = "";
      }
    }

    this.CalculateC1_Tipo3();

  }

  ChangeRadioMando() {
    var radio = this.Tipo1_Mando;
    var cantidad = Number(this.Cantidad);

    var pos = this.getPos(this.radiomando, radio);
    if (pos >= 0) {
      var precio = this.radiomando[pos].precio;
      var c1 = this.radiomando[pos].c1;

      if (precio > 0) {
        this.Tipo1_RadioMando_Label = "Mando:(+" + precio + "€)";
        this.precios.T1_Inc_Mando = cantidad * precio;
        this.precios.T1_Inc_Mando_C1 = c1;

        if (cantidad > 1) {
          this.service.getMultiply(c1, cantidad).subscribe(
            data => {
              this.precios.T1_Inc_Mando_C1 = data[0].res;
            },
            error => {
              this.toaster.error(JSON.stringify(error));
            }
          );
        }

      }

      if (precio < 0) {
        this.Tipo1_RadioMando_Label = "Mando:(" + precio + "€)";
        this.precios.T1_Inc_Mando = cantidad * precio;
      }

      if (precio == 0) {
        this.Tipo1_RadioMando_Label = "Mando:";
        this.precios.T1_Inc_Mando = 0;
        this.precios.T1_Inc_Mando_C1 = "";
      }
    }

  }

  ChangeAccionamiento() {

    this.precios.T1_Inc_Mando = 0;
    var accionamiento = this.Tipo1_Tipo;
    var acctext = this.items1[this.getPos(this.items1, accionamiento)].text;

    if (acctext == "Cadena") {
      this.esCadena = 1;
    }
    else {
      this.esCadena = 0;
    }
    this.Tipo1_Marca = "-1";
    this.Tipo1_Mando = "-1";

    this.load_TipoAccionamientos(parseInt(accionamiento));
    this.ChangeValue(this.Ancho);
  }

  AssignMandos(accionamientom) {

    this.radiomando = [];

    this.radiomando_lista.forEach(
      (item: { id: number, text: string, precio: number, c1: string }) => {

        if (accionamientom == '13') {
          if (item.id == 3 || item.id == 4) {
            if (item.id == 3) {
              item.precio = 0;
            }

            if (item.id == 4) {
              item.precio = -21.70;
              item.c1 = 'C10001113';
            }

            this.radiomando.push({ id: item.id, text: item.text, precio: item.precio, c1: item.c1 });
          }
        }
        else {
          this.radiomando.push(item);
        }
      }
    );

  }

  ChangeAccionamientoMarca() {
    this.precios.T1_Inc_Mando = 0;
    var accionamiento = this.Tipo1_Tipo;
    var accionamientom = this.Tipo1_Marca;
    this.load_ColorAccionamientos(parseInt(accionamiento), parseInt(accionamientom));

    this.Tipo1_RadioMando_Label = "Mando:";
    if (accionamientom == '6' || accionamientom == '8' || accionamientom == '13') {
      this.verMando = true;

      this.AssignMandos(accionamientom);
      if (accionamientom == '13') {
        this.Tipo1_Mando = "3";
        this.Tipo1_RadioMando_Disabled = false;
      } else {
        ///Asigne tots els radiomandos
        this.Tipo1_Mando = '-1';
        this.Tipo1_RadioMando_Disabled = false;
      }
    }
    else {
      this.verMando = false;
    }


    this.ChangeValue(this.Ancho);
  }

  ChangeAccionamientoColor() {
    var color = this.Tipo1_Color;

    this.Tipo1_SoporteC = color;
    this.Tipo1_TapaC = color;
    this.Tipo1_ColorCadena = color;

  }

  ChangeColorCompac() {
    this.compac.Compac_Sop_Color = this.compac.Compac_Acc_Color;
    this.compac.Compac_Tap_Color = this.compac.Compac_Acc_Color;
    this.compac.Compac_Acc_Cad_Color = this.compac.Compac_Acc_Color;
  }

  CheckAnchoMax() {

    if (this.TipoCortina == 1) {
      if (this.Tipo1_AnchoMaximo > 100) {
        if (parseInt(this.Ancho) > this.Tipo1_AnchoMaximo) {
          this.Ancho = this.Tipo1_AnchoMaximo.toString();

          var message = 'No puede introducir un ancho superior al ancho máximo de ' + this.Tipo1_AnchoMaximo.toString();
          this.toaster.warning(message, 'ATENCION');
        }
      }

      if (parseInt(this.Ancho) < 30) {
        var message = 'No puede introducir un ANCHO inferior al ancho mínimo de 30 cm';
        this.Ancho = "100";
        this.toaster.warning(message, 'ATENCION');
      }

      if (parseInt(this.Alto) < 30) {
        var message = 'No puede introducir un ALTO inferior al ancho mínimo de 30 cm';
        this.Alto = "100";
        this.toaster.warning(message, 'ATENCION');
      }
    }

  }

  CheckPrice() {

    this.CheckAnchoMax();

    var ancho = '0';
    var alto = '0';
    var pvp_cantidad = 0;
    var pvp = 0;
    var code_c1 = '';

    if (this.Ancho == null) this.Ancho = "";
    if (this.Alto == null) this.Alto = "";
    if (this.PJ_Ancho_1 == null) this.PJ_Ancho_1 = "";
    if (this.PJ_Alto_1 == null) this.PJ_Alto_1 = "150";
    if (this.PV_Ancho_1 == null) this.PV_Ancho_1 = "";
    if (this.PV_Alto_1 == null) this.PV_Alto_1 = "";

    var calculate = 0;
    var cliente = "1";
    var tubo = this.Tipo1_Tubo;
    var tejido = this.Tipo1_Tejido;
    var marca = this.Tipo1_Marca;
    var producto = this.TipoCortina.toString();
    var subproducto = "1";
    var ancholama = "-1";
    var nancho = 0;
    var impresion = "0";

    /* TIPO 1 */
    if (this.TipoCortina == 1) {
      var ancho = this.Ancho;
      var alto = this.Alto;
    }

    if (this.TipoCortina == 1 && this.ID_Quiero) {
      impresion = "1";
    }

    if (this.TipoCortina == 1 && tubo != "-1" && tejido != "-1" && marca != "-1" && ancho != "" && alto != "") {
      pvp_cantidad = parseInt(this.Cantidad);
      calculate = 1;
    }


    /* TIPO 2 */
    if (this.TipoCortina == 2) {
      var ancho = this.PJ_AnchoLama.toString();
      ancholama = ancho;
      var alto = this.PJ_AltoLamaTerminada.toString();
      var tejido = this.Tipo2_Tejido;
    }

    if (this.TipoCortina == 2 && this.PJ_ID_Quiero) {
      impresion = "0";
    }

    if (this.TipoCortina == 2 && tejido != "-1") {
      var cantidad = Number(this.PJ_Cantidad_1);
      pvp_cantidad = cantidad * this.PJ_NumeroLamas;
      calculate = 1;
    }

    if (this.TipoCortina == 2 && this.TipoJapones == 3) {
      this.precios.T2_Tejido = 0;
      this.precios.T2_Tejido_C1 = "";
      this.ChangeTipo2SinTejido();
      calculate = 0;
    }

    /* TIPO 3 */
    if (this.TipoCortina == 3) {
      if (this.PV_SEL_1) {
        var ancho = this.PV_Ancho_1;
        var alto = this.PV_Alto_1;
        var tejido = this.Tipo3_Tejido;
        ancholama = this.PV_AnchoLama_1;
      }
      else {
        var ancho = this.PV_Ancho_2;
        var alto = this.PV_AlturaMax_2;
        var tejido = this.Tipo3_Tejido_2;
        ancholama = this.PV_AnchoLama_2;
        subproducto = "2";
      }
    }


    if (this.TipoCortina == 3 && this.TipoVertical == 2 && ancholama != "-1") {
      var alto = this.PV_Alto_1;
      var tejido = this.Tipo3_Tejido;
      ancholama = this.PV_AnchoLama_1;
      var lamas = this.PV_Cantidad_1;
      this.Tarifa_Mecanismo_Vertical_SoloTejido(ancholama, tejido, alto, lamas);
      calculate = 0;
    }

    if (this.TipoCortina == 3 && this.TipoVertical == 3 && ancholama != "-1") {
      var cantidad = Number(this.PV_Cantidad_1);
      var ancho = this.PV_Ancho_1;
      this.Tarifa_Mecanismo_Vertical_SoloRiel(cantidad, Number(ancho), ancholama);
      calculate = 0;
    }

    if (this.TipoCortina == 3 && tejido != "-1" && ancholama != "-1" && this.TipoVertical == 1) {
      if (this.PV_SEL_1) {
        if (this.TipoVertical == 1) {
          pvp_cantidad = parseInt(this.PV_Cantidad_1);
        }
      }
      else {
        pvp_cantidad = parseInt(this.PV_Cantidad_2);
      }
      calculate = 1;
    }

    /* TIPO 4 */
    if (this.TipoCortina == 4) {
      var ancho = this.Ancho;
      var alto = this.Alto;
      var tejido = this.Tipo4_Tejido;
      var marca = this.Tipo4_TejidoColor;
    }


    if (this.TipoCortina == 4 && tejido != "-1") {
      pvp_cantidad = parseInt(this.Cantidad);
      calculate = 1;
    }



    if (calculate == 1) {


      this.service.getTarifa(cliente, tubo, tejido, marca, ancho, alto, impresion, ancholama, producto, this.codeCentro, pvp_cantidad, subproducto).subscribe(
        data => {

          if (data.message == "OK") {
            pvp = data.v1;
            code_c1 = data.v2;

          }
          else {
            pvp = 0;
            code_c1 = "";
          }

          /* A la Tarifa li sume els complements */

          if (this.TipoCortina == 1) {
            this.precios.T1_Cantidad = pvp_cantidad;
            this.precios.T1_Tejido = pvp_cantidad * pvp;
            this.precios.T1_Tejido_C1 = code_c1;
            this.Recalcular_Tipo1();
          }

          if (this.TipoCortina == 2) {
            var lamas = this.PJ_NumeroLamas;
            this.precios.T2_Cantidad = parseInt(this.PJ_Cantidad_1);
            this.precios.T2_Tejido = Number(this.PJ_Cantidad_1) * lamas * pvp;
            this.precios.T2_Tejido_C1 = code_c1;
            this.Recalcular_Tipo2();
          }

          if (this.TipoCortina == 3) {
            if (this.PV_SEL_1) {
              if (this.TipoVertical == 2) {
                this.Tarifa_Mecanismo_Vertical(pvp, ancholama);
                this.precios.T3_Tejido_C1 = code_c1;

              }

              if (this.TipoVertical == 1) {
                this.precios.T3_Cantidad = pvp_cantidad;
                this.precios.T3_Tejido = pvp;
                this.precios.T3_Tejido_C1 = code_c1;
              }
              this.Recalcular_Tipo3();
            }

            if (this.PV_SEL_2) {
              this.precios.T32_Cantidad = pvp_cantidad;
              this.precios.T32_Tejido = pvp;
              this.precios.T32_Tejido_C1 = code_c1;
              this.CalculateC1_Tipo3();
            }
          }

          if (this.TipoCortina == 4) {
            this.precios.T4_Cantidad = pvp_cantidad;
            this.precios.T4_Tejido = pvp;
            this.precios.T4_Tejido_C1 = code_c1;
            this.CalculateC1_Tipo4();
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        });


    }
  }
  SelectVertical(value) {
    this.Vertical_TejidosCombinados();

    if (value == 1) {
      this.PV_SEL_2 = false;
      this.PV_SEL_1 = true;
    } else {
      this.PV_SEL_2 = true;
      this.PV_SEL_1 = false;
    }
  }
  Change_Compac_Accionamiento() {
    this.Tipo4_Accionamiento_Label = "Accionamiento";

    if (this.PV_Accionamiento_1 == "MSM") {
      this.Tipo4_Accionamiento_Label += "(+387.00€)";
    }

    if (this.PV_Accionamiento_1 == "MM1") {
      this.Tipo4_Accionamiento_Label += "(+449.00€)";
    }

    if (this.PV_Accionamiento_1 == "MM6") {
      this.Tipo4_Accionamiento_Label += "(+462.00€)";
    }
  }

  Change_Compac_Accionamiento_2() {
    this.Tipo4_Accionamiento_Label_2 = "Accionamiento";

    if (this.PV_Accionamiento_2 == "MSM") {
      this.Tipo4_Accionamiento_Label_2 += "(+387.00€)";
    }

    if (this.PV_Accionamiento_2 == "MM1") {
      this.Tipo4_Accionamiento_Label_2 += "(+449.00€)";
    }

    if (this.PV_Accionamiento_2 == "MM6") {
      this.Tipo4_Accionamiento_Label_2 += "(+462.00€)";
    }
  }

  CheckValidity(control: any) {

    this.alertShow = false;
    this.alertMsg = "";
    var strMessage = "";
    var bretValue = true;

    var ancho = 0;
    var alto = 0;
    var minancho = 0;
    var maxancho = 0;
    var minalto = 0;
    var maxalto = 0;

    if (this.TipoCortina == 1) {

      if (this.Ancho == "") this.Ancho = "";
      if (this.Alto == "") this.Alto = "";

      ancho = Number.parseFloat(this.Ancho);
      alto = Number.parseFloat(this.Alto);
      minancho = 60;
      maxancho = 380;
      minalto = 60;
      maxalto = 300;

      if (ancho < minancho || ancho > maxancho) {
        strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + minancho.toString() + " cm ni superior a " + maxancho.toString() + " cm ";
        bretValue = false;

      }

      if (bretValue && (alto < minalto || alto > maxalto)) {
        strMessage = "El alto en este tipo de cortina NO puede ser inferior a " + minalto.toString() + " cm ni superior a " + maxalto.toString() + " cm ";
        bretValue = false;
      }
    }

    if (this.TipoCortina == 2) {

      if (this.PJ_Ancho_1 == "") this.PJ_Ancho_1 = "";
      if (this.PJ_Alto_1 == "") this.PJ_Alto_1 = "";

      ancho = Number.parseFloat(this.PJ_Ancho_1);
      alto = Number.parseFloat(this.PJ_Alto_1);
      minancho = 60;
      maxancho = 200;
      minalto = 100;
      maxalto = 300;

      if (ancho < minancho || ancho > maxancho) {
        strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + minancho.toString() + " cm ni superior a " + maxancho.toString() + " cm ";
        bretValue = false;

      }

      if (bretValue && (alto < minalto || alto > maxalto)) {
        strMessage = "El alto en este tipo de cortina NO puede ser inferior a " + minalto.toString() + " cm ni superior a " + maxalto.toString() + " cm ";
        bretValue = false;
      }

      ancho = Number.parseFloat(this.PJ_Ancho_2);
      minancho = 150;
      maxancho = 325;
      if (ancho < minancho || ancho > maxancho) {
        strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + minancho.toString() + " cm ni superior a " + maxancho.toString() + " cm ";
        bretValue = false;

      }
    }

    if (this.TipoCortina == 3) {

      if (this.PV_Ancho_1 == "") this.PV_Ancho_1 = "0";
      if (this.PV_Alto_1 == "") this.PV_Alto_1 = "0";

      ancho = Number.parseFloat(this.PV_Ancho_1);
      alto = Number.parseFloat(this.PV_Alto_1);
      minancho = 100;
      maxancho = 290;
      minalto = 100;
      maxalto = 400;

      if (ancho < minancho || ancho > maxancho) {
        strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + minancho.toString() + " cm ni superior a " + maxancho.toString() + " cm ";
        bretValue = false;

      }

      if (bretValue && (alto < minalto || alto > maxalto)) {
        strMessage = "El alto en este tipo de cortina NO puede ser inferior a " + minalto.toString() + " cm ni superior a " + maxalto.toString() + " cm ";
        bretValue = false;
      }
    }


    if (this.TipoCortina == 4) {

      if (this.Ancho == "") this.Ancho = "0";
      if (this.Alto == "") this.Alto = "0";

      ancho = Number.parseFloat(this.Ancho);
      alto = Number.parseFloat(this.Alto);
      minancho = 40;
      maxancho = 120;
      minalto = 60;
      maxalto = 220;

      if (ancho > 0 && (ancho < minancho || ancho > maxancho)) {
        strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + minancho.toString() + " cm ni superior a " + maxancho.toString() + " cm ";
        bretValue = false;

      }

      if (bretValue && (alto > 0 && (alto < minalto || alto > maxalto))) {
        strMessage = "El alto en este tipo de cortina NO puede ser inferior a " + minalto.toString() + " cm ni superior a " + maxalto.toString() + " cm ";
        bretValue = false;
      }
    }

    if (!bretValue)
      this.toaster.warning(strMessage, 'ATENCION');

    return bretValue;
  }

  ChangeNumeroPortatelas() {
    if (this.PJ_NumeroVias_2 != "") {
      var vias = Number(this.PJ_NumeroVias_2);
      var maxvias = 2 * vias;
      var portatelas = Number(this.PJ_NumeroPortatelas);


      if (portatelas < vias) {
        this.toaster.warning('El número de Portatelas NO puede ser menor que el Número de Vias ', 'ATENCION');
        this.PJ_NumeroPortatelas = vias;
      }

      if (portatelas > maxvias) {
        this.toaster.warning('El número de Portatelas NO puede ser mayor del doble del Número de Vias ', 'ATENCION');
        this.PJ_NumeroPortatelas = maxvias;
      }


      var ancho = (Number(this.PJ_Ancho_2) / Number(this.PJ_NumeroPortatelas)) + 5;
      this.PJ_Ancho_1 = ancho.toString();
      this.PJ_NumeroLamas = this.PJ_NumeroPortatelas;
      this.PJ_AnchoLama = ancho;
    }

  }

  View(value) {

    if (value == 1) {
      var url = "/assets/images/japones_croquis.pdf";
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    if (value == 2) {
      var url = "/assets/images/verticales_iconos.pdf";
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    if (value == 3) {
      var url = "/assets/images/croquis-panel-japones.jpg";
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }

    if (value == 4) {
      var url = "/assets/images/croquis-cortina-vertical.jpg";
      this.linkDocument = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  onSubmit() {
    var TipoCortina = this.TipoCortina;


    if (TipoCortina == 1) {


      if (this.precios.T1_PVP == 0) {
        alert("No puede agregarse SIN VALORACION");
      }
      else {
        this.T1Add();
      }
    }

    if (TipoCortina == 2) {
      if (this.precios.T2_PVP == 0) {
        alert("No puede agregarse SIN VALORACION");
      }
      else {
        this.T2Add();
      }
    }

    if (TipoCortina == 3) {
      if (this.precios.T3_PVP == 0) {
        alert("No puede agregarse SIN VALORACION");
      }
      else {
        this.T3Add();
      }
    }

    if (TipoCortina == 4) {
      if (this.precios.T4_PVP == 0) {
        alert("No puede agregarse SIN VALORACION");
      }
      else {
        this.T4Add();
      }
    }


    this.CalculaTotalCesta();

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

      if (this.Cesta[pos].TipoCortina == 1) { c1_step = this.Cesta[pos].precios.T1_PVP_C1 }
      if (this.Cesta[pos].TipoCortina == 2) { c1_step = this.Cesta[pos].precios.T2_PVP_C1 }
      if (this.Cesta[pos].TipoCortina == 3) { c1_step = this.Cesta[pos].precios.T3_PVP_C1 }
      if (this.Cesta[pos].TipoCortina == 4) { c1_step = this.Cesta[pos].precios.T1_PVP_C1 }

      if (pos == 0) { c1_sum = c1_step }
      if (pos == 1) { c2_sum = c1_step }
      if (pos == 2) { c3_sum = c1_step }
      if (pos == 3) { c4_sum = c1_step }
      if (pos == 4) { c5_sum = c1_step }
      if (pos == 5) { c6_sum = c1_step }
      if (pos == 6) { c7_sum = c1_step }
      if (pos == 7) { c8_sum = c1_step }
    }


    this.TotalCestaC1 = "";
    this.service.getSum(c1_sum, c2_sum, c3_sum, c4_sum, c5_sum, c6_sum, c7_sum, c8_sum).subscribe(
      data => {
        this.TotalCestaC1 = data[0].res;
      },
      error => {

      }
    );

  }

  ProcesarPedido() {

    if (confirm("¿Desea Transmitir el Pedido?")) {
      this.btnPedido = 1;
      this.btnPresupuesto = 1;

      let lineas = JSON.stringify(this.Cesta);

      let pedido = {
        "lineas": lineas
      }

      this.service.altaPedido(lineas, this.ReferenciaTienda).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
            this.TransmitOK = 1;
            this.toaster.success('Agregado PEDIDO Satisfactoriamente', 'Agregar Pedido');
          }
          else {
            this.NumeroPedido = "ERROR";
            this.TransmitOK = -1;
            this.toaster.error('NO Ha sido posible agregar el PEDIDO al Sistema', 'Agregar Pedido');
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
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

      let pedido = {
        "lineas": lineas
      }

      this.service.altaPresupuesto(lineas, this.ReferenciaTienda).subscribe(
        data => {
          if (data.message == "ok") {
            this.NumeroPedido = data.referencia;
            this.TransmitOK = 1;
            this.toaster.success('Agregado PRESUPUESTO Satisfactoriamente', 'Agregar PRESUPUESTO');
          }
          else {
            this.NumeroPedido = "ERROR";
            this.TransmitOK = -1;
            this.toaster.error('NO Ha sido posible agregar el PRESUPUESTO al Sistema', 'Agregar Pedido');
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );
    }

  }

  ChangeValue(value: any) {
    var marca = this.Tipo1_Marca;



    if (this.TipoCortina == 1) {

      if (marca != "-1") {
        let test_data: { id: number; text: string; ancmax: number }[] = [];
        this.oritubos.forEach(

          (item: { id: number, text: string, ancmax: number }) => {


            if (this.verMando) {

              if (marca == "13") {
                if (item.text == "Tubo 38") {
                  if (parseInt(value) <= item.ancmax) {
                    test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                  }
                }
              }
              else {
                if (item.id == 5) {
                  test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                }
              }
            }
            else {
              if (this.esCadena == 1) {
                if (item.text == "Tubo 38" || item.text == "Tubo 48") {
                  if (parseInt(value) <= item.ancmax) {
                    test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                  }
                }
              }
              else {

                if (marca == "5" || marca == "6") {
                  if (item.text == "Tubo 58") {
                    if (parseInt(value) <= item.ancmax) {
                      test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                    }
                  }
                }

                if (marca == "13") {
                  if (item.text == "Tubo 38") {
                    if (parseInt(value) <= item.ancmax) {
                      test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                    }
                  }
                }
              }


            }
          }
        );

        this.tubos = test_data;
        this.Tipo1_Tubo = this.tubos[0].id.toString();
      }
    }

  }

  Recalcular_Tipo1() {
    /* Trigger for Tipo 1*/
    this.tarifaCadena();
    this.Tarifa_AlturaCadena();
    this.Tarifa_Contrapeso();
    this.ChangeRadioMando();
    this.CalculateC1_Tipo1();
  }

  Recalcular_Tipo2() {
    this.CalculateC1_Tipo2();
  }

  Recalcular_Tipo3() {
    this.Tarifa_Vertical_Soporte();
    this.Vertical_TejidosCombinados();

  }


  Ancho_Change(control) {

    if (this.CheckValidity(control)) {
      if (this.TipoCortina == 1) {


        let test_data: { id: number; text: string; ancmax: number }[] = [];

        if (this.oritubos.length > 0) {
          this.oritubos.forEach(

            (item: { id: number, text: string, ancmax: number }) => {
              if (this.verMando) {
                if (item.id == 5) {
                  test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                }
              }
              else {
                if (this.esCadena == 1) {
                  if (item.text == "Tubo 38" || item.text == "Tubo 48") {
                    if (parseInt(control.value) <= item.ancmax) {
                      test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                    }
                  }
                }
                else {
                  if (item.text == "Tubo 58") {
                    if (parseInt(control.value) <= item.ancmax) {
                      test_data.push({ id: item.id, text: item.text, ancmax: item.ancmax })
                    }
                  }
                }


              }
            }
          );

          this.tubos = test_data;
          this.Tipo1_Tubo = this.tubos[0].id.toString();
        }
      }
    }

    this.Tarifa_Contrapeso();
  }

  Next(e, current) {


    if (current.focus) {
      current.focus();
    }
    else {
      //e.preventDefault();
      /*
      if (e.srcElement.nextElementSibling){
          e.srcElement.nextElementSibling.focus();
      }
      */
    }

  }

  VerPedido() {
    this.bConfigurador = 1;
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

  Test() {

  }

  BorrarPedido() {

    if (confirm("¿Quiere realmente Borrar el Pedido?")) {

      this.TransmitOK = 0;
      this.Cesta = [];
      this.NumeroPedido = "";
      this.ApplyLab();
      this.ResetPrices();
    }

    this.CalculaTotalCesta();
  }

  ApplyLab() {

    this.NumeroCortinas = this.TotalSum();
  }

  TotalSum() {

    let Suma = 0;
    this.Cesta.forEach(item => {


      if (item.TipoCortina == 1) {
        Suma += item.cantidad;
      }

      if (item.TipoCortina == 2) {
        if (item.PJ_Cantidad_1) {
          Suma += Number(item.PJ_Cantidad_1);
        }
      }

      if (item.TipoCortina == 3) {
        if (item.PV_Cantidad_1) {
          Suma += Number(item.PV_Cantidad_1);
        }
        if (item.PV_Cantidad_2) {
          Suma += Number(item.PV_Cantidad_2);
        }
      }

      if (item.TipoCortina == 4) {
        Suma += item.cantidad;
      }

    })
    return Suma;
  }

  DeleteLine(item) {


    if (confirm("¿Quiere borrar la línea seleccionada?")) {

      var pos = this.Cesta.indexOf(item);
      if (pos > -1) {
        this.Cesta.splice(pos, 1);
        this.CalculaTotalCesta();
        this.ApplyLab();
      }
    }


  }

  Edit_T1(item) {
    this.Ancho = item.ancho;
    this.Alto = item.alto;
    this.Cantidad = item.cantidad;
    this.ID_Imagen = item.impresion_imagen;
    this.ID_Quiero = item.impresion;
    this.Tipo1_Tejido = item.tej_tipo_id;

    this.Tipo1_TejidoColor = item.tej_color_id;
    this.Tipo1_TejidoSalida = item.tej_salida_id;
    this.ChangeTipo1Tejido();

    this.Tipo1_Tipo = item.acc_tipo_id;
    this.Tipo1_Marca = item.acc_marca_id;
    this.Tipo1_Color = item.acc_modelo_id;

    this.Tipo1_Marca = item.acc_marca_id;
    this.Tipo1_Posicion = item.acc_posicion_id;
    this.Tipo1_Tubo = item.acc_tubo_id;
    this.Tipo1_Mando = item.mando_id;

    if (item.cad_Tipo == "0") {
      this.Cadena(0);
      this.AlturaCadena = item.cad_Altura;
      this.Tipo1_ColorCadena = item.cad_color_text;
    }
    if (item.cad_Tipo == "1") {
      this.Cadena(1);
      this.Tipo1_AlturaCadena = item.cad_Altura;
      this.Tipo1_ColorCadena = item.cad_color_text;
    }
    if (item.cad_Tipo == "2") {
      this.Cadena(2);
      this.Tipo1_AlturaCadena = item.cad_Altura;
    }

    this.ChangeAccionamiento();
    this.ChangeAccionamientoMarca();
    this.ChangeAccionamientoColor();

    this.Tipo1_Soporte = item.sop_tipo_id;
    this.Tipo1_SoporteC = item.sop_color_id;
    this.ChangeTipo1Soporte();

    this.Tipo1_Tapa = item.tap_tipo_id;
    this.Tipo1_TapaC = item.tap_color_id;
    this.ChangeTipo1Tapa();

    this.Tipo1_Contrapeso = item.con_tipo_id;
    this.Tipo1_ContrapesoC = item.con_color_id;
    this.ChangeTipo1Contrapeso();

    this.Tipo1_Estancia = item.estancia_id;
    this.Tipo1_Estancia_Obs = item.estancia_obs;

    this.CheckPrice();
    this.VerConfigurador();
    this.Tipo(1);

  }

  Edit_T2(item) {
    this.PJ_AltoLamaTerminada = item.PJ_AltoLamaTerminada;
    this.PJ_Alto_1 = item.PJ_Alto_1;
    this.PJ_AnchoLama = item.PJ_AnchoLama;
    this.PJ_Ancho_1 = item.PJ_Ancho_1;
    this.PJ_Ancho_2 = item.PJ_Ancho_2;
    this.PJ_Cantidad_1 = item.PJ_Cantidad_1;
    this.PJ_ColorRiel_2 = item.PJ_ColorRiel_2;
    this.PJ_Contrapeso_1 = item.PJ_Contrapeso_1;
    this.Tipo2_Estancia = item.PJ_Estancia;
    this.Tipo2_Estancia_Obs = item.PJ_Estancia_Obs;
    this.PJ_NumeroLamas = item.PJ_NumeroLamas;
    this.PJ_NumeroPanos = item.PJ_NumeroPanos;
    this.PJ_NumeroPortatelas = item.PJ_NumeroPortatelas;
    this.PJ_NumeroVias_2 = item.PJ_NumeroVias_2;
    this.PJ_PosicionMando_2 = item.PJ_PosicionMando_2;
    this.TipoJapones = item.PJ_TipoJapones;
    this.PJ_TipoRecogida_2 = item.PJ_TipoRecogida_2;
    this.PJ_TipoSoporte_2 = item.PJ_TipoSoporte_2;
    this.PJ_ID_Quiero = item.impresion;
    this.PJ_ID_Imagen = item.impresion_imagen;
    this.selImpresionDigital_Tipo2();

    this.PJ_CombinarColores = item.PJ_CombinarColores;
    if (this.PJ_CombinarColores == true) {
      this.CombinarColores();
    }

    this.Tipo2_Tejido = item.PJ_tejidos_id;
    this.ChangeTipo2Tejido();
    this.Tipo2_TejidoColor = item.PJ_tejidosC_id;
    this.Tipo2_TejidoColor_2 = item.Tipo2_TejidoColor_2;
    this.Tipo2_TejidoColor_3 = item.Tipo2_TejidoColor_3;
    this.Tipo2_TejidoColor_4 = item.Tipo2_TejidoColor_4;
    this.Tipo2_TejidoColor_5 = item.Tipo2_TejidoColor_5;

    this.Tarifa_Japones_Soporte();
    this.Tarifa_Japones_Mecanismo();
    this.VerConfigurador();
    this.Tipo(2);

  }

  Edit_T3(item) {
    this.PV_SEL_1 = item.PV_SEL_1;
    this.PV_SEL_2 = item.PV_SEL_2;
    this.TipoVertical = item.TipoVertical;
    this.PV_Ancho_1 = item.PV_Ancho_1;
    this.PV_Ancho_2 = item.PV_Ancho_2;
    this.PV_AnchoLama_1 = item.PV_AnchoLama_1;
    this.PV_AnchoLama_2 = item.PV_AnchoLama_2;
    this.PV_Alto_1 = item.PV_Alto_1;
    this.PV_AlturaMin_2 = item.PV_AlturaMin_2;
    this.PV_AlturaMax_2 = item.PV_AlturaMax_2;
    this.PV_Cantidad_1 = item.PV_Cantidad_1;
    this.PV_Cantidad_2 = item.PV_Cantidad_2;
    this.PV_PosicionMecanismo_1 = item.PV_PosicionMecanismo_1;
    this.PV_Accionamiento_1 = item.PV_Accionamiento_1;
    this.PV_Accionamiento_2 = item.PV_Accionamiento_2;
    this.PV_TipoSoporte_1 = item.PV_TipoSoporte_1;
    this.PV_TipoSoporte_2 = item.PV_TipoSoporte_2;
    this.PV_TipoRecogida_1 = item.PV_TipoRecogida_1;
    this.PV_TipoRecogida_2 = item.PV_TipoRecogida_2;
    this.Tipo3_Tejido = item.PV_Tejido_id;
    this.Tipo3_TejidoColor1 = item.PV_Tejido_c1_id;
    this.Tipo3_TejidoColor2 = item.PV_Tejido_c2_id;
    this.PV_ColorRiel_1 = item.PV_ColorRiel_1;
    this.PV_ColorRiel_2 = item.PV_ColorRiel_2;

    this.ChangeTipo3Tejido();
    this.CheckPrice();
    this.VerConfigurador();
    this.Tipo(3);


  }

  Edit_T4(item) {
    this.compac.PC_TipoJunquillo = item.junquillo;
    this.Ancho = item.ancho;
    this.compac.PC_AnchoB = item.ancho2;
    this.Alto = item.alto;
    this.Cantidad = item.cantidad;
    this.compac.Compac_Acc_Color = item.acc_modelo_id;
    this.compac.Compac_Acc_Posicion = item.acc_posicion_id;
    this.compac.Compac_Acc_Tubo = item.acc_tubo_id;
    this.ChangeColorCompac();
    this.compac.Compac_Sop_Color = item.sop_color_id;
    this.compac.Compac_Tap_Color = item.tap_color_id;
    this.Tipo4_Tejido = item.tej_tipo_id;
    this.Tipo4_TejidoColor = item.tej_color_id;
    this.Tipo4_TejidoSalida = item.tej_salida_id;

    if (item.cad_Tipo == "0") {
      this.Cadena(0);
      this.AlturaCadena = item.cad_Altura;
      this.compac.Compac_Acc_Cad_Altura = item.cad_altura_id;
      this.compac.Compac_Acc_Cad_Color = item.cad_color_id;
    }
    if (item.cad_Tipo == "1") {
      this.Cadena(1);
    }
    this.CheckPrice();
    this.VerConfigurador();
    this.Tipo(4);
  }

  EditLine(item) {


    if (confirm("¿Quiere editar la línea seleccionada?")) {

      var pos = this.Cesta.indexOf(item);
      if (pos > -1) {

        if (item.TipoCortina == 1) {
          this.Edit_T1(item);
        }

        if (item.TipoCortina == 2) {
          this.Edit_T2(item);
        }

        if (item.TipoCortina == 3) {
          this.Edit_T3(item);
        }

        if (item.TipoCortina == 4) {
          this.Edit_T4(item);
        }

        this.Cesta.splice(pos, 1);
        this.CalculaTotalCesta();
      }
    }


  }

  Cadena(value: number) {
    this.Tipo1_Cadena_Label = "Altura:";
    this.esCadenaExt = value;
  }

  Tipo(value: number) {
    this.TipoCortina = value;

    if (value == 4) {
      this.compac_accionamientos = [];

      if (this.items1.length > 0) {
        this.compac_accionamientos.push({ id: this.items1[0].id, text: this.items1[0].text });
        var acc = this.compac_accionamientos[0].id;
        this.esCadena = 1;
        this.load_TipoAccionamientos(acc);
      }

      this.compac_tubos = [];
      if (this.K_tubos.length > 0) {
        this.compac_tubos.push({ id: this.K_tubos[0].id, text: this.K_tubos[0].text });
        //this.items34_selected = this.compac_tubos[0].id;
        //this.items34_selected_v = this.compac_tubos[0].text;
      }

    }
  }

  classTipo(value: number) {

    let cssClasses;
    var ivalue = this.TipoCortina;
    if (value == ivalue) {
      cssClasses = {
        'btn lm-success': true,
        'active': true
      }
    }
    else {
      cssClasses = {
        'btn lm-success': true,
        'active': false
      }
    }
    return cssClasses;
  }



  BudgetLoaded(event) {
    //alert("Ich werde ein neues Budget herunterladen:" + event.idrow);

    this.Cesta = [];
    this.ReferenciaTienda = event.refcliente;

    /* T1 HERUNTERLADEN */
    this.service.Budget_herunterladen_T1(event.idrow).subscribe
      (
        data => {
          var len = data.length;
          if (len > 0) {
            for (var pos = 0; pos < len; pos++) {
              var item = data[pos];
              var alturaCadena = item.cad_Altura;
              var estancia = "-1";
              var estanciaobs = "";
              //cad_altura_id
              //cad_altura_text
              //id
              //idrow

              var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

              var precios = {

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
                T1_PVP: item.T1_PVP,
                T1_PVP_C1: item.T1_PVP_C1,
                T1_Fecha_Entrega: item.T1_Fecha_Entrega,
                T1_Transporte: item.T1_Transporte,

                T2_Cantidad: 1,
                T2_Tejido: 0,
                T2_Tejido_C1: '',
                T2_NumeroVias: 0,
                T2_NumeroVias_C1: '',
                T2_NumSoportes: 0,
                T2_TipoSoporte: 0,
                T2_TipoSoporte_C1: '',
                T2_Inc_Impresion: 0,
                T2_Inc_Impresion_C1: '',
                T2_PVP: 0,
                T2_PVP_C1: '',
                T2_Fecha_Entrega: "",
                T2_Transporte: "",
                T2_SoporteTotal: 0,

                T3_Cantidad: 1,
                T3_Tejido: 0,
                T3_Tejido_C1: '',
                T3_TejidosCombinados: 0,
                T3_TejidosCombinados_C1: '',
                T3_TipoSoporte: 0,
                T3_NumSoportes: 0,
                T3_TipoSoporte_C1: '',
                T3_PVP: 0,
                T3_PVP_C1: '',
                T3_Fecha_Entrega: "",
                T3_Transporte: "",

                T32_Cantidad: 1,
                T32_Tejido: 0,
                T32_Tejido_C1: '',
                T32_TejidosCombinados: 0,

                T4_Cantidad: 1,
                T4_Tejido: 0,
                T4_Tejido_C1: '',
                T4_Coeficiente: 1,
                T4_PVP: 0,
                T4_PVP_C1: '',
                T4_Fecha_Entrega: "",
                T4_Transporte: "",

              }

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
                estancia, estanciaobs, precios)
              this.Cesta.push(tipo);

            }
            this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
            this.ApplyLab();
            this.VerPedido();
          }
        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );

    /* T2 HERUNTERLADEN */
    this.service.Budget_herunterladen_T2(event.idrow).subscribe
      (
        data => {


          var len = data.length;
          if (len > 0) {
            for (var pos = 0; pos < len; pos++) {
              var item = data[pos];

              var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

              var precios = {
                T1_Cantidad: 1,
                T1_Tejido: 0,
                T1_Tejido_C1: "",
                T1_Inc_CadenaMetalica: 0,
                T1_Inc_CadenaMetalica_C1: '',
                T1_Inc_Contrapeso: 0,
                T1_Inc_Contrapeso_C1: '',
                T1_Inc_Mando: 0,
                T1_Inc_Mando_C1: '',
                T1_Inc_Impresion: 0,
                T1_Inc_Impresion_C1: '',
                T1_PVP: 0,
                T1_PVP_C1: '',
                T1_Fecha_Entrega: "",
                T1_Transporte: "",

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
                T2_PVP: item.T2_PVP,
                T2_PVP_C1: item.T2_PVP_C1,
                T2_Fecha_Entrega: item.T2_FechaEntrega,
                T2_Transporte: item.T2_Transporte,
                T2_SoporteTotal: item.T2_SoporteTotal,

                T3_Cantidad: 1,
                T3_Tejido: 0,
                T3_Tejido_C1: '',
                T3_TejidosCombinados: 0,
                T3_TejidosCombinados_C1: '',
                T3_TipoSoporte: 0,
                T3_NumSoportes: 0,
                T3_TipoSoporte_C1: '',
                T3_PVP: 0,
                T3_PVP_C1: '',
                T3_Fecha_Entrega: "",
                T3_Transporte: "",

                T32_Cantidad: 1,
                T32_Tejido: 0,
                T32_Tejido_C1: '',
                T32_TejidosCombinados: 0,

                T4_Cantidad: 1,
                T4_Tejido: 0,
                T4_Tejido_C1: '',
                T4_Coeficiente: 1,
                T4_PVP: 0,
                T4_PVP_C1: '',
                T4_Fecha_Entrega: "",
                T4_Transporte: "",
              }

              var NumeroPanos = 1;

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
                precios)

              this.Cesta.push(tipo);
            }
            this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
            this.ApplyLab();
            this.VerPedido();
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );

    /* T3 HERUNTERLADEN */
    this.service.Budget_herunterladen_T3(event.idrow).subscribe
      (
        data => {
          var len = data.length;
          if (len > 0) {
            for (var pos = 0; pos < len; pos++) {
              var item = data[pos];

              var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

              var precios = {

                T1_Cantidad: 1,
                T1_Tejido: 0,
                T1_Tejido_C1: "",
                T1_Inc_CadenaMetalica: 0,
                T1_Inc_CadenaMetalica_C1: '',
                T1_Inc_Contrapeso: 0,
                T1_Inc_Contrapeso_C1: '',
                T1_Inc_Mando: 0,
                T1_Inc_Mando_C1: '',
                T1_Inc_Impresion: 0,
                T1_Inc_Impresion_C1: '',
                T1_PVP: 0,
                T1_PVP_C1: '',
                T1_Fecha_Entrega: "",
                T1_Transporte: "",

                T2_Cantidad: 1,
                T2_Tejido: 0,
                T2_Tejido_C1: '',
                T2_NumeroVias: 0,
                T2_NumeroVias_C1: '',
                T2_NumSoportes: 0,
                T2_TipoSoporte: 0,
                T2_TipoSoporte_C1: '',
                T2_Inc_Impresion: 0,
                T2_Inc_Impresion_C1: '',
                T2_PVP: 0,
                T2_PVP_C1: '',
                T2_Fecha_Entrega: "",
                T2_Transporte: "",
                T2_SoporteTotal: 0,

                T3_Cantidad: item.T3_Cantidad,
                T3_Tejido: item.T3_Tejido,
                T3_Tejido_C1: item.T3_Tejido_C1,
                T3_TejidosCombinados: item.T3_TejidosCombinados,
                T3_TejidosCombinados_C1: item.T3_TejidosCombinados_C1,
                T3_TipoSoporte: item.T3_TipoSoporte,
                T3_NumSoportes: item.T3_NumSoportes,
                T3_TipoSoporte_C1: item.T3_TipoSoporte_C1,
                T3_PVP: item.T3_PVP,
                T3_PVP_C1: item.T3_PVP_C1,
                T3_Fecha_Entrega: item.T3_Fecha_Entrega,
                T3_Transporte: item.T3_TipoSoporte,

                T32_Cantidad: item.T32_Cantidad,
                T32_Tejido: item.T32_Tejido,
                T32_Tejido_C1: item.T32_Tejido_C1,
                T32_TejidosCombinados: item.T32_TejidosCombinados,

                T4_Cantidad: 1,
                T4_Tejido: 0,
                T4_Tejido_C1: '',
                T4_Coeficiente: 1,
                T4_PVP: 0,
                T4_PVP_C1: '',
                T4_Fecha_Entrega: "",
                T4_Transporte: "",

              }

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
                  item.estancia, item.estanciaobs, item.TipoVertical, precios);
              }

              if (item.PV_SEL_2 == 1) {
                tipo.Vertical_Add_T2(item.PV_Ancho_2, item.PV_Cantidad_2, item.PV_AlturaMin_2,
                  item.PV_AlturaMax_2, item.PV_AnchoLama_2,
                  item.PV_PosicionMecanismo_2,
                  item.PV_ColorRiel_2,
                  item.PV_Accionamiento_2,
                  item.PV_TipoSoporte_2,
                  item.PV_TipoRecogida_2,
                  item.estancia, item.estanciaobs, precios);
              }

              this.Cesta.push(tipo);
            }
            this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
            this.ApplyLab();
            this.VerPedido();
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );

    /* T4 HERUNTERLADEN */
    this.service.Budget_herunterladen_T4(event.idrow).subscribe
      (
        data => {

          var len = data.length;
          if (len > 0) {
            for (var pos = 0; pos < len; pos++) {
              var item = data[pos];

              var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

              var precios = {

                T1_Cantidad: 1,
                T1_Tejido: 0,
                T1_Tejido_C1: "",
                T1_Inc_CadenaMetalica: 0,
                T1_Inc_CadenaMetalica_C1: '',
                T1_Inc_Contrapeso: 0,
                T1_Inc_Contrapeso_C1: '',
                T1_Inc_Mando: 0,
                T1_Inc_Mando_C1: '',
                T1_Inc_Impresion: 0,
                T1_Inc_Impresion_C1: '',
                T1_PVP: 0,
                T1_PVP_C1: '',
                T1_Fecha_Entrega: "",
                T1_Transporte: "",

                T2_Cantidad: 1,
                T2_Tejido: 0,
                T2_Tejido_C1: '',
                T2_NumeroVias: 0,
                T2_NumeroVias_C1: '',
                T2_NumSoportes: 0,
                T2_TipoSoporte: 0,
                T2_TipoSoporte_C1: '',
                T2_Inc_Impresion: 0,
                T2_Inc_Impresion_C1: '',
                T2_PVP: 0,
                T2_PVP_C1: '',
                T2_Fecha_Entrega: "",
                T2_Transporte: "",
                T2_SoporteTotal: 0,

                T3_Cantidad: 1,
                T3_Tejido: 0,
                T3_Tejido_C1: '',
                T3_TejidosCombinados: 0,
                T3_TejidosCombinados_C1: '',
                T3_TipoSoporte: 0,
                T3_NumSoportes: 0,
                T3_TipoSoporte_C1: '',
                T3_PVP: 0,
                T3_PVP_C1: '',
                T3_Fecha_Entrega: "",
                T3_Transporte: "",

                T32_Cantidad: 1,
                T32_Tejido: 0,
                T32_Tejido_C1: '',
                T32_TejidosCombinados: 0,

                T4_Cantidad: item.T4_Cantidad,
                T4_Tejido: item.T4_Tejido,
                T4_Tejido_C1: item.T4_Tejido_C1,
                T4_Coeficiente: item.T4_Coeficiente,
                T4_PVP: item.T4_PVP,
                T4_PVP_C1: item.T4_PVP_C1,
                T4_Fecha_Entrega: item.T4_Fecha_Entrega,
                T4_Transporte: item.T4_Transporte

              }

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
                item.estancia, item.estanciaobs, precios);

              this.Cesta.push(tipo);

            }
            this.toaster.success('Agregada Cortina Enrollable a Cesta', 'Cesta');
            this.ApplyLab();
            this.VerPedido();
          }

        },
        error => {
          this.toaster.error(JSON.stringify(error));
        }
      );


    this.CalculaTotalCesta();
  }

}
