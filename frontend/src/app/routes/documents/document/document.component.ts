import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { HaruService } from '../../../services/haru.service';
//import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    styleUrls: ['./document.component.css'],
    providers: [HaruService]
})
export class DocumentComponent implements OnInit {

    //public Editor = ClassicEditor;
    documentId = 1
    documentName = 'Doc1';

    public model = {
        editorData: '<p>Hello, world!</p>'
    };

    constructor(private service: HaruService) { }

    ngOnInit() {
        this.GetDocument();
    }


    GetDocument() {

        const url = '/document/' + this.documentId + '/' + this.documentName;
        this.service.Docs_HTTP_Get(url).subscribe(
            data => {
                //this.model.editorData = data.Table[0].message;
                this.model.editorData = data.message;
            },
            error => {
                console.log(error);
            }
        );
    }

    Save() {
        this.SaveDocument();
    }

    SaveDocument() {

        const url = '/document_save';
        var modelo = {
            id: this.documentId,
            document: this.model.editorData,
            name: this.documentName
        }

        var values = JSON.stringify(modelo);

        this.service.Docs_HTTP_Post(url, values).subscribe(
            data => {
                console.log(data);
            },
            error => {

            }
        );



    }

}
