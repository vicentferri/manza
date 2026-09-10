import { Component, OnInit, DoCheck } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, DoCheck {

  username = "username";

  constructor(private router: Router, private service: HaruService) { }

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      var user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      this.username = user.name;

      //document.body.setAttribute('data-topbar', 'dark');


    }
  }

  ngDoCheck() {


  }

  logout() {
    this.service.logout();
    this.router.navigate(['/pages/login']);
  }

  setHeader() {

    let cssClasses;
    let header = environment.header;

    if (header === "black") {
      cssClasses = {
        'black app-header navbar': true,
      }
    }

    if (header === "blue") {
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
