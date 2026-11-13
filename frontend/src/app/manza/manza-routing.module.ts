import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigComponent } from './config/config.component';
import { HoneycombAdminLinkComponent } from './honeycomb-admin-link/honeycomb-admin-link.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Example Pages'
    },
    children: [
      {
        path: 'config',
        component: ConfigComponent,
        data: {
          title: 'Page 404'
        }
      },
      /* La gestión de la HoneyComb está ahora en Configuración → Productos → HoneyComb (2026-11-13): las rutas de antes
         llevan allí, con la sección correspondiente abierta */
      {
        path: 'admin-images',
        redirectTo: '/routes/master/productos?producto=hc&seccion=hc_imagenes',
        pathMatch: 'full'
      },
      {
        path: 'admin-data',
        redirectTo: '/routes/master/productos?producto=hc&seccion=hc_tipostejido',
        pathMatch: 'full'
      },
      {
        path: 'admin-link',
        component: HoneycombAdminLinkComponent,
        data: {
          title: 'Page 404'
        }
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManzaRoutingModule { }
