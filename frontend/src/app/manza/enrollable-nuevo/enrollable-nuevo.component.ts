import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from './acc-configurador.service';

/*
 * Enrollable con el accionamiento del modelo nuevo (SOL_ACC_*).
 * Solo lo pinta config.component para clientes con el interruptor activo (SOL_ACC_CLIENTE);
 * Leroy sigue con manza-enrollable. Nada de este componente se usa en el configurador de siempre.
 *
 * Pasos: medidas → tejido (lecturas de siempre, solo dependen del cliente) → accionamiento
 * (accionamiento → sistema → cadena: tipo, aro + altura o medida, color / motor: tipo, modelo,
 * mando, cargador, batería) → soporte y tapa (los del sistema) y contrapeso (todos), cada uno con
 * su color. Cajón y guía llegarán cuando estén en el modelo nuevo. De momento sin precio (decisión C).
 *
 * La línea viaja en la cesta como un CortinaTipo con los textos de siempre (para la cesta y el
 * resumen) y la selección nueva en la propiedad `nacc`, que es lo que graba el backend.
 */
@Component({
   selector: 'manza-enrollable-nuevo',
   templateUrl: './enrollable-nuevo.component.html',
   styleUrls: ['./enrollable-nuevo.component.css'],
   providers: [SMAPIService]
})
export class EnrollableNuevoComponent implements OnInit, OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Output() onAdd = new EventEmitter<CortinaTipo>();

   /* opciones del modelo nuevo (GET /acc_cfg/opciones) */
   opc: any = null;
   cargando = false;

   /* medidas */
   ancho: number = null;
   alto: number = null;
   cantidad = 1;
   instrucciones = '';

   /* tejido (modelo de siempre) */
   alltejidos: any[] = [];
   tiposTejido: string[] = [];
   tejidos: any[] = [];
   tejidosC: any[] = [];
   readonly salidas = [{ id: 1, text: 'Cascada' }, { id: 2, text: 'Pegado Pared' }];
   opacidad = '';
   tejido = '-1';
   tejidoColor = '-1';
   salida = '1';

   /* selección del modelo nuevo (ids como texto, por los <select>) */
   sel: any = {};

   /* línea que se está editando desde la cesta */
   private editando: CortinaTipo = null;

   constructor(private service: SMAPIService, private acc: AccConfiguradorService, private toaster: ToastrService) { }

   ngOnInit(): void {
      this.limpiarSeleccion();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente, 10) > 0) {
         this.cargarOpciones();
         this.cargarTejidos();
      }
   }

   // ─── CARGA ─────────────────────────────────────────────────────────────────────

   private cargarOpciones(): void {
      this.cargando = true;
      this.acc.opciones(this.Cliente).subscribe(
         data => { this.opc = data; this.cargando = false; },
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones de accionamiento', 'Configurador'); }
      );
   }

   private cargarTejidos(): void {
      this.service.getTejidosProducto(this.Cliente, '1', this.SubCliente).subscribe(
         data => {
            this.alltejidos = data || [];
            this.tiposTejido = [];
            this.alltejidos.forEach(t => { if (this.tiposTejido.indexOf(t.opacidad) < 0) { this.tiposTejido.push(t.opacidad); } });
            this.tiposTejido.sort();
            this.opacidad = this.tiposTejido[0] || '';
            this.cambiarOpacidad();
         },
         error => this.toaster.error(error.message)
      );
   }

   cambiarOpacidad(): void {
      this.tejidos = this.alltejidos.filter(t => t.opacidad === this.opacidad);
      this.tejido = '-1';
      this.tejidosC = [];
      this.tejidoColor = '-1';
   }

   cambiarTejido(colorInicial?: string): void {
      this.tejidosC = [];
      this.tejidoColor = '-1';
      if (this.tejido === '-1') { return; }
      this.service.getTejidosColor(parseInt(this.tejido, 10), parseInt(this.Cliente, 10), this.SubCliente).subscribe(
         data => {
            this.tejidosC = data || [];
            const inicial = colorInicial && this.tejidosC.some(c => String(c.id) === colorInicial) ? colorInicial : null;
            this.tejidoColor = inicial || (this.tejidosC.length > 0 ? String(this.tejidosC[0].id) : '-1');
         },
         error => this.toaster.error(error.message)
      );
   }

   // ─── CASCADA DEL ACCIONAMIENTO ──────────────────────────────────────────────────

   private limpiarSeleccion(): void {
      this.sel = { accionamiento: '', sistema: '', tipo_cadena: '', tipo_aro: '', altura: '', cadena_medida: '',
                   color_cadena: '', tipo_motor: '', modelo_motor: '', mando: '', cargador: '', bateria: '',
                   soporte: '', soporte_color: '', tapa: '', tapa_color: '', contrapeso: '', contrapeso_color: '' };
   }

   /* Al cambiar un paso se vacían los que dependen de él */
   cambiar(paso: string): void {
      const orden = ['accionamiento', 'sistema', 'tipo_cadena', 'tipo_motor', 'modelo_motor', 'soporte', 'tapa', 'contrapeso'];
      const piezasSistema = ['soporte', 'soporte_color', 'tapa', 'tapa_color'];
      const dependientes: { [p: string]: string[] } = {
         accionamiento: ['sistema', 'tipo_cadena', 'tipo_aro', 'altura', 'cadena_medida', 'color_cadena', 'tipo_motor', 'modelo_motor', 'mando', 'cargador', 'bateria'].concat(piezasSistema),
         sistema: ['tipo_motor', 'modelo_motor', 'mando', 'cargador', 'bateria'].concat(piezasSistema),
         soporte: ['soporte_color'],
         tapa: ['tapa_color'],
         contrapeso: ['contrapeso_color'],
         tipo_cadena: ['tipo_aro', 'altura', 'cadena_medida', 'color_cadena'],
         tipo_motor: ['modelo_motor', 'mando', 'cargador', 'bateria'],
         modelo_motor: ['mando', 'cargador', 'bateria']
      };
      if (orden.indexOf(paso) >= 0) { (dependientes[paso] || []).forEach(p => this.sel[p] = ''); }
      /* Si un paso solo tiene una opción, se elige sola */
      this.autoElegir();
   }

   private autoElegir(): void {
      const unica = (lista: any[], campo: string) => {
         if (!this.sel[campo] && lista.length === 1) { this.sel[campo] = String(lista[0].id); return true; }
         return false;
      };
      let cambio = true;
      while (cambio) {
         cambio = unica(this.accionamientos, 'accionamiento') || unica(this.sistemas, 'sistema') ||
                  (this.esCadena && (unica(this.tiposCadena, 'tipo_cadena') || unica(this.aros, 'tipo_aro') || unica(this.medidas, 'cadena_medida'))) ||
                  (this.esMotor && (unica(this.tiposMotor, 'tipo_motor') || unica(this.modelos, 'modelo_motor'))) ||
                  unica(this.soportes, 'soporte') || unica(this.coloresSoporte, 'soporte_color') ||
                  unica(this.tapas, 'tapa') || unica(this.coloresTapa, 'tapa_color') ||
                  unica(this.contrapesos, 'contrapeso') || unica(this.coloresContrapeso, 'contrapeso_color');
      }
   }

   private porId(lista: any[], id: string): any {
      return (lista || []).find(x => String(x.id) === String(id)) || null;
   }

   get accionamientos(): any[] { return this.opc ? this.opc.accionamientos : []; }
   get accionamientoSel(): any { return this.porId(this.accionamientos, this.sel.accionamiento); }
   get esCadena(): boolean { return !!this.accionamientoSel && this.accionamientoSel.codigo === 'CADENA'; }
   get esMotor(): boolean { return !!this.accionamientoSel && this.accionamientoSel.codigo === 'MOTOR'; }

   get sistemas(): any[] {
      const a = this.accionamientoSel;
      return a ? this.opc.sistemas.filter(s => a.sistemas.indexOf(s.id) >= 0) : [];
   }

   get tiposCadena(): any[] {
      const a = this.accionamientoSel;
      return a && this.esCadena ? this.opc.tiposCadena.filter(t => t.accionamiento_id === a.id) : [];
   }
   get tipoCadenaSel(): any { return this.porId(this.tiposCadena, this.sel.tipo_cadena); }
   get esAro(): boolean { return !!this.tipoCadenaSel && this.tipoCadenaSel.codigo === 'ARO_CADENA'; }
   get esMedida(): boolean { return !!this.tipoCadenaSel && this.tipoCadenaSel.codigo === 'CADENA_A_MEDIDA'; }
   get aros(): any[] { return this.esAro ? this.tipoCadenaSel.aros : []; }
   get medidas(): any[] { return this.esMedida ? this.tipoCadenaSel.medidas : []; }
   get alturas(): any[] { return this.esAro && this.opc ? this.opc.alturas : []; }
   get coloresCadena(): any[] {
      const t = this.tipoCadenaSel;
      return t ? this.opc.colores.filter(c => t.colores.indexOf(c.id) >= 0) : [];
   }

   /* Tipos de motor del accionamiento MOTOR que admite el sistema elegido */
   get tiposMotor(): any[] {
      const a = this.accionamientoSel;
      const sistema = parseInt(this.sel.sistema, 10);
      return a && this.esMotor && sistema ? this.opc.tiposMotor.filter(t => t.accionamiento_id === a.id && t.sistemas.indexOf(sistema) >= 0) : [];
   }
   get tipoMotorSel(): any { return this.porId(this.tiposMotor, this.sel.tipo_motor); }
   get modelos(): any[] { return this.tipoMotorSel ? this.tipoMotorSel.modelos : []; }
   get modeloSel(): any { return this.porId(this.modelos, this.sel.modelo_motor); }
   get mandos(): any[] { return this.modeloSel ? this.opc.mandos.filter(x => this.modeloSel.mandos.indexOf(x.id) >= 0) : []; }
   get cargadores(): any[] { return this.modeloSel ? this.opc.cargadores.filter(x => this.modeloSel.cargadores.indexOf(x.id) >= 0) : []; }
   get baterias(): any[] { return this.modeloSel ? this.opc.baterias.filter(x => this.modeloSel.baterias.indexOf(x.id) >= 0) : []; }

   /* Soporte y tapa: los marcados para el sistema elegido; contrapeso: todos. Cada color, de los que admite su pieza */
   private deSistema(lista: any[]): any[] {
      const sistema = parseInt(this.sel.sistema, 10);
      return this.opc && sistema ? (lista || []).filter(x => x.sistemas.indexOf(sistema) >= 0) : [];
   }
   private coloresDe(pieza: any, catalogo: any[]): any[] {
      return pieza ? (catalogo || []).filter(c => pieza.colores.indexOf(c.id) >= 0) : [];
   }
   get soportes(): any[] { return this.deSistema(this.opc ? this.opc.soportes : []); }
   get soporteSel(): any { return this.porId(this.soportes, this.sel.soporte); }
   get coloresSoporte(): any[] { return this.coloresDe(this.soporteSel, this.opc ? this.opc.coloresSoporte : []); }
   get tapas(): any[] { return this.deSistema(this.opc ? this.opc.tapas : []); }
   get tapaSel(): any { return this.porId(this.tapas, this.sel.tapa); }
   get coloresTapa(): any[] { return this.coloresDe(this.tapaSel, this.opc ? this.opc.coloresTapa : []); }
   get contrapesos(): any[] { return this.opc && this.sel.sistema ? this.opc.contrapesos : []; }
   get contrapesoSel(): any { return this.porId(this.contrapesos, this.sel.contrapeso); }
   get coloresContrapeso(): any[] { return this.coloresDe(this.contrapesoSel, this.opc ? this.opc.coloresContrapeso : []); }

   etiquetaAltura(a: any): string {
      return a.nombre || (Number(a.valor) + ' cm');
   }

   // ─── AÑADIR A LA CESTA ─────────────────────────────────────────────────────────

   private validar(): string {
      if (!(this.ancho > 0) || !(this.alto > 0)) { return 'Indique el ancho y el alto'; }
      if (!(this.cantidad > 0)) { return 'Indique la cantidad'; }
      if (this.tejido === '-1' || this.tejidoColor === '-1') { return 'Seleccione el tejido y su color'; }
      if (!this.sel.accionamiento) { return 'Seleccione el accionamiento'; }
      if (!this.sel.sistema) { return 'Seleccione el sistema'; }
      if (this.esCadena) {
         if (!this.sel.tipo_cadena) { return 'Seleccione el tipo de cadena'; }
         if (this.esAro && (!this.sel.tipo_aro || !this.sel.altura)) { return 'Seleccione el tipo de aro y la altura'; }
         if (this.esMedida && !this.sel.cadena_medida) { return 'Seleccione el tipo de cadena a medida'; }
         if (this.coloresCadena.length > 0 && !this.sel.color_cadena) { return 'Seleccione el color de la cadena'; }
      }
      if (this.esMotor && (!this.sel.tipo_motor || !this.sel.modelo_motor)) { return 'Seleccione el tipo y el modelo de motor'; }
      /* cada pieza es obligatoria si hay alguna que elegir, y su color si admite alguno */
      if (this.soportes.length > 0 && !this.sel.soporte) { return 'Seleccione el soporte'; }
      if (this.coloresSoporte.length > 0 && !this.sel.soporte_color) { return 'Seleccione el color del soporte'; }
      if (this.tapas.length > 0 && !this.sel.tapa) { return 'Seleccione la tapa'; }
      if (this.coloresTapa.length > 0 && !this.sel.tapa_color) { return 'Seleccione el color de la tapa'; }
      if (this.contrapesos.length > 0 && !this.sel.contrapeso) { return 'Seleccione el contrapeso'; }
      if (this.coloresContrapeso.length > 0 && !this.sel.contrapeso_color) { return 'Seleccione el color del contrapeso'; }
      return '';
   }

   Agregar(): void {
      const error = this.validar();
      if (error) { this.toaster.error(error, 'ATENCIÓN'); return; }

      const nombre = (lista: any[], id: string) => { const x = this.porId(lista, id); return x ? x.nombre : null; };
      const unir = (...partes: string[]) => partes.filter(p => !!p).join(' · ');
      const id = (v: string) => (v ? parseInt(v, 10) : null);

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 1;
      t.SubTipoCortina = 1;
      t.ancho = this.ancho;
      t.alto = this.alto;
      t.cantidad = this.cantidad;
      (t as any).instrucciones = this.instrucciones || '';

      /* tejido (ids y textos de siempre) */
      t.tej_tipo_id = parseInt(this.tejido, 10);
      t.tej_tipo_text = nombre(this.tejidos.map(x => ({ id: x.id, nombre: x.text })), this.tejido);
      t.tej_color_id = parseInt(this.tejidoColor, 10);
      t.tej_color_text = nombre(this.tejidosC.map(x => ({ id: x.id, nombre: x.text })), this.tejidoColor);
      t.tej_salida_id = parseInt(this.salida, 10);
      t.tej_salida_text = nombre(this.salidas.map(x => ({ id: x.id, nombre: x.text })), this.salida);

      /* accionamiento: ids antiguos a -1 y textos como los escribe sp_acc_pedido_tipo_1_add */
      t.acc_tipo_id = -1; t.acc_marca_id = -1; t.acc_modelo_id = -1; t.mando_id = -1;
      t.acc_tipo_text = this.accionamientoSel.nombre;
      t.acc_marca_text = unir(nombre(this.sistemas, this.sel.sistema), this.esMotor ? nombre(this.tiposMotor, this.sel.tipo_motor) : null);
      t.cad_Tipo = this.esCadena ? 1 : -1;
      if (this.esCadena) {
         t.acc_modelo_text = unir(nombre(this.tiposCadena, this.sel.tipo_cadena), nombre(this.aros, this.sel.tipo_aro), nombre(this.medidas, this.sel.cadena_medida));
         const altura = this.porId(this.alturas, this.sel.altura);
         t.cad_Altura = altura ? this.etiquetaAltura(altura) : nombre(this.medidas, this.sel.cadena_medida);
         t.cad_altura_text = t.cad_Altura;
         t.cad_color_text = nombre(this.coloresCadena, this.sel.color_cadena);
      } else if (this.esMotor) {
         t.acc_modelo_text = unir(nombre(this.modelos, this.sel.modelo_motor), nombre(this.cargadores, this.sel.cargador), nombre(this.baterias, this.sel.bateria));
         t.mando_text = nombre(this.mandos, this.sel.mando);
      }

      /* soporte, tapa y contrapeso: ids antiguos a -1 y textos de siempre */
      t.sop_tipo_id = -1; t.sop_color_id = -1; t.tap_tipo_id = -1; t.tap_color_id = -1; t.con_tipo_id = -1; t.con_color_id = -1;
      t.sop_tipo_text = nombre(this.soportes, this.sel.soporte);
      t.sop_color_text = nombre(this.coloresSoporte, this.sel.soporte_color);
      t.tap_tipo_text = nombre(this.tapas, this.sel.tapa);
      t.tap_color_text = nombre(this.coloresTapa, this.sel.tapa_color);
      t.con_tipo_text = nombre(this.contrapesos, this.sel.contrapeso);
      t.con_color_text = nombre(this.coloresContrapeso, this.sel.contrapeso_color);

      /* la selección nueva, que es lo que graba el backend */
      (t as any).nacc = {
         accionamiento: id(this.sel.accionamiento), sistema: id(this.sel.sistema),
         tipo_cadena: id(this.sel.tipo_cadena), tipo_aro: id(this.sel.tipo_aro), altura: id(this.sel.altura),
         cadena_medida: id(this.sel.cadena_medida), color_cadena: id(this.sel.color_cadena),
         tipo_motor: id(this.sel.tipo_motor), modelo_motor: id(this.sel.modelo_motor),
         mando: id(this.sel.mando), cargador: id(this.sel.cargador), bateria: id(this.sel.bateria),
         soporte: id(this.sel.soporte), soporte_color: id(this.sel.soporte_color),
         tapa: id(this.sel.tapa), tapa_color: id(this.sel.tapa_color),
         contrapeso: id(this.sel.contrapeso), contrapeso_color: id(this.sel.contrapeso_color)
      };

      this.editando = null;
      this.onAdd.emit(t);
      this.toaster.success('Añadido a la cesta (sin precio: configurador nuevo)', 'Configurador');
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.nacc) { return; }
      this.editando = item;
      this.ancho = item.ancho;
      this.alto = item.alto;
      this.cantidad = item.cantidad;
      this.instrucciones = item.instrucciones || '';
      const tejido = this.alltejidos.find(x => String(x.id) === String(item.tej_tipo_id));
      if (tejido) {
         this.opacidad = tejido.opacidad;
         this.cambiarOpacidad();
         this.tejido = String(tejido.id);
         this.cambiarTejido(String(item.tej_color_id));
      }
      this.salida = String(item.tej_salida_id || 1);
      this.limpiarSeleccion();
      Object.keys(this.sel).forEach(k => { const v = item.nacc[k]; this.sel[k] = v === null || v === undefined ? '' : String(v); });
   }
}
