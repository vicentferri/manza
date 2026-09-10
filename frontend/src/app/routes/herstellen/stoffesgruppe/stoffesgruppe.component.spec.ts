import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoffesgruppeComponent } from './stoffesgruppe.component';

describe('StoffesgruppeComponent', () => {
  let component: StoffesgruppeComponent;
  let fixture: ComponentFixture<StoffesgruppeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoffesgruppeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoffesgruppeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
