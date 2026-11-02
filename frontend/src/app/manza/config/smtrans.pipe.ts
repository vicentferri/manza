import { Pipe, PipeTransform } from '@angular/core'; 

// Códigos de vertical (posición, soporte, lama, accionamiento) a texto en español con formato de frase.
// En la cesta se encadena con | translate, que lo pasa al idioma del usuario.
@Pipe({name: 'smtrans'})
export class SMTransPipe implements PipeTransform {
    
     transform(value : string) : any
     {
        let nvalue = "";
        if (value == "IZ") nvalue = "Izquierda";
        if (value == "DE") nvalue = "Derecha";
        if (value == "AL") nvalue = "Ambos lados";
        if (value == "TEC") nvalue = "Techo";
        if (value == "P06") nvalue = "Pared 6 cm";
        if (value == "P08") nvalue = "Pared 8 cm";
        if (value == "P10") nvalue = "Pared 10 cm";
        if (value == "P12") nvalue = "Pared 12 cm";
        if (value == "P14") nvalue = "Pared 14 cm";
        if (value == "P15") nvalue = "Pared 15 cm";
        if (value == "P17") nvalue = "Pared 17 cm";
        if (value == "P19") nvalue = "Pared 19 cm";
        if (value == "P21") nvalue = "Pared 21 cm";
        if (value == "P23") nvalue = "Pared 23 cm";
        if (value == "089") nvalue = "89 mm";
        if (value == "127") nvalue = "127 mm";
        if (value == "COR") nvalue = "Cordón";
        if (value == "VAR") nvalue = "Varilla";
        if (value == "MSM") nvalue = "Motor sin mando";
        if (value == "MM1") nvalue = "Motor mando 1 canal";
        if (value == "MM6") nvalue = "Motor mando 6 canales";
        return nvalue || value;
     }
}
