import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'twocolumn'})
export class TwoColumnPipe implements PipeTransform {

     transform(value : any) : any
     {
       let nvalue = "";

       var blank = "";
       var len = value.text.length;
       var toSum = 25 - len;


       nvalue = value.text + blank.repeat(toSum) + value.codigoprov;

        return nvalue;
     }
}
