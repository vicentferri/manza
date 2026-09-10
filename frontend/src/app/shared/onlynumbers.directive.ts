import { Directive, ElementRef, Input, HostListener } from '@angular/core';


@Directive({
  selector: '[appOnlynumbers]'
})
export class OnlynumbersDirective {

  element: any;

  constructor(public el: ElementRef) {
    this.element = el.nativeElement;
  }

  @Input() appOnlynumbers: boolean = true;

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    if (this.appOnlynumbers) {

      console.log(this.element.value);
      //console.log(e.keyCode); /* 190 es el punt, 188 es la coma*/

      // Si hi ha mes de una coma tampoc faig cas

      //const tvalue = String(this.element.value).match(/./g).length;
      // console.log(tvalue);



      if ([46, 8, 9, 27, 13, 110, 188].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A
        (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+C
        (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+V
        (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+X
        (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
      }


      // Ensure that it is a number and stop the keypress
      if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
      }
    }
  }
}


/*
 
@Directive({
  selector: '[appMaxdigits]'
})
export class MaxdigitsDirective {

  constructor(public el: ElementRef) { 
      
    this.element = this.el.nativeElement;
  }

    private element: HTMLInputElement;

  @Input() appMaxdigits : number;
    
  ngOnInit(){
      
  }
  
  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
      //this.element.value = value.length;
  }
  
  @HostListener("keypress",["$event"])
   handleKeyboardEvent(event: KeyboardEvent) {
   
       var len = this.element.value.length;
       if (len > this.appMaxdigits-1){
           event.preventDefault();
       }
  }

}

 */