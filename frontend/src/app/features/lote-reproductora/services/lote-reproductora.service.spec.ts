import { TestBed } from '@angular/core/testing';

import { LoteReproductoraService } from './lote-reproductora.service';

describe('LoteReproductoraService', () => {
  let service: LoteReproductoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteReproductoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
