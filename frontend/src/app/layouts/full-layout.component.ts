import { Component, OnInit } from '@angular/core';
import { restoreSidebarState } from '../shared/sidebar-state';


@Component({
  selector: 'app-dashboard',
  templateUrl: './full-layout.component.html',
  // Animación al ocultar/mostrar el menú lateral (clase 'sidebar-hidden' en <body>)
  styles: ['.app-body .sidebar { transition: margin-left .25s ease-in-out; }']
})
export class FullLayoutComponent implements OnInit {

  public disabled = false;
  public status: {isopen: boolean} = {isopen: false};

  public toggled(open: boolean): void {
    console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  ngOnInit(): void {
    restoreSidebarState();
  }
}
