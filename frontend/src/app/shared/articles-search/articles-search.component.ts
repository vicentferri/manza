import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchArticleType } from '../../models/SearchArticleType';
import { HaruService } from '../../services/haru.service';



@Component({
	selector: 'articles-search',
	templateUrl: './articles-search.component.html',
	styleUrls: ['./articles-search.component.css']
})
export class ArticlesSearchComponent implements OnInit {


	@Input('Tipo') Tipo: number;
	@Input('Pedido') idPedido: number = 0;
	@Input('Cliente') idCliente: number = 0;
	@Input('Name') inputname: string = '';
	@Input('Pos') Pos: number;

	@Output() onLineAdded = new EventEmitter();

	searchArticle = new SearchArticleType();
	Lines: Array<SearchArticleType> = [];
	SelectedLines: Array<SearchArticleType> = [];

	constructor(private service: HaruService) {
		this.Tipo = 1;
		this.Pos = 1;
		this.idCliente = 0;
	}

	ngOnInit() {
	}


	searchLines() {
		this.Lines = [];
		this.SelectedLines = [];

		if (this.Tipo == 1000) {
			var route = "/search_articles/";
			this.searchArticle.parent = this.idPedido;
			this.searchArticle.customer = this.idCliente;
		}
		else {
			var route = "/search_articles/";
		}

		var values = JSON.stringify(this.searchArticle);

		this.service.HTTP_Post(route, values).subscribe(
			data => {
				this.Lines = data.Table;
			},
			error => {
				console.log(error);
			});
	}

	addLines() {

		if (confirm("¿Desea agregar las líneas al documento?")) {

			for (var i = 0; i < this.Lines.length; i++) {
				if (this.Lines[i].cantidad_sel > 0) {
					this.Lines[i].idPedido = String(this.idPedido);
					this.SelectedLines.push(this.Lines[i]);
				}
			}

			let route = '';
			let values: any = '';

			if (this.Tipo == 1) {
				route = "/bestellung_lines";
				values = JSON.stringify(this.SelectedLines);
			}

			if (this.Tipo == 303) {
				route = "/prodauftragen_lines";
				values = JSON.stringify(this.SelectedLines);
			}

			if (this.Tipo == 403) {
				route = "/Campana_Articles";
				values = JSON.stringify(this.SelectedLines);
			}

			if (this.Tipo == 1000) {
				route = "/desglose_customer_article";

				var arrayData: any[] = [];
				for (var i = 0; i < this.SelectedLines.length; i++) {
					var index = this.SelectedLines[i];
					arrayData.push(index["idrow"]);
				}

				var value = {
					customer: this.idCliente,
					parent: this.idPedido,
					ids: arrayData.join(",")
				}

				values = JSON.stringify(value);
			}

			if (this.Tipo == 1100) {
				route = "/model_set";

				var arrayData: any[] = [];
				for (var i = 0; i < this.SelectedLines.length; i++) {
					var index = this.SelectedLines[i];
					arrayData.push(index["idrow"]);
				}

				var value2 = {
					id: this.idPedido,
					article: arrayData.join(","),
					tipo: 1,
					pos: this.Pos
				}

				values = JSON.stringify(value2);

			}

			if (this.Tipo == 1110) {
				route = "/model_set_atributes";

				var arrayData: any[] = [];
				for (var i = 0; i < this.SelectedLines.length; i++) {
					var index = this.SelectedLines[i];
					arrayData.push(index["idrow"]);
				}

				var value3 = {
					id: this.idPedido,
					pos: this.Pos,
					article: arrayData.join(",")
				}
				values = JSON.stringify(value3);
			}

			if (this.Tipo == 1111) {
				route = "/model_set_main";

				var arrayData: any[] = [];
				for (var i = 0; i < this.SelectedLines.length; i++) {
					var index = this.SelectedLines[i];
					arrayData.push(index["idrow"]);
				}

				var value4 = {
					inputname: this.inputname,
					article: arrayData.join(",")
				}
				values = JSON.stringify(value4);
			}

			if (this.Tipo == 2000) {
				route = "/model_general_set_main";

				var arrayData: any[] = [];
				for (var i = 0; i < this.SelectedLines.length; i++) {
					var index = this.SelectedLines[i];
					arrayData.push(index["idrow"]);
				}

				var value5 = {
					id: this.idPedido,
					pos: this.Pos,
					article: arrayData.join(",")
				}
				values = JSON.stringify(value5);
			}

			if (this.Tipo == 10000) {
				this.onLineAdded.emit(this.SelectedLines);
				this.Lines.splice(0, this.Lines.length);
			} else {
				this.service.HTTP_Post(route, values).subscribe(
					data => {
						this.SelectedLines = [];
						if (data.Table == "OK") {
							this.onLineAdded.emit();
							this.searchArticle.Alias = "";
							this.searchArticle.Barras = "";
							this.searchArticle.Descripcion = "";
							this.Lines.splice(0, this.Lines.length);
						}
					},
					error => {
						console.log(error);
					});
			}
		}
	}

}


