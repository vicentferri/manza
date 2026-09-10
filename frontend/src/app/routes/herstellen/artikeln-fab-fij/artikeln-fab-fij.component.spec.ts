import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnFabFijComponent } from './artikeln-fab-fij.component';

describe('ArtikelnFabFijComponent', () => {
  let component: ArtikelnFabFijComponent;
  let fixture: ComponentFixture<ArtikelnFabFijComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnFabFijComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnFabFijComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
