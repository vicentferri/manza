import { SMAPIService } from './smapi.service';

// Límites de FABRICACIÓN (lo que físicamente se puede fabricar), servidos por /api/lm/limites_fabricacion.
// No confundir con el mínimo cobrable de la tarifa: se puede pedir 60 cm y cobrarse como 100 cm.
// El backend vuelve a validar al valorar (respuesta 'KO_MEDIDAS'); esto es solo la ayuda en pantalla.
export interface LimitesFabricacion {
   min_ancho: number | null;
   max_ancho: number | null;
   min_alto: number | null;
   max_alto: number | null;
   origen_max_ancho: string | null;
   origen_min_ancho: string | null;
   n_filas: number;
}

export interface ParamsLimites {
   cliente?: any;
   tipo: number;
   subtipo?: any;
   acc?: any;
   modelo?: any;
   tejido?: any;
   color?: any;
}

const SIN_LIMITES: LimitesFabricacion = {
   min_ancho: null, max_ancho: null, min_alto: null, max_alto: null,
   origen_max_ancho: null, origen_min_ancho: null, n_filas: 0
};

export interface ResultadoMedidas {
   ok: boolean;
   anchoInvalido: boolean;
   altoInvalido: boolean;
   mensaje: string;
}

export class MedidasFabricacion {
   lim: LimitesFabricacion = { ...SIN_LIMITES };
   anchoInvalido = false;
   altoInvalido = false;
   mensaje = '';

   private peticion = 0;

   // getCliente: los límites son por cliente (un cliente sin límites propios no tiene restricciones,
   // salvo el ancho del rollo del color).
   constructor(private service: SMAPIService, private getCliente: () => any) { }

   // Pide los límites para la combinación actual y revalida las medidas ya escritas al recibirlos.
   cargar(params: ParamsLimites, getMedidas: () => { ancho: any; alto: any }): void {
      const id = ++this.peticion;
      this.service.getLimitesFabricacion({ ...params, cliente: this.getCliente() }).subscribe(
         (data: any) => {
            if (id !== this.peticion) return; // llegó tarde: ya se pidió otra combinación
            this.lim = { ...SIN_LIMITES, ...data };
            const m = getMedidas();
            this.validar(m.ancho, m.alto);
         },
         error => {
            console.error('Error cargando límites de fabricación:', error);
         }
      );
   }

   reset(): void {
      this.peticion++;
      this.lim = { ...SIN_LIMITES };
      this.anchoInvalido = false;
      this.altoInvalido = false;
      this.mensaje = '';
   }

   // Las medidas se admiten de 0,5 en 0,5 cm.
   static esMedioCm(n: number): boolean { return Math.abs(n * 2 - Math.round(n * 2)) < 1e-9; }
   private static txt(n: number): string { return String(n).replace('.', ','); }

   // Devuelve true si es fabricable y deja el resultado en anchoInvalido / altoInvalido / mensaje.
   // Una medida vacía o <= 0 no se valida (la obligatoriedad es de cada formulario).
   validar(ancho: any, alto: any): boolean {
      const r = this.comprobar(ancho, alto);
      this.anchoInvalido = r.anchoInvalido;
      this.altoInvalido = r.altoInvalido;
      this.mensaje = r.mensaje;
      return r.ok;
   }

   // Igual que validar, pero sin tocar el estado: sirve para comprobar varias medidas con los mismos límites
   // (p. ej. las alturas mínima y máxima de la vertical inclinada). etiquetaAlto nombra el alto en el mensaje.
   comprobar(ancho: any, alto: any, etiquetaAlto: string = 'El alto'): ResultadoMedidas {
      const r: ResultadoMedidas = { ok: true, anchoInvalido: false, altoInvalido: false, mensaje: '' };
      const l = this.lim;
      const an = parseFloat(ancho);
      const al = parseFloat(alto);
      const T = MedidasFabricacion.txt;

      if (!isNaN(an) && an > 0) {
         if (!MedidasFabricacion.esMedioCm(an)) {
            r.anchoInvalido = true;
            r.mensaje = `El ancho (${T(an)} cm) debe ir de 0,5 en 0,5 cm.`;
         } else if (l.min_ancho !== null && an < l.min_ancho) {
            r.anchoInvalido = true;
            r.mensaje = `El ancho (${T(an)} cm) es inferior al mínimo de fabricación (${l.min_ancho} cm).`;
         } else if (l.max_ancho !== null && an > l.max_ancho) {
            r.anchoInvalido = true;
            r.mensaje = `El ancho (${T(an)} cm) supera el máximo de fabricación (${l.max_ancho} cm` +
               (l.origen_max_ancho === 'COLOR' ? ', limitado por el ancho del rollo del color' : '') + ').';
         }
      }
      if (!isNaN(al) && al > 0) {
         let m = '';
         if (!MedidasFabricacion.esMedioCm(al)) m = `${etiquetaAlto} (${T(al)} cm) debe ir de 0,5 en 0,5 cm.`;
         else if (l.min_alto !== null && al < l.min_alto) m = `${etiquetaAlto} (${T(al)} cm) es inferior al mínimo de fabricación (${l.min_alto} cm).`;
         else if (l.max_alto !== null && al > l.max_alto) m = `${etiquetaAlto} (${T(al)} cm) supera el máximo de fabricación (${l.max_alto} cm).`;
         if (m) {
            r.altoInvalido = true;
            if (!r.mensaje) r.mensaje = m;
         }
      }
      r.ok = !r.anchoInvalido && !r.altoInvalido;
      return r;
   }

   get rangoAncho(): string { return MedidasFabricacion.rango(this.lim.min_ancho, this.lim.max_ancho); }
   get rangoAlto(): string { return MedidasFabricacion.rango(this.lim.min_alto, this.lim.max_alto); }

   private static rango(min: number | null, max: number | null): string {
      if (min === null && max === null) return '';
      if (min === null) return `hasta ${max} cm`;
      if (max === null) return `desde ${min} cm`;
      return `${min}-${max} cm`;
   }
}
