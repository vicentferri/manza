import { Component, OnInit, ViewChild } from '@angular/core';
import { jqxGridComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HaruService } from '../../../services/haru.service';
import { Utils } from '../../../shared/Utils';

@Component({
  selector: 'app-stoffesgruppe',
  templateUrl: './stoffesgruppe.component.html',
  styleUrls: ['./stoffesgruppe.component.css'],
  providers: [HaruService]
})
export class StoffesgruppeComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalAsignar', { static: false }) modalAsignar!: ModalDirective;

  // Grupo que se está creando (idrow = 0) o editando en el modal de grupos
  model = {
    idrow: 0,
    grupo: '',
    descripcion: '',
    criterio: '180',
    precio: 0
  }

  // Asignación de tejidos seleccionados a un grupo
  asignar = {
    idgrupo: 0,
    ids: '',
    total: 0,
    conOtroGrupo: 0
  }

  grupos: any[] = [];

  lista_criterios: any = null;
  lista_criterios_enrollables: any =
    [{ id: "89", name: "89" }, { id: "127", name: "127" }, { id: "180", name: "180" }, { id: "140", name: "140" }, { id: "200", name: "200" },
    { id: "240", name: "240" }, { id: "250", name: "250" }, { id: "280", name: "280" }, { id: "300", name: "300" }, { id: "320", name: "320" }, { id: "350", name: "350" }];

  lista_criterios_verticales: any =
    [{ id: "89", name: "89" }, { id: "127", name: "127" }];


  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'number' },
      { name: 'descripcion', type: 'string' },
      { name: 'idgrupo', type: 'number' },
      { name: 'grupo', type: 'string' },
      { name: 'grupo_descripcion', type: 'string' },
      { name: 'precio', type: 'number' },
      { name: 'criterio', type: 'number' }
    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  settings: any = {
    width: '99%',
    height: '99%',
    pageable: true,
    autoheight: false,
    theme: 'bootstrap',
    pagesizeoptions: ['50', '100', '500'],
    pagesize: 500,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: true,
    source: this.dataAdapter,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 70, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Tejido', datafield: 'descripcion', filtertype: 'textbox', editable: false },
      { text: 'Grupo', datafield: 'grupo', width: 80, filtertype: 'checkedlist', editable: false, cellsalign: 'center' },
      { text: 'Descripción grupo', datafield: 'grupo_descripcion', width: 180, filtertype: 'textbox', editable: false },
      { text: 'Precio', datafield: 'precio', width: 90, filtertype: 'textbox', editable: false, cellsalign: 'center' },
      { text: 'Criterio', datafield: 'criterio', width: 90, filtertype: 'checkedlist', editable: false, cellsalign: 'center' },
    ]
  };

  constructor(private service: HaruService) { }

  ngOnInit() {
    this.LoadGrupos();
    this.lista_criterios = this.lista_criterios_enrollables;
  }

  /*
  */
  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.LoadTejidos();
  }

  /*
  */
  LoadGrupos() {
    this.service.HTTP_Get("/sm/grupos").subscribe(
      data => {
        this.grupos = data.Table;
      },
      error => {
        console.error(error);
      }
    );
  }

  LoadTejidos() {
    this.service.HTTP_Get("/sm/tejidos_grupos_all").subscribe(
      data => {
        this.source.localdata = data.Table;
        this.dataAdapter.dataBind();
        this.myGrid.updatebounddata();
      },
      error => {
        console.error(error);
      }
    );
  }

  Recargar() {
    this.LoadGrupos();
    this.LoadTejidos();
    this.myGrid.clearselection();
  }

  /* ---------- Grupos ---------- */

  AddGrupo() {
    this.SelectGrupo(0);
    this.modalAdd.show();
  }

  // Abre el modal con el grupo de la fila seleccionada (si hay una sola)
  EditGrupo() {
    let rows = Utils.getSelectedRows(this.myGrid, "");
    let idgrupo = (rows.length == 1 && rows[0].idgrupo) ? rows[0].idgrupo : 0;
    this.SelectGrupo(idgrupo);
    this.modalAdd.show();
  }

  SelectGrupo(idrow: any) {
    let g = this.grupos.find(x => x.idrow == idrow);
    if (g) {
      this.model.idrow = g.idrow;
      this.model.grupo = g.grupo;
      this.model.descripcion = g.descripcion;
      this.model.precio = g.precio;
      this.model.criterio = String(g.criterio);
    } else {
      this.model.idrow = 0;
      this.model.criterio = "180";
      this.model.descripcion = "";
      this.model.grupo = "";
      this.model.precio = 0;
    }
  }

  Update() {
    let msg = this.model.idrow == 0 ? "¿Desea agregar el grupo de tejido?" : "¿Desea guardar los cambios del grupo de tejido?";
    if (confirm(msg)) {

      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/sm/grupos", values).subscribe(
        data => {
          if (data.message == "OK") {
            this.modalAdd.hide();
            this.Recargar();
          }
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  DelGrupo() {
    if (this.model.idrow == 0) {
      return;
    }

    if (confirm("¿Desea borrar el grupo de tejido " + this.model.descripcion + "?")) {

      let values = JSON.stringify(this.model);
      this.service.HTTP_Post("/sm/grupos_del", values).subscribe(
        data => {
          if (data.message == "OK") {
            this.modalAdd.hide();
            this.Recargar();
          }
        },
        error => {
          console.error(error);
        });
    }
  }

  /* ---------- Tejidos del grupo ---------- */

  AsignarTejidos() {
    let rows = Utils.getSelectedRows(this.myGrid, "");
    if (rows.length == 0) {
      alert("Debe seleccionar al menos un tejido");
      return;
    }

    this.asignar.ids = rows.map(r => r.idrow).join(",");
    this.asignar.total = rows.length;
    this.asignar.conOtroGrupo = rows.filter(r => r.idgrupo).length;
    this.asignar.idgrupo = 0;
    this.modalAsignar.show();
  }

  UpdateAsignar() {
    if (!this.asignar.idgrupo) {
      alert("Debe seleccionar un grupo");
      return;
    }

    let values = JSON.stringify({ idgrupo: this.asignar.idgrupo, ids: this.asignar.ids });
    this.service.HTTP_Post("/sm/tejidosgrupos_asignar", values).subscribe(
      data => {
        if (data.message == "OK") {
          this.modalAsignar.hide();
          this.Recargar();
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  QuitarTejidos() {
    let rows = Utils.getSelectedRows(this.myGrid, "").filter(r => r.idgrupo);
    if (rows.length == 0) {
      alert("Debe seleccionar al menos un tejido que pertenezca a un grupo");
      return;
    }

    if (confirm("¿Desea quitar " + rows.length + " tejido(s) de su grupo?")) {

      let values = JSON.stringify({ ids: rows.map(r => r.idrow).join(",") });
      this.service.HTTP_Post("/sm/tejidosgrupos_quitar", values).subscribe(
        data => {
          if (data.message == "OK") {
            this.Recargar();
          }
        },
        error => {
          console.error(error);
        }
      );
    }
  }

}
