import { NgModule } from '@angular/core';

import { p404Component } from './404.component';
import { p500Component } from './500.component';
import { pVerbotenComponent } from './verboten.component';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';

import { PagesRoutingModule } from './pages-routing.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [ PagesRoutingModule,CommonModule,FormsModule ],
  declarations: [
    p404Component,
    p500Component,
    LoginComponent,
    RegisterComponent,
    pVerbotenComponent
  ]
})
export class PagesModule { }
