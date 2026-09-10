import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, DoCheck, EventEmitter } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { jqxGridComponent } from '../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { getLocalization } from '../../shared/localization';
import { FormGroup } from '@angular/forms';
import { DynamicFormService } from "@ng-dynamic-forms/core";


@Component({
    selector: 'harugrid',
    templateUrl: './harugrid.component.html',
    styleUrls: ['./harugrid.component.css'],
    providers: [HaruService, DynamicFormService]
})
export class HaruGridComponent implements OnInit, DoCheck {

    @Input() operation: number = 0;
    @Input() url: string = "";
    @Input() formModel: any;
    @Input() gridModel: any;

    @Output() retValues = new EventEmitter();


    formGroup!: FormGroup;

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

    source = {
        type: "GET",
        datatype: "json",
        datafields: [],
        url: ""
    };

    dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

    localization: any = getLocalization('es');

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
        columns: [],
        localization: this.localization
    };



    _datafields = [
        { name: 'Pais', type: 'string' },
        { name: 'Sector', type: 'string' },
        { name: 'Provincia', type: 'string' },
        { name: 'Cliente', type: 'string' },
        { name: 'NomFiscal', type: 'string' },
        { name: 'Total', type: 'string' }
    ]

    _columns = [
        { text: 'Pais', columngroup: 'ProductDetails', datafield: 'Pais', width: 125, filtertype: 'textbox', editable: false },
        { text: 'Sector', columngroup: 'ProductDetails', datafield: 'Sector', width: 125, filtertype: 'input', editable: false, },
        { text: 'Provincia', columngroup: 'ProductDetails', datafield: 'Provincia', width: 125, filtertype: 'input', editable: false },
        { text: 'NomFiscal', columngroup: 'ProductDetails', datafield: 'NomFiscal', width: 125, filtertype: 'input', editable: false, },
        { text: 'Total', columngroup: 'ProductDetails', datafield: 'Total', width: 60, filtertype: 'input', editable: false }
    ]



    constructor(private service: HaruService, private formService: DynamicFormService) { }

    ngOnInit() {
        this.formGroup = this.formService.createFormGroup(this.formModel);
    }

    ngAfterViewInit() {

    }

    ngDoCheck() {


    }



    BuildGrid(url: string, formModel: any, gridModel: any) {

        this.url = url;
        this.formModel = formModel;
        this.gridModel = gridModel;
        this.formGroup = this.formService.createFormGroup(this.formModel);
        this.source.datafields = this.gridModel.datafields;
        this.settings.columns = this.gridModel.columns;
        this.myGrid.createComponent(this.settings);
        this.source.url = this.url;
        this.myGrid.updatebounddata("cells");
        /*
        var usuario = 1;
        var empresa = 1;
        var desde = "01/01/2017";
        var hasta = "31/12/2017";
  
        this.source.datafields = this._datafields;
        this.settings.columns = this._columns;
        this.myGrid.createComponent(this.settings);
        this.source.url = this.service.BBSS_Fact_Sec_Pro_Cli_URL(usuario,empresa,desde,hasta);
        this.myGrid.updatebounddata("cells");
        */
    }

    getValueByKey(key, data) {
        var i, len = data.length;
        for (i = 0; i < len; i++) {
            if (data[i] && data[i].hasOwnProperty(key)) {
                return data[i][key];
            }
        }
        return -1;
    }

    refresh() {
        //this.source.datafields = this.gridModel.datafields;
        //     this.settings.columns = this.gridModel.columns;
        //this.myGrid.createComponent(this.settings);

        this.source.url = this.url;
        this.myGrid.updatebounddata("cells");
    }

    setValues() {

        var arrayData: any[] = [];
        arrayData = this.getSelectedRows(this.myGrid, "");
        if (arrayData.length > 0) {

            for (var pos = 0; pos < this.formModel.length; pos++) {

                var id = this.formModel[pos].id;
                var value = this.getValueByKey(id, arrayData);
                if (value != '-1') {
                    this.formModel[pos].valueUpdates.next(value);
                }
            }

        } else {
            alert("No ha seleccionado ninguna linea")
        }
    }

    getValues() {

        let json: string = JSON.stringify(this.formModel);

        /*
        var retValues : string = "{ ";
   
        for (var pos = 0; pos < this.formModel.length; pos++) {
   
            var id = this.formModel[pos].id;
            var value = this.formModel[pos].value;
   
   
   
            retValues +=   id + " :'" + value + "',";
   
        }
        retValues += " }";
   
        //console.log(retValues);
   
        var values : any = JSON.parse(JSON.stringify(retValues));
             */
        this.retValues.emit(json);

    }

    /*
      Edit the Selected Field
    */
    Edit() {
        this.setValues();
    }

    Update() {
        this.getValues();
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

}
