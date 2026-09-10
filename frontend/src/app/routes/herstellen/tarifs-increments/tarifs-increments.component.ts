import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HaruService } from '../../../services/haru.service';

interface TarifaItem {
  altura: number;
  pvp: number;
  c1: any;
  fecha: Date | string;
  // add other properties as needed
}

@Component({
  selector: 'app-tarifs-increments',
  templateUrl: './tarifs-increments.component.html',
  styleUrls: ['./tarifs-increments.component.css'],
  providers: [HaruService]
})
export class TarifsIncrementsComponent implements OnInit {


  cliente = "1";
  tarifa: TarifaItem[] = [];

  model = {
    cliente: 1,
    tipo: -1,
    producto: -1,
    bruto: 0
  }
  lista_clientes: any = [{ idrow: "1", descripcion: 'Leroy Merlin' }];
  lista_productos: any = [];
  lista_articulos: any = [];
  lista_colores: any = [{ idrow: 0, descripcion: 'Bruto' }, { idrow: 1, descripcion: 'Lacado' }];


  constructor(private service: HaruService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);


  }

  ngOnInit() {
    this.loadValues();
  }

  loadValues() {
    let url = "/tipo_incrementos";
    this.service.HTTP_Get(url).subscribe(
      data => {
        console.log(data.Table);
        this.lista_productos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  ChangeTipo(event) {

    let value = "";

    this.lista_productos.forEach(element => {
      if (element.idrow == this.model.tipo) {
        value = element.tabla;
      }
    });
    this.loadProductos(value);

  }

  loadProductos(tabla) {

    let url = "/producto_incrementos/" + tabla;
    this.service.HTTP_Get(url).subscribe(
      data => {
        console.log(data.Table);
        this.lista_articulos = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );

  }

  ChangeProducto(event) {

    //this.loadTable();

  }

  loadTable() {
    let values = JSON.stringify(this.model);
    this.service.HTTP_Post("/incrementos", values).subscribe(
      data => {
        console.log(data.Table);
        this.tarifa = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      }
    );
  }

  AssignItem(item) {

    if (item.pvp == "") {
      this.toaster.error("No puede dejar el precio vacio");
      return;
    }

    if (item.c1 == "") {
      this.toaster.error("No puede dejar el c1 vacio");
      return;
    }

    if (confirm("¿Desea Actualizar la linea seleccionada?")) {
      let url = "/producto_incremento_update";

      this.service.HTTP_Post(url, JSON.stringify(item)).subscribe(
        data => {

          if (data.message == "OK") {
            this.toaster.success("Actualizada la linea");
          }

          this.loadTable();
        },
        error => {
          this.toaster.error(error.message);
        }
      );
    }

  }

}
