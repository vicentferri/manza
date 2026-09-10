import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Preview1Component } from './preview-1.component';

describe('Preview1Component', () => {
  let component: Preview1Component;
  let fixture: ComponentFixture<Preview1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Preview1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Preview1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
