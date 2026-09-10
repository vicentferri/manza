import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SMAPIService } from '../config/smapi.service';
import { CortinaTipo } from '../config/CortinaTipo';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';
import { Tipo } from '../config/Tipo';
import { ImpresionDigitalSelectorComponent, ImpresionDigitalSeleccion } from '../../shared/impresion-digital-selector/impresion-digital-selector.component';

@Component({
   selector: 'manza-vertical',
   templateUrl: './vertical.component.html',
   providers: [SMAPIService]
})
export class VerticalComponent implements OnInit, OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Input() Global_Visualizar_C1_Parciales: boolean = false;

   @Output() onAdd = new EventEmitter<CortinaTipo>();

   public CestaPrecios: Array<CortinaTipo> = [];

   calculando: boolean = false;

   // Selección: Vertical / Vertical Inclinada
   PV_SEL_1: boolean = true;
   PV_SEL_2: boolean = false;

   VerticalInclinada: string = '0';
   TipoVertical: string = '1'; // 1=Tejido+Riel, 2=Solo Tejido, 3=Solo Riel

   idLinea = "";

   // Vertical normal (PV1)
   PV_Ancho_1: string = '';
   PV_Alto_1: string = '';
   PV_Cantidad_1: string = '1';
   PV_AnchoLama_1: string = '-1';
   PV_PosicionMecanismo_1: string = '-1';
   PV_ColorRiel_1: string = '-1';
   PV_Accionamiento_1: string = '-1';
   PV_TipoSoporte_1: string = '-1';
   PV_TipoRecogida_1: string = '-1';
   PV_ID_Quiero_1: boolean = false;
   PV_ID_Imagen_1: string = '';
   idSeleccion1: ImpresionDigitalSeleccion = null;
   @ViewChild('idSelector1', { static: false }) idSelector1!: ImpresionDigitalSelectorComponent;
   Tipo3_Tejido: string = '-1';
   Tipo3_TejidoColor1: string = '-1';
   Tipo3_TejidoColor2: string = '-1';
   CodigoProv31: string = '';
   Tipo3_Estancia: string = '-1';
   Tipo3_Estancia_Obs: string = '';

   // Vertical inclinada (PV2)
   PV_Ancho_2: string = '';
   PV_Cantidad_2: string = '1';
   PV_AlturaMin_2: string = '';
   PV_AlturaMax_2: string = '';
   PV_AnchoLama_2: string = '-1';
   PV_PosicionMecanismo_2: string = '-1';
   PV_ColorRiel_2: string = '-1';
   PV_Accionamiento_2: string = 'COR';
   PV_TipoSoporte_2: string = '-1';
   PV_TipoRecogida_2: string = '-1';
   PV_ID_Quiero_2: boolean = false;
   PV_ID_Imagen_2: string = '';
   idSeleccion2: ImpresionDigitalSeleccion = null;
   @ViewChild('idSelector2', { static: false }) idSelector2!: ImpresionDigitalSelectorComponent;
   Tipo3_Tejido_2: string = '-1';
   Tipo3_TejidoColor1_2: string = '-1';
   Tipo3_TejidoColor2_2: string = '-1';
   CodigoProv32: string = '';
   Tipo31_Estancia: string = '-1';
   Tipo31_Estancia_Obs: string = '';

   Tipo3_PrecioMecanismo = 0;

   // Tejidos
   pv_tejidos_1: any[] = [];
   pv_tejidosC_1: any[] = [];
   pv_tejidosC_2: any[] = [];

   // Labels dinámicos
   Tipo3_TipoSoporte_Label: string = 'Soporte:';
   Tipo32_TipoSoporte_Label: string = 'Soporte:';
   Tipo4_Accionamiento_Label: string = 'Accionamiento:';
   Tipo4_Accionamiento_Label_2: string = 'Accionamiento:';
   Tipo3_Incremento_Tejidos: string = '';
   Tipo32_Incremento_Tejidos: string = '';
   Accesorios_Verticales: string = '';
   Tipo3_Desglose: boolean = false;


   // Precios
   precios = {
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
   };

   public pv_tejidosC2_1: Array<Tipo> = [];
   public pv_tejidosC2_2: Array<Tipo> = [];

   public Estancias: any = [];

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
         this.load_PV_Tejidos();
      }
   }

   CambiaTipoVertical() {
      if (this.VerticalInclinada == '0') {
         this.PV_SEL_1 = true;
         this.PV_SEL_2 = false;
      } else {
         this.PV_SEL_1 = false;
         this.PV_SEL_2 = true;
      }
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


   // ─── RESET ───────────────────────────────────────────────────────────────────

   NewPage() {
      this.Tipo3_Tejido = "-1";
      this.Tipo3_TejidoColor1 = "-1";
      this.Tipo3_TejidoColor2 = "-1";
      this.Tipo3_Tejido_2 = "-1";
      this.Tipo3_TejidoColor1_2 = "-1";
      this.Tipo3_TejidoColor2_2 = "-1";
      this.Tipo3_Incremento_Tejidos = "";
      this.Tipo32_Incremento_Tejidos = "";
      this.Tipo3_TipoSoporte_Label = "Tipo de Soporte";
      this.Tipo3_Estancia = "-1";
      this.Tipo3_Estancia_Obs = "";
      this.Tipo31_Estancia = "-1";
      this.Tipo31_Estancia_Obs = "";

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
      this.PV_ID_Quiero_1 = false;
      this.PV_ID_Imagen_1 = "";
      this.idSeleccion1 = null;
      this.PV_ID_Quiero_2 = false;
      this.PV_ID_Imagen_2 = "";
      this.idSeleccion2 = null;

      this.CodigoProv31 = "";
      this.CodigoProv32 = "";
   }

   reset(): void {
      this.PV_SEL_1 = true;
      this.PV_SEL_2 = false;
      this.TipoVertical = '1';
      this.PV_Ancho_1 = ''; this.PV_Alto_1 = ''; this.PV_Cantidad_1 = '1';
      this.PV_AnchoLama_1 = '-1'; this.PV_PosicionMecanismo_1 = '-1';
      this.PV_ColorRiel_1 = '-1'; this.PV_Accionamiento_1 = '-1';
      this.PV_TipoSoporte_1 = '-1'; this.PV_TipoRecogida_1 = '-1';
      this.PV_ID_Quiero_1 = false; this.PV_ID_Imagen_1 = ''; this.idSeleccion1 = null;
      this.Tipo3_Tejido = '-1'; this.Tipo3_TejidoColor1 = '-1'; this.Tipo3_TejidoColor2 = '-1';
      this.CodigoProv31 = '';
      this.Tipo3_Estancia = '-1'; this.Tipo3_Estancia_Obs = '';
      this.PV_Ancho_2 = ''; this.PV_Cantidad_2 = '1';
      this.PV_AlturaMin_2 = ''; this.PV_AlturaMax_2 = '';
      this.PV_AnchoLama_2 = '-1'; this.PV_PosicionMecanismo_2 = '-1';
      this.PV_ColorRiel_2 = '-1'; this.PV_Accionamiento_2 = 'COR';
      this.PV_TipoSoporte_2 = '-1'; this.PV_TipoRecogida_2 = '-1';
      this.PV_ID_Quiero_2 = false; this.PV_ID_Imagen_2 = ''; this.idSeleccion2 = null;
      this.Tipo3_Tejido_2 = '-1'; this.Tipo3_TejidoColor1_2 = '-1'; this.Tipo3_TejidoColor2_2 = '-1';
      this.CodigoProv32 = '';
      this.Tipo31_Estancia = '-1'; this.Tipo31_Estancia_Obs = '';
      this.Tipo3_Desglose = false;
      this.Tipo3_Incremento_Tejidos = '';
      this.Tipo32_Incremento_Tejidos = '';
      this.Accesorios_Verticales = '';
      this.resetPrecios();
      this.load_PV_Tejidos();
   }

   resetPrecios(): void {
      this.precios = {
         T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '',
         T3_TejidosCombinados: 0, T3_TejidosCombinados_C1: '',
         T3_TipoSoporte: 0, T3_NumSoportes: 0, T3_TipoSoporte_C1: '',
         T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: '', T3_Transporte: '',
         T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '',
         T32_TejidosCombinados: 0, T32_TejidosCombinados_C1: '',
         T32_TipoSoporte: 0, T32_NumSoportes: 0, T32_TipoSoporte_C1: '',
      };
   }

   // ─── CARGA ────────────────────────────────────────────────────────────────────

   load_PV_Tejidos(): void {
      this.service.getTejidosProducto(this.Cliente, '3', this.SubCliente).subscribe(
         data => {
            this.pv_tejidos_1 = data;
            this.pv_tejidos_1.unshift({ id: -1, text: 'Seleccionar', codigoprov: '' });
         },
         error => console.log(error)
      );
   }

   load_PV_TejidosColores(tejidoId: number, slot: number): void {
      this.service.getTejidosColor(tejidoId, parseInt(this.Cliente), this.SubCliente).subscribe(
         data => {
            if (slot === 1) { this.pv_tejidosC_1 = data; if (data.length > 0) this.Tipo3_TejidoColor1 = data[0].id.toString(); }
            if (slot === 2) { this.pv_tejidosC_2 = data; if (data.length > 0) this.Tipo3_TejidoColor2 = data[0].id.toString(); }
         },
         error => console.log(error)
      );
   }

   load_PV_TejidosColoresID(tejidoId: number, slot: number): void {
      this.service.getTejidosColorID(tejidoId, parseInt(this.Cliente), this.SubCliente).subscribe(
         data => {
            if (slot === 1) { this.pv_tejidosC_1 = data; if (data.length > 0) this.Tipo3_TejidoColor1 = data[0].id.toString(); }
            if (slot === 2) { this.pv_tejidosC_2 = data; if (data.length > 0) this.Tipo3_TejidoColor2 = data[0].id.toString(); }
         },
         error => console.log(error)
      );
   }

   // ─── CHANGE HANDLERS ─────────────────────────────────────────────────────────

   SelectVertical(num: number): void {
      if (num === 1 && !this.PV_SEL_1) this.PV_SEL_2 = false;
      if (num === 2 && !this.PV_SEL_2) this.PV_SEL_1 = false;
   }

   ChangeTipo3Tejido(): void {
      this.CodigoProv31 = '';
      const tejido = parseInt(this.Tipo3_Tejido);
      if (tejido > 0) {
         const pos = this.getPos(this.pv_tejidos_1, tejido);
         if (pos >= 0) this.CodigoProv31 = this.pv_tejidos_1[pos].codigoprov || '';

         if (this.PV_ID_Quiero_1) {
            this.load_PV_TejidosColoresID(tejido, 1);
            this.load_PV_TejidosColoresID(tejido, 2);
         } else {
            this.load_PV_TejidosColores(tejido, 1);
            this.load_PV_TejidosColores(tejido, 2);
         }
      }
   }

   ChangeTipo3Tejido_2(): void {
      this.CodigoProv32 = '';
      const tejido = parseInt(this.Tipo3_Tejido_2);
      if (tejido > 0) {
         const pos = this.getPos(this.pv_tejidos_1, tejido);
         if (pos >= 0) this.CodigoProv32 = this.pv_tejidos_1[pos].codigoprov || '';
         if (this.PV_ID_Quiero_2) {
            this.load_PV_TejidosColoresID(tejido, 2);
         } else {
            this.load_PV_TejidosColores(tejido, 2);
         }
      }
   }

   selImpresionDigital_Tipo3_1(): void {
      if (this.PV_ID_Quiero_1) {
         this.service.getTejidosProductoID(this.Cliente, '3', this.SubCliente).subscribe(
            data => { this.pv_tejidos_1 = data; },
            error => console.log(error)
         );
      } else {
         this.load_PV_Tejidos();
         this.idSeleccion1 = null;
         this.PV_ID_Imagen_1 = '';
      }
   }

   onImpresionDigitalSeleccionada1(sel: ImpresionDigitalSeleccion): void {
      this.idSeleccion1 = sel;
      this.PV_ID_Imagen_1 = sel.nombre + (sel.texto ? ' — "' + sel.texto + '"' : '');
   }

   quitarImpresionDigital1(): void {
      this.idSeleccion1 = null;
      this.PV_ID_Imagen_1 = '';
   }

   onImpresionDigitalSeleccionada2(sel: ImpresionDigitalSeleccion): void {
      this.idSeleccion2 = sel;
      this.PV_ID_Imagen_2 = sel.nombre + (sel.texto ? ' — "' + sel.texto + '"' : '');
   }

   quitarImpresionDigital2(): void {
      this.idSeleccion2 = null;
      this.PV_ID_Imagen_2 = '';
   }

   selImpresionDigital_Tipo3_2(): void {
      // mismo comportamiento que tipo3_1 pero para el segundo panel
      this.selImpresionDigital_Tipo3_1();
      if (!this.PV_ID_Quiero_2) {
         this.idSeleccion2 = null;
         this.PV_ID_Imagen_2 = '';
      }
   }

   Change_Compac_Accionamiento(): void {
      // Lógica de label si aplica
   }

   Change_Compac_Accionamiento_2(): void {
      // Solo cordón disponible en inclinada
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
         let message: string = this.translation.get("NO PUEDE FABRICARSE LA VERTICAL CON LAS MEDIDAS INDICADAS");

         this.toaster.error(message, 'ERROR');
      }
   }


   // ─── TARIFAS ─────────────────────────────────────────────────────────────────

   Recalcular_Tipo3(): void {
      this.calcularTejidosCombinados();
      this.calcularSoporteYTotales();
   }

   private calcularTejidosCombinados(): void {
      if (this.PV_SEL_1) {
         const combinados = this.Tipo3_TejidoColor1 !== this.Tipo3_TejidoColor2;
         this.precios.T3_TejidosCombinados = combinados ? 20.51 : 0;
         this.precios.T3_TejidosCombinados_C1 = combinados
            ? this.getCombinados_C1(this.precios.T3_Cantidad, 1052)
            : '';
         this.Tipo3_Incremento_Tejidos = combinados ? '+ 20.51€ (C1 0001052)' : '';
      }

      if (this.PV_SEL_2) {
         const combinados = this.Tipo3_TejidoColor1_2 !== this.Tipo3_TejidoColor2_2;
         this.precios.T32_TejidosCombinados = combinados ? 82.09 : 0;
         this.precios.T32_TejidosCombinados_C1 = combinados ? 'C1 0004210' : '';
         this.Tipo32_Incremento_Tejidos = combinados ? '+ 82.09€ (C1 0004210)' : '';
      }
   }

   private getCombinados_C1(cantidad: number, base: number): string {
      const valor = cantidad * base;
      return `C1 ${valor.toString().padStart(7, '0')}`;
   }

   private calcularSoporteYTotales(): void {
      const usaSel1 = this.PV_SEL_1;
      const soporte = usaSel1 ? this.PV_TipoSoporte_1 : this.PV_TipoSoporte_2;
      const ancho = usaSel1 ? this.PV_Ancho_1 : this.PV_Ancho_2;
      const cantidad = usaSel1 ? this.precios.T3_Cantidad : this.precios.T32_Cantidad;
      const sancho = this.getSanchoFromSoporte(soporte);

      if (soporte === '-1' || sancho === '0') {
         this.resetSoporte(usaSel1);
         this.CalculateC1_Tipo3();
         return;
      }

      const numSoportes = Math.round(Number(ancho) / 50.0) * cantidad;

      this.service.getTarifaAccesorio('1', sancho, numSoportes).subscribe(
         data => {
            if (data.message === 'OK') {
               this.setSoporte(usaSel1, numSoportes, data.v1, data.v2, ancho, cantidad);
            } else {
               this.resetSoporte(usaSel1);
            }
            this.CalculateC1_Tipo3();
         },
         error => console.error(error)
      );
   }

   private getSanchoFromSoporte(soporte: string): string {
      const map: Record<string, string> = { P08: '80', P12: '120', P15: '150' };
      return map[soporte] || '0';
   }

   private setSoporte(sel1: boolean, num: number, precio: number, c1: string, ancho: string, cantidad: number): void {
      const label = `Tipo de Soporte: (${num} x ${precio}€)`;
      if (sel1) {
         this.Tipo3_TipoSoporte_Label = label;
         this.precios.T3_NumSoportes = num;
         this.precios.T3_TipoSoporte = precio;
         this.precios.T3_TipoSoporte_C1 = c1;
      } else {
         this.Tipo32_TipoSoporte_Label = label;
         this.precios.T32_NumSoportes = num;
         this.precios.T32_TipoSoporte = precio;
         this.precios.T32_TipoSoporte_C1 = c1;
      }
   }

   private resetSoporte(sel1: boolean): void {
      if (sel1) {
         this.Tipo3_TipoSoporte_Label = 'Tipo de Soporte';
         this.precios.T3_NumSoportes = 0;
         this.precios.T3_TipoSoporte = 0;
         this.precios.T3_TipoSoporte_C1 = '';
      } else {
         this.Tipo32_TipoSoporte_Label = 'Tipo de Soporte';
         this.precios.T32_NumSoportes = 0;
         this.precios.T32_TipoSoporte = 0;
         this.precios.T32_TipoSoporte_C1 = '';
      }
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


   CalculateC1_Tipo3() {
      if (this.PV_SEL_1) {
         this.service.getSum(this.precios.T3_Tejido_C1, this.precios.T3_TejidosCombinados_C1,
            this.precios.T3_TipoSoporte_C1, "", "", "", "", "").subscribe(
               data => {
                  this.precios.T3_PVP_C1 = data[0].res;
                  this.asignaPrecios();
               },
               error => {
                  console.log(error);
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
                  console.log(error);
               }
            );
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



   asignaPrecios(): void {
      const cantidad = parseInt(this.PV_Cantidad_1) || 1;
      this.precios.T3_PVP = cantidad * (
         this.precios.T3_Tejido
         + this.precios.T3_TejidosCombinados
         + this.precios.T3_NumSoportes * this.precios.T3_TipoSoporte
      );
   }

   // ─── VALIDACIÓN ──────────────────────────────────────────────────────────────
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


      if (!bretValue)
         this.toaster.error(strMessage, 'ATENCION');

      return bretValue;
   }

   T3Check(): { Proceed: number; Message: string } {
      let iProceed = 1;
      let strMessage = '';

      if (!this.PV_SEL_1 && !this.PV_SEL_2) {
         return { Proceed: 0, Message: 'Debe seleccionar al menos un tipo de Vertical' };
      }

      if (this.PV_SEL_1) {
         if (this.TipoVertical !== '2' && this.PV_Ancho_1 === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho (Vertical)'; }
         if (iProceed && this.TipoVertical !== '3' && this.PV_Alto_1 === '') { iProceed = 0; strMessage = 'Debe indicar el Alto (Vertical)'; }
         if (iProceed && this.PV_AnchoLama_1 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Ancho de Lama'; }
         if (iProceed && this.TipoVertical !== '2' && this.PV_TipoSoporte_1 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Soporte (Vertical)'; }
         if (iProceed && this.TipoVertical !== '3' && parseInt(this.Tipo3_Tejido) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Tejido (Vertical)'; }
         if (iProceed && this.TipoVertical !== '3' && parseInt(this.Tipo3_TejidoColor1) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Color del Tejido (Vertical)'; }
      }

      if (iProceed && this.PV_SEL_2) {
         if (this.PV_Ancho_2 === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho (Vertical Inclinada)'; }
         if (iProceed && this.PV_AlturaMin_2 === '') { iProceed = 0; strMessage = 'Debe indicar la Altura Mínima'; }
         if (iProceed && this.PV_AlturaMax_2 === '') { iProceed = 0; strMessage = 'Debe indicar la Altura Máxima'; }
         if (iProceed && this.PV_AnchoLama_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Ancho de Lama (Inclinada)'; }
         if (iProceed && this.PV_TipoSoporte_2 === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Soporte (Vertical Inclinada)'; }
         if (iProceed && parseInt(this.Tipo3_Tejido_2) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Tejido (Vertical Inclinada)'; }
      }

      return { Proceed: iProceed, Message: strMessage };
   }

   ResetPrices() {

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
   }

   // ─── AGREGAR ─────────────────────────────────────────────────────────────────

   Agregar(): void {
      const retValue = this.T3Check();
      if (retValue.Proceed !== 1) {
         this.toaster.error(retValue.Message, 'ERROR');
         return;
      }

      const preciosCompleto = this.buildPreciosCompleto();
      const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

      if (this.PV_SEL_1) {
         tipo.Vertical_Add_T1(
            this.PV_Ancho_1, this.PV_Alto_1, this.PV_Cantidad_1,
            this.PV_AnchoLama_1, this.PV_PosicionMecanismo_1, this.PV_ColorRiel_1,
            this.PV_Accionamiento_1, this.PV_TipoSoporte_1, this.PV_TipoRecogida_1,
            parseInt(this.Tipo3_Tejido), '',
            parseInt(this.Tipo3_TejidoColor1), '',
            parseInt(this.Tipo3_TejidoColor2), '',
            this.Tipo3_Estancia, this.Tipo3_Estancia_Obs,
            Number(this.TipoVertical),
            this.PV_ID_Quiero_1, this.PV_ID_Imagen_1,
            preciosCompleto
         );
      }



      if (this.PV_SEL_2) {
         tipo.Vertical_Add_T2(
            this.PV_Ancho_2, this.PV_Cantidad_2, this.PV_AlturaMin_2, this.PV_AlturaMax_2,
            this.PV_AnchoLama_2, this.PV_PosicionMecanismo_2, this.PV_ColorRiel_2,
            this.PV_Accionamiento_2, this.PV_TipoSoporte_2, this.PV_TipoRecogida_2,
            this.Tipo31_Estancia, this.Tipo31_Estancia_Obs,
            Number(this.TipoVertical),
            this.PV_ID_Quiero_2, this.PV_ID_Imagen_2,
            preciosCompleto
         );
      }

      this.onAdd.emit(tipo);
      const message = this.translation.get('AGREGADO VERTICAL A CESTA');
      this.toaster.success(message, 'Cesta');
      this.reset();
   }

   private buildPreciosCompleto(): any {
      return {
         T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: '', T1_Inc_CadenaMetalica: 0,
         T1_Inc_CadenaMetalica_C1: '', T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
         T1_Inc_Mando: 0, T1_Inc_Mando_C1: '', T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
         T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: '', T1_Transporte: '',
         T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '', T2_NumeroVias: 0,
         T2_NumeroVias_C1: '', T2_NumSoportes: 0, T2_TipoSoporte: 0, T2_TipoSoporte_C1: '',
         T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '', T2_PVP: 0, T2_PVP_C1: '',
         T2_Fecha_Entrega: '', T2_Transporte: '', T2_SoporteTotal: 0,
         ...this.precios,
         T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
         T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: '', T4_Transporte: ''
      };
   }

   // Rellena el formulario en modo edición a partir de las propiedades reales que
   // Vertical_Add_T1/T2 dejan en el CortinaTipo. Las cascadas tejido->color se
   // resuelven aquí directamente (sin pasar por ChangeTipo3Tejido/ChangeTipo3Tejido_2)
   // porque esos métodos siempre preseleccionan el primer elemento de la lista cargada.
   cargarEdicion(item: any): void {
      this.PV_SEL_1 = !!item.PV_SEL_1;
      this.PV_SEL_2 = !!item.PV_SEL_2;
      this.VerticalInclinada = this.PV_SEL_2 ? '1' : '0';
      this.TipoVertical = item.TipoVertical != null ? item.TipoVertical.toString() : '1';

      const cliente = parseInt(this.Cliente);

      if (this.PV_SEL_1) {
         this.PV_Ancho_1 = item.PV_Ancho_1;
         this.PV_Alto_1 = item.PV_Alto_1;
         this.PV_Cantidad_1 = item.PV_Cantidad_1;
         this.PV_AnchoLama_1 = item.PV_AnchoLama_1;
         this.PV_PosicionMecanismo_1 = item.PV_PosicionMecanismo_1;
         this.PV_ColorRiel_1 = item.PV_ColorRiel_1;
         this.PV_Accionamiento_1 = item.PV_Accionamiento_1;
         this.PV_TipoSoporte_1 = item.PV_TipoSoporte_1;
         this.PV_TipoRecogida_1 = item.PV_TipoRecogida_1;
         this.PV_ID_Quiero_1 = item.PV_Impresion_1;
         this.PV_ID_Imagen_1 = item.PV_ID_Imagen_1;
         this.idSeleccion1 = null;
         this.Tipo3_Estancia = item.PV_estancia_id_1;
         this.Tipo3_Estancia_Obs = item.PV_estancia_obs_1;

         const tejidoId = item.PV_Tejido_id;
         this.Tipo3_Tejido = tejidoId != null ? tejidoId.toString() : '-1';

         this.service.getTejidosColor(tejidoId, cliente, this.SubCliente).subscribe(
            data => {
               this.pv_tejidosC_1 = data;
               const pos = this.getPos(data, item.PV_Tejido_c1_id);
               this.Tipo3_TejidoColor1 = pos >= 0 ? data[pos].id.toString() : (data.length ? data[0].id.toString() : '-1');
            },
            error => { this.toaster.error(error.message); }
         );
         this.service.getTejidosColor(tejidoId, cliente, this.SubCliente).subscribe(
            data => {
               this.pv_tejidosC_2 = data;
               const pos = this.getPos(data, item.PV_Tejido_c2_id);
               this.Tipo3_TejidoColor2 = pos >= 0 ? data[pos].id.toString() : (data.length ? data[0].id.toString() : '-1');
            },
            error => { this.toaster.error(error.message); }
         );
      }

      if (this.PV_SEL_2) {
         this.PV_Ancho_2 = item.PV_Ancho_2;
         this.PV_Cantidad_2 = item.PV_Cantidad_2;
         this.PV_AlturaMin_2 = item.PV_AlturaMin_2;
         this.PV_AlturaMax_2 = item.PV_AlturaMax_2;
         this.PV_AnchoLama_2 = item.PV_AnchoLama_2;
         this.PV_PosicionMecanismo_2 = item.PV_PosicionMecanismo_2;
         this.PV_ColorRiel_2 = item.PV_ColorRiel_2;
         this.PV_Accionamiento_2 = item.PV_Accionamiento_2;
         this.PV_TipoSoporte_2 = item.PV_TipoSoporte_2;
         this.PV_TipoRecogida_2 = item.PV_TipoRecogida_2;
         this.PV_ID_Quiero_2 = item.PV_Impresion_2;
         this.PV_ID_Imagen_2 = item.PV_ID_Imagen_2;
         this.idSeleccion2 = null;
         this.Tipo31_Estancia = item.PV_estancia_id_2;
         this.Tipo31_Estancia_Obs = item.PV_estancia_obs_2;
         // Vertical_Add_T2 no guarda un tejido propio para T2 en el CortinaTipo,
         // así que no hay nada que restaurar para Tipo3_Tejido_2/TejidoColor*_2.
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


   load_TejidosColoresPV(item: number) {
      this.service.getTejidosColorPV(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {
            this.pv_tejidosC_1 = data;
            this.pv_tejidosC_2 = data;
            this.pv_tejidosC2_1 = data;
            this.pv_tejidosC2_2 = data;


            var pos = this.getPos(this.pv_tejidosC_1, -1);
            if (pos = -1) {
               this.pv_tejidosC_1.push({ 'id': -1, 'text': 'Ninguno', 'codigoprov': '' });

            }


            this.Tipo3_TejidoColor1 = "-1";
            this.Tipo3_TejidoColor2 = "-1";
         },
         error => {
            console.log(error);
         }
      );
   }

   load_TejidosColoresPVID(item: number) {
      this.service.getTejidosColorID(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {
            this.pv_tejidosC_1 = data;
            this.pv_tejidosC_2 = data;
            this.pv_tejidosC2_1 = data;
            this.pv_tejidosC2_2 = data;

            var pos = this.getPos(this.pv_tejidosC_1, -1);
            if (pos = -1) {
               this.pv_tejidosC_1.push({ 'id': -1, 'text': 'Ninguno', 'codigoprov': '' });

            }


            this.Tipo3_TejidoColor1 = "-1";
            this.Tipo3_TejidoColor2 = "-1";
         },
         error => {
            console.log(error);
         }
      );
   }

   T3Add(add: number) {
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


            tipo.Vertical_Add_T1(ancho1, alto1, cantidad1, ancholama1, posMecanismo, colorRiel1,
               accionamiento1, tiposoporte1, tiporecogida1,
               it22, it22s, it23, it23s, it24, it24s,
               this.Tipo3_Estancia, this.Tipo3_Estancia_Obs,
               Number(TipoVertical), this.PV_ID_Quiero_1, this.PV_ID_Imagen_1, this.precios);

         }

         if (sel2) {


            var pos = this.getPos(this.pv_tejidos_1, it22_2);
            var it22_2s = "";

            if (pos >= 0)
               it22_2s = this.pv_tejidos_1[pos].text;

            pos = this.getPos(this.pv_tejidosC_1, it23_2);
            var it23_2s = "";
            if (pos >= 0)
               it23_2s = this.pv_tejidosC_1[pos].text;

            pos = this.getPos(this.pv_tejidosC_2, it24_2);
            var it24_2s = "";
            if (pos >= 0)
               it24_2s = this.pv_tejidosC_2[pos].text;

            tipo.Vertical_Add_T2(ancho2, cantidad2, alturamin, alturamax, ancholama2,
               posMecanismo2, colorRiel2, accionamiento2, tiposoporte2, tiporecogida2,
               this.Tipo31_Estancia, this.Tipo31_Estancia_Obs,
               /*it22_2, it22_2s, it23_2, it23_2s, it24_2, it24_2s,*/
               Number(this.TipoVertical), this.PV_ID_Quiero_2, this.PV_ID_Imagen_2, this.precios);
         }

         this.CestaPrecios = [];
         this.CestaPrecios.push(tipo);

      }
      else {
         this.toaster.error(strMessage, 'ERROR');
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
               this.asignaPrecios();
            }
            else {
               this.Tipo3_PrecioMecanismo = 0;
            }
         },
         error => {

         });
   }



   Tarifa_Mecanismo_Vertical_SoloRiel(cantidad: number, ancho: number, ancholama: string) {
      this.service.getTarifaMecanismoVertical(cantidad, ancholama, ancho).subscribe(
         data => {
            if (data.message == "OK") {
               this.Tipo3_PrecioMecanismo = data.v1;
               this.precios.T3_Tejido = this.Tipo3_PrecioMecanismo;
               this.precios.T3_Tejido_C1 = data.v2;
               this.CalculateC1_Tipo3();
               this.asignaPrecios();

            }
            else {
               this.Tipo3_PrecioMecanismo = 0;
            }
         },
         error => {
            console.log(error);
         });
   }

   CheckPrice() {
      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T3Check();

      if (retValue.Proceed == 0) {
         this.toaster.error(retValue.Message, 'ATENCION');
      } else {
         this.T3Add(0);

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

         var pvp_cantidad = 0;
         var pvp = 0;
         var code_c1 = '';
         var msg_c1 = "";
         var nohaytarifa = false;
         var ancholama = "-1";
         var impresion = "0";
         var impresion1 = "0";

         /* Vertical Normal */
         if (this.PV_SEL_1) {
            var ancho = this.PV_Ancho_1;
            var alto = this.PV_Alto_1;
            var tejido = this.Tipo3_Tejido;
            ancholama = this.PV_AnchoLama_1;
            if (this.PV_ID_Quiero_1) {
               impresion = "1";
            }
         }
         else {
            var ancho = this.PV_Ancho_2;
            var alto = this.PV_AlturaMax_2;
            var tejido = this.Tipo3_Tejido_2;
            ancholama = this.PV_AnchoLama_2;
            if (this.PV_ID_Quiero_2) {
               impresion1 = "1";
            }
         }


         /* SOLO TEJIDO */
         if (this.TipoVertical == '2' && ancholama != "-1") {
            var alto = this.PV_Alto_1;
            var tejido = this.Tipo3_Tejido;
            ancholama = this.PV_AnchoLama_1;
            var lamas = this.PV_Cantidad_1;
            this.Tarifa_Mecanismo_Vertical_SoloTejido(ancholama, tejido, alto, lamas);
         }

         /* SOLO RIEL */
         if (this.TipoVertical == '3' && ancholama != "-1") {
            var cantidad = Number(this.PV_Cantidad_1);
            this.Tarifa_Mecanismo_Vertical_SoloRiel(cantidad, Number(ancho), ancholama);
         }

         /* VALORACION NORMAL */
         if (this.TipoVertical == '1') {

            if (tejido != "-1" && ancholama != "-1") {
               if (this.PV_SEL_1) {
                  pvp_cantidad = parseInt(this.PV_Cantidad_1);
               }
               else {
                  pvp_cantidad = parseInt(this.PV_Cantidad_2);
               }

               /*VALORACION NORMAL*/
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
                              this.precios.T3_Cantidad = pvp_cantidad;
                              this.precios.T3_Tejido = pvp_cantidad * pvp;
                              this.precios.T3_Tejido_C1 = code_c1;
                              this.Recalcular_Tipo3();
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
   }
}