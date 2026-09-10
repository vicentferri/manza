// honeycomb-admin-images.component.ts
import { Component, OnInit } from '@angular/core';
import { HoneycombService } from '../honeycomb/honeycomb.service';

interface ImageItem {
   id: string | number;
   nombre: string;
   tipo: 'tejido' | 'color' | 'perfil' | 'accionamiento';
   tieneImagen: boolean;
   referencia?: string;
   codigoColor?: string;
   imagen?: string;
   imagenCargada?: boolean;
   cargando?: boolean;
   error?: string;
}

@Component({
   selector: 'app-honeycomb-admin-images',
   templateUrl: './honeycomb-admin-images.component.html',
   styleUrls: ['./honeycomb-admin-images.component.scss'],
   providers: [HoneycombService]
})
export class HoneycombAdminImagesComponent implements OnInit {

   tiposTejido: ImageItem[] = [];
   coloresTejido: ImageItem[] = [];
   coloresPerfil: ImageItem[] = [];
   tiposAccionamiento: ImageItem[] = [];

   // Cache de datos ya cargados por tipo de tejido
   private coloresTejidoCache = new Map<number, ImageItem[]>();

   tipoSeleccionado: 'tejido' | 'color' | 'perfil' | 'accionamiento' = 'tejido';
   filtroTipoTejido: number = 0;

   cargando = false;
   mensaje: { tipo: 'success' | 'error' | 'info', texto: string } | null = null;

   private loadingItems = new Set<string | number>();

   constructor(private service: HoneycombService) { }

   ngOnInit() {
      this.cargarTiposTejido();
   }

   /**
    * Cambio de tipo
    */
   onTipoChange() {
      this.mensaje = null;

      if (this.tipoSeleccionado === 'tejido') {
         // Tipos de tejido ya están cargados
         if (this.tiposTejido.length === 0) {
            this.cargarTiposTejido();
         }
      } else if (this.tipoSeleccionado === 'color') {
         // Verificar si ya están cargados para este tipo
         if (this.coloresTejidoCache.has(this.filtroTipoTejido)) {
            this.coloresTejido = this.coloresTejidoCache.get(this.filtroTipoTejido)!;
         } else {
            this.cargarColoresTejido();
         }
      } else if (this.tipoSeleccionado === 'perfil') {
         // Colores de perfil
         if (this.coloresPerfil.length === 0) {
            this.cargarColoresPerfil();
         }
      } else if (this.tipoSeleccionado === 'accionamiento') {
         if (this.tiposAccionamiento.length === 0) {
            this.cargarTiposAccionamiento();
         }
      }
   }

   /**
    * Cambio de filtro de tipo de tejido
    */
   onFiltroTipoTejidoChange() {
      // Verificar si ya están cargados en cache
      if (this.coloresTejidoCache.has(this.filtroTipoTejido)) {
         this.coloresTejido = this.coloresTejidoCache.get(this.filtroTipoTejido)!;
      } else {
         this.cargarColoresTejido();
      }
   }

   /**
    * Obtener items según tipo seleccionado
    */
   get items(): ImageItem[] {
      switch (this.tipoSeleccionado) {
         case 'tejido': return this.tiposTejido;
         case 'color': return this.coloresTejido;
         case 'perfil': return this.coloresPerfil;
         case 'accionamiento': return this.tiposAccionamiento;
         default: return [];
      }
   }

   /**
    * Cargar tipos de tejido
    */
   cargarTiposTejido() {
      // Si ya están cargados, no volver a cargar
      if (this.tiposTejido.length > 0) {
         return;
      }

      this.cargando = true;
      this.service.getTiposTejido().subscribe({
         next: (data) => {
            this.tiposTejido = data.map(t => ({
               id: t.idTipoTejido,
               nombre: t.TipoTejido,
               tipo: 'tejido',
               tieneImagen: t.TieneImagen === 1
            }));

            if (this.tiposTejido.length > 0) {
               this.filtroTipoTejido = this.tiposTejido[0].id as number;
            }

            this.cargando = false;

            // Cargar imágenes de forma escalonada
            setTimeout(() => {
               this.tiposTejido.forEach((item, index) => {
                  if (item.tieneImagen) {
                     setTimeout(() => this.cargarPreviewImagen(item), index * 100);
                  }
               });
            }, 100);
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar tipos de tejido');
            this.cargando = false;
         }
      });
   }

   /**
    * Cargar colores de tejido por tipo
    */
   cargarColoresTejido() {
      if (!this.filtroTipoTejido) return;

      this.cargando = true;
      this.service.getColoresTejido(this.filtroTipoTejido).subscribe({
         next: (data) => {
            const colores = data.map(c => ({
               id: c.idColorTejido,
               nombre: c.ColorTejido,
               tipo: 'color' as const,
               tieneImagen: c.TieneImagen === 1,
               referencia: c.Referencia,
               codigoColor: c.CodigoColor
            }));

            // Guardar en cache
            this.coloresTejidoCache.set(this.filtroTipoTejido, colores);
            this.coloresTejido = colores;

            this.cargando = false;

            // Cargar imágenes de forma escalonada
            setTimeout(() => {
               this.coloresTejido.forEach((item, index) => {
                  if (item.tieneImagen) {
                     setTimeout(() => this.cargarPreviewImagen(item), index * 100);
                  }
               });
            }, 100);
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar colores de tejido');
            this.cargando = false;
         }
      });
   }

   /**
    * Cargar colores de perfil
    */
   cargarColoresPerfil() {
      // Si ya están cargados, no volver a cargar
      if (this.coloresPerfil.length > 0) {
         return;
      }

      this.cargando = true;
      this.service.getColoresPerfil().subscribe({
         next: (data) => {
            this.coloresPerfil = data.map(p => ({
               id: p.idColorPerfil,
               nombre: p.ColorPerfil,
               tipo: 'perfil',
               tieneImagen: p.TieneImagen === 1,
               referencia: p.Referencia,
               codigoColor: p.CodigoColor
            }));

            this.cargando = false;

            // Cargar imágenes de forma escalonada
            setTimeout(() => {
               this.coloresPerfil.forEach((item, index) => {
                  if (item.tieneImagen) {
                     setTimeout(() => this.cargarPreviewImagen(item), index * 100);
                  }
               });
            }, 100);
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar colores de perfil');
            this.cargando = false;
         }
      });
   }

   /**
    * Cargar tipos de accionamiento
    */
   cargarTiposAccionamiento() {
      if (this.tiposAccionamiento.length > 0) {
         return;
      }

      this.cargando = true;
      this.service.getTiposAccionamiento().subscribe({
         next: (data) => {
            this.tiposAccionamiento = data.map(a => ({
               id: a.idTipoAccionamiento,
               nombre: a.TipoAccionamiento,
               tipo: 'accionamiento' as const,
               tieneImagen: a.TieneImagen === 1
            }));

            this.cargando = false;

            setTimeout(() => {
               this.tiposAccionamiento.forEach((item, index) => {
                  if (item.tieneImagen) {
                     setTimeout(() => this.cargarPreviewImagen(item), index * 100);
                  }
               });
            }, 100);
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar tipos de accionamiento');
            this.cargando = false;
         }
      });
   }

   /**
    * Cargar preview de imagen
    */
   cargarPreviewImagen(item: ImageItem) {
      // Si ya tiene imagen cargada o está cargando, salir
      if (!item.tieneImagen || item.imagen || this.loadingItems.has(item.id)) {
         return;
      }

      this.loadingItems.add(item.id);

      this.service.getImageUrl(item.tipo, item.id).subscribe({
         next: (base64) => {
            item.imagen = base64;
            item.imagenCargada = true;
            this.loadingItems.delete(item.id);
         },
         error: (err) => {
            console.error('Error cargando imagen:', err);
            item.imagen = undefined;
            item.imagenCargada = false;
            this.loadingItems.delete(item.id);
         }
      });
   }

   /**
    * Seleccionar archivo para subir
    */
   onFileSelected(event: any, item: ImageItem) {
      const file = event.target.files[0];
      if (!file) return;

      // Validar tipo de archivo
      if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
         this.mostrarMensaje('error', 'Solo se permiten archivos JPG, PNG o WEBP');
         return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
         this.mostrarMensaje('error', 'La imagen no puede superar 5MB');
         return;
      }

      this.subirImagen(file, item);
   }

   /**
    * Subir imagen
    */
   subirImagen(file: File, item: ImageItem) {
      item.cargando = true;
      item.error = undefined;

      this.service.uploadImage(item.tipo, item.id, file).subscribe({
         next: (response) => {
            item.tieneImagen = true;
            item.cargando = false;
            this.mostrarMensaje('success', `Imagen de "${item.nombre}" subida correctamente`);

            // Recargar preview - forzar recarga
            setTimeout(() => {
               item.imagen = undefined;
               item.imagenCargada = false;
               this.cargarPreviewImagen(item);
            }, 500);
         },
         error: (err) => {
            item.cargando = false;
            if (err.message != null) {
               item.error = err.message;
            } else {
               item.error = 'Error al subir imagen';
            }
            this.mostrarMensaje('error', item.error);
         }
      });
   }

   /**
    * Eliminar imagen
    */
   eliminarImagen(item: ImageItem) {
      if (!confirm(`¿Está seguro de eliminar la imagen de "${item.nombre}"?`)) {
         return;
      }

      item.cargando = true;

      this.service.deleteImage(item.tipo, item.id).subscribe({
         next: () => {
            item.tieneImagen = false;
            item.imagen = undefined;
            item.imagenCargada = false;
            item.cargando = false;
            this.mostrarMensaje('success', `Imagen de "${item.nombre}" eliminada correctamente`);
         },
         error: (err) => {
            item.cargando = false;
            this.mostrarMensaje('error', 'Error al eliminar imagen');
         }
      });
   }

   /**
    * Mostrar mensaje
    */
   mostrarMensaje(tipo: 'success' | 'error' | 'info', texto: string) {
      this.mensaje = { tipo, texto };
      setTimeout(() => {
         this.mensaje = null;
      }, 5000);
   }

   /**
    * Trigger file input
    */
   triggerFileInput(inputId: string) {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
         input.click();
      }
   }
}