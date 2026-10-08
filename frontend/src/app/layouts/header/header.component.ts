import { Component, OnInit, OnDestroy, DoCheck, Input } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isSidebarHidden, setSidebarHidden } from '../../shared/sidebar-state';
import { getPageTitle, PageTitle } from '../../shared/page-titles';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy, DoCheck {

  username = "username";

  /** Solo el layout con menú lateral (equipo interno) muestra el botón de ocultar/mostrar menú. */
  @Input() showSidebarToggle = false;

  /** Pantalla actual (sección + nombre) que se muestra junto al botón del menú. */
  pageTitle: PageTitle | null = null;
  private routerSub: Subscription;

  constructor(private router: Router, private service: HaruService) { }

  ngOnInit() {
    this.pageTitle = getPageTitle(this.router.url);
    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.pageTitle = getPageTitle(e.urlAfterRedirects);
      }
    });

    if (localStorage.getItem('currentUser')) {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.username = user.name;

      //document.body.setAttribute('data-topbar', 'dark');


    }
  }

  ngDoCheck() {


  }

  ngOnDestroy() {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  sidebarHidden(): boolean {
    return isSidebarHidden();
  }

  toggleSidebar() {
    setSidebarHidden(!isSidebarHidden());
  }

  logout() {
    this.service.logout();
    this.router.navigate(['/pages/login']);
  }

  setHeader() {

    let cssClasses;
    // El layout interno (con menú lateral) va siempre en negro
    let header = this.showSidebarToggle ? 'black' : environment.header;

    if (header === "black") {
      cssClasses = {
        'black app-header navbar': true,
      }
    }

    else if (header === "blue") {
      cssClasses = {
        'blue app-header navbar': true,
      }
    }
    else
      if (header === "red") {
        cssClasses = {
          'red app-header navbar': true,
        }
      }
      else
        if (header === "green") {
          cssClasses = {
            'green app-header navbar': true,
          }
        }
        else
          if (header === "yellow") {
            cssClasses = {
              'yellow app-header navbar': true,
            }
          }
          else
            if (header === "orange") {
              cssClasses = {
                'orange app-header navbar': true,
              }
            }
            else {
              cssClasses = {
                'blue app-header navbar': true,
              }
            }

    return cssClasses;
  }

}
