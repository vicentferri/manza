import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreBestellungV2Component } from './pre-bestellung-v2.component';

describe('PreBestellungV2Component', () => {
  let component: PreBestellungV2Component;
  let fixture: ComponentFixture<PreBestellungV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreBestellungV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreBestellungV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
