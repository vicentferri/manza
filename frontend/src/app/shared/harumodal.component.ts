import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
declare var jQuery: any;
declare var $: any;

import { HaruModalService } from '../services/harumodal.service';

@Component({
    selector: 'harumodal',
    template: '<ng-content></ng-content>'
})
export class HaruModalComponent implements OnInit, OnDestroy {

    @Input() id: string = "";
    private element: any; /*jQuery;*/

    constructor(private haruModalService: HaruModalService,
        private el: ElementRef) {
        this.element = $(el.nativeElement);
    }

    ngOnInit(): void {

        let modal = this;

        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        this.element.appendTo('body');

        // close modal on background click
        this.element.on('click', function (e: any) {
            var target = $(e.target);
            if (!target.closest('.modal-body').length) {
                modal.close();
            }
        });

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.haruModalService.add(this);
    }

    // remove self from modal service when directive is destroyed
    ngOnDestroy(): void {
        this.haruModalService.remove(this.id);
        this.element.remove();
    }

    // open modal
    open(): void {
        this.element.show();
        $('body').addClass('harumodal-open');
    }

    // close modal
    close(): void {
        this.element.hide();
        $('body').removeClass('harumodal-open');
    }
}



