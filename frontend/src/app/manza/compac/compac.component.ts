import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { SMAPIService } from '../config/smapi.service';
import { CortinaTipo } from '../config/CortinaTipo';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';
import { Tipo } from '../config/Tipo';
import { ImpresionDigitalSelectorComponent, ImpresionDigitalSeleccion } from '../../shared/impresion-digital-selector/impresion-digital-selector.component';

@Component({
   selector: 'manza-compac',
   templateUrl: './compac.component.html',
   providers: [SMAPIService]
})
export class CompacComponent implements OnInit, OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';

   @Output() onAdd = new EventEmitter<CortinaTipo>();

   calculando: boolean = false;
   idLinea = "";

   public CestaPrecios: Array<CortinaTipo> = [];

   // Dimensiones
   Ancho: string = '';
   Alto: string = '';
   Cantidad: string = '1';
   AlturaCadena: number = 0;
   minancho = 40;
   maxancho = 120;
   minalto = 60;
   maxalto = 220;

   // Compac object
   compac = {
      PC_TipoJunquillo: "JC",
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
      PC_ColorPerfileria: "BLA",
      Ral: "-1",
      ShowRal: 0

   }

   // Tejido
   TiposTejido_compac: string[] = [];
   tejidos_compac: any[] = [];
   tejidos_compac_colores: any[] = [];
   alltejidos_compac: any[] = [];
   Tipo4_Opacidad: string = '';
   Tipo4_Tejido: string = '-1';
   Tipo4_TejidoColor: string = '-1';
   CodigoProv4: string = '';
   TIPO4_ID_Quiero: boolean = false;
   TIPO4_ID_Imagen: string = '';
   idSeleccion: ImpresionDigitalSeleccion = null;
   @ViewChild('idSelector', { static: false }) idSelector!: ImpresionDigitalSelectorComponent;
   esCadena = 0;
   esCadenaExt = -1;
   // RAL
   items90: any[] = [];
   RalC_Label: string = 'RAL:';

   // Estancia
   Tipo4_Estancia: string = '-1';
   Tipo4_Estancia_Obs: string = '';

   // buildItems (solo Cliente==4)
   buildItems: any[] = [];

   public K_tapas: Array<Tipo> = [];
   public K_tapasC: Array<Tipo> = [];
   public K_soportes: Array<Tipo> = [];
   public K_soportesC: Array<Tipo> = [];
   public K_tubos: Array<Tipo> = [];

   // Precios
   precios = {
      T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '',
      T4_Coeficiente: 1, T4_PVP: 0, T4_PVP_C1: '',
      T4_Fecha_Entrega: '', T4_Transporte: ''
   };

   Tipo4_Accionamiento_Label = "Accionamiento";
   Tipo4_Accionamiento_Label_2 = "Accionamiento";


   public value: any = {};
   public _disabledV: string = '0';
   public disabled: boolean = false;
   public disabledK: boolean = true;

   public Tipo4_TejidoSalida: string = "-1";

   public tejidos_impresion_tipo1: Array<Tipo> = [];

   public Estancias: any = [];

   constructor(
      private service: SMAPIService,
      private toaster: ToastrService,
      private translation: TranslationService
   ) { }

   ngOnInit(): void {

      this.K_tapas.push({ id: 1, text: "Tapas Compac" });
      this.K_tapasC.push({ id: 1, text: "Blanco" }, { id: 2, text: "Gris" });
      this.K_soportes.push({ id: 1, text: "Soportes Compac" });
      this.K_soportesC.push({ id: 1, text: "Blanco" }, { id: 2, text: "Gris" }, { id: 3, text: "Beige" }, { id: 32, text: "Negro" });
      this.K_tubos.push({ id: 8, text: "Tubo 18" });

      this.load_ColorLacados();
      this.load_Estancias();

      this.NewPage();
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

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente) > 0) {
         this.load_Compac_Tejidos();
      }
   }

   NewPage() {
      this.compac.PC_TipoJunquillo = "JC";
      this.compac.PC_AnchoB = "0";
      this.TIPO4_ID_Quiero = false;
      this.TIPO4_ID_Imagen = "";
      this.idSeleccion = null;
      this.Tipo4_Estancia = "-1";
      this.Tipo4_Estancia_Obs = "";

      this.Tipo4_Tejido = "-1";
      this.Tipo4_TejidoColor = "-1";
   }

   ResetPrices() {
      this.precios.T4_Cantidad = 1;
      this.precios.T4_Tejido = 0;
      this.precios.T4_Tejido = 0;
      this.precios.T4_Tejido = 0;
      this.precios.T4_Coeficiente = 1;
      this.precios.T4_Tejido_C1 = '';
      this.precios.T4_Fecha_Entrega = "";
   }

   // ─── RESET ───────────────────────────────────────────────────────────────────

   reset(): void {
      this.Ancho = '';
      this.Alto = '';
      this.Cantidad = '1';
      this.AlturaCadena = 0;
      this.compac = {
         PC_TipoJunquillo: 'JC', PC_AnchoB: '', PC_ColorPerfileria: '-1',
         ShowRal: 0, Ral: '-1',
         Compac_Acc_Tipo: 'COM', Compac_Acc_Color: '-1', Compac_Acc_Marca: 'COM',
         Compac_Acc_Posicion: '-1', Compac_Acc_Cad_Altura: '-1', Compac_Acc_Cad_Color: '-1',
         Compac_Acc_Tubo: 'T18', Compac_Sop_Color: '-1', Compac_Sop_Tipo: 'COM',
         Compac_Tap_Color: '-1', Compac_Tap_Tipo: 'COM'
      };
      this.Tipo4_Tejido = '-1';
      this.Tipo4_TejidoColor = '-1';
      this.CodigoProv4 = '';
      this.TIPO4_ID_Quiero = false;
      this.TIPO4_ID_Imagen = '';
      this.idSeleccion = null;
      this.Tipo4_Estancia = '-1';
      this.Tipo4_Estancia_Obs = '';
      this.buildItems = [];
      this.RalC_Label = 'RAL:';
      this.resetPrecios();
      this.load_Compac_Tejidos();
   }

   resetPrecios(): void {
      this.precios = {
         T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '',
         T4_Coeficiente: 1, T4_PVP: 0, T4_PVP_C1: '',
         T4_Fecha_Entrega: '', T4_Transporte: ''
      };
   }

   // ─── CARGA ────────────────────────────────────────────────────────────────────

   load_Compac_Tejidos(): void {
      this.service.getTejidosProducto(this.Cliente, '4', this.SubCliente).subscribe(
         data => {
            this.alltejidos_compac = data;
            this.TiposTejido_compac = [];
            this.alltejidos_compac.forEach(e => {
               if (this.TiposTejido_compac.indexOf(e.opacidad) < 0) this.TiposTejido_compac.push(e.opacidad);
            });
            this.TiposTejido_compac.sort();
            if (this.TiposTejido_compac.length > 0) {
               this.Tipo4_Opacidad = this.TiposTejido_compac[0];
               this.ChangeTipo4Opacidad();
            }
         },
         error => console.log(error)
      );
   }

   load_Compac_TejidosID(): void {
      this.service.getTejidosProductoID(this.Cliente, '4', this.SubCliente).subscribe(
         data => {
            this.alltejidos_compac = data;
            this.TiposTejido_compac = [];
            this.alltejidos_compac.forEach(e => {
               if (this.TiposTejido_compac.indexOf(e.opacidad) < 0) this.TiposTejido_compac.push(e.opacidad);
            });
            this.TiposTejido_compac.sort();
            if (this.TiposTejido_compac.length > 0) {
               this.Tipo4_Opacidad = this.TiposTejido_compac[0];
               this.ChangeTipo4Opacidad();
            }
         },
         error => console.log(error)
      );
   }

   load_ColorLacados(): void {
      this.service.getAccionamientosLacados(parseInt(this.Cliente)).subscribe(
         data => { this.items90 = data; },
         error => console.log(error)
      );
   }

   // ─── CHANGE HANDLERS ─────────────────────────────────────────────────────────

   ChangeTipo4Opacidad(): void {
      this.tejidos_compac = [];
      this.tejidos_compac.push({ id: -1, text: 'Seleccionar', codigoprov: '' });
      this.alltejidos_compac.forEach(element => {
         if (this.Tipo4_Opacidad === element.opacidad) this.tejidos_compac.push(element);
      });
      this.Tipo4_Tejido = '-1';
   }

   ChangeTipo4Tejido(): void {
      this.CodigoProv4 = '';
      const tejido = parseInt(this.Tipo4_Tejido);
      if (tejido > 0) {
         const pos = this.getPos(this.tejidos_compac, tejido);
         if (pos >= 0) this.CodigoProv4 = this.tejidos_compac[pos].codigoprov || '';
         if (this.TIPO4_ID_Quiero) {
            this.service.getTejidosColorID(tejido, parseInt(this.Cliente), this.SubCliente).subscribe(
               data => { this.tejidos_compac_colores = data; if (data.length > 0) this.Tipo4_TejidoColor = data[0].id.toString(); },
               error => console.log(error)
            );
         } else {
            this.service.getTejidosColor(tejido, parseInt(this.Cliente), this.SubCliente).subscribe(
               data => { this.tejidos_compac_colores = data; if (data.length > 0) this.Tipo4_TejidoColor = data[0].id.toString(); },
               error => console.log(error)
            );
         }
      }
   }

   asignaPrecios() {

      //this.CalculateFecha(this);

      var cantidad = this.precios.T4_Cantidad;
      var v1 = this.precios.T4_Tejido;
      var v2 = this.precios.T4_Coeficiente;
      var total = cantidad * (v1) * v2;
      this.precios.T4_PVP = total;
   }

   CalculateC1_Tipo4() {
      this.precios.T4_PVP_C1 = this.precios.T4_Tejido_C1;
      this.asignaPrecios();
   }


   ChangeTipo4Color() {

      var color = this.Tipo4_TejidoColor;

      var pos2 = this.getPos(this.tejidos_compac_colores, color);
      if (pos2 >= 0) {
         if (this.tejidos_compac_colores[pos2].codigoprov != "") {
            this.CodigoProv4 = this.tejidos_compac_colores[pos2].codigoprov;
         }
         else {
            this.CodigoProv4 = "";
            var tejido = this.Tipo4_Tejido;
            var pos = this.getPos(this.tejidos_compac, tejido);
            if (pos >= 0) {
               this.CodigoProv4 = this.tejidos_compac[pos].codigoprov;
            }
         }

      }

   }

   Change_ColorPerfileria(): void {
      this.compac.ShowRal = this.compac.PC_ColorPerfileria === 'RAL' ? 1 : 0;
      if (this.compac.ShowRal === 0) {
         this.compac.Ral = '-1';
         this.RalC_Label = 'RAL:';
      } else if (this.items90.length > 0) {
         this.compac.Ral = this.items90[0].id.toString();
         this.ChangeRalC();
      }
   }

   ChangeRalC(): void {
      const pos = this.getPos(this.items90, parseInt(this.compac.Ral));
      if (pos >= 0) {
         const precio = this.items90[pos].precio;
         const c1 = this.items90[pos].c1;
         this.RalC_Label = precio > 0 ? `RAL:(${precio}€ ${c1})` : 'RAL:';
      }
   }

   ChangeColorCompac() {
      this.compac.Compac_Sop_Color = this.compac.Compac_Acc_Color;
      this.compac.Compac_Tap_Color = this.compac.Compac_Acc_Color;
      this.compac.Compac_Acc_Cad_Color = this.compac.Compac_Acc_Color;
   }

   selImpresionDigital_Tipo4(): void {
      if (this.TIPO4_ID_Quiero) {
         this.load_Compac_TejidosID();
      } else {
         this.load_Compac_Tejidos();
         this.idSeleccion = null;
         this.TIPO4_ID_Imagen = '';
      }
   }

   onImpresionDigitalSeleccionada(sel: ImpresionDigitalSeleccion): void {
      this.idSeleccion = sel;
      this.TIPO4_ID_Imagen = sel.nombre + (sel.texto ? ' — "' + sel.texto + '"' : '');
   }

   quitarImpresionDigital(): void {
      this.idSeleccion = null;
      this.TIPO4_ID_Imagen = '';
   }

   Ancho_Change(): void {
      this.CheckValidity();
   }


   Check_JunquilloRedondeado(print) {
      if (this.compac.PC_TipoJunquillo === "JR") {

         let value1 = parseFloat(this.Ancho);
         let value2 = parseFloat(this.compac.PC_AnchoB);
         if (Math.abs(value1 - value2) > 2.5) {
            if (print)
               this.toaster.error("La diferencia entre Anchos NO puede ser superior a 2.5 cm", "ERROR junquillo redondeado");
            return false;
         }
         return true;
      }
      return true;
   }

   // ─── PRECIO ──────────────────────────────────────────────────────────────────


   // ─── VALIDACIÓN ──────────────────────────────────────────────────────────────
   CheckValidity() {

      //this.alertShow = false;
      //this.alertMsg = "";
      var strMessage = "";
      var bretValue = true;

      var ancho = 0;
      var alto = 0;


      if (this.Ancho == "") this.Ancho = "0";
      if (this.Alto == "") this.Alto = "0";

      ancho = Number.parseFloat(this.Ancho);
      alto = Number.parseFloat(this.Alto);


      if (ancho > 0 && (ancho < this.minancho || ancho > this.maxancho)) {
         strMessage = "El ancho en este tipo de cortina NO puede ser inferior a " + this.minancho.toString() + " cm ni superior a " + this.maxancho.toString() + " cm ";
         bretValue = false;

      }

      if (bretValue && (alto > 0 && (alto < this.minalto || alto > this.maxalto))) {
         strMessage = "El alto en este tipo de cortina NO puede ser inferior a " + this.minalto.toString() + " cm ni superior a " + this.maxalto.toString() + " cm ";
         bretValue = false;
      }


      if (!bretValue)
         this.toaster.error(strMessage, 'ATENCION');

      return bretValue;
   }

   translate(msg: string, title: string) {
      const message = this.translation.get(msg);
      this.toaster.success(message, title);
   }

   T4Check(): { Proceed: number; Message: string } {
      let iProceed = 1;
      let strMessage = '';

      if (this.Ancho === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho'; }
      if (iProceed && this.Alto === '') { iProceed = 0; strMessage = 'Debe indicar el Alto'; }
      if (iProceed && this.compac.PC_TipoJunquillo === 'JR' && this.compac.PC_AnchoB === '') {
         iProceed = 0; strMessage = 'Debe indicar el Ancho Exterior (Junquillo Redondeado)';
      }
      if (iProceed && this.compac.PC_ColorPerfileria === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Color de Perfilería'; }
      if (iProceed && this.compac.Compac_Acc_Color === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Color de Cadena'; }
      if (iProceed && this.compac.Compac_Acc_Posicion === '-1') { iProceed = 0; strMessage = 'Debe seleccionar la Posición del Mando'; }
      if (iProceed && this.compac.Compac_Tap_Color === '-1') { iProceed = 0; strMessage = 'Debe seleccionar el Color de Tapas'; }
      if (iProceed && parseInt(this.Tipo4_Tejido) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Tejido'; }
      if (iProceed && parseInt(this.Tipo4_TejidoColor) === -1) { iProceed = 0; strMessage = 'Debe seleccionar el Color del Tejido'; }

      this.CheckValidity();

      return { Proceed: iProceed, Message: strMessage };
   }

   // ─── AGREGAR ─────────────────────────────────────────────────────────────────

   Agregar(): void {
      const retValue = this.T4Check();
      if (retValue.Proceed !== 1) {
         this.toaster.error(retValue.Message, 'ERROR');
         return;
      }

      const preciosCompleto = this.buildPreciosCompleto();
      const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);

      var pos = 0;
      var it7s = "";
      var it8s = "";

      var it7 = parseInt(this.Tipo4_Tejido);
      var it8 = parseInt(this.Tipo4_TejidoColor);

      pos = this.getPos(this.tejidos_compac, it7);
      if (pos >= 0)
         it7s = this.tejidos_compac[pos].text;

      pos = this.getPos(this.tejidos_compac_colores, it8);
      if (pos >= 0)
         it8s = this.tejidos_compac_colores[pos].text;

      tipo.Compac_Add(this.compac.PC_TipoJunquillo, this.Ancho, this.compac.PC_AnchoB, this.Alto, this.Cantidad, "COM", "COMPAC", "COM", "COMPAC", this.compac.Compac_Acc_Color, this.compac.Compac_Acc_Color,
         this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Posicion, this.compac.Compac_Acc_Posicion, "COM", "COMPAC",
         this.compac.Compac_Sop_Color, this.compac.Compac_Sop_Color, "COM", "COMPAC",
         this.compac.Compac_Tap_Color, this.compac.Compac_Tap_Color, it7, it7s, it8, it8s, -1, "NO",
         this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Color, this.compac.Compac_Acc_Cad_Color,
         this.AlturaCadena.toString(), this.esCadenaExt.toString(), this.Tipo4_Estancia, this.Tipo4_Estancia_Obs, this.compac.PC_ColorPerfileria, this.compac.Ral, this.TIPO4_ID_Quiero, this.TIPO4_ID_Imagen, this.precios
      );

      this.onAdd.emit(tipo);
      const message = this.translation.get('AGREGADO COMPAC A CESTA');
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
         T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
         T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
         T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: '', T3_Transporte: '',
         T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,
         ...this.precios
      };
   }

   // Rellena el formulario en modo edición a partir de las propiedades reales que
   // Compac_Add deja en el CortinaTipo. Las cascadas opacidad->tejido->color y
   // perfilería->RAL se resuelven aquí directamente (sin pasar por
   // Change_ColorPerfileria/ChangeTipo4Tejido) porque esos métodos siempre
   // preseleccionan el primer elemento de la lista recién cargada/filtrada.
   cargarEdicion(item: any): void {
      this.Ancho = item.ancho;
      this.Alto = item.alto;
      this.Cantidad = item.cantidad;
      this.compac.PC_TipoJunquillo = item.junquillo || 'JC';
      this.compac.PC_AnchoB = item.ancho2 != null ? item.ancho2.toString() : '';
      this.compac.Compac_Acc_Color = item.com_acc_modelo_id || '-1';
      this.compac.Compac_Acc_Tubo = item.com_acc_tubo_id || this.compac.Compac_Acc_Tubo;
      this.compac.Compac_Acc_Posicion = item.com_acc_posicion_id || '-1';
      this.compac.Compac_Sop_Color = item.com_sop_color_id || '-1';
      this.compac.Compac_Tap_Color = item.com_tap_color_id || '-1';
      this.compac.Compac_Acc_Cad_Altura = item.com_cad_altura_id || '-1';
      this.compac.Compac_Acc_Cad_Color = item.com_cad_color_text || '-1';
      this.AlturaCadena = item.com_cad_Altura != null ? Number(item.com_cad_Altura) : 0;
      const cadTipo = Number(item.com_cad_Tipo);
      this.esCadenaExt = isNaN(cadTipo) ? this.esCadenaExt : cadTipo;
      this.Tipo4_Estancia = item.com_estancia_id;
      this.Tipo4_Estancia_Obs = item.com_estancia_obs;
      this.TIPO4_ID_Quiero = item.impresion;
      this.TIPO4_ID_Imagen = item.impresion_imagen;
      this.idSeleccion = null;

      // Perfilería / RAL
      this.compac.PC_ColorPerfileria = item.perfileria || '-1';
      this.compac.ShowRal = this.compac.PC_ColorPerfileria === 'RAL' ? 1 : 0;
      if (this.compac.ShowRal === 1) {
         const posRal = this.getPos(this.items90, item.ral);
         this.compac.Ral = posRal >= 0 ? this.items90[posRal].id.toString() : (this.items90.length > 0 ? this.items90[0].id.toString() : '-1');
         this.ChangeRalC();
      } else {
         this.compac.Ral = '-1';
      }

      // Opacidad -> Tejido -> Color
      const cliente = parseInt(this.Cliente);
      const compacTejido = this.alltejidos_compac.find(e => e.id == item.com_tej_tipo_id);
      this.Tipo4_Opacidad = compacTejido ? compacTejido.opacidad : (this.TiposTejido_compac.length > 0 ? this.TiposTejido_compac[0] : '');
      this.tejidos_compac = [{ id: -1, text: 'Seleccionar', codigoprov: '' }];
      this.alltejidos_compac.forEach(element => {
         if (this.Tipo4_Opacidad === element.opacidad) { this.tejidos_compac.push(element); }
      });
      const posTej = this.getPos(this.tejidos_compac, item.com_tej_tipo_id);
      this.Tipo4_Tejido = posTej >= 0 ? this.tejidos_compac[posTej].id.toString() : (this.tejidos_compac.length > 0 ? this.tejidos_compac[0].id.toString() : '-1');

      const color$ = this.TIPO4_ID_Quiero
         ? this.service.getTejidosColorID(item.com_tej_tipo_id, cliente, this.SubCliente)
         : this.service.getTejidosColor(item.com_tej_tipo_id, cliente, this.SubCliente);
      color$.subscribe(
         data => {
            this.tejidos_compac_colores = data;
            const posColor = this.getPos(data, item.com_tej_color_id);
            this.Tipo4_TejidoColor = posColor >= 0 ? data[posColor].id.toString() : (data.length > 0 ? data[0].id.toString() : '-1');
         },
         error => console.log(error)
      );
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


   load_TejidosColoresCompac(item: number) {
      this.CodigoProv4 = "";

      this.service.getTejidosColor(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {
            this.tejidos_compac_colores = data;
            //this.tejidos_compac_colores.push({ 'id': -1, 'text': 'Seleccionar' });
         },
         error => {
            console.log(error);
         }
      );
   }

   load_TejidosColoresCompacID(item: number) {
      this.CodigoProv4 = "";

      this.service.getTejidosColorID(item, parseInt(this.Cliente), this.SubCliente).subscribe(

         data => {
            this.tejidos_compac_colores = data;
            this.tejidos_compac_colores.push({ 'id': -1, 'text': 'Seleccionar', 'codigoprov': '' });
         },
         error => {
            console.log(error);
         }
      );
   }
   /*
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
   */

   T4Add(add: number) {

      var iProceed: number = 1;
      var strMessage: string = "";
      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T4Check();

      if (retValue.Proceed == 1) {
         if (iProceed == 1) {
            strMessage = "";
            var pos = 0;
            var it7s = "";
            var it8s = "";

            var it7 = parseInt(this.Tipo4_Tejido);
            var it8 = parseInt(this.Tipo4_TejidoColor);

            pos = this.getPos(this.tejidos_compac, it7);
            if (pos >= 0)
               it7s = this.tejidos_compac[pos].text;

            pos = this.getPos(this.tejidos_compac_colores, it8);
            if (pos >= 0)
               it8s = this.tejidos_compac_colores[pos].text;

            var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
            tipo.Compac_Add(this.compac.PC_TipoJunquillo, this.Ancho, this.compac.PC_AnchoB, this.Alto, this.Cantidad, "COM", "COMPAC", "COM", "COMPAC", this.compac.Compac_Acc_Color, this.compac.Compac_Acc_Color,
               this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Tubo, this.compac.Compac_Acc_Posicion, this.compac.Compac_Acc_Posicion, "COM", "COMPAC",
               this.compac.Compac_Sop_Color, this.compac.Compac_Sop_Color, "COM", "COMPAC",
               this.compac.Compac_Tap_Color, this.compac.Compac_Tap_Color, it7, it7s, it8, it8s, -1, "NO",
               this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Altura, this.compac.Compac_Acc_Cad_Color, this.compac.Compac_Acc_Cad_Color,
               this.AlturaCadena.toString(), this.esCadenaExt.toString(), this.Tipo4_Estancia, this.Tipo4_Estancia_Obs, this.compac.PC_ColorPerfileria, this.compac.Ral, this.TIPO4_ID_Quiero, this.TIPO4_ID_Imagen, this.precios
            );

            this.CestaPrecios = [];
            this.CestaPrecios.push(tipo);

         }
         else {
            this.translate(strMessage, 'ERROR');
         }
      }

   }

   CheckPrice() {
      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T4Check();

      var ancho = this.Ancho;
      var alto = this.Alto;
      var tejido = this.Tipo4_Tejido;
      var marca = this.Tipo4_TejidoColor;
      var pvp_cantidad = 0;
      var impresion = "0";
      var pvp = 0;
      var code_c1 = '';
      var msg_c1 = "";
      var nohaytarifa = false;

      if (this.TIPO4_ID_Quiero) {
         impresion = "1";
      }

      if (tejido != "-1") {
         pvp_cantidad = parseInt(this.Cantidad);
      }

      this.T4Add(0);

      if (retValue.Proceed == 0) {
         this.toaster.error(retValue.Message, 'ATENCION');
      } else {
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


         var pvp_cantidad = parseInt(this.Cantidad);
         var pvp = 0;
         var code_c1 = '';
         var msg_c1 = "";
         var nohaytarifa = false;

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
                     //let message = this.translation.get("PRODUCTOVALORADO");
                     //this.toaster.info(message, "Valoración");

                     if (nohaytarifa == false) {
                        this.precios.T4_Cantidad = pvp_cantidad;
                        this.precios.T4_Tejido = pvp;
                        this.precios.T4_Tejido_C1 = code_c1;
                        this.CalculateC1_Tipo4();
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