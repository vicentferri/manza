import { Component, Input } from '@angular/core';

/*
 * Debajo del color de tejido de los configuradores nuevos (Fase 2, PLAN_FASE2_SURTIDO.md): el código del cliente
 * para ese tejido ("Ref.") y los mínimos y máximos que le pone su perfil. Los dos llegan en la fila del tejido
 * (opciones del configurador: fila.ref, fila.limites). Sin nada de eso no se ve nada.
 * El servidor rechaza igualmente las medidas fuera de límites: esto solo avisa antes.
 */
@Component({
   selector: 'app-cfg-tejido-perfil',
   template: `
      <small *ngIf="fila?.ref" class="enx-nota d-block">Ref. {{ fila.ref }}</small>
      <small *ngIf="texto" class="enx-nota d-block">{{ texto }}</small>`
})
export class CfgTejidoPerfilComponent {

   @Input() fila: any = null;

   get texto(): string {
      const l = this.fila && this.fila.limites;
      if (!l) { return ''; }
      const partes = [this.rango('ancho', l.ancho_min, l.ancho_max), this.rango('alto', l.alto_min, l.alto_max)].filter(p => p);
      return partes.length ? 'Con este tejido: ' + partes.join(' · ') : '';
   }

   private rango(medida: string, min: any, max: any): string {
      const n = (v: any) => String(Number(v)).replace('.', ',');
      const hay = (v: any) => v !== null && v !== undefined;
      if (hay(min) && hay(max)) { return medida + ' de ' + n(min) + ' a ' + n(max) + ' cm'; }
      if (hay(min)) { return medida + ' desde ' + n(min) + ' cm'; }
      if (hay(max)) { return medida + ' hasta ' + n(max) + ' cm'; }
      return '';
   }
}
