import { Component, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';

export type DocumentoImpresion = 'pedido' | 'presupuesto';

type ClavePestana = 'crystal' | 'pdf' | 'produccion';

interface PestanaImpresion {
  clave: ClavePestana;
  titulo: string;
  url: SafeResourceUrl | null;
  // Contenido que se carga en el visor la primera vez que se muestra la pestaña: Chrome no dibuja un PDF
  // que se carga dentro de un marco oculto (se ve en blanco)
  pendiente?: () => SafeResourceUrl;
  // PDF que se pide al backend la primera vez que se muestra la pestaña ("Producción")
  cargarAlMostrar?: () => void;
  error: boolean;
  textoError?: string;
  // Descarga con nombre propio: el botón del visor del navegador guarda el PDF con el nombre aleatorio de su URL temporal
  descarga?: SafeUrl;
  nombreFichero?: string;
}

// Informes Crystal del haru_server (todo lo que no sale en el PDF propio).
// La pantalla interna de pedidos usa el informe genérico PP_PREVIEW con el cliente (cust).
const PROC_CRYSTAL: { [doc: string]: string } = {
  pedido: 'PP_PREVIEW_POR',
  presupuesto: 'PP_PREVIEW_PRE'
};

// true: tres pestañas, "Antiguo" con el informe de Crystal de siempre, "Nuevo" con el enrollable (clientes 1, 4 y 5)
//       y la HoneyComb en un único PDF con el resumen de precios (/api/sm/impresion) y "Producción" con el mismo
//       PDF sin códigos de tejido, precios ni totales (?modo=produccion).
// false: como antes, solo la HoneyComb en PDF (/api/sm/honeycomb/impresion) y el resto con Crystal.
const IMPRESION_ENROLLABLE = true;

/*
  Visor de impresión de pedidos y presupuestos.
  - Con enrollable o HoneyComb: pestaña "Antiguo" (Crystal, todo el documento), "Nuevo" (PDF del backend, Puppeteer)
    y "Producción" (el mismo PDF sin precios).
  - Sin ninguno de los dos: solo Crystal, como hasta ahora.
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
  activa: ClavePestana = 'crystal';
  cargando = false;

  private urlApi = environment.host_ip + (IMPRESION_ENROLLABLE ? '/api/sm/impresion' : '/api/sm/honeycomb/impresion');
  private urlsBlob: string[] = [];
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
        // Respuesta de /api/sm/impresion: { enrollable, honeycomb }; Crystal sale siempre, en "Antiguo"
        // Respuesta de /api/sm/honeycomb/impresion: { tieneHoneycomb, tieneOtros }
        const contenido = IMPRESION_ENROLLABLE
          ? { enrollable: info.enrollable, honeycomb: info.honeycomb, crystal: true }
          : { enrollable: false, honeycomb: info.tieneHoneycomb, crystal: info.tieneOtros || !info.tieneHoneycomb };

        if (contenido.crystal) {
          const crystal = this.pestanaCrystal(doc, id, cust);
          if (IMPRESION_ENROLLABLE) crystal.titulo = 'ANTIGUO';
          this.pestanas.push(crystal);
        }
        if (contenido.enrollable || contenido.honeycomb) {
          const productos = [contenido.enrollable ? 'Enrollable' : '', contenido.honeycomb ? 'HoneyComb' : ''].filter(p => p);
          this.pestanas.push({
            clave: 'pdf',
            titulo: IMPRESION_ENROLLABLE ? 'NUEVO' : 'HoneyComb',
            url: null,
            error: false,
            textoError: contenido.enrollable ? 'NO SE HA PODIDO GENERAR EL PDF DEL ENROLLABLE' : 'NO SE HA PODIDO GENERAR EL PDF DE LA HONEYCOMB'
          });
          this.cargarPdf('pdf', doc, id, '', productos.join('_'), peticion);
          if (IMPRESION_ENROLLABLE) {
            const produccion: PestanaImpresion = {
              clave: 'produccion',
              titulo: 'PRODUCCIÓN',
              url: null,
              error: false,
              textoError: 'NO SE HA PODIDO GENERAR EL PDF DE PRODUCCIÓN'
            };
            produccion.cargarAlMostrar = () => this.cargarPdf('produccion', doc, id, '?modo=produccion', 'Produccion', peticion);
            this.pestanas.push(produccion);
          }
        } else {
          this.cargando = false;
        }
        // Con PDF propio se abre directamente ("Nuevo"); las otras pestañas quedan al lado
        const abrir = this.pestanas.find(p => p.clave === 'pdf');
        this.activar(IMPRESION_ENROLLABLE && abrir ? abrir.clave : this.pestanas[0].clave);
      },
      () => {
        if (peticion !== this.peticion) return;
        this.pestanas.push(this.pestanaCrystal(doc, id, cust));
        this.activar('crystal');
        this.cargando = false;
      }
    );
  }

  /* Solo Crystal, sin consultar al backend: varios pedidos seleccionados a la vez o clientes sin PDF propio */
  cargarCrystal(doc: DocumentoImpresion, ids: number | string, cust?: number | string) {
    this.limpiar();
    this.pestanas.push(this.pestanaCrystal(doc, ids, cust));
    this.activar('crystal');
  }

  /* Muestra una pestaña y carga su contenido si aún no se había cargado */
  activar(clave: ClavePestana) {
    this.activa = clave;
    const pestana = this.pestanas.find(p => p.clave === clave);
    if (pestana && pestana.cargarAlMostrar) {
      const cargar = pestana.cargarAlMostrar;
      pestana.cargarAlMostrar = undefined;
      cargar();
    }
    if (pestana && pestana.pendiente) {
      pestana.url = pestana.pendiente();
      pestana.pendiente = undefined;
    }
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

  /* parametros: '' o '?modo=produccion'; prefijo: inicio del nombre con el que se descarga */
  private cargarPdf(clave: ClavePestana, doc: DocumentoImpresion, id: number | string, parametros: string, prefijo: string, peticion: number) {
    const pestana = this.pestanas.find(p => p.clave === clave);
    this.http.get(this.urlApi + '/pdf/' + doc + '/' + id + parametros, { headers: this.cabeceras(), responseType: 'blob' }).subscribe(
      pdf => {
        if (peticion !== this.peticion) return;
        const urlBlob = URL.createObjectURL(pdf);
        this.urlsBlob.push(urlBlob);
        pestana.pendiente = () => this.domSanitizer.bypassSecurityTrustResourceUrl(urlBlob);
        pestana.descarga = this.domSanitizer.bypassSecurityTrustUrl(urlBlob);
        pestana.nombreFichero = prefijo + '_' + doc + '_' + id + '.pdf';
        if (this.activa === clave) this.activar(clave);
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
      url: null,
      pendiente: () => this.domSanitizer.bypassSecurityTrustResourceUrl(url),
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
