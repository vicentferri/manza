import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { HaruService } from '../../services/haru.service';

/*
 * Tabla de la tarifa de CortinaDecor (columnas = ancho, filas = alto, en metros) con la celda usada resaltada.
 * Se usa en el panel Cortinadecor > Tarifas y en el desglose de la revisión de precios de los pedidos.
 */
@Component({
  selector: 'cd-tabla-tarifa',
  templateUrl: './cd-tabla-tarifa.component.html',
  styleUrls: ['./cd-tabla-tarifa.component.css'],
  providers: [HaruService]
})
export class CdTablaTarifaComponent implements OnChanges {

  @Input() idtarifa: number = 0;
  @Input() ancho: number = null;   // escalón usado (m)
  @Input() alto: number = null;    // escalón usado (m)

  tabla: any = null;
  anchos: number[] = [];
  filas: any[] = [];
  cargando = false;
  error = '';

  constructor(private service: HaruService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.idtarifa) this.cargar();
  }

  cargar() {
    this.tabla = null;
    this.anchos = [];
    this.filas = [];
    this.error = '';
    if (!(this.idtarifa > 0)) return;
    this.cargando = true;
    this.service.HTTP_Get('/sm/cd_tarifas/tabla/' + this.idtarifa).subscribe(
      data => {
        this.cargando = false;
        this.tabla = data.tabla;
        this.anchos = data.anchos;
        this.filas = data.filas;
      },
      e => {
        this.cargando = false;
        this.error = (e && e.error && e.error.message) || 'No se ha podido cargar la tabla';
      }
    );
  }

  esColumna(a: number): boolean { return this.ancho !== null && Number(this.ancho) === a; }
  esFila(h: number): boolean { return this.alto !== null && Number(this.alto) === h; }
}
