import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdProductoComponent } from './cd-producto.component';

describe('CdProductoComponent', () => {
  let component: CdProductoComponent;
  let fixture: ComponentFixture<CdProductoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdProductoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdProductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
