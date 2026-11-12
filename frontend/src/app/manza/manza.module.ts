import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { ManzaRoutingModule } from './manza-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ConfigComponent } from './config/config.component';
import { ModalModule } from 'ngx-bootstrap/modal';

import { TickerComponent } from './ticker/ticker.component';
import { Preview2Component } from './preview-2/preview-2.component';
import { Preview1Component } from './preview-1/preview-1.component';
import { Preview3Component } from './preview-3/preview-3.component';
import { Preview4Component } from './preview-4/preview-4.component';
import { Preview7Component } from './preview-7/preview-7.component';
import { Preview6Component } from './preview-6/preview-6.component';
import { BestellungenComponent } from './bestellungen/bestellungen.component';
import { BudgetComponent } from './budget/budget.component';
import { SMTransPipe } from './config/smtrans.pipe';
import { FrasePipe } from './config/frase.pipe';
import { TwoColumnPipe } from './config/twocolumn.pipe';
import { DesgloseComponent } from './desglose/desglose.component';
import { HoneycombComponent } from './honeycomb/honeycomb.component';
import { HoneycombAdminImagesComponent } from './honeycomb-admin-images/honeycomb-admin-images.component';
import { HoneycombAdminDataComponent } from './honeycomb-admin-data/honeycomb-admin-data.component';
import { SafeUrlPipe } from './safe-url.pipe';
import { HoneycombAdminLinkComponent } from './honeycomb-admin-link/honeycomb-admin-link.component';
import { EnrollableComponent } from './enrollable/enrollable.component';
import { EnrollableNuevoComponent } from './enrollable-nuevo/enrollable-nuevo.component';
import { CompacNuevoComponent } from './compac-nuevo/compac-nuevo.component';
import { ZipNuevoComponent } from './zip-nuevo/zip-nuevo.component';
import { VerticalNuevoComponent } from './vertical-nuevo/vertical-nuevo.component';
import { Preview3NuevoComponent } from './preview-3-nuevo/preview-3-nuevo.component';
import { JaponesComponent } from './japones/japones.component';
import { VerticalComponent } from './vertical/vertical.component';
import { CompacComponent } from './compac/compac.component';
import { TejidoImagenComponent } from './tejido-imagen/tejido-imagen.component';
import { ContrapesoImagenComponent } from './contrapeso-imagen/contrapeso-imagen.component';
import { CfgResumenComponent } from './cfg-resumen/cfg-resumen.component';

@NgModule({
  imports: [
    HttpClientModule,
    FormsModule,
    ManzaRoutingModule,
    CommonModule,
    SharedModule,
    ModalModule.forRoot()
  ],
  declarations: [
    ConfigComponent,
    Preview2Component,
    Preview1Component,
    Preview3Component,
    Preview4Component,
    Preview7Component,
    Preview6Component,
    BestellungenComponent,
    BudgetComponent,
    TickerComponent,
    SMTransPipe,
    FrasePipe,
    TwoColumnPipe,
    DesgloseComponent,
    HoneycombComponent,
    HoneycombAdminImagesComponent,
    HoneycombAdminDataComponent,
    HoneycombAdminLinkComponent,
    EnrollableComponent,
    EnrollableNuevoComponent,
    CompacNuevoComponent,
    ZipNuevoComponent,
    VerticalNuevoComponent,
    Preview3NuevoComponent,
    JaponesComponent,
    VerticalComponent,
    CompacComponent,
    TejidoImagenComponent,
    ContrapesoImagenComponent,
    CfgResumenComponent,
    SafeUrlPipe
  ]
})
export class ManzaModule { }
