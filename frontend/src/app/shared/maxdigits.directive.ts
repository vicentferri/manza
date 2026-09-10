import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appMaxdigits]'
})
export class MaxdigitsDirective {

  constructor(public el: ElementRef) {

    this.element = this.el.nativeElement;
  }

  private element: HTMLInputElement;

  @Input() appMaxdigits: number = 0;

  ngOnInit() {

  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    //this.element.value = value.length;
  }

  @HostListener("keypress", ["$event"])
  handleKeyboardEvent(event: KeyboardEvent) {

    var len = this.element.value.length;
    if (len > this.appMaxdigits - 1) {
      event.preventDefault();
    }
  }

}
