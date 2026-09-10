import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/AuthGuard';
// Layouts
import { TopBarLayoutComponent } from './layouts/topbar-layout.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';
import { FullLayoutComponent } from './layouts/full-layout.component';




export const routes: Routes = [
  {
    path: '', redirectTo: 'routes', pathMatch: 'full', canActivate: [AuthGuard]
  },
  {
    path: '', component: FullLayoutComponent, data: { title: 'Home' }, canActivate: [AuthGuard],
    children: [
      { path: 'routes', loadChildren: './routes/routes.module#RoutesModule' },
    ]
  },
  {
    path: 'pages', component: SimpleLayoutComponent, data: { title: 'Pages' },
    children: [
      { path: '', loadChildren: './pages/pages.module#PagesModule', }
    ]
  },
  {
    path: 'manza', component: SimpleLayoutComponent, data: { title: 'Manza' }, canActivate: [AuthGuard],
    children: [
      { path: '', loadChildren: './manza/manza.module#ManzaModule', }
    ]
  },
  {
    path: 'leroy', component: SimpleLayoutComponent, data: { title: 'Leroy Merlín' },
    children: [
      { path: '', loadChildren: './leroymerlin/leroymerlin.module#LeroyMerlinModule', }
    ]
  },
  {
    path: '**', redirectTo: '/pages/404', pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
