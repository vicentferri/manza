import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoneycombComponent } from './honeycomb.component';

describe('HoneycombComponent', () => {
  let component: HoneycombComponent;
  let fixture: ComponentFixture<HoneycombComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoneycombComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoneycombComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
