import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasSimulateClienteSearchComponent } from './tarifas-simulate-cliente-search.component';

describe('TarifasSimulateClienteSearchComponent', () => {
  let component: TarifasSimulateClienteSearchComponent;
  let fixture: ComponentFixture<TarifasSimulateClienteSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifasSimulateClienteSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifasSimulateClienteSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
