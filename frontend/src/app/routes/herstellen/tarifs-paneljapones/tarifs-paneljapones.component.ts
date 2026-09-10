import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HaruService } from '../../../services/haru.service';

@Component({
  selector: 'app-tarifs-paneljapones',
  templateUrl: './tarifs-paneljapones.component.html',
  styleUrls: ['./tarifs-paneljapones.component.css'],
  providers: [HaruService]
})
export class TarifsPaneljaponesComponent implements OnInit {

  cliente = "1";
  tarifa = [];

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
    let url = "/japones_tarifa_cliente/" + this.cliente;
    this.service.HTTP_Get(url).subscribe(
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
      let url = "/japones_tarifa_cliente";

      this.service.HTTP_Post(url, JSON.stringify(item)).subscribe(
        data => {

          if (data.message == "OK") {
            this.toaster.success("Actualizada la linea");
          }

          this.loadValues();
        },
        error => {
          this.toaster.error(error.message);
        }
      );
    }

  }

}
