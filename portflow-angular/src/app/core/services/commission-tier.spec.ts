import { TestBed } from '@angular/core/testing';

import { CommissionTier } from './commission-tier';

describe('CommissionTier', () => {
  let service: CommissionTier;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionTier);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
