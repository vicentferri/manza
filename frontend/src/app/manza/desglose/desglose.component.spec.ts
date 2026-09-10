import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesgloseComponent } from './desglose.component';

describe('DesgloseComponent', () => {
  let component: DesgloseComponent;
  let fixture: ComponentFixture<DesgloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesgloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesgloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
