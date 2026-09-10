import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KundenAddressesComponent } from './kunden-addresses.component';

describe('KundenAddressesComponent', () => {
  let component: KundenAddressesComponent;
  let fixture: ComponentFixture<KundenAddressesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KundenAddressesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KundenAddressesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
