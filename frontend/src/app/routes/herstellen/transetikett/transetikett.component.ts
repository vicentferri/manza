import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ViewContainerRef } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transetikett',
  templateUrl: './transetikett.component.html',
  styleUrls: ['./transetikett.component.css'],
  providers: [HaruService]
})


export class TransetikettComponent implements OnInit {

  public staticModal;

  timerValue = "";
  timerMaxValue = "";
  Tipo = '19';


  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;


  dialog = {
    nombre: "",
    albaran: "",
    email: "",
    idrow: 0,
    bultos: 0,
    peso: 0,
    volumen: 0
  }

  link = {
    url: ""
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'string' },
      { name: 'destinatario_nombre', type: 'string' },
      { name: 'destinatario_direccion', type: 'string' },
      { name: 'destinatario_numero', type: 'string' },
      { name: 'destinatario_poblacion', type: 'string' },
      { name: 'destinatario_pais', type: 'string' },
      { name: 'telefono_destinatario', type: 'string' },
      { name: 'bultos', type: 'number' },
      { name: 'tipobulto', type: 'string' },
      { name: 'peso', type: 'number' },
      { name: 'volumen', type: 'number' },
      { name: 'referencia_cliente', type: 'string' },
      { name: 'referencia_spaintir', type: 'string' },
      { name: 'valormercancia', type: 'number' },
      { name: 'strincoterm', type: 'string' },
      { name: 'trafico', type: 'string' },
      { name: 'fechasalida', type: 'date' },
      { name: 'strseguro', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'albaran', type: 'number' },
      { name: 'envio_estado', type: 'string' },
      { name: 'envio_fecha', type: 'date' },
      { name: 'envio_url', type: 'string' },
      { name: 'expedido', type: 'string' },
      { name: 'expedido_fecha', type: 'string' }
    ],
    url: ""
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });


  settings: any = {
    width: '100%',
    height: 600,
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
    groupable: true,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen,
                                    * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: true,
    showstatusbar: true,
    source: this.dataAdapter,
    columns: [
      { text: 'EXP', datafield: 'expedido', width: 50, filtertype: 'input', editable: false },
      { text: 'Fecha EXP', datafield: 'expedido_fecha', width: 150, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy HH:mm:ss' },
      { text: 'Link Envio', datafield: 'envio_url', width: 200, filtertype: 'input', editable: false },
      { text: 'id', columngroup: 'ProductDetails', datafield: 'idrow', width: 45, filtertype: 'textbox', editable: false },
      { text: 'Nombre', columngroup: 'ProductDetails', datafield: 'destinatario_nombre', width: 200, filtertype: 'input', editable: false },
      { text: 'Dirección', columngroup: 'ProductDetails', datafield: 'destinatario_direccion', width: 150, filtertype: 'input', editable: false },
      { text: 'Numero', columngroup: 'ProductDetails', datafield: 'destinatario_numero', width: 65, filtertype: 'input', editable: false, },
      { text: 'Poblacion', columngroup: 'ProductDetails', datafield: 'destinatario_poblacion', width: 125, filtertype: 'input', editable: false },
      { text: 'Pais', columngroup: 'ProductDetails', datafield: 'destinatario_pais', width: 60, filtertype: 'input', editable: false },
      { text: 'Teléfono', columngroup: 'ProductDetails', datafield: 'telefono_destinatario', width: 125, filtertype: 'input', editable: false },
      { text: 'Bultos', columngroup: 'ProductDetails', datafield: 'bultos', width: 55, filtertype: 'input', editable: false, cellsalign: 'center' },
      { text: 'Tipo', columngroup: 'ProductDetails', datafield: 'tipobulto', width: 60, filtertype: 'input', editable: false },
      { text: 'Peso', columngroup: 'ProductDetails', datafield: 'peso', width: 55, filtertype: 'input', editable: false, cellsalign: 'right', cellsformat: 'D2' },
      { text: 'Volumen', columngroup: 'ProductDetails', datafield: 'volumen', width: 55, filtertype: 'input', editable: false, cellsalign: 'right', cellsformat: 'D2' },
      { text: 'ref', columngroup: 'ProductDetails', datafield: 'referencia_cliente', width: 150, filtertype: 'input', editable: false },
      { text: 'rep_st', columngroup: 'ProductDetails', datafield: 'referencia_spaintir', width: 150, filtertype: 'input', editable: false },
      { text: 'Valor', columngroup: 'ProductDetails', datafield: 'valormercancia', width: 50, filtertype: 'input', editable: false, cellsalign: 'right', cellsformat: 'D2' },
      { text: 'Inc', columngroup: 'ProductDetails', datafield: 'strincoterm', width: 50, filtertype: 'input', editable: false },
      { text: 'Traf', columngroup: 'ProductDetails', datafield: 'trafico', width: 50, filtertype: 'input', editable: false },
      { text: 'Salida', columngroup: 'ProductDetails', datafield: 'fechasalida', width: 85, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy' },
      { text: 'Seguro', columngroup: 'ProductDetails', datafield: 'strseguro', width: 50, filtertype: 'input', editable: false },
      { text: 'email', columngroup: 'ProductDetails', datafield: 'email', width: 200, filtertype: 'input', editable: false },
      { text: 'Estado Envio', datafield: 'envio_estado', width: 100, filtertype: 'input', editable: false },
      { text: 'Fecha Envio', datafield: 'envio_fecha', width: 150, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy HH:mm:ss' }

    ]

  };

  constructor(private service: HaruService,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);

    this.search();

  }

  setTipo(tipo) {
    this.Tipo = tipo;
    this.search();
  }

  search() {
    var trans = this.Tipo;
    this.source.url = this.service.Transport_Search(trans);
    this.myGrid.updatebounddata("cells");
    this.myGrid.clearselection();
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string): any[] {

    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData: any[] = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];

      if (field == "") {
        arrayData.push(row);
      }
      else {
        arrayData.push(row[field]);
      }
    }
    return arrayData;
  }


  downloadFile(data: any) {
    var blob = new Blob([data], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    window.open(url);
  }

  exportData() {

    var trans = this.Tipo;
    var arrayData: any[] = [];
    var arrayNames: any[] = [];

    if (confirm("Quiere obtener el fichero de Transporte?")) {
      arrayData = this.getSelectedRows(this.myGrid, "albaran");
      arrayNames = this.getSelectedRows(this.myGrid, "referencia_cliente");
      if (arrayData.length > 0) {
        var name = arrayNames.join("_");
        var ids = arrayData.join(",");

        if (trans == "19") {
          var url = this.service.Transport_AZKAR_URL(ids, trans, name);
          this.toaster.success('Exportado el Fichero', 'Exportación');
          window.open(url);
          this.myGrid.clearselection();
        }

        if (trans == "17") {
          var url = this.service.Transport_PALIBEX_URL(ids, trans, name);
          this.toaster.success('Exportado el Fichero', 'Exportación');
          window.open(url);
          this.myGrid.clearselection();
        }

        if (trans == "15") {
          var url = this.service.Transport_SpainTIR_URL(ids, trans, name);
          this.toaster.success('Exportado el Fichero', 'Exportación');
          window.open(url);
          this.myGrid.clearselection();
        }
      }
      else {
        alert("No ha seleccionado ninguna linea")
      }
    }
  }

  Expedicion(value: number) {
    var arrayNames: any[] = [];
    arrayNames = this.getSelectedRows(this.myGrid, "albaran");


    if (value == 0) {
      if (confirm("¿Marcar como Pendiente la expedición seleccionada?")) {
        var route = "/transport_signal_off/" + arrayNames[0];
        this.service.HTTP_Get('/sm' + route).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success('Marcado como Pendiente', 'Expedición');
              this.search();
            }
          },
          error => {
            console.log(error);
          }
        );
      }
    }

    if (value == 1) {
      if (confirm("¿Desea expedir la expedición seleccionada?")) {
        var route = "/transport_signal/" + arrayNames[0];
        console.log(route);
        this.service.HTTP_Get('/sm' + route).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success('Expedición Expedida', 'Expedición');
              this.search();
            }
          },
          error => {
            console.log(error);
          }
        );
      }
    }

  }


  Edit() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "");
    if (arrayData.length > 0) {
      this.dialog.idrow = arrayData[0].idrow;
      this.dialog.bultos = arrayData[0].bultos;
      this.dialog.peso = arrayData[0].peso;
      this.dialog.volumen = arrayData[0].volumen;
      this.dialog.nombre = arrayData[0].destinatario_nombre;
      this.dialog.albaran = arrayData[0].referencia_cliente;
      this.dialog.email = arrayData[0].email;


    } else {
      alert("No ha seleccionado ninguna linea")
    }
  }

  Update() {

    this.service.Transport_SpanTIR_Update(this.dialog.idrow, this.dialog.bultos, this.dialog.peso, this.dialog.volumen).subscribe(
      data => {
        this.search();
      },
      error => {
        console.log(error);
      });

  }


}
