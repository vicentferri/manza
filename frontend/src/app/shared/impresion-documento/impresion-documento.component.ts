import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type DocumentoImpresion = 'pedido' | 'presupuesto';

type ClavePestana = 'crystal' | 'honeycomb' | 'enrollable';

interface PestanaImpresion {
  clave: ClavePestana;
  titulo: string;
  url: SafeResourceUrl | null;
  error: boolean;
  textoError?: string;
  // Descarga con nombre propio: el botón del visor del navegador guarda el PDF con el nombre aleatorio de su URL temporal
  descarga?: SafeUrl;
  nombreFichero?: string;
}

// Informes Crystal del haru_server (todo lo que no sale en los PDF propios).
// La pantalla interna de pedidos usa el informe genérico PP_PREVIEW con el cliente (cust).
const PROC_CRYSTAL: { [doc: string]: string } = {
  pedido: 'PP_PREVIEW_POR',
  presupuesto: 'PP_PREVIEW_PRE'
};

// Impresión del enrollable en PDF propio (clientes 1, 4 y 5). Con false el enrollable vuelve a imprimirse
// solo con Crystal, como antes, y no se llama a la API del enrollable.
const IMPRESION_ENROLLABLE = true;

// PDF propios: pestaña, ruta de la API y prefijo del nombre del fichero
const PDF_PROPIOS: { [clave: string]: { titulo: string, api: string, fichero: string, textoError: string } } = {
  enrollable: {
    titulo: 'ENROLLABLE',
    api: '/api/sm/enrollable/impresion',
    fichero: 'Enrollable',
    textoError: 'NO SE HA PODIDO GENERAR EL PDF DEL ENROLLABLE'
  },
  honeycomb: {
    titulo: 'HoneyComb',
    api: '/api/sm/honeycomb/impresion',
    fichero: 'HoneyComb',
    textoError: 'NO SE HA PODIDO GENERAR EL PDF DE LA HONEYCOMB'
  }
};

/*
  Visor de impresión de pedidos y presupuestos.
  - El enrollable (si IMPRESION_ENROLLABLE) y la HoneyComb salen en PDF del backend (Puppeteer).
  - El resto de productos, con el informe de Crystal, como hasta ahora.
  - Si el documento tiene varias cosas, una pestaña por cada una.
  Si no se puede consultar el contenido del documento se muestra Crystal, para que imprimir
  siga funcionando aunque falle la parte nueva. Si falla solo la consulta del enrollable,
  el enrollable se imprime con Crystal.
*/
@Component({
  selector: 'app-impresion-documento',
  templateUrl: './impresion-documento.component.html',
  styleUrls: ['./impresion-documento.component.css']
})
export class ImpresionDocumentoComponent implements OnDestroy {

  pestanas: PestanaImpresion[] = [];
  activa: ClavePestana = 'crystal';
  cargando = false;

  private urlsBlob: string[] = [];
  // Evita que la respuesta de una impresión anterior pise la actual
  private peticion = 0;

  constructor(private http: HttpClient, private domSanitizer: DomSanitizer) { }

  /* cust: solo en la pantalla interna de pedidos, que pasa el cliente al informe de Crystal */
  cargar(doc: DocumentoImpresion, id: number | string, cust?: number | string) {
    this.limpiar();
    const peticion = this.peticion;
    this.cargando = true;

    const infoEnrollable: Observable<any> = IMPRESION_ENROLLABLE
      ? this.http.get<any>(this.urlApi('enrollable') + '/info/' + doc + '/' + id, { headers: this.cabeceras() })
        .pipe(catchError(() => of(null)))
      : of(null);

    forkJoin([
      this.http.get<any>(this.urlApi('honeycomb') + '/info/' + doc + '/' + id, { headers: this.cabeceras() }),
      infoEnrollable
    ]).subscribe(
      ([honeycomb, enrollable]) => {
        if (peticion !== this.peticion) return;
        // Sin respuesta del enrollable, el enrollable va con Crystal (tieneOtros de la HoneyComb lo incluye)
        const conEnrollable = !!(enrollable && enrollable.tieneEnrollable);
        const tieneOtros = enrollable ? enrollable.tieneOtros : honeycomb.tieneOtros;
        if (tieneOtros || (!conEnrollable && !honeycomb.tieneHoneycomb)) {
          this.pestanas.push(this.pestanaCrystal(doc, id, cust));
        }
        const pendientes: ClavePestana[] = [];
        if (conEnrollable) pendientes.push('enrollable');
        if (honeycomb.tieneHoneycomb) pendientes.push('honeycomb');
        pendientes.forEach(clave => {
          const p = PDF_PROPIOS[clave];
          this.pestanas.push({ clave: clave, titulo: p.titulo, url: null, error: false, textoError: p.textoError });
          this.cargarPdf(clave, doc, id, peticion);
        });
        this.cargando = pendientes.length > 0;
        this.activa = this.pestanas[0].clave;
      },
      () => {
        if (peticion !== this.peticion) return;
        this.pestanas.push(this.pestanaCrystal(doc, id, cust));
        this.activa = 'crystal';
        this.cargando = false;
      }
    );
  }

  /* Solo Crystal, sin consultar al backend: varios pedidos seleccionados a la vez o clientes sin PDF propio */
  cargarCrystal(doc: DocumentoImpresion, ids: number | string, cust?: number | string) {
    this.limpiar();
    this.pestanas.push(this.pestanaCrystal(doc, ids, cust));
    this.activa = 'crystal';
  }

  limpiar() {
    this.peticion++;
    this.pestanas = [];
    this.cargando = false;
    this.urlsBlob.forEach(url => URL.revokeObjectURL(url));
    this.urlsBlob = [];
  }

  ngOnDestroy() {
    this.limpiar();
  }

  private urlApi(clave: string): string {
    return environment.host_ip + PDF_PROPIOS[clave].api;
  }

  private cargarPdf(clave: ClavePestana, doc: DocumentoImpresion, id: number | string, peticion: number) {
    const pestana = this.pestanas.find(p => p.clave === clave);
    this.http.get(this.urlApi(clave) + '/pdf/' + doc + '/' + id, { headers: this.cabeceras(), responseType: 'blob' }).subscribe(
      pdf => {
        if (peticion !== this.peticion) return;
        const urlBlob = URL.createObjectURL(pdf);
        this.urlsBlob.push(urlBlob);
        pestana.url = this.domSanitizer.bypassSecurityTrustResourceUrl(urlBlob);
        pestana.descarga = this.domSanitizer.bypassSecurityTrustUrl(urlBlob);
        pestana.nombreFichero = PDF_PROPIOS[clave].fichero + '_' + doc + '_' + id + '.pdf';
        this.cargando = this.pestanas.some(p => p.clave !== 'crystal' && !p.url && !p.error);
      },
      () => {
        if (peticion !== this.peticion) return;
        pestana.error = true;
        this.cargando = this.pestanas.some(p => p.clave !== 'crystal' && !p.url && !p.error);
      }
    );
  }

  private pestanaCrystal(doc: DocumentoImpresion, id: number | string, cust?: number | string): PestanaImpresion {
    // El parámetro _ evita que el navegador reutilice el informe anterior
    const base = 'https://www.manzasm.com/vw/haru_server/services/bbss/preview.aspx?emp=0';
    const url = (cust !== undefined && cust !== null
      ? base + '&cust=' + cust + '&proc=PP_PREVIEW'
      : base + '&proc=' + PROC_CRYSTAL[doc]) +
      '&ids=' + id + '&_=' + Date.now();
    return {
      clave: 'crystal',
      titulo: 'RESTO DE PRODUCTOS',
      url: this.domSanitizer.bypassSecurityTrustResourceUrl(url),
      error: false
    };
  }

  // manza.module importa su propio HttpClientModule y allí no pasa el AuthInterceptor:
  // el token se pone aquí, igual que hace el interceptor
  private cabeceras(): HttpHeaders {
    const token = localStorage.getItem('registerToken');
    return token ? new HttpHeaders({ Authorization: token }) : new HttpHeaders();
  }
}
