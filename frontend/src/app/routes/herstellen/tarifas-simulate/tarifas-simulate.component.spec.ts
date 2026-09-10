import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasSimulateComponent } from './tarifas-simulate.component';

describe('TarifasSimulateComponent', () => {
  let component: TarifasSimulateComponent;
  let fixture: ComponentFixture<TarifasSimulateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifasSimulateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifasSimulateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
