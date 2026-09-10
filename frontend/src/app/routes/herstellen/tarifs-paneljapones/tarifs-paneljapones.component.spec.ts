import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifsPaneljaponesComponent } from './tarifs-paneljapones.component';

describe('TarifsPaneljaponesComponent', () => {
  let component: TarifsPaneljaponesComponent;
  let fixture: ComponentFixture<TarifsPaneljaponesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifsPaneljaponesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifsPaneljaponesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
