import { Component } from '@angular/core';
//import {Location} from '@angular/common';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'verboten.component.html'
})
export class pVerbotenComponent {

  constructor(private router : Router) 
  {}

  Back(){
    
   //this._location.back();
   this.router.navigate(['/'] );
   
  }

  Login(){
    this.router.navigate(['/pages/login'] );
  }

}