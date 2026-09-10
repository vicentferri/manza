import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CdProductoV2Component } from './cd-producto-v2.component';

describe('CdProductoV2Component', () => {
  let component: CdProductoV2Component;
  let fixture: ComponentFixture<CdProductoV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [CdProductoV2Component] }).compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(CdProductoV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
