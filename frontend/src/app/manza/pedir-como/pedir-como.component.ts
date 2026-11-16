import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PerfilConfiguradorService } from '../config/perfil-configurador.service';

/*
 * "Pedir como cliente" (PLAN_PEDIR_COMO_CLIENTE.md): panel donde un interno con permiso elige un cliente y una de sus
 * tiendas (con buscador por nombre, centro, código Solupyme o población) o "sin tienda". Emite la elección; quien
 * cambia el configurador es config.component.
 * Backend: GET /api/sm/cfg/como/clientes y /api/sm/cfg/como/tiendas/:cliente.
 */
export interface PedirComo {
   cliente: number;
   descripcion: string;
   tienda: {
      usuario: number; nombre: string; centro: string; cod_solupyme: string; poblacion: string;
      prod_1: boolean; prod_2: boolean; prod_3: boolean; prod_4: boolean; prod_6: boolean; prod_7: boolean;
   } | null;
}

@Component({
   selector: 'app-pedir-como',
   templateUrl: './pedir-como.component.html'
})
export class PedirComoComponent implements OnInit {

   /* Elección actual (null = Solarmanes) */
   @Input() actual: PedirComo | null = null;
   @Output() elegir = new EventEmitter<PedirComo | null>();
   @Output() cerrar = new EventEmitter<void>();

   clientes: any[] = [];
   cliente: number = null;
   tiendas: any[] = [];
   buscar = '';
   cargando = false;
   error = '';

   constructor(private perfiles: PerfilConfiguradorService) { }

   ngOnInit() {
      this.perfiles.comoClientes().subscribe(
         data => {
            this.clientes = data || [];
            if (this.actual) { this.cliente = this.actual.cliente; this.cargarTiendas(); }
         },
         () => { this.error = 'No se han podido cargar los clientes'; }
      );
   }

   get clienteSel(): any {
      return this.clientes.find(c => c.cliente === this.cliente) || null;
   }

   get tiendasFiltradas(): any[] {
      const b = this.buscar.trim().toLowerCase();
      if (!b) { return this.tiendas; }
      return this.tiendas.filter(t => [t.nombre, t.nombre_corto, t.centro, t.cod_solupyme, t.poblacion, t.provincia]
         .some(v => v !== null && v !== undefined && String(v).toLowerCase().includes(b)));
   }

   cargarTiendas() {
      this.tiendas = [];
      this.buscar = '';
      if (!this.cliente) { return; }
      this.cargando = true;
      this.perfiles.comoTiendas(this.cliente).subscribe(
         data => { this.cargando = false; this.tiendas = data || []; },
         () => { this.cargando = false; this.error = 'No se han podido cargar las tiendas'; }
      );
   }

   elegirTienda(t: any | null) {
      const c = this.clienteSel;
      if (!c) { return; }
      this.elegir.emit({ cliente: c.cliente, descripcion: c.descripcion, tienda: t ? Object.assign({}, t, { centro: String(t.centro) }) : null });
   }

   volver() {
      this.elegir.emit(null);
   }
}
