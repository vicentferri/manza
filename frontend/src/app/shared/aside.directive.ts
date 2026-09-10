import { Directive, HostListener } from '@angular/core';

/**
* Allows the aside to be toggled via click.
*/
@Directive({
  selector: '[appAsideMenuToggler]',
})
export class AsideToggleDirective {
  constructor() { }

  @HostListener('click', ['$event'])
  toggleOpen($event: any) {
    $event.preventDefault();
    const body = document.querySelector('body');
    if (body) {
      body.classList.toggle('aside-menu-hidden');
    }
  }
}
