import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasSimulateClienteComponent } from './tarifas-simulate-cliente.component';

describe('TarifasSimulateClienteComponent', () => {
  let component: TarifasSimulateClienteComponent;
  let fixture: ComponentFixture<TarifasSimulateClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifasSimulateClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifasSimulateClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
