import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'form-bestellung',
  templateUrl: './form-bestellung.component.html',
  styleUrls: ['./form-bestellung.component.css']
})
export class FormBestellungComponent implements OnInit {

  @Input() item : any;

  constructor() { }

  ngOnInit() {

      //console.log("INSIDE");
      console.log(this.item);
  }

}
