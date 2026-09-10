import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { jqxGridComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';
import { HaruService } from '../../../services/haru.service';
import { Utils } from '../../../shared/Utils';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.css'],
  providers: [HaruService]
})
export class BackupComponent implements OnInit {

  @ViewChild('gridSReference', { static: false }) mySGrid: jqxGridComponent;


  model = {
    id: 0
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' },
      { name: 'date', type: 'date' }
    ],
    url: ""
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  settings: any = {
    width: '99%',
    height: 640,
    pageable: true,
    autoheight: true,
    theme: 'bootstrap',
    pagesizeoptions: ['25', '50', '100', '500'],
    pagesize: 51,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: 'checkbox',
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapter,
    columns: [
      { text: 'id', columngroup: 'ProductDetails', datafield: 'id', width: 50, editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'name', width: 450, filtertype: 'input', editable: false },
      { text: 'Fecha', columngroup: 'ProductDetails', datafield: 'date', width: 125, editable: false, cellsalign: "center", cellsformat: "dd/MM/yyyy HH:mm:ss", }
    ]
  };

  constructor(private service: HaruService, private router: Router,
    private toaster: ToastrService, vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settings);
    this.searchDocuments();
  }

  searchDocuments() {
    this.mySGrid.clearselection();
    this.source.url = this.service.HTTP_Url_Get("/sm/backup_list");
    this.mySGrid.updatebounddata("cells");
  }

  /**
   * 
   */
  Backup() {


    if (confirm("¿Desea generar copia de seguridad de las tablas de tarifas?")) {

      const values = JSON.stringify(this.model);

      this.service.HTTP_Post('/backup_create', values).subscribe(
        data => {
          if (data.message === "OK") {
            this.toaster.success("Operación Realizada", "CREACION DE BACKUP");
            this.searchDocuments();

          }
        },
        error => {
          this.toaster.error("Operación NO realizada", "OPERACION TARIFA");
        }
      );

    }



  }

  Delete() {
    var arrayData = Utils.getSelectedRows(this.mySGrid, "id");
    if (arrayData.length == 1) {

      this.model.id = arrayData[0];

      if (confirm("¿Desea borrar la copia de seguridad seleccionada?")) {

        const values = JSON.stringify(this.model);

        this.service.HTTP_Post('/backup_delete', values).subscribe(
          data => {
            if (data.message === "OK") {
              this.toaster.success("Operación Realizada", "CREACION DE BACKUP");
              this.searchDocuments();

            }
          },
          error => {
            this.toaster.error("Operación NO realizada", "OPERACION TARIFA");
          }
        );

      }

    } else {
      alert("Debe Seleccionar al menos una linea");
    }

  }

  Recover() {
    var arrayData = Utils.getSelectedRows(this.mySGrid, "id");
    if (arrayData.length == 1) {

      this.model.id = arrayData[0];

      if (confirm("¿Desea restaurar copia de seguridad de la tarifa seleccionada?")) {

        const values = JSON.stringify(this.model);

        this.service.HTTP_Post('/backup_recover', values).subscribe(
          data => {
            if (data.message === "OK") {
              this.toaster.success("Operación Realizada", "CREACION DE BACKUP");
              this.searchDocuments();

            }
          },
          error => {
            this.toaster.error("Operación NO realizada", "OPERACION TARIFA");
          }
        );

      }
    } else {
      alert("Debe Seleccionar al menos una linea");
    }

  }

  rowSelect(event: any): void {

    /*
        var arrayData = Utils.getSelectedRows(this.mySGrid, "id");
        if (arrayData.length == 1) {
          var id = arrayData[0];
          alert(id);
        }
    */
  }



}
