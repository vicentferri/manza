import { Component, OnInit } from '@angular/core';
import { MenuItem } from './MenuItem';

@Component({
  selector: 'app-menu-select',
  templateUrl: './menu-select.component.html',
  styleUrls: ['./menu-select.component.css']
})
export class MenuSelectComponent implements OnInit {


  menuItems : Array<MenuItem> = [];

  constructor() { }

  ngOnInit() {

  	this.loadItems();
  }


  loadItems()
  {
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes largos 38 mm',Ref:'',PVP:7.80,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Soporte central 2 mandos 38 mm',Ref:'',PVP:18.33,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});
  	this.menuItems.push({ImageURL:'',Label:'Juego soportes cortos 38 mm',Ref:'',PVP:2.49,C1:'C1 0000128'});


  }

}
