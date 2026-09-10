import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KundenSearchComponent } from './kunden-search.component';

describe('KundenSearchComponent', () => {
  let component: KundenSearchComponent;
  let fixture: ComponentFixture<KundenSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KundenSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KundenSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
