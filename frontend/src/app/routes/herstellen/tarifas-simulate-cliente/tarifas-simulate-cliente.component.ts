import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-tarifas-simulate-cliente',
  templateUrl: './tarifas-simulate-cliente.component.html',
  styleUrls: ['./tarifas-simulate-cliente.component.css'],
  providers: [HaruService]
})
export class TarifasSimulateClienteComponent implements OnInit {

  @ViewChild('gridDetail', { static: false }) myGrid!: jqxGridComponent;
  @ViewChild('gridReference', { static: false }) myTarifa!: jqxGridComponent;
  @ViewChild('gridTiempos', { static: false }) myTiempo!: jqxGridComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;
  @ViewChild('staticModal', { static: false }) public modalKunden!: ModalDirective;
  @ViewChild('staticModalClone', { static: false }) public modalClone!: ModalDirective;
  @ViewChild('staticModalBloqueo', { static: false }) public modalBloqueo!: ModalDirective;


  private sub!: Subscription;

  model = {
    idrow: -1,
    nombreescandallo: '',
    margentej: 0,
    margenmec: 0,
    margenacc: 0,
    margencli: 0,
    tipo: -1,
    marca: -1,
    tejido: -1,
    criterio: "180",
    preciom2: 1,
    preciomon: 0.21,
    bloqueo: 0,
    Editar: false,
    bloque: 10,
    password: '',
    tipotejido: '',
    desmultiplicador: '0',
    tiposegmento: 0,
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    clientes: ''
  }

  model2 = {
    operation: '1',
    password: '',
    idrow: -1
  }

  newmodel = {
    NuevoNombre: '',
    idrow: -1
  }

  lista_accionamientos: any = null;
  lista_marcas: any = null;
  lista_tejidos: any = null;
  lista_tipotejidos: any = null;



  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'c00', type: 'number' },
      { name: 'c01', type: 'number' },
      { name: 'c02', type: 'number' },
      { name: 'c03', type: 'number' },
      { name: 'c04', type: 'number' },
      { name: 'c05', type: 'number' },
      { name: 'c06', type: 'number' },
      { name: 'c07', type: 'number' },
      { name: 'c08', type: 'number' },
      { name: 'c09', type: 'number' },
      { name: 'c10', type: 'number' },
      { name: 'c11', type: 'number' },
      { name: 'c12', type: 'number' },
      { name: 'c13', type: 'number' },
      { name: 'c14', type: 'number' },
      { name: 'c15', type: 'number' },
      { name: 'c16', type: 'number' },
      { name: 'c17', type: 'number' },
      { name: 'c18', type: 'number' },
      { name: 'c19', type: 'number' },
      { name: 'c20', type: 'number' },
      { name: 'c21', type: 'number' },
      { name: 'c22', type: 'number' },
      { name: 'c23', type: 'number' },
      { name: 'c24', type: 'number' },
      { name: 'c25', type: 'number' },
      { name: 'c26', type: 'number' },
      { name: 'c27', type: 'number' },
      { name: 'c28', type: 'number' },
      { name: 'c29', type: 'number' },
      { name: 'c30', type: 'number' },
      { name: 'c31', type: 'number' },
      { name: 'c32', type: 'number' }

    ],
    localdata: null
  };


  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 2, digits: 4, min: 0, spinButtons: false });
  }

  intValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 3, min: 0, spinButtons: false });
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }

    return '99%';
  }


  settings2: any = {
    width: this.getWidth(),
    height: 850,
    pageable: false,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '1000'],
    pagesize: 1000,
    scrollmode: 'logical',
    sortable: false,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen, 
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: false,
    filterable: false,
    columnsresize: true,
    columnsreorder: false,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter2,
    columns: [
      { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '', datafield: 'c01', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '0.40', datafield: 'c02', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.60', datafield: 'c03', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.80', datafield: 'c04', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.00', datafield: 'c05', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.20', datafield: 'c06', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.40', datafield: 'c07', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.60', datafield: 'c08', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.80', datafield: 'c09', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.00', datafield: 'c10', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.20', datafield: 'c11', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.40', datafield: 'c12', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.60', datafield: 'c13', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.80', datafield: 'c14', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.00', datafield: 'c15', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.20', datafield: 'c16', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.40', datafield: 'c17', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.60', datafield: 'c18', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.80', datafield: 'c19', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.00', datafield: 'c20', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.20', datafield: 'c21', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.40', datafield: 'c22', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.60', datafield: 'c23', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.80', datafield: 'c24', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.00', datafield: 'c25', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.20', datafield: 'c26', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.40', datafield: 'c27', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.60', datafield: 'c28', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.80', datafield: 'c29', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.00', datafield: 'c30', width: 65, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    ]

  };



  constructor(private service: HaruService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    vRef: ViewContainerRef) {

    // this.toaster.setRootViewContainerRef(vRef);


  }

  ngAfterViewInit() {
    this.myTarifa.createComponent(this.settings2);
    this.loadMaster();
  }


  ngOnInit() {

    this.sub = this.route.queryParams.subscribe(params => {
      // Defaults to 0 if no query param provided.
      this.model.idrow = +params['id'] || -1;
    });
    /*
            this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
    */
    if (this.model.idrow > 0) {
      this.loadHeader(this.model.idrow);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  Open() {
    this.modalAdd.show();
  }




  Export(grid) {
    var pathExportScript = this.service.Export();
    this.myTarifa.exportdata("xls", "tarifa", true, undefined, false, pathExportScript);
  }

  Delete() {

    if (confirm("Desea Borrar la Tarifa Actual")) {
      var values = JSON.stringify(this.model);
      this.service.HTTP_Post('/sm/tarifa_simulate_cliente_del', values).subscribe(
        data => {
          if (data.message == "OK") {
            this.toaster.success("Borrado Realizado", "ACTUALIZACION");
            this.Search();
          }
        },
        error => {
          this.toaster.error("Error en la grabación:" + error.mensaje, "ACTUALIZACION");
        }
      );
    }

  }

  Search() {
    this.router.navigate(['/routes/herstellen/tarifasimul-cli-search'], { queryParams: { id: -1 } });
  }



  loadHeader(idrow: number) {
    var route = "/tarifa_simulate_cli/" + idrow;
    this.service.HTTP_Get('/sm' + route).subscribe(
      data => {
        this.model.idrow = data.Table[0].idrow;
        this.model.nombreescandallo = data.Table[0].nombre;
        this.model.margentej = data.Table[0].margen1;
        this.model.margencli = data.Table[0].margen2;
        this.model.margenmec = data.Table[0].margen3;
        this.model.margenacc = data.Table[0].margen4;
        this.model.marca = parseInt(data.Table[0].marca);
        this.model.tipo = parseInt(data.Table[0].tipo);
        this.model.tejido = parseInt(data.Table[0].tejido);
        this.model.criterio = data.Table[0].criterio;
        this.model.preciom2 = data.Table[0].preciom2;
        this.model.preciomon = data.Table[0].preciomontaje;
        this.model.bloqueo = data.Table[0].bloqueo;
        this.model.desmultiplicador = data.Table[0].desmultiplicador;
        this.model.c1 = data.Table[0].c1;
        this.model.c2 = data.Table[0].c2;
        this.model.c3 = data.Table[0].c3;
        this.model.c4 = data.Table[0].c4;
        this.model.clientes = data.Table[0].clientes;
        this.LoadMarcas(this.model.marca);
        this.Build();
      },
      error => {
        console.log(error);
      }

    );
  }

  loadMaster() {

    this.service.HTTP_Get('/sm/accionamientos_filter').subscribe(
      data => {
        this.lista_accionamientos = data.Table;
      },
      error => {
        console.log(error);
      }
    );

    this.LoadTejidos(-1);

  }

  ChangeTipo(event) {
    this.LoadMarcas(-1);
  }

  ChangeTipoTejido(event) {

  }


  LoadMarcas(tipo) {

    let value = this.model.tipo;
    var route = "/accionamientos_tipos_filter/" + value;

    this.service.HTTP_Get('/sm' + route).subscribe(
      data => {
        this.lista_marcas = data.Table;
        this.model.marca = tipo;
      },
      error => {
        console.log(error);
      }
    );
  }



  ChangeTejido(event) {
    this.getCoste(event.target.value);
  }

  getCoste(value) {

    this.lista_tejidos.forEach(element => {

      //console.log(element);
      if (element.idrow == value) {
        this.model.preciom2 = element.coste;
        this.model.criterio = element.criterio;
      }
    });
  }


  LoadTejidos(tejido) {
    var route = "/tejidos";
    this.service.HTTP_Get('/sm' + route).subscribe(
      data => {
        this.lista_tejidos = data.Table;
        if (tejido != -1) {
          this.model.tejido = tejido;
        }
      },
      error => {
        console.log(error);
      }
    );
  }




  ReplaceLine(id) {
    const url = '/sm/tarifa_simulate_line/' + id;
    this.service.HTTP_Get(url).subscribe(
      data => {

        this.myGrid.updaterow(id, data.Table[0]);
        this.myGrid.updatebounddata();

      },
      error => {
        console.log(error);
      }
    );
  }


  cellBeginEditEvent(event: any): void {
    let args = event.args;
    //this.beginEdit.nativeElement.innerHTML = 'Event Type: cellbeginedit, Column: ' + args.datafield + ', Row: ' + (1 + args.rowindex) + ', Value: ' + args.value;
  }






  Build() {
    var idrow = this.model.idrow;
    var bloque = this.model.bloque;

    this.myTarifa.clearselection();

    var url = "/sm/tarifa_simulate_cliente_table/" + idrow + "/" + bloque;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.source2.localdata = data.Table[0];
        this.dataAdapter2.dataBind();
        this.myTarifa.updatebounddata();
      },
      error => {
        console.log(error);
      }
    );
  }

  changeTipoSegmento(value) {
    this.model.tiposegmento = value;
  }

  AddKunden() {
    this.modalKunden.show();
  }

  KundeAdded($event) {
    this.modalKunden.hide();
    alert($event);
  }

  ClonateOpen() {
    this.modalClone.show();
  }

  BloqueoOpen() {
    this.modalBloqueo.show();

    console.log(this.model.bloqueo);
    this.model2.operation = (this.model.bloqueo === 1) ? '0' : '1';
  }


  redirectTo(uri: string, params?: NavigationExtras) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri], params));
  }


  Save() {
    this.SaveValues();
  }

  /***
   * 
   */
  SaveValues() {
    var values = JSON.stringify(this.model);
    this.service.HTTP_Post('/tarifa_simulate_cliente', values).subscribe(
      data => {

        if (data.message === "OK") {
          this.model.idrow = data.idrow;
          if (this.model.idrow > 0) {
            this.loadHeader(this.model.idrow);
          }

          this.toaster.success("Actualización Realizada", "ACTUALIZACION");
        }


      },
      error => {
        this.toaster.error("Error en la grabación:" + error.mensaje, "ACTUALIZACION");
      }
    );
  }

}



