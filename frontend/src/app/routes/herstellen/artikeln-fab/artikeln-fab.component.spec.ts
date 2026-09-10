import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnFabComponent } from './artikeln-fab.component';

describe('ArtikelnFabComponent', () => {
  let component: ArtikelnFabComponent;
  let fixture: ComponentFixture<ArtikelnFabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnFabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
