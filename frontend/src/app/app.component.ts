import { Component, HostBinding, OnInit, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { barrerRestosJqx } from './shared/jqx-barrendero';
declare var $: any;
declare var require;


const Push = require('../../node_modules/push.js');


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {


    @HostBinding('class.aside-toggled') get asideToggled() { return false; };

    private temporizadorBarrido: any = null;

    constructor(private router: Router, private zone: NgZone) {


    }

    ngOnInit() {
        document.querySelector('body').classList.toggle('aside-menu-hidden');
        //document.querySelector('body').classList.toggle('sidebar-hidden');

        /* Tras cada cambio de pantalla se quitan los restos de los widgets jqx de la pantalla anterior
           (shared/jqx-barrendero.ts). Fuera de la zona de Angular: no provoca detección de cambios */
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.zone.runOutsideAngular(() => {
                    clearTimeout(this.temporizadorBarrido);
                    this.temporizadorBarrido = setTimeout(() => barrerRestosJqx(), 1000);
                });
            }
        });
    }

    ngDoCheck() {

    }


    IsOk() {

        //this.sendMessage();

        if (localStorage.getItem('registerDate')) {

            var ldate = localStorage.getItem('registerDate');
            var storedDate = new Date(JSON.parse(ldate));
            var currentDate = new Date();
            var timeDiff = Math.abs(currentDate.getTime() - storedDate.getTime());
            var diffMin = Math.ceil(timeDiff / (1000 * 60));


            if (diffMin > 240) {
                localStorage.removeItem('registerDate');
                localStorage.removeItem('currentUser');
                return false;
            }

        }
        else {
            return false;
        }

        if (localStorage.getItem('currentUser')) {
            return true;
        }
        return false;
    }

    sendMessage() {

        Push.create("HOLA XATO");


    }


}
