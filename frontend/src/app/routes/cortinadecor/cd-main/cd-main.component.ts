import { Component, OnInit } from '@angular/core';
import {HaruModalService} from '../../../services/harumodal.service';
import {HaruService} from '../../../services/haru.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cd-main',
  templateUrl: './cd-main.component.html',
  styleUrls: ['./cd-main.component.css'],
  providers : [HaruService]
})
export class CdMainComponent implements OnInit {

  firmaID = '000';

  constructor(private modalService: HaruModalService,
    private service: HaruService) {
  }

  ngOnInit() {

    this.firmaID = environment.firmaID;
  }

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

}

