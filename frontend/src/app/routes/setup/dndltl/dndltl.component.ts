import { Component, OnInit } from '@angular/core';
import {HaruService} from '../../../services/haru.service';

@Component({
  selector: 'app-dndltl',
  templateUrl: './dndltl.component.html',
  styleUrls: ['./dndltl.component.css'],
  providers: [HaruService]
})
export class DndltlComponent implements OnInit {

  datalist : any = [];
  title : string = '';
  
  constructor(private service: HaruService) 
  {


  }

  ngOnInit() {
    this.loadlist();
  }

  loadlist(){

      var route = "";
      this.service.HTTP_Get("/sm/tubos").subscribe(
        data => {
          console.log(data);
          this.datalist = data.Table;
        },
        error => {}
      );
  }

  onMove(item: any, position: number) {
    //this.todoDataService.moveTask(todo, position);
    console.log(item);
    console.log(position);
}

toggleTodoComplete(item:any){
  console.log(item);
}

removeTodo(item:any){

}

addTodo()
{
  
}

}
