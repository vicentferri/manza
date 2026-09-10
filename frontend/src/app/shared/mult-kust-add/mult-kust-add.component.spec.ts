import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultKustAddComponent } from './mult-kust-add.component';

describe('MultKustAddComponent', () => {
  let component: MultKustAddComponent;
  let fixture: ComponentFixture<MultKustAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultKustAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultKustAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
