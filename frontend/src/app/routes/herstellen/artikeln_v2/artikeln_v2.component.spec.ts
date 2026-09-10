import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnV2Component } from './artikeln_v2.component';

describe('ArtikelnV2Component', () => {
  let component: ArtikelnV2Component;
  let fixture: ComponentFixture<ArtikelnV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ArtikelnV2Component]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
