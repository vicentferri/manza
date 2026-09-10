import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifsIncrementsComponent } from './tarifs-increments.component';

describe('TarifsIncrementsComponent', () => {
  let component: TarifsIncrementsComponent;
  let fixture: ComponentFixture<TarifsIncrementsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifsIncrementsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifsIncrementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
