import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifasSimulateSearchComponent } from './tarifas-simulate-search.component';

describe('TarifasSimulateSearchComponent', () => {
  let component: TarifasSimulateSearchComponent;
  let fixture: ComponentFixture<TarifasSimulateSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifasSimulateSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifasSimulateSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
