import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HaruService } from '../../../services/haru.service';

/*
 * Pestaña "B2B" de Pedidos pendientes (routes/herstellen/prebestell2): pedidos que llegan por API
 * (VENETIANS, contrato v3) al servidor B2B (proyecto CD) y se guardan tal como llegan en SOL_B2B_*.
 * Todavía no se fabrican: aquí se ven, se revisan y cada línea se marca como mecanizada a mano.
 * Los avisos de cada línea son los códigos que no se han encontrado en el configurador y los
 * atributos adicionales (productos u opciones que aún no tenemos, como Noche día o Mojácar).
 * Backend: /api/sm/b2b/* (controllers/sm/b2b_pedidos.js), SPs sql/sqlB2B/03-04.
 * sqlB2B/04: todo lo que envía el cliente llega aunque venga mal. Los pedidos con errores de formato salen
 * "Con errores" (estado 2) con la lista de errores, y la vista "Todo lo recibido" enseña cada envío, también
 * los que no dieron pedido (JSON roto, token incorrecto...), con el texto exacto que llegó.
 */
@Component({
  selector: 'b2b-pedidos',
  templateUrl: './b2b-pedidos.component.html',
  styleUrls: ['./b2b-pedidos.component.css'],
  providers: [HaruService]
})
export class B2bPedidosComponent implements OnInit {

  desde = '';
  hasta = '';
  prueba = '';            // '' todos, '0' reales, '1' de prueba
  soloAvisos = false;

  pedidos: any[] = [];
  cargando = false;
  error = '';

  seleccionado: any = null;   // { cabecera, lineas, original }
  cargandoDetalle = false;
  abiertas: { [id: number]: boolean } = {};
  verOriginal = false;
  confirmarBorrado: 'uno' | 'todos' | null = null;

  /* Vista "Todo lo recibido" (SOL_B2B_RECEPCION) */
  vista: 'pedidos' | 'recepciones' = 'pedidos';
  recepciones: any[] = [];
  soloFallidas = true;
  cargandoRecepciones = false;
  recepcionAbierta: number | null = null;

  constructor(private service: HaruService, private toaster: ToastrService) { }

  ngOnInit() {
    const hoy = new Date();
    this.desde = this.iso(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1));
    this.hasta = this.iso(hoy);
    this.consultar();
  }

  private iso(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + dia;
  }

  get lista() {
    return this.soloAvisos ? this.pedidos.filter(p => p.lineas_aviso > 0 || p.estado === 2) : this.pedidos;
  }

  get totalConErrores() {
    return this.pedidos.filter(p => p.estado === 2).length;
  }

  cambiarVista(v: 'pedidos' | 'recepciones') {
    this.vista = v;
    if (v === 'recepciones') this.consultarRecepciones();
  }

  consultarRecepciones() {
    this.cargandoRecepciones = true;
    this.recepcionAbierta = null;
    const ruta = '/sm/b2b/recepciones?desde=' + this.desde + '&hasta=' + this.hasta + (this.soloFallidas ? '&fallidas=1' : '');
    this.service.HTTP_Get(ruta).subscribe(
      data => {
        this.cargandoRecepciones = false;
        this.recepciones = data.Table || [];
      },
      () => {
        this.cargandoRecepciones = false;
        this.toaster.error('No se han podido cargar las recepciones');
      });
  }

  /* Abre el pedido de una recepción en la vista de pedidos */
  irAPedido(r: any) {
    if (!r.pedido_id) return;
    this.vista = 'pedidos';
    this.cargarDetalle(r.pedido_id, true);
  }

  textoDetalle(d: any): string {
    if (d === null || d === undefined || d === '') return '';
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) {
      return d.map(e => e && e.campo ? ((e.linea ? 'línea ' + e.linea + ', ' : '') + e.campo + ': ' + e.motivo)
        : (e && e.avisos ? 'línea ' + e.linea + ': ' + e.avisos.join(' · ') : JSON.stringify(e))).join(' | ');
    }
    return JSON.stringify(d);
  }

  claseResultado(r: string) {
    return r === 'recibido' || r === 'reemplazado' ? 'badge-success'
      : r === 'recibido_con_avisos' || r === 'duplicado' ? 'badge-info'
      : r === 'con_errores' ? 'badge-warning' : 'badge-danger';
  }

  descEstado(estado: number) {
    return estado === 1 ? 'Revisado' : estado === -1 ? 'Cancelado' : estado === 2 ? 'Con errores' : 'Recibido';
  }

  /* Errores de formato que afectan a una línea (para resaltarla) */
  erroresDeLinea(l: any): any[] {
    const errores = (this.seleccionado && this.seleccionado.cabecera.errores) || [];
    return errores.filter(e => e.linea === l.linea);
  }

  get totalPruebas() {
    return this.pedidos.filter(p => p.prueba).length;
  }

  consultar() {
    this.cargando = true;
    this.error = '';
    let ruta = '/sm/b2b/pedidos?desde=' + this.desde + '&hasta=' + this.hasta;
    if (this.prueba !== '') ruta += '&prueba=' + this.prueba;
    this.service.HTTP_Get(ruta).subscribe(
      data => {
        this.cargando = false;
        this.pedidos = data.Table || [];
        if (this.seleccionado && !this.pedidos.some(p => p.idrow === this.seleccionado.cabecera.idrow)) this.seleccionado = null;
      },
      err => {
        this.cargando = false;
        this.error = 'No se han podido cargar los pedidos B2B';
      });
  }

  abrir(p: any) {
    if (this.seleccionado && this.seleccionado.cabecera.idrow === p.idrow) {
      this.seleccionado = null;
      return;
    }
    this.cargarDetalle(p.idrow, true);
  }

  private cargarDetalle(id: number, nuevo: boolean) {
    this.cargandoDetalle = true;
    this.confirmarBorrado = null;
    this.service.HTTP_Get('/sm/b2b/pedido/' + id).subscribe(
      data => {
        this.cargandoDetalle = false;
        this.seleccionado = data;
        if (nuevo) {
          this.abiertas = {};
          this.verOriginal = false;
          /* se despliegan de entrada las líneas con avisos */
          (data.lineas || []).forEach(l => { if (l.n_avisos > 0) this.abiertas[l.idrow] = true; });
        }
      },
      err => {
        this.cargandoDetalle = false;
        this.toaster.error('No se ha podido abrir el pedido');
      });
  }

  /* Atributos adicionales de la línea (lo que el configurador aún no tiene) */
  atributos(l: any): any[] {
    return (l.parametros && Array.isArray(l.parametros.atributos)) ? l.parametros.atributos : [];
  }

  impresion(l: any) {
    return l.parametros && l.parametros.impresion ? JSON.stringify(l.parametros.impresion) : '';
  }

  estadoPedido(estado: number) {
    const id = this.seleccionado.cabecera.idrow;
    this.service.HTTP_Post('/sm/b2b/pedido/' + id + '/estado', JSON.stringify({ estado })).subscribe(
      () => {
        this.toaster.success('Estado del pedido cambiado');
        this.cargarDetalle(id, false);
        this.consultar();
      },
      () => this.toaster.error('No se ha podido cambiar el estado'));
  }

  estadoLinea(l: any, estado: number) {
    this.service.HTTP_Post('/sm/b2b/linea/' + l.idrow + '/estado', JSON.stringify({ estado })).subscribe(
      () => {
        this.cargarDetalle(this.seleccionado.cabecera.idrow, false);
        this.consultar();
      },
      () => this.toaster.error('No se ha podido cambiar el estado de la línea'));
  }

  borrarPruebas(cual: 'uno' | 'todos') {
    const body = cual === 'uno' ? { id: this.seleccionado.cabecera.idrow } : {};
    this.confirmarBorrado = null;
    this.service.HTTP_Post('/sm/b2b/borrar_pruebas', JSON.stringify(body)).subscribe(
      (data: any) => {
        this.toaster.success((data.borrados || 0) + ' pedido(s) de prueba borrados');
        if (cual === 'todos' || cual === 'uno') this.seleccionado = null;
        this.consultar();
      },
      () => this.toaster.error('No se han podido borrar los pedidos de prueba'));
  }

  claseEstado(estado: number) {
    return estado === 1 ? 'badge-success' : estado === -1 ? 'badge-secondary' : estado === 2 ? 'badge-danger' : 'badge-primary';
  }
}
