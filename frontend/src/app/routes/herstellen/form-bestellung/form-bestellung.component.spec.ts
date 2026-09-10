import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBestellungComponent } from './form-bestellung.component';

describe('FormBestellungComponent', () => {
  let component: FormBestellungComponent;
  let fixture: ComponentFixture<FormBestellungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormBestellungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormBestellungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
