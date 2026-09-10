import { Component, Input, OnInit } from '@angular/core';
import { HaruService } from '../../services/haru.service';
import { Select2OptionData } from 'ng2-select2';

@Component({
  selector: 'app-selectable',
  templateUrl: './selectable.component.html',
  styleUrls: ['./selectable.component.css']
})
export class SelectableComponent implements OnInit {

  @Input() seleccion = "-1";
  @Input() url = "/sm/colores";

  tipos: Array<Select2OptionData> = [];
  options: Select2Options;
  public value: string[];
  public current: string;



  constructor(private service: HaruService) { }

  ngOnInit() {
    this.loadMaster();

    this.options = {
      multiple: true,
      dropdownAutoWidth: true
    }

    /*
  
      this.value = ['multiple2', 'multiple4'];
  
      this.current = this.value.join(' | ');
      */
  }

  changed(data: { value: string[] }) {
    this.current = data.value.join(' | ');
  }


  loadMaster() {

    if (this.url == "truefalse") {
      this.tipos.push({ id: '0', text: 'NO' });
      this.tipos.push({ id: '1', text: 'SI' });
    }

    if (this.url.startsWith("/")) {

      this.service.HTTP_Get(this.url).subscribe(
        data => {
          this.tipos = data.Table;
          console.log(data.Table);
        },
        error => {
          console.log(error.message);
        });
    }
  }


}
