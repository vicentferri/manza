import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';


import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NAV_DROPDOWN_DIRECTIVES } from './shared/nav-dropdown.directive';


import { SIDEBAR_TOGGLE_DIRECTIVES } from './shared/sidebar.directive';
import { AsideToggleDirective } from './shared/aside.directive';


// Routing Module
import { AppRoutingModule } from './app.routing';

// Layouts
import { FullLayoutComponent } from './layouts/full-layout.component';
import { TopBarLayoutComponent } from './layouts/topbar-layout.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';

/// routes
import { RoutesModule } from './routes/routes.module';
import { SharedModule } from './shared/shared.module';
import { ManzaModule } from './manza/manza.module';
import { LeroyMerlinModule } from './leroymerlin/leroymerlin.module';

import { AuthGuard } from './services/AuthGuard';
import { AdminGuard } from './services/admin.guard';
import { HaruService } from './services/haru.service';
import { UserService } from './services/user.service';
import { HeaderComponent } from './layouts/header/header.component';
import { AsideComponent } from './layouts/aside/aside.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { FooterComponent } from './layouts/footer/footer.component';

import { SMAPIService } from './manza/config/smapi.service';
import { LMSMAPIService } from './leroymerlin/config/lmsmapi.service';

import { ToastrModule } from 'ngx-toastr';

import { AuthService } from './services/auth.service';

import { RouterModule } from '@angular/router';

import * as $ from 'jquery';
import { AuthInterceptor } from './services/auth.interceptor';






@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    RoutesModule,
    ManzaModule,
    LeroyMerlinModule,
    SharedModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-center',
      preventDuplicates: true,
    }),
    HttpClientModule
  ],
  declarations: [
    AppComponent,
    SimpleLayoutComponent,
    TopBarLayoutComponent,
    FullLayoutComponent,
    NAV_DROPDOWN_DIRECTIVES,
    SIDEBAR_TOGGLE_DIRECTIVES,
    AsideToggleDirective,
    HeaderComponent,
    AsideComponent,
    SidebarComponent,
    FooterComponent,

  ],
  providers: [
    AuthGuard,
    AdminGuard,
    HaruService,
    SMAPIService,
    LMSMAPIService,
    AuthService,
    UserService,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
