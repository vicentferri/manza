import { Component, OnInit, Input, Output, EventEmitter  } from '@angular/core';
import {CortinaTipo} from '../config/CortinaTipo';

@Component({
  selector: 'app-preview-2',
  templateUrl: './preview-2.component.html',
  styleUrls: ['./preview-2.component.css']
})
export class Preview2Component implements OnInit {

  @Input() item : CortinaTipo;
  @Output() onDelete = new EventEmitter();
  @Output() onEdit = new EventEmitter();
  isCopied1 = false;
 

  constructor() { }

  ngOnInit() {
  }

  DeleteLine(item){
    this.onDelete.emit(item);
  }

  EditLine(item)
  {
    this.onEdit.emit(item);
  }

}
