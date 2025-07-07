import { TestBed } from '@angular/core/testing';

import { NucleoService } from './nucleo.service';

describe('NucleoService', () => {
  let service: NucleoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NucleoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
