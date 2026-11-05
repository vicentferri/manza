import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { errorPasoMedidas, PASO_MEDIDA } from '../config/medidas';

/*
 * Solar Mini con las listas de la pantalla Productos (SOL_ACC_MINI_*, C:\dev\prod\sqlSolarMini).
 * Solo lo pinta config.component para clientes con el interruptor del Solar Mini (SOL_ACC_MINI_CLIENTE,
 * hoy solo el cliente 4); Leroy sigue con manza-compac. Nada de este componente se usa en el configurador de siempre.
 *
 * Pasos: junquillo y medidas (con JR, Redondeado / Biselado, también el ancho exterior) → perfilería (un color
 * de la lista o un color RAL) → accionamiento (color de cadena, altura de cadena en cm, posición del mando,
 * color de tapas) → tejido (los del maestro marcados para el Solar Mini; el criterio lo elige el configurador
 * según el ancho; con impresión digital, solo los que la admiten) → estancia y observaciones → precio.
 * Medidas en pasos de 0,5 cm, como el configurador de siempre. Impresión digital: sí/no y el texto de la imagen;
 * importe fijo, como el enrollable nuevo.
 * Precio: tarifa T1 (por grupo de tejido) o T2 (por tejido) del producto Solar Mini en el generador + suplementos
 * de sus listas (backend /acc_cfg/mini/precio). Solo se añade a la cesta con el precio calculado para la
 * configuración actual; al grabar, el servidor lo vuelve a calcular.
 *
 * La línea viaja en la cesta como un CortinaTipo de tipo 4 con los textos de siempre (para la cesta y el resumen,
 * como los graba sp_acc_mini_pedido_tipo_4_add) y la selección nueva en la propiedad `nmini`.
 */
@Component({
   selector: 'manza-compac-nuevo',
   templateUrl: './compac-nuevo.component.html',
   styleUrls: ['../enrollable-nuevo/enrollable-nuevo.component.css'],
   providers: [SMAPIService]
})
export class CompacNuevoComponent implements OnChanges {

   @Input() Cliente: string = '-1';
   @Input() codeCentro: string = '-1';
   @Input() SubCliente: string = '2';
   @Input() ReferenciaTienda: string = '';
   @Output() onAdd = new EventEmitter<CortinaTipo>();

   /* las medidas van en pasos de 0,5 cm, como el configurador de siempre */
   readonly pasoMedida = PASO_MEDIDA;

   /* listas del Solar Mini (GET /acc_cfg/mini/opciones) */
   opc: any = null;
   cargando = false;

   /* junquillo y medidas */
   junquillo = '';
   ancho: number = null;
   /* ancho exterior: solo con JR */
   ancho2: number = null;
   alto: number = null;
   cantidad = 1;

   /* perfilería: 'color' (lista de colores) o 'ral' (lista de colores RAL) */
   modoPerfil = 'color';
   colorPerfil = '';
   colorRal = '';

   /* accionamiento: altura de la cadena y posición, como en el configurador de siempre */
   colorCadena = '';
   alturaCadena: number = null;
   readonly posiciones = [{ id: 'DER', nombre: 'Derecha' }, { id: 'IZQ', nombre: 'Izquierda' }];
   posicion = '';
   colorTapa = '';

   /* tejido del maestro: tipo -> tejido -> color; el criterio (ancho del rollo), el menor que cubra el ancho */
   tipoTejido = '';
   nombreTejido = '';
   colorTejido = '';

   /* impresión digital: sí/no y el texto de la imagen. Con sí, solo se ofrecen los tejidos que la admiten */
   impresion = false;
   impresionTexto = '';

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

   /* Línea de la cesta que se quiere editar antes de que lleguen las opciones (el componente se crea al
      pulsar Modificar): se aplica en cuanto se cargan */
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
      this.acc.miniOpciones(this.Cliente).subscribe(
         data => {
            this.opc = data;
            this.cargando = false;
            if (this.edicionPendiente) {
               const item = this.edicionPendiente;
               this.edicionPendiente = null;
               this.cargarEdicion(item);
            } else {
               this.autoElegir();
            }
         },
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones del Solar Mini', 'Configurador'); }
      );
   }

   private cargarEstancias(): void {
      this.service.getEstancias(parseInt(this.Cliente, 10)).subscribe(
         data => { this.estancias = data || []; },
         error => this.toaster.error(error.message)
      );
   }

   // ─── LISTAS ────────────────────────────────────────────────────────────────────

   private porId(lista: any[], id: string): any {
      return (lista || []).find(x => String(x.id) === String(id)) || null;
   }

   get junquillos(): any[] { return this.opc ? this.opc.junquillos : []; }
   get coloresPerfil(): any[] { return this.opc ? this.opc.coloresPerfil : []; }
   get coloresRal(): any[] { return this.opc ? this.opc.coloresRal : []; }
   get coloresCadena(): any[] { return this.opc ? this.opc.coloresCadena : []; }
   get coloresTapa(): any[] { return this.opc ? this.opc.coloresTapa : []; }

   get junquilloSel(): any { return this.porId(this.junquillos, this.junquillo); }
   /* JR (Redondeado / Biselado) lleva también el ancho exterior, como en el configurador de siempre */
   get esJR(): boolean { return !!this.junquilloSel && this.junquilloSel.codigo === 'JR'; }

   /* Hay perfilería que elegir si alguna de las dos listas tiene opciones */
   get hayPerfil(): boolean { return this.coloresPerfil.length > 0 || this.coloresRal.length > 0; }

   /* Redondeado / Biselado: entre el ancho exterior y el interior no puede haber más de 2 cm de diferencia.
      Se avisa en cuanto están los dos anchos (antes de calcular el precio) y no deja calcular ni añadir */
   readonly maxDiferenciaBiselado = 2;
   get avisoBiselado(): string {
      if (!this.esJR || !(this.ancho > 0) || !(this.ancho2 > 0)) { return ''; }
      const diferencia = Math.abs(Number(this.ancho2) - Number(this.ancho));
      if (diferencia <= this.maxDiferenciaBiselado) { return ''; }
      return 'Entre el ancho exterior y el interior no puede haber más de ' + this.maxDiferenciaBiselado + ' cm de diferencia (ahora hay '
         + String(+diferencia.toFixed(2)).replace('.', ',') + ' cm)';
   }

   cambiarJunquillo(): void {
      if (!this.esJR) { this.ancho2 = null; }
   }

   cambiarModoPerfil(): void {
      this.colorPerfil = '';
      this.colorRal = '';
      this.autoElegir();
   }

   /* Si una lista solo tiene una opción, se elige sola; la perfilería empieza por la lista que tenga opciones */
   private autoElegir(): void {
      const unica = (lista: any[], actual: string) => (!actual && lista.length === 1 ? String(lista[0].id) : actual);
      this.junquillo = unica(this.junquillos, this.junquillo);
      if (this.modoPerfil === 'color' && this.coloresPerfil.length === 0 && this.coloresRal.length > 0) { this.modoPerfil = 'ral'; }
      if (this.modoPerfil === 'ral' && this.coloresRal.length === 0 && this.coloresPerfil.length > 0) { this.modoPerfil = 'color'; }
      if (this.modoPerfil === 'color') { this.colorPerfil = unica(this.coloresPerfil, this.colorPerfil); }
      if (this.modoPerfil === 'ral') { this.colorRal = unica(this.coloresRal, this.colorRal); }
      this.colorCadena = unica(this.coloresCadena, this.colorCadena);
      this.colorTapa = unica(this.coloresTapa, this.colorTapa);
      this.autoElegirTejido();
   }

   // ─── TEJIDO ────────────────────────────────────────────────────────────────────

   private distintos(valores: string[]): string[] {
      return valores.filter((v, i) => valores.indexOf(v) === i).sort();
   }

   get tejidosDisponibles(): any[] {
      const todos = this.opc && this.opc.tejidos ? this.opc.tejidos : [];
      return this.impresion ? todos.filter(t => t.impresion_digital) : todos;
   }

   /* Con impresión digital solo salen los tejidos que la admiten: si el elegido no, se vacía */
   cambiarImpresion(): void {
      if (!this.impresion) { this.impresionTexto = ''; }
      if (this.tiposTejido.indexOf(this.tipoTejido) < 0) { this.tipoTejido = ''; }
      if (this.nombresTejido.indexOf(this.nombreTejido) < 0) { this.nombreTejido = ''; }
      if (this.coloresTejido.indexOf(this.colorTejido) < 0) { this.colorTejido = ''; }
      this.autoElegirTejido();
   }
   etiquetaTipo(t: any): string { return t.tipo || 'Sin tipo'; }
   get tiposTejido(): string[] { return this.distintos(this.tejidosDisponibles.map(t => this.etiquetaTipo(t))); }
   get nombresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido).map(t => t.nombre));
   }
   get coloresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido).map(t => t.color));
   }
   /* Filas del maestro del tejido + color elegidos: una por criterio (ancho del rollo) */
   private get filasTejido(): any[] {
      return this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido && t.color === this.colorTejido);
   }
   /* La fila que se usa: el menor criterio que cubra el ancho de la cortina */
   get tejidoFila(): any {
      if (!(this.ancho > 0)) { return null; }
      const validas = this.filasTejido.filter(t => t.criterio > 0 && t.criterio >= this.ancho).sort((a, b) => a.criterio - b.criterio);
      return validas.length ? validas[0] : null;
   }
   /* Ancho máximo del tejido + color elegidos: el mayor de sus criterios */
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
      if (!this.junquillo) { return 'Seleccione el tipo de junquillo'; }
      if (!(this.ancho > 0) || !(this.alto > 0)) { return 'Indique el ancho y el alto'; }
      if (this.esJR && !(this.ancho2 > 0)) { return 'Indique el ancho exterior (junquillo Redondeado / Biselado)'; }
      const errorMedida = errorPasoMedidas(this.esJR ? { 'Ancho interior': this.ancho, 'Ancho exterior': this.ancho2, 'Alto': this.alto }
                                                     : { 'Ancho interior': this.ancho, 'Alto': this.alto });
      if (errorMedida) { return errorMedida; }
      if (this.avisoBiselado) { return this.avisoBiselado; }
      if (!(this.cantidad > 0)) { return 'Indique la cantidad'; }
      if (this.hayPerfil) {
         if (this.modoPerfil === 'color' && !this.colorPerfil) { return 'Seleccione el color de la perfilería'; }
         if (this.modoPerfil === 'ral' && !this.colorRal) { return 'Seleccione el color RAL de la perfilería'; }
      }
      if (this.coloresCadena.length > 0 && !this.colorCadena) { return 'Seleccione el color de la cadena'; }
      if (this.alturaCadena !== null && this.alturaCadena !== undefined && String(this.alturaCadena) !== '' && !(this.alturaCadena > 0)) {
         return 'La altura de la cadena tiene que ser mayor que 0';
      }
      if (!this.posicion) { return 'Seleccione la posición del mando'; }
      if (this.coloresTapa.length > 0 && !this.colorTapa) { return 'Seleccione el color de las tapas'; }
      if (!this.tipoTejido || !this.nombreTejido || !this.colorTejido) { return 'Seleccione el tejido y su color'; }
      if (!this.anchoMaximo) { return 'Este tejido no tiene criterio (ancho del rollo): complételo en el Maestro de tejidos'; }
      if (!this.tejidoFila) { return 'El ancho (' + this.ancho + ' cm) supera el máximo de este tejido (' + this.anchoMaximo + ' cm)'; }
      if (this.impresion && !this.impresionTexto.trim()) { return 'Indique el texto de la impresión digital'; }
      return '';
   }

   /* Lo que determina el precio: si cambia algo, el precio calculado deja de valer */
   private get firma(): string {
      const fila = this.tejidoFila;
      return JSON.stringify({ a: this.ancho, a2: this.ancho2, h: this.alto, c: this.cantidad, j: this.junquillo, tj: fila ? fila.id : null,
                              mp: this.modoPerfil, p: this.colorPerfil, r: this.colorRal, cc: this.colorCadena, ct: this.colorTapa, i: this.impresion,
                              t: this.tipoTarifa });
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
      this.acc.miniPrecio(this.Cliente, linea).subscribe(
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
      const p = this.precio;
      t.precios.T4_Cantidad = this.cantidad;
      t.precios.T4_Tejido = p.unitario;
      t.precios.T4_Tejido_C1 = '';
      t.precios.T4_Coeficiente = 1;
      t.precios.T4_PVP = p.total;
      t.precios.T4_PVP_C1 = '';

      this.precio = null;
      this.onAdd.emit(t);
      this.toaster.success('Añadido a la cesta', 'Configurador');
   }

   /* La línea tal como viaja en la cesta y al backend: textos de siempre (como los graba
      sp_acc_mini_pedido_tipo_4_add), la selección nueva (nmini) y la tarifa */
   private construirLinea(): CortinaTipo {
      const fila = this.tejidoFila;
      const id = (v: string) => (v ? parseInt(v, 10) : null);
      const perfil = this.modoPerfil === 'color' ? this.porId(this.coloresPerfil, this.colorPerfil) : null;
      const ral = this.modoPerfil === 'ral' ? this.porId(this.coloresRal, this.colorRal) : null;
      const cadena = this.porId(this.coloresCadena, this.colorCadena);
      const tapa = this.porId(this.coloresTapa, this.colorTapa);
      const altura = this.alturaCadena > 0 ? String(Number(this.alturaCadena)) : '';

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 4;
      t.junquillo = this.junquilloSel ? this.junquilloSel.codigo : '';
      t.ancho = this.ancho;
      t.ancho2 = this.esJR ? this.ancho2 : 0;
      t.alto = this.alto;
      t.cantidad = this.cantidad;

      t.com_acc_tipo_id = 'COM'; t.com_acc_tipo_text = 'COMPAC';
      t.com_acc_marca_id = 'COM'; t.com_acc_marca_text = 'COMPAC';
      t.com_acc_tubo_id = '-1'; t.com_acc_tubo_text = '';
      t.com_acc_modelo_id = cadena ? cadena.codigo : ''; t.com_acc_modelo_text = cadena ? cadena.nombre : '';
      t.com_acc_posicion_id = this.posicion; t.com_acc_posicion_text = this.posicion;
      t.com_sop_tipo_id = 'COM'; t.com_sop_tipo_text = 'COMPAC';
      t.com_sop_color_id = ral ? 'RAL' : (perfil ? perfil.codigo : '');
      t.com_sop_color_text = ral ? ral.nombre : (perfil ? perfil.nombre : '');
      t.com_tap_tipo_id = 'COM'; t.com_tap_tipo_text = 'COMPAC';
      t.com_tap_color_id = tapa ? tapa.codigo : ''; t.com_tap_color_text = tapa ? tapa.nombre : '';
      /* tejido del maestro: ids de siempre a -1 y los textos con su nombre y color */
      t.com_tej_tipo_id = -1; t.com_tej_tipo_text = fila ? fila.nombre : '';
      t.com_tej_color_id = -1; t.com_tej_color_text = fila ? fila.color : '';
      t.com_tej_salida_id = -1; t.com_tej_salida_text = 'NO';
      t.com_cad_altura_id = '-1'; t.com_cad_altura_text = altura;
      t.com_cad_color_id = cadena ? cadena.codigo : ''; t.com_cad_color_text = cadena ? cadena.nombre : '';
      t.com_cad_Altura = altura; t.com_cad_Tipo = '-1';
      t.perfileria = ral ? 'RAL' : (perfil ? perfil.codigo : '');
      t.ral = ral ? ral.nombre : '';
      t.impresion = this.impresion;
      t.impresion_imagen = this.impresion ? this.impresionTexto.trim() : '';

      /* estancia y observaciones: en las columnas de siempre del Solar Mini y en las que lee el alta nueva */
      t.com_estancia_id = this.estancia;
      t.com_estancia_obs = this.observaciones || '';
      t.estancia_id = this.estancia;
      t.estancia_obs = this.observaciones || '';

      /* la selección nueva, que es lo que graba el backend */
      (t as any).nmini = {
         junquillo: id(this.junquillo),
         color_perfil: perfil ? perfil.id : null,
         color_ral: ral ? ral.id : null,
         color_cadena: id(this.colorCadena),
         color_tapa: id(this.colorTapa),
         tejido: fila ? fila.id : null,
         altura_cadena: this.alturaCadena > 0 ? Number(this.alturaCadena) : null,
         posicion: this.posicion
      };
      (t as any).tipo_tarifa = this.tipoTarifa;
      return t;
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.nmini) { return; }
      if (!this.opc) { this.edicionPendiente = item; return; }
      const n = item.nmini;
      const txt = (v: any) => (v === null || v === undefined ? '' : String(v));
      this.junquillo = txt(n.junquillo);
      this.ancho = item.ancho;
      this.ancho2 = item.ancho2 > 0 ? item.ancho2 : null;
      this.alto = item.alto;
      this.cantidad = item.cantidad;
      this.modoPerfil = n.color_ral ? 'ral' : 'color';
      this.colorPerfil = txt(n.color_perfil);
      this.colorRal = txt(n.color_ral);
      this.colorCadena = txt(n.color_cadena);
      this.colorTapa = txt(n.color_tapa);
      this.alturaCadena = n.altura_cadena > 0 ? Number(n.altura_cadena) : null;
      this.posicion = txt(n.posicion);
      this.estancia = item.estancia_id ? String(item.estancia_id) : '-1';
      this.observaciones = item.estancia_obs || '';
      this.impresion = !!item.impresion;
      this.impresionTexto = item.impresion_imagen || '';
      /* tejido del maestro de la línea: tipo, nombre y color; el criterio sale del ancho */
      const tejido = this.tejidosDisponibles.find(x => x.id === n.tejido);
      this.tipoTejido = tejido ? this.etiquetaTipo(tejido) : '';
      this.nombreTejido = tejido ? tejido.nombre : '';
      this.colorTejido = tejido ? tejido.color : '';
      if (!tejido) { this.toaster.warning('El tejido de esta línea ya no está disponible: elija otro', 'Configurador'); }
      /* opciones que ya no existen o están ocultas: se avisa y hay que elegir otra */
      const falta = [[this.junquillos, this.junquillo], [this.coloresPerfil, this.colorPerfil], [this.coloresRal, this.colorRal],
                     [this.coloresCadena, this.colorCadena], [this.coloresTapa, this.colorTapa]]
         .some(([lista, valor]: any[]) => valor && !this.porId(lista, valor));
      if (falta) { this.toaster.warning('Alguna opción de esta línea ya no está disponible: revísela', 'Configurador'); }
      /* la tarifa elegida; el precio hay que volver a calcularlo */
      this.tipoTarifa = item.tipo_tarifa || '';
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
   }
}
