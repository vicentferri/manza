import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { HaruService } from '../services/haru.service';

@Component({
    templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {

    model: any = {};
    loading = false;
    returnUrl: string;
    success: number = -1;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private service: HaruService) { }


    ngOnInit() {

        this.service.logout();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    Register() {
        this.router.navigate(['/pages/register']);
    }

    Login() {
        this.loading = true;
        var url = '/authenticate';
        var values = JSON.stringify({
            username: this.model.username,
            password: this.model.password,
            gettoken: 'true',
            ambito: 'I'
        });

        this.service.Authenticate(url, values).subscribe(
            data => {
                if (data.status == 401) {
                    this.success = 0;
                }
                else
                    if (data && data.token) {
                        var date = new Date();
                        localStorage.setItem('currentUser',    JSON.stringify(data));
                        localStorage.setItem('registerDate',   JSON.stringify(date));
                        localStorage.setItem('registerToken',  JSON.stringify(data.token));
                        localStorage.setItem('registerGroup',  JSON.stringify(data.group));
                        localStorage.setItem('registerName',   JSON.stringify(data.name));
                        localStorage.setItem('ambito',         JSON.stringify(data.ambito));
                        localStorage.setItem('integracion',    JSON.stringify(data.integracion));
                        localStorage.setItem('username',       JSON.stringify(data.username));
                        localStorage.setItem('user',           JSON.stringify(data.url));
                        localStorage.setItem('currentLanguage', data.language || 'es');
                        // Seguridad: tipo, isAdmin y permisos para PermisosGuard y sidebar
                        localStorage.setItem('tipoUsuario', data.tipo || 'interno');
                        localStorage.setItem('isAdmin',     JSON.stringify(data.isAdmin || false));
                        localStorage.setItem('permisos',    JSON.stringify(data.permisos || []));
                        this.router.navigate([data.url]);
                    }
            },
            error => {
                this.success = 0;
                this.loading = false;
            }
        );
    }
}
