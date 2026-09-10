import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetListeComponent } from './budget-liste.component';

describe('BudgetListeComponent', () => {
  let component: BudgetListeComponent;
  let fixture: ComponentFixture<BudgetListeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetListeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
