import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'haru-btn-general',
  templateUrl: './haru-btn-general.component.html',
  styleUrls: ['./haru-btn-general.component.css']
})
export class HaruBtnGeneralComponent implements OnInit {

  model = {
    bloqueo: 0
  };

  @Output() Event_New = new EventEmitter();
  @Output() Event_Save = new EventEmitter();
  @Output() Event_Search = new EventEmitter();
  @Output() Event_Delete = new EventEmitter();

  public isNewUsed = false;
  public isSaveUsed = false;
  public isSearchUsed = false;
  public isDeleteUsed = false;



  constructor() { }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    var key = event.key;
    if (key == 'F6') {
      this.New();
      event.preventDefault();
    }
    if (key == 'F7') {
      this.Search();
      event.preventDefault();
    }
    if (key == 'F8') {
      this.Save();
      event.preventDefault();
    }
    if (key == 'F9') {
      this.Delete();
      event.preventDefault();
    }

  }


  ngOnInit() {

    this.isNewUsed = this.Event_New.observers.length > 0;
    this.isSaveUsed = this.Event_Save.observers.length > 0;
    this.isSearchUsed = this.Event_Search.observers.length > 0;
    this.isDeleteUsed = this.Event_Delete.observers.length > 0;
  }

  New() {
    if (this.isNewUsed) {
      this.Event_New.emit();
    }
  }

  Search() {
    if (this.isSearchUsed) {
      this.Event_Search.emit();
    }
  }

  Save() {
    if (this.isSaveUsed) {
      this.Event_Save.emit();
    }
  }

  Delete() {
    if (this.isDeleteUsed) {
      this.Event_Delete.emit();
    }
  }

}
