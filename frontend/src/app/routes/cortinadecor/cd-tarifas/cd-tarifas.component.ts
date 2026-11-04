import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HaruService } from '../../../services/haru.service';

/*
 * Panel Cortinadecor > Tarifas (permiso cdeco_tarifas).
 *   Tablas      : para cada Referencia (como llega en el JSON) y color, qué tabla de la tarifa se consulta.
 *                 Reglas en SOL_CD_TARIFAS_REGLAS; sin regla, asignación automática (tejido del diccionario + ASIA).
 *   Incrementos : condición sobre un atributo de la línea -> artículo (o importe) x cantidad, y lista de artículos.
 * Backend: controllers/sm/cortinadecor_tarifas.js
 */
@Component({
  selector: 'app-cd-tarifas',
  templateUrl: './cd-tarifas.component.html',
  styleUrls: ['./cd-tarifas.component.css'],
  providers: [HaruService]
})
export class CdTarifasComponent implements OnInit {

  @ViewChild('modalRegla', { static: false }) modalRegla: ModalDirective;
  @ViewChild('modalTabla', { static: false }) modalTabla: ModalDirective;
  @ViewChild('modalIncremento', { static: false }) modalIncremento: ModalDirective;
  @ViewChild('modalArticulo', { static: false }) modalArticulo: ModalDirective;

  pestana: 'tablas' | 'incrementos' = 'tablas';

  /* ---- Tablas por referencia ---- */
  desde = '';
  referencias: any[] = [];
  cargandoReferencias = false;
  filtro = { texto: '', soloSinTabla: false };
  seleccionada: any = null;          // resumen de la referencia elegida
  detalle: any = null;               // { referencia (con colores), reglas }
  cargandoDetalle = false;

  tablas: any[] = [];                // tablas vigentes { id, hoja, clave, titulo }
  hojas: string[] = [];
  claves: string[] = [];

  regla: any = {};
  guardandoRegla = false;
  coloresReferencia: string[] = [];

  tablaVer = { id: 0, ancho: null, alto: null };

  readonly modosColor = [
    { id: 'TODOS', texto: 'Cualquier color' },
    { id: 'IGUAL', texto: 'Color igual a' },
    { id: 'CONTIENE', texto: 'Color que contiene' }
  ];

  /* ---- Incrementos ---- */
  incrementos: any[] = [];
  articulos: any[] = [];
  atributos: any[] = [];
  incremento: any = {};
  articulo: any = {};
  articuloNuevo = false;
  guardando = false;

  readonly productos = [
    { id: null, texto: 'Todas las cortinas' },
    { id: 1, texto: 'Enrollables' },
    { id: 2, texto: 'Paneles japoneses' },
    { id: 3, texto: 'Verticales' }
  ];

  constructor(private service: HaruService, private toaster: ToastrService) { }

  ngOnInit() {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    this.desde = d.toISOString().substring(0, 10);
    this.cargarTablas();
    this.cargarReferencias();
  }

  private mensaje(e: any, porDefecto: string): string {
    return (e && e.error && e.error.message) || porDefecto;
  }

  cambiarPestana(p: 'tablas' | 'incrementos') {
    this.pestana = p;
    if (p === 'incrementos' && !this.incrementos.length) {
      this.cargarIncrementos();
      this.cargarAtributos();
    }
  }

  /* ======================= TABLAS POR REFERENCIA ======================= */

  cargarTablas() {
    this.service.HTTP_Get('/sm/cd_tarifas/tablas').subscribe(
      data => {
        this.tablas = data.Table.filter(t => t.tipo === 'M');
        this.hojas = Array.from(new Set(this.tablas.map(t => t.hoja)));
        this.claves = Array.from(new Set(this.tablas.map(t => t.clave))).sort();
      },
      e => this.toaster.error(this.mensaje(e, 'No se han podido cargar las tablas'), 'Error')
    );
  }

  /* nombre: referencia que debe quedar seleccionada (p. ej. la que se acaba de dar de alta) */
  cargarReferencias(nombre?: string) {
    this.cargandoReferencias = true;
    this.service.HTTP_Get('/sm/cd_tarifas/referencias?desde=' + this.desde).subscribe(
      data => {
        this.cargandoReferencias = false;
        this.referencias = data.Table;
        const buscar = nombre ? nombre.trim().toLowerCase() : null;
        const s = buscar
          ? this.referencias.find(r => r.referencia.toLowerCase() === buscar)
          : (this.seleccionada ? this.referencias.find(r => r.clave === this.seleccionada.clave) : null);
        if (s) this.seleccionar(s);
        else if (nombre) this.seleccionar({ referencia: nombre, clave: '' });
        else { this.seleccionada = null; this.detalle = null; }
      },
      e => {
        this.cargandoReferencias = false;
        this.toaster.error(this.mensaje(e, 'No se han podido cargar las referencias'), 'Error');
      }
    );
  }

  get referenciasFiltradas(): any[] {
    const t = this.filtro.texto.trim().toLowerCase();
    return this.referencias.filter(r =>
      (!t || r.referencia.toLowerCase().includes(t) || r.tablas.some(x => x.clave.toLowerCase().includes(t))) &&
      (!this.filtro.soloSinTabla || r.sin_tabla > 0)
    );
  }

  seleccionar(r: any) {
    this.seleccionada = r;
    this.cargandoDetalle = true;
    this.service.HTTP_Get('/sm/cd_tarifas/referencia?nombre=' + encodeURIComponent(r.referencia) + '&desde=' + this.desde).subscribe(
      data => {
        this.cargandoDetalle = false;
        this.detalle = data;
        if (this.seleccionada) this.seleccionada.clave = data.referencia.clave;
        this.coloresReferencia = data.referencia.colores.map(c => c.color);
      },
      e => {
        this.cargandoDetalle = false;
        this.toaster.error(this.mensaje(e, 'No se ha podido cargar la referencia'), 'Error');
      }
    );
  }

  textoOrigen(origen: string): string {
    if (origen === 'REGLA') return 'Regla';
    if (origen === 'AUTOMATICA ASIA') return 'Automática ASIA';
    if (origen === 'AUTOMATICA') return 'Automática';
    return '';
  }

  claseOrigen(origen: string): string {
    return origen === 'REGLA' ? 'badge-primary' : 'badge-secondary';
  }

  textoCondicion(rg: any): string {
    let t = 'Cualquier color';
    if (rg.color_modo === 'IGUAL') t = 'Color = "' + rg.color + '"';
    if (rg.color_modo === 'CONTIENE') t = 'Color contiene "' + rg.color + '"';
    if (rg.atributo) t += ' y ' + rg.atributo + ' = ' + String(rg.atributo_valor || '').split('|').join(' o ');
    return t;
  }

  /* ---- Alta / edición de reglas ---- */

  nuevaReferencia() {
    this.coloresReferencia = [];
    this.abrirRegla({ referencia: '', color_modo: 'TODOS', color: '', hoja: null, clave: '', atributo: '', atributo_valor: '', activo: true, nota: '' }, true);
  }

  nuevaRegla(color?: any) {
    if (!this.detalle) return;
    const r = this.detalle.referencia;
    this.abrirRegla({
      referencia: r.referencia,
      color_modo: color ? 'IGUAL' : 'TODOS',
      color: color ? color.color : '',
      hoja: null,
      clave: color && color.resoluciones.length && color.resoluciones[0].clave ? color.resoluciones[0].clave : '',
      atributo: '', atributo_valor: '',
      activo: true, nota: ''
    }, false);
  }

  editarRegla(rg: any) {
    this.abrirRegla(Object.assign({}, rg, { activo: !!rg.activo, atributo: rg.atributo || '', atributo_valor: rg.atributo_valor || '' }), false);
  }

  private abrirRegla(regla: any, referenciaLibre: boolean) {
    this.regla = Object.assign({ referenciaLibre }, regla);
    if (!this.atributos.length) this.cargarAtributos();
    this.modalRegla.show();
  }

  /* Valores recibidos del atributo de la condición de la regla (ayuda para escribir) */
  get valoresAtributoRegla(): any[] {
    const a = this.atributos.find(x => x.atributo === (this.regla.atributo || '').toUpperCase());
    return a ? a.valores : [];
  }

  get clavesDeLaHoja(): string[] {
    if (!this.regla.hoja) return this.claves;
    return this.tablas.filter(t => t.hoja === this.regla.hoja).map(t => t.clave).sort();
  }

  guardarRegla() {
    if (!(this.regla.referencia || '').trim()) { this.toaster.warning('Indique la referencia', 'Atención'); return; }
    if (this.regla.color_modo !== 'TODOS' && !(this.regla.color || '').trim()) { this.toaster.warning('Indique el color', 'Atención'); return; }
    if (!this.regla.clave) { this.toaster.warning('Elija la tabla', 'Atención'); return; }
    const atributo = (this.regla.atributo || '').trim();
    if (atributo && !(this.regla.atributo_valor || '').trim()) { this.toaster.warning('Indique el valor del atributo', 'Atención'); return; }
    const datos = {
      atributo: atributo || null,
      atributo_valor: atributo ? this.regla.atributo_valor.trim() : null,
      idrow: this.regla.idrow || 0,
      referencia: this.regla.referencia.trim(),
      color_modo: this.regla.color_modo,
      color: this.regla.color_modo === 'TODOS' ? '' : this.regla.color.trim(),
      hoja: this.regla.hoja || null,
      clave: this.regla.clave,
      activo: this.regla.activo ? 1 : 0,
      nota: this.regla.nota || ''
    };
    this.guardandoRegla = true;
    this.service.HTTP_Post('/sm/cd_tarifas/reglas', JSON.stringify(datos)).subscribe(
      () => {
        this.guardandoRegla = false;
        this.modalRegla.hide();
        this.toaster.success('Regla guardada', 'Tarifas');
        this.cargarReferencias(datos.referencia);
      },
      e => {
        this.guardandoRegla = false;
        this.toaster.error(this.mensaje(e, 'No se ha podido guardar la regla'), 'Error');
      }
    );
  }

  borrarRegla(rg: any) {
    if (!window.confirm('¿Borrar la regla "' + this.textoCondicion(rg) + ' → ' + rg.clave + '"?')) return;
    this.service.HTTP_Delete('/sm/cd_tarifas/reglas/' + rg.idrow).subscribe(
      () => { this.toaster.success('Regla borrada', 'Tarifas'); this.cargarReferencias(); },
      e => this.toaster.error(this.mensaje(e, 'No se ha podido borrar la regla'), 'Error')
    );
  }

  verTabla(idtarifa: number) {
    this.tablaVer = { id: idtarifa, ancho: null, alto: null };
    this.modalTabla.show();
  }

  /* ============================ INCREMENTOS ============================ */

  cargarIncrementos() {
    this.service.HTTP_Get('/sm/cd_tarifas/incrementos').subscribe(
      data => { this.incrementos = data.reglas; this.articulos = data.articulos; },
      e => this.toaster.error(this.mensaje(e, 'No se han podido cargar los incrementos'), 'Error')
    );
  }

  cargarAtributos() {
    this.service.HTTP_Get('/sm/cd_tarifas/atributos').subscribe(
      data => { this.atributos = data.Table; },
      () => { /* solo es ayuda para escribir las condiciones */ }
    );
  }

  get valoresAtributo(): any[] {
    const a = this.atributos.find(x => x.atributo === (this.incremento.atributo || '').toUpperCase());
    if (!a) return [];
    return this.incremento.campo === 'VALOR2' ? a.valores2 : a.valores;
  }

  textoCondicionIncremento(i: any): string {
    if (!i.atributo) return 'Siempre';
    return i.atributo + (i.campo === 'VALOR2' ? ' (valor 2)' : '') + (i.modo === 'CONTIENE' ? ' contiene ' : ' = ') + '"' + i.valor + '"';
  }

  textoProducto(p: number): string {
    const x = this.productos.find(y => y.id === (p || null));
    return x ? x.texto : '';
  }

  textoCantidad(i: any): string {
    if (i.cantidad_modo === 'ANCHO') return 'Ancho / ' + Number(i.divisor) + ' hacia arriba' + (i.minimo ? ', mín. ' + Number(i.minimo) : '');
    return String(Number(i.cantidad));
  }

  nuevoIncremento() {
    this.abrirIncremento({ nombre: '', atributo: '', campo: 'VALOR', modo: 'IGUAL', valor: '', producto: null, tipoPrecio: 'ARTICULO',
      codigo: '', importe: null, cantidad_modo: 'FIJA', cantidad: 1, divisor: 50, minimo: 2, activo: true, nota: '' });
  }

  editarIncremento(i: any) {
    this.abrirIncremento(Object.assign({}, i, {
      atributo: i.atributo || '', valor: i.valor || '', tipoPrecio: i.codigo ? 'ARTICULO' : 'IMPORTE',
      cantidad: Number(i.cantidad), divisor: i.divisor === null ? 50 : Number(i.divisor), minimo: i.minimo === null ? null : Number(i.minimo),
      importe: i.importe === null ? null : Number(i.importe), activo: !!i.activo
    }));
  }

  private abrirIncremento(i: any) {
    this.incremento = i;
    this.modalIncremento.show();
  }

  guardarIncremento() {
    const i = this.incremento;
    if (!(i.nombre || '').trim()) { this.toaster.warning('Indique el nombre', 'Atención'); return; }
    if ((i.atributo || '').trim() && !(i.valor || '').trim()) { this.toaster.warning('Indique el valor del atributo', 'Atención'); return; }
    if (i.tipoPrecio === 'ARTICULO' && !i.codigo) { this.toaster.warning('Elija el artículo', 'Atención'); return; }
    if (i.tipoPrecio === 'IMPORTE' && (i.importe === null || i.importe === '')) { this.toaster.warning('Indique el importe', 'Atención'); return; }
    const datos = {
      idrow: i.idrow || 0, nombre: i.nombre, atributo: i.atributo, campo: i.campo, modo: i.modo, valor: i.valor,
      producto: i.producto, codigo: i.tipoPrecio === 'ARTICULO' ? i.codigo : null, importe: i.tipoPrecio === 'IMPORTE' ? i.importe : null,
      cantidad_modo: i.cantidad_modo, cantidad: i.cantidad, divisor: i.divisor, minimo: i.minimo,
      activo: i.activo ? 1 : 0, nota: i.nota || ''
    };
    this.guardando = true;
    this.service.HTTP_Post('/sm/cd_tarifas/incrementos/reglas', JSON.stringify(datos)).subscribe(
      () => { this.guardando = false; this.modalIncremento.hide(); this.toaster.success('Incremento guardado', 'Tarifas'); this.cargarIncrementos(); },
      e => { this.guardando = false; this.toaster.error(this.mensaje(e, 'No se ha podido guardar el incremento'), 'Error'); }
    );
  }

  borrarIncremento(i: any) {
    if (!window.confirm('¿Borrar el incremento "' + i.nombre + '"?')) return;
    this.service.HTTP_Delete('/sm/cd_tarifas/incrementos/reglas/' + i.idrow).subscribe(
      () => { this.toaster.success('Incremento borrado', 'Tarifas'); this.cargarIncrementos(); },
      e => this.toaster.error(this.mensaje(e, 'No se ha podido borrar el incremento'), 'Error')
    );
  }

  nuevoArticulo() {
    this.articuloNuevo = true;
    this.articulo = { codigo: '', descripcion: '', precio: null };
    this.modalArticulo.show();
  }

  editarArticulo(a: any) {
    this.articuloNuevo = false;
    this.articulo = { codigo: a.codigo, descripcion: a.descripcion, precio: Number(a.precio) };
    this.modalArticulo.show();
  }

  guardarArticulo() {
    const a = this.articulo;
    if (!(a.codigo || '').trim() || !(a.descripcion || '').trim() || a.precio === null || a.precio === '') {
      this.toaster.warning('Indique código, descripción y precio', 'Atención');
      return;
    }
    if (this.articuloNuevo && this.articulos.some(x => x.codigo === a.codigo.trim())) {
      this.toaster.warning('Ya existe un artículo con ese código', 'Atención');
      return;
    }
    this.guardando = true;
    this.service.HTTP_Post('/sm/cd_tarifas/incrementos/articulos', JSON.stringify(a)).subscribe(
      () => { this.guardando = false; this.modalArticulo.hide(); this.toaster.success('Artículo guardado', 'Tarifas'); this.cargarIncrementos(); },
      e => { this.guardando = false; this.toaster.error(this.mensaje(e, 'No se ha podido guardar el artículo'), 'Error'); }
    );
  }

  borrarArticulo(a: any) {
    if (!window.confirm('¿Borrar el artículo ' + a.codigo + ' ' + a.descripcion + '?')) return;
    this.service.HTTP_Delete('/sm/cd_tarifas/incrementos/articulos/' + encodeURIComponent(a.codigo)).subscribe(
      () => { this.toaster.success('Artículo borrado', 'Tarifas'); this.cargarIncrementos(); },
      e => this.toaster.error(this.mensaje(e, 'No se ha podido borrar el artículo'), 'Error')
    );
  }
}
