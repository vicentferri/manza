import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { errorPasoMedidas, PASO_MEDIDA } from '../config/medidas';

/*
 * Cajón ZIP con las listas de la pantalla Productos (SOL_ACC_ZIP_*, C:\dev\prod\sqlCajonZip). Producto propio
 * (tipo 6). Solo lo pinta config.component para clientes con el interruptor del Cajón ZIP (SOL_ACC_ZIP_CLIENTE,
 * hoy solo el cliente 4). El Cajón ZIP de siempre (subtipo del enrollable) no cambia.
 *
 * Cascada (la raíz es el modelo de cajón):
 *   modelo de cajón → soporte, posición de salida, color del cajón (los del modelo) y vista (exterior/interior)
 *   tejido (los del maestro marcados para el Cajón ZIP; el criterio lo elige el configurador según el ancho)
 *   motor (siempre): tipo (los del modelo) → modelo → mando (los del modelo de motor) y posición del mando
 *   guía (las del modelo) → su color y su contrapeso → el color del contrapeso
 *   lacado: lista aislada, opcional; va en el pedido en un campo aparte
 *   medidas (pasos de 0,5 cm, sin mínimos ni máximos por ahora), estancia y observaciones
 * En cada paso: si la opción anterior tiene opciones marcadas hay que elegir una; si no tiene ninguna, no se pide.
 * Si una lista solo tiene una opción, se elige sola.
 * Precio: tarifa T1 (por grupo de tejido) o T2 (por tejido) del modelo de cajón en el generador + suplementos
 * (backend /acc_cfg/zip/precio). Solo se añade a la cesta con el precio calculado para la configuración actual;
 * al grabar, el servidor lo vuelve a calcular.
 *
 * La línea viaja en la cesta como un CortinaTipo de tipo 6: la selección en `nzip` (lo que graba el backend),
 * los textos para la cesta en `zip` y los importes en precios.T6_*.
 */
@Component({
   selector: 'manza-zip-nuevo',
   templateUrl: './zip-nuevo.component.html',
   styleUrls: ['../enrollable-nuevo/enrollable-nuevo.component.css'],
   providers: [SMAPIService]
})
export class ZipNuevoComponent implements OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Output() onAdd = new EventEmitter<CortinaTipo>();

   readonly pasoMedida = PASO_MEDIDA;

   /* listas del Cajón ZIP (GET /acc_cfg/zip/opciones) */
   opc: any = null;
   cargando = false;

   /* selección (ids como texto, como los devuelven los select) */
   modeloCajon = '';
   soporte = '';
   salida = '';
   colorCajon = '';
   vista = '';
   tipoMotor = '';
   modeloMotor = '';
   mando = '';
   posicion = '';
   guia = '';
   colorGuia = '';
   contrapeso = '';
   colorContrapeso = '';
   lacado = '';

   /* tejido del maestro: tipo -> tejido -> color; el criterio (ancho del rollo), el menor que cubra el ancho */
   tipoTejido = '';
   nombreTejido = '';
   colorTejido = '';

   ancho: number = null;
   alto: number = null;
   cantidad = 1;

   /* estancia y observaciones (catálogo de estancias de siempre, del cliente) */
   estancias: any[] = [];
   estancia = '-1';
   observaciones = '';

   /* precio: tarifa elegida, resultado del cálculo y la configuración para la que se calculó */
   tipoTarifa = '';
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
      this.acc.zipOpciones(this.Cliente).subscribe(
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
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones del Cajón ZIP', 'Configurador'); }
      );
   }

   private cargarEstancias(): void {
      this.service.getEstancias(parseInt(this.Cliente, 10)).subscribe(
         data => { this.estancias = data || []; },
         error => this.toaster.error(error.message)
      );
   }

   // ─── LISTAS (cascada) ──────────────────────────────────────────────────────────

   private porId(lista: any[], id: string): any {
      return (lista || []).find(x => String(x.id) === String(id)) || null;
   }

   /* Las opciones de `lista` cuyos ids están en `ids` (en el orden de la lista) */
   private de(lista: any[], ids: number[]): any[] {
      const set = new Set((ids || []).map(String));
      return (lista || []).filter(x => set.has(String(x.id)));
   }

   get modelosCajon(): any[] { return this.opc ? this.opc.modelosCajon : []; }
   get modeloSel(): any { return this.porId(this.modelosCajon, this.modeloCajon); }
   get soportes(): any[] { return this.modeloSel ? this.de(this.opc.soportes, this.modeloSel.soportes) : []; }
   get salidas(): any[] { return this.modeloSel ? this.de(this.opc.salidas, this.modeloSel.salidas) : []; }
   get coloresCajon(): any[] { return this.modeloSel ? this.de(this.opc.colores, this.modeloSel.colores) : []; }
   get vistas(): any[] { return this.opc ? this.opc.vistas : []; }

   get tiposMotor(): any[] { return this.modeloSel ? this.de(this.opc.tiposMotor, this.modeloSel.tiposMotor) : []; }
   get tipoMotorSel(): any { return this.porId(this.tiposMotor, this.tipoMotor); }
   get modelosMotor(): any[] { return this.tipoMotorSel ? this.tipoMotorSel.modelos : []; }
   get modeloMotorSel(): any { return this.porId(this.modelosMotor, this.modeloMotor); }
   get mandos(): any[] { return this.modeloMotorSel ? this.de(this.opc.mandos, this.modeloMotorSel.mandos) : []; }
   get posiciones(): any[] { return this.opc ? this.opc.posiciones : []; }

   get guias(): any[] { return this.modeloSel ? this.de(this.opc.guias, this.modeloSel.guias) : []; }
   get guiaSel(): any { return this.porId(this.guias, this.guia); }
   get coloresGuia(): any[] { return this.guiaSel ? this.de(this.opc.colores, this.guiaSel.colores) : []; }
   get contrapesos(): any[] { return this.guiaSel ? this.de(this.opc.contrapesos, this.guiaSel.contrapesos) : []; }
   get contrapesoSel(): any { return this.porId(this.contrapesos, this.contrapeso); }
   get coloresContrapeso(): any[] { return this.contrapesoSel ? this.de(this.opc.colores, this.contrapesoSel.colores) : []; }

   get lacados(): any[] { return this.opc ? this.opc.lacados : []; }

   /* Después de cada cambio: se quita lo que ya no vale y se elige solo lo que tiene una única opción.
      Va de arriba abajo, así que un cambio arriba arrastra a los pasos de debajo */
   ajustar(): void {
      if (!this.opc) { return; }
      const ajusta = (lista: any[], actual: string) => {
         if (actual && !this.porId(lista, actual)) { actual = ''; }
         return !actual && lista.length === 1 ? String(lista[0].id) : actual;
      };
      this.modeloCajon = ajusta(this.modelosCajon, this.modeloCajon);
      this.soporte = ajusta(this.soportes, this.soporte);
      this.salida = ajusta(this.salidas, this.salida);
      this.colorCajon = ajusta(this.coloresCajon, this.colorCajon);
      this.tipoMotor = ajusta(this.tiposMotor, this.tipoMotor);
      this.modeloMotor = ajusta(this.modelosMotor, this.modeloMotor);
      this.mando = ajusta(this.mandos, this.mando);
      this.guia = ajusta(this.guias, this.guia);
      this.colorGuia = ajusta(this.coloresGuia, this.colorGuia);
      this.contrapeso = ajusta(this.contrapesos, this.contrapeso);
      this.colorContrapeso = ajusta(this.coloresContrapeso, this.colorContrapeso);
      if (this.lacado && !this.porId(this.lacados, this.lacado)) { this.lacado = ''; }
      this.autoElegirTejido();
   }

   /* Color con su muestra: para pintar el cuadradito del hex junto al select */
   hexDe(lista: any[], id: string): string {
      const c = this.porId(lista, id);
      return c && c.hex ? c.hex : '';
   }

   etiquetaColor(c: any): string {
      return c.nombre + (c.ral ? ' (' + c.ral + ')' : '');
   }

   // ─── TEJIDO ────────────────────────────────────────────────────────────────────

   private distintos(valores: string[]): string[] {
      return valores.filter((v, i) => valores.indexOf(v) === i).sort();
   }

   get tejidosDisponibles(): any[] { return this.opc && this.opc.tejidos ? this.opc.tejidos : []; }
   etiquetaTipo(t: any): string { return t.tipo || 'Sin tipo'; }
   get tiposTejido(): string[] { return this.distintos(this.tejidosDisponibles.map(t => this.etiquetaTipo(t))); }
   get nombresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido).map(t => t.nombre));
   }
   get coloresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido).map(t => t.color));
   }
   private get filasTejido(): any[] {
      return this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido && t.color === this.colorTejido);
   }
   /* La fila que se usa: el menor criterio que cubra el ancho de la cortina */
   get tejidoFila(): any {
      if (!(this.ancho > 0)) { return null; }
      const validas = this.filasTejido.filter(t => t.criterio > 0 && t.criterio >= this.ancho).sort((a, b) => a.criterio - b.criterio);
      return validas.length ? validas[0] : null;
   }
   get anchoMaximo(): number {
      const criterios = this.filasTejido.map(t => t.criterio).filter(c => c > 0);
      return criterios.length ? Math.max(...criterios) : null;
   }

   cambiarTipoTejido(): void {
      this.nombreTejido = '';
      this.colorTejido = '';
      this.autoElegirTejido();
   }

   cambiarNombreTejido(): void {
      this.colorTejido = '';
      this.autoElegirTejido();
   }

   private autoElegirTejido(): void {
      if (!this.tipoTejido && this.tiposTejido.length === 1) { this.tipoTejido = this.tiposTejido[0]; }
      if (!this.nombreTejido && this.nombresTejido.length === 1) { this.nombreTejido = this.nombresTejido[0]; }
      if (!this.colorTejido && this.coloresTejido.length === 1) { this.colorTejido = this.coloresTejido[0]; }
   }

   // ─── AÑADIR A LA CESTA ─────────────────────────────────────────────────────────

   private validar(): string {
      if (!this.modeloCajon) { return 'Seleccione el modelo de cajón'; }
      if (this.soportes.length > 0 && !this.soporte) { return 'Seleccione el soporte'; }
      if (this.salidas.length > 0 && !this.salida) { return 'Seleccione la posición de salida'; }
      if (this.coloresCajon.length > 0 && !this.colorCajon) { return 'Seleccione el color del cajón'; }
      if (!this.vista) { return 'Seleccione la vista del cajón'; }
      if (!this.tipoTejido || !this.nombreTejido || !this.colorTejido) { return 'Seleccione el tejido y su color'; }
      if (this.tiposMotor.length === 0) { return 'Este modelo de cajón no tiene motores: márquelos en Configuración → Productos → Cajón ZIP'; }
      if (!this.tipoMotor) { return 'Seleccione el tipo de motor'; }
      if (!this.modeloMotor) { return 'Seleccione el motor'; }
      if (this.mandos.length > 0 && !this.mando) { return 'Seleccione el mando'; }
      if (!this.posicion) { return 'Seleccione la posición del mando'; }
      if (this.guias.length > 0 && !this.guia) { return 'Seleccione la guía'; }
      if (this.coloresGuia.length > 0 && !this.colorGuia) { return 'Seleccione el color de la guía'; }
      if (this.contrapesos.length > 0 && !this.contrapeso) { return 'Seleccione el contrapeso'; }
      if (this.coloresContrapeso.length > 0 && !this.colorContrapeso) { return 'Seleccione el color del contrapeso'; }
      if (!(this.ancho > 0) || !(this.alto > 0)) { return 'Indique el ancho y el alto'; }
      const errorMedida = errorPasoMedidas({ 'Ancho': this.ancho, 'Alto': this.alto });
      if (errorMedida) { return errorMedida; }
      if (!(this.cantidad > 0)) { return 'Indique la cantidad'; }
      if (!this.anchoMaximo) { return 'Este tejido no tiene criterio (ancho del rollo): complételo en el Maestro de tejidos'; }
      if (!this.tejidoFila) { return 'El ancho (' + this.ancho + ' cm) supera el máximo de este tejido (' + this.anchoMaximo + ' cm)'; }
      return '';
   }

   /* Lo que determina el precio: si cambia algo, el precio calculado deja de valer */
   private get firma(): string {
      const fila = this.tejidoFila;
      return JSON.stringify({ a: this.ancho, h: this.alto, c: this.cantidad, m: this.modeloCajon, tj: fila ? fila.id : null,
                              s: this.soporte, sa: this.salida, cc: this.colorCajon, tm: this.tipoMotor, mm: this.modeloMotor,
                              mn: this.mando, g: this.guia, cg: this.colorGuia, k: this.contrapeso, ck: this.colorContrapeso,
                              l: this.lacado, t: this.tipoTarifa });
   }

   get precioVigente(): boolean {
      return !!this.precio && this.precioFirma === this.firma;
   }

   CalcularPrecio(): void {
      if (!this.tipoTarifa) { this.toaster.error('Elija la tarifa: T1 o T2', 'ATENCIÓN'); return; }
      const error = this.validar();
      if (error) { this.toaster.error(error, 'ATENCIÓN'); return; }
      const linea = this.construirLinea();
      const firma = this.firma;
      this.calculando = true;
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
      this.acc.zipPrecio(this.Cliente, linea).subscribe(
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
      t.precios.T6_Cantidad = this.cantidad;
      t.precios.T6_Tejido = this.precio.unitario;
      t.precios.T6_PVP = this.precio.total;
      t.precios.T6_PVP_C1 = '';
      (t as any).desglose = this.precio.desglose;

      this.precio = null;
      this.onAdd.emit(t);
      this.toaster.success('Añadido a la cesta', 'Configurador');
   }

   /* La línea tal como viaja en la cesta y al backend */
   private construirLinea(): CortinaTipo {
      const fila = this.tejidoFila;
      const id = (v: string) => (v ? parseInt(v, 10) : null);
      const nombre = (lista: any[], v: string) => { const x = this.porId(lista, v); return x ? x.nombre : ''; };
      const color = (lista: any[], v: string) => { const x = this.porId(lista, v); return x ? { nombre: x.nombre, ral: x.ral || '', hex: x.hex || '' } : null; };

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 6;
      t.ancho = this.ancho;
      t.alto = this.alto;
      t.cantidad = this.cantidad;
      t.tej_tipo_text = fila ? fila.nombre : '';
      t.tej_color_text = fila ? fila.color : '';
      t.estancia_id = this.estancia;
      t.estancia_obs = this.observaciones || '';

      /* textos para la cesta y el resumen */
      (t as any).zip = {
         modelo: nombre(this.modelosCajon, this.modeloCajon),
         soporte: nombre(this.soportes, this.soporte),
         salida: nombre(this.salidas, this.salida),
         colorCajon: color(this.coloresCajon, this.colorCajon),
         vista: nombre(this.vistas, this.vista),
         tipoMotor: nombre(this.tiposMotor, this.tipoMotor),
         motor: nombre(this.modelosMotor, this.modeloMotor),
         mando: nombre(this.mandos, this.mando),
         posicion: nombre(this.posiciones, this.posicion),
         guia: nombre(this.guias, this.guia),
         colorGuia: color(this.coloresGuia, this.colorGuia),
         contrapeso: nombre(this.contrapesos, this.contrapeso),
         colorContrapeso: color(this.coloresContrapeso, this.colorContrapeso),
         lacado: nombre(this.lacados, this.lacado),
         criterio: fila ? fila.criterio : null
      };

      /* la selección nueva, que es lo que graba el backend */
      (t as any).nzip = {
         modelo_cajon: id(this.modeloCajon),
         soporte: id(this.soporte),
         posicion_salida: id(this.salida),
         color_cajon: id(this.colorCajon),
         vista: this.vista,
         tejido: fila ? fila.id : null,
         tipo_motor: id(this.tipoMotor),
         modelo_motor: id(this.modeloMotor),
         mando: id(this.mando),
         posicion: id(this.posicion),
         guia: id(this.guia),
         color_guia: id(this.colorGuia),
         contrapeso: id(this.contrapeso),
         color_contrapeso: id(this.colorContrapeso),
         lacado: id(this.lacado)
      };
      (t as any).tipo_tarifa = this.tipoTarifa;
      return t;
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.nzip) { return; }
      if (!this.opc) { this.edicionPendiente = item; return; }
      const n = item.nzip;
      const txt = (v: any) => (v === null || v === undefined ? '' : String(v));
      this.modeloCajon = txt(n.modelo_cajon);
      this.soporte = txt(n.soporte);
      this.salida = txt(n.posicion_salida);
      this.colorCajon = txt(n.color_cajon);
      this.vista = txt(n.vista);
      this.tipoMotor = txt(n.tipo_motor);
      this.modeloMotor = txt(n.modelo_motor);
      this.mando = txt(n.mando);
      this.posicion = txt(n.posicion);
      this.guia = txt(n.guia);
      this.colorGuia = txt(n.color_guia);
      this.contrapeso = txt(n.contrapeso);
      this.colorContrapeso = txt(n.color_contrapeso);
      this.lacado = txt(n.lacado);
      this.ancho = item.ancho;
      this.alto = item.alto;
      this.cantidad = item.cantidad;
      this.estancia = item.estancia_id && String(item.estancia_id) !== '-1' ? String(item.estancia_id) : '-1';
      this.observaciones = item.estancia_obs || '';
      /* tejido del maestro de la línea: tipo, nombre y color; el criterio sale del ancho */
      const tejido = this.tejidosDisponibles.find(x => x.id === n.tejido);
      this.tipoTejido = tejido ? this.etiquetaTipo(tejido) : '';
      this.nombreTejido = tejido ? tejido.nombre : '';
      this.colorTejido = tejido ? tejido.color : '';
      if (!tejido) { this.toaster.warning('El tejido de esta línea ya no está disponible: elija otro', 'Configurador'); }
      /* opciones que ya no existen, están ocultas o ya no son de la opción anterior: se avisa y ajustar() las quita */
      const falta = [[this.modelosCajon, this.modeloCajon], [this.soportes, this.soporte], [this.salidas, this.salida],
                     [this.coloresCajon, this.colorCajon], [this.tiposMotor, this.tipoMotor], [this.modelosMotor, this.modeloMotor],
                     [this.mandos, this.mando], [this.guias, this.guia], [this.coloresGuia, this.colorGuia],
                     [this.contrapesos, this.contrapeso], [this.coloresContrapeso, this.colorContrapeso], [this.lacados, this.lacado]]
         .some(([lista, valor]: any[]) => valor && !this.porId(lista, valor));
      if (falta) { this.toaster.warning('Alguna opción de esta línea ya no está disponible: revísela', 'Configurador'); }
      this.ajustar();
      /* la tarifa elegida; el precio hay que volver a calcularlo */
      this.tipoTarifa = item.tipo_tarifa || '';
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
   }
}
