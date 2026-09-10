import { Component, OnInit, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-artikeln-fab-cd',
  templateUrl: './artikeln-fab-cd.component.html',
  styleUrls: ['./artikeln-fab-cd.component.css'],
  providers: [HaruService]
})
export class ArtikelnFabCdComponent implements OnInit {

  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;

  articulos_tipo: any = [];
  details_tipo: any = [];
  campos1_tipo: any = [];
  campos2_tipo: any = [];
  temporal: any = [];

  model = {
    idrow: -1,
    tipo: -1,
    tipo_value: '',
    campo1: '',
    campo2: '',
    campo1_value: '',
    campo2_value: '',
    campo1_value_descripcion: '',
    campo2_value_descripcion: '',
    campo1_show: true,
    campo2_show: true,
    articles: ''
  }

  newmodel = {
    propiedad: ''
  }

  newatributo = {
    atributo: '',
    valor: ''
  }

  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {

    this.model.campo1_show = false;
    this.model.campo2_show = false;
    this.ChangeTipo(1);
  }



  loadCampo1(url) {
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.temporal = data.Table;
        this.campos1_tipo = [];
        this.campos1_tipo.push({ idrow: -1, descripcion: 'Seleccionar...' });
        this.temporal.forEach(element => {

          var id = element.idrow;
          var descripcion = element.descripcion;

          this.campos1_tipo.push({ idrow: id, descripcion: descripcion });
          this.model.campo1_show = true;
        });
        this.model.campo1_value = '-1';
      },
      error => {
        this.toaster.error(error.message);
      });
  }



  loadDetails() {
    this.details_tipo = [];

    var tipo = this.model.campo1_value;
    var route = "/sm/cd_articulos/" + tipo;
    this.service.HTTP_Get(route).subscribe(
      data => {
        this.details_tipo = data.Table;
      },
      error => {
        this.toaster.error(error.message);
      });
  }

  DelItem(item) {

    if (confirm("¿Desea borrar la línea registrada?")) {
      var idrow = item.idrow;

      var nmodel = {
        idrow: idrow
      }

      var values = JSON.stringify(nmodel);
      var route = "/cd_articulo_delete";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            //this.ChangeTipo(1);
            this.loadDetails();
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    }

  }

  /*
  DelAtributo() {
    let idrow = this.model.campo1_value;
    console.log(idrow);
    if (confirm("¿Desea borrar el atributo indicado?")) {

      var nmodel = {
        idrow: this.model.campo1_value
      }

      var values = JSON.stringify(nmodel);
      var route = "/cd_atributo_delete";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.ChangeTipo(1);
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    }
  }
  */

  EditItem(item) {

    if (confirm("¿Desea actualizar la línea registrada?")) {

      var nmodel = {
        idrow: item.idrow,
        value: item.valor
      }

      var values = JSON.stringify(nmodel);
      var route = "/cd_articulo_update";
      this.service.HTTP_Post(route, values).subscribe(
        data => {
          if (data.message == 'OK') {
            this.loadDetails();
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    }

  }

  Update() {

    var rows = this.search.getRows();
    this.model.articles = rows.join(',');
    this.modalAdd.hide();


    var values = JSON.stringify(this.model);
    var route = "/cd_articulo_assign/";
    this.service.HTTP_Post(route, values).subscribe(
      data => {
        if (data.message == 'OK') {
          this.loadDetails();
          this.search.clear();
        }
      },
      error => {
        this.toaster.error(error.message);
      });

  }




  ChangeTipo(value) {

    this.model.tipo = value;
    this.model.campo1_show = false;
    this.model.campo2_show = false;


    this.model.campo1 = "Atributos Registrados";
    this.model.tipo_value = "Atributos";
    this.loadCampo1('/sm/cd_articulos_ddl');


  }

  AssignItem(item) {
    this.model.idrow = item.idrow;
    this.modalAdd.show();
  }

  ChangeValue1(value) {

    this.model.tipo = value;

    this.loadDetails();

    this.campos1_tipo.forEach(element => {
      if (value == element.idrow) {
        this.model.campo1_value_descripcion = element.descripcion;
      }
    });


  }

  AddAtributo() {
    if (confirm("¿Desea agregar el nuevo atributo?")) {

      let perform = 1;

      if (this.newatributo.atributo == "") {
        perform = 0;
        alert("Debe Indicar el nombre del Atributo");
      }

      if (perform == 1) {

        let values = {
          id: 0,
          atributo: this.newatributo.atributo,
          valor: this.newatributo.valor
        }

        let svalues = JSON.stringify(values);

        let url = "/cd_model_atributes_new";
        this.service.HTTP_Post(url, svalues).subscribe(
          data => {
            //this.newmodel.propiedad = "";
            //this.loadDetails();
            this.newatributo.atributo = "";
            this.newatributo.valor = "";
            this.ChangeTipo(1);
          },
          error => {
            this.toaster.error(error.message);
          }
        );

      }
    }
  }

  AddItem() {
    if (confirm("¿Desea agregar la propiedad?")) {

      let perform = 1;

      if (this.newmodel.propiedad == "") {
        perform = 0;
        alert("Debe Indicar la propiedad");
      }

      if (perform == 1) {

        let values = {
          id: 0,
          atributo: this.model.campo1_value,
          valor: this.newmodel.propiedad
        }

        let svalues = JSON.stringify(values);

        let url = "/cd_model_atributes_add";
        this.service.HTTP_Post(url, svalues).subscribe(
          data => {
            this.newmodel.propiedad = "";

            this.loadDetails();
          },
          error => {
            this.toaster.error(error.message);
          }
        );

      }
    }
  }


}

