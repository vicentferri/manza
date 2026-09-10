import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnFabCdV2Component } from './artikeln-fab-cd-v2.component';

describe('ArtikelnFabCdV2Component', () => {
  let component: ArtikelnFabCdV2Component;
  let fixture: ComponentFixture<ArtikelnFabCdV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnFabCdV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnFabCdV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
