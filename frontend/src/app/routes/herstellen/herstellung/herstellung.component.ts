import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { jqxGridComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { Subscription } from 'rxjs';
import { HaruService } from '../../../services/haru.service';
import { SearchArtikelComponent } from '../../../shared/search-artikel/search-artikel.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-herstellung',
  templateUrl: './herstellung.component.html',
  styleUrls: ['./herstellung.component.css'],
  providers: [HaruService]
})
export class HerstellungComponent implements OnInit {

  //@ViewChild("gridDetail") gridDetail: jqxGridComponent;
  @ViewChild("gridLines", { static: false }) gridLines!: jqxGridComponent;
  @ViewChild('SearchArtikel', { static: false }) search!: SearchArtikelComponent;
  @ViewChild('staticModalAdd', { static: false }) modalAdd!: ModalDirective;
  @ViewChild('staticModalEdit', { static: false }) modalEdit!: ModalDirective;

  public selectedItem: any = [];
  private sub!: Subscription;

  nestedGrid: any[] = [];
  nestedInstances: any[] = [];

  rowdetailstemplate: any = {
    rowdetails: '<div id="nestedGrid" style="margin-left:28px"></div>',
    rowdetailsheight: 800,
    rowdetailshidden: true
  }

  initRowDetail = (index: number, parentElement: any, gridElement: any, record: any): void => {

    let id = record.id.toString();
    let nestedGridContainer = parentElement.children[0];
    this.nestedGrid[index] = nestedGridContainer;

    let url = "/sm/detail_id/" + this.model.idrow + "/" + this.model.cliente + "/" + id;
    this.service.HTTP_Get(url).subscribe(
      (data) => {

        let itemsource = {
          type: "GET",
          datatype: "json",
          datafields: [
            { name: "id", type: "int" },
            { name: "idpedido", type: "int" },
            { name: "orden", type: "int" },
            { name: "articulo", type: "int" },
            { name: "descripcion", type: "string" },
            { name: "cantidad", type: "int" },
            { name: "unidad", type: "int" },
            { name: "descunidad", type: "string" },
            { name: "ubicacion", type: "string" },
            { name: "consumo", type: "number" },
            { name: "cod_sol", type: "string" },
            { name: "fam_sol", type: "string" },
          ],
          localdata: data.Table
        };

        let nestedGridAdapter = new jqx.dataAdapter(itemsource);
        if (nestedGridContainer != null) {
          let settings = {
            theme: 'glacier',
            width: '92%',
            height: '95%',
            editable: false,
            selectionmode: "checkbox",
            enablebrowserselection: true,
            source: nestedGridAdapter,
            columns: [
              {
                text: "id",
                datafield: "id",
                width: 90,
                filtertype: "textbox",
                editable: false,
              },
              {
                text: "Orden",
                datafield: "orden",
                width: 70,
                filtertype: "textbox",
                editable: false,
                cellsalign: "center",
              },
              {
                text: "Pos",
                datafield: "idpedido",
                width: 60,
                filtertype: "textbox",
                editable: false,
                cellsalign: "center",
              },
              {
                text: "art",
                datafield: "articulo",
                width: 70,
                filtertype: "textbox",
                editable: false,
              },
              {
                text: "Descripcion",
                datafield: "descripcion",
                width: 500,
                filtertype: "textbox",
                editable: false,
              },
              {
                text: "Cantidad",
                datafield: "cantidad",
                width: 80,
                filtertype: "input",
                editable: true,
                cellsalign: "center",
              },
              {
                text: "Unidad",
                datafield: "descunidad",
                width: 85,
                filtertype: "textbox",
                editable: false,
                cellsalign: "center",
              },
              {
                text: "Ubicación",
                datafield: "ubicacion",
                width: 90,
                filtertype: "textbox",
                editable: false,
                cellsalign: "center",
              },
              {
                text: "Consumo",
                datafield: "consumo",
                width: 80,
                filtertype: "input",
                editable: true,
                cellsalign: "center",
                cellsformat: "d2",
              },
              {
                text: "Cod_Sol",
                datafield: "cod_sol",
                width: 85,
                filtertype: "input",
                editable: false,
                cellsalign: "center",
              },
              {
                text: "Fam_Sol",
                datafield: "fam_sol",
                width: 85,
                filtertype: "input",
                editable: false,
                cellsalign: "center",
              },
            ]
          };
          let instance = jqwidgets.createInstance(`#${nestedGridContainer.id}`, 'jqxGrid', settings);
          if (instance != null) {

            //instance.onCellendedit = this.cellEndEditEvent(event);
            //console.log(instance);
            /*
            instance.cellBeginEditEvent = this.cellBeginEditEvent(event);
            instance.onCellbeginedit = this.cellBeginEditEvent(event);
            instance.onRowclick = this.RowClick(event);
            */
          }
          this.nestedInstances[index] = instance;
        }
      },
      (error) => {
        this.toaster.error(error.message);
      }
    );
  }

  /*
  */
  SubLinesDelete() {
    let ids: any[] = [];
    this.nestedInstances.forEach(element => {
      var arrayData: any[] = [];
      arrayData = this.getSelectedRows(element, "id");
      if (arrayData.length > 0)
        ids.push(arrayData.join(","));
    });
    return ids;
  }

  SubLinesEdit() {
    let arrayData = [];
    this.nestedInstances.forEach(element => {
      arrayData = this.getSelectedRows(element, "");
    });
    return arrayData;
  }


  model = {
    idrow: 0,
    cliente: 0
  }

  sourceLines = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "id", type: "int" },
      { name: "articulo", type: "int" },
      { name: "cost", type: "number" },
      { name: "cantidad", type: "int" },
      { name: "ancho", type: "number" },
      { name: "alto", type: "number" },
      { name: "referencia", type: "string" },
      { name: "_referencia_impresion", type: "string" },
      { name: "observaciones", type: "string" },
      { name: "fecha", type: "string" },
      { name: "cliente", type: "string" },
      { name: "entrega", type: "string" }
    ],
    localdata: null
  }

  sourceDet = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: "id", type: "int" },
      { name: "idpedido", type: "int" },
      { name: "orden", type: "int" },
      { name: "articulo", type: "int" },
      { name: "descripcion", type: "string" },
      { name: "cantidad", type: "int" },
      { name: "unidad", type: "int" },
      { name: "descunidad", type: "string" },
      { name: "ubicacion", type: "string" },
      { name: "consumo", type: "number" },
      { name: "cod_sol", type: "string" },
      { name: "fam_sol", type: "string" },
    ],
    localdata: null,
  };

  dataAdapterDet = new $.jqx.dataAdapter(this.sourceDet, {
    contentType: "application/json; charset=utf-8",
  });

  dataAdapterLines = new $.jqx.dataAdapter(this.sourceLines, {
    contentType: "application/json; charset=utf-8",
  });

  settingsDet: any = {
    width: "100%",
    height: 800,
    pageable: true,
    autoheight: false,
    theme: "glacier",
    pagesizeoptions: ["50", "100", "500"],
    pagesize: 500,
    scrollmode: "logical",
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: "checkbox",
    /* wir haben hier verschiedene Optionen,
     * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/ showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterDet,
    columns: [
      {
        text: "id",
        datafield: "id",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Orden",
        datafield: "orden",
        width: 70,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Pos",
        datafield: "idpedido",
        width: 60,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "art",
        datafield: "articulo",
        width: 70,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Descripcion",
        datafield: "descripcion",
        width: 500,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Cantidad",
        datafield: "cantidad",
        width: 80,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Unidad",
        datafield: "descunidad",
        width: 85,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Ubicación",
        datafield: "ubicacion",
        width: 90,
        filtertype: "textbox",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Consumo",
        datafield: "consumo",
        width: 80,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
        cellsformat: "d2",
      },
      {
        text: "Cod_Sol",
        datafield: "cod_sol",
        width: 85,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
      },
      {
        text: "Fam_Sol",
        datafield: "fam_sol",
        width: 85,
        filtertype: "input",
        editable: false,
        cellsalign: "center",
      },
    ],
  };

  settingsLines: any = {
    width: "100%",
    height: 800,
    pageable: true,
    autoheight: false,
    theme: "glacier",
    pagesizeoptions: ["50", "100", "500"],
    pagesize: 500,
    scrollmode: "logical",
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: true,
    selectionmode: "checkbox",
    /* wir haben hier verschiedene Optionen,
     * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/ showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    source: this.dataAdapterLines,
    columns: [
      {
        text: "id",
        datafield: "id",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Fecha",
        datafield: "fecha",
        width: 110,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Articulo",
        datafield: "articulo",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Cantidad",
        datafield: "cantidad",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Coste",
        datafield: "cost",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Ancho",
        datafield: "ancho",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Alto",
        datafield: "alto",
        width: 90,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Referencia",
        datafield: "referencia",
        width: 200,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Observaciones",
        datafield: "observaciones",
        width: 200,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Impresión",
        datafield: "_referencia_impresion",
        width: 200,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Cliente",
        datafield: "cliente",
        width: 200,
        filtertype: "textbox",
        editable: false,
      },
      {
        text: "Entrega",
        datafield: "entrega",
        width: 200,
        filtertype: "textbox",
        editable: false,
      },
    ]
  }

  constructor(
    private service: HaruService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    vRef: ViewContainerRef,
  ) {
    // this.toaster.setRootViewContainerRef(vRef);
  }

  ngOnInit() {

    this.sub = this.route.queryParams.subscribe(params => {
      this.model.idrow = +params['id'];
      this.model.cliente = +params['cli'];
      this.loadHeader();
    });
  }

  ngAfterViewInit() {
    this.gridLines.createComponent(this.settingsLines);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadHeader() {
    let url = "/bestellung_get/" + this.model.idrow + "/" + this.model.cliente;
    this.service.HTTP_Get(url).subscribe(
      (data) => {

        this.loadLines();

      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  loadLines() {
    let url = "/bestellung_lines_get/" + this.model.idrow + "/" + this.model.cliente;
    this.service.HTTP_Get(url).subscribe(
      (data) => {

        if (data.Table.length > 0) {
          this.sourceLines.localdata = data.Table;
          this.dataAdapterLines.dataBind();
          this.gridLines.updatebounddata();
          this.gridLines.showrowdetails(0);
        }

      },
      (error) => { this.toaster.error(error.message); }
    );
  }


  /*
    loadData(force) {
      let url = "/detail/" + this.model.idrow + "/" + this.model.cliente + "/" + force;
      this.service.HTTP_Get(url).subscribe(
        (data) => {
          if (data.Table.length > 0) {
            this.sourceDet.localdata = data.Table;
            this.dataAdapterDet.dataBind();
            this.gridDetail.updatebounddata();
          }
        },
        (error) => { this.toaster.error(error.message); }
      );
    }
    */

  Open() {
    this.modalAdd.show();
  }

  Rebuild() {
    if (confirm("¿Desea Reconstruir la Hoja de Fabricación?")) {
      //this.loadData(1);
    }
  }

  HojaFabricacion() {
    let url = "/export_csv/" + this.model.idrow + "/" + this.model.cliente;
    url = this.service.HTTP_Url_Get(url);
    window.open(url);
  }

  Setzustand(idrow, value, cliente) {
    var tag = {
      idrow: idrow,
      estado: value,
      cliente: cliente,
    };

    var values = JSON.stringify(tag);
    this.service.HTTP_Post("/bestellung_zustand", values).subscribe(
      (data) => {
        this.toaster.success("Actualizado el estado");
      },
      (error) => { this.toaster.error(error.message); }
    );
  }

  IniciarFabricacion() {
    if (confirm("¿Desea Iniciar la Fabricación de la orden seleccionada?")) {
      this.Setzustand(this.model.idrow, 500, this.model.cliente);
    }
  }

  DetenerFabricacion() {
    if (confirm("¿Desea Detener la Fabricación de la orden seleccionada?")) {
      this.Setzustand(this.model.idrow, 0, this.model.cliente);

    }
  }

  getSelectedRows(myGrid: jqxGridComponent, field: string) {
    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData = [];
    for (var i = 0; i < rowsSelected.length; i++) {
      var index = rowsSelected[i];
      var row = info[index.valueOf()];
      if (field == "") arrayData.push(row);
      else arrayData.push(row[field]);
    }
    return arrayData;
  }

  /*
  */
  Borrar() {

    var ids = this.SubLinesDelete();
    if (ids.length > 0) {
      if (confirm("¿Desea eliminar la selección?")) {

        let model = {
          idrow: 0,
          cliente: this.model.cliente,
          articles: ids.join(","),
          operation: 0
        }

        let values = JSON.stringify(model);
        this.service.HTTP_Post('/ordenfabricacion_articulos', values).subscribe(
          data => {
            if (data.message = 'OK') {
              this.loadLines();
              this.toaster.success("Borrados los Artículos");
            }
          },
          error => {
            this.toaster.error(error.message);
          });
      }
    } else {
      this.toaster.error("Debe Seleccionar líneas para borrar");
    }
  }

  Editar() {
    var ids = this.SubLinesEdit();
    if (ids.length == 1) {
      this.selectedItem = ids[0];
      this.modalEdit.show();
    }
  }
  /*
  */
  Update() {

    var lines = this.getSelectedRows(this.gridLines, "id");
    var tipos = this.getSelectedRows(this.gridLines, "articulo");
    if (lines.length == 1) {
      let ids = lines.join("");
      let tips = tipos.join("");
      var rows = this.search.getRows();
      var articles = rows.join(',');

      let model = {
        idrow: ids,
        cliente: this.model.cliente,
        articles: articles,
        operation: 1,
        articulo: tips
      }

      let values = JSON.stringify(model);
      this.service.HTTP_Post('/ordenfabricacion_articulos', values).subscribe(
        data => {
          if (data.message = 'OK') {
            this.search.clearSelection();
            this.modalAdd.hide();
            this.loadLines();
            this.toaster.success("Agregados los Artículos");
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    } else {
      this.toaster.info("Solamente puede seleccionar una línea");
    }
  }

  UpdateArticle() {

    let model = {
      id: this.selectedItem.id,
      cantidad: this.selectedItem.cantidad,
      consumo: this.selectedItem.consumo,
      cliente: this.model.cliente
    }

    if (confirm("¿Desea Actualizar?")) {

      let values = JSON.stringify(model);
      this.service.HTTP_Post('/ordenfabricacion_articulos_edit', values).subscribe(
        data => {
          if (data.message = 'OK') {
            this.modalEdit.hide();
            this.loadLines();
            this.toaster.success("Actualizado Artículo");
          }
        },
        error => {
          this.toaster.error(error.message);
        });
    }
  }

  RowClick(event) {
    console.log(event);
  }

  cellBeginEditEvent(event) {

    //console.log(event);
  }
  cellEndEditEvent(event) {

    console.log(event);

    if (event.type == "cellendedit") {

      let args = event.args;
      let value = args.value;
      let oldvalue = args.oldvalue;

      /*
      if (value != oldvalue) {
        let model = {
          table: 'ESCANDALLOS_LINES',
          id: args.row.id,
          field: args.datafield,
          value: args.value
        }
        let values = JSON.stringify(model);
        var route = "/update_table";
        this.service.HTTP_Post(route, values).subscribe(
          data => {
            if (data.message == "OK") {
              this.toaster.success("Actualización realizada", "Actualización");
            }
          },
          error => {
            console.log(error);
            this.toaster.error(error, "ATENCION");
          }
        );
      }
      */
    }
  }
}


