import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifsSearchComponent } from './tarifs-search.component';

describe('TarifsSearchComponent', () => {
  let component: TarifsSearchComponent;
  let fixture: ComponentFixture<TarifsSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifsSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
