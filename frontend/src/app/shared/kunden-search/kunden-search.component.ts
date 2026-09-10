import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { searchCustType } from '../../models/searchCustType';
import { HaruService } from '../../services/haru.service';

@Component({
  selector: 'kunden-search',
  templateUrl: './kunden-search.component.html',
  styleUrls: ['./kunden-search.component.css'],
  providers: [HaruService]
})
export class KundenSearchComponent implements OnInit {

  @Output() onLineAdded = new EventEmitter();
  @Input() MultipleSelection = false;

  searchResults: Array<searchCustType> = [];
  selectedResults: any = [];

  criterio = "";
  cadena: any = [];
  gestion: any = [];
  actividad: any = [];
  sector: any = [];
  paises: any = [];
  provincias: any = [];

  searchcliente = {
    tipocliente: -1,
    criterio: "",
    cadena: "-100",
    gestion: "-100",
    actividad: "-100",
    sector: "-100",
    top: "100",
    pais: "-100",
    provincia: "-100"
  }

  constructor(private service: HaruService) { }

  ngOnInit() {
    this.loadClientesClasificacion();
  }

  search() {

    this.searchResults = [];

    let data = {
      tag: this.searchcliente
    }

    var values = JSON.stringify(data);

    var url = "/clientes_search/";

    this.service.HTTP_Post(url, values).subscribe(
      data => {
        this.searchResults = data.Table;
      },
      error => {
        console.log(error);
      });
  }

  loadProvincias() {
    var pais = this.searchcliente.pais;
    var url = "/clientes_provincias/" + pais;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.provincias = data.Table;
        this.provincias.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });
  }

  loadClientesClasificacion() {
    this.service.HTTP_Get("/clientes_paises").subscribe(
      data => {
        this.paises = data.Table;
        this.paises.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });

    this.service.HTTP_Get("/clientes_cadena").subscribe(
      data => {
        this.cadena = data.Table;
        this.cadena.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });

    this.service.HTTP_Get("/clientes_gestion").subscribe(
      data => {
        this.gestion = data.Table;
        this.gestion.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });

    this.service.HTTP_Get("/clientes_actividad").subscribe(
      data => {
        this.actividad = data.Table;
        this.actividad.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });

    this.service.HTTP_Get("/clientes_sector").subscribe(
      data => {
        this.sector = data.Table;
        this.sector.push({ 'uid': '-100', 'descripcion': 'NO FILTRAR' });
      },
      error => {
        console.log(error);
      });
  }

  selectCustomer(item) {
    this.onLineAdded.emit(item);
  }

  customer_changed(event, item) {
    if (event.target.checked == true)
      item.selected = 1;
    else
      item.selected = 0;
  }

  Select() {
    this.selectedResults = [];

    for (var j = 0; j < this.searchResults.length; j++) {
      var item = this.searchResults[j];
      if (item.selected == 1) {
        this.selectedResults.push(item.idrow);
      }
    }


  }

}
