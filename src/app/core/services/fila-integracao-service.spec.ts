import { TestBed } from '@angular/core/testing';

import { FilaIntegracaoService } from './fila-integracao-service';

describe('FilaIntegracaoService', () => {
  let service: FilaIntegracaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilaIntegracaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
