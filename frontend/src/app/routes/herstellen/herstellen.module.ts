import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from '../../shared/shared.module';
import { TarifsComponent } from './tarifs/tarifs.component';
import { PreBestellungComponent } from './pre-bestellung/pre-bestellung.component';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BestellungComponent } from './bestellung/bestellung.component';
import { TarifsSearchComponent } from './tarifs-search/tarifs-search.component';
import { BTransformPipe } from './pre-bestellung/bestell.pipe';
import { SMTransPipe } from './pre-bestellung/smtrans.pipe';
import { FormBestellungComponent } from './form-bestellung/form-bestellung.component'
import { HeadBestellungComponent } from './head-bestellung/head-bestellung.component';
import { TransetikettComponent } from './transetikett/transetikett.component';
import { BudgetListeComponent } from './budget-liste/budget-liste.component';
import { SimulateComponent } from './simulate/simulate.component';
import { PreBestellungV2Component } from './pre-bestellung-v2/pre-bestellung-v2.component';
import { PreBestellungV3Component } from './pre-bestellung-v3/pre-bestellung-v3.component';
import { ArtikelnComponent } from './artikeln/artikeln.component';
import { ArtikelnFabComponent } from './artikeln-fab/artikeln-fab.component';
import { TarifasTejidoComponent } from './tarifas-tejido/tarifas-tejido.component';
import { ArtikelnFabFijComponent } from './artikeln-fab-fij/artikeln-fab-fij.component';
import { ArtikelnFabCdComponent } from './artikeln-fab-cd/artikeln-fab-cd.component';
import { ArtikelnFabCdV2Component } from './artikeln-fab-cd-v2/artikeln-fab-cd-v2.component';
import { ArtikelnDescComponent } from './artikeln-desc/artikeln-desc.component';
import { TarifasSimulateComponent } from './tarifas-simulate/tarifas-simulate.component';
import { TarifasSimulateSearchComponent } from './tarifas-simulate-search/tarifas-simulate-search.component';
import { TarifasSimulateClienteSearchComponent } from './tarifas-simulate-cliente-search/tarifas-simulate-cliente-search.component';
import { TarifasSimulateClienteComponent } from './tarifas-simulate-cliente/tarifas-simulate-cliente.component';
import { StoffesgruppeComponent } from './stoffesgruppe/stoffesgruppe.component';
import { BackupComponent } from './backup/backup.component';
import { HerstellungComponent } from './herstellung/herstellung.component';
import { TarifsPaneljaponesComponent } from './tarifs-paneljapones/tarifs-paneljapones.component';
import { TarifsIncrementsComponent } from './tarifs-increments/tarifs-increments.component';
import { ArtikelnFacCdV3Component } from './artikeln-fac-cd-v3/artikeln-fac-cd-v3.component';
import { ArtikelnV2Component } from './artikeln_v2/artikeln_v2.component';
import { PermisosGuard } from '../../services/PermisosGuard';



const routes: Routes = [
  { path: '', component: PreBestellungV2Component },
  { path: 'prebestell', component: PreBestellungComponent, data: { title: 'Gestión Exterior de Pedidos' } },
  { path: 'prebestell2', component: PreBestellungV2Component, canActivate: [PermisosGuard], data: { title: 'Gestión Exterior de Pedidos', permiso: 'config_pedidos' } },
  { path: 'herstellen_v2', component: PreBestellungV3Component, canActivate: [PermisosGuard], data: { title: 'Recepción de Pedidos',  permiso: 'config_pedidos' } },
  { path: 'artikeln_v2', component: ArtikelnV2Component, data: { title: 'Gestión de Artículos' } },
  { path: 'artikeln', component: ArtikelnComponent, canActivate: [PermisosGuard], data: { title: 'Gestión de Artículos', permiso: 'config_articulos' } },
  { path: 'artikeln_fab', component: ArtikelnFabComponent, data: { title: 'Gestión de Artículos' } },
  { path: 'artikeln_desc', component: ArtikelnDescComponent, data: { title: 'Gestión de Artículos' } },
  { path: 'artikeln_fab_fij', component: ArtikelnFabFijComponent, data: { title: 'Gestión de Artículos' } },
  { path: 'artikeln_fab_cd', component: ArtikelnFabCdComponent, canActivate: [PermisosGuard], data: { title: 'Gestión de Artículos', permiso: 'cdeco_atributos' } },
  { path: 'artikeln_fab_cd_v2', component: ArtikelnFabCdV2Component, canActivate: [PermisosGuard], data: { title: 'Gestión de Fabricación', permiso: 'cdeco_config' } },
  { path: 'artikeln_fab_cd_v3', component: ArtikelnFacCdV3Component, canActivate: [PermisosGuard], data: { title: 'Gestión de Fabricación', permiso: 'fab_config' } },
  { path: 'budgetliste', component: BudgetListeComponent, canActivate: [PermisosGuard], data: { title: 'Presupuestos', permiso: 'config_presupuestos' } },
  { path: 'headbestell', component: HeadBestellungComponent, data: { title: 'Gestión de Pedidos' } },
  { path: 'bestell', component: BestellungComponent, data: { title: 'Gestión de Pedidos' } },
  { path: 'herst2', component: TransetikettComponent, data: { title: 'Ficheros de Transporte' } },
  { path: 'tarifs', component: TarifsSearchComponent, canActivate: [PermisosGuard], data: { title: 'Gestión de Tarifas', permiso: 'tarifas_leroy' } },
  { path: 'tarif', component: TarifsComponent, data: { title: 'Gestión de Tarifas' } },
  { path: 'simul', component: SimulateComponent, data: { title: 'Simulación' } },
  { path: 'tarifastej', component: TarifasTejidoComponent, data: { title: 'Tarifas de Tejido' } },
  { path: 'tarifasimul', component: TarifasSimulateComponent, data: { title: 'Tarifas de Tejido' } },
  { path: 'tarifasimul-search', component: TarifasSimulateSearchComponent, canActivate: [PermisosGuard], data: { title: 'Tarifas de Tejido', permiso: 'tarifas_generador' } },
  { path: 'tarifasimul-cli-search', component: TarifasSimulateClienteSearchComponent, canActivate: [PermisosGuard], data: { title: 'Tarifas de Tejido', permiso: 'tarifas_clientes' } },
  { path: 'tarifasimul-cli', component: TarifasSimulateClienteComponent, data: { title: 'Tarifas de Tejido' } },
  { path: 'stoffesgruppe', component: StoffesgruppeComponent, data: { title: 'Grupos de Tejidos' } },
  { path: 'backup', component: BackupComponent, canActivate: [PermisosGuard], data: { title: 'Backup', permiso: 'tarifas_backup' } },
  { path: 'herstellung', component: HerstellungComponent, data: { title: 'Herstellung' } },
  { path: 'tarifas-pj', component: TarifsPaneljaponesComponent, data: { title: 'Tarifas de Tejido' } },
  { path: 'tarifas-incr', component: TarifsIncrementsComponent, data: { title: 'Tarifas de Tejido' } },

];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
    ModalModule.forRoot(),
    TabsModule.forRoot()
  ],
  declarations: [
    PreBestellungComponent,
    BestellungComponent,
    TarifsComponent,
    TarifsSearchComponent,
    BTransformPipe,
    SMTransPipe,
    FormBestellungComponent,
    HeadBestellungComponent,
    TransetikettComponent,
    BudgetListeComponent,
    SimulateComponent,
    PreBestellungV2Component,
    PreBestellungV3Component,
    ArtikelnComponent,
    ArtikelnV2Component,
    ArtikelnFabComponent,
    ArtikelnFabCdV2Component,
    TarifasTejidoComponent,
    ArtikelnFabFijComponent,
    ArtikelnFabCdComponent,
    ArtikelnDescComponent,
    TarifasSimulateComponent,
    TarifasSimulateSearchComponent,
    TarifasSimulateClienteComponent,
    TarifasSimulateClienteSearchComponent,
    StoffesgruppeComponent,
    HerstellungComponent,
    TarifsPaneljaponesComponent,
    TarifsIncrementsComponent,
    ArtikelnFacCdV3Component,
    BackupComponent
  ],
  providers: [PermisosGuard],
  exports: [
    RouterModule
  ]
})
export class HerstellenModule { }
