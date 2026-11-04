import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { HaruService } from '../../../services/haru.service';

/*
 * Revisión de precios de un pedido de CortinaDecor (solo informativa).
 * Por línea: precio que envía CortinaDecor frente al nuestro y, al desplegar, cómo se ha calculado el nuestro:
 * tabla consultada (y por qué: regla Referencia + color o asignación automática), celda, incrementos y total.
 * Se abre desde routes/herstellen/prebestell2 (pestaña Cortinadecor). Backend: GET /api/sm/cd_revision/:idrow
 */
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

  constructor(private service: HaruService) { }

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
      diferencias: lineas.filter(l => l.estado === 'DIFERENCIA').length
    };
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
