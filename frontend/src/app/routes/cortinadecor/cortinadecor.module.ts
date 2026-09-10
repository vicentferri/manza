import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { CdMainComponent } from './cd-main/cd-main.component';
import { ModalModule } from 'ngx-bootstrap/modal';

import { Routes, RouterModule } from '@angular/router';
import { CdProductoComponent } from './cd-producto/cd-producto.component';
import { CdProductoV2Component } from './cd-producto-v2/cd-producto-v2.component';
import { ItemnamePipe } from './itemname.pipe';
import { PermisosGuard } from '../../services/PermisosGuard';



const routes: Routes = [
    { path: '', component: CdMainComponent },
    { path: 'main', component: CdMainComponent, canActivate: [PermisosGuard], data: { permiso: 'cdeco_tejidos' } },
    { path: 'cd_producto', component: CdProductoComponent },
    { path: 'cd_producto_v2', component: CdProductoV2Component }
];


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes),
    ModalModule.forRoot()
  ],
  declarations: [CdMainComponent, CdProductoComponent, CdProductoV2Component, ItemnamePipe],
  providers: [PermisosGuard],
  exports: [
    RouterModule
  ]
})
export class CortinadecorModule { }
