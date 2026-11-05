import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SMAPIService } from './smapi.service';

// Soportes de techo y pared de los paneles japoneses y las verticales.
// Los dos productos usan las mismas opciones y la misma tarifa (sol_articulos_accesorios_tarifas),
// cada cliente con sus precios (idrow = cliente).

export interface OpcionSoporte {
   valor: string;     // lo que se guarda en PJ_TipoSoporte_2 / PV_TipoSoporte_1 / PV_TipoSoporte_2
   etiqueta: string;  // clave de traducción
   mm: number;        // medida en la tarifa; 0 = sin precio (techo)
}

export const OPCIONES_SOPORTE: OpcionSoporte[] = [
   { valor: 'TEC', etiqueta: 'TECHO', mm: 0 },
   { valor: 'P08', etiqueta: 'Pared 8 cm', mm: 80 },
   { valor: 'P10', etiqueta: 'Pared 10 cm', mm: 100 },
   { valor: 'P12', etiqueta: 'Pared 12 cm', mm: 120 },
   { valor: 'P14', etiqueta: 'Pared 14 cm', mm: 140 },
   { valor: 'P15', etiqueta: 'Pared 15 cm', mm: 150 },
   { valor: 'P19', etiqueta: 'Pared 19 cm', mm: 190 },
   { valor: 'P21', etiqueta: 'Pared 21 cm', mm: 210 },
   { valor: 'P23', etiqueta: 'Pared 23 cm', mm: 230 }
];

/** Separación entre soportes (cm) y mínimo por cortina. */
const SEPARACION_SOPORTES = 50;
const MINIMO_SOPORTES = 2;

export interface TarifaSoporte {
   numSoportes: number;  // soportes por cortina
   precio: number;       // precio de un soporte
   c1: string;           // C1 de todos los soportes de la línea (numSoportes × cantidad)
}

/** Soportes por cortina: uno cada 50 cm, redondeando, y nunca menos de 2. */
export function numSoportes(ancho: string | number): number {
   const n = Math.round((Number(ancho) || 0) / SEPARACION_SOPORTES);
   return Math.max(MINIMO_SOPORTES, n);
}

/**
 * Tarifa del soporte elegido para la línea. Devuelve null si no hay soporte elegido, si es de
 * techo (sin precio) o si la tarifa falla.
 */
export function tarifaSoporte(service: SMAPIService, cliente: string, soporte: string,
   ancho: string | number, cantidad: number): Observable<TarifaSoporte | null> {
   const opcion = OPCIONES_SOPORTE.find(o => o.valor === soporte);
   if (!opcion || !opcion.mm) {
      return of(null);
   }
   const n = numSoportes(ancho);
   return service.getTarifaAccesorio(cliente, String(opcion.mm), n * (cantidad || 1)).pipe(
      map((data: any) => (data && data.message === 'OK')
         ? { numSoportes: n, precio: Number(data.v1) || 0, c1: data.v2 || '' }
         : null),
      catchError(() => of(null))
   );
}

/** Texto junto a la etiqueta del campo: "(2 x 5.13€ C1 0000540)". */
export function textoSoporte(t: TarifaSoporte): string {
   return '(' + t.numSoportes + ' x ' + t.precio.toFixed(2) + '€' + (t.c1 ? ' ' + t.c1 : '') + ')';
}
