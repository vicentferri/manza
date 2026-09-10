import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { HoneycombService } from './honeycomb.service';
import { Subject } from 'rxjs';
import { ImageCacheService } from 'src/app/services/image-cache.service';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from 'src/app/services/translation.service';
import { CortinaTipo } from '../config/CortinaTipo';


@Component({
  selector: 'manza-honeycomb',
  templateUrl: './honeycomb.component.html',
  styleUrls: ['./honeycomb.component.scss'],
  providers: [HoneycombService],
})
export class HoneycombComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  calculando: boolean = false;

  // Placeholder SVG como constante
  private readonly NO_IMAGE_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNDUlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==';

  TiposTejido: Array<{
    idTipoTejido: number;
    TipoTejido: string;
    imagen?: SafeUrl | string;
    imagenCargada?: boolean;
  }> = [];

  ColoresTejidoFiltrados: Array<{
    idColorTejido: string;
    ColorTejido: string;
    imagen?: SafeUrl | string;
    imagenCargada?: boolean;
    codigoColor?: string;
    referencia?: string;
  }> = [];

  ColoresPerfil: Array<{
    idColorPerfil: number;
    ColorPerfil: string;
    imagen?: SafeUrl | string;
    imagenCargada?: boolean;
    codigoColor?: string;
    referencia?: string;
  }> = [];

  TiposAccionamiento: Array<{
    idTipoAccionamiento: number;
    TipoAccionamiento: string;
  }> = [];

  @Input() codeCentro: string = '-1';
  @Input() Cliente: string = '-1';
  @Input() SubCliente: string = '-1';
  @Input() ReferenciaTienda: string = '-1';

  @Output() onAdd = new EventEmitter<any>();



  model = {
    Ancho: 100,
    Alto: 100,
    Cantidad: 1,
    TipoTejido: 1,
    ColorTejido: '04755',
    ColorPerfil: '1',
    TipoAccionamiento: 0,
    precios: {
      T7_PVP: 0,
      T7_PVP_C1: '',
      T7_Fecha_Entrega: '',
      T7_Transporte: 0,
    }
  }



  constructor(
    private service: HoneycombService,
    private imageCacheService: ImageCacheService,
    private toaster: ToastrService,
    private translation: TranslationService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.service.getTiposTejido().subscribe(tipos => {
      this.TiposTejido = tipos.map(t => ({ ...t, imagenCargada: false }));
      this.loadTiposTejidoImages();
    });

    if (this.model.TipoTejido) {
      this.service.getColoresTejido(this.model.TipoTejido).subscribe(colores => {
        this.ColoresTejidoFiltrados = colores.map(c => ({ ...c, imagenCargada: false }));
        this.loadColoresTejidoImages();
      });
    }

    this.service.getColoresPerfil().subscribe(perfiles => {
      this.ColoresPerfil = perfiles.map(p => ({ ...p, imagenCargada: false }));
      this.loadPerfilesImages();
    });

    this.service.getTiposAccionamiento().subscribe(tipos => {
      this.TiposAccionamiento = tipos;
      if (tipos.length > 0 && this.model.TipoAccionamiento === 0) {
        this.model.TipoAccionamiento = tipos[0].idTipoAccionamiento;
      }
    });
  }

  /**
   * Carga las imágenes de tipos de tejido
   */
  // En honeycomb.component.ts

  private loadTiposTejidoImages() {
    this.TiposTejido.forEach((tipo, index) => {
      setTimeout(() => {
        console.log('Cargando imagen para tipo tejido:', tipo.idTipoTejido, tipo.TipoTejido);

        this.imageCacheService
          .getImage(tipo.idTipoTejido, 'tejido')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (base64) => {
              console.log('✓ Imagen recibida para tipo:', tipo.TipoTejido, base64.substring(0, 50));
              tipo.imagen = base64;
              tipo.imagenCargada = true;
            },
            error: (err) => {
              console.error('✗ Error tipo:', tipo.TipoTejido, err);
              tipo.imagen = this.NO_IMAGE_PLACEHOLDER;
              tipo.imagenCargada = false;
            }
          });
      }, index * 100);
    });
  }

  private loadColoresTejidoImages() {
    this.ColoresTejidoFiltrados.forEach((color, index) => {
      setTimeout(() => {
        console.log('Cargando imagen para color:', color.idColorTejido, color.ColorTejido);

        this.imageCacheService
          .getImage(color.idColorTejido, 'color')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (base64) => {
              console.log('✓ Imagen recibida para color:', color.ColorTejido, base64.substring(0, 50));
              color.imagen = base64;
              color.imagenCargada = true;
            },
            error: (err) => {
              console.error('✗ Error color:', color.ColorTejido, err);
              color.imagen = this.NO_IMAGE_PLACEHOLDER;
              color.imagenCargada = false;
            }
          });
      }, index * 100);
    });
  }

  private loadPerfilesImages() {
    this.ColoresPerfil.forEach((perfil, index) => {
      setTimeout(() => {
        console.log('Cargando imagen para perfil:', perfil.idColorPerfil, perfil.ColorPerfil);

        this.imageCacheService
          .getImage(perfil.idColorPerfil, 'perfil')
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (base64) => {
              console.log('✓ Imagen recibida para perfil:', perfil.ColorPerfil, base64.substring(0, 50));
              perfil.imagen = base64;
              perfil.imagenCargada = true;
            },
            error: (err) => {
              console.error('✗ Error perfil:', perfil.ColorPerfil, err);
              perfil.imagen = this.NO_IMAGE_PLACEHOLDER;
              perfil.imagenCargada = false;
            }
          });
      }, index * 100);
    });
  }

  /**
   * Precarga todas las imágenes
   */
  preloadAllImages() {
    const items = [
      ...this.TiposTejido.map(t => ({ id: t.idTipoTejido, tipo: 'tejido' as const })),
      ...this.ColoresTejidoFiltrados.map(c => ({ id: c.idColorTejido, tipo: 'color' as const })),
      ...this.ColoresPerfil.map(p => ({ id: p.idColorPerfil, tipo: 'perfil' as const }))
    ];

    this.imageCacheService.preloadImages(items);
  }

  handleImageError(event: any) {
    event.target.src = this.NO_IMAGE_PLACEHOLDER;
  }


  ChangeAncho(value: any) {
    this.model.Ancho = value;
  }

  ChangeAlto(value: any) {
    this.model.Alto = value;
  }

  ChangeCantidad(value: any) {
    this.model.Cantidad = value;
  }

  ChangeTipoTejido() {
    this.service.getColoresTejido(this.model.TipoTejido).subscribe(colores => {
      this.ColoresTejidoFiltrados = colores.map(c => ({ ...c, imagenCargada: false }));
      this.loadColoresTejidoImages();
    });
  }

  ChangeColorTejido() {
    // Lógica al cambiar color
  }

  ChangeColorPerfil() {
    // Lógica al cambiar color de perfil
  }

  ChangeAccionamiento() {
    // Lógica al cambiar tipo de accionamiento
  }

  T7Check(): { Proceed: number; Message: string } {
    let iProceed = 1;
    let strMessage = '';

    /*
    if (this.model.Ancho === '') { iProceed = 0; strMessage = 'Debe indicar el Ancho'; }
    if (this.model.Alto === '') { iProceed = 0; strMessage = 'Debe indicar el Alto'; }
    if (this.model.Cantidad === '') { iProceed = 0; strMessage = 'Debe indicar la Cantidad'; }
    if (this.model.TipoTejido === '') { iProceed = 0; strMessage = 'Debe indicar el Tipo de Tejido'; }
    if (this.model.ColorTejido === '') { iProceed = 0; strMessage = 'Debe indicar el Color del Tejido'; }
    if (this.model.ColorPerfil === '') { iProceed = 0; strMessage = 'Debe indicar el Color del Perfil'; }
    */

    return { Proceed: iProceed, Message: strMessage };
  }

  CalcularPrecio() {
    this.calculando = true;

    this.service.GetPrecio(
      this.model.Ancho,
      this.model.Alto,
      this.model.Cantidad,
      Number(this.model.TipoTejido)
    ).subscribe({
      next: (response: any) => {
        if (response) {
          this.model.precios.T7_PVP = Number(response.PVP);
          this.model.precios.T7_PVP_C1 = response.PVP_C1;
          this.model.precios.T7_Fecha_Entrega = response.Fecha_Entrega;
          this.model.precios.T7_Transporte = response.Transporte;
        }
      },
      error: (error) => {
        console.error('Error al calcular precio:', error);
        this.calculando = false;
      },
      complete: () => {
        this.calculando = false;
      }
    });
  }


  buildPreciosCompleto(): any {
    return {
      ...this.model.precios
    };
  }

  Agregar() {
    const retValue = this.T7Check();
    if (retValue.Proceed !== 1) {
      this.toaster.error(retValue.Message, 'ERROR');
      return;
    }


    if (confirm("¿Estás seguro de agregar a su cesta?")) {

      //const preciosCompleto = this.buildPreciosCompleto();
      const tipo = new CortinaTipo(this.codeCentro);
      const tipoTejidoObj = this.TiposTejido.find(t => t.idTipoTejido == this.model.TipoTejido);
      const colorTejidoObj = this.ColoresTejidoFiltrados.find(c => c.idColorTejido == this.model.ColorTejido);
      const colorPerfilObj = this.ColoresPerfil.find(p => p.idColorPerfil == Number(this.model.ColorPerfil));
      const accionamientoObj = this.TiposAccionamiento.find(a => a.idTipoAccionamiento == Number(this.model.TipoAccionamiento));

      tipo.HoneyComb_Add(
        Number(this.model.Ancho), Number(this.model.Alto), Number(this.model.Cantidad),
        Number(this.model.TipoTejido), tipoTejidoObj ? tipoTejidoObj.TipoTejido : '',
        Number(this.model.ColorTejido), colorTejidoObj ? colorTejidoObj.ColorTejido : '',
        Number(this.model.ColorPerfil), colorPerfilObj ? colorPerfilObj.ColorPerfil : '',
        Number(this.model.TipoAccionamiento), accionamientoObj ? accionamientoObj.TipoAccionamiento : '',
        this.model.precios
      );

      this.onAdd.emit(tipo);
      const message = this.translation.get('AGREGADO HONEYCOMB A CESTA');
      this.toaster.success(message, 'Cesta');
      this.reset();
    }
  }

  // Rellena el formulario en modo edición a partir de las propiedades reales que
  // HoneyComb_Add deja en el CortinaTipo. La cascada tipo tejido -> color tejido
  // se resuelve aquí directamente para no perder la preselección del color
  // guardado cuando llegue la respuesta de getColoresTejido.
  cargarEdicion(item: any): void {
    this.model.Ancho = item.ancho;
    this.model.Alto = item.alto;
    this.model.Cantidad = item.cantidad;
    this.model.TipoTejido = item.tej_tipo_id;
    this.model.ColorPerfil = item.color_perfil_id != null ? item.color_perfil_id.toString() : this.model.ColorPerfil;
    this.model.TipoAccionamiento = item.hc_accionamiento_id;

    this.service.getColoresTejido(item.tej_tipo_id).pipe(takeUntil(this.destroy$)).subscribe(colores => {
      this.ColoresTejidoFiltrados = colores.map(c => ({ ...c, imagenCargada: false }));
      const match = this.ColoresTejidoFiltrados.find(c => c.idColorTejido == item.tej_color_id);
      this.model.ColorTejido = match ? match.idColorTejido : (this.ColoresTejidoFiltrados.length > 0 ? this.ColoresTejidoFiltrados[0].idColorTejido : this.model.ColorTejido);
      this.loadColoresTejidoImages();
    });
  }

  reset(): void {
  }


}