import { TestBed } from '@angular/core/testing';

import { ToggleableService } from './toggleable.service';

describe('ToggleableService', () => {
  let service: ToggleableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToggleableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
