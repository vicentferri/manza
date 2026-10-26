import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export type DocumentoImpresion = 'pedido' | 'presupuesto';

interface PestanaImpresion {
  clave: 'crystal' | 'honeycomb';
  titulo: string;
  url: SafeResourceUrl | null;
  error: boolean;
  // Descarga con nombre propio: el botón del visor del navegador guarda el PDF con el nombre aleatorio de su URL temporal
  descarga?: SafeUrl;
  nombreFichero?: string;
}

// Informes Crystal del haru_server (todo lo que no es HoneyComb).
// La pantalla interna de pedidos usa el informe genérico PP_PREVIEW con el cliente (cust).
const PROC_CRYSTAL: { [doc: string]: string } = {
  pedido: 'PP_PREVIEW_POR',
  presupuesto: 'PP_PREVIEW_PRE'
};

/*
  Visor de impresión de pedidos y presupuestos.
  - Sin HoneyComb: el informe de Crystal, como hasta ahora.
  - Solo HoneyComb: el PDF del backend (Puppeteer).
  - Mixto: dos pestañas, Crystal con el resto de productos y el PDF de la HoneyComb.
  Si no se puede consultar el contenido del documento se muestra Crystal, para que imprimir
  siga funcionando aunque falle la parte nueva.
*/
@Component({
  selector: 'app-impresion-documento',
  templateUrl: './impresion-documento.component.html',
  styleUrls: ['./impresion-documento.component.css']
})
export class ImpresionDocumentoComponent implements OnDestroy {

  pestanas: PestanaImpresion[] = [];
  activa: 'crystal' | 'honeycomb' = 'crystal';
  cargando = false;

  private urlApi = environment.host_ip + '/api/sm/honeycomb/impresion';
  private urlBlob: string | null = null;
  // Evita que la respuesta de una impresión anterior pise la actual
  private peticion = 0;

  constructor(private http: HttpClient, private domSanitizer: DomSanitizer) { }

  /* cust: solo en la pantalla interna de pedidos, que pasa el cliente al informe de Crystal */
  cargar(doc: DocumentoImpresion, id: number | string, cust?: number | string) {
    this.limpiar();
    const peticion = this.peticion;
    this.cargando = true;

    this.http.get<any>(this.urlApi + '/info/' + doc + '/' + id, { headers: this.cabeceras() }).subscribe(
      info => {
        if (peticion !== this.peticion) return;
        if (info.tieneOtros || !info.tieneHoneycomb) {
          this.pestanas.push(this.pestanaCrystal(doc, id, cust));
        }
        if (info.tieneHoneycomb) {
          this.pestanas.push({ clave: 'honeycomb', titulo: 'HoneyComb', url: null, error: false });
          this.cargarHoneycomb(doc, id, peticion);
        } else {
          this.cargando = false;
        }
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

  /* Solo Crystal, sin consultar al backend: varios pedidos seleccionados a la vez o clientes sin HoneyComb */
  cargarCrystal(doc: DocumentoImpresion, ids: number | string, cust?: number | string) {
    this.limpiar();
    this.pestanas.push(this.pestanaCrystal(doc, ids, cust));
    this.activa = 'crystal';
  }

  limpiar() {
    this.peticion++;
    this.pestanas = [];
    this.cargando = false;
    if (this.urlBlob) {
      URL.revokeObjectURL(this.urlBlob);
      this.urlBlob = null;
    }
  }

  ngOnDestroy() {
    this.limpiar();
  }

  private cargarHoneycomb(doc: DocumentoImpresion, id: number | string, peticion: number) {
    const pestana = this.pestanas.find(p => p.clave === 'honeycomb');
    this.http.get(this.urlApi + '/pdf/' + doc + '/' + id, { headers: this.cabeceras(), responseType: 'blob' }).subscribe(
      pdf => {
        if (peticion !== this.peticion) return;
        this.urlBlob = URL.createObjectURL(pdf);
        pestana.url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.urlBlob);
        pestana.descarga = this.domSanitizer.bypassSecurityTrustUrl(this.urlBlob);
        pestana.nombreFichero = 'HoneyComb_' + doc + '_' + id + '.pdf';
        this.cargando = false;
      },
      () => {
        if (peticion !== this.peticion) return;
        pestana.error = true;
        this.cargando = false;
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
