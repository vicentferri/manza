import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  public authToken: string;

  constructor(private router: Router) {

    this.authToken = localStorage.getItem('registerToken') || '';

  }

  /*
  login() {
    localStorage.removeItem('registerDate');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('registerToken');
    this.router.navigate(['/pages/login']);
  }
  */
}
