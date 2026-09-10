import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';
import { ruckgabeType } from '../../../models/ruckgabeType';
import { GenType } from '../../../models/GenType';
import { LinType } from '../../../models/LinType';
import { searchCustType } from '../../../models/searchCustType';

@Component({
    selector: 'app-bestellung',
    templateUrl: './bestellung.component.html',
    styleUrls: ['./bestellung.component.css'],
    providers: [HaruService]
})
export class BestellungComponent implements OnInit {


    @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;

    model = new ruckgabeType();
    almacenes: Array<GenType> = [];
    responsables: Array<GenType> = [];
    searchLines: Array<LinType> = [];
    searchResults: Array<searchCustType> = [];


    unidades: any = [
        { id: 1, name: 'Unidad 1' },
        { id: 2, name: 'Ud2' },
        { id: 3, name: 'Ud3' },
        { id: 4, name: 'Ud4' },
        { id: 5, name: 'Ud5' },
        { id: 6, name: 'Ud6' },
        { id: 7, name: 'Ud7' }
    ];

    UnidadesSource = {
        datatype: "array",
        datafields: [
            { name: 'id', type: 'number' },
            { name: 'name', type: 'string' }
        ],
        localdata: this.unidades
    }

    ActionAdapter = new $.jqx.dataAdapter(this.UnidadesSource, { autoBind: true });

    source = {
        type: "GET",
        datatype: "json",
        datafields: [
            { name: 'id', type: 'number' },
            { name: 'codigo', type: 'number' },
            { name: 'fecha', type: 'date' },
            { name: 'lote', type: 'string' },
            { name: 'descripcion', type: 'string' },
            { name: 'cantidad', type: 'string' },
            { name: 'unidad', type: 'string', values: { source: this.ActionAdapter.records, value: 'id', name: 'name' } },
            { name: 'alias', type: 'string' }
        ],
        url: ""
    };

    dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

    selectRenderer = (row, columnfield, value, defaulthtml, columnproperties, rowdata) => {
        return '<span style="margin: 4px; float: ' + columnproperties.cellsalign + '; color: #008000;cursor:hand">SEL</span>';
    };

    agregatesRenderer = (aggregates: any, column: any, element: any) => {
        return '<div style="position: relative; margin-top: 4px; margin-right:5px; text-align: right; overflow: hidden;">' + 'Total' + ': ' + aggregates.sum + '</div>';
    };

    delbutton = function (a, b, c, d, html, rowInfo) {
        return "<div style='text-align: center;'><button class='btn btn-primary btn-sm' (click)='delId();'>Borrar</button></div>";
    }

    settings: any = {
        width: '100%',
        height: 600,
        pageable: true,
        autoheight: false,
        theme: 'bootstrap',
        pagesizeoptions: ['50', '100'],
        pagesize: 100,
        scrollmode: 'logical',
        sortable: true,
        altrows: true,
        enabletooltips: true,
        editable: true,
        groupable: true,
        selectionmode: 'multiplerow',
        showfilterrow: true,
        filterable: true,
        columnsresize: true,
        columnsreorder: true,
        enablehover: true,
        showtoolbar: true,
        showstatusbar: true,
        source: this.dataAdapter,
        columns: [
            { text: 'albaran', columngroup: 'ProductDetails', datafield: 'codigo', width: 100, editable: false },
            { text: 'Fecha', columngroup: 'ProductDetails', datafield: 'fecha', width: 100, filtertype: 'input', editable: false, cellsformat: 'dd/MM/yyyy' },
            { text: 'Alias', columngroup: 'ProductDetails', datafield: 'alias', width: 125, filtertype: 'input', editable: false },
            { text: 'Concepto', columngroup: 'ProductDetails', datafield: 'descripcion', width: 500, filtertype: 'input', editable: false },
            { text: 'Cantidad', columngroup: 'ProductDetails', datafield: 'cantidad', width: 100, filtertype: 'input', editable: false, cellsalign: 'right', cellsformat: 'd2' },
            { text: 'Lote', columngroup: 'ProductDetails', datafield: 'lote', width: 125, filtertype: 'input', editable: false },
            {
                text: 'Unidad', datafield: 'unidad', width: 125, filtertype: 'input', editable: true, cellsalign: 'right',
                columntype: 'dropdownlist',
                createeditor: (row, value, editor) => {
                    editor.jqxDropDownList({ source: this.ActionAdapter, displayMember: 'name', valueMember: 'id' })
                },
                createeverpresentrowwidget: (datafield, htmlElement, popup, addCallback) => {

                    var inputTag = $("<div style='border: none;'></div>").appendTo(htmlElement);
                    /*
                    inputTag.jqxDropDownList({
                      popupZIndex: 999999, placeHolder:"Action:", source:this.ActionAdapter.records,displayMember: 'name', valueMember: 'id', width: '100%', height: 30, dropDownWidth: 130
                    });
                    $(document).on('keydown.action', (event)=>{
                      if(event.keyCode==13) {
                        if (event.target === inputTag[0]) {
                          addCallback();
                        } else if ($(event.target).ischildof(inputTag)) {
                          addCallback();
                        }
                      }
                    });
                    */
                    return inputTag;
                },
                geteverpresentrowwidgetvalue: (datafield, htmlElement) => {
                    var selectedItem = htmlElement.jqxDropDownList('getSelectedItem');
                    if (!selectedItem) {
                        return '';
                    } else {
                        return selectedItem.value;
                    }
                }
            }
        ]

    };

    constructor(private service: HaruService) { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.myGrid.createComponent(this.settings);
    }

    Save() {
    }

    New() {

    }

    Delete() {

    }

    Process() {

    }

    Search() {

    }

    delId() {

    }

    onDateChange(e, e1): void {
        /*
          if (e.target.id == "DesdeFecha"){
              this.searchmodel.Fecha1 = new Date(e.target.value);
              this.searchmodel._Fecha1 = this.searchmodel.Fecha1.toLocaleDateString("es-ES");
          }
     
          if (e.target.id == "HastaFecha"){
              this.searchmodel.Fecha2 = new Date(e.target.value);
              this.searchmodel._Fecha2 = this.searchmodel.Fecha2.toLocaleDateString("es-ES");
          }
          */
    }
}

/*


import {GenType} from '../../../models/GenType';
import {SearchType} from '../../../models/searchType';
import {LinType} from '../../../models/linType';


export class BestellungComponent implements OnInit {

  public staticModal;

  Top = 2;
  criterio = "";
  searchmodel_Albaran = "";



  paises : Array<GenType> = [];
  provincias : Array<GenType> = [];
  cadenas : Array<GenType> = [];
  almacenes : Array<GenType> = [];
  responsables : Array<GenType> = [];
  albaranes : Array<GenType> = [];
  searchmodel = new SearchType();



  ngOnInit() {

        this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
        this.loadMaster();
  }


  loadMaster(){
      this.service.loadMaster_Almacenes(1).subscribe(
          data => {
              this.almacenes = data.Table;
          },
         error => { console.log(error);
      });
      this.service.loadMaster_Responsables(1).subscribe(
          data => {
              this.responsables = data.Table;
          },
      error=>{ console.log(error);
      });
  }

  selectCustomer(item:any){
      this.model.idCliente = item.idrow;
      this.model.nombrecliente = item.nombre;
      this.model.idEntrega = item.iddireccion;
      this.model.nombreentrega = item.nombre_domicilio;
  }

  Save(){
      var apply = true;


      if (confirm("¿Desea Actualizar el Documento?")){

          if (this.model.idCliente == -1){
              apply = false;
              alert("Debe Seleccionar el Cliente");
          }

          if (apply && this.model.idEntrega == -1){
              apply = false;
              alert("Debe Seleccionar el Cliente");
          }

          if (apply && this.model.almacen == -1){
              apply = false;
              alert("Debe Seleccionar el Almacen destino");
          }

          if (apply && this.model.responsable == -1){
              apply = false;
              alert("Debe Seleccionar la persona responsable");
          }

      }
      else
      {
          apply = false;
      }


      if (apply){
          this.service.DevMercancia_AddHeader(this.model).subscribe(
          data =>{
              if (data.id != "-1"){
                  this.model.id = data.id;
                  this.loadHeader("c");
              }
          },
          error => {
              console.log(error);
          });
      }

  }



  search(){

      this.service.searchCustomers("1", this.criterio).subscribe(
      data => {
          this.searchResults = data.Table;
      },
      error =>{
          console.log(error);
      });

  }

    onDateChange(e,e1) : void
    {
        if (e.target.id == "DesdeFecha"){
            this.searchmodel.Fecha1 = new Date(e.target.value);
            this.searchmodel._Fecha1 = this.searchmodel.Fecha1.toLocaleDateString("es-ES");
        }

        if (e.target.id == "HastaFecha"){
            this.searchmodel.Fecha2 = new Date(e.target.value);
            this.searchmodel._Fecha2 = this.searchmodel.Fecha2.toLocaleDateString("es-ES");
        }
   }





   searchDocuments(){
       var model = JSON.stringify(this.searchmodel);
       this.source2.url = this.service.Bestellung_URL(model);
       this.mySGrid.updatebounddata("cells");

   }


   New(){
       this.source.url = "";
       this.myGrid.clear();
       this.Top = 1;
       this.loadMaster();
       this.model.id = 0;
       //this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
       this.model.fecha = new Date();
       this.model.numero = -1;
       this.model.referencia = "";
       this.model.idCliente = -1;
       this.model.nombrecliente = "Seleccionar";
       this.model.nombreentrega = "";
       this.model.observaciones = "";
       this.model.estado = 0;

       this.model.almacen = this.almacenes[0].id;
       this.model.responsable = this.responsables[0].id;

   }

   Search(){
       this.Top = 2;
       this.mySGrid.clearselection();
   }

   Process(){
       if (confirm("¿Desea realizar las entradas al almacen?")){
           var user = 1;
           this.service.DevMercancia_Process(this.model.id,user).subscribe(
           data =>{
                if (data.message=="OK"){
                    this.Top = 2;
                    alert("REALIZADO PROCESO - DOCUMENTO CERRADO")
                }
                else
                {
                    alert("NO HA SIDO POSIBLE REALIZAR EL PROCESO");
                }
           },
           error => {
               console.log(error);
           });
       }
   }

   Delete(){
       if (confirm("¿Desea Borrar el Documento?")){
           var user = 1;
           this.service.DevMercancia_Delete(this.model.id,user).subscribe(
           data =>{
               if (data.message=="OK"){
                   this.Top = 2;
                   this.searchDocuments();
                   alert("BORRADO EL DOCUMENTO");
               }
               else
                {
                    alert("NO HA SIDO POSIBLE REALIZAR EL BORRADO");
                }
           },
           error =>{

           });
       }
  }

  delId(){
      var arrayData = this.getSelectedRows(this.myGrid,"id");
      if (arrayData.length > 0){

            if (confirm("¿Desea borrar las líneas seleccionadas?")){
                var user = 1;
                var ids = arrayData.join("|");
                this.service.DevMercancia_DeleteLine(ids, user).subscribe(
                data =>{
                    this.loadLines()
                    //this.myGrid.clearselection();
                },
                error =>{
                    console.log(error);
                });
            }
      }
      else
      {
          alert("No ha seleccionado ninguna linea")
      }
  }




  gridReady(){
      //console.log("ready");
  }

  rowSelect(event: any) : void
  {
      let args = event.args;
       //var innerText = "Select Row: " + args.row.ID;
       //console.log(args.row);
       //this.SelectedRow = args.row.ID;

       this.model.id = args.row.idrow;
       this.loadHeader("c");
  }

  loadLines(){
      this.source.url = this.service.DevMercancia_List_URL(this.model.id);
      //console.log(this.source.url);
      this.myGrid.updatebounddata("cells");

  }

  loadAlbaranes(id : string){
      this.service.DDL_AlbaranCliente(id).subscribe(

          data => {
              this.albaranes = data.Table;
          },
          error => {
              console.log(error);
          }
      );
  }

  loadAlbaran(){
      this.service.DevMercancia_Albaran_Devol(parseInt(this.searchmodel_Albaran),this.model.id).subscribe(
      data =>{
          this.searchLines = data.Table;
      },
      error =>{
          console.log(error);
      });
  }

  searchLinesAlbaranes(){
      this.loadAlbaran();
  }

  addLines(){
      if (confirm("¿Desea agregar las líneas al documento?")){

          for (var i = 0; i < this.searchLines.length;i++){

              if (this.searchLines[i].cantidad_sel > 0){

                  this.service.DevMercancia_AddLine(this.searchLines[i], this.model.id,-1).subscribe(
                 data => {
                     if (data.id == "1"){
                         this.loadLines();
                     }
                 },
                 error =>{
                     console.log(error);
                 }
                );
              }
          }

          this.loadAlbaran();
      }
  }

  loadHeader(dir: string){
      this.service.DevMercancia_GetHeader(this.model.id,dir).subscribe(
      data => {
          this.model.id     = data.Table[0].IDROW;
          this.model.numero = data.Table[0].CODIGO;
          this.model.fecha = new Date(data.Table[0].FECHA);
          this.model.idCliente = data.Table[0].CLIENTE;
          this.model.idEntrega = data.Table[0].CLIENTE_ENTREGA;
          this.model.referencia = data.Table[0].REFERENCIA;
          this.model.observaciones = data.Table[0].OBSERVACIONES;
          this.model.almacen = data.Table[0].ALMACEN;
          this.model.responsable = data.Table[0].ATENDIDO;
          this.model.nombrecliente = data.Table[0].NOMFISCAL;
          this.model.nombreentrega = data.Table[0].NOMENTREGA;
          this.model.estado = data.Table[0].CLOSED;
          this.loadLines();
          this.Top = 1;
          this.loadAlbaranes(this.model.idCliente.toString());


      },
      error => {
          console.log(error);
      }

      );
  }

  getSelectedRows(myGrid: jqxGridComponent,field:string){

      var rowsSelected = myGrid.getselectedrowindexes();
      var info = myGrid.getboundrows();

      var arrayData = [];
      for (var i=0;i<rowsSelected.length;i++){
          var index = rowsSelected[i];
          var row = info[index.valueOf()];

          if (field==""){
              arrayData.push(row);
          }
          else
          {
            arrayData.push(row[field]);
          }
      }
      return arrayData;
  }
}
*/
