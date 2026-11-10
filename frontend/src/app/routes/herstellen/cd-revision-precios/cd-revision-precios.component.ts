import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HaruService } from '../../../services/haru.service';

/*
 * Revisión de precios de un pedido de CortinaDecor.
 * Por línea: precio que envía CortinaDecor frente al nuestro y, al desplegar, cómo se ha calculado el nuestro:
 * tabla consultada (y por qué: regla Referencia + color o asignación automática), celda, incrementos y total.
 * La revisión no cambia nada por sí sola; los botones "Aplicar nuestro precio" ponen nuestro precio en las líneas con
 * diferencia (el <Precio> del XML de producción sale de ahí) y "Volver al precio de CD" lo deshacen.
 * Se abre desde routes/herstellen/prebestell2 (pestaña Cortinadecor).
 * Backend: GET /api/sm/cd_revision/:idrow y POST /api/sm/cd_revision/:idrow/precio
 */

/* Diferencia (sobre el precio de CortinaDecor) a partir de la cual se avisa antes de aplicar nuestro precio */
const AVISO_DIFERENCIA = 0.2;
@Component({
  selector: 'cd-revision-precios',
  templateUrl: './cd-revision-precios.component.html',
  styleUrls: ['./cd-revision-precios.component.css'],
  providers: [HaruService]
})
export class CdRevisionPreciosComponent implements OnChanges {

  @Input() idrow: number = 0;
  @Input() pedido: string = '';
  @Output() verTabla = new EventEmitter<{ idtarifa: number, ancho: number, alto: number }>();

  lineas: any[] = [];
  resumen: any = null;
  abiertas: { [id: number]: boolean } = {};
  cargando = false;
  error = '';
  puedeAplicar = false;     // false si falta ejecutar el script 16 en la BD
  xmlGenerado = false;      // el pedido ya tiene XML: hay que volver a generarlo para que lleve el precio nuevo
  aplicando = false;

  constructor(private service: HaruService, private toaster: ToastrService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.idrow) this.cargar();
  }

  cargar() {
    this.lineas = [];
    this.resumen = null;
    this.abiertas = {};
    this.error = '';
    if (!(this.idrow > 0)) return;
    this.cargando = true;
    this.service.HTTP_Get('/sm/cd_revision/' + this.idrow).subscribe(
      data => {
        this.cargando = false;
        this.lineas = data.Table;
        this.puedeAplicar = !!data.puede_aplicar;
        this.xmlGenerado = !!data.xml_generado;
        this.resumen = this.totales(data.Table);
        /* Se despliegan de entrada las líneas que no cuadran */
        this.lineas.forEach(l => { if (l.estado === 'DIFERENCIA') this.abiertas[l.id] = true; });
      },
      e => {
        this.cargando = false;
        this.error = (e && e.error && e.error.message) || 'No se ha podido revisar el pedido';
      }
    );
  }

  private totales(lineas: any[]) {
    const valoradas = lineas.filter(l => l.esperado !== null);
    const suma = (ls: any[], f: string) => Math.round(ls.reduce((t, l) => t + (Number(l[f]) || 0), 0) * 100) / 100;
    return {
      cd: suma(valoradas, 'precio_cd'),
      nuestro: suma(valoradas, 'esperado'),
      diferencia: suma(valoradas, 'diferencia'),
      cdTotal: suma(lineas, 'precio_cd'),
      sinValorar: lineas.length - valoradas.length,
      diferencias: lineas.filter(l => l.estado === 'DIFERENCIA').length,
      aplicables: lineas.filter(l => this.sePuedeAplicar(l)).length,
      aplicadas: lineas.filter(l => this.estaAplicado(l)).length
    };
  }

  /* Línea con diferencia, con nuestro precio, de un producto que va al XML y sin el precio ya aplicado */
  sePuedeAplicar(l: any): boolean {
    return l.estado === 'DIFERENCIA' && l.en_xml && l.esperado > 0 && l.precio_cd !== null && !this.estaAplicado(l);
  }

  estaAplicado(l: any): boolean {
    return l.precio_aplicado !== null && l.precio_aplicado !== undefined;
  }

  /* Aplica nuestro precio a una línea (l) o a todas las que tienen diferencia (sin l) */
  aplicar(l?: any) {
    const lineas = l ? [l] : this.lineas.filter(x => this.sePuedeAplicar(x));
    if (!lineas.length) return;
    const grandes = lineas.filter(x => Math.abs(x.diferencia) > AVISO_DIFERENCIA * x.precio_cd);
    let texto = l
      ? '¿Poner nuestro precio (' + this.euros(l.esperado) + ') en esta línea en lugar del de CortinaDecor (' + this.euros(l.precio_cd) + ')?'
      : '¿Poner nuestro precio en las ' + lineas.length + ' líneas con diferencia en lugar del de CortinaDecor?';
    if (grandes.length) {
      texto += '\n\nOJO: ' + (grandes.length === 1 ? 'una línea difiere' : grandes.length + ' líneas difieren') +
        ' más de un ' + (AVISO_DIFERENCIA * 100) + ' % del precio de CortinaDecor:\n' +
        grandes.slice(0, 6).map(x => ' · ' + x.detalle.referencia + ': CD ' + this.euros(x.precio_cd) + ' → nuestro ' + this.euros(x.esperado)).join('\n') +
        (grandes.length > 6 ? '\n · ...' : '');
    }
    if (!window.confirm(texto)) return;
    this.enviar('aplicar', l ? [l.id] : []);
  }

  /* Devuelve el precio de CortinaDecor a una línea (l) o a todas las que lo tienen cambiado (sin l) */
  deshacer(l?: any) {
    const n = l ? 1 : this.lineas.filter(x => this.estaAplicado(x)).length;
    if (!n || !window.confirm('¿Volver al precio de CortinaDecor en ' + (l ? 'esta línea' : 'las ' + n + ' líneas con nuestro precio aplicado') + '?')) return;
    this.enviar('deshacer', l ? [l.id] : []);
  }

  private enviar(accion: string, lineas: number[]) {
    this.aplicando = true;
    this.service.HTTP_Post('/sm/cd_revision/' + this.idrow + '/precio', JSON.stringify({ accion, lineas })).subscribe(
      r => {
        this.aplicando = false;
        const hecho = accion === 'aplicar' ? 'Nuestro precio aplicado' : 'Precio de CortinaDecor restaurado';
        this.toaster.success(hecho + ' en ' + r.lineas + ' línea' + (r.lineas === 1 ? '' : 's') +
          (r.xml_generado ? '. El XML ya estaba generado: hay que volver a generarlo.' : '.'), 'Precio');
        this.cargar();
      },
      e => {
        this.aplicando = false;
        this.toaster.error((e && e.error && e.error.message) || 'No se ha podido cambiar el precio', 'Error');
      }
    );
  }

  private euros(n: number): string {
    return (Math.round(Number(n) * 100) / 100).toFixed(2).replace('.', ',') + ' €';
  }

  alternar(l: any) {
    this.abiertas[l.id] = !this.abiertas[l.id];
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'OK': return 'badge-success';
      case 'DIFERENCIA': return 'badge-danger';
      case 'NO VALORABLE': return 'badge-secondary';
      default: return 'badge-warning';
    }
  }

  textoOrigen(origen: string): string {
    if (origen === 'REGLA') return 'Regla del panel de tarifas';
    if (origen === 'AUTOMATICA ASIA') return 'Automática (tejido del diccionario + ASIA)';
    if (origen === 'AUTOMATICA') return 'Automática (tejido del diccionario)';
    if (origen === 'NOMBRE') return 'Automática (por el nombre de la referencia)';
    return '';
  }

  abrirTabla(l: any) {
    this.verTabla.emit({ idtarifa: l.idtarifa, ancho: l.ancho_tarifa, alto: l.alto_tarifa });
  }

  /* Paneles: tabla de mecanismo o de tejido del desglose */
  abrirTablaDe(t: any) {
    this.verTabla.emit({ idtarifa: t.idtarifa, ancho: t.ancho, alto: t.alto });
  }
}
