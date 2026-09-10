import { Component, OnInit } from '@angular/core';
import { ruckgabeType } from '../../../models/ruckgabeType';
import { BestellungType } from '../../../models/BestellungType';
import { BestellungLineType } from '../../../models/BestellungLineType';
import { searchCustType } from '../../../models/searchCustType';
import { LinType } from '../../../models/LinType';

@Component({
  selector: 'app-head-bestellung',
  templateUrl: './head-bestellung.component.html',
  styleUrls: ['./head-bestellung.component.css']
})
export class HeadBestellungComponent implements OnInit {

  criterio = "";

  model = new ruckgabeType();

  header = new BestellungType();
  lista: Array<BestellungLineType> = [];
  searchResults: Array<searchCustType> = [];
  searchLines: Array<LinType> = [];


  pedido = {
    mbase: 0,
    miva: 0,
    mtotal: 0
  }

  searchArticle = {
    Alias: "",
    Descripcion: "",
    Barras: ""
  };




  constructor() {

  }

  ngOnInit() {

    this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);

    this.lista.push(new BestellungLineType(1 + this.lista.length, 1, 'Prueba', 1, 1, 'referencia', 'observaciones', 12.56, 10, 0, 1, 21));
    this.lista.push(new BestellungLineType(1 + this.lista.length, 1, 'Prueba', 1, 1, 'referencia', 'observaciones', 12.56, 10, 0, 1, 21));

    this.CalculateGlobal();
  }

  AddQuick() {

    this.lista.push(new BestellungLineType(1 + this.lista.length, 1, 'Modificar Descripción', 1, 1, 'Referencia', 'observaciones', 0, 0, 0, 1, 21));

    this.CalculateGlobal();

  }

  CalculateGlobal() {
    this.pedido.mbase = 0;
    this.pedido.miva = 0;
    this.pedido.mtotal = 0;

    this.lista.forEach(item => {

      this.pedido.mbase += item.mbase;
      this.pedido.miva += item.miva;
      this.pedido.mtotal += item.mtotal;

    });
  }

  selectCustomer(item) {

  }

  Save() {

  }

  onDateChange(e, e1): void {
  }

  search() {

  }
  searchLinesArticulos() {

  }
  addLines() {

  }

}
