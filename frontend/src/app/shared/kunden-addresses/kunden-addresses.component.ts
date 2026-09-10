import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { jqxGridComponent } from '../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'kunden-addresses',
  templateUrl: './kunden-addresses.component.html',
  styleUrls: ['./kunden-addresses.component.css'],
  providers: [HaruService]
})
export class KundenAddressesComponent implements OnInit {

  @Input() kunde!: number;
  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('staticModalConf', { static: false }) public modal!: ModalDirective;

  doc_presupuestos: any = [];
  doc_pedidos: any = [];
  doc_albaranes: any = [];
  doc_facturas: any = [];

  conf = {
    presupuestos_email: '',
    presupuestos_tipo: -1,
    presupuestos_ope: false,
    pedidos_email: '',
    pedidos_tipo: -1,
    pedidos_ope: false,
    albaranes_email: '',
    albaranes_tipo: -1,
    albaranes_ope: false,
    facturas_email: '',
    facturas_tipo: -1,
    facturas_ope: false
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'integer' },
      { name: 'correo', type: 'integer' },
      { name: 'entrega', type: 'integer' },
      { name: 'nombre', type: 'string' },
      { name: 'domicilio', type: 'string' },
      { name: 'cp', type: 'string' },
      { name: 'poblacion', type: 'string' },
      { name: 'provincia', type: 'string' },
      { name: 'descripcion', type: 'string' },
      { name: 'email_1', type: 'string' }
    ],
    url: ""
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  settings: any = {
    width: '99%',
    height: '99%',
    pageable: true,
    autoheight: false,
    theme: 'glacier',
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
    showtoolbar: false,
    showstatusbar: true,
    showaggregates: true,
    showgroupaggregates: true,
    source: this.dataAdapter,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 65, editable: false, filtertype: 'textbox' },
      { text: 'correo', datafield: 'correo', width: 50, editable: false, filtertype: 'textbox' },
      { text: 'entrega', datafield: 'entrega', width: 50, editable: false, filtertype: 'textbox' },
      { text: 'Nombre', datafield: 'nombre', width: 200, editable: false, filtertype: 'textbox' },
      { text: 'Domicilio', datafield: 'domicilio', width: 200, editable: false, filtertype: 'textbox' },
      { text: 'Email', datafield: 'email_1', width: 100, editable: false, filtertype: 'textbox' },
      { text: 'cp', datafield: 'cp', width: 100, editable: false, filtertype: 'textbox' },
      { text: 'poblacion', datafield: 'poblacion', width: 250, editable: false, filtertype: 'textbox' },
      { text: 'provincia', datafield: 'provincia', width: 200, editable: false, filtertype: 'textbox' },
      { text: 'Pais', datafield: 'descripcion', width: 150, editable: false, filtertype: 'textbox' }
    ]
  };

  constructor(private service: HaruService) { }

  ngOnInit() {
    this.load_Documentos();
  }

  ngAfterViewInit() {
    this.myGrid.createComponent(this.settings);
    this.refresh();

  }

  Bindingcomplete(event) {

  }

  Export() {
    var pathExportScript = this.service.Export();
    this.myGrid.exportdata("xls", "export", true, undefined, false, pathExportScript);

  }

  load_Documentos() {
    this.load_Documentos_Presupuestos();
    this.load_Documentos_Pedidos();
    this.load_Documentos_Albaranes();
    this.load_Documentos_Facturas();
  }

  load_Documentos_Presupuestos() {
    this.service.HTTP_Get("/documentos_impresion/pre").subscribe(
      data => {
        this.doc_presupuestos = data.Table;
      },
      error => {

      });
  }

  load_Documentos_Pedidos() {
    this.service.HTTP_Get("/documentos_impresion/pc").subscribe(
      data => {
        this.doc_pedidos = data.Table;
      },
      error => {

      });
  }

  load_Documentos_Albaranes() {
    this.service.HTTP_Get("/documentos_impresion/alv").subscribe(
      data => {
        this.doc_albaranes = data.Table;
      },
      error => {

      });
  }

  load_Documentos_Facturas() {
    this.service.HTTP_Get("/documentos_impresion/fa").subscribe(
      data => {
        this.doc_facturas = data.Table;
      },
      error => {

      });
  }




  refresh() {

    var route = "/clientes_addresses/" + this.kunde;
    this.source.url = this.service.HTTP_Url_Get('/sm' + route);
    this.myGrid.updatebounddata("cells");

  }


  Edit_ConfEntrega(values) {
    this.modal.show();
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string) {
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


  Update() {

  }

  Select() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid, "idrow");
    var len = arrayData.length;
    if (len == 0) {
      alert("No ha seleccionado ninguna linea");
    }
    else {
      this.Edit_ConfEntrega(arrayData);
    }
  }

}
