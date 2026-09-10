import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { jqxGridComponent } from '../../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { getLocalization } from '../../shared/localization';
import { HaruService } from '../../services/haru.service';
import { Utils } from '../Utils';

@Component({
  selector: 'haru-sm-promociones',
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.css'],
  providers: [HaruService]
})
export class PromocionesComponent implements OnInit {

  @ViewChild('gridReference', { static: false }) myGrid!: jqxGridComponent;

  public promForm: FormGroup;

  clientesapi: Array<any> = [];

  modelCliente = {
    idrow: "-1",
    c1: 0,
    c2: 0,
    c3: 0,
    c4: 0,
    ids: null
  }

  model = {
    Desde: new Date(),
    Hasta: new Date()
  }

  source = {
    type: "GET",
    datatype: "json",
    datafields: [
      { name: 'selected', type: 'bool' },
      { name: 'idrow', type: 'integer' },
      { name: 'descripcion', type: 'string' }
    ],
    //localdata : null
    url: null
  };

  dataAdapter = new $.jqx.dataAdapter(this.source, { contentType: 'application/json; charset=utf-8' });

  localization: any = getLocalization('es');

  settings: any = {
    width: '99%',
    height: '500px',
    pageable: true,
    autoheight: false,
    theme: 'glacier',
    pagesizeoptions: ['15', '50'],
    pagesize: 15,
    scrollmode: 'logical',
    sortable: true,
    altrows: true,
    enabletooltips: true,
    editable: true,
    groupable: false,
    selectionmode: 'checkbox', /* wir haben hier verschiedene Optionen,
                                    * damit zu benutzen beispielweise singlerow,multiplerow, multiplecelladvanced*/
    showfilterrow: true,
    filterable: true,
    columnsresize: true,
    columnsreorder: true,
    enablehover: true,
    showtoolbar: false,
    showstatusbar: false,
    showaggregates: false,
    source: this.dataAdapter,
    enablebrowserselection: true,
    columns: [
      { text: 'sel', dataField: 'selected', columntype: 'checkbox', width: 35, filtertype: 'bool', groupable: false, pinned: false, editable: true, hidden: true },
      { text: 'descripcion', datafield: 'descripcion', filtertype: 'input', editable: false },
    ],
    columngroups: [],
    //localization: this.localization
  };


  constructor(private fb: FormBuilder, private service: HaruService) {
    this.createForm();
  }



  ngOnInit() {
    this.loadClientes();
  }

  ngAfterViewInit() {

    this.myGrid.createComponent(this.settings);
    this.getData();

  }

  getData() {
    let url = "/clientes_promociones_cliente/" + this.modelCliente.idrow;
    this.source.url = this.service.HTTP_Url_Get('/sm' + url);
    this.myGrid.updatebounddata("cells");
  }


  LoadCustomerData() {
    this.getData();
  }

  loadClientes() {
    this.service.HTTP_Get("/sm/clientesapi").subscribe(
      data => {
        this.clientesapi = data.Table;
      },
      error => {

      }
    );
  }

  All(value) {

    if (value == 1) {
      this.myGrid.selectallrows();
    }
    else {
      this.myGrid.clearselection();
    }

  }

  createForm() {
    this.promForm = this.fb.group(
      {
        Desde: new FormControl(this.model.Desde, [Validators.required]),
        Hasta: new FormControl(this.model.Hasta, [Validators.required]),
        CoefPVP: new FormControl(15, [Validators.required]),
        CoefC1: new FormControl(7.5, [Validators.required]),
        Mensaje: new FormControl("", [Validators.required]),
        aplicaPVP: new FormControl(false, [Validators.required]),
        aplicaC1: new FormControl(false, [Validators.required]),
      }
    );


  }

  onDateChange(e, e1): void {
    if (e.target.id == "Desde") {
      this.model.Desde = new Date(e.target.value);
    }

    if (e.target.id == "Hasta") {
      this.model.Hasta = new Date(e.target.value);
    }


  }

  onSubmit() {

    //var ids = Utils.getCheckedRows(this.myGrid, "idrow");
    var ids = Utils.getSelectedRows(this.myGrid, "idrow");
    alert(ids);

    if (ids.length == 0) {
      alert("No ha seleccionado centros para la promoción");
    }
    else {

      if (confirm("¿Desea realizar la programación de la PROMOCION?")) {

        let idsvalues = ids.join(";");

        var values = {
          Desde: this.model.Desde.toLocaleDateString("en-EN"),
          Hasta: this.model.Hasta.toLocaleDateString("en-EN"),
          ids: ids.join(";") + ";",
          model: this.promForm.value
        }

        this.service.HTTP_Post('/clientes_promociones_program', JSON.stringify(values)).subscribe(
          data => {
            console.log(data);
            if (data.message == "OK") {
              alert("Programada la promoción");
            }
          },
          error => {
            console.log(error);
            alert("Error en la Programación de la promoción=" + JSON.stringify(error));
          }
        );

      }
    }
  }

}
