import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IncrementosGenericosComponent } from './incrementos-genericos.component';

describe('IncrementosGenericosComponent', () => {
  let component: IncrementosGenericosComponent;
  let fixture: ComponentFixture<IncrementosGenericosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({ declarations: [IncrementosGenericosComponent] }).compileComponents();
  }));

  beforeEach(() => {
    fixture   = TestBed.createComponent(IncrementosGenericosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { expect(component).toBeTruthy(); });
});
