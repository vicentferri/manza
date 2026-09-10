import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-desglose',
  templateUrl: './desglose.component.html',
  styleUrls: ['./desglose.component.css']
})
export class DesgloseComponent implements OnInit {

  values = [];
  /*
    { "label": "Tejido", "precio": "23.56€", "c1": "C1 0003433" },
    { "label": "Accionamiento", "precio": "345.56€", "c1": "C1 0003333" }];
  */

  constructor() { }

  ngOnInit() {
  }

  /*
  */
  public Show(data: any) {
    this.values = data;
  }

  public Get() {
    return this.values;
  }

  public Reset() {
    this.values = [];
  }

}
