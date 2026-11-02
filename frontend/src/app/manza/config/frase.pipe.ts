import { Pipe, PipeTransform } from '@angular/core';

// Siglas que se dejan en mayúsculas
const SIGLAS = ['RAL', 'ZIP', 'LED', 'PVC', 'USB', 'USB-C', 'A-OK', 'C1', 'PVP', 'ID', 'UV'];

/*
 * Textos que vienen de la base de datos en mayúsculas ("ARCE OPACO 300", "AUTO BLANCO") con formato de
 * frase: "Arce opaco 300", "Auto blanco". Solo cambia cómo se ve, no el valor.
 * - Si el texto ya tiene minúsculas se deja como está ("AM25 Plus L USB-C").
 * - Se respetan las siglas y las palabras con números (AM25, 300, 1%).
 * - La letra suelta del final se deja en mayúscula ("BLANCO R": cara del tejido).
 * - Después de "·" se vuelve a empezar con mayúscula ("Arce opaco 300 · Negro").
 */
@Pipe({ name: 'frase' })
export class FrasePipe implements PipeTransform {

   transform(value: any): any {
      if (typeof value !== 'string' || /[a-záéíóúüñ]/.test(value)) {
         return value;
      }
      const palabras = value.split(/(\s+)/);
      const ultima = palabras.length - 1;
      let inicio = true;
      return palabras.map((palabra, i) => {
         if (/^\s+$/.test(palabra) || palabra === '') return palabra;
         if (palabra === '·') { inicio = true; return palabra; }
         let resultado: string;
         if (SIGLAS.indexOf(palabra) > -1 || /\d/.test(palabra) || (palabra.length === 1 && i === ultima && i > 0)) {
            resultado = palabra;
         } else {
            resultado = palabra.toLowerCase();
            if (inicio) {
               resultado = resultado.charAt(0).toUpperCase() + resultado.slice(1);
            }
         }
         inicio = false;
         return resultado;
      }).join('');
   }
}
