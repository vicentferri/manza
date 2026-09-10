import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosGridComponent } from './pedidos-grid.component';

describe('PedidosGridComponent', () => {
  let component: PedidosGridComponent;
  let fixture: ComponentFixture<PedidosGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
