import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'itemname'
})
export class ItemnamePipe implements PipeTransform {

  transform(value: any, args?: any): any {

    if (value != null){
      return value.name;
    } else {
    return "";
    }
  }

}
