import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HerstellungComponent } from './herstellung.component';

describe('HerstellungComponent', () => {
  let component: HerstellungComponent;
  let fixture: ComponentFixture<HerstellungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HerstellungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HerstellungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
