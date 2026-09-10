import { TestBed, inject } from '@angular/core/testing';

import { Tipo4Service } from './tipo4.service';

describe('Tipo4Service', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Tipo4Service]
    });
  });

  it('should be created', inject([Tipo4Service], (service: Tipo4Service) => {
    expect(service).toBeTruthy();
  }));
});
