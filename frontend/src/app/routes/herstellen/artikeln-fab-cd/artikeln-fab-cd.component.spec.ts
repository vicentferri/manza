import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtikelnFabCdComponent } from './artikeln-fab-cd.component';

describe('ArtikelnFabCdComponent', () => {
  let component: ArtikelnFabCdComponent;
  let fixture: ComponentFixture<ArtikelnFabCdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtikelnFabCdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtikelnFabCdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
