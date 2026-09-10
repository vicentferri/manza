import { Component, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

    constructor(private router: Router) {


    }

    ngOnInit() {
        document.querySelector('body').classList.toggle('aside-menu-hidden');
        //document.querySelector('body').classList.toggle('sidebar-hidden');
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
