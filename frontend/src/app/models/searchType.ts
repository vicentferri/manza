export class SearchType {
   
       Numero1   : number;
       Numero2   : number;
       Fecha1    : Date;
       Fecha2    : Date;
       Objeto    : string;
       Almacen   : number;
       _Fecha1   : string;
       _Fecha2   : string;
       Pais      : number;
       Provincia : string;
       Cadena    : number;
       Actividad : number;
       Gestion   : number;
       Sector    : number; 
       
       constructor(){
           this.Numero1 = 1;
           this.Numero2 = 99999;
           this.Fecha1 = new Date(new Date().getFullYear(), new Date().getMonth(), 1); 
           this.Fecha2 = new Date();
           this._Fecha1 = this.Fecha1.toLocaleDateString("es-ES");
           this._Fecha2 = this.Fecha2.toLocaleDateString("es-ES");
           
          
           this.Objeto ="";
           this.Almacen = -1;
           this.Pais      = -1;
           this.Provincia = "";
           this.Cadena    = -1;
           this.Actividad = -1;
           this.Gestion   = -1;
           this.Sector    = -1; 
       }
}

