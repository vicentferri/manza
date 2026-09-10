import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ruckgabeType } from '../../../models/ruckgabeType';
import { HaruService } from '../../../services/haru.service';
import { LinType } from '../../../models/LinType';
import { CellType } from '../../../models/CellType';
import { MapType } from '../../../models/CellType';
import { UploadService } from '../../../services/upload.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-tarifs',
    templateUrl: './tarifs.component.html',
    styleUrls: ['./tarifs.component.css'],
    providers: [HaruService, UploadService]
})



export class TarifsComponent implements OnInit {

    Lines = 0;
    criterio = "";
    searchmodel_Albaran = "";
    searchLines: Array<LinType> = [];
    private sub!: Subscription;

    search = {
        Cliente: -1,
        Tipo: -1,
        Marca: -1,
        Modelo: -1,
        Tejido: -1,
        Tubo: -1,
        Impresion: 0,
        TipoT: 1,
        Producto: 1,
        AnchoLama: -1,
        TipoTarifa: 1,
        Cajon: -1,
        Lacado: 1
    }

    add = {
        desdeancho: 0,
        hastaancho: 0,
        desdealto: 0,
        hastaalto: 0,
        pvp: 0,
        referencia: 0,
        id: 0,
        idrow: -1
    }


    lista_clientes: any = null;
    lista_accionamientos: any = null;
    lista_tubos: any = null;
    lista_marcas: any = null;
    lista_tejidos: any = null;
    lista_cajones: any = null;
    lista_impresion: any = [{ id: 0, name: 'SIN IMPRESION' }, { id: 1, name: 'IMPRESION DIGITAL' }];

    lista_tipos: any = [{ id: 1, name: '(1.00,2.80)(1.00,3.00)' },
    { id: 2, name: '(1.00,2.40)(1.00,3.00)' },
    { id: 3, name: '(0.40,1.20)(0.60,2.20)' },
    { id: 4, name: '(0.60,2.00)(1.00,3.00)' },
    { id: 5, name: '(1.00,2.90)(1.00,4.00)' },
    { id: 6, name: '(0.60,6.00)(0.60,6.00)' },
    { id: 7, name: '(1.00,5.00)(1.00,3.00)' },
    { id: 8, name: 'VERTICAL (1.00,2.80)(1.00,4.00)' },
    { id: 9, name: '(0.60,3.80)(0.60,3.00)' }];

    lista_productos: any = [{ id: 1, name: 'ENROLLABLE' },
    { id: 2, name: 'PANEL JAPONES' },
    { id: 3, name: 'PANEL VERTICAL' },
    { id: 4, name: 'PANEL COMPAC' },
    { id: 6, name: 'CAJON ZIP' }];
    lista_anchoslama: any = null;

    lista_lacados: any = [{ id: 1, name: 'BRUTO' },
    { id: 2, name: 'BLANCO' }];

    lista_modelos: any = [{ idrow: -1, tipo: 'TODOS' }]

    headers: Array<CellType> = [];
    rows: Array<CellType> = [];
    tarifa: Array<CellType> = [];
    row: Array<CellType> = [];
    bbdd: Array<CellType> = [];
    model = new ruckgabeType();
    MapList: Array<MapType> = [];
    filesToUpload: Array<File> = [];

    dHeight: any;
    dWidth: any;


    rowHeaders: Array<string> = ['1,00', '1,20', '1,40', '1,60', '1,80', '2,00', '2,20', '2,40', '2,60', '2,80', '3,00'];
    colHeaders: Array<string> = ['1,00', '1,20', '1,40', '1,60', '1,80', '2,00', '2,20', '2,40', '2,60', '2,80'];

    name = 'Paste it';
    val: any;
    displayedColumns: string[] = [];
    dataSource: any[] = [];




    constructor(private service: HaruService,
        private upload: UploadService,
        private toaster: ToastrService,
        vRef: ViewContainerRef,
        private route: ActivatedRoute,
        private router: Router) {
        // this.toaster.setRootViewContainerRef(vRef);

        this.dWidth = (window.screen.height) + "px";
        this.dHeight = (window.screen.width) + "px";


    }

    ngOnInit() {


        this.sub = this.route.queryParams.subscribe(params => {
            this.model.id = +params['id'] || -1;

            this.model.fecha = new Date(new Date().getFullYear(), new Date().getUTCMonth(), 1);
            this.search.TipoT = 1;
            this.loadMaster();
            this.BuildArray();

            if (this.model.id > 0) {
                this.loadHeader(this.model.id);
            }
            else {
                this.Build();
            }

        });

    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    ngAfterViewInit() {
    }



    Delete() {

        if (confirm("¿Desea Eliminar la TARIFA?")) {
            var route = '/tarifa_delete_all';
            var map = {
                idrow: this.model.id
            };

            var values = JSON.stringify(map);
            this.service.HTTP_Post(route, values).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.New();
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }

    CargaModelos() {
        this.lista_modelos = [];
        let marca = this.search.Marca;
        let url = "/accionamientos_modelos/" + marca;
        console.log(url);
        this.service.HTTP_Get('/sm' + url).subscribe(
            data => {
                if (data.Table.length > 0)
                    this.lista_modelos = data.Table;
                else
                    this.lista_modelos.push({ idrow: -1, tipo: 'TODOS' });
            },
            error => {
                console.log(error);
            });
    }

    onDateChange(e, e1) {

    }

    Search() {
        this.router.navigate(['/routes/herstellen/tarifs']);
    }


    SaveMap() {
        var route = "/tarifa_map";


        var map = {
            idrow: this.model.id,
            values: this.MapList,
            type: this.search.TipoT
        }

        var values = JSON.stringify(map);

        this.service.HTTP_Post(route, values).subscribe(
            data => {
                console.log(data);
            },
            error => {
                console.log(error);
            }
        );
    }

    loadMap(idrow: number) {

        var route = "/tarifa_lineas/" + idrow;
        this.service.HTTP_Get('/sm' + route).subscribe(
            data => {

                this.bbdd = data.Table;
                this.BuildFromBBDD();
            },
            error => {
                console.log(error);
            });
    }

    BuildFromBBDD() {

        var colCount = this.colHeaders.length;
        var rowCount = this.rowHeaders.length;
        var positions = (1 + colCount) * (1 + rowCount);



        //if (this.bbdd.length == positions) {

        this.MapList = [];
        this.headers = [];
        var pos = 0;
        this.headers.push(this.bbdd[pos]);
        for (var c = 0; c < colCount; c++) {
            pos++;
            this.headers.push(this.bbdd[pos]);
        }

        this.MapList.push({ p: pos, c: this.headers });

        for (var r = 0; r < rowCount; r++) {
            pos++;
            this.row.push(this.bbdd[pos]);
            for (var c = 0; c < colCount; c++) {
                pos++;
                this.row.push(this.bbdd[pos]);
            }
            this.MapList.push({ p: pos, c: this.row });
            this.row = [];
        }
        /*
        } else {

            this.MapList = [];
            this.Build();
            this.toaster.error('Error en la carga de líneas', 'Error Lineas de Tarifa');
        }*/
    }

    Build() {

        var colCount = this.colHeaders.length;
        var rowCount = this.rowHeaders.length;
        var pos = 0;

        this.headers = [];

        this.headers.push({ x: 0, y: pos, v1: '', v2: '', cl: '', t: 'ch', rx: '0', ry: '0' });
        for (var c = 0; c < colCount; c++) {
            this.headers.push({ x: c + 1, y: pos, v1: this.colHeaders[c], v2: '', cl: 'BW80', t: 'ch', rx: '0', ry: '0' });
        }


        this.MapList.push({ p: pos, c: this.headers });

        for (var r = 0; r < rowCount; r++) {

            pos++;
            this.row.push({ x: 0, y: pos, v1: this.rowHeaders[r], v2: '', cl: 'BW60', t: 'rh', rx: '0', ry: '0' });

            for (var c = 0; c < colCount; c++) {
                this.row.push({ x: c + 1, y: pos, v1: '', v2: '', cl: 'W80', t: 'rw', rx: this.colHeaders[c], ry: this.rowHeaders[r] });
            }
            this.MapList.push({ p: pos, c: this.row });
            this.row = [];
        }

    }




    loadMaster() {


        this.service.HTTP_Get('/sm/clientesapi_filter').subscribe(
            data => {
                this.lista_clientes = data.Table;
            },
            error => { }
        );


        this.service.HTTP_Get('/sm/accionamientos_filter').subscribe(
            data => {
                this.lista_accionamientos = data.Table;
            },
            error => { }
        );


        this.service.HTTP_Get('/sm/tubos_filter').subscribe(
            data => {
                this.lista_tubos = data.Table;
            },
            error => { }
        );

        this.service.HTTP_Get('/sm/anchoslama').subscribe(
            data => {
                this.lista_anchoslama = data.Table;
            },
            error => { }
        );

        this.service.HTTP_Get('/sm/cajones/-1').subscribe(
            data => {
                this.lista_cajones = data;
            },
            error => { }
        );

    }


    LoadMarcas(tipo) {

        let value = this.search.Tipo;
        var route = "/accionamientos_tipos_filter/" + value;

        this.service.HTTP_Get('/sm' + route).subscribe(
            data => {
                this.lista_marcas = data.Table;
                this.search.Marca = tipo;
                if (value == 3) {
                    this.CargaModelos();
                }
            },
            error => { }
        );
    }

    LoadTejidos(tejido) {
        let value = this.search.Cliente;
        var route = "/tejidos_cliente_filter/" + value;
        this.service.HTTP_Get('/sm' + route).subscribe(
            data => {
                this.lista_tejidos = data.Table;
                this.search.Tejido = tejido;
            },
            error => { }
        );
    }


    ChangeTipo(event) {
        this.LoadMarcas(-1);
    }

    ChangeCliente(event) {
        this.LoadTejidos(-1);
    }

    ChangeProducto(event) {

    }


    New() {
        this.MapList = [];
        this.Build();
        this.model.id = -1;
        this.model.fecha = new Date();
        this.model.numero = -1;
        this.model.referencia = "";
        this.model.idCliente = -1;
        this.model.nombrecliente = "Seleccionar";
        this.model.nombreentrega = "";
        this.model.observaciones = "";
        this.model.estado = 0;
        this.model.almacen = -1;
        this.model.responsable = -1;
        this.search.TipoT = 1
        this.Lines = 0;
        this.router.navigate(['/routes/herstellen/tarif'], { queryParams: { id: -1 } });
    }



    Save() {

        var values = {
            idrow: this.model.id,
            fecha: this.model.fecha.toLocaleDateString("es-ES"),
            observaciones: this.model.observaciones,
            cliente: this.search.Cliente,
            tipo: this.search.Tipo,
            marca: this.search.Marca,
            modelo: this.search.Modelo,
            tubo: this.search.Tubo,
            tejido: this.search.Tejido,
            rows: this.rowHeaders.length,
            cols: this.colHeaders.length,
            impresion: this.search.Impresion,
            tipot: this.search.TipoT,
            producto: this.search.Producto,
            ancholama: this.search.AnchoLama,
            promocion_activa: this.model.promocion_activa,
            promocion_coeficiente: this.model.promocion_coeficiente,
            promocion_modificapvp: this.model.promocion_modificapvp,
            promocion_modificapvc: this.model.promocion_modificapvc,
            cajon: this.search.Cajon,
            lacado: this.search.Lacado
        }

        var routes = "/tarifas";
        let json: string = JSON.stringify(values);


        if (confirm("¿Desea Actualizar?")) {
            this.service.HTTP_Post(routes, json).subscribe(
                data => {
                    if (data.message == "OK") {

                        this.toaster.success('Actualización realizada', 'Actualizar Tarifa');
                        if (this.model.id == -1) {
                            var id = data.idrow;
                            this.model.id = data.idrow;
                            if (this.model.id > 0) {
                                this.SaveMap();
                                this.router.navigate(['/routes/herstellen/tarif'], { queryParams: { id: id } });
                            }
                        }
                        else {
                            this.model.id = data.idrow;
                            this.SaveMap();
                        }
                    } else {
                        alert("Error en la grabación");
                        this.toaster.error('Error en la Actualización', 'Actualizar');
                    }
                },
                error => {
                    console.log(error);
                });
        }
    }

    BuildArray() {

        var arrType: number = this.search.TipoT;

        if (arrType == 1) {
            this.rowHeaders = ['1,00', '1,20', '1,40', '1,60', '1,80', '2,00', '2,20', '2,40', '2,60', '2,80', '3,00'];
            this.colHeaders = ['1,00', '1,20', '1,40', '1,60', '1,80', '2,00', '2,20', '2,40', '2,60', '2,80'];
        }

        if (arrType == 2) {
            this.colHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40'];
            this.rowHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00'];
        }

        if (arrType == 3) {
            this.colHeaders = ['0.40', '0.60', '0.80', '1.00', '1.20'];
            this.rowHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20'];

        }

        if (arrType == 4) {
            this.colHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00'];
            this.rowHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00'];
        }

        if (arrType == 5) {
            this.colHeaders = ['1.00', '1.10', '1.20', '1.30', '1.40', '1.50', '1.60', '1.70', '1.80', '1.90', '2.00', '2.10', '2.20', '2.30', '2.40', '2.50', '2.60', '2.70', '2.80', '2.90'];
            this.rowHeaders = ['1.00', '1.10', '1.20', '1.30', '1.40', '1.50', '1.60', '1.70', '1.80', '1.90', '2.00', '2.10', '2.20', '2.30', '2.40', '2.50', '2.60', '2.70', '2.80', '2.90', '3.00', '3.10', '3.20', '3.30', '3.40', '3.50', '3.60', '3.70', '3.80', '3.90', '4.00'];
        }

        if (arrType == 6) {
            this.colHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.40', '3.60', '3.80', '4.00', '4.20', '4.40', '4.60', '4.80', '5.00', '5.20', '5.40', '5.60', '5.80', '6.00'];
            this.rowHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.40', '3.60', '3.80', '4.00', '4.20', '4.40', '4.60', '4.80', '5.00', '5.20', '5.40', '5.60', '5.80', '6.00'];
        }

        if (arrType == 7) {
            this.colHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.40', '3.60', '3.80', '4.00', '4.20', '4.40', '4.60', '4.80', '5.00'];
            this.rowHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00'];
        }

        if (arrType == 8) {
            this.rowHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.40', '3.60', '3.80', '4.00'];
            this.colHeaders = ['1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80'];
        }

        if (arrType == 9) {
            this.colHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00', '3.20', '3.40', '3.60', '3.80'];
            this.rowHeaders = ['0.60', '0.80', '1.00', '1.20', '1.40', '1.60', '1.80', '2.00', '2.20', '2.40', '2.60', '2.80', '3.00'];
        }
    }




    loadHeader(idrow: number) {
        var route = "/tarifa/" + idrow;
        this.service.HTTP_Get('/sm' + route).subscribe(
            data => {
                this.model.id = data.Table[0].idrow;
                this.model.numero = data.Table[0].codigo;
                this.model.observaciones = data.Table[0].descripcion;
                this.model.fecha = new Date(data.Table[0].fecha);
                this.model.coeficiente = data.Table[0].coeficiente;
                this.model.promocion_coeficiente = data.Table[0].promocion_coeficiente;
                this.model.promocion_activa = data.Table[0].promocion_activa;
                this.model.promocion_modificapvp = data.Table[0].promocion_modificapvp,
                    this.model.promocion_modificapvc = data.Table[0].promocion_modificapvc;

                var marca = parseInt(data.Table[0].marcas);
                var modelo = parseInt(data.Table[0].modelo);
                var tejidos = parseInt(data.Table[0].tejidos);

                this.search.Cliente = parseInt(data.Table[0].clientes);
                this.search.Tipo = parseInt(data.Table[0].tipos);
                this.search.Tubo = parseInt(data.Table[0].tubos);
                this.search.Impresion = parseInt(data.Table[0].impresion);
                this.search.TipoT = parseInt(data.Table[0].tipo);
                this.search.Producto = parseInt(data.Table[0].producto);
                this.search.AnchoLama = parseInt(data.Table[0].ancholama);
                this.search.Cajon = parseInt(data.Table[0].cajon);
                this.search.Lacado = parseInt(data.Table[0].lacado);
                this.search.Modelo = modelo;

                this.LoadMarcas(marca);
                this.LoadTejidos(tejidos);

                this.BuildArray();

                this.Lines = 1;
                this.bbdd = [];
                this.loadMap(this.model.id);
            },
            error => {
                console.log(error);
            }

        );
    }

    Add() {
        this.add.id = 0;
        this.add.idrow = this.model.id;
        var routes = "/tarifa_lineas";
        let json: string = JSON.stringify(this.add);

        if (confirm("¿Desea Agregar?")) {
            this.service.HTTP_Post(routes, json).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.loadMap(this.model.id);
                    }
                },
                error => {
                    console.log(error);
                });
        }
    }

    DeleteLines() {
        if (confirm("¿Desea Eliminar las Lineas?")) {
            var idrow = this.model.id;
            this.service.HTTP_Get('/sm/tarifa_deletelines/' + idrow).subscribe(
                data => {
                    if (data.message == "OK") {
                        this.MapList = [];
                        this.BuildArray()
                        this.Build();
                        this.toaster.success('Borradas las líneas', 'Borrar Lineas de Tarifa');
                    }
                },
                error => {
                    console.log(error);
                });
        }
    }

    fileChangeEvent(fileInput: any) {


        this.add.idrow = this.model.id;

        if (confirm("¿Desea Agregar?")) {
            this.filesToUpload = <Array<File>>fileInput.target.files;

            var idrow = this.add.idrow.toString();
            var tipo = this.search.TipoT;
            var url: string = this.service.Master_NH_Upload_Tarifa_URL(idrow, tipo.toString());
            this.upload.makeFileRequest(url, [], this.filesToUpload, 'token', 'file')
                .then((result: any) => {

                    if (result.message == "OK") {
                        this.toaster.success('Tarifa Importada', 'Importar Tarifa');
                        this.loadHeader(this.model.id);
                        //this.loadMap(this.model.id);
                    } else {
                        this.toaster.error("Imposible subir imagen", "Importar Imagen");
                    }
                })
                .catch((result: any) => {
                    console.log(result);
                })

        }

    }

    Regenerate() {

        var idrow = this.model.id;
        var coef = this.model.coeficiente;

        if (confirm("¿Inicio el proceso de regeneración?")) {

            var strcoef = coef.toString();
            strcoef = strcoef.replace(',', '.');

            var map = {
                idrow: idrow,
                coef: strcoef
            };

            var route = "/tarifa_regenerate";
            var values = JSON.stringify(map);

            this.service.HTTP_Post(route, values).subscribe(
                data => {

                    if (data.message == "OK") {
                        this.toaster.success('Completado el Proceso', 'Proceso de Regeneración');
                        this.loadMap(this.model.id);
                    }
                    else {
                        this.toaster.error('Imposible completar el proceso', 'Proceso de Regeneración');
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }

    Regenerate2() {

        var idrow = this.model.id;
        var coef = this.model.coeficiente;

        if (confirm("¿Inicio el proceso de generación de c1 desde pvp?")) {

            var strcoef = coef.toString();
            strcoef = strcoef.replace(',', '.');

            var map = {
                idrow: idrow,
                coef: strcoef
            };

            var route = "/tarifa_regenerate2";
            var values = JSON.stringify(map);

            this.service.HTTP_Post(route, values).subscribe(
                data => {

                    if (data.message == "OK") {
                        this.toaster.success('Completado el Proceso', 'Proceso de Regeneración');
                        this.loadMap(this.model.id);
                    }
                    else {
                        this.toaster.error('Imposible completar el proceso', 'Proceso de Regeneración');
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }
    }


    data(event: ClipboardEvent) {
        let clipboardData = event.clipboardData;
        if (!clipboardData) {
            return;
        }
        let pastedText = clipboardData.getData('text');
        let row_data = pastedText.split('\n');
        //this.displayedColumns = row_data[0].split('\t');
        //delete row_data[0];
        // Create table dataSource
        let data: any[] = [];

        row_data.forEach(row_data => {

            let row = row_data.split('\t');
            let values = row.join(";");
            if (values != "")
                data.push(values);


            /*
            let row = {};
            this.displayedColumns.forEach((a, index) => { row[a] = row_data.split('\t')[index] });
            console.log(row);
            data.push(row);
            */
        })
        this.dataSource = data;

        var idrow = this.model.id;
        var tipo = this.search.TipoT;

        let tag = {
            values: data
        }
        if (confirm("¿Desea importar los valores?")) {

            var route = "/tarifa_paste/" + idrow + "/" + tipo;

            var values = JSON.stringify(tag);

            this.service.HTTP_Post(route, values).subscribe(
                data => {

                    if (data.message == "OK") {
                        this.toaster.success('Completado el Proceso', 'Importación');
                        this.loadMap(this.model.id);
                    }
                    else {
                        this.toaster.error('Imposible completar el proceso', 'Importación');
                    }
                },
                error => {
                    console.log(error);
                }
            );
        }

    }



}
