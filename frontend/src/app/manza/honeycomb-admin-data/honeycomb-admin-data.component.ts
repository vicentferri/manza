// honeycomb-admin-data.component.ts
import { Component, OnInit } from '@angular/core';

import * as XLSX from 'xlsx';
import { HoneycombService } from '../honeycomb/honeycomb.service';

interface TipoTejido {
   idTipoTejido?: number;
   TipoTejido: string;
   Incremento?: number;
   editando?: boolean;
   nuevo?: boolean;
}

interface ColorTejido {
   idColorTejido?: number;
   ColorTejido: string;
   idTipoTejido: number;
   TipoTejido?: string;
   Referencia?: string;
   CodigoColor?: string;
   Incremento?: number;
   editando?: boolean;
   nuevo?: boolean;
}

interface ColorPerfil {
   idColorPerfil?: number;
   ColorPerfil: string;
   Referencia?: string;
   CodigoColor?: string;
   Incremento?: number;
   editando?: boolean;
   nuevo?: boolean;
}

interface TipoAccionamiento {
   idTipoAccionamiento?: number;
   TipoAccionamiento: string;
   Incremento?: number;
   editando?: boolean;
   nuevo?: boolean;
}

// Añade las interfaces para tarifas
interface TarifaRow {
   TipoTejido: number;
   Fila: number;
   Col_0_20?: number;
   Col_0_40?: number;
   Col_0_60?: number;
   Col_0_80?: number;
   Col_1_00?: number;
   Col_1_20?: number;
   Col_1_40?: number;
   Col_1_60?: number;
   Col_1_80?: number;
   Col_2_00?: number;
   Col_2_20?: number;
   Col_2_40?: number;
   Col_2_60?: number;
   Col_2_80?: number;
   Col_3_00?: number;
   editando?: boolean;
}



@Component({
   selector: 'app-honeycomb-admin-data',
   templateUrl: './honeycomb-admin-data.component.html',
   styleUrls: ['./honeycomb-admin-data.component.scss'],
   providers: [HoneycombService]
})
export class HoneycombAdminDataComponent implements OnInit {

   // Tabs
   tabSeleccionado: 'tipostejido' | 'colorestejido' | 'coloresperfil' | 'tarifas' | 'tiposaccionamiento' = 'tipostejido';

   // Datos
   tiposTejido: TipoTejido[] = [];
   coloresTejido: ColorTejido[] = [];
   coloresPerfil: ColorPerfil[] = [];
   tiposAccionamiento: TipoAccionamiento[] = [];

   // Tarifas
   tarifas: TarifaRow[] = [];
   tipoTejidoTarifa: number = 1;

   // Columnas de la tarifa
   columnasAncho = [
      { key: 'Col_0_20', label: '0.20' },
      { key: 'Col_0_40', label: '0.40' },
      { key: 'Col_0_60', label: '0.60' },
      { key: 'Col_0_80', label: '0.80' },
      { key: 'Col_1_00', label: '1.00' },
      { key: 'Col_1_20', label: '1.20' },
      { key: 'Col_1_40', label: '1.40' },
      { key: 'Col_1_60', label: '1.60' },
      { key: 'Col_1_80', label: '1.80' },
      { key: 'Col_2_00', label: '2.00' },
      { key: 'Col_2_20', label: '2.20' },
      { key: 'Col_2_40', label: '2.40' },
      { key: 'Col_2_60', label: '2.60' },
      { key: 'Col_2_80', label: '2.80' },
      { key: 'Col_3_00', label: '3.00' }
   ];


   // Para filtro en colores de tejido
   tiposTejidoLookup: TipoTejido[] = [];
   filtroTipoTejido: number = 0;

   // Estado
   cargando = false;
   guardando = false;
   mensaje: { tipo: 'success' | 'error' | 'info' | 'warning', texto: string } | null = null;

   constructor(private service: HoneycombService) { }

   ngOnInit() {
      this.cargarTiposTejido();
   }

   /**
    * Cambio de tab
    */
   cambiarTab(tab: 'tipostejido' | 'colorestejido' | 'coloresperfil' | 'tarifas' | 'tiposaccionamiento') {
      this.tabSeleccionado = tab;
      this.mensaje = null;

      if (tab === 'tipostejido') {
         if (this.tiposTejido.length === 0) {
            this.cargarTiposTejido();
         }
      } else if (tab === 'colorestejido') {
         this.cargarTiposTejidoLookup();
         if (this.coloresTejido.length === 0) {
            this.cargarColoresTejido();
         }
      } else if (tab === 'coloresperfil') {
         if (this.coloresPerfil.length === 0) {
            this.cargarColoresPerfil();
         }
      } else if (tab === 'tarifas') {
         if (this.tarifas.length === 0) {
            this.cargarTarifas();
         }
      } else if (tab === 'tiposaccionamiento') {
         if (this.tiposAccionamiento.length === 0) {
            this.cargarTiposAccionamiento();
         }
      }
   }

   // =============================================
   // TIPOS DE TEJIDO
   // =============================================

   cargarTiposTejido() {
      this.cargando = true;
      this.service.getTiposTejido().subscribe({
         next: (data) => {
            this.tiposTejido = data.map(t => ({
               idTipoTejido: t.idTipoTejido,
               TipoTejido: t.TipoTejido,
               Incremento: t.Incremento || 0,
               editando: false
            }));
            this.cargando = false;
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar tipos de tejido');
            this.cargando = false;
         }
      });
   }

   nuevoTipoTejido() {
      const nuevo: TipoTejido = {
         TipoTejido: '',
         Incremento: 0,
         editando: true,
         nuevo: true
      };
      this.tiposTejido.unshift(nuevo);
   }

   editarTipoTejido(tipo: TipoTejido) {
      tipo.editando = true;
   }

   cancelarTipoTejido(tipo: TipoTejido) {
      if (tipo.nuevo) {
         this.tiposTejido = this.tiposTejido.filter(t => t !== tipo);
      } else {
         tipo.editando = false;
         this.cargarTiposTejido();
      }
   }

   guardarTipoTejido(tipo: TipoTejido) {
      if (!tipo.TipoTejido || tipo.TipoTejido.trim() === '') {
         this.mostrarMensaje('warning', 'El nombre del tipo de tejido es requerido');
         return;
      }

      this.guardando = true;

      if (tipo.nuevo) {
         // Insertar
         this.service.insertTipoTejido(tipo).subscribe({
            next: (response) => {
               tipo.idTipoTejido = response.idTipoTejido;
               tipo.editando = false;
               tipo.nuevo = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Tipo de tejido creado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al crear tipo de tejido');
            }
         });
      } else {
         // Actualizar
         this.service.updateTipoTejido(tipo).subscribe({
            next: () => {
               tipo.editando = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Tipo de tejido actualizado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al actualizar tipo de tejido');
            }
         });
      }
   }

   eliminarTipoTejido(tipo: TipoTejido) {
      if (!confirm(`¿Está seguro de eliminar "${tipo.TipoTejido}"?`)) {
         return;
      }

      this.guardando = true;
      this.service.deleteTipoTejido(tipo.idTipoTejido!).subscribe({
         next: () => {
            this.tiposTejido = this.tiposTejido.filter(t => t !== tipo);
            this.guardando = false;
            this.mostrarMensaje('success', 'Tipo de tejido eliminado correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al eliminar tipo de tejido');
         }
      });
   }

   // =============================================
   // COLORES DE TEJIDO
   // =============================================

   cargarTiposTejidoLookup() {
      if (this.tiposTejidoLookup.length > 0) return;

      this.service.getTiposTejido().subscribe({
         next: (data) => {
            this.tiposTejidoLookup = data;
            if (this.tiposTejidoLookup.length > 0 && this.filtroTipoTejido === 0) {
               this.filtroTipoTejido = this.tiposTejidoLookup[0].idTipoTejido!;
            }
         },
         error: (err) => {
            console.error('Error cargando tipos de tejido lookup', err);
         }
      });
   }

   cargarColoresTejido() {
      this.cargando = true;
      this.service.getAllColoresTejido().subscribe({
         next: (data) => {
            this.coloresTejido = data.map(c => ({
               idColorTejido: c.idColorTejido,
               ColorTejido: c.ColorTejido,
               idTipoTejido: c.idTipoTejido,
               TipoTejido: c.TipoTejido,
               Referencia: c.Referencia,
               CodigoColor: c.CodigoColor,
               Incremento: c.Incremento || 0,
               editando: false
            }));
            this.cargando = false;
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar colores de tejido');
            this.cargando = false;
         }
      });
   }

   get coloresTejidoFiltrados(): ColorTejido[] {
      if (this.filtroTipoTejido === 0) {
         return this.coloresTejido;
      }
      return this.coloresTejido.filter(c => c.idTipoTejido === this.filtroTipoTejido);
   }

   nuevoColorTejido() {
      const nuevo: ColorTejido = {
         ColorTejido: '',
         idTipoTejido: this.filtroTipoTejido || this.tiposTejidoLookup[0].idTipoTejido || 1,
         Referencia: '',
         CodigoColor: '',
         Incremento: 0,
         editando: true,
         nuevo: true
      };
      this.coloresTejido.unshift(nuevo);
   }

   editarColorTejido(color: ColorTejido) {
      color.editando = true;
   }

   cancelarColorTejido(color: ColorTejido) {
      if (color.nuevo) {
         this.coloresTejido = this.coloresTejido.filter(c => c !== color);
      } else {
         color.editando = false;
         this.cargarColoresTejido();
      }
   }

   guardarColorTejido(color: ColorTejido) {
      if (!color.ColorTejido || color.ColorTejido.trim() === '') {
         this.mostrarMensaje('warning', 'El nombre del color es requerido');
         return;
      }

      if (!color.idTipoTejido) {
         this.mostrarMensaje('warning', 'Debe seleccionar un tipo de tejido');
         return;
      }

      if (!color.Incremento) {
         color.Incremento = 0;
      }

      this.guardando = true;

      if (color.nuevo) {
         // Insertar
         this.service.insertColorTejido(color).subscribe({
            next: (response) => {
               color.idColorTejido = response.idColorTejido;
               color.editando = false;
               color.nuevo = false;
               this.guardando = false;
               this.cargarColoresTejido(); // Recargar para obtener TipoTejido
               this.mostrarMensaje('success', 'Color de tejido creado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al crear color de tejido');
            }
         });
      } else {
         // Actualizar
         this.service.updateColorTejido(color).subscribe({
            next: () => {
               color.editando = false;
               this.guardando = false;
               this.cargarColoresTejido(); // Recargar para obtener TipoTejido
               this.mostrarMensaje('success', 'Color de tejido actualizado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al actualizar color de tejido');
            }
         });
      }
   }

   eliminarColorTejido(color: ColorTejido) {
      if (!confirm(`¿Está seguro de eliminar "${color.ColorTejido}"?`)) {
         return;
      }

      this.guardando = true;
      this.service.deleteColorTejido(color.idColorTejido!).subscribe({
         next: () => {
            this.coloresTejido = this.coloresTejido.filter(c => c !== color);
            this.guardando = false;
            this.mostrarMensaje('success', 'Color de tejido eliminado correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al eliminar color de tejido');
         }
      });
   }

   // =============================================
   // COLORES DE PERFIL
   // =============================================

   cargarColoresPerfil() {
      this.cargando = true;
      this.service.getColoresPerfil().subscribe({
         next: (data) => {
            this.coloresPerfil = data.map(p => ({
               idColorPerfil: p.idColorPerfil,
               ColorPerfil: p.ColorPerfil,
               Referencia: p.Referencia,
               CodigoColor: p.CodigoColor,
               Incremento: p.Incremento || 0,
               editando: false
            }));
            this.cargando = false;
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar colores de perfil');
            this.cargando = false;
         }
      });
   }

   nuevoColorPerfil() {
      const nuevo: ColorPerfil = {
         ColorPerfil: '',
         Referencia: '',
         CodigoColor: '',
         Incremento: 0,
         editando: true,
         nuevo: true
      };
      this.coloresPerfil.unshift(nuevo);
   }

   editarColorPerfil(color: ColorPerfil) {
      color.editando = true;
   }

   cancelarColorPerfil(color: ColorPerfil) {
      if (color.nuevo) {
         this.coloresPerfil = this.coloresPerfil.filter(c => c !== color);
      } else {
         color.editando = false;
         this.cargarColoresPerfil();
      }
   }

   guardarColorPerfil(color: ColorPerfil) {
      if (!color.ColorPerfil || color.ColorPerfil.trim() === '') {
         this.mostrarMensaje('warning', 'El nombre del color es requerido');
         return;
      }

      this.guardando = true;

      if (color.nuevo) {
         // Insertar
         this.service.insertColorPerfil(color).subscribe({
            next: (response) => {
               color.idColorPerfil = response.idColorPerfil;
               color.editando = false;
               color.nuevo = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Color de perfil creado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al crear color de perfil');
            }
         });
      } else {
         // Actualizar
         this.service.updateColorPerfil(color).subscribe({
            next: () => {
               color.editando = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Color de perfil actualizado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al actualizar color de perfil');
            }
         });
      }
   }

   eliminarColorPerfil(color: ColorPerfil) {
      if (!confirm(`¿Está seguro de eliminar "${color.ColorPerfil}"?`)) {
         return;
      }

      this.guardando = true;
      this.service.deleteColorPerfil(color.idColorPerfil!).subscribe({
         next: () => {
            this.coloresPerfil = this.coloresPerfil.filter(c => c !== color);
            this.guardando = false;
            this.mostrarMensaje('success', 'Color de perfil eliminado correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al eliminar color de perfil');
         }
      });
   }

   // =============================================
   // TIPOS DE ACCIONAMIENTO
   // =============================================

   cargarTiposAccionamiento() {
      this.cargando = true;
      this.service.getTiposAccionamiento().subscribe({
         next: (data) => {
            this.tiposAccionamiento = data.map(a => ({
               idTipoAccionamiento: a.idTipoAccionamiento,
               TipoAccionamiento: a.TipoAccionamiento,
               Incremento: a.Incremento || 0,
               editando: false
            }));
            this.cargando = false;
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar tipos de accionamiento');
            this.cargando = false;
         }
      });
   }

   nuevoTipoAccionamiento() {
      const nuevo: TipoAccionamiento = {
         TipoAccionamiento: '',
         Incremento: 0,
         editando: true,
         nuevo: true
      };
      this.tiposAccionamiento.unshift(nuevo);
   }

   editarTipoAccionamiento(tipo: TipoAccionamiento) {
      tipo.editando = true;
   }

   cancelarTipoAccionamiento(tipo: TipoAccionamiento) {
      if (tipo.nuevo) {
         this.tiposAccionamiento = this.tiposAccionamiento.filter(t => t !== tipo);
      } else {
         tipo.editando = false;
         this.cargarTiposAccionamiento();
      }
   }

   guardarTipoAccionamiento(tipo: TipoAccionamiento) {
      if (!tipo.TipoAccionamiento || tipo.TipoAccionamiento.trim() === '') {
         this.mostrarMensaje('warning', 'El nombre del tipo de accionamiento es requerido');
         return;
      }

      this.guardando = true;

      if (tipo.nuevo) {
         this.service.insertTipoAccionamiento(tipo).subscribe({
            next: (response) => {
               tipo.idTipoAccionamiento = response.idTipoAccionamiento;
               tipo.editando = false;
               tipo.nuevo = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Tipo de accionamiento creado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al crear tipo de accionamiento');
            }
         });
      } else {
         console.log(tipo);
         this.service.updateTipoAccionamiento(tipo).subscribe({
            next: () => {
               tipo.editando = false;
               this.guardando = false;
               this.mostrarMensaje('success', 'Tipo de accionamiento actualizado correctamente');
            },
            error: (err) => {
               this.guardando = false;
               this.mostrarMensaje('error', 'Error al actualizar tipo de accionamiento');
            }
         });
      }
   }

   eliminarTipoAccionamiento(tipo: TipoAccionamiento) {
      if (!confirm(`¿Está seguro de eliminar "${tipo.TipoAccionamiento}"?`)) {
         return;
      }

      this.guardando = true;
      this.service.deleteTipoAccionamiento(tipo.idTipoAccionamiento!).subscribe({
         next: () => {
            this.tiposAccionamiento = this.tiposAccionamiento.filter(t => t !== tipo);
            this.guardando = false;
            this.mostrarMensaje('success', 'Tipo de accionamiento eliminado correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al eliminar tipo de accionamiento');
         }
      });
   }

   // =============================================
   // IMPORTAR / EXPORTAR EXCEL
   // =============================================

   exportarExcel() {
      let datos: any[] = [];
      let nombreArchivo = '';

      if (this.tabSeleccionado === 'tipostejido') {
         datos = this.tiposTejido.map(t => ({
            'ID': t.idTipoTejido,
            'Tipo de Tejido': t.TipoTejido,
            'Incremento': t.Incremento || 0
         }));
         nombreArchivo = 'TiposTejido.xlsx';
      } else if (this.tabSeleccionado === 'colorestejido') {
         datos = this.coloresTejido.map(c => ({
            'ID': c.idColorTejido,
            'Color': c.ColorTejido,
            'ID Tipo Tejido': c.idTipoTejido,
            'Tipo Tejido': c.TipoTejido,
            'Referencia': c.Referencia || '',
            'Código Color': c.CodigoColor || '',
            'Incremento': c.Incremento || 0
         }));
         nombreArchivo = 'ColoresTejido.xlsx';
      } else if (this.tabSeleccionado === 'coloresperfil') {
         datos = this.coloresPerfil.map(p => ({
            'ID': p.idColorPerfil,
            'Color': p.ColorPerfil,
            'Referencia': p.Referencia || '',
            'Código Color': p.CodigoColor || '',
            'Incremento': p.Incremento || 0
         }));
         nombreArchivo = 'ColoresPerfil.xlsx';
      } else if (this.tabSeleccionado === 'tiposaccionamiento') {
         datos = this.tiposAccionamiento.map(a => ({
            'ID': a.idTipoAccionamiento,
            'Tipo de Accionamiento': a.TipoAccionamiento,
            'Incremento': a.Incremento || 0
         }));
         nombreArchivo = 'TiposAccionamiento.xlsx';
      }

      if (datos.length === 0) {
         this.mostrarMensaje('warning', 'No hay datos para exportar');
         return;
      }

      const worksheet = XLSX.utils.json_to_sheet(datos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

      XLSX.writeFile(workbook, nombreArchivo);
      this.mostrarMensaje('success', 'Excel exportado correctamente');
   }

   onFileSelected(event: any) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
         try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            this.importarDatos(jsonData);
         } catch (error) {
            this.mostrarMensaje('error', 'Error al leer el archivo Excel');
         }
      };
      reader.readAsArrayBuffer(file);

      // Reset input
      event.target.value = '';
   }

   importarDatos(jsonData: any[]) {
      if (!jsonData || jsonData.length === 0) {
         this.mostrarMensaje('warning', 'El archivo está vacío');
         return;
      }

      let datos: any[] = [];

      if (this.tabSeleccionado === 'tipostejido') {
         datos = jsonData.map(row => ({
            TipoTejido: row['Tipo de Tejido'] || row['TipoTejido'] || '',
            Incremento: parseFloat(row['Incremento']) || 0
         }));
      } else if (this.tabSeleccionado === 'colorestejido') {
         datos = jsonData.map(row => ({
            ColorTejido: row['Color'] || row['ColorTejido'] || '',
            idTipoTejido: row['ID Tipo Tejido'] || row['idTipoTejido'] || 1,
            Referencia: row['Referencia'] || '',
            CodigoColor: row['Código Color'] || row['CodigoColor'] || '',
            Incremento: parseFloat(row['Incremento']) || 0
         }));
      } else if (this.tabSeleccionado === 'coloresperfil') {
         datos = jsonData.map(row => ({
            ColorPerfil: row['Color'] || row['ColorPerfil'] || '',
            Referencia: row['Referencia'] || '',
            CodigoColor: row['Código Color'] || row['CodigoColor'] || '',
            Incremento: parseFloat(row['Incremento']) || 0
         }));
      } else if (this.tabSeleccionado === 'tiposaccionamiento') {
         datos = jsonData.map(row => ({
            TipoAccionamiento: row['Tipo de Accionamiento'] || row['TipoAccionamiento'] || '',
            Incremento: parseFloat(row['Incremento']) || 0
         }));
      }

      if (datos.length === 0) {
         this.mostrarMensaje('warning', 'No se encontraron datos válidos en el archivo');
         return;
      }

      this.guardando = true;
      this.service.importExcel(this.tabSeleccionado, datos).subscribe({
         next: (response) => {
            this.guardando = false;
            this.mostrarMensaje('success',
               `Importación completada: ${response.insertados} registros insertados, ${response.errores} errores`);

            // Recargar datos
            if (this.tabSeleccionado === 'tipostejido') {
               this.cargarTiposTejido();
            } else if (this.tabSeleccionado === 'colorestejido') {
               this.cargarColoresTejido();
            } else if (this.tabSeleccionado === 'coloresperfil') {
               this.cargarColoresPerfil();
            } else if (this.tabSeleccionado === 'tiposaccionamiento') {
               this.cargarTiposAccionamiento();
            }
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al importar datos');
         }
      });
   }

   triggerFileInput() {
      const input = document.getElementById('fileInput') as HTMLInputElement;
      if (input) {
         input.click();
      }
   }

   // =============================================
   // UTILIDADES
   // =============================================

   mostrarMensaje(tipo: 'success' | 'error' | 'info' | 'warning', texto: string) {
      this.mensaje = { tipo, texto };
      setTimeout(() => {
         this.mensaje = null;
      }, 5000);
   }

   getNombreTipoTejido(idTipoTejido: number): string {
      const tipo = this.tiposTejidoLookup.find(t => t.idTipoTejido === idTipoTejido);
      return tipo ? tipo.TipoTejido : '';
   }

   // =============================================
   // TARIFAS
   // =============================================

   cargarTarifas() {
      this.cargando = true;
      this.service.getTarifasPorTipo(this.tipoTejidoTarifa).subscribe({
         next: (data) => {
            this.tarifas = data.map(t => ({
               ...t,
               editando: false
            }));
            this.cargando = false;
         },
         error: (err) => {
            this.mostrarMensaje('error', 'Error al cargar tarifas');
            this.cargando = false;
         }
      });
   }

   cambiarTipoTejidoTarifa() {
      this.cargarTarifas();
   }

   editarTarifa(tarifa: TarifaRow) {
      tarifa.editando = true;
   }

   cancelarTarifa(tarifa: TarifaRow) {
      tarifa.editando = false;
      this.cargarTarifas();
   }

   guardarTarifa(tarifa: TarifaRow) {
      this.guardando = true;

      this.service.updateTarifa(tarifa).subscribe({
         next: () => {
            tarifa.editando = false;
            this.guardando = false;
            this.mostrarMensaje('success', 'Tarifa actualizada correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al actualizar tarifa');
         }
      });
   }

   guardarTodasTarifas() {
      if (!confirm('¿Está seguro de guardar todas las tarifas?')) {
         return;
      }

      this.guardando = true;

      this.service.updateTarifas(this.tarifas).subscribe({
         next: () => {
            this.tarifas.forEach(t => t.editando = false);
            this.guardando = false;
            this.mostrarMensaje('success', 'Todas las tarifas actualizadas correctamente');
         },
         error: (err) => {
            this.guardando = false;
            this.mostrarMensaje('error', 'Error al actualizar tarifas');
         }
      });
   }

   exportarTarifasExcel() {
      const datos = this.tarifas.map(t => {
         const row: any = {
            'Fila (Alto)': t.Fila
         };

         this.columnasAncho.forEach(col => {
            row[col.label] = t[col.key] || 0;
         });

         return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(datos);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Tipo${this.tipoTejidoTarifa}`);

      XLSX.writeFile(workbook, `Tarifas_Tipo${this.tipoTejidoTarifa}.xlsx`);
      this.mostrarMensaje('success', 'Tarifas exportadas correctamente');
   }

   importarTarifasExcel(event: any) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
         try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);

            // Convertir datos
            const tarifasImportadas = jsonData.map((row: any) => {
               const tarifa: TarifaRow = {
                  TipoTejido: this.tipoTejidoTarifa,
                  Fila: parseFloat(row['Fila (Alto)'])
               };

               this.columnasAncho.forEach(col => {
                  tarifa[col.key] = parseFloat(row[col.label]) || 0;
               });

               return tarifa;
            });

            // Guardar
            this.guardando = true;
            this.service.updateTarifas(tarifasImportadas).subscribe({
               next: () => {
                  this.guardando = false;
                  this.mostrarMensaje('success', 'Tarifas importadas correctamente');
                  this.cargarTarifas();
               },
               error: (err) => {
                  this.guardando = false;
                  this.mostrarMensaje('error', 'Error al importar tarifas');
               }
            });

         } catch (error) {
            this.mostrarMensaje('error', 'Error al leer el archivo Excel');
         }
      };
      reader.readAsArrayBuffer(file);

      event.target.value = '';
   }

}
