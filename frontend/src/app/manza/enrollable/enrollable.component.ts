import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

import { CortinaTipo } from '../config/CortinaTipo';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';
import { Tipo } from '../config/Tipo';
import { TipoExt } from '../config/TipoExt';
import { Tipo2 } from '../config/Tipo2';
import { Tipo3 } from '../config/Tipo3';
import { Tipo4 } from '../config/Tipo4';
import { TipoMando } from '../config/TipoMando';
import { SMAPIService } from '../config/smapi.service';
import { forkJoin, of } from 'rxjs';
import { ImpresionDigitalSelectorComponent, ImpresionDigitalSeleccion } from '../../shared/impresion-digital-selector/impresion-digital-selector.component';


@Component({
   selector: 'manza-enrollable',
   templateUrl: './enrollable.component.html',
   providers: [SMAPIService]
})
export class EnrollableComponent implements OnInit, OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';

   @Output() onAdd = new EventEmitter<CortinaTipo>();

   public CestaPrecios: Array<CortinaTipo> = [];

   calculando: boolean = false;

   // Dimensiones
   Ancho: string = '';
   Alto: string = '';
   Cantidad: string = '1';
   SubTipoCortina: number = 1;

   idLinea = "";

   // Tejido
   TiposTejido: string[] = [];
   Tipo1_Opacidad: string = '';
   alltejidos: Tipo3[] = [];
   tejidos: Tipo3[] = [];
   tejidosC: TipoExt[] = [];
   tejidosS: Tipo[] = [];
   Tipo1_Tejido: string = '-1';
   Tipo1_TejidoColor: string = '-1';
   Tipo1_TejidoSalida: string = '-1';
   Tipo1_LabelTejidoColor: string = 'Color:';
   Tipo1_AnchoMaximo: number = -1;
   CodigoProv: string = '';
   ID_Quiero: boolean = false;
   ID_Imagen: string = '';
   idSeleccion: ImpresionDigitalSeleccion = null;
   @ViewChild('idSelector', { static: false }) idSelector!: ImpresionDigitalSelectorComponent;

   // Accionamiento
   items1: Tipo[] = [];   // accionamientos
   items2: Tipo[] = [];   // tipos/marcas
   items3: Tipo2[] = [];  // colores/modelos
   items90: Tipo2[] = []; // lacados RAL
   radiomando: Tipo2[] = [];
   PosicionMando: Tipo[] = [];
   colorCadena: Tipo2[] = [];
   alturaCadena: Tipo[] = [];
   alturaCadenaM: Tipo[] = [];
   Tipo1_Tipo: string = '-1';
   Tipo1_Marca: string = '-1';
   Tipo1_Color: string = '-1';
   Tipo1_Mando: string = '-1';
   Tipo1_Posicion: string = '-1';
   Tipo1_Tubo: string = '-1';
   Tipo1_AlturaCadena: string = '-1';
   Tipo1_AlturaCadenaM: string = '-1';
   Tipo1_AlturaCadenaM2: string = '-1';
   Tipo1_ColorCadena: string = '-1';
   Tipo1_RadioMando_Label: string = 'Mando:';
   Tipo1_RadioMando_Disabled: boolean = false;
   Tipo1_Cadena_Label: string = 'Altura:';
   Modelo_Label: string = 'Color/Modelo:';
   verMando: boolean = false;
   esCadena: number = 0;
   esCadenaExt: number = -1;
   AlturaCadena: number = 0;
   TipoCadena1: 'true' | undefined;
   TipoCadena2: 'false' | undefined;
   TipoCadena3: 'false' | undefined;

   cargadores: Tipo2[] = [];
   Tipo1_Cargador: string = '-1';

   private Accionamientos: Tipo[] | undefined;
   private TipoAccionamientos: TipoMando[] | undefined;
   private TipoColores: Tipo2[] | undefined;

   // Soportes
   soportes: Tipo[] = [];
   soportesC: Tipo[] = [];
   Tipo1_Soporte: string = '-1';
   Tipo1_SoporteC: string = '-1';

   // Tapas
   tapas: Tipo[] = [];
   tapasC: Tipo[] = [];
   Tipo1_Tapa: string = '-1';
   Tipo1_TapaC: string = '-1';

   // Contrapesos
   contrapesos: Tipo2[] = [];
   contrapesosC: Tipo[] = [];
   Tipo1_Contrapeso: string = '-1';
   Tipo1_ContrapesoC: string = '-1';
   Tipo1_Contrapeso_Label: string = 'Tipo:';

   // Cajón / Guías (SubTipo 2)
   Cajones: any[] = [];
   Guias: any[] = [];
   Tipo1_Cajon: string = '-1';
   Tipo1_CajonC: string = 'BLA';
   Tipo1_CajonRAL: string = '-1';
   Tipo1_Cajon_Soportes: string = '-1';
   Tipo1_Cajon_PosicionSalida: string = '-1';
   Tipo1_Cajon_VistaCajon: string = '-1';
   Tipo1_Guia: string = '-1';
   Tipo1_GuiaC: string = 'BLA';
   Tipo1_GuiaRAL: string = '';
   Modelo_Cajon_Label: string = 'Modelo de Cajón';
   Modelo_Guia_Label: string = 'Tipo';
   Ral_Label: string = 'RAL:';
   Label_Cargador: string = 'Cargador:';

   // Estancia
   Tipo1_Estancia: string = '-1';
   Tipo1_Estancia_Obs: string = '';
   public Tipo1_Estancias: any = [];

   // Precios
   precios = {
      T1_Cantidad: 1,
      T1_Tejido: 0,
      T1_Tejido_C1: '',
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
      T1_Fecha_Entrega: '',
      T1_Transporte: '',
      T1_Inc_Cargador: 0,
      T1_Inc_Cargador_C1: '',
      T1_Inc_Cargador_48: 0,
   };


   constructor(
      private service: SMAPIService,
      private toaster: ToastrService,
      private translation: TranslationService
   ) { }

   ngOnInit(): void {
      this.load_SalidaTejido();
      this.load_PosicionMando();
      this.load_AlturaCadenaM();
      this.load_ColorLacados();
      this.load_Estancias();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente) > 0) {
         this.loadAll();
      }
   }

   loadAll(): void {
      this.load_Tejidos();
      this.load_Accionamientos();

   }

   // ─── RESET ───────────────────────────────────────────────────────────────────

   reset(): void {
      this.CodigoProv = '';
      this.Ancho = '';
      this.Alto = '';
      this.Cantidad = '1';
      this.ID_Quiero = false;
      this.ID_Imagen = '';
      this.idSeleccion = null;
      this.Tipo1_Tejido = '-1';
      this.Tipo1_TejidoSalida = '1';
      this.Tipo1_TejidoColor = '-1';
      this.Tipo1_Soporte = '-1';
      this.Tipo1_SoporteC = '-1';
      this.Tipo1_Tapa = '-1';
      this.Tipo1_TapaC = '-1';
      this.Tipo1_Contrapeso = '-1';
      this.Tipo1_ContrapesoC = '-1';
      this.Tipo1_Tipo = '-1';
      this.Tipo1_Marca = '-1';
      this.Tipo1_Color = '-1';
      this.Tipo1_Mando = '-1';
      this.Tipo1_Posicion = '1';
      this.Tipo1_Tubo = '-1';
      this.Tipo1_AlturaCadena = '-1';
      this.Tipo1_AlturaCadenaM = '-1';
      this.AlturaCadena = 0;
      this.Tipo1_ColorCadena = '-1';
      this.esCadena = 0;
      this.esCadenaExt = -1;
      this.Tipo1_AnchoMaximo = -1;
      this.Tipo1_Contrapeso_Label = 'Tipo:';
      this.Tipo1_RadioMando_Label = 'Mando:';
      this.Modelo_Label = 'Color/Modelo:';
      this.Modelo_Cajon_Label = 'Modelo de Cajón';
      this.Modelo_Guia_Label = 'Tipo';
      this.Ral_Label = 'RAL:';
      this.Tipo1_RadioMando_Disabled = false;
      this.Tipo1_Estancia = '-1';
      this.Tipo1_Estancia_Obs = '';
      this.Tipo1_Cajon = '-1';
      this.Tipo1_CajonC = 'BLA';
      this.Tipo1_CajonRAL = '-1';
      this.Tipo1_Guia = '-1';
      this.Tipo1_GuiaC = 'BLA';
      this.Tipo1_GuiaRAL = '';
      this.resetPrecios();
      this.load_Tejidos();
   }

   resetPrecios(): void {
      this.precios = {
         T1_Cantidad: 1, T1_Tejido: 0, T1_Tejido_C1: '',
         T1_Inc_CadenaMetalica: 0, T1_Inc_CadenaMetalica_C1: '',
         T1_Inc_Contrapeso: 0, T1_Inc_Contrapeso_C1: '',
         T1_Inc_Mando: 0, T1_Inc_Mando_C1: '',
         T1_Inc_Impresion: 0, T1_Inc_Impresion_C1: '',
         T1_PVP: 0, T1_PVP_C1: '', T1_Fecha_Entrega: '', T1_Transporte: '',
         T1_Inc_Cargador: 0, T1_Inc_Cargador_C1: '', T1_Inc_Cargador_48: 0,
      };
   }

   // ─── CARGA DE DATOS ───────────────────────────────────────────────────────────

   load_Tejidos(): void {
      const produc = this.SubTipoCortina === 2 ? 6 : 1;
      this.CodigoProv = '';
      this.service.getTejidosProducto(this.Cliente, String(produc), this.SubCliente).subscribe(
         data => {
            this.alltejidos = data;
            this.TiposTejido = [];
            this.alltejidos.forEach(e => {
               if (this.TiposTejido.indexOf(e.opacidad) < 0) this.TiposTejido.push(e.opacidad);
            });
            this.TiposTejido.sort();
            this.Tipo1_Opacidad = this.TiposTejido[0];
            this.ChangeTipo1Opacidad();
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Tejidos_ID(): void {
      this.CodigoProv = '';
      this.service.getTejidosProductoID(this.Cliente, '1', this.SubCliente).subscribe(
         data => {
            this.alltejidos = data;
            this.TiposTejido = [];
            this.alltejidos.forEach(e => {
               if (this.TiposTejido.indexOf(e.opacidad) < 0) this.TiposTejido.push(e.opacidad);
            });
            this.TiposTejido.sort();
            this.Tipo1_Opacidad = this.TiposTejido[0];
            this.ChangeTipo1Opacidad();
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Accionamientos(): void {
      const produc = this.SubTipoCortina === 2 ? 6 : 1;
      this.service.getAccionamientos(parseInt(this.Cliente), produc).subscribe(
         data => {
            this.Accionamientos = data;
            this.items1 = data;
            if (this.items1.length > 0) {
               this.Tipo1_Tipo = this.items1[0].id.toString();
               this.ChangeAccionamiento();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_TipoAccionamientos(item: number): void {
      if (!this.Accionamientos) return;
      for (const entry of this.Accionamientos) {
         if (entry.id == item) {
            const produc = this.SubTipoCortina === 2 ? 6 : 1;
            this.service.getAccionamientosTipos(entry.id, produc, parseInt(this.Cliente)).subscribe(
               data => {
                  this.TipoAccionamientos = data;
                  this.items2 = data as unknown as Tipo[];
                  if (data.length > 0) {
                     this.Tipo1_Marca = this.items2[0].id.toString();
                     this.ChangeAccionamientoMarca();
                  }
               },
               error => {
                  this.toaster.error(error.message);
               }
            );
         }
      }
   }

   changeCargador(): void {
      const pos = this.getPos(this.cargadores, this.Tipo1_Cargador);
      if (pos >= 0) {
         const precio = (this.cargadores[pos] as any).precio;
         const c1 = (this.cargadores[pos] as any).c1;
         const c2 = (this.cargadores[pos] as any).codigo_48;
         this.Label_Cargador = 'Cargador:(' + precio + '€ ' + c1 + ' ' + c2 + ')';
         this.precios.T1_Inc_Cargador = precio;
         this.precios.T1_Inc_Cargador_C1 = c1;
         this.precios.T1_Inc_Cargador_48 = c2;
      }
   }

   load_Cargadores(id: number) {
      this.service.getCargadores(id).subscribe(
         data => {
            this.cargadores = data;
            if (this.cargadores.length > 0) {
               this.cargadores.push({
                  id: -1,
                  text: 'SIN CARGADOR',
                  precio: 0,
                  c1: '',
                  codigo_48: ''
               });
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_ColorAccionamientos(acc: number, tipo: number): void {
      const produc = this.SubTipoCortina === 2 ? 6 : 1;
      this.service.getAccionamientosColores(tipo, acc, parseInt(this.Cliente), produc).subscribe(
         data => {
            console.log(data);
            this.TipoColores = data;
            this.colorCadena = data;
            this.items3 = this.TipoColores as unknown as Tipo2[];
            if (this.items3.length > 0) {
               this.Tipo1_Color = this.items3[0].id.toString();
               this.ChangeTipo1Color();
            }
            if (this.TipoAccionamientos) {
               this.TipoAccionamientos.forEach(item => {
                  if (item.id == parseInt(this.Tipo1_Marca)) {
                     this.verMando = item.mando == 1;
                  }
               });
            }
            if (this.verMando) {
               this.Tipo1_RadioMando_Label = 'Mando:';
               this.load_RadioMando();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_RadioMando(): void {
      const produc = this.SubTipoCortina === 2 ? 6 : 1;
      this.service.getRadioMandos_gen(parseInt(this.Tipo1_Color), parseInt(this.Cliente), produc).subscribe(
         data => {
            this.radiomando = data;
            this.Tipo1_Mando = '';
            if (this.radiomando.length > 0) {
               this.Tipo1_Mando = String(this.radiomando[0].id);
               this.ChangeRadioMando();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Soportes_GEN(): void {
      this.service.getSoportesGEN(parseInt(this.Cliente), parseInt(this.Tipo1_Marca)).subscribe(
         data => {
            this.soportes = data;
            if (this.soportes.length > 0) {
               this.Tipo1_Soporte = this.soportes[0].id.toString();
               this.load_SoportesColores(parseInt(this.Tipo1_Soporte));
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_SoportesColores(item: number): void {
      this.service.getSoportesColor(item, parseInt(this.Cliente)).subscribe(
         data => {
            this.soportesC = data;
            if (this.soportesC.length > 0) {
               this.Tipo1_SoporteC = this.soportesC[0].id.toString();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_TapasGEN(): void {
      this.service.getTapasGEN(parseInt(this.Cliente), parseInt(this.Tipo1_Marca)).subscribe(
         data => {
            this.tapas = data;
            if (this.tapas.length > 0) {
               this.Tipo1_Tapa = this.tapas[0].id.toString();
               this.load_TapasColores(parseInt(this.Tipo1_Tapa));
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_TapasColores(id: number): void {
      this.service.getTapasColores(id, parseInt(this.Cliente)).subscribe(
         data => {
            this.tapasC = data;
            if (this.tapasC.length > 0) {
               this.Tipo1_TapaC = this.tapasC[0].id.toString();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Contrapesos_GEN(): void {
      this.service.getContrapesosGEN(parseInt(this.Cliente), parseInt(this.Tipo1_Marca)).subscribe(
         data => {
            this.contrapesos = data;
            if (this.contrapesos.length > 0) {
               this.Tipo1_Contrapeso = this.contrapesos[0].id.toString();
               this.ChangeTipo1Contrapeso();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_ContrapesosColores(item: number): void {
      this.service.getContrapesoColor(item, parseInt(this.Cliente)).subscribe(
         data => {
            this.contrapesosC = data;
            if (this.contrapesosC.length > 0) {
               this.Tipo1_ContrapesoC = this.contrapesosC[0].id.toString();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Cajones(): void {
      this.service.getCajones(parseInt(this.Cliente), parseInt(this.Tipo1_Marca)).subscribe(
         data => {
            this.Cajones = data;
            if (this.Cajones.length > 0) {
               this.Tipo1_Cajon = this.Cajones[0].idrow.toString();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Guias(): void {
      this.service.getGuias(parseInt(this.Cliente), parseInt(this.Tipo1_Marca)).subscribe(
         data => { this.Guias = data; },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_Estancias(): void {
      this.service.getEstancias(parseInt(this.Cliente)).subscribe(
         data => {
            this.Tipo1_Estancias = data;
            this.Tipo1_Estancias.push({ 'idrow': '-1', 'descripcion': 'Seleccionar' });
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_SalidaTejido(): void {
      this.tejidosS = [{ id: 1, text: 'Cascada' }, { id: 2, text: 'Pegado Pared' }];
      if (this.tejidosS.length > 0) {
         this.Tipo1_TejidoSalida = this.tejidosS[0].id.toString();
      }
   }

   load_PosicionMando(): void {
      this.PosicionMando = [{ id: 1, text: 'Derecha' }, { id: 2, text: 'Izquierda' }];
      if (this.PosicionMando.length > 0) {
         this.Tipo1_Posicion = this.PosicionMando[0].id.toString();
      }
   }

   load_AlturaCadenaM(): void {
      this.service.getAlturaCadenaM(parseInt(this.Cliente)).subscribe(
         data => {
            this.alturaCadenaM = data;
            this.alturaCadenaM.push({ id: 9999, text: 'Indicar Altura' });
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_ColorLacados(): void {
      this.service.getAccionamientosLacados(parseInt(this.Cliente)).subscribe(
         data => {
            this.items90 = data;
            if (this.items90.length > 0) {
               this.Tipo1_CajonRAL = this.items90[0].id.toString();
               this.ChangeRalColor();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_TejidosColores(item: number): void {
      this.service.getTejidosColor(item, parseInt(this.Cliente), this.SubCliente).subscribe(
         data => {
            this.tejidosC = data;
            if (this.tejidosC.length > 0) {
               this.Tipo1_TejidoColor = this.tejidosC[0].id.toString();
               this.ChangeTejidoColor();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   load_TejidosColoresID(item: number): void {
      this.service.getTejidosColorID(item, parseInt(this.Cliente), this.SubCliente).subscribe(
         data => {
            this.tejidosC = data;
            if (this.tejidosC.length > 0) {
               this.Tipo1_TejidoColor = this.tejidosC[0].id.toString();
               this.ChangeTejidoColor();
            }
         },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   // ─── CHANGE HANDLERS ─────────────────────────────────────────────────────────

   ChangeTipo1Opacidad(): void {
      this.tejidos = [];
      this.tejidos.push({ id: -1, text: 'Seleccionar', codigoprov: '', opacidad: '' });
      this.alltejidos.forEach(element => {
         if (this.Tipo1_Opacidad === element.opacidad) this.tejidos.push(element);
      });
      this.Tipo1_Tejido = '-1';
   }

   ChangeTipo1Tejido(): void {
      this.CodigoProv = '';
      const tejido = this.Tipo1_Tejido;
      if (this.ID_Quiero) {
         this.load_TejidosColoresID(parseInt(tejido));
      } else {
         this.load_TejidosColores(parseInt(tejido));
      }
      const pos = this.getPos(this.tejidos, tejido);
      if (pos >= 0) this.CodigoProv = this.tejidos[pos].codigoprov;
   }

   ChangeTejidoColor(): void {
      const color = this.Tipo1_TejidoColor;
      if (color !== '-1') {
         const pos = this.getPos(this.tejidosC, color);
         if (pos >= 0) {
            const anchomax = this.tejidosC[pos].ancmax;
            if (anchomax > 0) {
               this.Tipo1_LabelTejidoColor = 'Color:(ancho max:' + anchomax + ' cms)';
               this.Tipo1_AnchoMaximo = anchomax;
            } else {
               this.Tipo1_LabelTejidoColor = 'Color:';
               this.Tipo1_AnchoMaximo = -1;
            }
            if (this.tejidosC[pos].codigoprov !== '') {
               this.CodigoProv = this.tejidosC[pos].codigoprov;
            } else {
               this.CodigoProv = '';
               const tejido = this.Tipo1_Tejido;
               const posTej = this.getPos(this.tejidos, tejido);
               if (posTej >= 0) this.CodigoProv = this.tejidos[posTej].codigoprov;
            }
         }
      }
   }

   ChangeAccionamiento(): void {
      this.precios.T1_Inc_Mando = 0;
      const accionamiento = this.Tipo1_Tipo;
      const acctext = this.items1[this.getPos(this.items1, accionamiento)].text;
      this.esCadena = acctext.toUpperCase() === 'CADENA' ? 1 : 0;
      this.Tipo1_Marca = '-1';
      this.Tipo1_Mando = '-1';
      this.load_TipoAccionamientos(parseInt(accionamiento));
   }

   ChangeAccionamientoMarca(): void {
      this.precios.T1_Inc_Mando = 0;
      const accionamiento = this.Tipo1_Tipo;
      const accionamientom = this.Tipo1_Marca;
      this.load_ColorAccionamientos(parseInt(accionamiento), parseInt(accionamientom));
      this.load_Soportes_GEN();
      this.load_TapasGEN();
      this.load_Contrapesos_GEN();
      this.load_Cajones();
      this.load_Guias();
   }

   ChangeTipo1Color(): void {
      const color = this.Tipo1_Color;
      if (this.esCadena === 1) {
         this.Tipo1_TapaC = color;
         this.Tipo1_SoporteC = color;
      }
      const pos = this.getPos(this.items3, this.Tipo1_Color);
      if (pos >= 0) {
         const precio = (this.items3[pos] as any).precio;
         const c1 = (this.items3[pos] as any).c1;
         const codigo_48 = (this.items3[pos] as any).codigo_48;
         this.Modelo_Label = 'Color/Mando';
         this.Tipo1_RadioMando_Label = 'Mando:';
         if (precio > 0) {
            this.Modelo_Label = 'Modelo:(' + precio + '€ ' + c1 + ' ' + codigo_48 + ')';
         }
      }
      if (this.verMando) this.load_RadioMando();
      this.load_Cargadores(parseInt(this.Tipo1_Color));
   }

   ChangeRadioMando(): void {
      const radio = this.Tipo1_Mando;
      const cantidad = Number(this.Cantidad);
      const pos = this.getPos(this.radiomando, radio);
      if (pos >= 0) {
         const precio = this.radiomando[pos].precio;
         const c1 = this.radiomando[pos].c1;
         const codigo_48 = this.radiomando[pos].codigo_48;
         this.Tipo1_RadioMando_Label = 'Mando:';
         if (precio > 0) {
            this.Tipo1_RadioMando_Label = 'Mando:(' + precio + '€ ' + c1 + ' ' + codigo_48 + ')';
            this.precios.T1_Inc_Mando = cantidad * precio;
            this.precios.T1_Inc_Mando_C1 = c1;
            if (cantidad > 1) {
               this.service.getMultiply(c1, cantidad).subscribe(
                  data => { this.precios.T1_Inc_Mando_C1 = data[0].res; },
                  error => { this.precios.T1_Inc_Mando_C1 = ''; }
               );
            }
         } else if (precio < 0) {
            this.Tipo1_RadioMando_Label = 'Mando:(' + precio + '€ ' + c1 + ')';
            this.precios.T1_Inc_Mando = cantidad * precio;
         } else {
            this.Tipo1_RadioMando_Label = 'Mando:';
            this.precios.T1_Inc_Mando = 0;
            this.precios.T1_Inc_Mando_C1 = '';
         }
      }
   }

   ChangeTipo1Soporte(): void {
      this.load_SoportesColores(parseInt(this.Tipo1_Soporte));
   }

   ChangeTipo1SoporteColor(): void {
      this.Tipo1_TapaC = this.Tipo1_SoporteC;
   }

   ChangeTipo1Tapa(): void {
      this.load_TapasColores(parseInt(this.Tipo1_Tapa));
   }

   ChangeTipo1Contrapeso(): void {
      this.load_ContrapesosColores(parseInt(this.Tipo1_Contrapeso));
      this.Tarifa_Contrapeso();
   }

   ChangeRalColor(): void {
      if (this.Tipo1_CajonC !== 'RAL') {
         this.Tipo1_CajonRAL = '-1';
      } else {
         this.Tipo1_CajonRAL = this.items90[0].id.toString();
         this.ChangeRal();
      }
   }

   ChangeRal(): void {
      const pos = this.getPos(this.items90, this.Tipo1_CajonRAL);
      if (pos >= 0) {
         const precio = this.items90[pos].precio;
         const c1 = this.items90[pos].c1;
         this.Ral_Label = precio > 0 ? 'RAL:(' + precio + '€ ' + c1 + ')' : 'RAL';
      }
   }

   Change_ColorCadenaContinua(): void {
      const colorCadena = this.Tipo1_ColorCadena;
      this.alturaCadena = [];
      if (colorCadena === '166') {
         this.alturaCadena.push(
            { id: 100, text: '100 cms' }, { id: 125, text: '125 cms' },
            { id: 150, text: '150 cms' }, { id: 175, text: '175 cms' },
            { id: 200, text: '200 cms' }, { id: 225, text: '225 cms' },
            { id: 250, text: '250 cms' }, { id: 300, text: '300 cms' }
         );
      }
      if (colorCadena === '167') {
         this.alturaCadena.push(
            { id: 150, text: '150 cms' }, { id: 200, text: '200 cms' }, { id: 225, text: '225 cms' }
         );
      }
      if (colorCadena === '168' || colorCadena === '169') {
         this.alturaCadena.push({ id: 150, text: '150 cms' }, { id: 225, text: '225 cms' });
      }
   }

   selImpresionDigital(): void {
      if (this.ID_Quiero) {
         this.load_Tejidos_ID();
         this.tejidosC = [];
      } else {
         this.load_Tejidos();
         this.tejidosC = [];
         this.idSeleccion = null;
         this.ID_Imagen = '';
      }
   }

   abrirSelectorImpresionDigital(): void {
      this.idSelector.abrir();
   }

   onImpresionDigitalSeleccionada(sel: ImpresionDigitalSeleccion): void {
      this.idSeleccion = sel;
      this.ID_Imagen = sel.nombre + (sel.texto ? ' — "' + sel.texto + '"' : '');
   }

   quitarImpresionDigital(): void {
      this.idSeleccion = null;
      this.ID_Imagen = '';
   }

   Cadena(value: number): void {
      this.Tipo1_Cadena_Label = 'Altura:';
      this.precios.T1_Inc_CadenaMetalica = 0;
      this.precios.T1_Inc_CadenaMetalica_C1 = '';
      this.esCadenaExt = value;
      if (value === 0) this.AlturaCadena = 150;
      if (value === 1) this.Change_ColorCadenaContinua();
      if (value === 2) this.Tarifa_AlturaCadena();
   }

   SubTipo(value: number): void {
      this.SubTipoCortina = value;
      this.load_Tejidos();
      this.load_Accionamientos();
   }

   Ancho_Change(): void {
      this.Tarifa_Contrapeso();
   }

   // ─── TARIFAS ─────────────────────────────────────────────────────────────────

   Tarifa_Contrapeso(): void {
      const cantidad = Number(this.Cantidad);
      const contrapeso = this.Tipo1_Contrapeso;
      const ancho = this.Ancho;
      if (ancho !== '' && contrapeso !== '-1') {
         this.service.getTarifaContrapeso(contrapeso, ancho).subscribe(
            data => {
               if (data.message === 'OK') {
                  const precio = data.v1;
                  const c1 = data.v2;
                  if (precio > 0) {
                     this.Tipo1_Contrapeso_Label = 'Tipo:(' + precio + '€ ' + c1 + ')';
                     this.precios.T1_Inc_Contrapeso = cantidad * precio;
                     this.precios.T1_Inc_Contrapeso_C1 = c1;
                     if (cantidad > 1) {
                        this.service.getMultiply(c1, cantidad).subscribe(
                           data => { this.precios.T1_Inc_Contrapeso_C1 = data[0].res; },
                           error => { this.precios.T1_Inc_Contrapeso_C1 = ''; }
                        );
                     }
                  } else {
                     this.Tipo1_Contrapeso_Label = 'Tipo:';
                     this.precios.T1_Inc_Contrapeso = 0;
                     this.precios.T1_Inc_Contrapeso_C1 = '';
                  }
               }
            },
            error => { }
         );
      }
   }

   Tarifa_AlturaCadena(): void {
      if (this.esCadena === 1 && this.esCadenaExt === 2) {
         if (this.Tipo1_AlturaCadenaM === '-1') {
            this.Tipo1_AlturaCadenaM = this.alturaCadenaM[0].text;
         }
         const altura = this.Tipo1_AlturaCadenaM;
         const cantidad = Number(this.Cantidad);
         this.service.getTarifaAlturaCadena('1', this.Cliente, altura).subscribe(
            data => {
               if (data.message === 'OK') {
                  const precio = data.v1;
                  const c1 = data.v2;
                  if (precio > 0) {
                     this.Tipo1_Cadena_Label = 'Altura:(' + precio + '€ ' + c1 + ')';
                     this.precios.T1_Inc_CadenaMetalica = cantidad * precio;
                     this.precios.T1_Inc_CadenaMetalica_C1 = c1;
                     if (cantidad > 1) {
                        this.service.getMultiply(c1, cantidad).subscribe(
                           data => { this.precios.T1_Inc_CadenaMetalica_C1 = data[0].res; },
                           error => { this.precios.T1_Inc_CadenaMetalica_C1 = ''; }
                        );
                     }
                  } else {
                     this.Tipo1_Cadena_Label = 'Altura:';
                     this.precios.T1_Inc_CadenaMetalica = 0;
                     this.precios.T1_Inc_CadenaMetalica_C1 = '';
                  }
               }
            },
            error => { }
         );
      }
   }

   tarifaCadena(): void {
      this.Tarifa_AlturaCadena();
   }

   Recalcular(): void {
      this.tarifaCadena();
      this.Tarifa_AlturaCadena();
      this.Tarifa_Contrapeso();
      this.ChangeRadioMando();
      this.CalculateC1();
   }

   CalculateC1(): void {
      this.service.getSum(
         this.precios.T1_Tejido_C1,
         this.precios.T1_Inc_Contrapeso_C1,
         this.precios.T1_Inc_Mando_C1,
         this.precios.T1_Inc_CadenaMetalica_C1,
         this.precios.T1_Inc_Cargador_C1, '', '', ''
      ).subscribe(
         data => { this.precios.T1_PVP_C1 = data[0].res; },
         error => {
            this.toaster.error(error.message);
         }
      );
   }

   asignaPrecios(): void {

      if (this.esCadena !== 1 || this.esCadenaExt !== 2) {
         this.precios.T1_Inc_CadenaMetalica = 0;
      }

      const total = this.precios.T1_Tejido
         + this.precios.T1_Inc_CadenaMetalica
         + this.precios.T1_Inc_Contrapeso
         + this.precios.T1_Inc_Mando
         + this.precios.T1_Inc_Cargador;

      this.precios.T1_PVP = total;
      this.calculando = false;

      console.log("Resultado de Precios");
      console.log(this.precios);

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





      if (!bretValue)
         this.toaster.error(strMessage, 'ATENCION');

      return bretValue;
   }

   NewPage() {

      this.CodigoProv = "";
      this.Tipo1_AnchoMaximo = -1;
      this.esCadenaExt = -1;
      this.Tipo1_Contrapeso_Label = "Tipo:";
      this.Tipo1_RadioMando_Label = "Mando:";
      this.Modelo_Label = "Color/Modelo:";
      this.Modelo_Cajon_Label = "Modelo de Cajón";
      this.Modelo_Guia_Label = "Tipo";
      this.Ral_Label = "RAL:";
      //this.RalC_Label = "RAL:";
      this.Tipo1_RadioMando_Disabled = false;

      /* PAGE 1 */

      this.Ancho = "";
      this.Alto = "";
      this.Cantidad = "1";
      /*
      this.selitems1 = [];
      this.selitems2 = [];
      this.selitems3 = [];
      */
      this.verMando = false;
      this.esCadena = 0;
      this.ID_Quiero = false;
      this.ID_Imagen = "";
      this.idSeleccion = null;

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
      this.Tipo1_Estancia = "-1";
      this.Tipo1_Estancia_Obs = "";

      //this.load_Tejidos();
   }

   T1Check(): { Proceed: number; Message: string } {
      let iProceed = 1;
      let strMessage = '';

      if (parseInt(this.Tipo1_Tejido) === -1) { iProceed = 0; strMessage = 'Debe Seleccionar el Tipo de Tejido'; }
      if (parseInt(this.Tipo1_TejidoColor) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Color del Tejido'; }
      if (parseInt(this.Tipo1_TejidoSalida) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar la salida del Tejido'; }
      if (parseInt(this.Tipo1_Marca) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar la Marca del Accionamiento'; }
      if (parseInt(this.Tipo1_Color) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Color/Modelo del Accionamiento'; }
      if (parseInt(this.Tipo1_Posicion) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar la Posición del Accionamiento'; }

      if (this.SubTipoCortina === 1) {
         if (parseInt(this.Tipo1_Soporte) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Tipo de Soporte'; }
         if (parseInt(this.Tipo1_SoporteC) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Color del Soporte'; }
         if (parseInt(this.Tipo1_Contrapeso) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Contrapeso'; }
         if (parseInt(this.Tipo1_ContrapesoC) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Color del contrapeso'; }
         if (parseInt(this.Tipo1_Tapa) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Tipo de Tapas'; }
         if (parseInt(this.Tipo1_TapaC) === -1 && iProceed) { iProceed = 0; strMessage = 'Debe Seleccionar el Color de las Tapas'; }
      }

      if (parseInt(this.Tipo1_Mando) === -1 && iProceed && this.verMando) { iProceed = 0; strMessage = 'Debe Seleccionar el Tipo de Mando'; }
      if (this.ID_Quiero && iProceed && this.ID_Imagen === '') { iProceed = 0; strMessage = 'Debe Indicar la Imagen para la Impresión Digital'; }

      if (this.esCadena === 1 && iProceed) {
         if (this.esCadenaExt === -1) { iProceed = 0; strMessage = 'Debe Seleccionar el Tipo de Cadena'; }
         if (iProceed && this.esCadenaExt === 0) {
            if (this.AlturaCadena === 0) { iProceed = 0; strMessage = 'Debe Indicar la Altura de la Cadena'; }
            if (iProceed && this.Tipo1_ColorCadena === '-1') { iProceed = 0; strMessage = 'Debe Indicar el Color de la Cadena'; }
         }
         if (iProceed && this.esCadenaExt === 1) {
            if (this.Tipo1_AlturaCadena === '-1') { iProceed = 0; strMessage = 'Debe Indicar la Altura de la Cadena'; }
            if (iProceed && this.Tipo1_ColorCadena === '-1') { iProceed = 0; strMessage = 'Debe Indicar el Color de la Cadena'; }
         }
         if (iProceed && this.esCadenaExt === 2) {
            if (this.Tipo1_AlturaCadenaM === '-1') { iProceed = 0; strMessage = 'Debe Indicar la Altura de la Cadena'; }
         }
      }

      return { Proceed: iProceed, Message: strMessage };
   }

   // ─── CONSTRUCCIÓN Y EMISIÓN ───────────────────────────────────────────────────

   Agregar(): void {
      const retValue = this.T1Check();
      if (retValue.Proceed !== 1) {
         this.toaster.error(retValue.Message, 'ERROR');
         return;
      }

      const it1 = parseInt(this.Tipo1_Tipo);
      const it2 = parseInt(this.Tipo1_Marca);
      const it3 = parseInt(this.Tipo1_Color);
      const it4 = parseInt(this.Tipo1_Posicion);
      const it5 = parseInt(this.Tipo1_Soporte);
      const it6 = parseInt(this.Tipo1_SoporteC);
      const it7 = parseInt(this.Tipo1_Tejido);
      const it8 = parseInt(this.Tipo1_TejidoColor);
      const it9 = parseInt(this.Tipo1_TejidoSalida);
      const it10 = parseInt(this.Tipo1_Contrapeso);
      const it28 = parseInt(this.Tipo1_ContrapesoC);
      const it11 = parseInt(this.Tipo1_Tapa);
      const it12 = parseInt(this.Tipo1_TapaC);
      const it13 = parseInt(this.Tipo1_Tubo);
      const it31 = parseInt(this.Tipo1_Mando);

      const it1s = this.items1[this.getPos(this.items1, it1)].text;
      const it2s = this.items2[this.getPos(this.items2, it2)].text;
      const it3s = this.items3[this.getPos(this.items3, it3)].text;
      const it4s = this.PosicionMando[this.getPos(this.PosicionMando, it4)].text;
      let it5s = '';
      if (this.soportes.length > 0) it5s = this.soportes[this.getPos(this.soportes, it5)].text;
      const it6s = this.soportesC[this.getPos(this.soportesC, it6)].text;
      const it7s = this.tejidos[this.getPos(this.tejidos, it7)].text;
      const it8s = this.tejidosC[this.getPos(this.tejidosC, it8)].text;
      const it9s = this.tejidosS[this.getPos(this.tejidosS, it9)].text;
      let it10s = '';
      if (this.contrapesos.length > 0) it10s = this.contrapesos[this.getPos(this.contrapesos, it10)].text;
      let it28s = '';
      if (this.contrapesosC.length > 0) it28s = this.contrapesosC[this.getPos(this.contrapesosC, it28)].text;
      let it11s = '';
      if (this.tapas.length > 0) it11s = this.tapas[this.getPos(this.tapas, it11)].text;
      let it12s = '';
      if (this.tapasC.length > 0) it12s = this.tapasC[this.getPos(this.tapasC, it12)].text;
      const it13s = 'AUTO';
      const ipos31 = this.getPos(this.radiomando, it31);
      const it31s = ipos31 >= 0 ? this.radiomando[ipos31].text : '';

      let alturaCadena = '0';
      let colorCadena = '';
      if (this.esCadena === 1) {
         if (this.esCadenaExt === 0) {
            const pos = this.getPos(this.colorCadena, parseInt(this.Tipo1_ColorCadena));
            if (pos >= 0) colorCadena = this.colorCadena[pos].text;
            alturaCadena = this.AlturaCadena.toString();
         }
         if (this.esCadenaExt === 1) {
            const pos = this.getPos(this.colorCadena, parseInt(this.Tipo1_ColorCadena));
            if (pos >= 0) colorCadena = this.colorCadena[pos].text;
            const posA = this.getPos(this.alturaCadena, parseInt(this.Tipo1_AlturaCadena));
            if (posA >= 0) alturaCadena = this.alturaCadena[posA].text;
         }
         if (this.esCadenaExt === 2) {
            const pos = this.getPos(this.alturaCadenaM, parseInt(this.Tipo1_AlturaCadenaM));
            if (pos >= 0) alturaCadena = this.alturaCadenaM[pos].text;
            colorCadena = '-1';
         }
      }

      // Construir precios completo que espera CortinaTipo
      const preciosCompleto = this.buildPreciosCompleto();

      const tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
      tipo.Enrollable_Add(
         this.Ancho, this.Alto, this.Cantidad,
         it1, it1s, it2, it2s, it13, it13s, it3, it3s, it4, it4s,
         it5, it5s, it6, it6s, it7, it7s, it8, it8s, it9, it9s,
         it10, it10s, it11, it11s, it12, it12s,
         alturaCadena, colorCadena, this.esCadenaExt,
         it28, it28s, this.ID_Quiero, this.ID_Imagen, it31, it31s,
         this.Tipo1_Estancia, this.Tipo1_Estancia_Obs, preciosCompleto,
         this.Tipo1_Cajon, this.Tipo1_CajonC, this.Tipo1_CajonRAL,
         this.Tipo1_Guia, this.Tipo1_GuiaC, this.Tipo1_GuiaRAL,
         this.SubTipoCortina, this.Tipo1_Cargador
      );

      this.onAdd.emit(tipo);
      const message = this.translation.get('AGREGADA CORTINA ENROLLABLE A CESTA');
      this.toaster.success(message, 'Cesta');
      this.reset();
   }

   // Rellena el objeto precios completo que necesita CortinaTipo (con claves T2, T3, T4 vacías)
   private buildPreciosCompleto(): any {
      return {
         ...this.precios,
         T2_Cantidad: 1, T2_Tejido: 0, T2_Tejido_C1: '', T2_NumeroVias: 0,
         T2_NumeroVias_C1: '', T2_NumSoportes: 0, T2_TipoSoporte: 0,
         T2_TipoSoporte_C1: '', T2_Inc_Impresion: 0, T2_Inc_Impresion_C1: '',
         T2_PVP: 0, T2_PVP_C1: '', T2_Fecha_Entrega: '', T2_Transporte: '', T2_SoporteTotal: 0,
         T3_Cantidad: 1, T3_Tejido: 0, T3_Tejido_C1: '', T3_TejidosCombinados: 0,
         T3_TejidosCombinados_C1: '', T3_TipoSoporte: 0, T3_NumSoportes: 0,
         T3_TipoSoporte_C1: '', T3_PVP: 0, T3_PVP_C1: '', T3_Fecha_Entrega: '', T3_Transporte: '',
         T32_Cantidad: 1, T32_Tejido: 0, T32_Tejido_C1: '', T32_TejidosCombinados: 0,
         T4_Cantidad: 1, T4_Tejido: 0, T4_Tejido_C1: '', T4_Coeficiente: 1,
         T4_PVP: 0, T4_PVP_C1: '', T4_Fecha_Entrega: '', T4_Transporte: ''
      };
   }

   // Método llamado desde el padre para rellenar el formulario en modo edición.
   // No reutiliza los handlers Change*()/load_*() de la cesta "añadir nuevo": esos
   // siempre preseleccionan el primer elemento de la lista recién cargada, lo que
   // pisaría el valor guardado de la línea en cuanto llega la respuesta HTTP.
   cargarEdicion(item: any): void {
      this.SubTipoCortina = item.SubTipoCortina || 1;
      this.Ancho = item.ancho;
      this.Alto = item.alto;
      this.Cantidad = item.cantidad;
      this.ID_Imagen = item.impresion_imagen;
      this.ID_Quiero = item.impresion;
      this.idSeleccion = null;
      this.Tipo1_TejidoSalida = item.tej_salida_id != null ? item.tej_salida_id.toString() : this.Tipo1_TejidoSalida;
      this.Tipo1_Posicion = item.acc_posicion_id != null ? item.acc_posicion_id.toString() : this.Tipo1_Posicion;
      this.Tipo1_Tubo = item.acc_tubo_id != null ? item.acc_tubo_id.toString() : this.Tipo1_Tubo;
      this.Tipo1_Estancia = item.estancia_id;
      this.Tipo1_Estancia_Obs = item.estancia_obs;
      this.esCadena = (item.acc_tipo_text || '').toUpperCase() === 'CADENA' ? 1 : 0;

      const cliente = parseInt(this.Cliente);
      const produc = this.SubTipoCortina === 2 ? 6 : 1;

      // Tejido -> Color
      this.Tipo1_Tejido = item.tej_tipo_id != null ? item.tej_tipo_id.toString() : '-1';
      const tejidoColor$ = this.ID_Quiero
         ? this.service.getTejidosColorID(item.tej_tipo_id, cliente, this.SubCliente)
         : this.service.getTejidosColor(item.tej_tipo_id, cliente, this.SubCliente);
      tejidoColor$.subscribe(
         data => {
            this.tejidosC = data;
            this.Tipo1_TejidoColor = this.selectFromList(data, item.tej_color_id);
            this.ChangeTejidoColor();
         },
         error => { this.toaster.error(error.message); }
      );

      // Cadena
      if (item.cad_Tipo === '0') {
         this.Cadena(0);
         this.AlturaCadena = item.cad_Altura;
         this.Tipo1_ColorCadena = item.cad_color_text;
      } else if (item.cad_Tipo === '1') {
         this.Tipo1_ColorCadena = item.cad_color_text;
         this.Cadena(1);
         this.Tipo1_AlturaCadena = item.cad_Altura;
      } else if (item.cad_Tipo === '2') {
         this.Cadena(2);
         this.Tipo1_AlturaCadenaM = item.cad_Altura;
      }

      // Accionamiento: Tipo -> Marca -> Color(/Mando); Soporte/Tapa/Contrapeso/Cajon/Guia dependen de Marca
      this.Tipo1_Tipo = item.acc_tipo_id != null ? item.acc_tipo_id.toString() : '-1';
      this.service.getAccionamientosTipos(item.acc_tipo_id, produc, cliente).subscribe(
         data => {
            this.items2 = data;
            this.TipoAccionamientos = data;
            this.Tipo1_Marca = this.selectFromList(data, item.acc_marca_id);
            const marcaId = parseInt(this.Tipo1_Marca);

            this.service.getAccionamientosColores(item.acc_tipo_id, marcaId, cliente, produc).subscribe(
               dataC => {
                  this.TipoColores = dataC;
                  this.colorCadena = dataC;
                  this.items3 = dataC;
                  this.Tipo1_Color = this.selectFromList(dataC, item.acc_modelo_id);
                  this.ChangeTipo1Color();

                  this.verMando = false;
                  if (this.TipoAccionamientos) {
                     this.TipoAccionamientos.forEach((entry: any) => {
                        if (entry.id == marcaId) { this.verMando = entry.mando == 1; }
                     });
                  }
                  if (this.verMando) {
                     this.Tipo1_RadioMando_Label = 'Mando:';
                     this.service.getRadioMandos_gen(parseInt(this.Tipo1_Color), cliente, produc).subscribe(
                        dataM => {
                           this.radiomando = dataM;
                           this.Tipo1_Mando = this.selectFromList(dataM, item.mando_id);
                           this.ChangeRadioMando();
                        },
                        error => { this.toaster.error(error.message); }
                     );
                  }
               },
               error => { this.toaster.error(error.message); }
            );

            if (this.SubTipoCortina !== 2) {
               this.service.getSoportesGEN(cliente, marcaId).subscribe(
                  dataS => {
                     this.soportes = dataS;
                     this.Tipo1_Soporte = this.selectFromList(dataS, item.sop_tipo_id);
                     this.service.getSoportesColor(parseInt(this.Tipo1_Soporte), cliente).subscribe(
                        dataSC => {
                           this.soportesC = dataSC;
                           this.Tipo1_SoporteC = this.selectFromList(dataSC, item.sop_color_id);
                        },
                        error => { this.toaster.error(error.message); }
                     );
                  },
                  error => { this.toaster.error(error.message); }
               );

               this.service.getTapasGEN(cliente, marcaId).subscribe(
                  dataT => {
                     this.tapas = dataT;
                     this.Tipo1_Tapa = this.selectFromList(dataT, item.tap_tipo_id);
                     this.service.getTapasColores(parseInt(this.Tipo1_Tapa), cliente).subscribe(
                        dataTC => {
                           this.tapasC = dataTC;
                           this.Tipo1_TapaC = this.selectFromList(dataTC, item.tap_color_id);
                        },
                        error => { this.toaster.error(error.message); }
                     );
                  },
                  error => { this.toaster.error(error.message); }
               );

               this.service.getContrapesosGEN(cliente, marcaId).subscribe(
                  dataCo => {
                     this.contrapesos = dataCo;
                     this.Tipo1_Contrapeso = this.selectFromList(dataCo, item.con_tipo_id);
                     this.service.getContrapesoColor(parseInt(this.Tipo1_Contrapeso), cliente).subscribe(
                        dataCoC => {
                           this.contrapesosC = dataCoC;
                           this.Tipo1_ContrapesoC = this.selectFromList(dataCoC, item.con_color_id);
                           this.Tarifa_Contrapeso();
                        },
                        error => { this.toaster.error(error.message); }
                     );
                  },
                  error => { this.toaster.error(error.message); }
               );
            } else {
               this.service.getCajones(cliente, marcaId).subscribe(
                  dataCaj => {
                     this.Cajones = dataCaj;
                     const posCaj = dataCaj.findIndex((x: any) => x.idrow == item.Tipo1_Cajon);
                     this.Tipo1_Cajon = posCaj >= 0 ? dataCaj[posCaj].idrow.toString() : (dataCaj.length ? dataCaj[0].idrow.toString() : '-1');
                  },
                  error => { this.toaster.error(error.message); }
               );
               this.Tipo1_CajonC = item.Tipo1_CajonC || 'BLA';
               this.Tipo1_CajonRAL = item.Tipo1_CajonRAL || '-1';

               this.service.getGuias(cliente, marcaId).subscribe(
                  dataGuia => {
                     this.Guias = dataGuia;
                     const posGuia = dataGuia.findIndex((x: any) => x.idrow == item.Tipo1_Guia);
                     this.Tipo1_Guia = posGuia >= 0 ? dataGuia[posGuia].idrow.toString() : (dataGuia.length ? dataGuia[0].idrow.toString() : '-1');
                  },
                  error => { this.toaster.error(error.message); }
               );
               this.Tipo1_GuiaC = item.Tipo1_GuiaC || 'BLA';
               this.Tipo1_GuiaRAL = item.Tipo1_GuiaRAL || '';
            }
         },
         error => { this.toaster.error(error.message); }
      );
   }

   // ─── HELPERS ─────────────────────────────────────────────────────────────────

   private selectFromList(list: any[], value: any): string {
      if (!list || list.length === 0) { return '-1'; }
      const pos = this.getPos(list, value);
      return pos >= 0 ? list[pos].id.toString() : list[0].id.toString();
   }

   getPos(array: any[], value: any): number {
      for (let i = 0; i < array.length; i++) {
         if (array[i].id == value) return i;
      }
      return -1;
   }

   Next(e: any, current: any): void {
      if (current && current.focus) current.focus();
   }


   T1Add(add: number) {

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


      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T1Check();

      if (retValue.Proceed == 1) {
         var ipos = this.getPos(this.items1, it1);
         var it1s = this.items1[ipos].text;
         var it2s = this.items2[this.getPos(this.items2, it2)].text;
         var it3s = this.items3[this.getPos(this.items3, it3)].text;
         var it4s = this.PosicionMando[this.getPos(this.PosicionMando, it4)].text;
         var it5s = "";
         if (this.soportes.length > 0) it5s = this.soportes[this.getPos(this.soportes, it5)].text;
         var it6s = this.soportesC[this.getPos(this.soportesC, it6)].text;
         var it7s = this.tejidos[this.getPos(this.tejidos, it7)].text;
         var it8s = this.tejidosC[this.getPos(this.tejidosC, it8)].text;
         var it9s = this.tejidosS[this.getPos(this.tejidosS, it9)].text;
         var it10s = "";
         if (this.contrapesos.length > 0) it10s = this.contrapesos[this.getPos(this.contrapesos, it10)].text;
         var it28s = "";
         if (this.contrapesosC.length > 0) it28s = this.contrapesosC[this.getPos(this.contrapesosC, it28)].text;
         var it11s = "";
         if (this.tapas.length > 0) it11s = this.tapas[this.getPos(this.tapas, it11)].text;
         var it12s = "";
         if (this.tapasC.length > 0) it12s = this.tapasC[this.getPos(this.tapasC, it12)].text;
         var it13s = "AUTO";


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

         var tipo: CortinaTipo = new CortinaTipo(this.codeCentro);
         tipo.Enrollable_Add(ancho, alto, cantidad, it1, it1s, it2, it2s, it13, it13s, it3, it3s, it4, it4s, it5, it5s, it6, it6s, it7, it7s, it8, it8s, it9, it9s, it10, it10s, it11, it11s, it12, it12s,
            alturaCadena, colorCadena, this.esCadenaExt, it28, it28s, this.ID_Quiero, this.ID_Imagen, it31, it31s, this.Tipo1_Estancia, this.Tipo1_Estancia_Obs, this.precios,
            this.Tipo1_Cajon, this.Tipo1_CajonC, this.Tipo1_CajonRAL, this.Tipo1_Guia, this.Tipo1_GuiaC, this.Tipo1_GuiaRAL, this.SubTipoCortina, this.Tipo1_Cargador);

         this.CestaPrecios = [];
         this.CestaPrecios.push(tipo);
      }
      else {
         this.toaster.error(retValue.Message, 'ERROR');
      }
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
               this.toaster.error(error.message);
            }
         );

   }

   /*
   Recalcular_Tipo1() {
      this.tarifaCadena();
      this.Tarifa_AlturaCadena();
      this.Tarifa_Contrapeso();
      this.ChangeRadioMando();
      this.CalculateC1_Tipo1();
   }
*/

   Recalcular_Tipo1(): void {
      const cadena$ = this.esCadena === 1 && this.esCadenaExt === 2
         ? this.service.getTarifaAlturaCadena('1', this.Cliente, this.Tipo1_AlturaCadenaM)
         : of(null);

      const contrapeso$ = this.Ancho !== '' && this.Tipo1_Contrapeso !== '-1'
         ? this.service.getTarifaContrapeso(this.Tipo1_Contrapeso, this.Ancho)
         : of(null);

      forkJoin([cadena$, contrapeso$]).subscribe(([cadena, contrapeso]) => {

         if (cadena != null) {
            if (cadena.message === 'OK') {
               this.precios.T1_Inc_CadenaMetalica = cadena.v1;
               this.precios.T1_Inc_CadenaMetalica_C1 = cadena.v2;
            }
         }

         if (contrapeso != null) {
            if (contrapeso.message === 'OK') {
               this.precios.T1_Inc_Contrapeso = contrapeso.v1;
               this.precios.T1_Inc_Contrapeso_C1 = contrapeso.v2;
            }
         }
         this.ChangeRadioMando();
         this.CalculateC1_Tipo1();
         this.asignaPrecios();
      });
   }

   CheckPrice() {


      let retValue = { Proceed: 0, Message: "" };
      retValue = this.T1Check();

      if (retValue.Proceed == 0) {
         this.toaster.error(retValue.Message, 'ATENCION');
      } else {

         this.T1Add(0);

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
                     let message = this.translation.get("PRODUCTOVALORADO");
                     this.toaster.info(message, "Valoración");

                     if (nohaytarifa == false) {
                        this.precios.T1_Cantidad = pvp_cantidad;
                        this.precios.T1_Tejido = pvp_cantidad * pvp;
                        this.precios.T1_Tejido_C1 = code_c1;
                        this.Recalcular_Tipo1();
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