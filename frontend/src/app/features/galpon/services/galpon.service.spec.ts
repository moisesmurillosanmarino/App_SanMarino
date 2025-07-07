import { TestBed } from '@angular/core/testing';

import { GalponService } from './galpon.service';

describe('GalponService', () => {
  let service: GalponService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GalponService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
