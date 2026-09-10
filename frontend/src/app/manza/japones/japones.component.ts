import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { CortinaTipo } from '../config/CortinaTipo';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';
import { SMAPIService } from '../config/smapi.service';
import { Tipo } from '../config/Tipo';
import { ImpresionDigitalSelectorComponent, ImpresionDigitalSeleccion } from '../../shared/impresion-digital-selector/impresion-digital-selector.component';

@Component({
   selector: 'manza-japones',
   templateUrl: './japones.component.html',
   providers: [SMAPIService]
})
export class JaponesComponent implements OnInit, OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() Global_Visualizar_C1_Parciales: boolean = false;

   @Input() ReferenciaTienda: string = '';

   @Output() onAdd = new EventEmitter<CortinaTipo>();

   public CestaPrecios: Array<CortinaTipo> = [];



   calculando: boolean = false;

   idLinea: string = "0";

   // Tipo
   TipoJapones: string = '1'; // 1=Mecanismo+Tejido, 2=Solo Tejido, 3=Solo Mecanismo

   // Mecanismo
   PJ_Cantidad_1: string = '1';
   PJ_Ancho_2: string = '';
   PJ_Alto_1: string = '';
   PJ_NumeroVias_2: string = '-1';
   PJ_NumeroPortatelas: number = 2;
   PJ_Ancho_1: string = '';
   PJ_ColorRiel_2: string = '-1';
   PJ_PosicionMando_2: string = '-1';
   PJ_TipoRecogida_2: string = '-1';
   PJ_TipoSoporte_2: string = '-1';
   PJ_Contrapeso_1: string = '-1';

   // Lamas
   PJ_NumeroLamas: number = 2;
   PJ_AnchoLama: string = '';
   PJ_AltoLamaTerminada: string = '';

   // Tejido
   pj_tejidos: any[] = [];
   pj_tejidosC: any[] = [];
   pj_tejidosC_2: any[] = [];
   pj_tejidosC_3: any[] = [];
   pj_tejidosC_4: any[] = [];
   pj_tejidosC_5: any[] = [];
   Tipo2_Tejido: string = '-1';
   Tipo2_TejidoColor: string = '-1';
   Tipo2_TejidoColor_2: string = '-1';
   Tipo2_TejidoColor_3: string = '-1';
   Tipo2_TejidoColor_4: string = '-1';
   Tipo2_TejidoColor_5: string = '-1';
   CodigoProv2: string = '';
   PJ_CombinarColores: boolean = false;
   PJ_ID_Quiero: boolean = false;
   PJ_ID_Imagen: string = '';
   PJ_NumeroPanos: string = '';
   idSeleccion: ImpresionDigitalSeleccion = null;
   @ViewChild('idSelector', { static: false }) idSelector!: ImpresionDigitalSelectorComponent;

   // Estancia
   Tipo2_Estancia: string = '-1';
   Tipo2_Estancia_Obs: string = '';
   public Estancias: any = [];

   // Precios
   Tipo2_TipoSoporte_Label: string = 'Soporte:';
   PJ_SoporteTotal: number = 0;
   Accesorios_Japones: string = '';
   Tipo2_Desglose: boolean = false;

   Tipo2_NumeroVias_Label = "Número Vias:";
   Tipo3_TipoSoporte_Label = "Tipo de Soporte";
   Tipo32_TipoSoporte_Label = "Tipo de Soporte";

   public Tipo21_Estancia: string = "-1";
   public Tipo21_Estancia_Obs: string = "";


   /* PANEL JAPONES */

   precios = {
      T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '',
      T2_NumeroVias: 0, T2_NumeroVias_C1: '',
      T2_NumSoportes: 0, T2_TipoSoporte: 0, T2_TipoSoporte_C1: '',
      T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
      T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: '', T2_Transporte: '',
      T2_SoporteTotal: 0
   };



   constructor(
      private service: SMAPIService,
      private toaster: ToastrService,
      private translation: TranslationService
   ) { }

   ngOnInit(): void {
      this.load_Estancias();
      this.NewPage();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente) > 0) {
         this.load_PJ_Tejidos();
      }
   }

   CheckValidity(control: any) {

      //this.alertShow = false;
      //this.alertMsg = "";
      var strMessage = "";
      var bretValue = true;

      var ancho = 0;
      var alto = 0;
      var minancho = 0;
      var maxancho = 0;
      var minalto = 0;
      var maxalto = 0;


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

      if (!bretValue)
         this.toaster.error(strMessage, 'ATENCION');

      return bretValue;
   }

   // ─── RESET ───────────────────────────────────────────────────────────────────

   reset(): void {
      this.TipoJapones = '1';
      this.PJ_Cantidad_1 = '1';
      this.PJ_Ancho_2 = '';
      this.PJ_Alto_1 = '';
      this.PJ_NumeroVias_2 = '-1';
      this.PJ_NumeroPortatelas = 2;
      this.PJ_Ancho_1 = '';
      this.PJ_ColorRiel_2 = '-1';
      this.PJ_PosicionMando_2 = '-1';
      this.PJ_TipoRecogida_2 = '-1';
      this.PJ_TipoSoporte_2 = '-1';
      this.PJ_Contrapeso_1 = '-1';
      this.PJ_NumeroLamas = 2;
      this.PJ_AnchoLama = '';
      this.PJ_AltoLamaTerminada = '';
      this.Tipo2_Tejido = '-1';
      this.Tipo2_TejidoColor = '-1';
      this.Tipo2_TejidoColor_2 = '-1';
      this.Tipo2_TejidoColor_3 = '-1';
      this.Tipo2_TejidoColor_4 = '-1';
      this.Tipo2_TejidoColor_5 = '-1';
      this.CodigoProv2 = '';
      this.PJ_CombinarColores = false;
      this.PJ_ID_Quiero = false;
      this.PJ_ID_Imagen = '';
      this.idSeleccion = null;
      this.PJ_NumeroPanos = '';
      this.Tipo2_Estancia = '-1';
      this.Tipo2_Estancia_Obs = '';
      this.Tipo2_Desglose = false;
      this.PJ_SoporteTotal = 0;
      this.Accesorios_Japones = '';
      this.resetPrecios();
      this.load_PJ_Tejidos();
   }

   resetPrecios(): void {
      this.precios = {
         T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '',
         T2_NumeroVias: 0, T2_NumeroVias_C1: '',
         T2_NumSoportes: 0, T2_TipoSoporte: 0, T2_TipoSoporte_C1: '',
         T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
         T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: '', T2_Transporte: '',
         T2_SoporteTotal: 0
      };
   }

   // ─── CARGA ────────────────────────────────────────────────────────────────────

   load_PJ_Tejidos(): void {
      this.service.getTejidosProducto(this.Cliente, '2', this.SubCliente).subscribe(
         data => {
            this.pj_tejidos = data;
            this.pj_tejidos.unshift({ id: -1, text: 'Seleccionar', codigoprov: '' });
         },
         error => console.log(error)
      );
   }

   load_PJ_TejidosID(): void {
      this.service.getTejidosProductoID(this.Cliente, '2', this.SubCliente).subscribe(
         data => {
            this.pj_tejidos = data;
            this.pj_tejidos.unshift({ id: -1, text: 'Seleccionar', codigoprov: '' });
         },
         error => console.log(error)
      );
   }

   load_PJ_TejidosColores(tejidoId: number, slot: number): void {
      this.service.getTejidosColor(tejidoId, parseInt(this.Cliente), this.SubCliente).subscribe(
         data => {
            if (slot === 1) { this.pj_tejidosC = data; if (data.length > 0) { this.Tipo2_TejidoColor = data[0].id.toString(); } }
            if (slot === 2) { this.pj_tejidosC_2 = data; if (data.length > 0) { this.Tipo2_TejidoColor_2 = data[0].id.toString(); } }
            if (slot === 3) { this.pj_tejidosC_3 = data; if (data.length > 0) { this.Tipo2_TejidoColor_3 = data[0].id.toString(); } }
            if (slot === 4) { this.pj_tejidosC_4 = data; if (data.length > 0) { this.Tipo2_TejidoColor_4 = data[0].id.toString(); } }
            if (slot === 5) { this.pj_tejidosC_5 = data; if (data.length > 0) { this.Tipo2_TejidoColor_5 = data[0].id.toString(); } }
         },
         error => console.log(error)
      );
   }

   load_Estancias(): void {
      this.service.getEstancias(parseInt(this.Cliente)).subscribe(
         data => {
            this.Estancias = data;
            this.Estancias.push({ 'idrow': '-1', 'descripcion': 'Seleccionar' });
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   // ─── CHANGE HANDLERS ─────────────────────────────────────────────────────────

   NewPage(): void {
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
      this.idSeleccion = null;
      this.PJ_NumeroPanos = "0";
      this.PJ_AltoLamaTerminada = "0";
      this.PJ_AnchoLama = "0";
      this.PJ_NumeroPortatelas = 2;
      this.PJ_NumeroLamas = 0;
      this.Tipo2_NumeroVias_Label = "Número Vias:";
      this.Tipo2_Tejido = "-1";
      this.Tipo2_TejidoColor = "-1";
      this.Tipo2_Estancia = "-1";
      this.Tipo2_Estancia_Obs = "";
      this.Tipo21_Estancia = "-1";
      this.Tipo21_Estancia_Obs = "";

   }

   ResetPrices(): void {
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
   }

   ChangeTipoJapones(): void {
      this.ResetPrices();
      this.PJ_NumeroVias_2 = "-1";
      this.PJ_TipoSoporte_2 = "-1";

      this.Tipo2_NumeroVias_Label = "Número Vias:";
      this.Tipo2_TipoSoporte_Label = "Tipo de Soporte";
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
         this.PJ_AnchoLama = ancho.toString();
      }

   }

   ChangeTipo2Tejido(): void {
      this.CodigoProv2 = '';
      const tejido = parseInt(this.Tipo2_Tejido);
      if (tejido > 0) {
         const pos = this.getPos(this.pj_tejidos, tejido);
         if (pos >= 0) this.CodigoProv2 = this.pj_tejidos[pos].codigoprov || '';
         if (this.PJ_ID_Quiero) {
            this.service.getTejidosColorID(tejido, parseInt(this.Cliente), this.SubCliente).subscribe(
               data => { this.pj_tejidosC = data; if (data.length > 0) { this.Tipo2_TejidoColor = data[0].id.toString(); } },
               error => console.log(error)
            );
         } else {
            this.load_PJ_TejidosColores(tejido, 1);
         }
      }
   }

   ChangeTipo2Color() {
      this.CodigoProv2 = "";
      var color = this.Tipo2_TejidoColor;

      var pos2 = this.getPos(this.pj_tejidosC, color);
      if (pos2 >= 0) {
         if (this.pj_tejidosC[pos2].codigoprov != "") {
            this.CodigoProv2 = this.pj_tejidosC[pos2].codigoprov;
         }
         else {

            var tejido = this.Tipo2_Tejido;
            var pos2 = this.getPos(this.pj_tejidos, tejido);
            if (pos2 >= 0) {
               this.CodigoProv2 = this.pj_tejidos[pos2].codigoprov;
            }
         }

      }

   }

   CombinarColores(): void {
      if (this.PJ_CombinarColores) {
         const tejido = parseInt(this.Tipo2_Tejido);
         if (tejido > 0) {
            for (let i = 2; i <= 5; i++) this.load_PJ_TejidosColores(tejido, i);
         }
      }
   }

   selImpresionDigital_Tipo2(): void {
      if (this.PJ_ID_Quiero) {
         this.load_PJ_TejidosID();
      } else {
         this.load_PJ_Tejidos();
         this.idSeleccion = null;
         this.PJ_ID_Imagen = '';
      }
   }

   onImpresionDigitalSeleccionada(sel: ImpresionDigitalSeleccion): void {
      this.idSeleccion = sel;
      this.PJ_ID_Imagen = sel.nombre + (sel.texto ? ' — "' + sel.texto + '"' : '');
   }

   quitarImpresionDigital(): void {
      this.idSeleccion = null;
      this.PJ_ID_Imagen = '';
   }

   // ─── TARIFAS ─────────────────────────────────────────────────────────────────

   Tarifa_Japones_Mecanismo() {
      if (this.PJ_NumeroVias_2 != "-1") {
         var vias = this.PJ_NumeroVias_2;
         var ancho = this.PJ_Ancho_2;

         var oper = (Number(ancho) / Number(vias)) + 5;
         oper = Math.ceil(oper * 20) / 20;

         this.PJ_Ancho_1 = oper.toFixed(2);
         this.PJ_AnchoLama = oper.toFixed(2);
         this.PJ_AltoLamaTerminada = (Number(this.PJ_Alto_1) - 2.5).toFixed(2);
         this.PJ_NumeroPortatelas = Number(vias);
         this.PJ_NumeroLamas = this.PJ_NumeroPortatelas;

         var cantidad = Number(this.PJ_Cantidad_1);

         this.Tipo2_NumeroVias_Label = "Número Vias:";

         if (vias != "-1" && ancho != "") {
            this.service.getTarifaPanelJapones(vias, this.Cliente, ancho, cantidad).subscribe(
               data => {

                  if (data.message == "OK") {
                     this.Tipo2_NumeroVias_Label = "Número Vias: (" + data.v1 + "€ " + data.v2 + ")";
                     this.precios.T2_NumeroVias = Number(this.PJ_Cantidad_1) * data.v1;
                     this.precios.T2_NumeroVias_C1 = data.v2;
                     if (this.precios.T2_NumeroVias == 0) {
                        this.toaster.error("Medida no tarifada", 'ATENCION');
                     }
                  } else {
                     this.precios.T2_NumeroVias = 0;
                     this.precios.T2_NumeroVias_C1 = "";

                  }
               },
               error => {
                  this.toaster.error(error.message);
               }
            );
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
         var ancho = this.PJ_Ancho_2;
         var sancho = "0";
         var soportes = 0;

         if (soporte == "P08") {
            sancho = "80";
         }

         if (soporte == "P10") {
            sancho = "100";
         }

         if (soporte == "P12") {
            sancho = "120";
         }

         if (soporte == "P14") {
            sancho = "140";
         }

         if (soporte == "P15") {
            sancho = "150";
         }

         if (soporte == "P19") {
            sancho = "190";
         }

         if (soporte == "P21") {
            sancho = "210";
         }

         if (soporte == "P23") {
            sancho = "230";
         }

         soportes = Number(ancho) / 50.0;
         soportes = Math.round(soportes);

         if (sancho != "0") {

            this.service.getTarifaAccesorio(this.Cliente, sancho, soportes * Number(cantidad)).subscribe(
               data => {

                  if (data.message == "OK") {
                     this.Tipo2_TipoSoporte_Label = "Tipo de Soporte: (" + soportes.toString() + " x " + data.v1 + "€ " + data.v2 + ")";
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
            this.precios.T2_TipoSoporte_C1 = ''
         }
      }
   }

   asignaPrecios(): void {
      var cantidad = this.precios.T2_Cantidad;
      var v1 = this.precios.T2_Tejido;
      var v2 = this.precios.T2_NumeroVias;
      var v3 = this.precios.T2_TipoSoporte;
      var v4 = this.precios.T2_NumSoportes;
      var v5 = this.precios.T2_Inc_Impresion;

      this.precios.T2_SoporteTotal = cantidad * v3 * v4;
      this.precios.T2_PVP = v1 + v2 + (v3 * v4) + v5;
   }

   // ─── VALIDACIÓN ──────────────────────────────────────────────────────────────

   T2Check(): { Proceed: number; Message: string } {
      let iProceed = 1;
      let strMessage = '';

      if (this.TipoJapones !== '2') {
         if (this.PJ_Ancho_2 === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho del Mecanismo'; }
         if (iProceed && this.PJ_Alto_1 === '') { iProceed = 0; strMessage = 'Debe indicar el Alto'; }
         if (iProceed && this.PJ_NumeroVias_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Número de Vías'; }
         if (iProceed && this.PJ_ColorRiel_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Color del Mecanismo'; }
         if (iProceed && this.PJ_PosicionMando_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar la Posición del Mando'; }
         if (iProceed && this.PJ_TipoRecogida_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Tipo de Recogida'; }
         if (iProceed && this.PJ_TipoSoporte_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Tipo de Soporte'; }
         if (iProceed && this.PJ_Contrapeso_1 === '-1') { iProceed = 0; strMessage = 'Debe indicar si lleva Contrapeso'; }
      }

      if (this.TipoJapones !== '3') {
         if (iProceed && parseInt(this.Tipo2_Tejido) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Tejido'; }
         if (iProceed && parseInt(this.Tipo2_TejidoColor) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Color del Tejido'; }
         if (iProceed && this.PJ_AnchoLama === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho de Lama'; }
         if (iProceed && this.PJ_AltoLamaTerminada === '') { iProceed = 0; strMessage = 'Debe indicar el Alto de Lama Terminada'; }
      }

      return { Proceed: iProceed, Message: strMessage };
   }

   // ─── AGREGAR ─────────────────────────────────────────────────────────────────

   Agregar(): void {
      const retValue = this.T2Check();
      if (retValue.Proceed !== 1) {
         this.toaster.error(retValue.Message, 'ERROR');
         return;
      }

      const colores = [
         this.Tipo2_TejidoColor,
         this.Tipo2_TejidoColor_2,
         this.Tipo2_TejidoColor_3,
         this.Tipo2_TejidoColor_4,
         this.Tipo2_TejidoColor_5
      ];

      const preciosCompleto = this.buildPreciosCompleto();

      const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

      if (this.TipoJapones == '1' || this.TipoJapones == '2') {


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
            it102sc = this.pj_tejidosC_2[this.getPos(this.pj_tejidosC_2, it102c)].text;
         }

         if (it103c > -1) {
            it103sc = this.pj_tejidosC_3[this.getPos(this.pj_tejidosC_3, it103c)].text;
         }

         if (it104c > -1) {
            it104sc = this.pj_tejidosC_4[this.getPos(this.pj_tejidosC_4, it104c)].text;
         }

         if (it105c > -1) {
            it105sc = this.pj_tejidosC_5[this.getPos(this.pj_tejidosC_5, it105c)].text;
         }

      } else {
         var it20 = -1;
         it20s = "";
         var it21 = -1;
         it21s = "";

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
         this.PJ_Ancho_2, this.PJ_NumeroVias_2, this.PJ_PosicionMando_2, this.PJ_TipoRecogida_2, this.PJ_ColorRiel_2, this.PJ_TipoSoporte_2, this.PJ_NumeroPortatelas, this.PJ_NumeroLamas, Number(this.PJ_AnchoLama),
         Number(this.PJ_AltoLamaTerminada), Number(this.TipoJapones), Number(this.PJ_NumeroPanos),
         this.Tipo2_Tejido, this.Tipo2_TejidoColor, this.Tipo2_TejidoColor_2, this.Tipo2_TejidoColor_3,
         this.Tipo2_TejidoColor_4, this.Tipo2_TejidoColor_5,
         it102s + " " + it102sc, it103s + " " + it103sc, it104s + " " + it104sc, it105s + " " + it105sc,
         this.PJ_CombinarColores,
         this.precios);

      this.onAdd.emit(tipo);
      const message = this.translation.get('AGREGADO PANEL JAPONÉS A CESTA');
      this.toaster.success(message, 'Cesta');
      this.reset();
   }

   private buildPreciosCompleto(): any {
      return {
         T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: '', T1_Inc_CadenaMetalica: 0,
         T1_Inc_CadenaMetalica_C1: '', T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
         T1_Inc_Mando: 0, T1_Inc_Mando_C1: '', T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
         T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: '', T1_Transporte: '',
         ...this.precios,
         T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
         T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
         T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: '', T3_Transporte: '',
         T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,
         T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
         T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: '', T4_Transporte: ''
      };
   }

   // Rellena el formulario en modo edición usando las propiedades reales que
   // Japones_Add_T1 deja en el CortinaTipo (no las de un DTO plano de backend).
   // Las cascadas tejido->color se resuelven aquí directamente (sin pasar por
   // ChangeTipo2Tejido/load_PJ_TejidosColores) porque esos métodos siempre
   // preseleccionan el primer elemento de la lista recién cargada.
   cargarEdicion(item: any): void {
      this.TipoJapones = item.PJ_TipoJapones != null ? item.PJ_TipoJapones.toString() : '1';
      this.PJ_Cantidad_1 = item.PJ_Cantidad_1;
      this.PJ_Ancho_1 = item.PJ_Ancho_1;
      this.PJ_Alto_1 = item.PJ_Alto_1;
      this.PJ_Ancho_2 = item.PJ_Ancho_2;
      this.PJ_NumeroVias_2 = item.PJ_NumeroVias_2;
      this.PJ_PosicionMando_2 = item.PJ_PosicionMando_2;
      this.PJ_TipoRecogida_2 = item.PJ_TipoRecogida_2;
      this.PJ_ColorRiel_2 = item.PJ_ColorRiel_2;
      this.PJ_TipoSoporte_2 = item.PJ_TipoSoporte_2;
      this.PJ_NumeroPortatelas = item.PJ_NumeroPortatelas;
      this.PJ_Contrapeso_1 = item.PJ_Contrapeso_1;
      this.PJ_NumeroLamas = item.PJ_NumeroLamas;
      this.PJ_AnchoLama = item.PJ_AnchoLama;
      this.PJ_AltoLamaTerminada = item.PJ_AltoLamaTerminada;
      this.PJ_ID_Quiero = item.impresion;
      this.PJ_ID_Imagen = item.impresion_imagen;
      this.idSeleccion = null;
      this.PJ_CombinarColores = item.PJ_CombinarColores;
      this.Tipo2_Estancia = item.PJ_Estancia;
      this.Tipo2_Estancia_Obs = item.PJ_Estancia_Obs;

      const cliente = parseInt(this.Cliente);
      const tejidoId = item.PJ_tejidos_id;
      this.Tipo2_Tejido = tejidoId != null ? tejidoId.toString() : '-1';

      const loadColorSlot = (slot: number, colorId: any) => {
         const color$ = this.PJ_ID_Quiero
            ? this.service.getTejidosColorID(tejidoId, cliente, this.SubCliente)
            : this.service.getTejidosColor(tejidoId, cliente, this.SubCliente);
         color$.subscribe(
            data => {
               const pos = this.getPos(data, colorId);
               const selected = pos >= 0 ? data[pos].id.toString() : (data.length ? data[0].id.toString() : '-1');
               if (slot === 1) { this.pj_tejidosC = data; this.Tipo2_TejidoColor = selected; }
               if (slot === 2) { this.pj_tejidosC_2 = data; this.Tipo2_TejidoColor_2 = selected; }
               if (slot === 3) { this.pj_tejidosC_3 = data; this.Tipo2_TejidoColor_3 = selected; }
               if (slot === 4) { this.pj_tejidosC_4 = data; this.Tipo2_TejidoColor_4 = selected; }
               if (slot === 5) { this.pj_tejidosC_5 = data; this.Tipo2_TejidoColor_5 = selected; }
            },
            error => { console.log(error); }
         );
      };

      loadColorSlot(1, item.PJ_tejidosC_id);
      if (this.PJ_CombinarColores) {
         if (this.PJ_NumeroLamas >= 2) { loadColorSlot(2, item.Tipo2_TejidoColor_2); }
         if (this.PJ_NumeroLamas >= 3) { loadColorSlot(3, item.Tipo2_TejidoColor_3); }
         if (this.PJ_NumeroLamas >= 4) { loadColorSlot(4, item.Tipo2_TejidoColor_4); }
         if (this.PJ_NumeroLamas >= 5) { loadColorSlot(5, item.Tipo2_TejidoColor_5); }
      }
   }

   // ─── HELPERS ─────────────────────────────────────────────────────────────────

   getPos(array: any[], value: any): number {
      for (let i = 0; i < array.length; i++) {
         if (array[i].id == value) return i;
      }
      return -1;
   }

   Next(e: any, current: any): void {
      if (current && current.focus) current.focus();
   }


   T2Add(add: number) {

      var iProceed: number = 1;
      var strMessage: string = "";


      if (this.PJ_Cantidad_1 == "") {
         iProceed = 0;
         strMessage = "Debe Seleccionar la Cantidad";
      }

      if (this.PJ_Ancho_2 == "" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el Ancho del Mecanismo";
         var control = $('#pj_ancho_2');
         if (control != null) {
            //console.log(control);
         }
      }

      if (this.PJ_Alto_1 == "" && iProceed == 1) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el Alto";
      }

      if (this.PJ_NumeroVias_2 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el número de vias";
      }

      if (this.PJ_NumeroPortatelas.toString() == "" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el número de portatelas";
      }

      if (this.PJ_Ancho_1 == "" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el Ancho del Portatela";
      }



      if (this.PJ_ColorRiel_2 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el color del mecanismo";
      }

      if (this.PJ_PosicionMando_2 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar la posición del mando";
      }

      if (this.PJ_TipoRecogida_2 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el tipo de recogida";
      }

      if (this.PJ_TipoSoporte_2 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el tipo de soporte";
      }

      if (this.PJ_Contrapeso_1 == "-1" && iProceed == 1 && !(this.TipoJapones == '2')) {
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


      if (parseInt(this.Tipo2_Tejido) == -1 && iProceed == 1 && !(this.TipoJapones == '3')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el Tejido";
      }

      if (parseInt(this.Tipo2_TejidoColor) == -1 && iProceed == 1 && !(this.TipoJapones == '3')) {
         iProceed = 0;
         strMessage = "Debe Seleccionar el Color del Tejido";
      }



      if (iProceed == 1) {
         var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

         if (this.TipoJapones == '1' || this.TipoJapones == '2') {


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
               it102sc = this.pj_tejidosC_2[this.getPos(this.pj_tejidosC_2, it102c)].text;
            }

            if (it103c > -1) {
               it103sc = this.pj_tejidosC_3[this.getPos(this.pj_tejidosC_3, it103c)].text;
            }

            if (it104c > -1) {
               it104sc = this.pj_tejidosC_4[this.getPos(this.pj_tejidosC_4, it104c)].text;
            }

            if (it105c > -1) {
               it105sc = this.pj_tejidosC_5[this.getPos(this.pj_tejidosC_5, it105c)].text;
            }

         } else {
            var it20 = -1;
            it20s = "";
            var it21 = -1;
            it21s = "";

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
            this.PJ_Ancho_2, this.PJ_NumeroVias_2, this.PJ_PosicionMando_2, this.PJ_TipoRecogida_2, this.PJ_ColorRiel_2, this.PJ_TipoSoporte_2, this.PJ_NumeroPortatelas, this.PJ_NumeroLamas, Number(this.PJ_AnchoLama),
            Number(this.PJ_AltoLamaTerminada), Number(this.TipoJapones), Number(this.PJ_NumeroPanos),
            this.Tipo2_Tejido, this.Tipo2_TejidoColor, this.Tipo2_TejidoColor_2, this.Tipo2_TejidoColor_3,
            this.Tipo2_TejidoColor_4, this.Tipo2_TejidoColor_5,
            it102s + " " + it102sc, it103s + " " + it103sc, it104s + " " + it104sc, it105s + " " + it105sc,
            this.PJ_CombinarColores,
            this.precios);


         this.CestaPrecios = [];
         this.CestaPrecios.push(tipo);




      }
      else {
         this.toaster.error(strMessage, 'ERROR');
      }

   }

   /*
      ChangeTipo2Tejido() {
   
         var tejido = this.Tipo2_Tejido;
         var impresion = this.PJ_ID_Quiero;
   
         if (impresion == true) {
            this.load_TejidosColoresPJID(parseInt(tejido));
         }
         else {
            this.load_TejidosColoresPJ(parseInt(tejido));
         }
   
   
         //this.CalculateFechaPrevista("1", "2", tejido);
   
         var pos2 = this.getPos(this.pj_tejidos, tejido);
         if (pos2 >= 0) {
            this.CodigoProv2 = this.pj_tejidos[pos2].codigoprov;
         }
      }
   */

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
               this.asignaPrecios();
            },
            error => {
               this.toaster.error(error.message);
            }
         );

   }

   ChangeTipo2SinTejido() {
      this.CalculateC1_Tipo2();
      this.asignaPrecios();
   }


   load_TejidosColoresPJ(item: number) {
      this.service.getTejidosColorPJ(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {
            this.pj_tejidosC = data;
            this.pj_tejidosC.push({ 'id': -1, 'text': 'Ninguno', 'codigoprov': '' });

            this.Tipo2_TejidoColor = "-1";

            this.pj_tejidosC_2 = data;
            this.pj_tejidosC_3 = data;
            this.pj_tejidosC_4 = data;
            this.pj_tejidosC_5 = data;
         },
         error => {
            console.log(error);
         }
      );
   }

   load_TejidosColoresPJID(item: number) {
      this.service.getTejidosColorID(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {

            this.pj_tejidosC = data;
            this.pj_tejidosC.push({ 'id': -1, 'text': 'Ninguno', 'codigoprov': '' });

            this.Tipo2_TejidoColor = "-1";

            this.pj_tejidosC_2 = data;
            this.pj_tejidosC_3 = data;
            this.pj_tejidosC_4 = data;
            this.pj_tejidosC_5 = data;
         },
         error => {
            console.log(error);
         }
      );
   }

   CheckPrice() {
      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T2Check();

      if (retValue.Proceed == 0) {
         this.toaster.error(retValue.Message, 'ATENCION');
      } else {

         var pvp_cantidad = parseInt(this.PJ_Cantidad_1);
         var pvp = 0;
         var code_c1 = '';
         var msg_c1 = "";
         var nohaytarifa = false;
         var ancho = this.PJ_AnchoLama.toString();
         var ancholama = ancho;
         var alto = this.PJ_AltoLamaTerminada.toString();
         var tejido = this.Tipo2_Tejido;
         var impresion = "0";

         if (this.PJ_ID_Quiero) {
            impresion = "1";
         }

         if (tejido != "-1") {
            var cantidad = Number(this.PJ_Cantidad_1);
            pvp_cantidad = cantidad * this.PJ_NumeroLamas;
         }

         if (this.TipoJapones == '3') {
            this.precios.T2_Tejido = 0;
            this.precios.T2_Tejido_C1 = "";
            this.ChangeTipo2SinTejido();
         }


         this.T2Add(0);

         this.calculando = true;
         let message: string = this.translation.get("VALORANDO");
         this.toaster.info(message, "Valoración");

         if (this.CestaPrecios.length == 0) {
            this.toaster.error("No hay lineas");
            return -1;
         }

         let pedido = {
            "lineas": this.CestaPrecios,
            "referencia": this.ReferenciaTienda,
            "cliente": parseInt(this.Cliente)
         }

         let lineas = JSON.stringify(pedido);
         this.service.altaPrecios(lineas).subscribe(
            data => {
               this.calculando = false;
               console.log(data);


               if (data.message === "OK") {
                  pvp = data.v1;
                  code_c1 = data.v2;
                  this.idLinea = data.idLinea;
                  if (pvp == -99) {
                     msg_c1 = code_c1;
                     this.toaster.error(msg_c1, "Error medidas")
                     pvp = 0;
                     code_c1 = "";
                     this.idLinea = "";
                     nohaytarifa = true;
                  }
                  else {
                     let message = this.translation.get("PRODUCTOVALORADO");
                     this.toaster.info(message, "Valoración");

                     if (nohaytarifa == false) {
                        this.precios.T2_Cantidad = pvp_cantidad;
                        this.precios.T2_Tejido = pvp_cantidad * pvp;
                        this.precios.T2_Tejido_C1 = code_c1;
                        this.CalculateC1_Tipo2();
                     }
                     else {
                        this.resetPrecios();
                     }
                  }
               }
               else {
                  pvp = 0;
                  code_c1 = "";
                  this.idLinea = "";
               }


            },
            error => {
               this.toaster.error(error.message);
            }
         );
      }

   }
}