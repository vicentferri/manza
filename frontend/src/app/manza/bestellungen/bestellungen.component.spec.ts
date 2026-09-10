import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestellungenComponent } from './bestellungen.component';

describe('BestellungenComponent', () => {
  let component: BestellungenComponent;
  let fixture: ComponentFixture<BestellungenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestellungenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestellungenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
