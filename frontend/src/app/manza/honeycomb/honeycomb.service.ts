import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable()
export class HoneycombService {

   public urlService = environment.host_ip;

   constructor(private http: HttpClient) { }

   public HTTP_Get(route: string) {
      var url: string = route;
      let registerToken = localStorage.getItem('registerToken');

      const headers: any = {};
      if (registerToken != null) {
         headers['authorization'] = registerToken;
      }

      return this.http.get(url, { headers }).pipe(map((response: any) => response));
   }

   public HTTP_Post(route: string, body: any) {
      var url: string = route;
      let registerToken = localStorage.getItem('registerToken');

      const headers: any = {};
      if (registerToken != null) {
         headers['authorization'] = registerToken;
      }

      return this.http.post(url, body, { headers }).pipe(map((response: any) => response));
   }

   public HTTP_Delete(route: string) {
      var url: string = route;
      let registerToken = localStorage.getItem('registerToken');

      const headers: any = {};
      if (registerToken != null) {
         headers['authorization'] = registerToken;
      }

      return this.http.delete(url, { headers }).pipe(map((response: any) => response));
   }

   GetPrecio(Ancho: number, Alto: number, Cantidad: number, TipoTejido: number) {
      let url = this.urlService + "/api/sm/honeycomb_obtener_tarifa?ancho=" + Ancho + "&alto=" + Alto + "&cantidad=" + Cantidad + "&tipoTejido=" + TipoTejido;
      return this.HTTP_Get(url);
   }

   getTiposTejido() {
      let url = this.urlService + "/api/sm/honeycomb_tipostejido";
      return this.HTTP_Get(url);
   }

   /*
   getColoresTejido(tipotejido: number) {
      let url = this.urlService + "/api/sm/honeycomb_colorestejido/" + tipotejido;
      return this.HTTP_Get(url);
   }*/

   getColoresTejido(idTipoTejido: number): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlService}/api/sm/honeycomb_colorestejido/${idTipoTejido}`);
   }

   getColoresPerfil() {
      let url = this.urlService + "/api/sm/honeycomb_coloresperfil";
      return this.HTTP_Get(url);
   }

   // ========================================
   // MÉTODOS PARA GESTIÓN DE IMÁGENES
   // ========================================

   /**
    * Subir imagen (multipart)
    */
   uploadImage(tipo: string, id: string | number, file: File): Observable<any> {
      const formData = new FormData();
      formData.append('imagen', file);

      let url = this.urlService + `/api/sm/honeycomb_upload_image/${tipo}/${id}`;
      return this.http.post(url, formData).pipe(map((response: any) => response));
   }

   /**
    * Obtener imagen (devuelve base64)
    */
   getImageUrl(tipo: string, id: string | number): Observable<string> {
      let url = this.urlService + `/api/sm/honeycomb_obtener_imagen/${tipo}/${id}`;

      return this.http.get(url, { responseType: 'blob' }).pipe(
         switchMap(blob => from(this.blobToBase64(blob)))
      );
   }

   private blobToBase64(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onloadend = () => resolve(reader.result as string);
         reader.onerror = reject;
         reader.readAsDataURL(blob);
      });
   }

   /**
    * Eliminar imagen
    */
   deleteImage(tipo: string, id: string | number): Observable<any> {
      let url = this.urlService + `/api/sm/honeycomb_delete_image/${tipo}/${id}`;
      return this.http.delete(url).pipe(map((response: any) => response));
   }

   /**
    * Listar todas las imágenes
    */
   /*
   listImages(): Observable<any[]> {
      let url = this.urlService + "/api/sm/honeycomb_list_images";
      return this.HTTP_Get(url);
      }*/

   /**
 * Listar todas las imágenes
 */
   listImages(): Observable<any[]> {
      let url = this.urlService + "/api/sm/honeycomb_list_images";
      return this.http.get<any[]>(url).pipe(map((response: any) => response));
   }

   /**
    * Subir imagen base64
    */
   uploadImageBase64(tipo: string, id: string | number, base64: string, filename?: string): Observable<any> {
      let url = this.urlService + `/api/sm/honeycomb_upload_image_base64/${tipo}/${id}`;
      return this.HTTP_Post(url, {
         base64,
         filename: filename || `${tipo}_${id}.jpg`,
         contentType: 'image/jpeg'
      });
   }

   // Añade estos métodos en honeycomb.service.ts

   // ========================================
   // CRUD - TIPOS DE TEJIDO
   // ========================================

   insertTipoTejido(tipo: any) {
      let url = this.urlService + "/api/sm/honeycomb_tipotejido_insert";
      return this.HTTP_Post(url, tipo);
   }

   updateTipoTejido(tipo: any) {
      let url = this.urlService + "/api/sm/honeycomb_tipotejido_update";
      return this.HTTP_Post(url, tipo);
   }

   deleteTipoTejido(id: number) {
      let url = this.urlService + `/api/sm/honeycomb_tipotejido_delete/${id}`;
      return this.HTTP_Delete(url);
   }

   // ========================================
   // CRUD - COLORES DE TEJIDO
   // ========================================

   getAllColoresTejido() {
      let url = this.urlService + "/api/sm/honeycomb_colortejido_getall";
      return this.HTTP_Get(url);
   }

   insertColorTejido(color: any) {
      let url = this.urlService + "/api/sm/honeycomb_colortejido_insert";
      return this.HTTP_Post(url, color);
   }

   updateColorTejido(color: any) {
      let url = this.urlService + "/api/sm/honeycomb_colortejido_update";
      return this.HTTP_Post(url, color);
   }

   deleteColorTejido(id: number) {
      let url = this.urlService + `/api/sm/honeycomb_colortejido_delete/${id}`;
      return this.HTTP_Delete(url);
   }

   // ========================================
   // CRUD - COLORES DE PERFIL
   // ========================================

   insertColorPerfil(color: any) {
      let url = this.urlService + "/api/sm/honeycomb_colorperfil_insert";
      return this.HTTP_Post(url, color);
   }

   updateColorPerfil(color: any) {
      let url = this.urlService + "/api/sm/honeycomb_colorperfil_update";
      return this.HTTP_Post(url, color);
   }

   deleteColorPerfil(id: number) {
      let url = this.urlService + `/api/sm/honeycomb_colorperfil_delete/${id}`;
      return this.HTTP_Delete(url);
   }

   // ========================================
   // IMPORTAR / EXPORTAR
   // ========================================

   importExcel(tipo: string, datos: any[]) {
      let url = this.urlService + "/api/sm/honeycomb_import_excel";
      return this.HTTP_Post(url, { tipo, datos });
   }

   exportExcel(tipo: string) {
      let url = this.urlService + `/api/sm/honeycomb_export_excel?tipo=${tipo}`;
      return this.HTTP_Get(url);
   }

   // honeycomb.service.ts - Añade estos métodos

   // ========================================
   // TARIFAS
   // ========================================

   getTarifasPorTipo(tipoTejido: number) {
      let url = this.urlService + `/api/sm/honeycomb_tarifas_get?tipoTejido=${tipoTejido}`;
      return this.HTTP_Get(url);
   }

   updateTarifa(tarifa: any) {
      let url = this.urlService + "/api/sm/honeycomb_tarifa_update";
      return this.HTTP_Post(url, tarifa);
   }

   updateTarifas(tarifas: any[]) {
      let url = this.urlService + "/api/sm/honeycomb_tarifas_update";
      return this.HTTP_Post(url, tarifas);
   }

   // ========================================
   // CRUD - TIPOS DE ACCIONAMIENTO
   // ========================================

   getTiposAccionamiento() {
      let url = this.urlService + "/api/sm/honeycomb_tiposaccionamiento";
      return this.HTTP_Get(url);
   }

   insertTipoAccionamiento(tipo: any) {
      let url = this.urlService + "/api/sm/honeycomb_tipoaccionamiento_insert";
      return this.HTTP_Post(url, tipo);
   }

   updateTipoAccionamiento(tipo: any) {
      let url = this.urlService + "/api/sm/honeycomb_tipoaccionamiento_update";
      return this.HTTP_Post(url, tipo);
   }

   deleteTipoAccionamiento(id: number) {
      let url = this.urlService + `/api/sm/honeycomb_tipoaccionamiento_delete/${id}`;
      return this.HTTP_Delete(url);
   }

}