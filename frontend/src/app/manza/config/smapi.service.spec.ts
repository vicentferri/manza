import { TestBed, inject } from '@angular/core/testing';

import { SMAPIService } from './smapi.service';

describe('SMAPIService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SMAPIService]
    });
  });

  it('should ...', inject([SMAPIService], (service: SMAPIService) => {
    expect(service).toBeTruthy();
  }));
});
