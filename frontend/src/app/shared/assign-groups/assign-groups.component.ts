import { Component, OnInit, ViewChild } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { jqxGridComponent } from '../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';

@Component({
  selector: 'assign-groups',
  templateUrl: './assign-groups.component.html',
  styleUrls: ['./assign-groups.component.css'],
  providers: [HaruService]
})
export class AssignGroupsComponent implements OnInit {

  @ViewChild('gridReference1', { static: false }) myGrid1!: jqxGridComponent;
  @ViewChild('gridReference2', { static: false }) myGrid2!: jqxGridComponent;

  filter1 = "";

  bulk = {
    id: "1",
    table: "",
    field: "",
    value: ""
  }

  master_values: any = [];
  master_from: any = [];
  master_to: any = [];

  source1 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  };

  source2 = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'idrow', type: 'int' },
      { name: 'descripcion', type: 'string' }
    ],
    localdata: null
  };

  dataAdapter1 = new $.jqx.dataAdapter(this.source1, { contentType: 'application/json; charset=utf-8' });
  dataAdapter2 = new $.jqx.dataAdapter(this.source2, { contentType: 'application/json; charset=utf-8' });



  filter = ["textbox", "input", "checkedlist", "list", "number", "checkbox", "data", "range", "custom"];

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }
    return '99%';
  }

  settings1: any = {
    width: this.getWidth(),
    height: '99%',
    pageable: false,
    autoheight: false,
    autorowheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '5000'],
    pagesize: 5000,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'multiplerow', /* wir haben hier verschiedene Optionen, 
                                  * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter1,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 10, filtertype: this.filter[0], hidden: true, editable: false },
      { text: 'descripcion', datafield: 'descripcion', filtertype: "textbox" },
    ]
    //localization: this.localization
  };

  settings2: any = {
    width: this.getWidth(),
    height: '99%',
    pageable: false,
    autoheight: false,
    autorowheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '5000'],
    pagesize: 5000,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: false,
    groupable: false,
    selectionmode: 'multiplerow', /* wir haben hier verschiedene Optionen, 
                                    * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter2,
    columns: [
      { text: 'idrow', datafield: 'idrow', width: 10, filtertype: this.filter[0], hidden: true, editable: false },
      { text: 'descripcion', datafield: 'descripcion', filtertype: this.filter[1] },
    ]
    //localization: this.localization
  };

  constructor(private service: HaruService) { }

  ngOnInit() {

  }

  ChangeTejido() {
    if (this.bulk.id != '0') {
      this.loadSMColores();
      this.loadSMAssignedColores()
    }
  }

  ngAfterViewInit() {
    this.myGrid1.createComponent(this.settings1);
    this.myGrid2.createComponent(this.settings2);
    this.loadTejidos();


  }

  Filter1(event) {


  }

  AssignValues(values: any, type: any, name: any, value: any) {



    if (type == 'master') {
      values.forEach(element => {
        this.master_values.push({ id: element[name], value: element[value] });
      });
    }

    if (type == 'from') {
      /*
      values.forEach(element => {
        this.master_from.push({id:element[name],value:element[value]});   
        var arr = [];
        arr.push(element[name]);
        arr.push(element[value]);

        this.source1.localdata.push(arr);
        this.dataAdapter1.dataBind();
        this.myGrid1.updatebounddata();
      });
      */
    }

    if (type == 'to') {
      values.forEach(element => {
        this.master_to.push({ id: element[name], value: element[value] });
      });
    }


  }

  loadTejidos() {

    this.service.HTTP_Get('/sm/tejidos').subscribe(
      data => {
        this.master_values = data.Table;
      },
      error => {

      });
  }

  loadSMColores() {
    var url = '/sm/colores_form/1';
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.source1.localdata = data.Table;
        this.dataAdapter1.dataBind();
        this.myGrid1.updatebounddata();
      },
      error => {
        console.log(error);
      });
  }

  loadSMAssignedColores() {
    var url = '/sm/tejidos_colores_filtered/' + this.bulk.id + '/1';
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.source2.localdata = data.Table;
        this.dataAdapter2.dataBind();
        this.myGrid2.updatebounddata();
      },
      error => {
        console.log(error);
      });
  }




  loadMasterValues(url) {

    this.service.HTTP_Get('/sm' + url).subscribe(
      data => {
        this.master_values = data.Table;
        this.master_values.push({ 'idrow': '-1', 'descripcion': 'Seleccionar Tejido' });
      },
      error => {

      });
  }

  SelectFrom(event) {

  }

  FilterFrom(event) {

  }

  SelectTo(event) {

  }

  FilterTo(event) {

  }

  AsignarColores() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid1, "idrow");
    if (arrayData.length > 0) {
      var ids = arrayData.join("|");

      if (!ids.endsWith("|")) {
        ids += "|";
      }

      var model = {
        tejido: this.bulk.id,
        colores: ids
      }

      var values = JSON.stringify(model);

      if (confirm("¿Desea asignar los colores?")) {
        var url = "/tejidos_colores_assign";
        this.service.HTTP_Post(url, values).subscribe(
          data => {
            this.loadSMColores();
            this.loadSMAssignedColores()
            this.myGrid1.clearselection();
            this.myGrid2.clearselection();
          },
          error => {
            console.log(error);
          }
        );
      }
    } else {
      alert("No ha seleccionado ninguna linea")
    }
  }

  BorrarColores() {
    var arrayData: any[] = [];
    arrayData = this.getSelectedRows(this.myGrid2, "idrow");
    if (arrayData.length > 0) {
      var ids = arrayData.join("|");

      var model = {
        ids: ids + '|'
      }

      var values = JSON.stringify(model);

      if (confirm("¿Desea borrar los colores?")) {
        var url = "/tejidos_colores_delete";
        this.service.HTTP_Post(url, values).subscribe(
          data => {
            this.loadSMColores();
            this.loadSMAssignedColores()

            this.myGrid1.clearselection();
            this.myGrid2.clearselection();
          },
          error => {
            console.log(error);
          }
        );
      }
    } else {
      alert("No ha seleccionado ninguna linea")
    }
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

  /*
  Filtering(){
  
    this.source1.localdata = [];
    this.master_from.forEach(element => {
  
      var filter = new String(this.filter1).toUpperCase();
      var value = new String(element.value);
      if (value.toUpperCase().indexOf(filter)>=0){
        var arr = [];
        arr.push(element.name);
        arr.push(element.value);
        this.source1.localdata.push(arr);
        this.dataAdapter1.dataBind();
        this.myGrid1.updatebounddata();
      }
    });
    */


}
