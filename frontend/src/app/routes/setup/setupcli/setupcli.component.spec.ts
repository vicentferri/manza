import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupcliComponent } from './setupcli.component';

describe('SetupcliComponent', () => {
  let component: SetupcliComponent;
  let fixture: ComponentFixture<SetupcliComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetupcliComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetupcliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
