import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnComponent } from './artikeln.component';

describe('ArtikelnComponent', () => {
  let component: ArtikelnComponent;
  let fixture: ComponentFixture<ArtikelnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
