import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CortinaTipo } from '../config/CortinaTipo';

@Component({
  selector: 'app-preview-3',
  templateUrl: './preview-3.component.html',
  styleUrls: ['./preview-3.component.css']
})
export class Preview3Component implements OnInit {

  @Input() item!: CortinaTipo;
  @Output() onDelete = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  isCopied1 = false;


  constructor() { }

  ngOnInit() {
  }

  DeleteLine(item) {
    this.onDelete.emit(item);
  }

  EditLine(item) {
    this.onEdit.emit(item);
  }

}
