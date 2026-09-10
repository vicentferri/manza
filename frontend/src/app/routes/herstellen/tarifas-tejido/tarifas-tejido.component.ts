import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { SearchArticleType } from '../../../models/SearchArticleType';
import { jqxGridComponent } from '../../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { HaruService } from '../../../services/haru.service';


@Component({
  selector: 'app-tarifas-tejido',
  templateUrl: './tarifas-tejido.component.html',
  styleUrls: ['./tarifas-tejido.component.css'],
  providers: [HaruService]
})
export class TarifasTejidoComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) mySGrid!: jqxGridComponent;

  searchmodel = new SearchArticleType();

  source = {
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
      { name: 'c30', type: 'number' }

    ],
    localdata: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  decimalValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 4, digits: 8, min: 0, spinButtons: false });
  }

  integerValueCantidad = (row, cellvalue, editor) => {
    editor.jqxNumberInput({ decimalDigits: 0, digits: 4, min: 0, spinButtons: false });
  }

  filter = ["input", "checkedlist", "number", "range", "bool"];

  button = function (a, b, c, d, html, rowInfo) {
    var button = "<div style='text-align: center; margin-top: 6px;'><input id='" + rowInfo.idrow + "' class='editButton' type='image' src='../images/icon-pencil.gif' width='15' height='15' onclick='getId($(this),1);return false;'/></div>";
    return button;
  }

  imagerenderer = function (a, b, c, d, html, rowInfo) {

    return "<img height='0' width='0' src=''/>";
  }


  settings: any = {
    width: this.getWidth(),
    height: 800,
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['50', '100', '500', '1000'],
    pagesize: 1000,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: true,
    selectionmode: 'singlerow', /* wir haben hier verschiedene Optionen, 
                                    * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: false,
    filterable: false,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter,
    columns: [
      { text: '', datafield: 'c00', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '', datafield: 'c01', width: 50, groupable: false, pinned: true, editable: false, cellsalign: 'center' },
      { text: '0.40', datafield: 'c02', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.60', datafield: 'c03', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '0.80', datafield: 'c04', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.00', datafield: 'c05', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.20', datafield: 'c06', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.40', datafield: 'c07', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.60', datafield: 'c08', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '1.80', datafield: 'c09', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.00', datafield: 'c10', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.20', datafield: 'c11', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.40', datafield: 'c12', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.60', datafield: 'c13', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '2.80', datafield: 'c14', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.00', datafield: 'c15', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.20', datafield: 'c16', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.40', datafield: 'c17', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.60', datafield: 'c18', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '3.80', datafield: 'c19', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.00', datafield: 'c20', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.20', datafield: 'c21', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.40', datafield: 'c22', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.60', datafield: 'c23', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '4.80', datafield: 'c24', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.00', datafield: 'c25', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.20', datafield: 'c26', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.40', datafield: 'c27', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.60', datafield: 'c28', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '5.80', datafield: 'c29', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
      { text: '6.00', datafield: 'c30', width: 55, groupable: false, pinned: false, editable: false, cellsalign: 'center' },
    ]

  };

  constructor(private service: HaruService) { }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '99%';
    }

    return '99%';
  }

  ngOnInit() {
    this.searchmodel.Descripcion = "180";
    this.searchmodel.Barras = "1";
    this.searchmodel.Alias = "1";
  }

  ngAfterViewInit() {
    this.mySGrid.createComponent(this.settings);
  }


  export() {
    var pathExportScript = this.service.Export();
    this.mySGrid.exportdata("xls", "export", true, undefined, false, pathExportScript);
  }

  search() {
    var criterio = this.searchmodel.Descripcion;
    var alias = this.searchmodel.Alias;
    var barras = this.searchmodel.Barras;

    if (criterio == null) {
      criterio = "180";
    }

    if (alias == null) {
      alias = "";
    }

    if (barras == null) {
      barras = "";
    }
    this.mySGrid.clearselection();

    var url = "/tabla_precio_tejidos/" + criterio + "/" + barras + "/" + alias;
    this.service.HTTP_Get(url).subscribe(
      data => {
        this.source.localdata = data.Table[0];
        this.dataAdapter.dataBind();
        this.mySGrid.updatebounddata();

      },
      error => {

      }
    );
  }

  /*
  getSelectedRows(myGrid: jqxGridComponent, field: string) {

    var rowsSelected = myGrid.getselectedrowindexes();
    var info = myGrid.getboundrows();

    var arrayData = [];
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
*/


}
