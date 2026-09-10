import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasTejidoComponent } from './tarifas-tejido.component';

describe('TarifasTejidoComponent', () => {
  let component: TarifasTejidoComponent;
  let fixture: ComponentFixture<TarifasTejidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifasTejidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifasTejidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
