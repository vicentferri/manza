import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DndltlComponent } from './dndltl.component';

describe('DndltlComponent', () => {
  let component: DndltlComponent;
  let fixture: ComponentFixture<DndltlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DndltlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DndltlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
