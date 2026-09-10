import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransetikettComponent } from './transetikett.component';

describe('TransetikettComponent', () => {
  let component: TransetikettComponent;
  let fixture: ComponentFixture<TransetikettComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransetikettComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransetikettComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
