import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigComponent } from './config/config.component';
import { HoneycombAdminImagesComponent } from './honeycomb-admin-images/honeycomb-admin-images.component';
import { HoneycombAdminDataComponent } from './honeycomb-admin-data/honeycomb-admin-data.component';
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
      {
        path: 'admin-images',
        component: HoneycombAdminImagesComponent,
        data: {
          title: 'Page 404'
        }
      },
      {
        path: 'admin-data',
        component: HoneycombAdminDataComponent,
        data: {
          title: 'Page 404'
        }
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
