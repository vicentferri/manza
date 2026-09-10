import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MasterComponent } from './master/master.component';
import { SetupComponent } from './setup/setup.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormsCoreModule } from '@ng-dynamic-forms/core';
import { DynamicFormsBootstrapUIModule } from '@ng-dynamic-forms/ui-bootstrap';
import { DndltlComponent } from './dndltl/dndltl.component';
import { PreviewComponent } from './preview/preview.component';
import { SetupcliComponent } from './setupcli/setupcli.component';
import { ColoresMarcasComponent } from './colores-marcas/colores-marcas.component';
import { AccionamientosMapaComponent } from './accionamientos-mapa/accionamientos-mapa.component';
import { PromocionesClientesComponent } from './promociones-clientes/promociones-clientes.component';
import { MandosCargadoresComponent } from './mandos-cargadores/mandos-cargadores.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { AccionamientosRadioTipoComponent } from './accionamientos-radio-tipo/accionamientos-radio-tipo.component';
import { AccionamientosRadioTipoClienteComponent } from './accionamientos-radio-tipo-cliente/accionamientos-radio-tipo-cliente.component';
import { PromocionesMonitorComponent } from './promociones-monitor/promociones-monitor.component';
import { IncrementosGenericosComponent } from './incrementos-genericos/incrementos-genericos.component';
import { TejidosColoresComponent } from './tejidos-colores/tejidos-colores.component';
import { TejidosComponent } from './tejidos/tejidos.component';
import { ImpresionDigitalComponent } from './impresion-digital/impresion-digital.component';
import { ClientesGestionComponent } from './clientes-gestion/clientes-gestion.component';
import { PermisosGuard } from '../../services/PermisosGuard';


const routes: Routes = [
    { path: '', redirectTo: 'setup', pathMatch: 'full' },
    { path: 'setup',         component: SetupComponent,         canActivate: [PermisosGuard], data: { permiso: 'config_campos' } },
    { path: 'setupcli',      component: SetupcliComponent,      canActivate: [PermisosGuard], data: { permiso: 'config_clientes' } },
    { path: 'clientes-gestion', component: ClientesGestionComponent, canActivate: [PermisosGuard], data: { permiso: 'config_clientes_gestion' } },
    { path: 'dnd',           component: DndltlComponent },
    { path: 'detail/:id',    component: MasterComponent },
    { path: 'preview/:ref',  component: PreviewComponent },
    { path: 'colores-marcas',        component: ColoresMarcasComponent },
    { path: 'accionamientos-mapa',   component: AccionamientosMapaComponent },
    { path: 'promociones-clientes',  component: PromocionesClientesComponent, canActivate: [PermisosGuard], data: { permiso: 'config_promociones' } },
    { path: 'mandos-cargadores',     component: MandosCargadoresComponent },
    // Exclusivo Administrador
    { path: 'usuarios',      component: UsuariosComponent,      canActivate: [PermisosGuard], data: { soloAdmin: true } },
    { path: 'accionamientos-radio-tipo',         component: AccionamientosRadioTipoComponent },
    { path: 'accionamientos-radio-tipo-cliente', component: AccionamientosRadioTipoClienteComponent },
    { path: 'promociones-monitor',  component: PromocionesMonitorComponent },
    { path: 'incrementos-genericos', component: IncrementosGenericosComponent },
    { path: 'tejidos-colores',  component: TejidosColoresComponent },
    { path: 'tejidos',          component: TejidosComponent },
    { path: 'impresion-digital', component: ImpresionDigitalComponent }
];


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
        ModalModule.forRoot(),
        DynamicFormsCoreModule.forRoot(),
        DynamicFormsBootstrapUIModule,
        ReactiveFormsModule,
        TabsModule.forRoot(),
    ],
    declarations: [
        MasterComponent, SetupComponent, DndltlComponent, PreviewComponent,
        SetupcliComponent, ClientesGestionComponent, ColoresMarcasComponent, AccionamientosMapaComponent,
        PromocionesClientesComponent, MandosCargadoresComponent, UsuariosComponent,
        AccionamientosRadioTipoComponent, AccionamientosRadioTipoClienteComponent,
        PromocionesMonitorComponent, IncrementosGenericosComponent,
        TejidosColoresComponent, TejidosComponent, ImpresionDigitalComponent
    ],
    providers: [PermisosGuard],
    exports: [RouterModule]
})
export class SetupModule { }
