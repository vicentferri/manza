import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { DocumentComponent } from './document/document.component';
import { DocumentsComponent } from './documents/documents.component';
//import { CKEditorModule } from '@ckeditor/ckeditor5-angular';



const routes: Routes = [
  { path: '', redirectTo: 'document', pathMatch: 'full' },
  { path: 'document', component: DocumentComponent },
  { path: 'documents', component: DocumentsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    //CKEditorModule
  ],
  declarations: [DocumentComponent, DocumentsComponent],
  exports: [
    RouterModule
  ]
})
export class DocumentsModule { }
