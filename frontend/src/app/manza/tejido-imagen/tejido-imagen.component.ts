import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/*
 * Imágenes del color de tejido elegido (verso y reverso), debajo del desplegable de color
 * de cada producto. Solo para Leroy Merlín (clientes 1 y 5); se mantienen en Nuevo sistema >
 * Imágenes de Tejidos (SOL_TEJIDOS_COLORES_IMAGENES). Si el color no tiene imagen no se ve nada.
 * Los colores "... R" y "... V" son el mismo tejido por el verso y por el reverso: se marca la cara elegida.
 */
@Component({
   selector: 'app-tejido-imagen',
   templateUrl: './tejido-imagen.component.html',
   styleUrls: ['./tejido-imagen.component.css']
})
export class TejidoImagenComponent implements OnChanges {

   @Input() cliente: any;
   @Input() tejido: any;
   @Input() color: any;
   /** Lista de colores del desplegable ({ id, text }): para saber si es un color R o V */
   @Input() colores: any[] = [];

   imagenes: { cara: string, nombre: string, url: string }[] = [];
   ampliada: any = null;

   // Versiones por tejido/color, para no repetir la petición al volver a un color
   private static versiones = new Map<string, any>();
   private url = environment.host_ip + '/api/sm/tejidos_imagenes/';
   private clave = '';

   constructor(private http: HttpClient) { }

   ngOnChanges() {
      const tejido = parseInt(this.tejido, 10);
      const color = parseInt(this.color, 10);
      const leroy = this.cliente == '1' || this.cliente == '5';
      if (!leroy || !(tejido > 0) || !(color > 0)) {
         this.clave = '';
         this.imagenes = [];
         return;
      }
      const clave = tejido + '/' + color;
      if (clave === this.clave) { return; }
      this.clave = clave;
      this.imagenes = [];

      const guardadas = TejidoImagenComponent.versiones.get(clave);
      if (guardadas) {
         this.mostrar(clave, guardadas);
         return;
      }
      this.http.get(this.url + 'caras/' + clave).subscribe(
         versiones => {
            TejidoImagenComponent.versiones.set(clave, versiones);
            if (clave === this.clave) { this.mostrar(clave, versiones); }
         },
         () => { this.imagenes = []; }
      );
   }

   /** Cara elegida en los colores R / V; null en el resto */
   get caraElegida(): string {
      const fila = (this.colores || []).find(c => c && String(c.id) === String(this.color));
      const texto = String((fila && fila.text) || '').trim().toUpperCase();
      if (/ R$/.test(texto)) { return 'A'; }
      if (/ V$/.test(texto)) { return 'B'; }
      return null;
   }

   private mostrar(clave: string, versiones: any) {
      this.imagenes = ['A', 'B']
         .filter(cara => versiones && versiones[cara])
         .map(cara => ({
            cara,
            nombre: cara === 'A' ? 'VERSO' : 'REVERSO',
            url: this.url + 'imagen/' + clave + '/' + cara + '?v=' + versiones[cara]
         }));
   }
}
