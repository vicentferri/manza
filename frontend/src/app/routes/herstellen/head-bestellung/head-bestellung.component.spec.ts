import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadBestellungComponent } from './head-bestellung.component';

describe('HeadBestellungComponent', () => {
  let component: HeadBestellungComponent;
  let fixture: ComponentFixture<HeadBestellungComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeadBestellungComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeadBestellungComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
