import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HaruService } from '../../services/haru.service';

@Component({
    selector: 'mult-kust-add',
    templateUrl: './mult-kust-add.component.html',
    styleUrls: ['./mult-kust-add.component.css'],
    providers: [HaruService]
})
export class MultKustAddComponent implements OnInit {

    clientes: any = [];
    cliente: string = "-1";

    @Output() select = new EventEmitter();

    constructor(private service: HaruService) { }

    ngOnInit() {

    }

    ngAfterViewInit() {

        this.loadValues();
    }


    loadValues() {

        this.service.HTTP_Get('/sm/clientesapi').subscribe(
            data => {
                this.clientes = data.Table;
            },
            error => {
                console.log(error);
            });
    }

    ChangeCliente(event) {
        //console.log(event);
    }

    add() {
        var target = this.cliente;
        if (target != "-1") {
            this.select.emit(target);
        }
        else {
            alert("No ha seleccionado ningún cliente");
        }
    }

}
