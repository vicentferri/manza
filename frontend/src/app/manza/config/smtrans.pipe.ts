import { Pipe, PipeTransform } from '@angular/core'; 

@Pipe({name: 'smtrans'})
export class SMTransPipe implements PipeTransform {
    
     transform(value : string) : any
     {
        let nvalue = "";
        if (value == "IZ") nvalue = "IZQUIERDA";
        if (value == "DE") nvalue = "DERECHA";
        if (value == "AL") nvalue = "AMBOS LADOS";
        if (value == "TEC") nvalue = "TECHO";
        if (value == "P06") nvalue = "PARED 6 cm";
        if (value == "P08") nvalue = "PARED 9 cm";        
        if (value == "P12") nvalue = "PARED 12 cm";
        if (value == "P15") nvalue = "PARED 15 cm";        
        if (value == "P17") nvalue = "PARED 17 cm";
        if (value == "089") nvalue = "89 mm";
        if (value == "127") nvalue = "127 mm";
        if (value == "COR") nvalue = "CORDON";
        if (value == "VAR") nvalue = "VARILLA";
        if (value == "MSM") nvalue = "MOTOR SIN MANDO";
        if (value == "MM1") nvalue = "MOTOR MANDO 1 CANAL"; 
        if (value == "MM6") nvalue = "MOTOR MANDO 6 CANALES";                                
        return  nvalue;
     }
}

