import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';


@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {



    if (localStorage.getItem('registerDate')) {

      var ldate = localStorage.getItem('registerDate');
      if (ldate === null) {
        this.router.navigate(['/pages/login']);
        return false;
      }
      var storedDate = new Date(JSON.parse(ldate));
      var currentDate = new Date();
      var timeDiff = Math.abs(currentDate.getTime() - storedDate.getTime());
      var diffMin = Math.ceil(timeDiff / (1000 * 60));

      if (diffMin > 240) {
        localStorage.removeItem('registerDate');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('registerToken');
        this.router.navigate(['/pages/login']);
        return false;
      }


    }
    else {
      this.router.navigate(['/pages/login']);
      return false;
    }

    if (localStorage.getItem('currentUser')) {

      let user = localStorage.getItem('currentUser');
      let userValues = JSON.parse(user!);
      if (userValues.integracion > 0) {
        this.router.navigate(['/pages/login']);
        return false;
      }


      else {
        return true;
      }
    }
    //this.router.navigate(['/pages/login'], { queryParams : { returnUrl: state.url }} );
    this.router.navigate(['/pages/login']);
    return false;
  }


  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (localStorage.getItem('currentUser')) {
      var user = localStorage.getItem('currentUser');
      if (user !== null) {
        var juser = JSON.parse(user);
        var role = juser.role;
        return true;
      } else {
        this.router.navigate(['/pages/login']);
        return false;
      }
    }
    else {
      this.router.navigate(['/pages/login']);
      return false;
    }

  }
}
