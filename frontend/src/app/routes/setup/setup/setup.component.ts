import { Component, OnInit } from '@angular/core';
import {HaruModalService} from '../../../services/harumodal.service';
import {HaruService} from '../../../services/haru.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css'],
  providers : [HaruService]
})
export class SetupComponent implements OnInit {

  firmaID = '000';
  NuevoPrecio = 0;

  constructor(private modalService: HaruModalService,
              private service : HaruService) {


              }

  ngOnInit() {
        this.firmaID = environment.firmaID;
  }

  openModal(id: string){
        this.modalService.open(id);
    }

    closeModal(id: string){
        this.modalService.close(id);
    }

  ActualizacionTarifa() {

    if (confirm("¿Desea generar la Actualización del precio de tarifas?")) {
      this.service.HTTP_Get("/procesos_cambiar_precios_tarifas").subscribe(
        data => {
          console.log(data);

          if (data.message == "OK") {

            alert("Actualización Realizada");
          }
        },
        error => {
          console.log(error);
        });
    }
  }

  ActualizacionTarifa2() {

    let model = {
      preciomontaje: this.NuevoPrecio
    }
    let values = JSON.stringify(model);

    if (confirm("¿Desea generar la Actualización del precio de montajes tarifas?")) {
      this.service.HTTP_Post("/procesos_cambiar_precios_montaje_tarifas", values).subscribe(
        data => {
          if (data.message == "OK") {

            alert("Actualización Precio Montaje Realizada");
          }
        },
        error => {
          console.log(error);
        });
    }

  }

}
