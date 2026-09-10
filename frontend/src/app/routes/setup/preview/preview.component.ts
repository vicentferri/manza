import { Component, OnInit } from '@angular/core';
import {HaruService} from '../../../services/haru.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
  providers: [HaruService]
})
export class PreviewComponent implements OnInit {

   DocID = '-1';
   DocInfo : any;

   
   model = {
          atributos : null,
          medidas   : null,
          gama      : null
   };
   currentGroup : any;
   public linkDocument : any = this.domSanitizer.bypassSecurityTrustResourceUrl("about:blank");
   WebImage = 'about:blank';

  constructor(private service : HaruService,
              private activatedRoute: ActivatedRoute,
              private router : Router,
              private domSanitizer : DomSanitizer) 
              { 
      this.activatedRoute.params.subscribe((params: Params) => {
        this.DocID = params['ref'];
        this.CargarDocumento();
    });
    }

  ngOnInit() {
 
   
  }

  LoadImage(image_name)
  {
    let url = this.service.Master_NH_Upload_GetURL(image_name);
    this.WebImage = url;
  }

  CargarDocumento()
  {
    const url = '/api_articulos/' + this.DocID;
    //const url = '/api_articulos_alias/' + this.DocID;
    this.service.HTTP_Get('/sm' + url).subscribe(
      data => {
        this.DocInfo = data.Table[0];
        if (this.DocInfo != null)
        {
        var gama = String(this.DocInfo.gama2);
        var jsongama = JSON.parse(gama);
        this.model.gama = jsongama;
       

        var atributos = String(this.DocInfo.atributos);
        var jsonatributos = JSON.parse(atributos);
        this.model.atributos = jsonatributos;

        var medidas = String(this.DocInfo.medidas);
        var jsonmedidas = JSON.parse(medidas);
        this.model.medidas = jsonmedidas;
        
      

        var image = this.DocInfo.idrow + "-1.jpg";
        this.LoadImage(image);
        }
      },
      error => {

      });
  }

}
