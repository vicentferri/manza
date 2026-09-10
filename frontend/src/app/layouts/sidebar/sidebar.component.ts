import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private router: Router) { }

  Show = true;
  Enlace = '';
  currentUser: any = null;

  ngOnInit() {
    if (environment.firmaID === '004') {
      this.Show = false;
    } else {
      this.Show = true;
    }
    this.Enlace = environment.lm;

    const u = localStorage.getItem('currentUser');
    if (u) {
      this.currentUser = JSON.parse(u);
    }
  }

  ngAfterViewInit() { }

  /** ¿El usuario logueado es administrador total? */
  isAdmin(): boolean {
    return this.currentUser && this.currentUser.isAdmin === true;
  }

  /** ¿El usuario tiene permiso para un módulo concreto? */
  can(modulo: string): boolean {
    if (this.isAdmin()) { return true; }
    const permisos: string[] = (this.currentUser && this.currentUser.permisos) || [];
    return permisos.includes(modulo);
  }

  /** ¿Tiene permiso para al menos uno de los módulos de un grupo? (controla visibilidad del menú padre) */
  canAny(modulos: string[]): boolean {
    if (this.isAdmin()) { return true; }
    return modulos.some(m => this.can(m));
  }
}
