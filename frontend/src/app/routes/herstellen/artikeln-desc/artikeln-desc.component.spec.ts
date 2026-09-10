import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnDescComponent } from './artikeln-desc.component';

describe('ArtikelnDescComponent', () => {
  let component: ArtikelnDescComponent;
  let fixture: ComponentFixture<ArtikelnDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
