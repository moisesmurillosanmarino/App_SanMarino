import { TestBed } from '@angular/core/testing';

import { LoteProduccionService } from './lote-produccion.service';

describe('LoteProduccionService', () => {
  let service: LoteProduccionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteProduccionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
