import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { errorPasoMedidas, PASO_MEDIDA } from '../config/medidas';

/*
 * Vertical con las listas de la pantalla Productos (SOL_ACC_VER_*, C:\dev\prod\sqlVertical). Solo lo pinta
 * config.component para clientes con el interruptor del Vertical (SOL_ACC_VER_CLIENTE, hoy solo el cliente 4).
 * El vertical de siempre (manza-vertical, el de Leroy) no cambia.
 *
 * Se pregunta en orden y solo lo que corresponde:
 *   tipo de vertical (Normal, Inclinada, Viena) → modalidad (las del tipo: completa, solo mecanismo, solo tejido)
 *   medidas según el tipo y la modalidad:
 *     completa: ancho, alto y cortinas · solo mecanismo: ancho y rieles · solo tejido: alto y número de lamas
 *     inclinada (solo completa): espacio a cubrir, alto máximo y alto mínimo (30° de inclinación como mucho)
 *   ancho de lama (completa y solo tejido) · mecanismo: posición, color del riel, accionamiento, soporte y recogida
 *   (completa y solo mecanismo) · tejido y color (completa y solo tejido); combinada (2.º color del mismo tejido)
 *   solo en la Normal completa
 * Cada tipo tiene SUS listas: al cambiar de tipo se vuelve a elegir todo. Una lista con una sola opción se elige
 * sola (la Viena con su único ancho de lama de 127 no lo pregunta); una lista vacía no se pide.
 * Precio: tarifa base por tipo + ancho de lama + tejido (sqlVertical/10; sin tarifa, 0 con aviso) + suplementos (backend /acc_cfg/ver/precio). Solo se añade a
 * la cesta con el precio calculado para la configuración actual; al grabar, el servidor lo vuelve a calcular.
 *
 * La línea viaja en la cesta como un CortinaTipo de tipo 3: la selección en `nver` (lo que graba el backend), los
 * textos para la cesta en `ver` y los importes en precios.T3_*.
 */
@Component({
   selector: 'manza-vertical-nuevo',
   templateUrl: './vertical-nuevo.component.html',
   styleUrls: ['../enrollable-nuevo/enrollable-nuevo.component.css', './vertical-nuevo.component.css'],
   providers: [SMAPIService]
})
export class VerticalNuevoComponent implements OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Output() onAdd = new EventEmitter<CortinaTipo>();

   readonly pasoMedida = PASO_MEDIDA;
   readonly maxInclinacion = 30;

   /* listas del Vertical (GET /acc_cfg/ver/opciones) */
   opc: any = null;
   cargando = false;

   /* selección (ids como texto, como los devuelven los select) */
   tipo = '';
   modalidad = '';
   anchoLama = '';
   posicion = '';
   colorRiel = '';
   accionamiento = '';
   soporte = '';
   recogida = '';

   /* tejido del maestro: tipo de tejido -> serie -> color; combinada: 2.º color de la misma serie */
   tipoTejido = '';
   nombreTejido = '';
   colorTejido = '';
   combinada = false;
   colorTejido2 = '';
   /* impresión digital (sqlImpresion): solo en la completa, sin combinada y si el tipo tiene tejidos aptos */
   impresion = false;
   impresionTexto = '';

   /* medidas: ancho (en la inclinada, espacio a cubrir), alto (en la inclinada, alto máximo) y alto mínimo */
   ancho: number = null;
   alto: number = null;
   altoMin: number = null;
   cantidad = 1;

   estancias: any[] = [];
   estancia = '-1';
   observaciones = '';

   precio: any = null;
   precioError = '';
   precioAviso = '';
   calculando = false;
   private precioFirma = '';

   /* Línea de la cesta que se quiere editar antes de que lleguen las opciones */
   private edicionPendiente: any = null;

   constructor(private service: SMAPIService, private acc: AccConfiguradorService, private toaster: ToastrService) { }

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente, 10) > 0) {
         this.cargarOpciones();
         this.cargarEstancias();
      }
   }

   // ─── CARGA ─────────────────────────────────────────────────────────────────────

   private cargarOpciones(): void {
      this.cargando = true;
      this.acc.verOpciones(this.Cliente).subscribe(
         data => {
            this.opc = data;
            this.cargando = false;
            if (this.edicionPendiente) {
               const item = this.edicionPendiente;
               this.edicionPendiente = null;
               this.cargarEdicion(item);
            } else {
               this.ajustar();
            }
         },
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones del Vertical', 'Configurador'); }
      );
   }

   private cargarEstancias(): void {
      this.service.getEstancias(parseInt(this.Cliente, 10)).subscribe(
         data => { this.estancias = data || []; },
         error => this.toaster.error(error.message)
      );
   }

   // ─── TIPO, MODALIDAD Y LISTAS DEL TIPO ─────────────────────────────────────────

   private porId(lista: any[], id: string): any {
      return (lista || []).find(x => String(x.id) === String(id)) || null;
   }

   get tipos(): any[] { return this.opc ? this.opc.tipos : []; }
   get tipoSel(): any { return this.porId(this.tipos, this.tipo); }
   get modalidades(): any[] {
      if (!this.tipoSel) { return []; }
      const ids = new Set((this.tipoSel.modalidades || []).map(String));
      return (this.opc.modalidades || []).filter(m => ids.has(String(m.id)));
   }
   get modalidadSel(): any { return this.porId(this.modalidades, this.modalidad); }

   /* Lo que pide cada tipo y modalidad (los códigos son fijos: sqlVertical/01) */
   get codTipo(): string { return this.tipoSel ? this.tipoSel.codigo : ''; }
   get codModalidad(): string { return this.modalidadSel ? this.modalidadSel.codigo : ''; }
   get esInclinada(): boolean { return this.codTipo === 'INCLINADA'; }
   get conMecanismo(): boolean { return this.codModalidad === 'COMPLETA' || this.codModalidad === 'SOLO_MECANISMO'; }
   get conTejido(): boolean { return this.codModalidad === 'COMPLETA' || this.codModalidad === 'SOLO_TEJIDO'; }
   get conAncho(): boolean { return this.codModalidad === 'COMPLETA' || this.codModalidad === 'SOLO_MECANISMO'; }
   get conAlto(): boolean { return this.codModalidad === 'COMPLETA' || this.codModalidad === 'SOLO_TEJIDO'; }
   get admiteCombinada(): boolean { return this.codTipo === 'NORMAL' && this.codModalidad === 'COMPLETA' && !this.impresion; }
   /* La impresión digital sale solo en la completa y si el tipo tiene algún tejido apto */
   get hayImpresion(): boolean {
      if (this.codModalidad !== 'COMPLETA' || !this.opc || !this.tipoSel) { return false; }
      const ids = new Set((this.tipoSel.tejidos || []).map(String));
      return (this.opc.tejidos || []).some(t => t.impresion_digital && ids.has(String(t.id)));
   }

   /* Qué cuenta la cantidad en cada modalidad */
   get etiquetaCantidad(): string {
      return this.codModalidad === 'SOLO_TEJIDO' ? 'Número de lamas' : this.codModalidad === 'SOLO_MECANISMO' ? 'Rieles' : 'Cortinas';
   }

   get anchosLama(): any[] { return this.tipoSel && this.conTejido ? this.tipoSel.anchosLama : []; }
   get posiciones(): any[] { return this.tipoSel && this.conMecanismo ? this.tipoSel.posiciones : []; }
   get coloresRiel(): any[] { return this.tipoSel && this.conMecanismo ? this.tipoSel.coloresRiel : []; }
   get accionamientos(): any[] { return this.tipoSel && this.conMecanismo ? this.tipoSel.accionamientos : []; }
   get soportes(): any[] { return this.tipoSel && this.conMecanismo ? this.tipoSel.soportes : []; }
   get recogidas(): any[] { return this.tipoSel && this.conMecanismo ? this.tipoSel.recogidas : []; }

   /* Después de cada cambio: se quita lo que ya no vale y se elige solo lo que tiene una única opción */
   ajustar(): void {
      if (!this.opc) { return; }
      const ajusta = (lista: any[], actual: string) => {
         if (actual && !this.porId(lista, actual)) { actual = ''; }
         return !actual && lista.length === 1 ? String(lista[0].id) : actual;
      };
      this.tipo = ajusta(this.tipos, this.tipo);
      this.modalidad = ajusta(this.modalidades, this.modalidad);
      this.anchoLama = ajusta(this.anchosLama, this.anchoLama);
      this.posicion = ajusta(this.posiciones, this.posicion);
      this.colorRiel = ajusta(this.coloresRiel, this.colorRiel);
      this.accionamiento = ajusta(this.accionamientos, this.accionamiento);
      this.soporte = ajusta(this.soportes, this.soporte);
      this.recogida = ajusta(this.recogidas, this.recogida);
      if (!this.conTejido) {
         this.tipoTejido = '';
         this.nombreTejido = '';
         this.colorTejido = '';
      } else if (this.tipoTejido && !this.tiposTejido.includes(this.tipoTejido)) {
         this.tipoTejido = '';
         this.nombreTejido = '';
         this.colorTejido = '';
      }
      if (!this.hayImpresion) { this.impresion = false; this.impresionTexto = ''; }
      if (this.impresion) { this.revisarTejidoImpresion(); }
      if (!this.admiteCombinada) { this.combinada = false; }
      if (!this.combinada || !this.coloresTejido2.includes(this.colorTejido2)) { this.colorTejido2 = ''; }
      if (!this.esInclinada) { this.altoMin = null; }
      this.autoElegirTejido();
   }

   /* Al cambiar de tipo, todo lo de debajo es de otras listas: se vuelve a elegir */
   cambiarTipo(): void {
      this.modalidad = '';
      this.anchoLama = this.posicion = this.colorRiel = this.accionamiento = this.soporte = this.recogida = '';
      this.tipoTejido = this.nombreTejido = this.colorTejido = this.colorTejido2 = '';
      this.combinada = false;
      this.ajustar();
   }

   // ─── TEJIDO ────────────────────────────────────────────────────────────────────

   private distintos(valores: string[]): string[] {
      return valores.filter((v, i) => valores.indexOf(v) === i).sort();
   }

   /* Los tejidos del maestro del tipo elegido; con impresión digital, solo los aptos */
   get tejidosDisponibles(): any[] {
      if (!this.opc || !this.tipoSel) { return []; }
      const ids = new Set((this.tipoSel.tejidos || []).map(String));
      return (this.opc.tejidos || []).filter(t => ids.has(String(t.id)) && (!this.impresion || t.impresion_digital));
   }

   /* Al marcar la impresión: fuera la combinada y el tejido elegido, si no es apto */
   cambiarImpresion(): void {
      if (!this.impresion) { this.impresionTexto = ''; }
      this.ajustar();
   }

   private revisarTejidoImpresion(): void {
      if (this.tipoTejido && !this.tiposTejido.includes(this.tipoTejido)) { this.tipoTejido = ''; }
      if (this.nombreTejido && !this.nombresTejido.includes(this.nombreTejido)) { this.nombreTejido = ''; }
      if (this.colorTejido && !this.coloresTejido.includes(this.colorTejido)) { this.colorTejido = ''; }
   }
   etiquetaTipo(t: any): string { return t.tipo || 'Sin tipo'; }
   get tiposTejido(): string[] { return this.distintos(this.tejidosDisponibles.map(t => this.etiquetaTipo(t))); }
   get nombresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido).map(t => t.nombre));
   }
   get coloresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido).map(t => t.color));
   }
   /* Combinada: los demás colores de la misma serie */
   get coloresTejido2(): string[] { return this.coloresTejido.filter(c => c !== this.colorTejido); }

   /* La fila del maestro de un color. En el vertical el tejido va en lamas y no depende del ancho del rollo:
      si hay varias filas del mismo tejido y color (varios criterios), se usa la de menor criterio */
   private filaDe(color: string): any {
      const filas = this.tejidosDisponibles
         .filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido && t.color === color)
         .sort((a, b) => (a.criterio || 0) - (b.criterio || 0));
      return filas.length ? filas[0] : null;
   }
   get tejidoFila(): any { return this.colorTejido ? this.filaDe(this.colorTejido) : null; }
   get tejido2Fila(): any { return this.combinada && this.colorTejido2 ? this.filaDe(this.colorTejido2) : null; }

   cambiarTipoTejido(): void {
      this.nombreTejido = '';
      this.colorTejido = '';
      this.colorTejido2 = '';
      this.autoElegirTejido();
   }

   cambiarNombreTejido(): void {
      this.colorTejido = '';
      this.colorTejido2 = '';
      this.autoElegirTejido();
   }

   cambiarColorTejido(): void {
      if (this.colorTejido2 === this.colorTejido) { this.colorTejido2 = ''; }
   }

   private autoElegirTejido(): void {
      if (!this.conTejido) { return; }
      if (!this.tipoTejido && this.tiposTejido.length === 1) { this.tipoTejido = this.tiposTejido[0]; }
      if (!this.nombreTejido && this.nombresTejido.length === 1) { this.nombreTejido = this.nombresTejido[0]; }
      if (!this.colorTejido && this.coloresTejido.length === 1) { this.colorTejido = this.coloresTejido[0]; }
   }

   // ─── INCLINADA ─────────────────────────────────────────────────────────────────

   /* Inclinación de la inclinada en grados (con espacio a cubrir y los dos altos) */
   get inclinacion(): number {
      if (!this.esInclinada || !(this.ancho > 0) || !(this.alto > 0) || !(this.altoMin > 0)) { return null; }
      return Math.atan((this.alto - this.altoMin) / this.ancho) * 180 / Math.PI;
   }

   // ─── AÑADIR A LA CESTA ─────────────────────────────────────────────────────────

   private validar(): string {
      if (!this.tipo) { return 'Seleccione el tipo de vertical'; }
      if (this.modalidades.length === 0) { return 'Este tipo de vertical no tiene modalidades: márquelas en Configuración → Productos → Vertical'; }
      if (!this.modalidad) { return 'Seleccione qué quiere pedir'; }
      if (this.anchosLama.length > 0 && !this.anchoLama) { return 'Seleccione el ancho de lama'; }
      if (this.posiciones.length > 0 && !this.posicion) { return 'Seleccione la posición del mecanismo'; }
      if (this.coloresRiel.length > 0 && !this.colorRiel) { return 'Seleccione el color del riel'; }
      if (this.accionamientos.length > 0 && !this.accionamiento) { return 'Seleccione el accionamiento'; }
      if (this.soportes.length > 0 && !this.soporte) { return 'Seleccione el soporte'; }
      if (this.recogidas.length > 0 && !this.recogida) { return 'Seleccione la recogida'; }
      if (this.conTejido && (!this.tipoTejido || !this.nombreTejido || !this.colorTejido)) { return 'Seleccione el tejido y su color'; }
      if (this.combinada && !this.colorTejido2) { return 'Seleccione el segundo color de la combinada'; }
      if (this.impresion && !this.impresionTexto.trim()) { return 'Indique el texto de la impresión digital'; }
      if (this.esInclinada) {
         if (!(this.ancho > 0)) { return 'Indique el espacio a cubrir'; }
         if (!(this.alto > 0) || !(this.altoMin > 0)) { return 'Indique el alto máximo y el alto mínimo'; }
         if (this.altoMin >= this.alto) { return 'El alto mínimo tiene que ser menor que el máximo'; }
         if (this.inclinacion > this.maxInclinacion) {
            return 'No se puede fabricar: la inclinación (' + this.inclinacion.toFixed(1) + '°) supera los ' + this.maxInclinacion + '°';
         }
      } else {
         if (this.conAncho && !(this.ancho > 0)) { return 'Indique el ancho'; }
         if (this.conAlto && !(this.alto > 0)) { return 'Indique el alto'; }
      }
      const errorMedida = errorPasoMedidas({
         'Ancho': this.conAncho ? this.ancho : null, 'Alto': this.conAlto ? this.alto : null,
         'Alto mínimo': this.esInclinada ? this.altoMin : null
      });
      if (errorMedida) { return errorMedida; }
      if (!(this.cantidad > 0) || !Number.isInteger(Number(this.cantidad))) { return 'Indique ' + this.etiquetaCantidad.toLowerCase() + ' (número entero)'; }
      return '';
   }

   /* Lo que determina el precio: si cambia algo, el precio calculado deja de valer */
   private get firma(): string {
      const t: any = this.construirLinea();
      return JSON.stringify({ n: t.nver, a: t.ancho, h: t.alto, c: t.cantidad });
   }

   get precioVigente(): boolean {
      return !!this.precio && this.precioFirma === this.firma;
   }

   CalcularPrecio(): void {
      const error = this.validar();
      if (error) { this.toaster.error(error, 'ATENCIÓN'); return; }
      const linea = this.construirLinea();
      const firma = this.firma;
      this.calculando = true;
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
      this.acc.verPrecio(this.Cliente, linea).subscribe(
         data => {
            this.calculando = false;
            this.precio = data;
            this.precioFirma = firma;
            this.precioAviso = data.aviso || '';
         },
         err => {
            this.calculando = false;
            const cuerpo = err && err.error ? err.error : {};
            this.precioError = cuerpo.message && cuerpo.message !== 'KO' ? cuerpo.message : 'No se pudo calcular el precio';
            this.precioAviso = cuerpo.aviso || '';
         }
      );
   }

   Agregar(): void {
      const error = this.validar();
      if (error) { this.toaster.error(error, 'ATENCIÓN'); return; }
      if (!this.precioVigente) { this.toaster.error('Calcule el precio antes de añadir a la cesta', 'ATENCIÓN'); return; }

      const t = this.construirLinea();
      /* importes para la cesta (el servidor los vuelve a calcular al grabar) */
      t.precios.T3_Cantidad = this.cantidad;
      t.precios.T3_Tejido = this.precio.unitario;
      t.precios.T3_PVP = this.precio.total;
      t.precios.T3_PVP_C1 = '';
      (t as any).desglose = this.precio.desglose;

      this.precio = null;
      this.onAdd.emit(t);
      this.toaster.success('Añadido a la cesta', 'Configurador');
   }

   /* La línea tal como viaja en la cesta y al backend */
   private construirLinea(): CortinaTipo {
      const id = (v: string) => (v ? parseInt(v, 10) : null);
      const nombre = (lista: any[], v: string) => { const x = this.porId(lista, v); return x ? x.nombre : ''; };
      const fila = this.conTejido ? this.tejidoFila : null;
      const fila2 = this.conTejido ? this.tejido2Fila : null;

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 3;
      /* solo las medidas de la modalidad; en la inclinada el alto es el máximo y va aparte (alto_max) */
      t.ancho = this.conAncho ? this.ancho : null;
      t.alto = this.conAlto && !this.esInclinada ? this.alto : null;
      t.cantidad = this.cantidad;
      t.tej_tipo_text = fila ? fila.nombre : '';
      t.tej_color_text = fila ? fila.color : '';
      t.estancia_id = this.estancia;
      t.estancia_obs = this.observaciones || '';
      t.impresion = this.impresion;
      t.impresion_imagen = this.impresion ? this.impresionTexto.trim() : '';

      /* textos para la cesta y el resumen */
      (t as any).ver = {
         tipo: nombre(this.tipos, this.tipo), tipoCodigo: this.codTipo,
         modalidad: nombre(this.modalidades, this.modalidad), modalidadCodigo: this.codModalidad,
         altoMax: this.esInclinada ? this.alto : null, altoMin: this.esInclinada ? this.altoMin : null,
         lama: nombre(this.anchosLama, this.anchoLama),
         posicion: nombre(this.posiciones, this.posicion),
         riel: nombre(this.coloresRiel, this.colorRiel),
         accionamiento: nombre(this.accionamientos, this.accionamiento),
         soporte: nombre(this.soportes, this.soporte),
         recogida: nombre(this.recogidas, this.recogida),
         color2: fila2 ? fila2.color : ''
      };

      /* la selección nueva, que es lo que graba el backend */
      (t as any).nver = {
         tipo: id(this.tipo),
         modalidad: id(this.modalidad),
         alto_min: this.esInclinada ? this.altoMin : null,
         alto_max: this.esInclinada ? this.alto : null,
         ancho_lama: id(this.anchoLama),
         posicion_mecanismo: id(this.posicion),
         color_riel: id(this.colorRiel),
         accionamiento: id(this.accionamiento),
         soporte: id(this.soporte),
         recogida: id(this.recogida),
         tejido: fila ? fila.id : null,
         tejido2: fila2 ? fila2.id : null
      };
      return t;
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.nver) { return; }
      if (!this.opc) { this.edicionPendiente = item; return; }
      const n = item.nver;
      const txt = (v: any) => (v === null || v === undefined ? '' : String(v));
      this.tipo = txt(n.tipo);
      this.modalidad = txt(n.modalidad);
      this.anchoLama = txt(n.ancho_lama);
      this.posicion = txt(n.posicion_mecanismo);
      this.colorRiel = txt(n.color_riel);
      this.accionamiento = txt(n.accionamiento);
      this.soporte = txt(n.soporte);
      this.recogida = txt(n.recogida);
      const inclinada = n.alto_max !== null && n.alto_max !== undefined;
      this.ancho = item.ancho > 0 ? Number(item.ancho) : null;
      this.alto = inclinada ? Number(n.alto_max) : (item.alto > 0 ? Number(item.alto) : null);
      this.altoMin = inclinada ? Number(n.alto_min) : null;
      this.cantidad = item.cantidad;
      this.estancia = item.estancia_id && String(item.estancia_id) !== '-1' ? String(item.estancia_id) : '-1';
      this.observaciones = item.estancia_obs || '';
      /* tejido (y 2.º color) del maestro de la línea */
      const tejido = (this.opc.tejidos || []).find(x => x.id === n.tejido);
      const tejido2 = (this.opc.tejidos || []).find(x => x.id === n.tejido2);
      this.tipoTejido = tejido ? this.etiquetaTipo(tejido) : '';
      this.nombreTejido = tejido ? tejido.nombre : '';
      this.colorTejido = tejido ? tejido.color : '';
      this.combinada = !!n.tejido2;
      this.colorTejido2 = tejido2 ? tejido2.color : '';
      this.impresion = !!item.impresion;
      this.impresionTexto = item.impresion_imagen || '';
      if (n.tejido && !tejido) { this.toaster.warning('El tejido de esta línea ya no está disponible: elija otro', 'Configurador'); }
      /* opciones que ya no existen, están ocultas o ya no son del tipo: se avisa y ajustar() las quita */
      const falta = [[this.tipos, this.tipo], [this.modalidades, this.modalidad], [this.anchosLama, this.anchoLama],
                     [this.posiciones, this.posicion], [this.coloresRiel, this.colorRiel], [this.accionamientos, this.accionamiento],
                     [this.soportes, this.soporte], [this.recogidas, this.recogida]]
         .some(([lista, valor]: any[]) => valor && !this.porId(lista, valor));
      if (falta) { this.toaster.warning('Alguna opción de esta línea ya no está disponible: revísela', 'Configurador'); }
      this.ajustar();
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
   }
}
