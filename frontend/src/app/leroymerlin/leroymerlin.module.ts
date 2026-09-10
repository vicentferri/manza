import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { LeroyMerlinRoutingModule } from './leroymerlin-routing.module';
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
import { BestellungenComponent } from './bestellungen/bestellungen.component';
import { BudgetComponent } from './budget/budget.component';
import { SMTransPipe } from './config/smtrans.pipe';
import { TwoColumnPipe } from './config/twocolumn.pipe';
import { NavbarComponent } from './navbar/navbar.component';



@NgModule({
  imports: [
    HttpClientModule,
    LeroyMerlinRoutingModule,
    CommonModule,
    FormsModule,
    SharedModule,
    ModalModule.forRoot()
  ],
  declarations: [
    ConfigComponent,
    Preview2Component,
    Preview1Component,
    Preview3Component,
    Preview4Component,
    BestellungenComponent,
    BudgetComponent,
    TickerComponent,
    SMTransPipe,
    TwoColumnPipe,
    NavbarComponent
  ]
})
export class LeroyMerlinModule { }
