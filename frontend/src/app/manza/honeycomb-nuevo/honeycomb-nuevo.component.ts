import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { ImageCacheService } from 'src/app/services/image-cache.service';
import { TranslationService } from 'src/app/services/translation.service';
import { CortinaTipo } from '../config/CortinaTipo';
import { AccConfiguradorService } from '../enrollable-nuevo/acc-configurador.service';
import { HoneycombComponent } from '../honeycomb/honeycomb.component';
import { HoneycombService } from '../honeycomb/honeycomb.service';

/*
 * HoneyComb con el motor NUEVO (sql/sqlHoney/21; perfil con la HoneyComb en motor NUEVO).
 * Es el configurador de siempre (misma plantilla, mismas imágenes, mismas medidas) con tres cambios:
 *   - las listas salen de GET /acc_cfg/hc/opciones: lo que ve el perfil del cliente, con sus nombres (los colores de
 *     tejido con el nombre del tejido del maestro enlazado, o el del perfil);
 *   - el precio lo calcula POST /acc_cfg/hc/precio (la misma tarifa e incrementos que el de siempre, validando el perfil);
 *   - la línea lleva nhc (ids de las listas de la HoneyComb); el alta va por /acc_cfg/pedido, que graba la línea con el SP
 *     y los nombres de siempre, así que la fabricación no cambia.
 */
@Component({
  selector: 'manza-honeycomb-nuevo',
  templateUrl: '../honeycomb/honeycomb.component.html',
  styleUrls: ['../honeycomb/honeycomb.component.scss'],
  providers: [HoneycombService],
})
export class HoneycombNuevoComponent extends HoneycombComponent implements OnChanges {

  /* respuesta de /acc_cfg/hc/opciones */
  private opcionesHc: any = null;
  /* línea en edición que llega antes que las opciones */
  private edicionPendiente: any = null;
  private readonly MEDIDAS_BASE = { ANCHO_MIN: 40, ANCHO_MAX: 120, ALTO_MIN: 40, ALTO_MAX: 280 };

  constructor(
    service: HoneycombService,
    imageCacheService: ImageCacheService,
    toaster: ToastrService,
    translation: TranslationService,
    sanitizer: DomSanitizer,
    private acc: AccConfiguradorService
  ) {
    super(service, imageCacheService, toaster, translation, sanitizer);
  }

  /* El cliente puede llegar después de crear el componente (pedir como cliente): se recargan las listas */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Cliente'] && !changes['Cliente'].firstChange) { this.loadData(); }
  }

  loadData() {
    if (!(parseInt(this.Cliente, 10) > 0)) { return; }
    this.acc.hcOpciones(this.Cliente).pipe(takeUntil(this.destroy$)).subscribe(
      o => this.aplicarOpciones(o),
      err => this.toaster.error((err && err.error && err.error.message) || 'No se pudieron cargar las opciones de la HoneyComb', 'HoneyComb')
    );
  }

  private aplicarOpciones(o: any) {
    this.opcionesHc = o;
    const m = o.medidas || {};
    this.MEDIDAS_BASE.ANCHO_MIN = m.ancho_min || 40;
    this.MEDIDAS_BASE.ANCHO_MAX = m.ancho_max || 120;
    this.MEDIDAS_BASE.ALTO_MIN = m.alto_min || 40;
    this.MEDIDAS_BASE.ALTO_MAX = m.alto_max || 280;

    this.TiposTejido = (o.tiposTejido || []).map((t: any) => ({ idTipoTejido: t.id, TipoTejido: t.nombre, imagenCargada: false }));
    if (!this.TiposTejido.some(t => t.idTipoTejido == this.model.TipoTejido)) {
      this.model.TipoTejido = this.TiposTejido.length ? this.TiposTejido[0].idTipoTejido : 0;
    }
    this.ColoresPerfil = (o.coloresPerfil || []).map((p: any) => ({ idColorPerfil: p.id, ColorPerfil: p.nombre, imagenCargada: false }));
    if (!this.ColoresPerfil.some(p => p.idColorPerfil == Number(this.model.ColorPerfil))) {
      this.model.ColorPerfil = this.ColoresPerfil.length ? String(this.ColoresPerfil[0].idColorPerfil) : '';
    }
    this.TiposAccionamiento = (o.accionamientos || []).map((a: any) => ({
      idTipoAccionamiento: a.id, TipoAccionamiento: a.nombre, Incremento: a.incremento
    }));
    if (!this.TiposAccionamiento.some(a => a.idTipoAccionamiento == Number(this.model.TipoAccionamiento))) {
      this.model.TipoAccionamiento = this.TiposAccionamiento.length ? this.TiposAccionamiento[0].idTipoAccionamiento : 0;
    }
    this.loadTiposTejidoImages();
    this.loadPerfilesImages();

    if (this.edicionPendiente) {
      const item = this.edicionPendiente;
      this.edicionPendiente = null;
      this.cargarEdicion(item);
    } else {
      this.filtrarColores();
    }
  }

  /* Colores del tipo de tejido elegido (id = color de la HoneyComb) y los límites de medida de su tejido */
  private filtrarColores(colorElegido?: any) {
    const colores = (this.opcionesHc && this.opcionesHc.coloresTejido) || [];
    this.ColoresTejidoFiltrados = colores.filter((c: any) => c.tipo_tejido == this.model.TipoTejido).map((c: any) => ({
      idColorTejido: String(c.id), ColorTejido: c.nombre, codigoColor: c.codigo_color, imagenCargada: false
    }));
    if (colorElegido !== undefined && this.ColoresTejidoFiltrados.some(c => c.idColorTejido == colorElegido)) {
      this.model.ColorTejido = String(colorElegido);
    }
    this.asegurarColorTejido();
    this.aplicarLimites();
    this.loadColoresTejidoImages();
  }

  /* Medidas: las de la HoneyComb, recortadas por los límites del tejido en el perfil (si los tiene) */
  private aplicarLimites() {
    const b = this.MEDIDAS_BASE;
    const colores = (this.opcionesHc && this.opcionesHc.coloresTejido) || [];
    const color = colores.find((c: any) => c.id == this.model.ColorTejido);
    const l = (color && color.limites) || {};
    const mayor = (a: number, x: any) => (x === null || x === undefined ? a : Math.max(a, Number(x)));
    const menor = (a: number, x: any) => (x === null || x === undefined ? a : Math.min(a, Number(x)));
    this.ANCHO_MIN = mayor(b.ANCHO_MIN, l.ancho_min);
    this.ANCHO_MAX = menor(b.ANCHO_MAX, l.ancho_max);
    this.ALTO_MIN = mayor(b.ALTO_MIN, l.alto_min);
    this.ALTO_MAX = menor(b.ALTO_MAX, l.alto_max);
  }

  ChangeTipoTejido() {
    this.limpiarPrecio();
    this.filtrarColores();
  }

  ChangeColorTejido() {
    this.limpiarPrecio();
    this.aplicarLimites();
  }

  /* Línea que se manda al servidor: ids de las listas de la HoneyComb */
  private lineaServidor(): any {
    return {
      TipoCortina: 7, codeCentro: this.codeCentro,
      ancho: Number(this.model.Ancho), alto: Number(this.model.Alto), cantidad: Number(this.model.Cantidad),
      nhc: {
        tipo_tejido: Number(this.model.TipoTejido), color_tejido: Number(this.model.ColorTejido),
        color_perfil: Number(this.model.ColorPerfil), accionamiento: Number(this.model.TipoAccionamiento)
      }
    };
  }

  CalcularPrecio() {
    const errMedidas = this.errorMedidas();
    if (errMedidas) {
      this.limpiarPrecio();
      this.toaster.error(errMedidas, 'ERROR');
      return;
    }
    this.calculando = true;
    this.acc.hcPrecio(this.Cliente, this.lineaServidor()).pipe(takeUntil(this.destroy$)).subscribe(
      (r: any) => {
        this.model.precios.T7_PVP = Number(r.precios.T7_PVP);
        this.model.precios.T7_PVP_C1 = r.precios.T7_PVP_C1;
        this.model.precios.T7_Fecha_Entrega = r.precios.T7_Fecha_Entrega;
        this.model.precios.T7_Transporte = r.precios.T7_Transporte;
        this.calculando = false;
      },
      err => {
        this.limpiarPrecio();
        this.calculando = false;
        this.toaster.error((err && err.error && err.error.message) || 'No se pudo calcular el precio', 'HoneyComb');
      }
    );
  }

  /* La de siempre más nhc: el alta del flujo nuevo graba los nombres de las tablas de la HoneyComb, no los del perfil */
  protected construirLinea(): CortinaTipo {
    const tipo = super.construirLinea();
    (tipo as any).nhc = this.lineaServidor().nhc;
    return tipo;
  }

  /* Edición de una línea de la cesta (también las de la HoneyComb de siempre, sin nhc) */
  cargarEdicion(item: any): void {
    if (!this.opcionesHc) { this.edicionPendiente = item; return; }
    const n = item.nhc || {};
    this.model.Ancho = item.ancho;
    this.model.Alto = item.alto;
    this.model.Cantidad = item.cantidad;
    this.model.TipoTejido = n.tipo_tejido || item.tej_tipo_id;
    const perfil = n.color_perfil || item.color_perfil_id;
    if (perfil != null) { this.model.ColorPerfil = String(perfil); }
    this.model.TipoAccionamiento = n.accionamiento || item.hc_accionamiento_id;
    this.filtrarColores(n.color_tejido || item.tej_color_id);
  }
}
