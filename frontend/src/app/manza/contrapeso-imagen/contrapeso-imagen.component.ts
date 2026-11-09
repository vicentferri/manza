import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/*
 * Imagen del contrapeso elegido, debajo del desplegable de contrapeso del enrollable.
 * Solo para Leroy Merlín (clientes 1 y 5). Las imágenes van por modelo (IO, LUNA OCULTO...)
 * en SOL_ARTICULOS_CONTRAPESO_IMAGENES (sqlContrapesos/01 y 02). Si no tiene imagen no se ve nada.
 */
@Component({
   selector: 'app-contrapeso-imagen',
   templateUrl: './contrapeso-imagen.component.html',
   styleUrls: ['./contrapeso-imagen.component.css']
})
export class ContrapesoImagenComponent implements OnChanges {

   @Input() cliente: any;
   /** Id del contrapeso elegido (SOL_ARTICULOS_CONTRAPESO.idrow) */
   @Input() contrapeso: any;
   /** Lista del desplegable ({ id, text }): el nombre que se ve al pie de la imagen */
   @Input() contrapesos: any[] = [];

   url: string = null;
   ampliada = false;

   // Versión por contrapeso, para no repetir la petición al volver a uno
   private static versiones = new Map<number, number>();
   private base = environment.host_ip + '/api/sm/contrapesos_imagenes/';
   private id = 0;

   constructor(private http: HttpClient) { }

   ngOnChanges() {
      const id = parseInt(this.contrapeso, 10);
      const leroy = this.cliente == '1' || this.cliente == '5';
      if (!leroy || !(id > 0)) {
         this.id = 0;
         this.url = null;
         return;
      }
      if (id === this.id) { return; }
      this.id = id;
      this.url = null;

      if (ContrapesoImagenComponent.versiones.has(id)) {
         this.mostrar(id, ContrapesoImagenComponent.versiones.get(id));
         return;
      }
      this.http.get<any>(this.base + 'version/' + id).subscribe(
         r => {
            const version = r && r.version ? r.version : null;
            ContrapesoImagenComponent.versiones.set(id, version);
            if (id === this.id) { this.mostrar(id, version); }
         },
         () => { this.url = null; }
      );
   }

   get nombre(): string {
      const fila = (this.contrapesos || []).find(c => c && String(c.id) === String(this.contrapeso));
      return (fila && fila.text) || '';
   }

   private mostrar(id: number, version: number) {
      this.url = version ? this.base + 'imagen/' + id + '?v=' + version : null;
   }
}
