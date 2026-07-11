import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierDetailModal } from './tier-detail-modal';

describe('TierDetailModal', () => {
  let component: TierDetailModal;
  let fixture: ComponentFixture<TierDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TierDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TierDetailModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
