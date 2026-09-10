import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaruGridComponent } from './harugrid.component';

describe('HaruGridComponent', () => {
  let component: HaruGridComponent;
  let fixture: ComponentFixture<HaruGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaruGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaruGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
