import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.css']
})
export class TickerComponent implements OnChanges, OnInit {

  ticks = 0;
  dias = 0;
  horas = 0;
  minutos = 0;
  segundos = 60;
  label = "";

  @Input() maxDate: Date = new Date();

  constructor() { }

  ngOnInit() {
    let timer$ = timer(1000, 1000);
    timer$.subscribe(t => this.tickerFunc(t));

  }

  ngOnChanges(changes: SimpleChanges) {

    const maxDate: SimpleChange = changes['maxDate'];
    this.maxDate = maxDate.currentValue;


  }

  tickerFunc(tick) {

    var fechaInicio = new Date().getTime();
    var fechaFin = new Date(this.maxDate).getTime();
    var diff = fechaFin - fechaInicio;

    this.segundos = Math.floor((diff / 1000) % 60);
    this.dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    this.minutos = Math.floor((diff / 1000 / 60) % 60);

    /*
    this.ticks = tick;
    this.segundos = this.segundos -1;
    if (this.segundos < 1){
      this.segundos = 60;
      this.minutos = this.minutos - 1;
    }
*/
    this.label = ('0' + this.dias).slice(-2) + " dias ";
    this.label += ('0' + this.horas).slice(-2) + " hrs ";
    this.label += ('0' + this.minutos).slice(-2) + " min ";
    this.label += ('0' + this.segundos).slice(-2) + " seg ";
  }

}
