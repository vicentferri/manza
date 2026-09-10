import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBestellungV3Component } from './pre-bestellung-v3.component';

describe('PreBestellungV3Component', () => {
  let component: PreBestellungV3Component;
  let fixture: ComponentFixture<PreBestellungV3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreBestellungV3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreBestellungV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
