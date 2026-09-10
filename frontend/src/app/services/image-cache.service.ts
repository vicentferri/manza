// src/app/services/image-cache.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
   providedIn: 'root'
})
export class ImageCacheService {
   private cache = new Map<string, string>();
   private pendingRequests = new Map<string, Observable<string>>();
   private readonly MAX_CACHE_ENTRIES = 80;

   // Placeholder SVG como constante
   private readonly NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';

   constructor(
      private http: HttpClient
   ) {
      this.loadCacheFromStorage();
   }

   /**
    * Obtiene una imagen del cache o la descarga del servidor (sanitizada para Angular)
    */
   // En image-cache.service.ts - NO sanitices la URL

   getImage(imageId: string | number, tipo: 'tejido' | 'color' | 'perfil'): Observable<string> {
      const cacheKey = `${tipo}_${imageId}`;

      // Si está en cache, devuelve inmediatamente
      if (this.cache.has(cacheKey)) {
         return of(this.cache.get(cacheKey)!);
      }

      // Si ya hay una petición pendiente para esta imagen, reutiliza
      if (this.pendingRequests.has(cacheKey)) {
         return this.pendingRequests.get(cacheKey)!;
      }

      // Descarga la imagen
      const request$ = this.downloadImage(imageId, tipo).pipe(
         tap(base64 => {
            this.evictIfNeeded();
            this.cache.set(cacheKey, base64);
            this.saveCacheToStorage();
            this.pendingRequests.delete(cacheKey);
         }),
         catchError(error => {
            this.pendingRequests.delete(cacheKey);
            console.warn(`Imagen no encontrada: ${tipo}/${imageId}. Usando placeholder.`);
            // Cache placeholder only in memory so we don't retry, but don't persist it
            this.cache.set(cacheKey, this.NO_IMAGE_PLACEHOLDER);
            return of(this.NO_IMAGE_PLACEHOLDER);
         })
      );

      this.pendingRequests.set(cacheKey, request$);
      return request$;
   }

   private downloadImage(imageId: string | number, tipo: string): Observable<string> {
      const url = `${environment.host_ip}/api/sm/honeycomb_obtener_imagen/${tipo}/${imageId}`;

      return this.http.get(url, { responseType: 'blob' }).pipe(
         switchMap(blob => {
            return from(new Promise<string>((resolve, reject) => {
               const reader = new FileReader();
               reader.onloadend = () => resolve(reader.result as string);
               reader.onerror = reject;
               reader.readAsDataURL(blob);
            }));
         }),
         catchError(error => {
            console.error(`Error descargando imagen: ${tipo}/${imageId}`, error);
            return throwError(() => error);
         })
      );
   }

   /**
    * Convierte un Blob a Base64
    */
   private blobToBase64(blob: Blob): Observable<string> {
      return new Observable(observer => {
         const reader = new FileReader();
         reader.onloadend = () => {
            observer.next(reader.result as string);
            observer.complete();
         };
         reader.onerror = (error) => {
            observer.error(error);
         };
         reader.readAsDataURL(blob);
      });
   }

   /**
    * Precarga múltiples imágenes
    */
   preloadImages(items: Array<{ id: string | number, tipo: 'tejido' | 'color' | 'perfil' }>) {
      items.forEach(item => {
         this.getImage(item.id, item.tipo).subscribe({
            next: () => console.log(`Imagen precargada: ${item.tipo}/${item.id}`),
            error: (err) => console.warn(`Error precargando: ${item.tipo}/${item.id}`, err)
         });
      });
   }

   /**
    * Limpia el cache
    */
   clearCache() {
      this.cache.clear();
      localStorage.removeItem('imageCache');
      console.log('Cache de imágenes limpiado');
   }

   /**
    * Limpia imágenes antiguas del cache (más de 7 días)
    */
   clearOldCache() {
      const cacheData = localStorage.getItem('imageCache');
      if (!cacheData) return;

      try {
         const parsed = JSON.parse(cacheData);
         const now = Date.now();
         const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
         let removedCount = 0;

         Object.keys(parsed).forEach(key => {
            if (now - parsed[key].timestamp > maxAge) {
               delete parsed[key];
               this.cache.delete(key);
               removedCount++;
            }
         });

         localStorage.setItem('imageCache', JSON.stringify(parsed));

         if (removedCount > 0) {
            console.log(`Cache limpiado: ${removedCount} imágenes antiguas eliminadas`);
         }
      } catch (e) {
         console.error('Error limpiando cache antiguo:', e);
      }
   }

   private evictIfNeeded() {
      if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
         const oldestKeys = Array.from(this.cache.keys()).slice(0, Math.floor(this.MAX_CACHE_ENTRIES / 2));
         oldestKeys.forEach(k => this.cache.delete(k));
      }
   }

   /**
    * Guarda el cache en localStorage
    */
   private saveCacheToStorage() {
      const placeholder = this.NO_IMAGE_PLACEHOLDER;
      try {
         const cacheObject: any = {};
         this.cache.forEach((value, key) => {
            if (value !== placeholder) {
               cacheObject[key] = { data: value, timestamp: Date.now() };
            }
         });
         localStorage.setItem('imageCache', JSON.stringify(cacheObject));
      } catch (e) {
         if (e instanceof DOMException && e.name === 'QuotaExceededError') {
            // Evict oldest half and retry once
            const keys = Array.from(this.cache.keys()).filter(k => this.cache.get(k) !== placeholder);
            keys.slice(0, Math.floor(keys.length / 2)).forEach(k => this.cache.delete(k));
            try {
               const cacheObject: any = {};
               this.cache.forEach((value, key) => {
                  if (value !== placeholder) {
                     cacheObject[key] = { data: value, timestamp: Date.now() };
                  }
               });
               localStorage.setItem('imageCache', JSON.stringify(cacheObject));
            } catch (_) {
               localStorage.removeItem('imageCache');
            }
         }
      }
   }

   /**
    * Carga el cache desde localStorage
    */
   private loadCacheFromStorage() {
      try {
         const cacheData = localStorage.getItem('imageCache');
         if (cacheData) {
            const parsed = JSON.parse(cacheData);
            let loadedCount = 0;

            Object.keys(parsed).forEach(key => {
               this.cache.set(key, parsed[key].data);
               loadedCount++;
            });

            console.log(`Cache cargado: ${loadedCount} imágenes desde localStorage`);
         }
      } catch (e) {
         console.error('Error cargando cache desde storage:', e);
         localStorage.removeItem('imageCache');
      }
   }

   /**
    * Obtiene el tamaño del cache en MB
    */
   getCacheSize(): number {
      const cacheData = localStorage.getItem('imageCache');
      if (!cacheData) return 0;
      return new Blob([cacheData]).size / (1024 * 1024);
   }

   /**
    * Obtiene estadísticas del cache
    */
   getCacheStats(): { itemCount: number; sizeMB: number; keys: string[] } {
      return {
         itemCount: this.cache.size,
         sizeMB: this.getCacheSize(),
         keys: Array.from(this.cache.keys())
      };
   }

   /**
    * Invalida una imagen específica del cache
    */
   invalidateImage(imageId: string | number, tipo: 'tejido' | 'color' | 'perfil') {
      const cacheKey = `${tipo}_${imageId}`;
      this.cache.delete(cacheKey);

      // También del localStorage
      try {
         const cacheData = localStorage.getItem('imageCache');
         if (cacheData) {
            const parsed = JSON.parse(cacheData);
            delete parsed[cacheKey];
            localStorage.setItem('imageCache', JSON.stringify(parsed));
         }
      } catch (e) {
         console.error('Error invalidando imagen del cache:', e);
      }

      console.log(`Imagen invalidada del cache: ${cacheKey}`);
   }

   /**
    * Verifica si una imagen está en cache
    */
   hasImage(imageId: string | number, tipo: 'tejido' | 'color' | 'perfil'): boolean {
      const cacheKey = `${tipo}_${imageId}`;
      return this.cache.has(cacheKey);
   }
}