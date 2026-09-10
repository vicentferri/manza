import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TipoArticulo {
  Id: number;
  Nombre: string;
  Descripcion: string;
  TablaDestino: string;
  Activo: boolean;
}

export interface TipoAtributo {
  Id: number;
  IdTipoArticulo: number;
  Nombre: string;
  TipoDato: 'TEXT' | 'INT' | 'DECIMAL' | 'FK';
  TablaFK: string;
  ColumnaFKId: string;
  ColumnaFKDesc: string;
  Obligatorio: boolean;
  Orden: number;
  Activo: boolean;
}

export interface ArticuloHoneycomb {
  IdArticuloERP: number;
  CodSol: string;
  Descripcion: string;
  IdTipoArticulo: number;
  NombreTipoArticulo: string;
  Activo: boolean;
}

export interface ArticuloValor {
  Id: number;
  IdArticuloERP: number;
  IdTipoAtributo: number;
  NombreAtributo: string;
  TipoDato: string;
  ValorTexto: string;
  ValorInt: number;
  ValorDecimal: number;
  ValorFK: number;
  ValorFKDesc: string;
}

export interface FKOption {
  Id: number;
  Descripcion: string;
}

export interface TablaFK {
  Id: number;
  Nombre: string;       // "Colores de tejido"
  Tabla: string;        // "SOL_ARTICULOS_HONEYCOMB_COLORESTEJIDO"
  ColumnaId: string;    // "Id"
  ColumnaDesc: string;  // "ColorTejido"
  Activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HoneycombArticulosService {

  private apiUrl = `${environment.host_ip}/api/sm`;

  constructor(private http: HttpClient) { }

  // ─── TIPOS DE ARTÍCULO ──────────────────────────────────────────

  getTiposArticulo(): Observable<TipoArticulo[]> {
    return this.http.get<TipoArticulo[]>(`${this.apiUrl}/honeycomb_tipo_articulo`);
  }

  saveTipoArticulo(data: Partial<TipoArticulo>): Observable<any> {
    return data.Id
      ? this.http.put(`${this.apiUrl}/honeycomb_tipo_articulo/${data.Id}`, data)
      : this.http.post(`${this.apiUrl}/honeycomb_tipo_articulo`, data);
  }

  deleteTipoArticulo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/honeycomb_tipo_articulo/${id}`);
  }

  // ─── ATRIBUTOS DE TIPO ──────────────────────────────────────────

  getAtributosByTipo(idTipoArticulo: number): Observable<TipoAtributo[]> {
    return this.http.get<TipoAtributo[]>(`${this.apiUrl}/honeycomb_tipo_atributo/${idTipoArticulo}`);
  }

  saveTipoAtributo(data: Partial<TipoAtributo>): Observable<any> {
    return data.Id
      ? this.http.put(`${this.apiUrl}/honeycomb_tipo_atributo/${data.Id}`, data)
      : this.http.post(`${this.apiUrl}/honeycomb_tipo_atributo`, data);
  }

  deleteTipoAtributo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/honeycomb_tipo_atributo/${id}`);
  }

  // ─── ARTÍCULOS ──────────────────────────────────────────────────

  getArticulos(): Observable<ArticuloHoneycomb[]> {
    return this.http.get<ArticuloHoneycomb[]>(`${this.apiUrl}/honeycomb_articulos`);
  }

  asignarTipoArticulo(idArticuloERP: number, idTipoArticulo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/honeycomb_articulos/asignar_tipo`, {
      idArticuloERP,
      idTipoArticulo
    });
  }

  asignarTipoMasivo(ids: number[], idTipoArticulo: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/honeycomb_articulos/asignar_tipo_masivo`, {
      ids,
      idTipoArticulo
    });
  }

  // ─── VALORES DE ATRIBUTOS ───────────────────────────────────────

  getValoresArticulo(idArticuloERP: number): Observable<ArticuloValor[]> {
    return this.http.get<ArticuloValor[]>(`${this.apiUrl}/honeycomb_articulos/${idArticuloERP}/valores`);
  }

  saveValoresArticulo(idArticuloERP: number, valores: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/honeycomb_articulos/${idArticuloERP}/valores`, { valores });
  }

  // ─── OPCIONES FK DINÁMICAS ──────────────────────────────────────

  getFKOptions(tabla: string, columnaId: string, columnaDesc: string): Observable<FKOption[]> {
    return this.http.get<FKOption[]>(`${this.apiUrl}/honeycomb_fk_options`, {
      params: { tabla, columnaId, columnaDesc }
    });
  }

  getTablasFK(): Observable<TablaFK[]> {
    return this.http.get<TablaFK[]>(`${this.apiUrl}/honeycomb_tablas_fk`);
  }

  saveTablaFK(data: Partial<TablaFK>): Observable<any> {
    return data.Id
      ? this.http.put(`${this.apiUrl}/honeycomb_tablas_fk/${data.Id}`, data)
      : this.http.post(`${this.apiUrl}/honeycomb_tablas_fk`, data);
  }

  deleteTablaFK(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/honeycomb_tablas_fk/${id}`);
  }
}
