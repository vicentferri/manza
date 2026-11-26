import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CortinaTipo } from '../config/CortinaTipo';
import { SMAPIService } from '../config/smapi.service';
import { AccConfiguradorService } from './acc-configurador.service';
import { errorPasoMedidas, PASO_MEDIDA } from '../config/medidas';

/*
 * Enrollable con el accionamiento del modelo nuevo (SOL_ACC_*).
 * Solo lo pinta config.component para clientes con el interruptor activo (SOL_ACC_CLIENTE);
 * Leroy sigue con manza-enrollable. Nada de este componente se usa en el configurador de siempre.
 *
 * Pasos: medidas → accionamiento
 * (accionamiento → sistema → cadena: tipo, altura o longitud, color / motor: tipo, modelo,
 * mando, cargador, batería) → tejido (los del maestro que ofrece el sistema elegido, Productos → Tejidos;
 * el criterio lo elige el configurador según el ancho) → soporte, tapa y contrapeso (los del sistema), cada uno con
 * su color. Además: posición (Derecha/Izquierda), estancia y observaciones, impresión digital (sí/no
 * y un texto; con sí, solo tejidos aptos) y longitud tecleada en la cadena a medida.
 * Cajón y guía llegarán cuando estén en el modelo nuevo.
 * Precio: el usuario elige la tarifa T1 (por grupo de tejido) o T2 (por tejido) y pulsa "Calcular
 * precio" (backend /acc_cfg/precio: mapa de la tarifa del generador + impresión + suplementos). Solo
 * se puede añadir a la cesta con el precio calculado para la configuración actual; al grabar, el
 * servidor lo vuelve a calcular.
 *
 * Cliente con rejilla propia (Leroy, sql/sqlLeroy 09-16; `opc.rejilla`): precio con su tarifa de siempre, sin T1/T2 ni tipo de
 * tejido; C1 en pantalla y en la cesta; códigos 48; Smart Home; fotos del tejido y del contrapeso; el ancho del rollo no bloquea
 * (mandan los límites de su perfil y su rejilla) y las preselecciones de su pantalla de siempre.
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

   /* las medidas van en pasos de 0,5 cm, como el configurador de siempre */
   readonly pasoMedida = PASO_MEDIDA;

   /* opciones del modelo nuevo (GET /acc_cfg/opciones) */
   opc: any = null;
   cargando = false;

   /* medidas */
   ancho: number = null;
   alto: number = null;
   cantidad = 1;

   /* estancia y observaciones (catálogo de estancias de siempre, del cliente) */
   estancias: any[] = [];
   estancia = '-1';
   observaciones = '';

   /* posición del accionamiento: ids del catálogo de siempre (SOL_ARTICULOS_POSICIONMANDO) */
   readonly posiciones = [{ id: 1, nombre: 'Derecha' }, { id: 2, nombre: 'Izquierda' }];
   posicion = '';

   /* impresión digital: sí/no y un texto. Con sí, solo se ofrecen los tejidos aptos */
   impresion = false;
   impresionTexto = '';

   /* cadena a medida: longitud que teclea el cliente (cm) */
   longitud: number = null;

   /* tejido: los del maestro de tejidos que ofrece el sistema elegido (Productos -> Tejidos, opc.tejidos, script 36).
      Se elige tipo -> tejido -> color; el criterio (ancho del rollo) lo elige el configurador: el menor
      que cubra el ancho de la cortina */
   readonly salidas = [{ id: 1, text: 'Cascada' }, { id: 2, text: 'Pegado Pared' }];
   tipoTejido = '';
   nombreTejido = '';
   colorTejido = '';
   salida = '1';

   /* selección del modelo nuevo (ids como texto, por los <select>) */
   sel: any = {};

   /* línea que se está editando desde la cesta */
   private editando: CortinaTipo = null;

   /* nombres de las fotos de contrapeso (campo, no getter: es un @Input del componente de la foto) */
   fotosContrapeso: { id: number, text: string }[] = [];

   /* precio: tarifa elegida, resultado del cálculo y la configuración para la que se calculó */
   tipoTarifa = '';
   precio: any = null;
   precioError = '';
   precioAviso = '';
   calculando = false;
   private precioFirma = '';

   constructor(private service: SMAPIService, private acc: AccConfiguradorService, private toaster: ToastrService) { }

   ngOnInit(): void {
      this.limpiarSeleccion();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if ((changes['Cliente'] || changes['SubCliente']) && parseInt(this.Cliente, 10) > 0) {
         this.cargarOpciones();
         this.cargarEstancias();
      }
   }

   // ─── CARGA ─────────────────────────────────────────────────────────────────────

   private cargarOpciones(): void {
      this.cargando = true;
      this.acc.opciones(this.Cliente).subscribe(
         data => {
            this.opc = data;
            this.cargando = false;
            this.fotosContrapeso = (data.contrapesos || []).filter(c => c.imagen).map(c => ({ id: c.imagen, text: c.nombre }));
         },
         () => { this.opc = null; this.cargando = false; this.toaster.error('No se pudieron cargar las opciones de accionamiento', 'Configurador'); }
      );
   }

   private cargarEstancias(): void {
      this.service.getEstancias(parseInt(this.Cliente, 10)).subscribe(
         data => { this.estancias = data || []; },
         error => this.toaster.error(error.message)
      );
   }

   /* Con impresión digital solo salen los tejidos del maestro que la admiten: si el elegido no, se vacía */
   cambiarImpresion(): void {
      if (!this.impresion) { this.impresionTexto = ''; }
      this.revisarTejido();
   }

   /* El tejido elegido se mantiene mientras siga disponible (sistema e impresión); si no, se vacía */
   private revisarTejido(): void {
      if (this.tiposTejido.indexOf(this.tipoTejido) < 0) { this.tipoTejido = ''; }
      if (this.nombresTejido.indexOf(this.nombreTejido) < 0) { this.nombreTejido = ''; }
      if (this.coloresTejido.indexOf(this.colorTejido) < 0) { this.colorTejido = ''; }
      this.autoElegirTejido();
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

   private distintos(valores: string[]): string[] {
      return valores.filter((v, i) => valores.indexOf(v) === i).sort();
   }

   /* Tejidos del maestro que se pueden ofrecer: los del sistema elegido (script 36) y, con impresión
      digital, solo los aptos. Sin sistema, ninguno */
   get tejidosDisponibles(): any[] {
      const sistema = parseInt(this.sel.sistema, 10);
      const todos = this.opc && this.opc.tejidos && sistema ? this.opc.tejidos.filter(t => (t.sistemas || []).indexOf(sistema) >= 0) : [];
      return this.impresion ? todos.filter(t => this.imprimible(t, sistema)) : todos;
   }
   /* Con rejilla, la impresión depende además del sistema (tiene que haber tarifa «con impresión»: sistemas_impresion) */
   private imprimible(t: any, sistema: number): boolean {
      return t.sistemas_impresion ? t.sistemas_impresion.indexOf(sistema) >= 0 : !!t.impresion_digital;
   }
   /* La impresión digital solo se ofrece si el sistema elegido tiene algún tejido apto (sqlImpresion) */
   get hayImpresion(): boolean {
      const sistema = parseInt(this.sel.sistema, 10);
      return !!(this.opc && this.opc.tejidos && sistema
         && this.opc.tejidos.some(t => (t.sistemas || []).indexOf(sistema) >= 0 && this.imprimible(t, sistema)));
   }
   /* Cliente con rejilla propia (Leroy) */
   get conRejilla(): boolean { return !!(this.opc && this.opc.rejilla); }
   /* Con rejilla, todos los tejidos van en un único "tipo" que se elige solo (el desplegable no se ve) */
   etiquetaTipo(t: any): string { return this.conRejilla ? 'Tejidos' : (t.tipo || 'Sin tipo'); }
   get tiposTejido(): string[] { return this.distintos(this.tejidosDisponibles.map(t => this.etiquetaTipo(t))); }
   get nombresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido).map(t => t.nombre));
   }
   get coloresTejido(): string[] {
      return this.distintos(this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido).map(t => t.color));
   }
   /* Filas del maestro del tejido + color elegidos: una por criterio (ancho del rollo) */
   /* Fila del tejido para enseñar la Ref. del cliente y los límites del perfil (Fase 2): la que se usa o, si el ancho
      aún no la decide, la primera del color elegido */
   get filaPerfil(): any {
      return this.tejidoFila || this.filasTejido[0] || null;
   }

   private get filasTejido(): any[] {
      return this.tejidosDisponibles.filter(t => this.etiquetaTipo(t) === this.tipoTejido && t.nombre === this.nombreTejido && t.color === this.colorTejido);
   }
   /* La fila que se usa: el menor criterio que cubra el ancho de la cortina */
   get tejidoFila(): any {
      /* con rejilla no manda el ancho del rollo: los límites son los del perfil y la rejilla */
      if (this.conRejilla) { return this.filasTejido[0] || null; }
      if (!(this.ancho > 0)) { return null; }
      const validas = this.filasTejido.filter(t => t.criterio > 0 && t.criterio >= this.ancho).sort((a, b) => a.criterio - b.criterio);
      return validas.length ? validas[0] : null;
   }

   // ─── CASCADA DEL ACCIONAMIENTO ──────────────────────────────────────────────────

   private limpiarSeleccion(): void {
      this.sel = { accionamiento: '', sistema: '', tipo_cadena: '', altura: '',
                   color_cadena: '', tipo_motor: '', modelo_motor: '', mando: '', cargador: '', bateria: '', smart_home: '',
                   soporte: '', soporte_color: '', tapa: '', tapa_color: '', contrapeso: '', contrapeso_color: '' };
   }

   /* Al cambiar un paso se vacían los que dependen de él */
   cambiar(paso: string): void {
      const orden = ['accionamiento', 'sistema', 'tipo_cadena', 'altura', 'tipo_motor', 'modelo_motor', 'soporte', 'tapa', 'contrapeso'];
      const piezasSistema = ['soporte', 'soporte_color', 'tapa', 'tapa_color', 'contrapeso', 'contrapeso_color'];
      const dependientes: { [p: string]: string[] } = {
         accionamiento: ['sistema', 'tipo_cadena', 'altura', 'color_cadena', 'tipo_motor', 'modelo_motor', 'mando', 'cargador', 'bateria', 'smart_home'].concat(piezasSistema),
         sistema: ['tipo_motor', 'modelo_motor', 'mando', 'cargador', 'bateria', 'smart_home'].concat(piezasSistema),
         soporte: ['soporte_color'],
         tapa: ['tapa_color'],
         contrapeso: ['contrapeso_color'],
         tipo_cadena: ['altura', 'color_cadena'],
         /* en Aro cadena, cada altura tiene sus colores (script 34) */
         altura: ['color_cadena'],
         tipo_motor: ['modelo_motor', 'mando', 'cargador', 'bateria', 'smart_home'],
         modelo_motor: ['mando', 'cargador', 'bateria', 'smart_home']
      };
      if (orden.indexOf(paso) >= 0) { (dependientes[paso] || []).forEach(p => this.sel[p] = ''); }
      /* Si un paso solo tiene una opción, se elige sola */
      this.autoElegir();
      if (this.conRejilla) { this.comoSiempre(paso); }
      /* los tejidos dependen del sistema: se revisan después, porque el sistema puede haberse elegido solo (con rejilla el
         tipo de tejido no se ve y, si no se rellenara aquí, no se podría elegir tejido) */
      if (paso === 'accionamiento' || paso === 'sistema') { this.revisarTejido(); }
   }

   /* Con rejilla, lo que hacía solo su pantalla de siempre: posición Derecha; la primera pieza y color de soporte, tapa y
      contrapeso; los colores de soporte y tapa siguen al de la cadena (y el de la tapa al del soporte); cadena a medida de 150 */
   private comoSiempre(paso: string): void {
      if (!this.posicion) { this.posicion = String(this.posiciones[0].id); }
      const primera = (lista: any[], campo: string) => { if (!this.sel[campo] && lista.length) { this.sel[campo] = String(lista[0].id); } };
      primera(this.soportes, 'soporte'); primera(this.coloresSoporte, 'soporte_color');
      primera(this.tapas, 'tapa'); primera(this.coloresTapa, 'tapa_color');
      primera(this.contrapesos, 'contrapeso'); primera(this.coloresContrapeso, 'contrapeso_color');
      const igualar = (lista: any[], campo: string, color: any) => {
         const x = color ? lista.find(c => c.codigo === color.codigo) : null;
         if (x) { this.sel[campo] = String(x.id); }
      };
      if (paso === 'color_cadena') {
         const color = this.porId(this.coloresCadena, this.sel.color_cadena);
         igualar(this.coloresSoporte, 'soporte_color', color);
         igualar(this.coloresTapa, 'tapa_color', color);
      }
      if (paso === 'soporte_color') { igualar(this.coloresTapa, 'tapa_color', this.porId(this.coloresSoporte, this.sel.soporte_color)); }
      if (paso === 'tipo_cadena' && this.esMedida && !(this.longitud > 0)) { this.longitud = 150; }
   }

   private autoElegir(): void {
      const unica = (lista: any[], campo: string) => {
         if (!this.sel[campo] && lista.length === 1) { this.sel[campo] = String(lista[0].id); return true; }
         return false;
      };
      let cambio = true;
      while (cambio) {
         cambio = unica(this.accionamientos, 'accionamiento') || unica(this.sistemas, 'sistema') ||
                  (this.esCadena && (unica(this.tiposCadena, 'tipo_cadena') || unica(this.alturas, 'altura'))) ||
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
   get alturas(): any[] { return this.esAro && this.opc ? this.opc.alturas : []; }
   get alturaSel(): any { return this.porId(this.alturas, this.sel.altura); }
   /* Aro cadena: los colores de la altura elegida (script 34); los demás tipos: los del tipo de cadena */
   get coloresCadena(): any[] {
      const origen = this.esAro ? this.alturaSel : this.tipoCadenaSel;
      return origen ? this.opc.colores.filter(c => (origen.colores || []).indexOf(c.id) >= 0) : [];
   }

   /* Tipos de motor del accionamiento MOTOR con algún modelo asignado al sistema elegido */
   get tiposMotor(): any[] {
      const a = this.accionamientoSel;
      const sistema = parseInt(this.sel.sistema, 10);
      return a && this.esMotor && sistema ? this.opc.tiposMotor.filter(t => t.accionamiento_id === a.id && t.sistemas.indexOf(sistema) >= 0) : [];
   }
   get tipoMotorSel(): any { return this.porId(this.tiposMotor, this.sel.tipo_motor); }
   /* Solo los modelos del tipo asignados al sistema elegido */
   get modelos(): any[] {
      const sistema = parseInt(this.sel.sistema, 10);
      return this.tipoMotorSel ? this.tipoMotorSel.modelos.filter(m => m.sistemas.indexOf(sistema) >= 0) : [];
   }
   get modeloSel(): any { return this.porId(this.modelos, this.sel.modelo_motor); }
   get mandos(): any[] { return this.modeloSel ? this.opc.mandos.filter(x => this.modeloSel.mandos.indexOf(x.id) >= 0) : []; }
   get cargadores(): any[] { return this.modeloSel ? this.opc.cargadores.filter(x => this.modeloSel.cargadores.indexOf(x.id) >= 0) : []; }
   get baterias(): any[] { return this.modeloSel ? this.opc.baterias.filter(x => this.modeloSel.baterias.indexOf(x.id) >= 0) : []; }
   /* Smart Home (sqlLeroy/09): solo con los tipos de motor que lo admiten (hoy, batería 25 y 35) y con el modelo elegido */
   get smartHomes(): any[] {
      const t = this.tipoMotorSel;
      return t && this.modeloSel ? ((this.opc && this.opc.smartHome) || []).filter(x => (t.smart_home || []).indexOf(x.id) >= 0) : [];
   }
   /* Aviso del cargador con batería 25, como en su pantalla de siempre */
   get verAvisoCargador(): boolean { return this.conRejilla && !!this.tipoMotorSel && this.tipoMotorSel.codigo === 'BATERIA_25'; }

   /* Códigos del cliente (CFG_CLIENTE_CODIGO): los 48 de Leroy. El mando va por motor («motor|mando») o por mando */
   private codigoCliente(lista: string, clave: string): string {
      const c = this.opc && this.opc.codigos && this.opc.codigos[lista];
      return (c && c[clave]) || '';
   }
   get codigoModelo(): string { return this.modeloSel ? this.codigoCliente('modelos_motor', this.sel.modelo_motor) : ''; }
   get codigoMando(): string {
      if (!this.sel.mando || this.sel.mando === 'sin') { return ''; }
      return this.codigoCliente('mandos', this.sel.modelo_motor + '|' + this.sel.mando) || this.codigoCliente('mandos', this.sel.mando);
   }
   get codigoCargador(): string { return this.sel.cargador ? this.codigoCliente('cargadores', this.sel.cargador) : ''; }

   /* Fotos (parámetros imagenes_tejido / imagenes_contrapeso del perfil): los ids de su configurador de siempre */
   get fotoTejido(): any { const f = this.filaPerfil; return f && f.antiguo ? f.antiguo : null; }
   get fotoContrapeso(): number { const c = this.contrapesoSel; return c && c.imagen ? c.imagen : null; }

   /* C1 de Leroy ('C1 0001234', céntimos) de un importe ya calculado por el servidor */
   c1Texto(valor: any): string {
      if (valor === null || valor === undefined || valor === '') { return ''; }
      return 'C1 ' + ('0000000' + Math.round(Number(valor) * 100)).slice(-7);
   }

   /* Soporte, tapa y contrapeso: los marcados para el sistema elegido. Cada color, de los que admite su pieza */
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
   get contrapesos(): any[] { return this.deSistema(this.opc ? this.opc.contrapesos : []); }
   get contrapesoSel(): any { return this.porId(this.contrapesos, this.sel.contrapeso); }
   get coloresContrapeso(): any[] { return this.coloresDe(this.contrapesoSel, this.opc ? this.opc.coloresContrapeso : []); }

   /* Ancho máximo del tejido + color elegidos: el mayor de sus criterios */
   get anchoMaximo(): number {
      /* con rejilla, el ancho máximo del color de su pantalla de siempre: solo informa, no bloquea */
      if (this.conRejilla) {
         const f = this.filasTejido[0];
         return f && f.antiguo ? f.antiguo.ancho_max : null;
      }
      const criterios = this.filasTejido.map(t => t.criterio).filter(c => c > 0);
      return criterios.length ? Math.max(...criterios) : null;
   }

   etiquetaAltura(a: any): string {
      return a.nombre || (Number(a.valor) + ' cm');
   }

   // ─── AÑADIR A LA CESTA ─────────────────────────────────────────────────────────

   private validar(): string {
      if (!(this.ancho > 0) || !(this.alto > 0)) { return 'Indique el ancho y el alto'; }
      const errorMedida = errorPasoMedidas({ 'Ancho': this.ancho, 'Alto': this.alto });
      if (errorMedida) { return errorMedida; }
      if (!(this.cantidad > 0)) { return 'Indique la cantidad'; }
      if (!this.sel.accionamiento) { return 'Seleccione el accionamiento'; }
      if (!this.sel.sistema) { return 'Seleccione el sistema'; }
      if (!this.tipoTejido || !this.nombreTejido || !this.colorTejido) { return 'Seleccione el tejido y su color'; }
      if (!this.conRejilla) {
         if (!this.anchoMaximo) { return 'Este tejido no tiene criterio (ancho del rollo): complételo en el Maestro de tejidos'; }
         if (!this.tejidoFila) { return 'El ancho (' + this.ancho + ' cm) supera el máximo de este tejido (' + this.anchoMaximo + ' cm)'; }
      }
      if (!this.tejidoFila) { return 'Seleccione el tejido y su color'; }
      if (this.impresion && !this.impresionTexto.trim()) {
         return this.conRejilla ? 'Indique la referencia de la imagen' : 'Indique el texto de la impresión digital';
      }
      if (!this.posicion) { return 'Seleccione la posición del accionamiento'; }
      if (this.esCadena) {
         if (!this.sel.tipo_cadena) { return 'Seleccione el tipo de cadena'; }
         if (this.esAro && !this.sel.altura) { return 'Seleccione la altura'; }
         if (this.esMedida && !(this.longitud > 0)) { return 'Indique la longitud de la cadena'; }
         if (this.coloresCadena.length > 0 && !this.sel.color_cadena) { return 'Seleccione el color de la cadena'; }
      }
      if (this.esMotor && (!this.sel.tipo_motor || !this.sel.modelo_motor)) { return 'Seleccione el tipo y el modelo de motor'; }
      /* como en su pantalla de siempre, el mando hay que elegirlo (aunque sea «Sin mando») */
      if (this.conRejilla && this.esMotor && this.mandos.length > 0 && !this.sel.mando) { return 'Seleccione el mando (o «Sin mando»)'; }
      /* cada pieza es obligatoria si hay alguna que elegir, y su color si admite alguno */
      if (this.soportes.length > 0 && !this.sel.soporte) { return 'Seleccione el soporte'; }
      if (this.coloresSoporte.length > 0 && !this.sel.soporte_color) { return 'Seleccione el color del soporte'; }
      if (this.tapas.length > 0 && !this.sel.tapa) { return 'Seleccione la tapa'; }
      if (this.coloresTapa.length > 0 && !this.sel.tapa_color) { return 'Seleccione el color de la tapa'; }
      if (this.contrapesos.length > 0 && !this.sel.contrapeso) { return 'Seleccione el contrapeso'; }
      if (this.coloresContrapeso.length > 0 && !this.sel.contrapeso_color) { return 'Seleccione el color del contrapeso'; }
      return '';
   }

   /* Lo que determina el precio: si cambia algo, el precio calculado deja de valer */
   private get firma(): string {
      const fila = this.tejidoFila;
      return JSON.stringify({ a: this.ancho, h: this.alto, c: this.cantidad, tj: fila ? fila.id : null, i: this.impresion,
                              l: this.longitud, s: this.sel, t: this.tipoTarifa });
   }

   get precioVigente(): boolean {
      return !!this.precio && this.precioFirma === this.firma;
   }

   CalcularPrecio(): void {
      if (!this.conRejilla && !this.tipoTarifa) { this.toaster.error('Elija la tarifa: T1 o T2', 'ATENCIÓN'); return; }
      const error = this.validar();
      if (error) { this.toaster.error(error, 'ATENCIÓN'); return; }
      const linea = this.construirLinea();
      const firma = this.firma;
      this.calculando = true;
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
      this.acc.precio(this.Cliente, linea).subscribe(
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
      const p = this.precio, c = this.cantidad;
      t.precios.T1_Cantidad = c;
      t.precios.T1_Tejido = +(p.columnas.tejido * c).toFixed(2);
      t.precios.T1_Inc_Mando = +(p.columnas.mando * c).toFixed(2);
      t.precios.T1_Inc_Cargador = +(p.columnas.cargador * c).toFixed(2);
      t.precios.T1_Inc_Contrapeso = +(p.columnas.contrapeso * c).toFixed(2);
      t.precios.T1_Inc_CadenaMetalica = +(p.columnas.cadena * c).toFixed(2);
      t.precios.T1_Inc_Impresion = 0;
      t.precios.T1_PVP = p.total;
      /* C1 (clientes con coeficiente_c1, Leroy) como lo graba el alta: por la cantidad; vacío en las columnas a 0 */
      const col = p.columnas, cc = p.c1_columnas;
      const c1De = (clave: string) => (cc && col[clave] ? this.c1Texto(cc[clave] * c) : '');
      t.precios.T1_Tejido_C1 = cc ? this.c1Texto(cc.tejido * c) : '';
      t.precios.T1_Inc_Mando_C1 = c1De('mando');
      t.precios.T1_Inc_Cargador_C1 = c1De('cargador');
      t.precios.T1_Inc_Contrapeso_C1 = c1De('contrapeso');
      t.precios.T1_Inc_CadenaMetalica_C1 = c1De('cadena');
      t.precios.T1_Inc_Impresion_C1 = '';
      t.precios.T1_Inc_SmartHome = +((col.smart_home || 0) * c).toFixed(2);
      t.precios.T1_Inc_SmartHome_C1 = c1De('smart_home');
      t.precios.T1_PVP_C1 = p.c1 || '';
      /* códigos 48 que enseña la cesta (el alta los vuelve a poner) */
      t.precios.T1_Inc_Modelo_48 = this.codigoModelo;
      t.precios.T1_Inc_Mando_48 = this.codigoMando;
      t.precios.T1_Inc_Cargador_48 = this.codigoCargador;
      t.precios.T1_Inc_SmartHome_48 = this.sel.smart_home ? this.codigoModelo : '';

      this.editando = null;
      this.precio = null;
      this.onAdd.emit(t);
      this.toaster.success('Añadido a la cesta', 'Configurador');
   }

   /* La línea tal como viaja en la cesta y al backend (textos de siempre, selección nueva y tarifa) */
   private construirLinea(): CortinaTipo {
      const nombre = (lista: any[], id: string) => { const x = this.porId(lista, id); return x ? x.nombre : null; };
      const unir = (...partes: string[]) => partes.filter(p => !!p).join(' · ');
      const id = (v: string) => (v && v !== 'sin' ? parseInt(v, 10) : null);

      const t = new CortinaTipo(this.codeCentro);
      t.TipoCortina = 1;
      t.SubTipoCortina = 1;
      t.ancho = this.ancho;
      t.alto = this.alto;
      t.cantidad = this.cantidad;

      /* posición, estancia, observaciones e impresión digital (columnas de siempre) */
      t.acc_posicion_id = parseInt(this.posicion, 10);
      t.acc_posicion_text = (this.posiciones.find(p => String(p.id) === this.posicion) || { nombre: '' }).nombre;
      t.estancia_id = this.estancia;
      t.estancia_obs = this.observaciones || '';
      t.impresion = this.impresion;
      t.impresion_imagen = this.impresion ? this.impresionTexto.trim() : '';

      /* tejido del maestro: ids de siempre a -1 y los textos de siempre con su nombre y color
         (como los escribe sp_acc_pedido_tipo_1_add, script 30) */
      const fila = this.tejidoFila;
      t.tej_tipo_id = -1;
      t.tej_tipo_text = fila ? fila.nombre : null;
      t.tej_color_id = -1;
      t.tej_color_text = fila ? fila.color : null;
      t.tej_salida_id = parseInt(this.salida, 10);
      t.tej_salida_text = nombre(this.salidas.map(x => ({ id: x.id, nombre: x.text })), this.salida);
      /* código del cliente para el tejido (cesta) */
      t.codigoprov = (this.filaPerfil && this.filaPerfil.ref) || '';

      /* accionamiento: ids antiguos a -1 y textos como los escribe sp_acc_pedido_tipo_1_add */
      t.acc_tipo_id = -1; t.acc_marca_id = -1; t.acc_modelo_id = -1; t.mando_id = -1;
      t.acc_tipo_text = this.accionamientoSel.nombre;
      t.acc_marca_text = unir(nombre(this.sistemas, this.sel.sistema), this.esMotor ? nombre(this.tiposMotor, this.sel.tipo_motor) : null);
      t.cad_Tipo = this.esCadena ? 1 : -1;
      /* como lo graba el alta para los clientes con rejilla (rótulo de la cesta): a medida 0, aro (continua) 1. La metálica
         es solo un color: no cambia el tipo */
      if (this.esCadena && this.conRejilla && this.esMedida) { t.cad_Tipo = 0; }
      if (this.esCadena) {
         const altura = this.alturaSel;
         /* como el SP: "Aro cadena · 100 CM" o "Cadena a medida" (la longitud va en cad_Altura) */
         t.acc_modelo_text = unir(nombre(this.tiposCadena, this.sel.tipo_cadena), altura ? this.etiquetaAltura(altura) : null);
         t.cad_Altura = altura ? this.etiquetaAltura(altura) : (this.esMedida ? Number(this.longitud) + ' cm' : null);
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
         tipo_cadena: id(this.sel.tipo_cadena), altura: id(this.sel.altura),
         color_cadena: id(this.sel.color_cadena),
         tipo_motor: id(this.sel.tipo_motor), modelo_motor: id(this.sel.modelo_motor),
         mando: id(this.sel.mando), cargador: id(this.sel.cargador), bateria: id(this.sel.bateria),
         smart_home: id(this.sel.smart_home),
         soporte: id(this.sel.soporte), soporte_color: id(this.sel.soporte_color),
         tapa: id(this.sel.tapa), tapa_color: id(this.sel.tapa_color),
         contrapeso: id(this.sel.contrapeso), contrapeso_color: id(this.sel.contrapeso_color),
         cadena_longitud: this.esCadena && this.esMedida ? Number(this.longitud) : null,
         tejido: fila ? fila.id : null
      };
      (t as any).tipo_tarifa = this.conRejilla ? null : this.tipoTarifa;
      return t;
   }

   // ─── EDICIÓN DESDE LA CESTA ────────────────────────────────────────────────────

   cargarEdicion(item: any): void {
      if (!item || !item.nacc) { return; }
      this.editando = item;
      this.ancho = item.ancho;
      this.alto = item.alto;
      this.cantidad = item.cantidad;
      this.posicion = item.acc_posicion_id > 0 ? String(item.acc_posicion_id) : '';
      this.estancia = item.estancia_id ? String(item.estancia_id) : '-1';
      this.observaciones = item.estancia_obs || '';
      this.longitud = item.nacc.cadena_longitud || null;
      this.impresion = !!item.impresion;
      this.impresionTexto = item.impresion_imagen || '';
      /* tejido del maestro de la línea (nacc.tejido): tipo, nombre y color; el criterio sale del ancho */
      const tejido = (this.opc && this.opc.tejidos ? this.opc.tejidos : [])
         .find(x => x.id === item.nacc.tejido && (x.sistemas || []).indexOf(item.nacc.sistema) >= 0);
      this.tipoTejido = tejido ? this.etiquetaTipo(tejido) : '';
      this.nombreTejido = tejido ? tejido.nombre : '';
      this.colorTejido = tejido ? tejido.color : '';
      if (!tejido) { this.toaster.warning('El tejido de esta línea ya no está disponible: elija otro', 'Configurador'); }
      this.salida = String(item.tej_salida_id || 1);
      this.limpiarSeleccion();
      Object.keys(this.sel).forEach(k => { const v = item.nacc[k]; this.sel[k] = v === null || v === undefined ? '' : String(v); });
      /* de un presupuesto recargado, el Smart Home llega como SÍ (true) sin id */
      if (item.nacc.smart_home === true) { this.sel.smart_home = this.smartHomes.length ? String(this.smartHomes[0].id) : ''; }
      if (this.conRejilla && this.esMotor && !item.nacc.mando && this.mandos.length > 0) { this.sel.mando = 'sin'; }
      /* la tarifa elegida; el precio hay que volver a calcularlo */
      this.tipoTarifa = item.tipo_tarifa || '';
      this.precio = null;
      this.precioError = '';
      this.precioAviso = '';
   }
}
