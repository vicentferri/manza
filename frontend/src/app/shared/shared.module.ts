import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


import { jqxGridComponent } from '../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxgrid';
import { jqxListBoxComponent } from '../../../node_modules/jqwidgets-framework/jqwidgets-ts/angular_jqxlistbox';
import { MaxdigitsDirective } from './maxdigits.directive';
import { OnlynumbersDirective } from './onlynumbers.directive';
import { HaruGridComponent } from './harugrid/harugrid.component';

import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsBootstrapUIModule } from "@ng-dynamic-forms/ui-bootstrap";
import { MultKustAddComponent } from './mult-kust-add/mult-kust-add.component';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ArticlesSearchComponent } from './articles-search/articles-search.component';
import { HaruModalComponent } from '../shared/harumodal.component';
import { HaruModalService } from '../services/harumodal.service';
import { AssignGroupsComponent } from './assign-groups/assign-groups.component';
import { SearchArtikelComponent } from './search-artikel/search-artikel.component';
import { SearchArtikelV2Component } from './search-artikel-v2/search-artikel-v2.component';
import { KundenAddressesComponent } from './kunden-addresses/kunden-addresses.component';
import { KundenSearchComponent } from './kunden-search/kunden-search.component';
import { HaruBtnGeneralComponent } from './haru-btn-general/haru-btn-general.component';
import { PromocionesComponent } from './promociones/promociones.component';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { MenuSelectComponent } from './menu-select/menu-select.component';
import { SelectableComponent } from './selectable/selectable.component';

import { Select2Module } from 'ng2-select2';
import { TranslatePipe } from './translate.pipe';
import { ImpresionDigitalSelectorComponent } from './impresion-digital-selector/impresion-digital-selector.component';
import { PedidosGridComponent } from './pedidos-grid/pedidos-grid.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DynamicFormsCoreModule.forRoot(),
        DynamicFormsBootstrapUIModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        Select2Module
    ],
    providers: [
        //ColorsService
        HaruModalService
    ],
    declarations: [
        jqxGridComponent,
        jqxListBoxComponent,
        HaruGridComponent,
        MaxdigitsDirective,
        OnlynumbersDirective,
        MultKustAddComponent,
        ArticlesSearchComponent,
        HaruModalComponent,
        AssignGroupsComponent,
        SearchArtikelComponent,
        SearchArtikelV2Component,
        KundenAddressesComponent,
        KundenSearchComponent,
        HaruBtnGeneralComponent,
        PromocionesComponent,
        MenuSelectComponent,
        SelectableComponent,
        TranslatePipe,
        ImpresionDigitalSelectorComponent,
        PedidosGridComponent
    ],
    exports: [
        CommonModule,
        jqxGridComponent,
        jqxListBoxComponent,
        HaruGridComponent,
        FormsModule,
        RouterModule,
        MaxdigitsDirective,
        OnlynumbersDirective,
        MultKustAddComponent,
        ArticlesSearchComponent,
        SearchArtikelV2Component,
        SelectableComponent,
        HaruModalComponent,
        AssignGroupsComponent,
        SearchArtikelComponent,
        KundenAddressesComponent,
        KundenSearchComponent,
        HaruBtnGeneralComponent,
        PromocionesComponent,
        MenuSelectComponent,
        TranslatePipe,
        ImpresionDigitalSelectorComponent,
        PedidosGridComponent
    ]
})
// https://github.com/ocombe/ng2-translate/issues/209
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule
        };
    }
}
