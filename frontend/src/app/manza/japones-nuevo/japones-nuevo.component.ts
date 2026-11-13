import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { errorPasoMedidas, PASO_MEDIDA } from '../config/medidas';

/*
 * Panel japonés con las listas de la pantalla Productos (SOL_ACC_PJ_*, C:\dev\prod\sqlPanelJapones). Solo lo pinta
 * config.component para clientes con el interruptor del panel (SOL_ACC_PJ_CLIENTE, hoy solo el cliente 4).
 * El panel japonés de siempre (manza-japones, el de Leroy) no cambia.
 *
 * Paso 1, tipo de pedido: Completa, Solo riel o Solo tejido (decisiones del usuario, 2026-11-13).
 *   Completa  · mecanismo: ancho, altura total y vías → portatelas (= vías, de vías a 2 × vías) y ancho de portatela
 *               (= ancho / vías + 5 cm), los dos editables; color, posición del mando, recogida, contrapeso y soporte.
 *             · lamas: nº de lamas = nº de portatelas (no se edita); ancho de lama = ancho de portatela (es el mismo
 *               dato: cambiar uno cambia el otro); alto de lama terminada = alto − 2,5 cm (editable).
 *             · tejido: tejido, combinación sí/no, un color por lama (sin combinación, uno para todas) e impresión.
 *   Solo tejido: nº de lamas, ancho y alto de lama, tejido, combinación, colores e impresión.
 *   Solo riel:   ancho, altura del mando y vías → portatelas y ancho de portatela; las opciones del mecanismo.
 * Una lista con una sola opción se elige sola; una lista vacía no se pide.
 * Precio (backend /acc_cfg/pj/precio): completa y solo tejido con la tarifa T1/T2 del generador (producto Panel japonés);
 * solo riel con la tarifa del riel de Productos; más suplementos e impresión. Solo se añade a la cesta con el precio
 * calculado para la configuración actual; al grabar, el servidor lo vuelve a calcular.
 *
 * La línea viaja en la cesta como un CortinaTipo de tipo 2: la selección en `npj` (lo que graba el backend), los
 * textos para la cesta en `pj` y los importes en precios.T2_*.
 */
@Component({
   selector: 'manza-japones-nuevo',
   templateUrl: './japones-nuevo.component.html',
   styleUrls: ['../enrollable-nuevo/enrollable-nuevo.component.css', './japones-nuevo.component.css'],
   providers: [SMAPIService]
})
export class JaponesNuevoComponent implements OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Output() onAdd = new EventEmitter<CortinaTipo>();

   readonly pasoMedida = PASO_MEDIDA;
   /* ancho de portatela = ancho / vías + 5 cm; alto de lama terminada = alto − 2,5 cm */
   readonly sumaPortatela = 5;
   readonly restaAltoLama = 2.5;

   /* listas del panel (GET /acc_cfg/pj/opciones) */
   opc: any = null;
   cargando = false;

   /* selección (ids como texto, como los devuelven los select) */
   modalidad = '';
   vias = '';
   colorMecanismo = '';
   posicionMando = '';
   recogida = '';
   contrapeso = '';
   soporte = '';

   /* medidas */
   ancho: number = null;
   alto: number = null;
   alturaMando: number = null;
   cantidad = 1;
   portatelas: number = null;
   /* ancho de portatela = ancho de lama (un solo dato con dos nombres) */
   anchoPortatela: number = null;
   numLamas: number = null;
   altoLama: number = null;

   /* tejido del maestro: tipo de tejido -> serie -> color(es) */
   tipoTejido = '';
   nombreTejido = '';
   colorTejido = '';
   combinacion = false;
   /* con combinación, un color por lama (nombres de color de la serie) */
   colores: string[] = [];
   impresion = false;
   impresionTexto = '';
   tipoTarifa = '';

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
      this.acc.pjOpciones(this.Cliente).subscribe(
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
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones del panel japonés', 'Configurador'); }
      );
   }

   private cargarEstancias(): void {
      this.service.getEstancias(parseInt(this.Cliente, 10)).subscribe(
         data => { this.estancias = data || []; },
         error => this.toaster.error(error.message)
      );
   }

   // ─── TIPO DE PEDIDO Y LISTAS ───────────────────────────────────────────────────

   private porId(lista: any[], id: string): any {
      return (lista || []).find(x => String(x.id) === String(id)) || null;
   }

   private lista(nombre: string): any[] { return this.opc ? (this.opc[nombre] || []) : []; }
   get modalidades(): any[] { return this.lista('modalidades'); }
   get modalidadSel(): any { return this.porId(this.modalidades, this.modalidad); }

   /* Lo que pide cada tipo de pedido (los códigos son fijos: sqlPanelJapones/01) */
   get codModalidad(): string { return this.modalidadSel ? this.modalidadSel.codigo : ''; }
   get esCompleta(): boolean { return this.codModalidad === 'COMPLETA'; }
   get esSoloRiel(): boolean { return this.codModalidad === 'SOLO_RIEL'; }
   get esSoloTejido(): boolean { return this.codModalidad === 'SOLO_TEJIDO'; }
   get conMecanismo(): boolean { return this.esCompleta || this.esSoloRiel; }
   get conTejido(): boolean { return this.esCompleta || this.esSoloTejido; }

   get listaVias(): any[] { return this.conMecanismo ? this.lista('vias') : []; }
   get viasSel(): any { return this.porId(this.listaVias, this.vias); }
   get numVias(): number { return this.viasSel ? Number(this.viasSel.valor) : null; }
   get coloresMecanismo(): any[] { return this.conMecanismo ? this.lista('coloresMecanismo') : []; }
   get posicionesMando(): any[] { return this.conMecanismo ? this.lista('posicionesMando') : []; }
   get recogidas(): any[] { return this.conMecanismo ? this.lista('recogidas') : []; }
   get contrapesos(): any[] { return this.conMecanismo ? this.lista('contrapesos') : []; }
   get soportes(): any[] { return this.conMecanismo ? this.lista('soportes') : []; }

   /* La impresión digital sale con tejido y si el panel tiene algún tejido apto */
   get hayImpresion(): boolean {
      return this.conTejido && (this.lista('tejidos')).some(t => t.impresion_digital);
   }

   /* Qué cuenta la cantidad en cada tipo de pedido */
   get etiquetaCantidad(): string { return this.esSoloRiel ? 'Rieles' : 'Paneles'; }

   /* Después de cada cambio: se quita lo que ya no vale y se elige solo lo que tiene una única opción */
   ajustar(): void {
      if (!this.opc) { return; }
      const ajusta = (lista: any[], actual: string) => {
         if (actual && !this.porId(lista, actual)) { actual = ''; }
         return !actual && lista.length === 1 ? String(lista[0].id) : actual;
      };
      this.modalidad = ajusta(this.modalidades, this.modalidad);
      const viasAntes = this.vias;
      this.vias = ajusta(this.listaVias, this.vias);
      if (this.vias !== viasAntes) { this.cambiarVias(); }
      this.colorMecanismo = ajusta(this.coloresMecanismo, this.colorMecanismo);
      this.posicionMando = ajusta(this.posicionesMando, this.posicionMando);
      this.recogida = ajusta(this.recogidas, this.recogida);
      this.contrapeso = ajusta(this.contrapesos, this.contrapeso);
      this.soporte = ajusta(this.soportes, this.soporte);
      if (!this.conMecanismo) { this.portatelas = null; this.alturaMando = null; }
      if (!this.esSoloRiel) { this.alturaMando = null; }
      if (!this.conTejido) {
         this.tipoTejido = this.nombreTejido = this.colorTejido = '';
         this.combinacion = false;
         this.colores = [];
         this.numLamas = null;
         this.altoLama = null;
         this.tipoTarifa = '';
      } else if (this.tipoTejido && !this.tiposTejido.includes(this.tipoTejido)) {
         this.tipoTejido = this.nombreTejido = this.colorTejido = '';
      }
      if (this.esCompleta) { this.numLamas = this.portatelas; }
      if (!this.hayImpresion) { this.impresion = false; this.impresionTexto = ''; }
      if (this.impresion) { this.revisarTejidoImpresion(); }
      this.autoElegirTejido();
      this.ajustarColores();
   }

   cambiarModalidad(): void {
      /* la altura total y el alto de lama solo van en la completa / con tejido */
      if (!this.esCompleta) { this.alto = null; }
      if (this.esSoloTejido) { this.ancho = null; this.vias = ''; this.portatelas = null; }
      this.ajustar();
      if (this.esCompleta && this.alto > 0 && !(this.altoLama > 0)) { this.cambiarAlto(); }
   }

   // ─── CÁLCULOS AUTOMÁTICOS ──────────────────────────────────────────────────────

   private redondea(n: number): number { return Math.round(n * 100) / 100; }

   /* Al elegir las vías: tantas portatelas como vías y el ancho de portatela (los dos se pueden cambiar después) */
   cambiarVias(): void {
      this.portatelas = this.numVias || null;
      this.recalcularAnchoPortatela();
      this.cambiarPortatelas(false);
   }

   cambiarAncho(): void { this.recalcularAnchoPortatela(); }

   private recalcularAnchoPortatela(): void {
      if (this.conMecanismo && this.ancho > 0 && this.numVias > 0) {
         this.anchoPortatela = this.redondea(this.ancho / this.numVias + this.sumaPortatela);
      }
   }

   /* Portatelas: de vías a 2 × vías; en la completa, las lamas son las portatelas */
   cambiarPortatelas(avisar = true): void {
      const v = this.numVias;
      if (v > 0 && this.portatelas !== null && this.portatelas !== undefined) {
         if (this.portatelas < v) {
            if (avisar) { this.toaster.warning('El número de portatelas no puede ser menor que el número de vías', 'ATENCIÓN'); }
            this.portatelas = v;
         } else if (this.portatelas > 2 * v) {
            if (avisar) { this.toaster.warning('El número de portatelas no puede ser mayor que el doble del número de vías', 'ATENCIÓN'); }
            this.portatelas = 2 * v;
         }
      }
      if (this.esCompleta) { this.numLamas = this.portatelas; }
      this.ajustarColores();
   }

   /* Alto de lama terminada = alto − 2,5 cm (se puede cambiar) */
   cambiarAlto(): void {
      if (this.esCompleta && this.alto > 0) { this.altoLama = this.redondea(this.alto - this.restaAltoLama); }
   }

   cambiarNumLamas(): void { this.ajustarColores(); }

   // ─── TEJIDO Y COLORES ──────────────────────────────────────────────────────────

   private distintos(valores: string[]): string[] {
      return valores.filter((v, i) => valores.indexOf(v) === i).sort();
   }

   /* Los tejidos del panel; con impresión digital, solo los aptos */
   get tejidosDisponibles(): any[] {
      return this.lista('tejidos').filter(t => !this.impresion || t.impresion_digital);
   }

   etiquetaTipo(t: any): string { return t.tipo || 'Sin tipo'; }
   get tiposTejido(): string[] { return this.distintos(this.tejidosDisponibles.map(t => this.etiquetaTipo(t))); }
   get nombresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido).map(t => t.nombre));
   }
   get coloresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido).map(t => t.color));
   }

   /* La fila del maestro de un color de la serie elegida: si hay varias (varios criterios), la de menor criterio */
   private filaDe(color: string): any {
      const filas = this.tejidosDisponibles
         .filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido && t.color === color)
         .sort((a, b) => (a.criterio || 0) - (b.criterio || 0));
      return filas.length ? filas[0] : null;
   }
   get tejidoFila(): any { return this.colorTejido ? this.filaDe(this.colorTejido) : null; }

   /* Lamas a las que se les elige color */
   get lamas(): number[] {
      const n = Number(this.numLamas);
      return n > 0 && n <= 50 ? Array.from({ length: n }, (_, i) => i) : [];
   }

   /* El array de colores tiene una posición por lama; sin combinación, todas el color elegido */
   private ajustarColores(): void {
      const n = this.lamas.length;
      if (!this.conTejido || n === 0) { this.colores = []; return; }
      const validos = this.coloresTejido;
      const nuevos: string[] = [];
      for (let i = 0; i < n; i++) {
         const c = this.combinacion ? (this.colores[i] || this.colorTejido) : this.colorTejido;
         nuevos.push(c && validos.includes(c) ? c : '');
      }
      this.colores = nuevos;
   }

   cambiarTipoTejido(): void {
      this.nombreTejido = '';
      this.colorTejido = '';
      this.autoElegirTejido();
      this.ajustarColores();
   }

   cambiarNombreTejido(): void {
      this.colorTejido = '';
      this.autoElegirTejido();
      this.ajustarColores();
   }

   cambiarColorTejido(): void { this.ajustarColores(); }

   cambiarCombinacion(): void { this.ajustarColores(); }

   /* Al marcar la impresión: fuera el tejido elegido, si no es apto */
   cambiarImpresion(): void {
      if (!this.impresion) { this.impresionTexto = ''; }
      this.ajustar();
   }

   private revisarTejidoImpresion(): void {
      if (this.tipoTejido && !this.tiposTejido.includes(this.tipoTejido)) { this.tipoTejido = ''; }
      if (this.nombreTejido && !this.nombresTejido.includes(this.nombreTejido)) { this.nombreTejido = ''; }
      if (this.colorTejido && !this.coloresTejido.includes(this.colorTejido)) { this.colorTejido = ''; }
   }

   private autoElegirTejido(): void {
      if (!this.conTejido) { return; }
      if (!this.tipoTejido && this.tiposTejido.length === 1) { this.tipoTejido = this.tiposTejido[0]; }
      if (!this.nombreTejido && this.nombresTejido.length === 1) { this.nombreTejido = this.nombresTejido[0]; }
      if (!this.colorTejido && this.coloresTejido.length === 1) { this.colorTejido = this.coloresTejido[0]; }
   }

   trackLama(i: number): number { return i; }

   // ─── AÑADIR A LA CESTA ─────────────────────────────────────────────────────────

   private validar(): string {
      if (this.modalidades.length === 0) { return 'No hay tipos de pedido visibles: revíselos en Configuración → Productos → Panel japonés'; }
      if (!this.modalidad) { return 'Seleccione el tipo de pedido'; }
      if (this.conMecanismo) {
         if (!(this.ancho > 0)) { return 'Indique el ancho del mecanismo'; }
         if (this.esCompleta && !(this.alto > 0)) { return 'Indique la altura total'; }
         if (this.esSoloRiel && !(this.alturaMando > 0)) { return 'Indique la altura del mando'; }
         if (this.listaVias.length === 0) { return 'No hay números de vías: añádalos en Configuración → Productos → Panel japonés → Mecanismo'; }
         if (!this.vias) { return 'Seleccione el número de vías'; }
         if (!(this.portatelas >= this.numVias && this.portatelas <= 2 * this.numVias) || !Number.isInteger(Number(this.portatelas))) {
            return 'El número de portatelas tiene que ir de ' + this.numVias + ' a ' + (2 * this.numVias);
         }
         if (!(this.anchoPortatela > 0)) { return 'Indique el ancho de portatela'; }
         if (this.coloresMecanismo.length > 0 && !this.colorMecanismo) { return 'Seleccione el color del mecanismo'; }
         if (this.posicionesMando.length > 0 && !this.posicionMando) { return 'Seleccione la posición del mando'; }
         if (this.recogidas.length > 0 && !this.recogida) { return 'Seleccione el tipo de recogida'; }
         if (this.contrapesos.length > 0 && !this.contrapeso) { return 'Seleccione el contrapeso'; }
         if (this.soportes.length > 0 && !this.soporte) { return 'Seleccione el tipo de soporte'; }
      }
      if (this.conTejido) {
         if (!(this.numLamas > 0) || !Number.isInteger(Number(this.numLamas))) { return 'Indique el número de lamas'; }
         if (this.numLamas > 50) { return 'Como mucho 50 lamas'; }
         if (!(this.anchoPortatela > 0)) { return 'Indique el ancho de lama'; }
         if (!(this.altoLama > 0)) { return 'Indique el alto de lama terminada'; }
         if (this.esCompleta && this.altoLama > this.alto) { return 'El alto de lama no puede ser mayor que la altura total'; }
         if (!this.tipoTejido || !this.nombreTejido || !this.colorTejido) { return 'Seleccione el tejido y su color'; }
         if (this.combinacion && this.colores.some(c => !c)) { return 'Elija el color de cada lama'; }
         if (this.impresion && !this.impresionTexto.trim()) { return 'Indique el texto de la impresión digital'; }
         if (!this.tipoTarifa) { return 'Elija la tarifa: T1 o T2'; }
      }
      const errorMedida = errorPasoMedidas({ 'Ancho': this.conMecanismo ? this.ancho : null, 'Alto': this.esCompleta ? this.alto : null });
      if (errorMedida) { return errorMedida; }
      if (!(this.cantidad > 0) || !Number.isInteger(Number(this.cantidad))) { return 'Indique ' + this.etiquetaCantidad.toLowerCase() + ' (número entero)'; }
      return '';
   }

   /* Lo que determina el precio: si cambia algo, el precio calculado deja de valer */
   private get firma(): string {
      const t: any = this.construirLinea();
      return JSON.stringify({ n: t.npj, a: t.ancho, h: t.alto, c: t.cantidad, t: t.tipo_tarifa, i: t.impresion });
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
      this.acc.pjPrecio(this.Cliente, linea).subscribe(
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
      t.precios.T2_Cantidad = this.cantidad;
      t.precios.T2_Tejido = this.precio.unitario;
      t.precios.T2_PVP = this.precio.total;
      t.precios.T2_PVP_C1 = '';
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
      const filasColores = this.conTejido ? this.colores.map(c => this.filaDe(c)) : [];

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 2;
      /* medidas de la línea: ancho del mecanismo y altura total (solo la completa); el solo tejido las lleva en npj */
      t.ancho = this.conMecanismo ? this.ancho : null;
      t.alto = this.esCompleta ? this.alto : null;
      t.cantidad = this.cantidad;
      t.tej_tipo_text = fila ? fila.nombre : '';
      t.tej_color_text = fila ? fila.color : '';
      t.estancia_id = this.estancia;
      t.estancia_obs = this.observaciones || '';
      t.impresion = this.impresion;
      t.impresion_imagen = this.impresion ? this.impresionTexto.trim() : '';
      (t as any).tipo_tarifa = this.conTejido ? this.tipoTarifa : null;

      /* textos para la cesta y el resumen */
      (t as any).pj = {
         modalidad: nombre(this.modalidades, this.modalidad), modalidadCodigo: this.codModalidad,
         vias: this.viasSel ? this.viasSel.nombre : '',
         colorMecanismo: nombre(this.coloresMecanismo, this.colorMecanismo),
         posicionMando: nombre(this.posicionesMando, this.posicionMando),
         recogida: nombre(this.recogidas, this.recogida),
         contrapeso: nombre(this.contrapesos, this.contrapeso),
         soporte: nombre(this.soportes, this.soporte),
         portatelas: this.conMecanismo ? this.portatelas : null,
         anchoPortatela: this.anchoPortatela,
         numLamas: this.conTejido ? this.numLamas : null,
         altoLama: this.conTejido ? this.altoLama : null,
         alturaMando: this.esSoloRiel ? this.alturaMando : null,
         combinacion: this.conTejido && this.combinacion,
         colores: this.conTejido && this.combinacion ? this.colores.slice() : []
      };

      /* la selección nueva, que es lo que graba el backend */
      (t as any).npj = {
         modalidad: id(this.modalidad),
         vias: this.conMecanismo ? id(this.vias) : null,
         portatelas: this.conMecanismo ? this.portatelas : null,
         ancho_portatela: this.anchoPortatela,
         num_lamas: this.conTejido ? this.numLamas : null,
         alto_lama: this.conTejido ? this.altoLama : null,
         altura_mando: this.esSoloRiel ? this.alturaMando : null,
         color_mecanismo: id(this.colorMecanismo),
         posicion_mando: id(this.posicionMando),
         recogida: id(this.recogida),
         contrapeso: id(this.contrapeso),
         soporte: id(this.soporte),
         tejido: fila ? fila.id : null,
         combinacion: this.conTejido && this.combinacion,
         colores: this.conTejido ? filasColores.map(f => (f ? f.id : null)) : []
      };
      return t;
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.npj) { return; }
      if (!this.opc) { this.edicionPendiente = item; return; }
      const n = item.npj;
      const txt = (v: any) => (v === null || v === undefined ? '' : String(v));
      const num = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
      this.modalidad = txt(n.modalidad);
      this.vias = txt(n.vias);
      this.colorMecanismo = txt(n.color_mecanismo);
      this.posicionMando = txt(n.posicion_mando);
      this.recogida = txt(n.recogida);
      this.contrapeso = txt(n.contrapeso);
      this.soporte = txt(n.soporte);
      this.ancho = item.ancho > 0 ? Number(item.ancho) : null;
      this.alto = item.alto > 0 ? Number(item.alto) : null;
      this.cantidad = item.cantidad;
      this.portatelas = num(n.portatelas);
      this.anchoPortatela = num(n.ancho_portatela);
      this.numLamas = num(n.num_lamas);
      this.altoLama = num(n.alto_lama);
      this.alturaMando = num(n.altura_mando);
      this.estancia = item.estancia_id && String(item.estancia_id) !== '-1' ? String(item.estancia_id) : '-1';
      this.observaciones = item.estancia_obs || '';
      this.tipoTarifa = item.tipo_tarifa || '';
      /* tejido y colores del maestro de la línea */
      const tejidos = this.lista('tejidos');
      const tejido = tejidos.find(x => x.id === n.tejido);
      this.tipoTejido = tejido ? this.etiquetaTipo(tejido) : '';
      this.nombreTejido = tejido ? tejido.nombre : '';
      this.colorTejido = tejido ? tejido.color : '';
      this.combinacion = !!n.combinacion;
      this.colores = (n.colores || []).map(c => { const f = tejidos.find(x => x.id === c); return f ? f.color : ''; });
      this.impresion = !!item.impresion;
      this.impresionTexto = item.impresion_imagen || '';
      if (n.tejido && !tejido) { this.toaster.warning('El tejido de esta línea ya no está disponible: elija otro', 'Configurador'); }
      /* opciones que ya no existen o están ocultas: se avisa y ajustar() las quita */
      const falta = [[this.modalidades, this.modalidad], [this.listaVias, this.vias], [this.coloresMecanismo, this.colorMecanismo],
                     [this.posicionesMando, this.posicionMando], [this.recogidas, this.recogida], [this.contrapesos, this.contrapeso],
                     [this.soportes, this.soporte]]
         .some(([l, valor]: any[]) => valor && !this.porId(l, valor));
      if (falta) { this.toaster.warning('Alguna opción de esta línea ya no está disponible: revísela', 'Configurador'); }
      /* ajustar sin recalcular las portatelas ni el ancho de portatela guardados */
      const portatelas = this.portatelas, anchoPortatela = this.anchoPortatela;
      this.ajustar();
      if (this.conMecanismo && this.porId(this.listaVias, this.vias)) { this.portatelas = portatelas; this.anchoPortatela = anchoPortatela; }
      if (this.esCompleta) { this.numLamas = this.portatelas; }
      this.ajustarColores();
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
   }
}
