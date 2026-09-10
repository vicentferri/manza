import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HaruBtnGeneralComponent } from './haru-btn-general.component';

describe('HaruBtnGeneralComponent', () => {
  let component: HaruBtnGeneralComponent;
  let fixture: ComponentFixture<HaruBtnGeneralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HaruBtnGeneralComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HaruBtnGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
