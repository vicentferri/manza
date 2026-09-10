/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 export class Haru_Utils{
     
     
     public getDate(model:Date){
         
         /*
         var m1 = model.getMonth() + 1; //months from 1-12
         var d1 = model.getDate();
         var a1 = model.getFullYear();
         */
         var localDate = model.toLocaleDateString("es-ES");
            
         //var url: string = this.urlDevMercancia_Header_Set + "&id="+model.id;
         //url += "&fecha=" + d1 + "/" + m1 + "/" + a1;
         
         return localDate;
     }
 }
