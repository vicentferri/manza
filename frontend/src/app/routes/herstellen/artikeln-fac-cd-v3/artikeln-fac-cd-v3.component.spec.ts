import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnFacCdV3Component } from './artikeln-fac-cd-v3.component';

describe('ArtikelnFacCdV3Component', () => {
  let component: ArtikelnFacCdV3Component;
  let fixture: ComponentFixture<ArtikelnFacCdV3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnFacCdV3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnFacCdV3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
