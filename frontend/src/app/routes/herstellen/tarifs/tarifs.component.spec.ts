import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TarifsComponent } from './tarifs.component';

describe('TarifsComponent', () => {
  let component: TarifsComponent;
  let fixture: ComponentFixture<TarifsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TarifsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TarifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
