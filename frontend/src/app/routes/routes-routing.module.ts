import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/AuthGuard';


export const routesRoutes: Routes = [

    {
        path: '', redirectTo: 'herstellen', pathMatch: 'full'
    },
    {
        path: '',
        data: { title: 'documents' },
        canActivateChild: [AuthGuard],
        children: [
            { path: 'herstellen', loadChildren: './herstellen/herstellen.module#HerstellenModule' },
            { path: 'master', loadChildren: './setup/setup.module#SetupModule' },
            { path: 'cdeco', loadChildren: './cortinadecor/cortinadecor.module#CortinadecorModule' },
            { path: 'documents', loadChildren: './documents/documents.module#DocumentsModule' }
        ]
    }

];

@NgModule({
    imports: [
        RouterModule.forChild(routesRoutes)
    ],
    exports: [RouterModule]
})

export class RoutesRoutingModule {

    constructor(router: Router) {

    }
}



