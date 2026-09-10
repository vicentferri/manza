import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { HomeModule } from './home/home.module';
import { RoutesRoutingModule } from './routes-routing.module';
import { HerstellenModule } from './herstellen/herstellen.module';





@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RoutesRoutingModule,
    HomeModule,
    HerstellenModule
  ],
  declarations: [
      
  ],
  exports: [
      RouterModule,
      HomeModule,
      HerstellenModule
  ],
  providers: [
      
  ]
})
export class RoutesModule { 

      constructor() {
        
    }}
